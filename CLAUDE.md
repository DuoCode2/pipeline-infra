# DuoCode Pipeline — Project Instructions

## Project Overview

DuoCode 自动化管道：发现马来西亚无网站商家 → AI 生成着陆页 → 质量门禁 → 批量部署 → WhatsApp 外展。

两层 Skill 架构：
- **Layer 1** (`layer1-pipeline/`): 工具链 + 流程 + 质量门禁
- **Layer 2** (`layer2-design/`): 渐进式前端设计系统 (7 行业)

## Quick Commands

```bash
# 测试
npm test                    # API keys + env + discover
npm run test:all            # 完整测试 (run-all.sh, 7 组)
npm run test:env            # 环境变量验证工具
npm run test:deploy         # deploy 类型安全
npm run build:check         # TypeScript 编译检查

# 评测
npm run eval:skills         # Skill 验证 (frontmatter/结构/引用/schema)
npm run eval:templates      # 模板完整性 (组件/行业覆盖/示例)
npm run eval:quality        # 质量指标 (Lighthouse/a11y/SEO)
npm run eval:all            # 全部评测 + JSON 报告

# Docker
cd n8n && docker compose up -d    # 启动 n8n
curl http://localhost:5678/healthz # 健康检查

# 发现
npm run discover -- --city "Kuala Lumpur" --category "restaurant" --limit 1
```

## Available CLI Tools

项目中可使用以下已安装的高效 CLI 工具：

| 工具 | 用途 | 示例 |
|------|------|------|
| `rg` (ripgrep) | 内容搜索 | `rg "requireEnv" packages/` |
| `fd` | 文件查找 | `fd SKILL.md .claude/skills/` |
| `bat` | 语法高亮查看 (aliased as `cat`) | `cat package.json` |
| `eza` | 增强 ls (aliased: `ls`, `ll`, `la`, `lt`) | `lt .claude/skills/` |
| `jq` | JSON 处理 | `cat eval/results/*.json \| jq .summary` |
| `xh` | HTTP 客户端 | `xh GET http://localhost:5678/healthz` |
| `tokei` | 代码统计 | `tokei packages/` |
| `delta` | Git diff 美化 | 自动作为 git pager |

## Architecture

```
src/
├── .claude/skills/
│   ├── layer1-pipeline/          # HOW to build
│   │   ├── generate/             # 核心生成流程
│   │   ├── prepare-assets/       # 资产预处理
│   │   ├── quality-gate/         # 三道门禁编排
│   │   ├── batch-orchestrator/   # 批量并行
│   │   ├── deploy/               # Vercel 部署
│   │   ├── discovery/            # Google Maps 发现
│   │   ├── quality/              # 11 个质量检查 skills
│   │   ├── toolchain/            # n8n, tailwind, favicon, sheets, svg
│   │   ├── standards/            # code-conventions, data-schema
│   │   ├── iterate-quality/      # Karpathy-style 迭代改进
│   │   └── outreach/             # WhatsApp 外展
│   ├── layer2-design/            # WHAT to build
│   │   ├── duocode-design/       # 核心设计系统 (渐进式披露)
│   │   │   ├── references/       # 行业设计指南 (7 个)
│   │   │   ├── schemas/          # 行业数据 schema (7+1 base)
│   │   │   ├── templates/        # 组件模板 (_shared + 行业)
│   │   │   └── examples/         # 示例输出
│   │   ├── brand-designer/       # 可选: 品牌设计
│   │   └── landing-page-generator/ # 可选: 高转化着陆页
│   └── skill-creator/            # Skill 评测框架
├── packages/
│   ├── assets/                   # 照片下载 + 色彩提取 + 图片优化
│   ├── deploy/                   # Vercel SDK 部署
│   ├── discover/                 # Google Maps 搜索
│   └── utils/                    # requireEnv 等工具
├── n8n/                          # Docker: n8n + Evolution API
├── eval/                         # 评测脚本
└── tests/                        # 测试套件
```

## Key Conventions

- **TypeScript strict mode** — 无 `any` 类型，用 `requireEnv()` 替代 `process.env.KEY!`
- **SKILL.md frontmatter** — 必须有 name, description, license, metadata.author, metadata.version
- **License** — 自建 skill 用 AGPL-3.0，第三方保留原 license
- **环境变量** — `.env` 被 gitignore，`.env.template` 只含占位符
- **分支命名** — 禁止包含 `claude` 关键字
- **Git 身份** — LiuWei / sunflowers0607@outlook.com

## Reference Docs (outside src/)

核心架构文档在 `../reference/`，按优先级：
1. `DuoCode-TwoLayer-Skill-Architecture.md` — 两层架构设计
2. `DuoCode-Final-Guide.md` — 最终实施指南
3. `DuoCode-Pipeline-Infra-Plan-v3.md` — 技术决策 + Roadmap
4. `DuoCode-Claude-n8n-Collaboration.md` — n8n 工作流详解
5. `AGENT-IMPLEMENTATION-PROMPT.md` — Agent 执行指令
