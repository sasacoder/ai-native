---
name: status
description: 显示当前 Auto-Dev 执行状态
---

# /auto-dev:status 命令

显示当前自动化开发执行状态。

## 职责
- 显示当前分支信息
- 显示任务进度
- 显示当前任务详情
- 显示最近验证结果

## 输入/输出
- **输入**: 无
- **输出**: 状态信息（只读）

## 用法

```
/auto-dev:status
```

## 流程

### 1. 获取分支信息

```bash
git rev-parse --abbrev-ref HEAD
```

### 2. 获取任务进度

调用 TaskMaster MCP 的 `get_tasks` 获取所有任务：
- 统计总任务数
- 统计已完成任务数
- 计算完成百分比

### 3. 获取当前任务

调用 TaskMaster MCP 的 `next_task` 获取当前执行的任务。

### 4. 读取执行状态

从 `.autodev/execution-state.json` 读取：
- 迭代次数
- 开始时间
- 最近验证结果

### 5. 格式化输出

```
📊 Auto-Dev 状态

分支: feature/user-auth-20240112
进度: 4/5 任务完成 (80%)

当前任务: #5 添加密码重置
状态: in-progress
迭代: 2

最近验证:
✅ 测试通过 (18/18)
```

## 无执行时的输出

```
📊 Auto-Dev 状态

当前无活跃执行

使用 /auto-dev <设计文档> 启动新的开发流程
```

