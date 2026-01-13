## 介绍

# 第一章：介绍

## 1. 目的和背景

### 1.1 项目背景

在软件研发过程中，技术文档是团队协作和知识沉淀的重要载体。然而，团队在文档编写过程中常常面临以下挑战：

- **结构不统一**：不同成员编写的文档格式、结构差异较大，影响可读性和维护性
- **编写缺乏指导**：面对空白文档不知从何下手，容易遭漏关键章节
- **完整性难保证**：缺乏系统化的流程，导致文档内容碎片化、不完整
- **协作效率低**：传统文档工具缺乏智能化辅助，编写过程耗时费力

### 1.2 Doc-Copilot 的价值

Doc-Copilot 是一个基于 MCP (Model Context Protocol) 的 AI 文档协作插件，旨在通过智能化手段解决上述问题：

**核心价值**：
- **标准化模板体系**：提供多种预定义文档模板（如设计文档、需求文档等），确保文档结构规范统一
- **AI 引导式编写**：按章节逐步引导，通过智能问答收集信息，辅助用户完成高质量文档
- **状态持久化**：支持编写进度保存和断点续写，避免工作丢失
- **知识源整合**：自动分析代码库、参考已有文档，减少信息收集负担
- **渐进式工作流**：采用 brainstorming → outlining → writing 的三阶段流程，确保内容质量

**技术特点**：
- 基于 MCP 插件架构，与 Claude AI 深度集成
- 支持依赖关系管理，确保章节编写顺序合理
- 自动渲染生成 Markdown 格式文档

### 1.3 文档范围

本文档是 Doc-Copilot MCP 插件的**微型设计说明书**，面向开发者和维护者，详细描述：

- 模块的整体实现方案和架构设计
- 核心组件的接口、数据结构和算法
- 与外部系统的依赖和集成关系
- 版本变更历史和未来演进计划

**文档不涵盖**：用户使用手册、API 完整参考文档（这些内容将在独立文档中提供）

---

## 2. 术语定义

| 术语 | 英文 | 定义 |
|------|------|------|
| **MCP** | Model Context Protocol | Anthropic 定义的标准化上下文协议，允许第三方开发插件扩展 Claude AI 的能力，提供工具调用、资源访问等功能 |
| **模板** | Template | 预定义的文档结构配置，包含章节列表、编写提示词、知识源要求和章节依赖关系，是文档编写的“脚手架” |
| **章节** | Chapter | 文档的基本组成单元，每个章节有独立的名称、编写流程、状态（pending/in_progress/done）和阶段（brainstorming/outlining/writing） |
| **知识源** | Knowledge Source | 编写章节所需的信息来源，分为三类：user_input（用户问答）、codebase（代码分析）、document（参考文档） |
| **状态管理** | State Management | 记录文档编写进度的机制，包括当前模板、各章节状态、编写阶段等，持久化存储在 `.ai-native/doc-copilot/state.yaml` 文件中 |
| **文档渲染** | Document Rendering | 将各章节内容按模板定义的顺序合并，生成最终 Markdown 格式文档的过程，输出到 `.ai-native/doc-copilot/` 目录 |
| **三阶段流程** | Three-Phase Workflow | 章节编写遵循的标准流程：brainstorming（需求收集）→ outlining（大纲确认）→ writing（正式编写） |

---

## 3. 参考文档

### 3.1 外部资源

- [Model Context Protocol 官方文档](https://modelcontextprotocol.io) - MCP 协议规范和开发指南
- [Claude API 文档](https://docs.anthropic.com) - Anthropic Claude API 参考
- [Markdown 规范](https://commonmark.org) - CommonMark 标准

### 3.2 内部资源

- **项目代码库**：`/Users/feng/ai-native/doc-copilot`
- **模板配置目录**：`.ai-native/doc-copilot/templates/`
  - `micro-design.yaml` - 微型设计说明书模板
  - `system-requirements.yaml` - 系统需求规格说明书模板
- **状态文件**：`.ai-native/doc-copilot/state.yaml` - 编写进度持久化存储
- **输出目录**：`.ai-native/doc-copilot/` - 生成的文档文件

### 3.3 相关工具

- **Claude Code** - MCP 插件的运行环境
- **YAML** - 配置文件格式
- **Node.js** - 插件运行时环境