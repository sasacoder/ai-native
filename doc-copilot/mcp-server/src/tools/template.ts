import { z } from "zod";
import * as yaml from "yaml";
import * as fs from "fs/promises";
import * as path from "path";

const BUILTIN_TEMPLATES_DIR = process.env.TEMPLATES_DIR || "./templates";
const USER_TEMPLATES_SUBDIR = ".ai-native/doc-copilot/templates";

export const listTemplatesSchema = z.object({
  project_path: z.string().describe("项目目录路径")
});

export async function listTemplates({ project_path }: z.infer<typeof listTemplatesSchema>) {
  const templates = new Map();

  // 1. 先加载内置模版
  const builtinFiles = await fs.readdir(BUILTIN_TEMPLATES_DIR).catch(() => [] as string[]);
  for (const file of builtinFiles) {
    if (file.endsWith(".yaml")) {
      const content = await fs.readFile(
        path.join(BUILTIN_TEMPLATES_DIR, file), "utf-8"
      );
      const config = yaml.parse(content);
      templates.set(config.id, {
        id: config.id,
        name: config.name,
        description: config.description,
        chapters_count: config.chapters.length,
        source: "builtin"
      });
    }
  }

  // 2. 再加载用户模版（覆盖同名内置模版）
  const userTemplatesDir = path.join(project_path, USER_TEMPLATES_SUBDIR);
  const userFiles = await fs.readdir(userTemplatesDir).catch(() => [] as string[]);
  for (const file of userFiles) {
    if (file.endsWith(".yaml")) {
      const content = await fs.readFile(
        path.join(userTemplatesDir, file), "utf-8"
      );
      const config = yaml.parse(content);
      templates.set(config.id, {
        id: config.id,
        name: config.name,
        description: config.description,
        chapters_count: config.chapters.length,
        source: "user"
      });
    }
  }

  return {
    content: [{
      type: "text" as const,
      text: JSON.stringify(Array.from(templates.values()), null, 2)
    }]
  };
}

export const loadTemplateSchema = z.object({
  template_id: z.string().describe("模版 ID"),
  project_path: z.string().describe("项目目录路径")
});

export async function loadTemplate({ template_id, project_path }: z.infer<typeof loadTemplateSchema>) {
  // 1. 先尝试用户模版
  const userPath = path.join(
    project_path, USER_TEMPLATES_SUBDIR, `${template_id}.yaml`
  );
  try {
    const content = await fs.readFile(userPath, "utf-8");
    return {
      content: [{
        type: "text" as const,
        text: JSON.stringify(yaml.parse(content), null, 2)
      }]
    };
  } catch {
    // 用户模版不存在，继续尝试内置模版
  }

  // 2. 回退到内置模版
  const builtinPath = path.join(BUILTIN_TEMPLATES_DIR, `${template_id}.yaml`);
  const content = await fs.readFile(builtinPath, "utf-8");
  return {
    content: [{
      type: "text" as const,
      text: JSON.stringify(yaml.parse(content), null, 2)
    }]
  };
}
