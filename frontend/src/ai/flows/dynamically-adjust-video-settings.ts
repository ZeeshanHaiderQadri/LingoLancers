'use server';
/**
 * @fileOverview A flow to dynamically adjust video settings based on the task.
 *
 * - adjustVideoSettings - A function that returns the appropriate video settings based on the task at hand.
 * - AdjustVideoSettingsInput - The input type for the adjustVideoSettings function.
 * - AdjustVideoSettingsOutput - The return type for the adjustVideoSettings function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AdjustVideoSettingsInputSchema = z.object({
  task: z.string().describe('The video-related task the user is trying to accomplish, e.g., create a youtube short, create a cinematic scene, etc.'),
  requestedSettings: z.array(z.string()).optional().describe("A list of settings the user has explicitly requested to see.  This may be empty."),
});
export type AdjustVideoSettingsInput = z.infer<typeof AdjustVideoSettingsInputSchema>;

const AdjustVideoSettingsOutputSchema = z.object({
  aspectRatio: z.string().optional().describe('The recommended aspect ratio for the video.'),
  frameRate: z.number().optional().describe('The recommended frame rate for the video.'),
  resolution: z.string().optional().describe('The recommended resolution for the video.'),
  bitrate: z.string().optional().describe('The recommended bitrate for the video.'),
  otherRelevantSettings: z.array(z.string()).describe('Other settings that might be relevant to the task.'),
});
export type AdjustVideoSettingsOutput = z.infer<typeof AdjustVideoSettingsOutputSchema>;

export async function adjustVideoSettings(input: AdjustVideoSettingsInput): Promise<AdjustVideoSettingsOutput> {
  return adjustVideoSettingsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'adjustVideoSettingsPrompt',
  input: {
    schema: AdjustVideoSettingsInputSchema,
  },
  output: {
    schema: AdjustVideoSettingsOutputSchema,
  },
  prompt: `You are an expert video engineer. Given the user's task, suggest appropriate video settings.

Task: {{{task}}}

If the user provided specific requestedSettings, you MUST include those in the output if relevant, but use your best judgement on their values.

Return otherRelevantSettings array with any other settings that are useful in conjuction with the other values.  Use your best judgment, but do not include settings that are obvious or commonly known.

Respond with JSON.`,
});

const adjustVideoSettingsFlow = ai.defineFlow(
  {
    name: 'adjustVideoSettingsFlow',
    inputSchema: AdjustVideoSettingsInputSchema,
    outputSchema: AdjustVideoSettingsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
