<link rel="stylesheet" href="style.css">

# Lynkr

**Self-hosted Claude Code & Cursor proxy with multi-provider support and 60-80% cost reduction.**

[GitHub](https://github.com/vishalveerareddy123/Lynkr) | [Documentation](https://github.com/vishalveerareddy123/Lynkr/tree/main/documentation) | [NPM](https://www.npmjs.com/package/lynkr)

---

## What is Lynkr?

Lynkr is a proxy server that enables **Claude Code CLI** and **Cursor IDE** to work with any LLM provider - not just Anthropic.

**Key Benefits:**
- **9+ Providers** - Databricks, AWS Bedrock, OpenRouter, Ollama, llama.cpp, Azure OpenAI, Azure Anthropic, OpenAI, LM Studio
- **60-80% Cost Savings** - Token optimization through smart tool selection, prompt caching, and memory deduplication
- **100% Local Option** - Run completely offline with Ollama or llama.cpp (free)
- **Drop-in Replacement** - No code changes required to Claude Code CLI or Cursor

---

## Quick Start

### Install

```bash
npm install -g lynkr
# or
brew tap vishalveerareddy123/lynkr && brew install lynkr
```

### Configure (Example: Ollama)

```bash
export MODEL_PROVIDER=ollama
export OLLAMA_MODEL=qwen2.5-coder:latest
```

### Run

```bash
npm start
# Server: http://localhost:8081
```

### Connect Claude Code CLI

```bash
export ANTHROPIC_BASE_URL=http://localhost:8081
export ANTHROPIC_API_KEY=dummy
claude
```

---

## Supported Providers

| Provider | Type | Cost |
|----------|------|------|
| Ollama | Local | FREE |
| llama.cpp | Local | FREE |
| LM Studio | Local | FREE |
| AWS Bedrock | Cloud | $$ |
| OpenRouter | Cloud | $ |
| Databricks | Cloud | $$$ |
| Azure OpenAI | Cloud | $$$ |
| OpenAI | Cloud | $$$ |

---

## Documentation

Full documentation: [documentation/](https://github.com/vishalveerareddy123/Lynkr/tree/main/documentation)

- [Installation](https://github.com/vishalveerareddy123/Lynkr/blob/main/documentation/installation.md)
- [Provider Configuration](https://github.com/vishalveerareddy123/Lynkr/blob/main/documentation/providers.md)
- [Claude Code CLI Setup](https://github.com/vishalveerareddy123/Lynkr/blob/main/documentation/claude-code-cli.md)
- [Cursor IDE Integration](https://github.com/vishalveerareddy123/Lynkr/blob/main/documentation/cursor-integration.md)
- [Token Optimization](https://github.com/vishalveerareddy123/Lynkr/blob/main/documentation/token-optimization.md)
- [Memory System](https://github.com/vishalveerareddy123/Lynkr/blob/main/documentation/memory-system.md)
- [Embeddings](https://github.com/vishalveerareddy123/Lynkr/blob/main/documentation/embeddings.md)
- [API Reference](https://github.com/vishalveerareddy123/Lynkr/blob/main/documentation/api.md)
- [Troubleshooting](https://github.com/vishalveerareddy123/Lynkr/blob/main/documentation/troubleshooting.md)

---

## Architecture

```
Claude Code CLI / Cursor IDE
            │
            ▼
    ┌───────────────┐
    │  Lynkr Proxy  │  Format conversion, caching,
    │  :8081        │  token optimization, tools
    └───────┬───────┘
            │
    ┌───────┴───────┐
    ▼               ▼
  Local           Cloud
  Ollama          Databricks
  llama.cpp       AWS Bedrock
  LM Studio       OpenRouter
                  Azure/OpenAI
```

---

## Features

- **Multi-Provider Support** - Switch providers without code changes
- **Token Optimization** - 60-80% cost reduction
- **Prompt Caching** - LRU cache with TTL
- **Long-Term Memory** - Titans-inspired memory system
- **Tool Calling** - Full MCP integration
- **Embeddings** - @Codebase semantic search
- **Enterprise Ready** - Circuit breakers, metrics, health checks

---

## Links

- [GitHub Repository](https://github.com/vishalveerareddy123/Lynkr)
- [NPM Package](https://www.npmjs.com/package/lynkr)
- [Issues](https://github.com/vishalveerareddy123/Lynkr/issues)
- [Discussions](https://github.com/vishalveerareddy123/Lynkr/discussions)

---

## License

Apache 2.0

---

## Keywords

`claude-code` `claude-proxy` `anthropic-api` `databricks-llm` `aws-bedrock` `openrouter` `ollama` `llama-cpp` `azure-openai` `mcp-server` `prompt-caching` `token-optimization` `ai-coding-assistant` `llm-proxy` `self-hosted-ai`
