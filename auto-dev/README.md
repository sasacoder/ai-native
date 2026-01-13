# Auto-Dev

> 自动化开发助手 - 从设计文档到代码实现的全自动流程

Auto-Dev 是一个 Claude Code 插件，通过 Ralph Loop 驱动的迭代执行，实现从设计文档到代码实现的自动化开发流程。它能够从修正中学习经验规则，并在后续任务中自动应用。

## 特性

- **自动化执行** - 解析设计文档，自动拆解任务并执行
- **经验学习** - 从用户修正中学习业务规则
- **规则应用** - 语义匹配相关规则，指导任务执行
- **项目分析** - 自动识别技术栈、目录结构、组件和代码风格
- **执行追踪** - 记录历史、计算指标、优化性能

## 安装

### 前置条件

- [Claude Code](https://claude.ai/code) CLI
- [TaskMaster MCP](https://github.com/task-master-ai/task-master) 已配置
- [Ralph Loop](https://github.com/anthropics/claude-code) 插件已安装

### 安装步骤

1. 克隆仓库到 Claude Code 插件目录：

```bash
git clone https://github.com/sasacoder/ai-native.git
cd ai-native/auto-dev
```

2. 初始化 TaskMaster：

```bash
task-master init
```

3. 验证安装：

```bash
# 在 Claude Code 中运行
/auto-dev:status
```

## 使用方法

### 基本用法

```bash
/auto-dev <设计文档路径>
```

### 示例

```bash
# 启动自动开发流程
/auto-dev ./docs/feature-design.md

# 查看执行状态
/auto-dev:status

# 提供修正指导
/auto-dev:fix "登录后应跳转到首页而不是个人中心"

# 取消执行
/auto-dev:cancel
```

## 命令

| 命令 | 说明 |
|------|------|
| `/auto-dev <文档>` | 启动自动化开发流程 |
| `/auto-dev:status` | 显示当前执行状态和指标 |
| `/auto-dev:fix <描述>` | 提供修正指导，系统会学习规则 |
| `/auto-dev:cancel` | 安全取消当前执行 |

## 技能

| 技能 | 说明 |
|------|------|
| `execute-loop` | Ralph Loop 驱动的迭代执行 |
| `apply-rules` | 加载并匹配经验规则 |
| `learn-from-fix` | 从修正中学习新规则 |
| `analyze-project` | 分析项目事实 |
| `track-history` | 记录执行历史 |
| `calculate-metrics` | 计算成功率等指标 |
| `migrate-data` | 数据版本迁移 |
| `cache-manager` | 性能缓存管理 |

## 工作流程

```
┌─────────────────────────────────────────────────────────────┐
│                      /auto-dev 命令                          │
├─────────────────────────────────────────────────────────────┤
│  1. 环境准备     创建 Git Worktree 隔离环境                   │
│  2. 项目分析     生成 project-facts.json（首次）              │
│  3. 文档准备     复制设计文档到 worktree                      │
│  4. 任务检查     检查现有任务状态                             │
│  5. 任务拆解     解析 PRD 生成任务（如需要）                  │
│  6. 启动执行     启动 Ralph Loop                             │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    execute-loop 迭代                         │
├─────────────────────────────────────────────────────────────┤
│  1. 获取任务     从 TaskMaster 获取下一个任务                 │
│  2. 应用规则     匹配并应用经验规则                           │
│  3. TDD 实现     Red-Green-Refactor 循环                     │
│  4. 验证         运行测试，确认通过                           │
│  5. 结果处理     标记完成或调试修复                           │
│  6. 迭代继续     进入下一个任务                               │
│  7. 完成阶段     触发分支完成流程                             │
└─────────────────────────────────────────────────────────────┘
```

## 目录结构

```
auto-dev/
├── .claude-plugin/
│   └── plugin.json          # 插件配置
├── .autodev/
│   └── rules.md             # 经验规则（运行时生成）
├── commands/
│   ├── auto-dev.md          # 主命令
│   ├── fix.md               # 修正命令
│   ├── status.md            # 状态命令
│   └── cancel.md            # 取消命令
├── skills/
│   ├── execute-loop/        # 执行循环
│   ├── apply-rules/         # 规则应用
│   ├── learn-from-fix/      # 经验学习
│   ├── analyze-project/     # 项目分析
│   ├── track-history/       # 历史追踪
│   ├── calculate-metrics/   # 指标计算
│   ├── migrate-data/        # 数据迁移
│   └── cache-manager/       # 缓存管理
├── templates/
│   ├── execute-prompt.md    # 执行提示模板
│   ├── project-facts.json   # 项目事实模板
│   ├── task-history.json    # 历史记录模板
│   └── metrics.json         # 指标模板
└── tests/
    └── test-scenarios.md    # 测试场景
```

## 运行时文件

执行过程中会在 `.autodev/` 目录生成以下文件：

| 文件 | 说明 |
|------|------|
| `rules.md` | 从修正中学习的经验规则 |
| `project-facts.json` | 项目技术栈、目录结构等事实 |
| `task-history.json` | 任务执行历史记录 |
| `metrics.json` | 成功率、平均迭代等指标 |

## 版本历史

### V0.4.0 (当前)
- 项目事实自动分析
- 语义相似度规则匹配
- 执行历史和指标追踪
- 完成流程集成
- 性能优化和缓存

### V0.3.0
- 规则应用技能
- 状态和取消命令
- 执行提示模板

### V0.2.0
- Fix 命令
- 经验学习技能

### V0.1.0
- 基础框架
- 执行循环技能

## 依赖

- **TaskMaster MCP** - 任务管理
- **Ralph Loop** - 迭代执行
- **Superpowers** - TDD、调试、分支完成等工作流

## 许可证

MIT License

## 作者

[sasacoder](https://github.com/sasacoder)
