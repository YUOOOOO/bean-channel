# Bean Channel

强大的 OpenClaw Discord 频道插件，作为 Discord 机器人与 OpenClaw 之间的中间层代理。支持智能消息过滤、实时网页配置和无缝多机器人管理。

[English](./README.md)

## 功能特性

- 🤖 支持多个 Discord 机器人
- 🎯 智能消息过滤（关键词匹配或 AI 意图识别）
- 🔄 会话管理与消息队列
- 🌐 网页配置界面
- 📊 实时消息日志
- 🧠 支持多个 AI 模型（OpenAI、Anthropic、自定义）

## 快速开始

```bash
npm install
npm run build
npm run config
```

访问 http://localhost:3000 进行配置。

## 安装步骤

### 方法一：作为 OpenClaw 插件安装

```bash
# 安装依赖并构建
npm install
npm run build

# 安装到 OpenClaw
openclaw plugins install /path/to/bean-channel
```

### 方法二：独立运行模式

```bash
npm install
npm run build
npm run config
```

访问 http://localhost:3000 进行配置。

1. 打开 http://localhost:3000
2. 添加 AI 模型（可选，用于 AI 意图识别）
3. 添加 Discord 机器人（Bot ID 和 Token）
4. 配置过滤模式：
   - **关键词模式**：简单关键词匹配
   - **AI 模式**：智能意图识别，需设置 Bot 职责
5. 保存并获取 OpenClaw token

### 4. 连接到 OpenClaw

在 OpenClaw 配置中添加：

```json
{
  "channels": [{
    "type": "bean-channel",
    "config": {
      "serverUrl": "ws://localhost:3000/openclaw",
      "token": "从网页获取的-token"
    }
  }]
}
```

## Discord 机器人设置

1. 在 [Discord 开发者门户](https://discord.com/developers/applications) 创建机器人
2. 开启 **MESSAGE CONTENT INTENT**（必需）
3. 复制 token 到网页配置界面
4. 邀请机器人到服务器

## 过滤模式

### 关键词模式（默认）
- 简单关键词匹配
- 包含关键词的消息转发给 OpenClaw
- 无会话管理

### AI 意图识别模式
- 需要配置 Bot 职责（如：管家、作家、码农）
- 需要选择 AI 模型
- 智能判断消息相关性
- 会话管理与消息队列
- 5秒内新消息自动取消并重新生成

## 系统要求

- Node.js 18+
- Discord 机器人需开启 MESSAGE CONTENT intent

## 测试

使用内置的 OpenClaw 模拟器进行测试，无需真实的 OpenClaw 实例：

```bash
node test-openclaw.js
```

模拟器会连接到 Bean Channel 服务器并回显收到的消息。

## 许可证

MIT
