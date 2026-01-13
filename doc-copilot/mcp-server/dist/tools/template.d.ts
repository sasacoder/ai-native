import { z } from "zod";
export declare const listTemplatesSchema: z.ZodObject<{
    project_path: z.ZodString;
}, "strip", z.ZodTypeAny, {
    project_path: string;
}, {
    project_path: string;
}>;
export declare function listTemplates({ project_path }: z.infer<typeof listTemplatesSchema>): Promise<{
    content: {
        type: "text";
        text: string;
    }[];
}>;
export declare const loadTemplateSchema: z.ZodObject<{
    template_id: z.ZodString;
    project_path: z.ZodString;
}, "strip", z.ZodTypeAny, {
    project_path: string;
    template_id: string;
}, {
    project_path: string;
    template_id: string;
}>;
export declare function loadTemplate({ template_id, project_path }: z.infer<typeof loadTemplateSchema>): Promise<{
    content: {
        type: "text";
        text: string;
    }[];
}>;
