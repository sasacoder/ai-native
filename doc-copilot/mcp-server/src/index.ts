import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { listTemplates, listTemplatesSchema, loadTemplate, loadTemplateSchema } from "./tools/template.js";
import { saveState, saveStateSchema, loadState, loadStateSchema } from "./tools/state.js";

const server = new McpServer({
  name: "doc-copilot",
  version: "1.0.0"
});

// 注册工具
server.tool("list_templates", "列出所有可用的文档模版（内置 + 用户）", listTemplatesSchema.shape, listTemplates);
server.tool("load_template", "加载指定模版的完整配置（本地优先）", loadTemplateSchema.shape, loadTemplate);
server.tool("save_state", "保存文档编写进度状态，可选渲染文档", saveStateSchema.shape, saveState);
server.tool("load_state", "加载文档编写进度状态", loadStateSchema.shape, loadState);

// 启动服务
const transport = new StdioServerTransport();
await server.connect(transport);

console.error("Doc-Copilot MCP Server started");
