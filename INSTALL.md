# Bean Channel 安装配置指南

## 1. 安装到 OpenClaw

将 Bean Channel 作为 OpenClaw 的 channel 插件：

```bash
# 在 OpenClaw 的 channels 目录中创建软链接
cd /path/to/openclaw/channels
ln -s /Users/yuooooo/workspace/bean-channel bean-channel
```

或者直接复制：

```bash
cp -r /Users/yuooooo/workspace/bean-channel /path/to/openclaw/channels/
```

## 2. 配置 OpenClaw

在 OpenClaw 的配置文件中添加 Bean Channel：

```json
{
  "channels": [
    {
      "type": "bean-channel",
      "name": "Discord Bot",
      "config": {
        "serverUrl": "ws://localhost:3000/openclaw",
        "token": "从网页配置中获取的 token"
      }
    }
  ]
}
```

## 3. 启动流程

1. 启动 Bean Channel 配置服务器：
```bash
cd /Users/yuooooo/workspace/bean-channel
npm run config
```

2. 访问 http://localhost:3000 配置 Discord Bot
   - 添加 Bot ID 和 Discord Token
   - 配置过滤模式（关键词或 AI 意图识别）
   - 保存后获取 OpenClaw token

3. 在 OpenClaw 配置中使用获取的 token

4. 启动 OpenClaw，它会自动连接到 Bean Channel

## 4. 过滤模式说明

### 关键词模式（默认）
- 简单匹配关键词
- 匹配到关键词才转发给 OpenClaw
- 适合简单的触发场景

### AI 意图识别模式
- 需要配置 Bot 职责（如：管家、作家、码农）
- 需要选择 AI 模型
- 智能判断消息是否相关
- 支持会话管理和消息队列
