---
description: AI 协作文档编写 - 按模版交互式完成研发文档
argument-hint: [status|list]
allowed-tools: Skill, mcp__doc-copilot__list_templates, mcp__doc-copilot__load_template, mcp__doc-copilot__load_state, mcp__doc-copilot__save_state
---

# Doc-Copilot 命令

入口命令，根据 `$ARGUMENTS` 参数分发到不同处理分支。

## 分支1：`$ARGUMENTS` = "list"

调用 `mcp__doc-copilot__list_templates`，显示可用模版列表后结束。

格式示例：
```
可用模版：
  • micro-design - 微型设计说明书 (5 章节)
  • system-requirements - 系统需求规格说明书 (8 章节)
```

## 分支2：`$ARGUMENTS` = "status"

调用 `mcp__doc-copilot__load_state`：
- 有进度：显示当前模版、章节完成情况、上次编辑时间
- 无进度：提示"暂无进行中的文档任务"

## 分支3：无参数（主流程）

### 步骤1：加载状态
调用 `mcp__doc-copilot__load_state` 检查当前文档编写状态。

### 步骤2：状态分析与决策

#### 情况A：无进度（exists = false）
1. 调用 `list_templates` 展示可用模板
2. 让用户选择模板（使用 AskUserQuestion）
3. 调用 `load_template` 加载模板配置
4. 调用 `save_state` 初始化状态（所有章节设为 pending + brainstorming 阶段）
5. 自动进入第一章节编写流程（跳转到步骤3）

#### 情况B：全部章节已完成
检查 state.chapters 是否全部 status = "done"，如果是则提示：
"文档已全部完成！输出文件：{state.output}"

#### 情况C：有进度且有未完成章节
1. 调用 `load_template(state.template_id)` 获取模板配置
2. **智能查找下一个可编写的章节**：
   ```
   查找逻辑（按优先级）：
   a. 优先查找 status = "in_progress" 的章节（继续未完成的工作）
   b. 如果没有 in_progress 章节，查找第一个满足依赖条件的 pending 章节：
      - 遍历模板中的章节顺序（按 template.chapters 数组顺序）
      - 对于每个 status = "pending" 的章节：
        * 如果没有 depends_on 字段 → 可以开始
        * 如果有 depends_on 字段 → 检查依赖的所有章节是否都是 status = "done"
      - 返回第一个符合条件的章节
   ```
3. 向用户展示推荐的章节：
   ```
   检测到进行中的文档项目：「{模板名称}」

   建议继续编写：「{推荐章节名}」（第 X/总数 章）

   [1] 继续编写推荐章节（推荐）
   [2] 选择其他章节
   ```

4. 如果用户选择"选择其他章节"：
   - 展示所有可编写的章节列表（依赖条件都满足的章节）
   - 标注每个章节的状态和依赖情况
   - 让用户输入章节编号

### 步骤3：构造章节编写 Prompt

确定目标章节后，构造详细的编写 prompt：

```
你正在帮助用户编写「{模板名称}」的「{章节名称}」章节（第 X/{总章节数} 章）。

## 章节编写指南
{从 template.chapters[i].prompt 获取}

## 知识源要求
{根据 knowledge_sources 配置生成}
- 如果 type = "user_input": 列出需要询问用户的 questions 列表
- 如果 type = "codebase": 提示需要分析的代码路径 paths
- 如果 type = "document": 提示需要参考的文档 files

## 已完成章节上下文
{遍历 state.chapters，筛选 status = "done" 的章节}
以下是已完成的章节内容，供参考：

### {章节1名称}
{内容摘要，取前 200 字}

### {章节2名称}
{内容摘要，取前 200 字}

## 当前编写阶段
根据 state.chapters[i].phase 字段：
- **brainstorming**: 请先了解用户需求，收集必要信息，然后输出初步大纲供确认
- **outlining**: 请根据用户反馈完善大纲，确认后准备进入正式编写
- **writing**: 请根据确认的大纲正式编写章节内容

大纲确认状态：{state.chapters[i].outline_confirmed}

请开始工作。完成后提醒用户使用 `/doc-copilot-save` 保存进度。
```

### 步骤4：更新章节状态并开始

在开始编写前，如果章节当前是 pending 状态，先更新为 in_progress：
```javascript
state.chapters[i].status = "in_progress"
```
调用 `save_state` 保存状态，然后输出步骤3构造的 prompt，正式开始编写流程。

## 注意事项

1. **章节依赖检查**: 必须严格遵守 depends_on 定义的章节依赖关系，不允许跳过依赖编写后续章节
2. **状态同步**: 每次修改章节状态后立即调用 `save_state` 保持状态同步
3. **阶段流转**: 章节编写遵循 brainstorming → outlining → writing 的三阶段流程
4. **用户确认**: outline_confirmed = true 后才能进入 writing 阶段
5. **内容保存**: 使用 `/doc-copilot-save` 命令触发内容保存和文档渲染
