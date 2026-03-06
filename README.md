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

Bean Channel runs as an independent service. Even when installed as an OpenClaw plugin, it needs to run separately.

### Step 1: Build the Project

```bash
npm install
npm run build
```

### Step 2: Start Configuration Server

```bash
npm run config
```

This starts the web interface at http://localhost:3000

### Step 3: Configure via Web Interface

1. Open http://localhost:3000
2. Add AI models (optional, for AI intent recognition)
3. Add Discord bots with Bot ID and Token
4. Configure filtering mode:
   - **Keyword Mode**: Simple keyword matching
   - **AI Mode**: Intelligent intent recognition with bot role
5. Save and copy the OpenClaw token

### Step 4: Connect to OpenClaw

**Option A: Install as Plugin**

```bash
# Link to OpenClaw channels directory
cd /path/to/openclaw/channels
ln -s /path/to/bean-channel bean-channel
```

**Option B: Use Standalone**

No installation needed, just configure OpenClaw to connect.

**OpenClaw Configuration:**

Add to OpenClaw config file:

```json
{
  "channels": [{
    "type": "bean-channel",
    "config": {
      "serverUrl": "ws://localhost:3000/openclaw",
      "token": "your-token-from-step-3"
    }
  }]
}
```

### Step 5: Start OpenClaw

OpenClaw will connect to Bean Channel via WebSocket. Make sure Bean Channel's config server is running.

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

## Testing

Use the included OpenClaw simulator for testing without a real OpenClaw instance:

```bash
node test-openclaw.js
```

The simulator will connect to the Bean Channel server and echo back any messages it receives.

## License

MIT
