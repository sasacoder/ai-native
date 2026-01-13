# Doc-Copilot Plugin

AI 协作文档编写框架 - 按模版与 AI 交互式完成研发文档

## 功能特性

- **模版驱动**：按模版引导的交互式文档编写
- **内置模版**：提供微型设计说明书、系统需求规格说明书等常用模版
- **自定义扩展**：支持用户自定义模版，本地优先覆盖
- **进度持久化**：随时中断，随时继续
- **章节协作**：每章节独立头脑风暴 → 大纲 → 内容

## 安装

```bash
claude plugins install github:sasacoder/ai-native/doc-copilot
```

## 快速开始

### 1. 查看可用模版

```
/doc-copilot list
```

输出示例：
```
可用模版：
  • micro-design - 微型设计说明书 (5 章节)
  • system-requirements - 系统需求规格说明书 (8 章节)
```

### 2. 开始新文档

```
/doc-copilot
```

系统会引导你选择模版，然后逐章节进行头脑风暴式编写。

### 3. 保存章节

在编写过程中，使用以下命令保存当前章节：

```
/doc-copilot-save
```

可选择「继续完善本章」或「本章完成」进入下一章。

### 4. 查看进度

```
/doc-copilot status
```

## 内置模版

| 模版 ID | 名称 | 章节数 | 适用场景 |
|---------|------|--------|----------|
| micro-design | 微型设计说明书 | 5 | 小型功能模块设计 |
| system-requirements | 系统需求规格说明书 | 8 | 完整系统需求分析 |

## 自定义模版

在项目下创建 `.ai-native/doc-copilot/templates/your-template.yaml`：

```yaml
name: 模版名称
id: template-id
description: 模版描述
output: .ai-native/doc-copilot/output.md

chapters:
  - name: 章节名称
    prompt: |
      编写提示，指导 AI 如何编写此章节
    knowledge_sources:
      - type: user_input
        questions:
          - 问题1
          - 问题2
    depends_on: [前置章节名称]
```

用户模版会覆盖同名内置模版。

## 文件结构

运行时生成的文件位于项目的 `.ai-native/doc-copilot/` 目录：

```
.ai-native/doc-copilot/
├── state.yaml          # 编写进度状态
├── templates/          # 用户自定义模版
└── *.md                # 输出的文档文件
```

## 开发

```bash
cd mcp-server
npm install
npm run dev    # 开发模式（监听文件变化）
npm run build  # TypeScript 编译
npm run bundle # 打包单文件
```

## MCP 工具

| 工具 | 说明 |
|------|------|
| `list_templates` | 列出所有可用模版 |
| `load_template` | 加载指定模版配置 |
| `save_state` | 保存编写进度 |
| `load_state` | 加载编写进度 |

## License

MIT
