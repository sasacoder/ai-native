# Auto-Dev 设计方案

> 本文档记录了 2026-01-12 头脑风暴讨论的设计决策和最终方案。
> 
> 📎 **前置文档**: [[15-场景融合分析-统一执行模型]]、[[16-用户旅程-统一执行模型]]

---

## 1. 核心问题：原设计假设的挑战

### 1.1 原设计假设

```
PRD 清晰完整 → 一次执行成功 → 用户验收
```

### 1.2 实际挑战

| 问题            | 说明                    |
| ------------- | --------------------- |
| **任务定义难以精准**  | 很难用自然语言 100% 精确描述期望行为 |
| **偏差发现滞后**    | 编码完成后，运行程序才发现行为不对     |
| **用户不会写验收标准** | 期望用户为每个任务写测试/验收标准不现实  |
| **复杂度评估不可靠**  | AI 评估的"模糊度"或"风险"准确性存疑 |

### 1.3 关键洞察

> **追求"预测偏差"是错误的方向。**
> 
> 更务实的思路是：**接受偏差会发生，但让发现和修正的成本足够低。**

---

## 2. 新设计方向

### 2.1 核心理念转变

```
原设计:  PRD → 一次执行成功 → 验收
            ↓
新设计:  PRD → 执行 → 快速验证 → 发现偏差 → 低成本修正 → 逐步积累
                  ↑                              │
                  └──────────────────────────────┘
```

### 2.2 三大核心机制

| 机制          | 目标        | 实现方式                   |
| ----------- | --------- | ---------------------- |
| **快速验证**    | 30秒内知道对不对 | 任务完成后自动运行测试/启动服务       |
| **低成本修正**   | 一句话修复     | `/auto-dev:fix "问题描述"` |
| **项目级经验积累** | 越用越好用     | 隐式学习项目事实 + 显式记录业务决策    |

### 2.3 经验积累的两种类型

```
┌─────────────────────────────────────────────────────────────┐
│  类型1：项目事实（隐式积累）                                 │
│  ─────────────────────────────────────────────────────────  │
│  • 技术栈：React + TypeScript + Tailwind                   │
│  • 目录结构：components/ hooks/ services/ 的约定           │
│  • 已有组件：Button, Modal, Form 可以复用                   │
│  • 代码风格：命名、缩进、注释习惯                           │
│  • 测试模式：用 Jest + React Testing Library               │
│                                                             │
│  → 客观事实，分析代码就能知道，无需用户确认                  │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  类型2：业务决策（从修正中显式积累）                         │
│  ─────────────────────────────────────────────────────────  │
│  • "登录后跳转首页，不是个人中心"                           │
│  • "价格向下取整，不是四舍五入"                             │
│  • "用户名不允许特殊字符"                                   │
│                                                             │
│  → 无法从代码推断，只有用户修正时才知道                      │
│  → 修正时顺便问："要记住这个规则吗？"                        │
└─────────────────────────────────────────────────────────────┘
```

---

## 3. 技术方案：Superpowers + TaskMaster + Ralph Loop

### 3.1 方案选型过程

| 方案                                | 评估              | 结论    |
| --------------------------------- | --------------- | ----- |
| 纯 TaskMaster                      | 复杂度评估不可靠，任务粒度较大 | ❌ 不采用 |
| 纯 Superpowers                     | 无状态持久化，无依赖管理    | ❌ 不采用 |
| **Superpowers + TaskMaster 职责分离** | 各取所长            | ✅ 采用  |

### 3.2 职责分离

```
┌─────────────────────────────────────────────────────────────┐
│  Superpowers 负责                TaskMaster 负责            │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  • 任务执行 (TDD/验证/调试)       • 任务拆解 (parse_prd)    │
│  • Git 隔离 (worktrees)          • 状态追踪 (set_task_status)│
│  • 分支完成 (finishing-branch)   • 依赖管理 (add_dependency)│
│                                  • 持久化 (tasks.json)     │
│                                  • 进度查询 (get_tasks)     │
│                                  • 任务调度 (next_task)     │
│                                                             │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  Ralph Loop 负责                                            │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  • 循环驱动机制（替代 executing-plans）                      │
│  • 迭代执行直到完成                                          │
│  • 自动修正偏差（核心差异化）                                │
│  • 完成判定 (<promise> 标签)                                │
│  • 安全边界 (--max-iterations)                              │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 3.3 不使用的部分

**TaskMaster:**

| 能力                   | 原因                  |
| -------------------- | ------------------- |
| `analyze_complexity` | 复杂度评估不可靠，不再依赖预测     |
| `expand_task`        | 已是功能模块级任务，无需再拆分为子任务 |

**Superpowers:**

| 能力                            | 原因                         |
| ----------------------------- | -------------------------- |
| `writing-plans`               | 粒度太细（2-5分钟/步骤），与自动迭代修正理念冲突 |
| `executing-plans`             | 被 Ralph Loop 替代            |
| `subagent-driven-development` | 被 Ralph Loop 替代            |

### 3.4 Superpowers Skills 使用情况

| Superpowers Skill | 使用方式 | 阶段 |
|-------------------|---------|------|
| **using-git-worktrees** | 创建隔离工作环境 | 准备 |
| **test-driven-development** | 每个任务的实现方式 | 执行 |
| **systematic-debugging** | 处理失败/偏差 | 执行 |
| **verification-before-completion** | 验证规范（行为准则） | 执行 |
| **finishing-a-development-branch** | 合并/PR/清理 | 完成 |

### 3.5 Auto-Dev vs Superpowers 定位

| 维度 | Superpowers | Auto-Dev |
|-----|-------------|----------|
| **规划粒度** | 精确到代码行（2-5分钟/步骤） | 功能模块级 |
| **执行方式** | 按计划执行，失败停止询问 | 自动迭代修正 |
| **人工介入** | 每个 checkpoint 需确认 | 只在真正卡住时介入 |
| **核心价值** | 规范化开发流程 | 自动化 + 经验积累 |

> **关键差异**：Superpowers 追求"计划精确到一次成功"，Auto-Dev 追求"快速迭代到成功"。

---

## 4. 实现架构：Plugin 设计

### 4.1 选择 Plugin 的原因

| 特性 | Command/Skill | Plugin |
|------|---------------|--------|
| 多命令组织 | 分散文件 | 统一命名空间 `/auto-dev:*` |
| MCP 集成 | 需外部配置 | 可声明依赖 |
| 分发安装 | 手动复制 | `/install-plugin` 一键安装 |
| 版本管理 | 无 | 支持 |

### 4.2 目录结构

```
auto-dev/
├── .claude-plugin/
│   └── plugin.json           # 插件元数据
├── commands/
│   ├── auto-dev.md           # 主命令 /auto-dev
│   ├── fix.md                # /auto-dev:fix "问题描述"
│   ├── status.md             # /auto-dev:status
│   └── cancel.md             # /auto-dev:cancel
├── skills/
│   ├── execute-loop/
│   │   └── SKILL.md          # Ralph Loop 驱动的执行技能
│   ├── learn-from-fix/
│   │   └── SKILL.md          # 从修正中学习
│   └── apply-rules/
│       └── SKILL.md          # 应用经验规则
└── templates/
    └── execute-prompt.md     # 执行提示模板
```

### 4.3 核心文件内容

#### plugin.json
```json
{
  "name": "auto-dev",
  "version": "0.1.0",
  "description": "自动化开发助手 - 快速迭代，持续学习",
  "commands": ["auto-dev", "fix", "status", "cancel"],
  "skills": ["execute-loop", "learn-from-fix", "apply-rules"],
  "mcp_dependencies": ["taskmaster-ai"]
}
```

#### commands/auto-dev.md
````markdown
# Auto Dev 主命令

启动自动化开发流程。

## 职责
- 初始化执行环境（git worktree）
- 将设计文档复制到隔离环境
- 检查/解析任务
- 加载项目上下文
- 启动 Ralph Loop

## 输入/输出
- **输入**: 设计文档路径（必需，用户提供的原始文档位置）
- **输出**: Ralph Loop 启动，开始自动执行任务

## 前置条件
- 用户已准备好设计文档
- TaskMaster 已初始化（若未初始化，自动执行 `taskmaster init`）

## 用法
/auto-dev <设计文档路径>

## 参数
- `设计文档路径`: 必需，用户提供的设计文档位置
- 支持格式: `.txt`, `.md`

## 流程
1. **环境准备**
   - 检查 TaskMaster 初始化状态
   - 调用 superpowers:using-git-worktrees 创建隔离环境

2. **文档准备**
   - 将用户提供的设计文档复制到 worktree 中
   - 目标路径: `.taskmaster/docs/prd.txt`（或 `.md`）

3. **任务检查**
   - 调用 TaskMaster get_tasks 检查是否有未完成任务
   - 若有未完成任务 → 跳过步骤4，直接进入步骤5（继续执行）
   - 若无任务或全部完成 → 执行步骤4（解析文档）

4. **任务拆解**（首次运行或无任务时）
   - 调用 TaskMaster parse_prd 解析设计文档
   - numTasks: 根据文档复杂度自动判断（设为 0）
   - 生成功能模块级任务（每个任务 10-30 分钟工作量）

5. **加载上下文**
   - 读取 .autodev/rules.md 项目经验规则（若不存在则跳过）
   - 读取 .autodev/project-facts.json 项目事实（若不存在则自动分析生成）

6. **启动执行**
   - 启动 Ralph Loop:
     ```
     /ralph-loop "使用 Skill 工具调用 auto-dev:execute-loop" \
       --completion-promise 'ALL TASKS DONE' \
       --max-iterations 50
     ```
   - 每次迭代 Claude 会调用 execute-loop skill 处理当前任务
````

##### auto-dev.md 测试边界
| 测试点   | 验证内容                                      |
| ----- | ----------------------------------------- |
| 环境准备  | worktree 创建成功                             |
| 文档复制  | 设计文档成功复制到 worktree                        |
| 任务检查  | 有未完成任务时跳过 parse_prd                       |
| 任务拆解  | parse_prd 参数正确（numTasks=0）                |
| 上下文加载 | rules.md 不存在时跳过，project-facts.json 不存在时生成 |
| 循环启动  | Ralph Loop 参数正确（promise + max-iterations） |

#### skills/execute-loop/SKILL.md
```markdown
# Execute Loop Skill

基于 Ralph Loop 的迭代执行技能。

## 职责
- 获取并执行当前任务
- 应用经验规则
- 执行 TDD 流程
- 处理执行结果
- 输出完成信号

## 输入/输出
- **输入**: Ralph Loop prompt（固定为"使用 Skill 工具调用 auto-dev:execute-loop"）
- **输出**: 任务完成状态 或 `<promise>ALL TASKS DONE</promise>`

## 与 Ralph Loop 的关系

本 Skill 在 Ralph Loop 内部执行：
- 由 /auto-dev 命令启动 Ralph Loop，prompt 为 "使用 Skill 工具调用 auto-dev:execute-loop"
- Ralph Loop 参数: `--completion-promise 'ALL TASKS DONE' --max-iterations 50`
- 每次迭代 Claude 收到相同 prompt，调用本 Skill 处理当前任务
- 所有任务完成后，本 Skill 输出 <promise>ALL TASKS DONE</promise> 信号退出循环

## 单次迭代流程

1. **获取当前任务**
   - 调用 TaskMaster next_task 获取待执行任务
   - 若无待执行任务 → 输出 <promise>ALL TASKS DONE</promise>

2. **应用经验规则**
   - 调用 apply-rules skill
   - 匹配当前任务相关的历史规则

3. **构建执行上下文**
   - 使用 `templates/execute-prompt.md` 模板
   - 填充变量：任务信息、项目事实、匹配的规则
   - 将构建好的上下文作为执行指导

4. **TDD 实现**（遵循 superpowers:test-driven-development）
   - 写失败测试
   - 实现代码使测试通过
   - 重构（保持测试绿色）

5. **验证**（遵循 superpowers:verification-before-completion）
   - 运行测试/程序
   - 检查预期输出
   - 必须有验证证据才能声明完成

6. **结果处理**
   - 通过 → TaskMaster set_task_status(done) → 本次迭代结束
   - 失败 → 调用 superpowers:systematic-debugging → 重新验证
   - 多次失败仍无法解决 → 暂停并提示用户介入（输出问题描述，等待 /auto-dev:fix）

7. **迭代继续**
   - 本次迭代结束后，Ralph Loop 自动进入下一次迭代
   - 下一迭代会调用 next_task 获取下一个待执行任务
   - 每次迭代看到之前的工作成果（文件变更、git 历史）
   - 自动修正偏差，逐步逼近正确实现
```

##### execute-loop 测试边界
| 测试点 | 验证内容 |
|-------|---------|
| 任务获取 | next_task 返回空时输出 promise |
| 规则应用 | apply-rules skill 被正确调用 |
| 上下文构建 | execute-prompt.md 模板变量填充正确 |
| TDD 执行 | test-driven-development skill 流程正确 |
| 验证执行 | verification-before-completion 流程正确 |
| 成功处理 | set_task_status(done) 被调用 |
| 失败处理 | systematic-debugging 被调用 |
| 卡住处理 | 多次失败后暂停并提示用户 |
| Promise 时机 | 仅在所有任务完成后输出 |

#### commands/fix.md
````markdown
# Fix 命令

用户发现问题后的修正入口。

## 职责
- 接收用户反馈的问题
- 执行代码修正
- 触发经验学习
- 恢复执行流程

## 输入/输出
- **输入**: 问题描述字符串
- **输出**: 修正完成 + 规则提取询问 + 继续执行询问

## 用法
/auto-dev:fix "问题描述"

## 示例
/auto-dev:fix "登录后应该跳转首页而不是个人中心"
/auto-dev:fix "价格应该向下取整"

## 流程
1. **记录问题**
   - 关联当前任务上下文
   - 记录用户反馈的具体问题

2. **执行修正**
   - 根据问题描述修改代码
   - 运行验证确认修复

3. **提取经验**
   - 调用 learn-from-fix skill
   - 询问用户是否记住该规则

4. **继续执行**
   - 检查 Ralph Loop 状态:
     - 若 Ralph Loop 仍在运行 → 自动继续下一迭代
     - 若 Ralph Loop 已停止 → 询问用户是否重新启动
   - 询问示例:
     ```
     ✅ 修正完成

     Ralph Loop 已停止，还有 3 个未完成任务。
     是否继续执行？

     [继续执行] [稍后再说]
     ```
````

##### fix.md 测试边界
| 测试点 | 验证内容 |
|-------|---------|
| 问题记录 | 正确关联当前任务上下文 |
| 修正执行 | 代码修改后运行验证 |
| 经验提取 | learn-from-fix skill 被正确调用 |
| 循环运行时 | Ralph Loop 运行中自动继续 |
| 循环停止时 | 询问用户是否重新启动 |

#### skills/learn-from-fix/SKILL.md
````markdown
# Learn From Fix Skill

从用户修正中提取并记录业务规则。

## 职责
- 分析修正前后的代码差异
- 提取可泛化的业务规则
- 询问用户是否记录
- 写入规则文件

## 输入/输出
- **输入**: 原始任务、修正前代码、用户反馈、修正后代码
- **输出**: 用户确认对话 + 规则写入（若用户选择记住）

## 输入
- 原始任务描述
- 实现的代码（修正前）
- 用户反馈的问题
- 修正后的代码

## 流程

1. **分析偏差**
   - 对比修正前后的代码差异
   - 提取可泛化的业务规则

2. **生成规则描述**
   - 格式: "当遇到 [情况] 时，应该 [做法]"
   - 确保规则足够具体且可复用

3. **用户确认**
   ```
   ✅ 已修复，登录后现在跳转到首页

   💡 要记住这个规则吗？
      "用户登录成功后跳转首页"

   [记住] [这次算了]
   ```

4. **记录规则**（若用户选择记住）
   - 追加到 .autodev/rules.md
   - 格式:
     ```markdown
     ## [日期] 从任务 "XXX" 学到的规则
     - 规则: 当遇到 [情况] 时，应该 [做法]
     - 原因: [用户反馈]
     - 相关文件: [涉及的文件路径]
     ```
````

##### learn-from-fix 测试边界
| 测试点  | 验证内容            |
| ---- | --------------- |
| 差异分析 | 正确识别修正前后的关键差异   |
| 规则提取 | 生成的规则格式正确且可复用   |
| 用户确认 | 对话框正确显示规则描述     |
| 规则写入 | rules.md 追加格式正确 |
| 用户拒绝 | 选择"这次算了"时不写入    |

#### commands/status.md
````markdown
# Status 命令

查看当前 Auto-Dev 执行状态。

## 职责
- 聚合展示执行状态信息
- 只读操作，不修改任何状态

## 输入/输出
- **输入**: 无
- **输出**: 格式化的状态信息

## 用法
/auto-dev:status

## 输出信息
- 当前工作分支
- 任务进度: 已完成 / 总数
- 当前任务详情
- Ralph Loop 迭代次数（读取 .claude/ralph-loop.local.md）
- 最近的验证结果

## 示例输出
```
📊 Auto-Dev 状态

分支: feature/user-auth-20240112
进度: 2/5 任务完成

当前任务: #3 JWT 生成/验证
状态: in-progress
迭代: 3

最近验证:
✅ 测试通过 (12/12)
```
````

##### status.md 测试边界
| 测试点 | 验证内容 |
|-------|---------|
| 分支信息 | 正确读取当前 git 分支 |
| 任务进度 | TaskMaster get_tasks 返回值正确解析 |
| 迭代次数 | .claude/ralph-loop.local.md 读取正确 |
| 无状态时 | 优雅处理文件不存在的情况 |

#### commands/cancel.md
````markdown
# Cancel 命令

取消当前 Auto-Dev 执行。

## 职责
- 停止 Ralph Loop
- 保留工作成果
- 提供用户确认

## 输入/输出
- **输入**: 无
- **输出**: 确认对话框 + 取消结果

## 用法
/auto-dev:cancel

## 流程
1. **停止 Ralph Loop**
   - 删除 .claude/ralph-loop.local.md 状态文件

2. **保留工作成果**
   - 当前分支的代码变更保留
   - TaskMaster 任务状态保留

3. **用户选择**
   ```
   ⚠️ 确认取消 Auto-Dev？

   当前进度: 2/5 任务完成
   未完成的任务将保持 pending 状态

   [确认取消] [继续执行]
   ```

## 注意
- 取消后可通过 `/auto-dev:status` 查看状态
- 可随时通过 `/auto-dev` 重新启动（会继续未完成的任务）
````

##### cancel.md 测试边界
| 测试点 | 验证内容 |
|-------|---------|
| 循环停止 | .claude/ralph-loop.local.md 被删除 |
| 成果保留 | git 分支和文件变更不受影响 |
| 任务状态 | TaskMaster 任务状态保持不变 |
| 用户确认 | 确认对话框正确显示进度 |
| 无循环时 | 优雅处理无活跃循环的情况 |

#### skills/apply-rules/SKILL.md
```markdown
# Apply Rules Skill

在执行任务前应用项目经验规则。

## 职责
- 加载项目规则文件
- 匹配当前任务相关的规则
- 将规则注入执行上下文

## 输入/输出
- **输入**: 当前任务描述
- **输出**: 匹配的规则列表

## 触发时机
- execute-loop 每次迭代开始时
- 新任务开始实现前

## 流程

1. **加载规则**
   - 读取 .autodev/rules.md
   - 解析所有已记录的业务规则

2. **规则匹配**
   - 分析当前任务描述
   - 匹配相关的历史规则
   - 按相关度排序

3. **注入上下文**
   - 将匹配的规则作为约束条件
   - 添加到任务执行的 prompt 中

## 规则应用示例

任务: "实现用户登录功能"

匹配规则:
- "用户登录成功后跳转首页"
- "密码必须使用 bcrypt 加密"
- "登录失败要记录日志"

→ 这些规则会自动应用到实现过程中
```

##### apply-rules 测试边界
| 测试点 | 验证内容 |
|-------|---------|
| 规则加载 | rules.md 解析正确 |
| 规则匹配 | 相关规则被正确识别 |
| 排序逻辑 | 按相关度排序 |
| 无规则时 | rules.md 不存在时返回空列表 |
| 无匹配时 | 无相关规则时返回空列表 |

#### templates/execute-prompt.md
````markdown
# Execute Loop Prompt Template

执行任务时的提示模板，用于构建每次迭代的 prompt。

## 职责
- 定义执行上下文的结构
- 提供变量占位符

## 输入/输出
- **输入**: 任务信息 + 项目事实 + 匹配规则
- **输出**: 填充后的 prompt 字符串

## 模板内容

```
你正在执行 Auto-Dev 自动化开发任务。

## 当前任务
- 任务ID: {{task_id}}
- 任务描述: {{task_description}}
- 依赖任务: {{dependencies}}

## 项目上下文
{{project_facts}}

## 适用规则
{{matched_rules}}

## 执行要求
1. 遵循 TDD 流程（先写测试，再实现）
2. 每次修改后运行验证
3. 必须有验证证据才能标记完成
4. 若遇到问题，调用 systematic-debugging

## 完成条件
当任务验证通过后，调用 TaskMaster set_task_status(done)
```

## 变量说明

| 变量 | 来源 | 说明 |
|-----|------|------|
| `{{task_id}}` | TaskMaster next_task | 当前任务 ID |
| `{{task_description}}` | TaskMaster next_task | 任务描述 |
| `{{dependencies}}` | TaskMaster next_task | 依赖的任务列表 |
| `{{project_facts}}` | .autodev/project-facts.json | 项目技术栈、目录结构等 |
| `{{matched_rules}}` | apply-rules skill | 匹配的经验规则 |
````

##### execute-prompt 测试边界
| 测试点 | 验证内容 |
|-------|---------|
| 变量替换 | 所有 `{{变量}}` 被正确替换 |
| 空值处理 | 变量为空时不产生错误 |
| 格式完整 | 输出包含所有必要章节 |

### 4.4 执行流程

> 此为高层次流程概览，详细组件调用链见 [4.6 组件调用链](#46-组件调用链)。

```
用户: /auto-dev [设计文档路径]
        │
        ▼
┌─────────────────────────────────────┐
│  准备阶段                           │
│  1. using-git-worktrees 创建隔离   │
│  2. 将设计文档复制到 worktree 中    │
│     → .taskmaster/docs/prd.txt     │
│  3. get_tasks 检查未完成任务:      │
│     - 有未完成 → 跳过步骤4         │
│     - 无任务 → 执行步骤4           │
│  4. TaskMaster parse_prd 解析文档  │
│     (首次运行或无任务时)           │
│  5. 加载 .autodev/rules.md         │
└─────────────────────────────────────┘
        │
        ▼
┌─────────────────────────────────────┐
│  执行阶段（Ralph Loop 驱动）        │
│                                     │
│  ┌─────────────────────────────────┐│
│  │ Ralph Loop 迭代 N:              ││
│  │                                 ││
│  │ 1. 调用 execute-loop skill     ││
│  │    a. next_task 获取任务       ││
│  │    b. apply-rules 匹配规则     ││
│  │    c. 构建执行上下文           ││
│  │    d. TDD 实现 + 验证          ││
│  │    e. set_task_status(done)    ││
│  │ 2. 无任务 → <promise>退出      ││
│  │ 3. 失败 → debugging → 重试     ││
│  │ 4. 卡住 → 提示用户介入         ││
│  │                                 ││
│  │ 循环直到所有任务完成           ││
│  │ → 输出 <promise>ALL TASKS DONE ││
│  └─────────────────────────────────┘│
│                                     │
│  用户可随时介入:                    │
│  /auto-dev:fix "问题描述"          │
│  → 修正 + 学习规则 + 继续迭代      │
└─────────────────────────────────────┘
        │
        ▼
┌─────────────────────────────────────┐
│  完成阶段                           │
│  • finishing-a-development-branch  │
│  • 合并/PR/清理                     │
└─────────────────────────────────────┘
```

### 4.5 核心组件交互

| 组件                  | 职责                       | 调用方式                                               |
| ------------------- | ------------------------ | -------------------------------------------------- |
| **Plugin Commands** | 用户入口                     | `/auto-dev`, `/auto-dev:fix`                       |
| **Plugin Skills**   | 执行逻辑                     | 内部调用                                               |
| **TaskMaster MCP**  | 任务拆解 + 状态管理              | `parse_prd`, `next_task`, `set_task_status`        |
| **Ralph Loop**      | 循环驱动（替代 executing-plans） | `/ralph-loop` 命令                                   |
| **Superpowers**     | 执行能力                     | TDD, verification, debugging, worktrees, finishing |
| **.autodev/**       | 经验存储                     | 文件读写                                               |

### 4.6 组件调用链

#### 主流程调用链

```
用户: /auto-dev <设计文档路径>
  │
  ├─► superpowers:using-git-worktrees     → 创建 worktree
  ├─► Copy: 设计文档 → worktree           → 复制文档到隔离环境
  ├─► TaskMaster: get_tasks()             → 检查任务
  ├─► TaskMaster: parse_prd()             → 拆解任务 (首次)
  ├─► Read: .autodev/rules.md             → 加载规则
  └─► /ralph-loop 启动
        │
        ├─► 迭代 1:
        │     ├─► execute-loop Skill
        │     │     ├─► TaskMaster: next_task()     → 任务 #1
        │     │     ├─► apply-rules Skill           → 匹配规则
        │     │     ├─► execute-prompt.md           → 构建上下文
        │     │     ├─► superpowers:TDD             → 实现
        │     │     ├─► superpowers:verification    → 验证
        │     │     └─► TaskMaster: set_task_status(done)
        │     └─► 迭代结束
        │
        ├─► 迭代 2: ... (任务 #2)
        │
        ├─► 用户介入: /auto-dev:fix "问题"
        │     ├─► 修正代码
        │     ├─► learn-from-fix Skill
        │     │     ├─► 分析差异
        │     │     ├─► 用户确认 [记住]
        │     │     └─► Write: .autodev/rules.md
        │     └─► Ralph Loop 继续
        │
        ├─► 迭代 N:
        │     ├─► TaskMaster: next_task()     → 无任务
        │     └─► 输出 <promise>ALL TASKS DONE</promise>
        │
        └─► Ralph Loop 退出
              └─► superpowers:finishing-a-development-branch
```

#### 数据流向

| 阶段 | 数据来源 | 数据去向 | 组件 |
|------|---------|---------|------|
| 文档复制 | 用户指定路径 | worktree/.taskmaster/docs/ | auto-dev 命令 |
| 任务拆解 | prd.txt | tasks.json | TaskMaster parse_prd |
| 任务获取 | tasks.json | execute-loop | TaskMaster next_task |
| 规则匹配 | rules.md | execute-prompt | apply-rules |
| 上下文构建 | 任务+规则+事实 | Claude prompt | execute-prompt.md |
| 状态更新 | 任务完成 | tasks.json | TaskMaster set_task_status |
| 经验学习 | 用户修正 | rules.md | learn-from-fix |

#### 关键串联点

| 串联点 | 上游组件 | 下游组件 | 传递内容 |
|-------|---------|---------|---------|
| ① 启动循环 | auto-dev.md | Ralph Loop | prompt + 参数 |
| ② 迭代触发 | Ralph Loop | execute-loop | 相同 prompt |
| ③ 任务分发 | TaskMaster | execute-loop | task 对象 |
| ④ 规则注入 | apply-rules | execute-prompt | 匹配的规则列表 |
| ⑤ 学习触发 | fix.md | learn-from-fix | 修正上下文 |
| ⑥ 完成信号 | execute-loop | Ralph Loop | `<promise>` 标签 |

---

## 5. 核心差异化：经验积累机制

### 5.1 这是 Superpowers 没有的

Superpowers 提供了优秀的执行能力（TDD、验证、调试），但**没有项目级的学习和积累机制**。

Auto-Dev 的核心差异化是：**用得越多，成功率越高**。

### 5.2 积累机制设计

```
场景：用户修正后

用户: /auto-dev:fix "登录后应该跳转首页而不是个人中心"

系统: ✅ 已修复，登录后现在跳转到首页
      
      💡 要记住这个规则吗？
         "用户登录成功后跳转首页"
      
      [记住] [这次算了]
```

### 5.3 经验存储结构

每个使用 Auto-Dev 的项目会生成 `.autodev/` 目录：

```
.autodev/
├── rules.md                # 显式记录的业务决策（V0.2）
│   │                       # 由 learn-from-fix skill 写入
│   ├── 用户登录成功后跳转首页
│   ├── 价格计算向下取整
│   └── ...
│
├── project-facts.json      # 隐式积累的项目事实（V0.3）
│   │                       # 由 auto-dev 命令首次运行时分析生成
│   ├── techStack           # 技术栈
│   ├── directoryConventions # 目录约定
│   ├── existingComponents  # 已有组件
│   └── codeStyle           # 代码风格
│
├── task-history.json       # 任务执行历史（V0.4）
└── metrics.json            # 成功率等指标（V0.4）
```

> **版本说明**：V0.1-V0.2 仅实现 `rules.md`，其他文件在后续版本迭代中添加。

#### rules.md 示例
```markdown
# 项目经验规则

## 2024-01-15 从任务 "添加用户登录" 学到的规则
- 本项目使用 JWT 而非 Session
- 密码必须使用 bcrypt 加密
- 登录失败要记录日志

## 2024-01-16 从任务 "实现商品列表" 学到的规则
- 分页默认每页 20 条
- 价格字段使用 Decimal 类型
```

---

## 6. 可行性评估

### 6.1 技术可行性 ✅

| 依赖 | 状态 | 验证 |
|-----|------|------|
| Ralph Loop | ✅ 已稳定可用 | 用户确认 |
| TaskMaster MCP | ✅ 已配置可用 | 用户确认 |
| Superpowers Skills | ✅ 已安装 | 用户确认 |
| Ralph Loop 命令集成 | ✅ 可行 | 实际测试验证 |

### 6.2 方案优势

| 方面 | 效果 |
|-----|------|
| **简单性** | 复用成熟组件，不重复造轮子 |
| **可靠性** | Ralph Loop 成熟的循环机制 |
| **状态管理** | TaskMaster 持久化 + 依赖管理 |
| **验证能力** | Superpowers TDD + verification |
| **差异化** | 经验积累机制，越用越好用 |

### 6.3 潜在风险

| 风险         | 缓解措施               |
| ---------- | ------------------ |
| 成功率仍不达 80% | 持续优化 prompt + 积累规则 |
| 上下文过长      | 任务粒度小，每次迭代聚焦       |
| 规则冲突       | 设计规则优先级机制          |

---

## 7. 下一步

### 7.1 实现计划

| 阶段 | 内容 | 优先级 |
|-----|------|--------|
| **V0.1** | Plugin 骨架 + 基础执行 + Ralph Loop 集成 | P0 |
| **V0.2** | 加入 `/auto-dev:fix` 修正命令 | P0 |
| **V0.3** | 加入经验积累机制 | P1 |
| **V0.4** | 优化和调优 | P2 |

### 7.2 待细化

- [x] auto-dev.md Command 完整内容
- [x] execute-loop/SKILL.md 完整内容
- [x] learn-from-fix/SKILL.md 完整内容
- [x] apply-rules/SKILL.md 完整内容
- [x] status.md Command 完整内容
- [x] cancel.md Command 完整内容
- [ ] 经验积累的存储格式和应用逻辑（详细实现）
- [ ] project-facts.json 自动分析逻辑
- [ ] 规则匹配算法（语义匹配 vs 关键词匹配）

### 7.3 开发流程

> **开发 Auto-Dev 插件本身**的流程与**使用 Auto-Dev 插件**的流程一致，参见 [4.4 执行流程](#44-执行流程)。

```
/auto-dev <设计文档路径>
    │
    ├─► 1. 创建 worktree      → 建立隔离开发环境
    ├─► 2. 复制设计文档        → 放入 worktree/.taskmaster/docs/
    ├─► 3. 解析 PRD           → 生成开发任务
    ├─► 4. 执行开发            → Ralph Loop 驱动
    └─► 5. 合并/清理           → finishing-a-development-branch
```

**核心决策**：先建 worktree 后放 PRD
- 所有开发相关文件（PRD、任务、代码）都在隔离环境中
- 主分支保持干净，开发失败可直接删除 worktree，零影响

---

## 8. 与原文档的关系

| 文档 | 影响 |
|-----|------|
| [[15-场景融合分析-统一执行模型]] | 核心理念保持，执行机制更新 |
| [[16-用户旅程-统一执行模型]] | 用户旅程保持，技术实现更新 |
| [[11-场景1最小干预实现方案]] | 被本文档方案替代 |
| [[13-场景1实现方案-TaskMaster复用分析]] | 部分复用，职责重新划分 |

---

## 变更记录

| 日期 | 变更内容 |
|------|----------|
| 2025-01-12 | 初始版本，记录头脑风暴结论 |
| 2025-01-12 | 添加 Plugin 架构设计 |
| 2025-01-12 | 重构文档结构，合并第4节和第9节 |
| 2025-01-12 | 明确 Superpowers Skills 使用策略：粗粒度规划 + 自动迭代修正 |
| 2025-01-12 | 任务拆解改用 TaskMaster parse_prd，需预先准备设计文档 |
| 2025-01-12 | 完善 4.3 节：补充 status/cancel 命令、apply-rules skill、Ralph Loop 集成细节 |
| 2025-01-12 | 修复 4.3 节：明确 Ralph Loop 启动命令、execute-loop 调用 apply-rules、fix 继续执行逻辑 |
| 2025-01-12 | 完善 4.3 节：首次运行处理、迭代逻辑描述、补充 execute-prompt.md 模板 |
| 2025-01-12 | 修复 4.3 节：execute-loop 添加"构建执行上下文"步骤，引用 execute-prompt.md 模板 |
| 2025-01-12 | 修复第4章逻辑：明确 Skill 调用方式、修正 4.4 执行流程图的循环和 promise 逻辑 |
| 2025-01-12 | 修复第4章：添加任务检查步骤避免重复 parse_prd、完善失败处理逻辑、修正用户修正时机 |
| 2025-01-12 | 修复第4章：同步 4.4 流程图与 4.3 的任务检查步骤、补充 status.md 迭代次数数据来源 |
| 2025-01-12 | 修复第4章：修正 4.5 表格中 Ralph Loop 的调用方式为 `/ralph-loop` 命令 |
| 2025-01-12 | 修复第3章：3.2 职责分离表格中 TaskMaster 状态追踪工具名改为 `set_task_status` |
| 2025-01-12 | 修复第6章：6.1 技术可行性表格中"Skill 工具调用 ralph-loop"改为"Ralph Loop 命令集成" |
| 2025-01-13 | 移除 hooks：删除 session_start 钩子，更新目录结构和 plugin.json |
| 2025-01-13 | 为所有组件添加职责和测试边界：commands（auto-dev/fix/status/cancel）、skills（execute-loop/learn-from-fix/apply-rules）、templates（execute-prompt） |
| 2025-01-13 | 重构测试边界：从组件定义内部移出，改为独立小节（##### xxx 测试边界）放在组件下方 |
| 2025-01-13 | 添加 4.6 组件调用链：主流程调用链、数据流向、关键串联点 |
| 2025-01-13 | 修复第4章：移除 4.1 表格中已删除的 Hooks 对比行 |
| 2025-01-13 | 修复第5章：5.3 经验存储结构添加版本说明，明确各文件的写入组件和实现版本 |
| 2025-01-13 | 修复 4.4 与 4.6 一致性：更新迭代步骤包含 apply-rules/构建上下文，添加引用说明 |
| 2025-01-13 | 添加 7.3 开发流程：明确开发 Auto-Dev 插件本身的流程（先 worktree 后 PRD），区别于使用时的流程 |
| 2025-01-13 | 统一使用流程：4.4/4.3/4.6 改为先建 worktree 后复制 PRD，设计文档路径改为必需参数，开发流程与使用流程一致 |
