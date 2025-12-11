// Configuration constants
export const GLM_API_URL =
  'https://open.bigmodel.cn/api/paas/v4/chat/completions'
export const GLM_MODEL = 'glm-4.5-flash'

// Default prompt template (embedded)
export const DEFAULT_PROMPT = `你是一位专业的技术文档撰写专家。请根据以下 Git commit 记录，帮我生成一份季度/阶段性工作报告。

## 时间范围
{{startDate}} 至 {{endDate}}

## Commit 记录
\`\`\`
{{commits}}
\`\`\`

## 要求
- **分类整理**：将 commit 按功能模块或工作类型分类
- **提炼亮点**：总结本阶段的主要工作成果, 始终使用中文, 避免技术黑话
- **段落形式**：请用段落形式说明负责的工作

## 输出格式
请参照以下格式输出：
项目名：
（1）...
（2）...
（3）...`
