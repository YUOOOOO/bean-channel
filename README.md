# Bean Channel

Discord channel plugin for OpenClaw with web configuration interface and intelligent message filtering.

[中文文档](./README_CN.md)

## Features

- 🤖 Multiple Discord bot support
- 🎯 Smart message filtering (keyword matching or AI intent recognition)
- 🔄 Session management with message queuing
- 🌐 Web-based configuration interface
- 📊 Real-time message logging
- 🧠 Multiple AI model support (OpenAI, Anthropic, Custom)

## Quick Start

```bash
npm install
npm run build
npm run config
```

Open http://localhost:3000 to configure.

## Installation

### Method 1: Install as OpenClaw Plugin

```bash
# Install dependencies and build
npm install
npm run build

# Install to OpenClaw
openclaw plugins install /path/to/bean-channel
```

### Method 2: Standalone Mode

```bash
npm install
npm run build
npm run config
```

Open http://localhost:3000 to configure.

1. Open http://localhost:3000
2. Add AI models (optional, for AI intent recognition)
3. Add Discord bots with Bot ID and Token
4. Configure filtering mode:
   - **Keyword Mode**: Simple keyword matching
   - **AI Mode**: Intelligent intent recognition with bot role
5. Save and get OpenClaw tokens

### 4. Connect to OpenClaw

Add to OpenClaw config:

```json
{
  "channels": [{
    "type": "bean-channel",
    "config": {
      "serverUrl": "ws://localhost:3000/openclaw",
      "token": "your-token-from-web-interface"
    }
  }]
}
```

## Discord Bot Setup

1. Create bot at [Discord Developer Portal](https://discord.com/developers/applications)
2. Enable **MESSAGE CONTENT INTENT** (required)
3. Copy bot token to web interface
4. Invite bot to your server

## Filtering Modes

### Keyword Mode (Default)
- Simple keyword matching
- Messages containing keywords are forwarded to OpenClaw
- No session management

### AI Intent Recognition Mode
- Requires bot role configuration (e.g., butler, writer, coder)
- Requires AI model selection
- Intelligent message relevance detection
- Session management with message queuing
- Auto-cancellation and regeneration within 5-second window

## Requirements

- Node.js 18+
- Discord bot with MESSAGE CONTENT intent enabled

## License

MIT
