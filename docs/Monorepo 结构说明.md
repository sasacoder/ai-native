# Monorepo 结构说明

> 创建时间: 2026-01-05
> 标签: #architecture #git #monorepo

## 定义

**Monorepo**（Monolithic Repository）= 单一代码仓库管理多个项目/模块

## 结构对比

```
# Monorepo 结构
ai-native/
├── doc-copilot/        # 模块A
├── another-module/     # 模块B
└── shared/             # 共享代码

# Multi-repo 结构
repo-1: doc-copilot
repo-2: another-module
repo-3: shared
```

## 优缺点对比

| 对比项 | Monorepo | Multi-repo |
|--------|----------|------------|
| 代码共享 | 容易，同一仓库 | 需要发包/子模块 |
| 版本管理 | 统一版本 | 各自独立版本 |
| CI/CD | 一套流水线 | 各自配置 |
| 权限控制 | 粗粒度 | 细粒度 |
| 仓库大小 | 会变大 | 分散 |

## 知名案例

- Google
- Meta
- Uber

## 适用场景

- 多个相关模块需要统一管理
- 模块间有代码共享需求
- 希望统一版本和发布流程

## 相关链接

- [[Doc-Copilot Plugin 微型设计说明书 v1.1.0]]
