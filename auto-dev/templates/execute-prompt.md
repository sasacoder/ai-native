# Auto-Dev 执行上下文

你正在执行 Auto-Dev 自动化开发任务。

## 当前任务

- **任务 ID**: {{task_id}}
- **任务描述**: {{task_description}}
- **依赖任务**: {{dependencies}}

## 项目上下文

{{project_facts}}

## 适用规则

{{matched_rules}}

## 执行要求

1. **遵循 TDD 流程**
   - 先写失败测试（Red）
   - 实现代码使测试通过（Green）
   - 重构优化（Refactor）

2. **每次修改后运行验证**
   - 执行测试套件
   - 检查预期行为

3. **必须有验证证据**
   - 不要声称完成而没有实际运行验证
   - 提供测试输出或运行日志作为证据

4. **遇到问题调用调试**
   - 使用 `superpowers:systematic-debugging` 分析问题
   - 不要盲目尝试修复

## 完成条件

当任务验证通过后：
- 调用 TaskMaster `set_task_status(taskId, 'done')`
- 本次迭代结束

若所有任务完成：
- 输出 `<promise>ALL TASKS DONE</promise>`
