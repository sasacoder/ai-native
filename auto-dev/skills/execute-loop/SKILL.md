---
name: execute-loop
description: Ralph Loop 驱动的迭代执行技能
---

# Execute Loop Skill

基于 Ralph Loop 的迭代执行技能。

## 职责
- 获取并执行当前任务
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
- 所有任务完成后，本 Skill 输出 `<promise>ALL TASKS DONE</promise>` 信号退出循环

## 单次迭代流程

### 1. 获取当前任务

调用 TaskMaster MCP 的 `next_task` 获取待执行任务：
- 若有任务 → 继续步骤 2
- 若无待执行任务 → 输出 `<promise>ALL TASKS DONE</promise>` 并结束

```
📋 获取任务...
任务 #3: 实现用户登录功能
状态: pending → in-progress
```

或

```
📋 获取任务...
无待执行任务

<promise>ALL TASKS DONE</promise>
```

### 2. TDD 实现

> 遵循 `superpowers:test-driven-development`

**Red-Green-Refactor 循环：**

1. **写失败测试（Red）**
   - 根据任务需求编写测试用例
   - 运行测试，确认测试失败（预期行为）

2. **实现代码（Green）**
   - 编写最小代码使测试通过
   - 运行测试，确认测试通过

3. **重构（Refactor）**
   - 优化代码结构
   - 保持测试绿色

```
🔴 编写测试...
   测试: 用户登录成功后应跳转首页
   结果: ❌ 失败（预期）

🟢 实现功能...
   结果: ✅ 测试通过

🔧 重构代码...
   结果: ✅ 测试仍然通过
```

### 3. 验证

> 遵循 `superpowers:verification-before-completion`

**验证要求：**
- 运行测试/程序
- 检查预期输出
- **必须有验证证据才能声明完成**

```
🔍 验证中...

✅ 验证通过
- 测试结果: 12/12 通过
- 功能验证: 登录后成功跳转首页
- 证据: [测试输出截图/日志]
```

### 4. 结果处理

**成功路径：**

验证通过后，标记任务完成：
- 调用 TaskMaster MCP 的 `set_task_status(taskId, 'done')`
- 本次迭代结束，Ralph Loop 自动进入下一迭代

```
✅ 任务 #3 完成
状态: in-progress → done
```

**失败路径：**

验证失败时，启动调试流程：
1. 调用 `superpowers:systematic-debugging` 分析问题
2. 根据调试结果修复代码
3. 重新验证

```
❌ 验证失败
错误: 登录后未跳转，停留在登录页

🔧 启动系统调试...
- 分析错误日志
- 检查路由配置
- 修复问题

🔄 重新验证...
```

**多次失败：**

若连续失败 3 次仍无法解决，暂停执行并提示用户介入：

```
⚠️ 任务执行遇到困难

任务: #3 实现用户登录功能
失败次数: 3
最后错误: 路由跳转失败

请使用 /auto-dev:fix "问题描述" 提供修正指导
```

### 5. 迭代继续

本次迭代结束后：
- Ralph Loop 自动进入下一次迭代
- 下一迭代调用 `next_task` 获取下一个待执行任务
- 每次迭代看到之前的工作成果（文件变更、git 历史）
- 自动修正偏差，逐步逼近正确实现

