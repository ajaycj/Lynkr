/**
 * OpenAI Responses API ↔ Chat Completions API Conversion
 *
 * The Responses API is OpenAI's new format that uses 'input' instead of 'messages'.
 * This module converts between the two formats for compatibility.
 *
 * @module clients/responses-format
 */

const logger = require("../logger");

/**
 * Convert Responses API request to Chat Completions format
 * @param {Object} responsesRequest - Responses API format request
 * @returns {Object} Chat Completions format request
 */
function convertResponsesToChat(responsesRequest) {
  const { input, model, max_tokens, temperature, top_p, tools, tool_choice, stream } = responsesRequest;

  logger.info({
    inputType: typeof input,
    inputIsArray: Array.isArray(input),
    inputLength: Array.isArray(input) ? input.length : input?.length || 0,
    model,
    hasTools: !!tools
  }, "Converting Responses API to Chat Completions");

  // Handle input as either string or array of messages
  let messages;

  if (typeof input === 'string') {
    // Simple string input - convert to user message
    messages = [{ role: "user", content: input }];
    logger.info({ messageCount: 1 }, "Converted string input to single user message");

  } else if (Array.isArray(input)) {
    // Array of messages - validate and clean each message
    logger.info({
      rawInputSample: input.slice(0, 3).map(m => ({
        role: m?.role,
        hasContent: !!m?.content,
        contentType: typeof m?.content,
        contentLength: m?.content?.length || 0,
        hasToolCalls: !!m?.tool_calls,
        hasToolCallId: !!m?.tool_call_id,
        allKeys: m ? Object.keys(m) : []
      }))
    }, "Processing Responses API message array");

    messages = input
      .filter(msg => {
        // Keep messages that have valid role and either content or tool_calls
        const isValid = msg &&
                       msg.role &&
                       (msg.content || msg.tool_calls || msg.tool_call_id);

        if (!isValid) {
          logger.warn({
            msg: msg ? {role: msg.role, hasContent: !!msg.content, keys: Object.keys(msg)} : null
          }, "Filtering out invalid message");
        }

        return isValid;
      })
      .map(msg => {
        // Clean up message structure - only keep valid OpenAI Chat Completions fields
        let content = msg.content || null;

        // Handle content that's an array of content parts (multimodal format)
        // OpenAI accepts both: string OR array of {type, text/image_url}
        // If it's an array with input_text/text types, extract the text
        if (Array.isArray(content)) {
          // Extract text from array of content parts
          const textParts = content
            .filter(part => part && (part.type === 'text' || part.type === 'input_text'))
            .map(part => part.text || part.input_text || '')
            .filter(text => text.length > 0);

          if (textParts.length > 0) {
            // Combine all text parts into a single string
            content = textParts.join('\n\n');
            logger.info({
              originalPartCount: content.length,
              extractedTextLength: content.length,
              sample: content.substring(0, 100)
            }, "Converted multimodal content array to string");
          } else {
            // No text found, keep as array (might be image-only)
            content = content;
          }
        }

        const cleaned = {
          role: msg.role,
          content: content
        };

        // Add optional fields if present
        if (msg.name) cleaned.name = msg.name;
        if (msg.tool_calls) cleaned.tool_calls = msg.tool_calls;
        if (msg.tool_call_id) cleaned.tool_call_id = msg.tool_call_id;

        return cleaned;
      });

    logger.info({
      originalCount: input.length,
      filteredCount: messages.length,
      messageRoles: messages.map(m => m.role),
      sample: messages.slice(0, 2).map(m => ({
        role: m.role,
        contentType: typeof m.content,
        contentIsArray: Array.isArray(m.content),
        contentPreview: typeof m.content === 'string' ? m.content.substring(0, 50) : (Array.isArray(m.content) ? `[Array:${m.content.length}]` : m.content),
        hasToolCalls: !!m.tool_calls
      }))
    }, "Converted and cleaned Responses API message array");

    // Debug: Log ALL messages to see what's actually being returned
    logger.info({
      allMessagesDetailed: messages.map((m, idx) => ({
        index: idx,
        role: m.role,
        contentType: typeof m.content,
        contentLength: typeof m.content === 'string' ? m.content.length : (Array.isArray(m.content) ? m.content.length : 'N/A'),
        contentSample: typeof m.content === 'string' ? m.content.substring(0, 100) : JSON.stringify(m.content).substring(0, 100)
      }))
    }, "ALL MESSAGES AFTER CONVERSION");

    // Validate we have at least one message
    if (messages.length === 0) {
      logger.error({ originalInput: input }, "All messages filtered out - no valid messages remaining");
      throw new Error("Responses API: No valid messages after filtering. All messages were invalid.");
    }

  } else {
    // Fallback for unexpected format
    logger.warn({
      inputType: typeof input,
      input: input
    }, "Unexpected input format in Responses API");
    messages = [{ role: "user", content: String(input || "") }];
  }

  const result = {
    model: model || "gpt-4o",
    messages: messages,
    max_tokens: max_tokens || 4096,
    temperature: temperature,
    top_p: top_p,
    tools: tools,
    tool_choice: tool_choice,
    stream: stream || false
  };

  logger.info({
    resultMessageCount: messages.length,
    resultHasTools: !!result.tools,
    resultStream: result.stream
  }, "Responses to Chat conversion complete");

  return result;
}

/**
 * Convert Chat Completions response to Responses API format
 * @param {Object} chatResponse - Chat Completions format response
 * @returns {Object} Responses API format response
 */
function convertChatToResponses(chatResponse) {
  logger.debug({
    hasContent: !!chatResponse.choices?.[0]?.message?.content,
    finishReason: chatResponse.choices?.[0]?.finish_reason
  }, "Converting Chat Completions to Responses API");

  const message = chatResponse.choices[0].message;

  // Extract content and tool calls
  const content = message.content || "";
  const toolCalls = message.tool_calls || [];

  return {
    id: chatResponse.id,
    object: "response",
    created: chatResponse.created,
    model: chatResponse.model,
    content: content,
    tool_calls: toolCalls.length > 0 ? toolCalls : undefined,
    stop_reason: mapFinishReason(chatResponse.choices[0].finish_reason),
    usage: chatResponse.usage
  };
}

/**
 * Map Chat Completions finish_reason to Responses API stop_reason
 * @param {string} finishReason - Chat Completions finish reason
 * @returns {string} Responses API stop reason
 */
function mapFinishReason(finishReason) {
  const mapping = {
    "stop": "end_turn",
    "length": "max_tokens",
    "tool_calls": "tool_use",
    "content_filter": "content_filter"
  };

  return mapping[finishReason] || "end_turn";
}

module.exports = {
  convertResponsesToChat,
  convertChatToResponses,
  mapFinishReason
};
