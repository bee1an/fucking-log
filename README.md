# fucking-log

Git commit 记录自动生成工作报告的 CLI 工具。

## 安装

```bash
pnpm install
pnpm run build
```

## 使用

```bash
# 生成报告
node dist/index.js 10-01 12-31

# 多仓库
node dist/index.js 10-01 -r ~/project1 -r ~/project2

# 自定义 prompt
node dist/index.js 10-01 -p ./my-prompt.txt

# 只复制 prompt（不调用 AI）
node dist/index.js 10-01 --copy
```

## 参数

| 参数                       | 说明                       |
| -------------------------- | -------------------------- |
| `-c, --copy`               | 只复制 prompt 到剪贴板     |
| `-r, --repo <path>`        | 指定仓库路径（可多次使用） |
| `-k, --key <key>`          | 指定 API Key               |
| `-p, --prompt <path\|url>` | 自定义 prompt 模板         |
| `-h, --help`               | 显示帮助                   |

## 远程调用

```bash
curl -s https://your-app.vercel.app/fucking-log.js | node - 10-01
```

## Prompt 模板变量

- `{{startDate}}` - 开始日期
- `{{endDate}}` - 结束日期
- `{{commits}}` - Commit 记录

## License

MIT
