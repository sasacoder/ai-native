# Auto-Dev V0.4 PRD: 优化和调优

## 目标
优化执行效果，添加项目事实分析，完善用户体验。

## 范围
- project-facts.json 自动分析
- 规则匹配算法优化
- 执行历史和指标记录
- 完成阶段集成 (finishing-a-development-branch)

## 前置条件
- V0.3 已完成（规则应用和状态管理可用）

## 验收标准
1. 首次运行自动分析项目事实
2. 规则匹配准确率提升
3. 完成后自动触发分支完成流程
4. 执行历史和成功率指标可查看

---

## 组件定义

### 1. project-facts.json 自动分析

#### 触发时机
- /auto-dev 命令首次运行时
- .autodev/project-facts.json 不存在时

#### 分析内容
```json
{
  "techStack": {
    "language": "TypeScript",
    "framework": "React",
    "styling": "Tailwind CSS",
    "testing": "Jest + React Testing Library"
  },
  "directoryConventions": {
    "components": "src/components/",
    "hooks": "src/hooks/",
    "services": "src/services/",
    "utils": "src/utils/"
  },
  "existingComponents": [
    "Button",
    "Modal",
    "Form",
    "Table"
  ],
  "codeStyle": {
    "naming": "camelCase for functions, PascalCase for components",
    "indentation": "2 spaces",
    "quotes": "single"
  },
  "analyzedAt": "2024-01-15T10:30:00Z"
}
```

#### 分析流程
1. 扫描 package.json 识别技术栈
2. 分析目录结构识别约定
3. 扫描已有组件/模块
4. 分析代码风格（命名、缩进等）

#### 测试边界
| 测试点 | 验证内容 |
|-------|---------|
| 触发条件 | 仅在文件不存在时分析 |
| 技术栈识别 | 正确识别主要框架和库 |
| 目录约定 | 正确识别项目目录结构 |
| 组件扫描 | 找到已有的可复用组件 |
| 代码风格 | 正确识别命名和格式约定 |

---

### 2. 规则匹配算法优化

#### 当前算法（V0.3）
- 简单关键词匹配
- 按匹配数量排序

#### 优化后算法（V0.4）
- 语义相似度匹配
- 考虑任务类型（登录、支付、列表等）
- 考虑涉及的文件路径
- 权重排序

#### 匹配维度
| 维度 | 权重 | 说明 |
|-----|------|------|
| 任务类型 | 40% | 登录→登录规则，支付→支付规则 |
| 关键词 | 30% | 任务描述中的关键词匹配 |
| 文件路径 | 20% | 涉及相同文件的规则优先 |
| 时间衰减 | 10% | 近期规则权重略高 |

#### 测试边界
| 测试点 | 验证内容 |
|-------|---------|
| 语义匹配 | 相似任务能匹配到相关规则 |
| 类型识别 | 正确识别任务类型 |
| 权重计算 | 排序结果符合预期 |
| 性能 | 1000 条规则内响应 < 100ms |

---

### 3. 执行历史和指标

#### task-history.json 结构
```json
{
  "executions": [
    {
      "taskId": "1",
      "taskTitle": "实现用户登录",
      "startedAt": "2024-01-15T10:00:00Z",
      "completedAt": "2024-01-15T10:25:00Z",
      "iterations": 3,
      "status": "done",
      "rulesApplied": ["rule-001", "rule-002"],
      "fixesReceived": 1
    }
  ]
}
```

#### metrics.json 结构
```json
{
  "totalTasks": 15,
  "completedTasks": 12,
  "successRate": 0.8,
  "avgIterationsPerTask": 2.5,
  "avgTimePerTask": "18m",
  "rulesCount": 8,
  "rulesAppliedCount": 45,
  "fixesCount": 5,
  "lastUpdated": "2024-01-15T15:00:00Z"
}
```

#### 指标计算
- 成功率 = 一次通过的任务 / 总任务
- 平均迭代数 = 总迭代次数 / 完成任务数
- 规则有效率 = 应用规则后一次通过 / 应用规则次数

---

### 4. 完成阶段集成

#### 触发条件
- Ralph Loop 输出 `<promise>ALL TASKS DONE</promise>` 后
- 所有任务状态为 done

#### 流程
1. **确认完成**
   ```
   🎉 所有任务已完成！

   完成统计:
   - 任务: 5/5
   - 迭代: 12 次
   - 修正: 2 次
   - 新规则: 2 条

   是否进入完成流程？
   [合并到主分支] [创建 PR] [稍后处理]
   ```

2. **执行完成操作**
   - 调用 superpowers:finishing-a-development-branch
   - 根据用户选择执行合并/PR/清理

#### 测试边界
| 测试点 | 验证内容 |
|-------|---------|
| 触发时机 | 仅在所有任务完成后触发 |
| 统计准确 | 完成统计数据正确 |
| 用户选择 | 三个选项都能正确执行 |
| 分支操作 | finishing 流程正确执行 |

---

### 5. /auto-dev:status 增强

#### 新增输出
```
📊 Auto-Dev 状态

分支: feature/user-auth-20240112
进度: 4/5 任务完成 (80%)

当前任务: #5 添加密码重置
状态: in-progress
迭代: 2

项目指标:
- 成功率: 75%
- 平均迭代: 2.3 次/任务
- 已应用规则: 12 次
- 累计修正: 3 次

最近验证:
✅ 测试通过 (18/18)
```

---

## 更新 plugin.json
```json
{
  "name": "auto-dev",
  "version": "0.4.0",
  "description": "自动化开发助手 - 快速迭代，持续学习",
  "commands": ["auto-dev", "fix", "status", "cancel"],
  "skills": ["execute-loop", "learn-from-fix", "apply-rules"],
  "mcp_dependencies": ["taskmaster-ai"]
}
```

---

## .autodev/ 完整结构
```
.autodev/
├── rules.md                # V0.2 - 业务规则
├── project-facts.json      # V0.4 - 项目事实
├── task-history.json       # V0.4 - 执行历史
└── metrics.json            # V0.4 - 成功率指标
```

---

## 依赖
- V0.3 所有组件
- superpowers:finishing-a-development-branch
