'use server';

/**
 * @fileOverview Flow for automatically combining generated content (e.g., articles with images, videos with hashtags, titles, and descriptions).
 *
 * - automaticallyCombineContent - A function that handles the content combination process.
 * - AutomaticallyCombineContentInput - The input type for the automaticallyCombineContent function.
 * - AutomaticallyCombineContentOutput - The return type for the automaticallyCombineContent function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AutomaticallyCombineContentInputSchema = z.object({
  article: z.string().optional().describe('The generated article content.'),
  image: z.string().optional().describe('The generated image data URI.'),
  video: z.string().optional().describe('The generated video data URI.'),
  hashtags: z.string().optional().describe('Relevant hashtags for the content.'),
  title: z.string().optional().describe('The title for the content.'),
  description: z.string().optional().describe('The description for the content.'),
});
export type AutomaticallyCombineContentInput = z.infer<typeof AutomaticallyCombineContentInputSchema>;

const AutomaticallyCombineContentOutputSchema = z.object({
  combinedContent: z.string().describe('The combined content with article, image/video, hashtags, title, and description.'),
});
export type AutomaticallyCombineContentOutput = z.infer<typeof AutomaticallyCombineContentOutputSchema>;

export async function automaticallyCombineContent(input: AutomaticallyCombineContentInput): Promise<AutomaticallyCombineContentOutput> {
  return automaticallyCombineContentFlow(input);
}

const prompt = ai.definePrompt({
  name: 'automaticallyCombineContentPrompt',
  input: {schema: AutomaticallyCombineContentInputSchema},
  output: {schema: AutomaticallyCombineContentOutputSchema},
  prompt: `You are an expert content combiner. You take various pieces of content such as articles, images, videos, hashtags, titles, and descriptions and combine them into a single, coherent piece of content.

Combine the following content:

Article: {{{article}}}
Image: {{#if image}} {{media url=image}} {{else}} No image. {{/if}}
Video: {{#if video}} {{media url=video}} {{else}} No video. {{/if}}
Hashtags: {{{hashtags}}}
Title: {{{title}}}
Description: {{{description}}}`,
});

const automaticallyCombineContentFlow = ai.defineFlow(
  {
    name: 'automaticallyCombineContentFlow',
    inputSchema: AutomaticallyCombineContentInputSchema,
    outputSchema: AutomaticallyCombineContentOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
