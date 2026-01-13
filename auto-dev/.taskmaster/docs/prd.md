# Auto-Dev V0.3 PRD: 经验应用 + 状态管理

## 目标
实现经验规则的应用机制和执行状态管理，让积累的规则能自动应用到后续任务。

## 范围
- `apply-rules` Skill（规则应用）
- `/auto-dev:status` 状态命令
- `/auto-dev:cancel` 取消命令
- `execute-prompt.md` 模板
- 上下文加载机制

## 前置条件
- V0.2 已完成（fix 命令和规则存储可用）

## 验收标准
1. 执行任务时自动匹配并应用相关规则
2. `/auto-dev:status` 显示当前执行状态
3. `/auto-dev:cancel` 能安全取消执行
4. execute-prompt.md 模板正确填充变量

---

## 组件定义

### 1. apply-rules Skill (skills/apply-rules/SKILL.md)

#### 职责
- 加载项目规则文件
- 匹配当前任务相关的规则
- 将规则注入执行上下文

#### 触发时机
- execute-loop 每次迭代开始时
- 新任务开始实现前

#### 流程
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

#### 规则应用示例
```
任务: "实现用户登录功能"

匹配规则:
- "用户登录成功后跳转首页"
- "密码必须使用 bcrypt 加密"
- "登录失败要记录日志"

→ 这些规则会自动应用到实现过程中
```

#### 测试边界
| 测试点 | 验证内容 |
|-------|---------|
| 规则加载 | rules.md 解析正确 |
| 规则匹配 | 相关规则被正确识别 |
| 排序逻辑 | 按相关度排序 |
| 无规则时 | rules.md 不存在时返回空列表 |
| 无匹配时 | 无相关规则时返回空列表 |

---

### 2. /auto-dev:status 命令 (commands/status.md)

#### 职责
- 聚合展示执行状态信息
- 只读操作，不修改任何状态

#### 输出信息
- 当前工作分支
- 任务进度: 已完成 / 总数
- 当前任务详情
- Ralph Loop 迭代次数
- 最近的验证结果

#### 示例输出
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

#### 测试边界
| 测试点 | 验证内容 |
|-------|---------|
| 分支信息 | 正确读取当前 git 分支 |
| 任务进度 | TaskMaster get_tasks 返回值正确解析 |
| 迭代次数 | 读取正确 |
| 无状态时 | 优雅处理文件不存在的情况 |

---

### 3. /auto-dev:cancel 命令 (commands/cancel.md)

#### 职责
- 停止 Ralph Loop
- 保留工作成果
- 提供用户确认

#### 流程
1. **停止 Ralph Loop**
   - 删除状态文件

2. **保留工作成果**
   - 当前分支的代码变更保留
   - TaskMaster 任务状态保留

3. **用户确认**
   ```
   ⚠️ 确认取消 Auto-Dev？

   当前进度: 2/5 任务完成
   未完成的任务将保持 pending 状态

   [确认取消] [继续执行]
   ```

#### 测试边界
| 测试点 | 验证内容 |
|-------|---------|
| 循环停止 | 状态文件被删除 |
| 成果保留 | git 分支和文件变更不受影响 |
| 任务状态 | TaskMaster 任务状态保持不变 |
| 用户确认 | 确认对话框正确显示进度 |
| 无循环时 | 优雅处理无活跃循环的情况 |

---

### 4. execute-prompt.md 模板 (templates/execute-prompt.md)

#### 职责
- 定义执行上下文的结构
- 提供变量占位符

#### 模板内容
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

#### 变量说明
| 变量 | 来源 | 说明 |
|-----|------|------|
| `{{task_id}}` | TaskMaster next_task | 当前任务 ID |
| `{{task_description}}` | TaskMaster next_task | 任务描述 |
| `{{dependencies}}` | TaskMaster next_task | 依赖的任务列表 |
| `{{project_facts}}` | .autodev/project-facts.json | 项目技术栈、目录结构等 |
| `{{matched_rules}}` | apply-rules skill | 匹配的经验规则 |

#### 测试边界
| 测试点 | 验证内容 |
|-------|---------|
| 变量替换 | 所有 `{{变量}}` 被正确替换 |
| 空值处理 | 变量为空时不产生错误 |
| 格式完整 | 输出包含所有必要章节 |

---

### 5. 更新 execute-loop Skill

在 execute-loop 中添加规则应用步骤：

```markdown
## 单次迭代流程

1. **获取当前任务**
   - 调用 TaskMaster next_task 获取待执行任务
   - 若无待执行任务 → 输出 `<promise>ALL TASKS DONE</promise>`

2. **应用经验规则** ← 新增
   - 调用 apply-rules skill
   - 匹配当前任务相关的历史规则

3. **构建执行上下文** ← 新增
   - 使用 templates/execute-prompt.md 模板
   - 填充变量：任务信息、项目事实、匹配的规则

4. **TDD 实现**
   ...（其余不变）
```

---

## 更新 plugin.json
```json
{
  "name": "auto-dev",
  "version": "0.3.0",
  "description": "自动化开发助手 - 快速迭代，持续学习",
  "commands": ["auto-dev", "fix", "status", "cancel"],
  "skills": ["execute-loop", "learn-from-fix", "apply-rules"],
  "mcp_dependencies": ["taskmaster-ai"]
}
```

---

## 依赖
- V0.2 所有组件
- .autodev/rules.md（V0.2 创建）
