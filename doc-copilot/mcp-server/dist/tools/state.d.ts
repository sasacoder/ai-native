import { z } from "zod";
export declare const saveStateSchema: z.ZodObject<{
    project_path: z.ZodString;
    state: z.ZodObject<{
        template_id: z.ZodString;
        output: z.ZodString;
        chapters: z.ZodArray<z.ZodObject<{
            name: z.ZodString;
            status: z.ZodEnum<["pending", "in_progress", "done"]>;
            phase: z.ZodOptional<z.ZodEnum<["brainstorming", "outlining", "writing"]>>;
            outline_confirmed: z.ZodOptional<z.ZodBoolean>;
            content: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            status: "pending" | "in_progress" | "done";
            name: string;
            phase?: "brainstorming" | "outlining" | "writing" | undefined;
            outline_confirmed?: boolean | undefined;
            content?: string | undefined;
        }, {
            status: "pending" | "in_progress" | "done";
            name: string;
            phase?: "brainstorming" | "outlining" | "writing" | undefined;
            outline_confirmed?: boolean | undefined;
            content?: string | undefined;
        }>, "many">;
    }, "strip", z.ZodTypeAny, {
        template_id: string;
        output: string;
        chapters: {
            status: "pending" | "in_progress" | "done";
            name: string;
            phase?: "brainstorming" | "outlining" | "writing" | undefined;
            outline_confirmed?: boolean | undefined;
            content?: string | undefined;
        }[];
    }, {
        template_id: string;
        output: string;
        chapters: {
            status: "pending" | "in_progress" | "done";
            name: string;
            phase?: "brainstorming" | "outlining" | "writing" | undefined;
            outline_confirmed?: boolean | undefined;
            content?: string | undefined;
        }[];
    }>;
    render: z.ZodOptional<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    project_path: string;
    state: {
        template_id: string;
        output: string;
        chapters: {
            status: "pending" | "in_progress" | "done";
            name: string;
            phase?: "brainstorming" | "outlining" | "writing" | undefined;
            outline_confirmed?: boolean | undefined;
            content?: string | undefined;
        }[];
    };
    render?: boolean | undefined;
}, {
    project_path: string;
    state: {
        template_id: string;
        output: string;
        chapters: {
            status: "pending" | "in_progress" | "done";
            name: string;
            phase?: "brainstorming" | "outlining" | "writing" | undefined;
            outline_confirmed?: boolean | undefined;
            content?: string | undefined;
        }[];
    };
    render?: boolean | undefined;
}>;
export declare function saveState({ project_path, state, render }: z.infer<typeof saveStateSchema>): Promise<{
    content: {
        type: "text";
        text: string;
    }[];
}>;
export declare const loadStateSchema: z.ZodObject<{
    project_path: z.ZodString;
}, "strip", z.ZodTypeAny, {
    project_path: string;
}, {
    project_path: string;
}>;
export declare function loadState({ project_path }: z.infer<typeof loadStateSchema>): Promise<{
    content: {
        type: "text";
        text: string;
    }[];
}>;
