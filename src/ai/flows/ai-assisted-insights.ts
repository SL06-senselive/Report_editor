'use server';

/**
 * @fileOverview This file defines a Genkit flow for providing AI-assisted insights for the energy audit report.
 *
 * It analyzes the uploaded charts and entered data to suggest relevant insights for the report's conclusion section,
 * highlighting potential issues or areas of improvement.
 *
 * - `getAiAssistedInsights`: The main function to trigger the insight generation flow.
 * - `AiAssistedInsightsInput`:  The input type for the getAiAssistedInsights function, containing the report data and chart descriptions.
 * - `AiAssistedInsightsOutput`: The output type for the getAiAssistedInsights function, providing AI-generated insights.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AiAssistedInsightsInputSchema = z.object({
  reportData: z.string().describe('The current data entered in the energy audit report.'),
  chartDescriptions: z.string().describe('Descriptions of the uploaded charts in the report.'),
});
export type AiAssistedInsightsInput = z.infer<typeof AiAssistedInsightsInputSchema>;

const AiAssistedInsightsOutputSchema = z.object({
  insights: z.string().describe('AI-generated insights for the energy audit report conclusion section.'),
});
export type AiAssistedInsightsOutput = z.infer<typeof AiAssistedInsightsOutputSchema>;

export async function getAiAssistedInsights(input: AiAssistedInsightsInput): Promise<AiAssistedInsightsOutput> {
  return aiAssistedInsightsFlow(input);
}

const aiAssistedInsightsPrompt = ai.definePrompt({
  name: 'aiAssistedInsightsPrompt',
  input: {schema: AiAssistedInsightsInputSchema},
  output: {schema: AiAssistedInsightsOutputSchema},
  prompt: `You are an AI assistant that analyzes energy audit reports and provides insights for the conclusion section.
  Based on the report data: {{{reportData}}} and uploaded charts described as: {{{chartDescriptions}}},
  suggest relevant insights, highlighting potential issues or areas of improvement.
  Focus on actionable recommendations to improve energy efficiency and reduce costs. Return the insights in a concise and easy-to-understand manner.
  `,
});

const aiAssistedInsightsFlow = ai.defineFlow(
  {
    name: 'aiAssistedInsightsFlow',
    inputSchema: AiAssistedInsightsInputSchema,
    outputSchema: AiAssistedInsightsOutputSchema,
  },
  async input => {
    const {output} = await aiAssistedInsightsPrompt(input);
    return output!;
  }
);
