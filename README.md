# fucking-log

Git commit 记录自动生成工作报告的 CLI 工具。

## 远程调用

```bash
curl -sL https://fucking-log.vercel.app/index.js | node - 10-01
curl -sL https://fucking-log.vercel.app/index.js | node - 10-01 12-31
```

## 本地安装

```bash
pnpm install
pnpm run build
node dist/index.js 10-01 12-31
```

## 参数

| 参数                       | 说明                       |
| -------------------------- | -------------------------- |
| `-c, --copy`               | 只复制 prompt 到剪贴板     |
| `-r, --repo <path>`        | 指定仓库路径（可多次使用） |
| `-k, --key <key>`          | 指定 API Key               |
| `-p, --prompt <path\|url>` | 自定义 prompt 模板         |
| `-h, --help`               | 显示帮助                   |

## 示例

```bash
# 多仓库
node dist/index.js 10-01 -r ~/project1 -r ~/project2

# 自定义 prompt
node dist/index.js 10-01 -p ./my-prompt.txt
```

## Prompt 模板变量

- `{{startDate}}` - 开始日期
- `{{endDate}}` - 结束日期
- `{{commits}}` - Commit 记录

## 部署

部署到 Vercel 后，设置环境变量 `GLM_API_KEY`。

## License

MIT
