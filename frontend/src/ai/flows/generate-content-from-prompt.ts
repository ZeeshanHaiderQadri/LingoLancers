'use server';

/**
 * @fileOverview A content generation AI agent that generates articles, images, and videos based on a prompt.
 *
 * - generateContent - A function that handles the content generation process.
 * - GenerateContentInput - The input type for the generateContent function.
 * - GenerateContentOutput - The return type for the generateContent function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { MediaPart } from 'genkit/cohere';

const GenerateContentInputSchema = z.object({
  prompt: z.string().describe('The prompt to use to generate content.'),
});
export type GenerateContentInput = z.infer<typeof GenerateContentInputSchema>;

const GenerateContentOutputSchema = z.object({
  article: z.string().describe('The generated article.'),
  image: z.string().describe('The data URI of the generated image.'),
  video: z.string().describe('The data URI of the generated video.'),
});
export type GenerateContentOutput = z.infer<typeof GenerateContentOutputSchema>;

export async function generateContent(input: GenerateContentInput): Promise<GenerateContentOutput> {
  return generateContentFlow(input);
}

async function downloadVideo(video: MediaPart, apiKey: string | undefined): Promise<string> {
    const fetch = (await import('node-fetch')).default;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY environment variable not set.');
    }
    const videoDownloadResponse = await fetch(
      `${video.media!.url}&key=${apiKey}`
    );
    if (
      !videoDownloadResponse ||
      videoDownloadResponse.status !== 200 ||
      !videoDownloadResponse.body
    ) {
      throw new Error('Failed to fetch video');
    }
    
    const buffer = await videoDownloadResponse.buffer();
    return `data:video/mp4;base64,${buffer.toString('base64')}`;
}

const generateContentFlow = ai.defineFlow(
  {
    name: 'generateContentFlow',
    inputSchema: GenerateContentInputSchema,
    outputSchema: GenerateContentOutputSchema,
  },
  async input => {
    // Generate article and image in parallel first
    const [articleResult, imageResult] = await Promise.all([
      ai.generate({
        prompt: `Generate an article based on the following prompt:\n\n${input.prompt}`,
      }),
      ai.generate({
        model: 'googleai/imagen-4.0-fast-generate-001',
        prompt: input.prompt,
      }),
    ]);

    // Then, start the video generation, which is a long-running operation
    let { operation } = await ai.generate({
        model: 'googleai/veo-2.0-generate-001',
        prompt: input.prompt,
        config: {
          durationSeconds: 5,
          aspectRatio: '16:9',
        },
    });

    if (!operation) {
        throw new Error('Expected the model to return an operation');
    }

    // Wait for the video operation to complete
    while (!operation.done) {
        await new Promise(resolve => setTimeout(resolve, 5000)); // wait 5 seconds
        operation = await ai.checkOperation(operation);
    }
    
    if (operation.error) {
        throw new Error(`Failed to generate video: ${operation.error.message}`);
    }

    const videoMediaPart = operation.output?.message?.content.find(p => !!p.media);
    if (!videoMediaPart) {
        throw new Error('Failed to find the generated video in the operation result.');
    }
    
    const videoDataUri = await downloadVideo(videoMediaPart as MediaPart, process.env.GEMINI_API_KEY);

    return {
      article: articleResult.text,
      image: imageResult.media.url,
      video: videoDataUri,
    };
  }
);
