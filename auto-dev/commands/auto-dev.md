---
name: auto-dev
description: 自动化开发助手 - 从设计文档到代码实现的全自动流程
args:
  - name: design_doc
    description: 设计文档路径（必需）
    required: true
---

# /auto-dev 命令

启动自动化开发流程。

## 职责
- 初始化执行环境（git worktree）
- 分析项目事实（首次运行）
- 将设计文档复制到隔离环境
- 检查/解析任务
- 启动 Ralph Loop

## 输入/输出
- **输入**: 设计文档路径（必需，用户提供的原始文档位置）
- **输出**: Ralph Loop 启动，开始自动执行任务

## 用法

```
/auto-dev <设计文档路径>
```

## 参数
- `设计文档路径`: 必需，用户提供的设计文档位置
- 支持格式: `.txt`, `.md`

## 前置条件
- 用户已准备好设计文档
- TaskMaster 已初始化（若未初始化，提示用户先执行 `task-master init`）

## 流程

### 1. 环境准备

**检查 TaskMaster 初始化状态：**

调用 TaskMaster MCP 的 `get_tasks` 检查是否可用：
- 若不可用 → 输出错误信息并终止
  ```
  ❌ TaskMaster 未初始化
  请先运行: task-master init
  ```
- 若可用 → 继续下一步

**创建 Git Worktree 隔离环境：**

调用 `superpowers:using-git-worktrees` 创建隔离开发环境：
- worktree 名称格式: `auto-dev-{feature}-{timestamp}`
- 分支名称格式: `feature/auto-dev-{feature}`
- 创建成功 → 记录 worktree 路径，继续下一步
- 创建失败 → 输出错误信息并终止

```
✅ 环境准备完成
- Worktree: .worktrees/auto-dev-xxx-20240115
- 分支: feature/auto-dev-xxx
```

### 2. 项目分析

> 仅在 `.autodev/project-facts.json` 不存在时执行

**调用 analyze-project 技能：**

检查 `.autodev/project-facts.json` 是否存在：
- 若存在 → 跳过分析，继续下一步
- 若不存在 → 执行项目分析

分析内容：
- 扫描 `package.json` 识别技术栈
- 分析目录结构识别约定
- 发现已有组件/模块
- 检测代码风格

```
📂 检查项目事实...
- 文件: .autodev/project-facts.json
- 状态: 不存在，开始分析

🔍 分析技术栈...
- 语言: TypeScript
- 框架: React
- 测试: Jest

✅ 项目分析完成
- 输出: .autodev/project-facts.json
```

### 3. 文档准备

**验证设计文档存在：**

检查用户提供的设计文档路径：
- 若文件不存在 → 输出错误信息并终止
  ```
  ❌ 设计文档不存在: <路径>
  ```
- 若文件存在 → 继续下一步

**复制文档到 worktree：**

将设计文档复制到隔离环境中：
- 目标目录: `{worktree}/.taskmaster/docs/`
- 目标文件名: `prd.txt` 或 `prd.md`（保持原扩展名）
- 若目录不存在则自动创建

```
✅ 文档准备完成
- 源文件: /path/to/design.md
- 目标: .taskmaster/docs/prd.md
```

### 4. 任务检查

**检查现有任务状态：**

调用 TaskMaster MCP 的 `get_tasks` 获取所有任务：
- 统计未完成任务数量（状态不为 `done` 的任务）
- 若有未完成任务 → 跳过步骤5（任务拆解），直接进入步骤6
- 若无任务或全部完成 → 执行步骤5（解析文档）

```
📋 任务检查结果
- 总任务数: 10
- 已完成: 3
- 未完成: 7
→ 跳过任务拆解，继续执行未完成任务
```

或

```
📋 任务检查结果
- 无现有任务
→ 将解析设计文档生成任务
```

### 5. 任务拆解

> 仅在无未完成任务时执行此步骤

**调用 TaskMaster 解析设计文档：**

调用 TaskMaster MCP 的 `parse_prd` 解析 PRD：
- 输入: `.taskmaster/docs/prd.md`（或 `.txt`）
- 参数: `numTasks: 0`（自动判断任务数量）
- 生成功能模块级任务（每个任务 10-30 分钟工作量）

```
🔄 正在解析设计文档...

✅ 任务拆解完成
- 生成任务数: 10
- 任务列表:
  1. [pending] 创建用户登录页面
  2. [pending] 实现 JWT 认证
  ...
```

### 6. 启动执行

**启动 Ralph Loop：**

使用以下参数启动 Ralph Loop：

```
/ralph-loop "使用 Skill 工具调用 auto-dev:execute-loop" \
  --completion-promise 'ALL TASKS DONE' \
  --max-iterations 50
```

**参数说明：**
- `instruction`: 每次迭代 Claude 调用 execute-loop skill
- `--completion-promise`: 当输出包含 `ALL TASKS DONE` 时退出循环
- `--max-iterations`: 最大迭代次数限制（安全边界）

```
🚀 启动 Ralph Loop...

Ralph Loop 已启动
- 迭代上限: 50
- 完成信号: ALL TASKS DONE
- 执行技能: auto-dev:execute-loop
```

