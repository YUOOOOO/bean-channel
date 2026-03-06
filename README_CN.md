# Bean Channel

OpenClaw 的 Discord 频道插件，提供网页配置界面和智能消息过滤。

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

Bean Channel 是独立运行的服务。即使作为 OpenClaw 插件安装，也需要单独运行。

### 第一步：构建项目

```bash
npm install
npm run build
```

### 第二步：启动配置服务器

```bash
npm run config
```

这会在 http://localhost:3000 启动网页配置界面

### 第三步：网页配置

1. 打开 http://localhost:3000
2. 添加 AI 模型（可选，用于 AI 意图识别）
3. 添加 Discord 机器人（Bot ID 和 Token）
4. 配置过滤模式：
   - **关键词模式**：简单关键词匹配
   - **AI 模式**：智能意图识别，需设置 Bot 职责
5. 保存并复制 OpenClaw token

### 第四步：连接到 OpenClaw

**方式 A：作为插件安装**

```bash
# 链接到 OpenClaw 的 channels 目录
cd /path/to/openclaw/channels
ln -s /path/to/bean-channel bean-channel
```

**方式 B：独立使用**

无需安装，直接配置 OpenClaw 连接即可。

**OpenClaw 配置：**

在 OpenClaw 配置文件中添加：

```json
{
  "channels": [{
    "type": "bean-channel",
    "config": {
      "serverUrl": "ws://localhost:3000/openclaw",
      "token": "第三步获取的-token"
    }
  }]
}
```

### 第五步：启动 OpenClaw

OpenClaw 会通过 WebSocket 连接到 Bean Channel。确保 Bean Channel 的配置服务器正在运行。

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
