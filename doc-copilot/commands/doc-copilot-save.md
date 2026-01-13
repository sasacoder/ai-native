---
description: 保存当前章节并触发下一步流程
allowed-tools: Skill, mcp__doc-copilot__load_state, mcp__doc-copilot__load_template, mcp__doc-copilot__save_state
---

# Doc-Copilot Save 命令

保存当前章节内容，并触发下一步流程。

## 执行流程

### 步骤1：加载当前状态
1. 调用 `mcp__doc-copilot__load_state` 获取当前状态
2. 调用 `mcp__doc-copilot__load_template` 获取模板配置
3. 查找 status = "in_progress" 的章节
4. 如果没有找到 in_progress 章节，提示错误并退出：
   "错误：没有正在编写的章节。请先使用 `/doc-copilot` 开始编写。"

### 步骤2：分析当前阶段

根据当前章节的 phase 字段判断：

#### Phase = "brainstorming"
用户应该已经输出了初步大纲。询问用户：
```
请确认当前大纲是否满意？

[1] 大纲满意，进入详细编写阶段
[2] 继续完善大纲
[3] 放弃本章，返回章节选择
```

- 选择 1：设置 outline_confirmed = true，phase = "writing"，保存状态
- 选择 2：保持当前状态，继续讨论
- 选择 3：设置 status = "pending"，返回主流程

#### Phase = "outlining"
（预留阶段，当前可以跳过）

#### Phase = "writing"
用户应该已经完成或部分完成章节内容。询问用户：
```
当前章节编写进度如何？

[1] 本章已完成，进入下一章
[2] 继续完善本章内容
[3] 回退到大纲修改阶段
```

- 选择 1：提取内容，设置 status = "done"，查找下一章
- 选择 2：保存当前内容，继续编写
- 选择 3：设置 phase = "brainstorming"，outline_confirmed = false

### 步骤3：内容提取与保存

从对话上下文中提取章节内容：
- 识别用户确认的大纲结构
- 识别基于大纲生成的正文内容
- 合并为 Markdown 格式
- 更新 state.chapters[i].content 字段

调用 `save_state` 时设置 render=true 以渲染完整文档。

### 步骤4：后续流程

#### 如果章节标记为 done
1. 使用智能查找逻辑找到下一个可编写的章节：
   ```
   查找逻辑：
   - 遍历模板章节顺序
   - 查找第一个 status = "pending" 且依赖都满足（depends_on 中的章节都是 done）的章节
   - 如果没有找到，说明文档已全部完成
   ```

2. 如果找到下一章：
   - 提示："{当前章节} 已完成！接下来编写：{下一章节名称}"
   - 询问用户是否立即开始，或稍后使用 `/doc-copilot` 继续

3. 如果没有下一章：
   - 显示完成信息（格式见下方）

#### 如果继续完善当前章节
提示："内容已保存，请继续完善。"

## 完成信息格式

```
🎉 文档编写完成！

模版：{模版名称}
输出：{输出文件路径}
章节：{已完成章节数}/{总章节数}

可使用 `/doc-copilot status` 查看详情。
```
