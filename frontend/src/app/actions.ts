"use server";

import { generateContent } from "@/ai/flows/generate-content-from-prompt";
import { automaticallyCombineContent } from "@/ai/flows/automatically-combine-content";
import { adjustVideoSettings } from "@/ai/flows/dynamically-adjust-video-settings";
import { z } from "zod";

const generateContentSchema = z.object({
  prompt: z.string(),
});

export async function handleGenerateContent(formData: FormData) {
  try {
    const validatedData = generateContentSchema.parse({
      prompt: formData.get("prompt"),
    });
    const result = await generateContent({ prompt: validatedData.prompt });
    return result;
  } catch (error) {
    console.error("Error generating content:", error);
    if (error instanceof z.ZodError) {
      return { error: "Invalid input.", details: error.errors };
    }
    return { error: "An unexpected error occurred." };
  }
}

const adjustSettingsSchema = z.object({
  task: z.string(),
});

export async function handleAdjustVideoSettings(formData: FormData) {
    try {
        const validatedData = adjustSettingsSchema.parse({
            task: formData.get("task"),
        });
        const result = await adjustVideoSettings({ task: validatedData.task });
        return result;
    } catch (error) {
        console.error("Error adjusting video settings:", error);
        if (error instanceof z.ZodError) {
            return { error: "Invalid input.", details: error.errors };
        }
        return { error: "An unexpected error occurred." };
    }
}

const combineContentSchema = z.object({
    article: z.string().optional(),
    image: z.string().optional(),
    video: z.string().optional(),
});

export async function handleCombineContent(formData: FormData) {
    try {
        const validatedData = combineContentSchema.parse({
            article: formData.get("article") as string | undefined,
            image: formData.get("image") as string | undefined,
            video: formData.get("video") as string | undefined,
        });

        const result = await automaticallyCombineContent({
            article: validatedData.article,
            image: validatedData.image,
            video: validatedData.video,
            title: "AI Generated Content",
            hashtags: "#AI #ContentCreation #LingoLancers",
            description: "This content was automatically generated and combined by the LingoLancers AI."
        });

        return result;

    } catch (error) {
        console.error("Error combining content:", error);
        if (error instanceof z.ZodError) {
            return { error: "Invalid input.", details: error.errors };
        }
        return { error: "An unexpected error occurred." };
    }
}
