---
name: migrate-data
description: .autodev 数据迁移和版本控制
---

# Migrate Data Skill

处理 .autodev 目录从旧版本到新版本的数据迁移。

## 职责
- 检测当前版本
- 执行数据迁移
- 备份和回滚
- 验证迁移结果

## 输入/输出
- **输入**: 现有 .autodev 目录
- **输出**: 迁移后的 .autodev 目录

## 版本检测

**检测逻辑：**

1. 检查 `.claude-plugin/plugin.json` 中的版本号
2. 检查 `.autodev/` 目录结构
3. 检查各文件是否存在

```
🔍 检测版本...
- plugin.json 版本: 0.3.0
- .autodev 结构: V0.3

需要迁移: V0.3 → V0.4
```

**版本特征：**

| 版本 | 文件结构 |
|-----|---------|
| V0.2 | rules.md |
| V0.3 | rules.md |
| V0.4 | rules.md, project-facts.json, task-history.json, metrics.json |

## 迁移流程

### 1. 备份

迁移前创建备份：

```
💾 创建备份...
- 源: .autodev/
- 备份: .autodev.backup.{timestamp}/

✅ 备份完成
```

### 2. V0.3 → V0.4 迁移

**迁移步骤：**

```
🔄 执行迁移 V0.3 → V0.4...

步骤 1/4: 保留 rules.md
- 状态: ✓ 保留

步骤 2/4: 创建 project-facts.json
- 状态: ✓ 创建（空模板）
- 提示: 运行 /auto-dev 时将自动分析

步骤 3/4: 创建 task-history.json
- 状态: ✓ 创建
- 内容: { "executions": [] }

步骤 4/4: 创建 metrics.json
- 状态: ✓ 创建
- 内容: 初始指标
```

### 3. 验证

验证迁移结果：

```
✅ 迁移验证...

文件检查:
- rules.md: ✓ 存在
- project-facts.json: ✓ 存在
- task-history.json: ✓ 有效 JSON
- metrics.json: ✓ 有效 JSON

数据完整性:
- rules.md 内容: ✓ 未丢失
- JSON 格式: ✓ 有效

迁移成功！
```

### 4. 更新版本

更新 plugin.json 版本号：

```
📝 更新版本...
- 旧版本: 0.3.0
- 新版本: 0.4.0

✅ 版本更新完成
```

## 回滚机制

迁移失败时自动回滚：

```
❌ 迁移失败
错误: task-history.json 写入失败

🔄 执行回滚...
- 删除新建文件
- 从备份恢复

✅ 回滚完成
- 恢复版本: V0.3
```

## 错误处理

| 错误类型 | 处理方式 |
|---------|---------|
| 文件写入失败 | 回滚到备份 |
| JSON 解析错误 | 跳过该文件，继续迁移 |
| 权限不足 | 提示用户检查权限 |
| 磁盘空间不足 | 清理备份后重试 |

## 迁移注册表

支持的迁移路径：

| 源版本 | 目标版本 | 状态 |
|-------|---------|------|
| V0.2 | V0.3 | 支持 |
| V0.3 | V0.4 | 支持 |
| V0.2 | V0.4 | 支持（链式迁移）|

**链式迁移：**

```
V0.2 → V0.3 → V0.4
```

## 与 /auto-dev 的集成

在 /auto-dev 启动时自动检查并迁移：

```
📋 检查 .autodev 版本...
- 当前: V0.3
- 需要: V0.4

是否执行迁移？
[Y] 是  [N] 否
```
