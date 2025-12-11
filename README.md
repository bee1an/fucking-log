# fucking-log

Git commit 记录自动生成工作报告的 CLI 工具。

## 快速开始

```bash
# 默认：季度报告 + 简洁风格
curl -sL https://fucking-log.vercel.app/index.js | node -

# 指定时间范围
curl -sL https://fucking-log.vercel.app/index.js | node - 10-01 12-31

# 周报
curl -sL https://fucking-log.vercel.app/index.js | node - --period=week

# 周报 + 整活风格
curl -sL https://fucking-log.vercel.app/index.js | node - --period=week --persona=meme

# 多仓库
curl -sL https://fucking-log.vercel.app/index.js | node - --period=quarter -r ~/project1 -r ~/project2
```

## 参数

| 参数                       | 说明                                                       |
| -------------------------- | ---------------------------------------------------------- |
| `-c, --copy`               | 只复制 prompt 到剪贴板（跳过 AI 生成）                     |
| `-r, --repo <path>`        | 指定仓库路径（可多次使用）                                 |
| `-k, --key <key>`          | 指定 API Key                                               |
| `-p, --prompt <path\|url>` | 自定义 prompt 模板                                         |
| `-h, --help`               | 显示帮助                                                   |
| `--period=<period>`        | 周期模式：day, week, month, quarter, year（默认：quarter） |
| `--persona=<persona>`      | 写作风格（默认：brief）                                    |

## 写作风格 (Persona)

| 风格     | 说明                   |
| -------- | ---------------------- |
| `brief`  | 极简干练（默认）       |
| `formal` | 正式专业，适合汇报领导 |
| `tech`   | 技术细节导向           |
| `chill`  | 轻松随意               |
| `meme`   | 整活模式，充满梗       |
| `grind`  | 卷王模式，强调工作量   |
| `slack`  | 摸鱼模式，轻描淡写     |
| `poet`   | 诗人气质               |
| `edgy`   | 中二模式               |
| `legacy` | 文言文风格             |

## Prompt 模板变量

- `{{startDate}}` - 开始日期
- `{{endDate}}` - 结束日期
- `{{commits}}` - Commit 记录

## 部署

部署到 Vercel 后，设置环境变量 `GLM_API_KEY`。

## License

MIT
