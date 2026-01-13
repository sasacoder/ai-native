import { z } from "zod";
import * as yaml from "yaml";
import * as fs from "fs/promises";
import * as path from "path";
const STATE_DIR = process.env.STATE_DIR || ".ai-native/doc-copilot";
const STATE_FILE = process.env.STATE_FILE || "state.yaml";
const ChapterSchema = z.object({
    name: z.string(),
    status: z.enum(["pending", "in_progress", "done"]),
    phase: z.enum(["brainstorming", "outlining", "writing"]).optional(),
    outline_confirmed: z.boolean().optional(),
    content: z.string().optional()
});
const StateSchema = z.object({
    template_id: z.string(),
    output: z.string(),
    chapters: z.array(ChapterSchema)
});
export const saveStateSchema = z.object({
    project_path: z.string().describe("项目目录路径"),
    state: StateSchema,
    render: z.boolean().optional().describe("是否同步渲染文档")
});
export async function saveState({ project_path, state, render }) {
    const stateDir = path.join(project_path, STATE_DIR);
    const statePath = path.join(stateDir, STATE_FILE);
    await fs.mkdir(stateDir, { recursive: true });
    const content = yaml.stringify({
        ...state,
        updated_at: new Date().toISOString()
    });
    await fs.writeFile(statePath, content);
    let outputPath = null;
    if (render) {
        outputPath = path.join(project_path, state.output);
        // 确保输出目录存在
        await fs.mkdir(path.dirname(outputPath), { recursive: true });
        const doc = state.chapters
            .filter(ch => ch.content)
            .map(ch => `## ${ch.name}\n\n${ch.content}`)
            .join("\n\n---\n\n");
        await fs.writeFile(outputPath, doc);
    }
    return {
        content: [{
                type: "text",
                text: JSON.stringify({ success: true, statePath, outputPath }, null, 2)
            }]
    };
}
export const loadStateSchema = z.object({
    project_path: z.string().describe("项目目录路径")
});
export async function loadState({ project_path }) {
    const statePath = path.join(project_path, STATE_DIR, STATE_FILE);
    try {
        const content = await fs.readFile(statePath, "utf-8");
        return {
            content: [{
                    type: "text",
                    text: JSON.stringify({ exists: true, state: yaml.parse(content) }, null, 2)
                }]
        };
    }
    catch {
        return {
            content: [{
                    type: "text",
                    text: JSON.stringify({ exists: false, state: null }, null, 2)
                }]
        };
    }
}
