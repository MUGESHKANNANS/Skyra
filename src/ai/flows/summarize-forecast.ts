'use server';

/**
 * @fileOverview This file defines a Genkit flow for summarizing the upcoming week's weather forecast.
 *
 * - summarizeForecast - A function that takes a detailed weather forecast as input and returns a summarized overview.
 * - SummarizeForecastInput - The input type for the summarizeForecast function, which includes the weather forecast data.
 * - SummarizeForecastOutput - The return type for the summarizeForecast function, which is a string containing the summarized forecast.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizeForecastInputSchema = z.object({
  forecast: z.string().describe('A detailed weather forecast for the upcoming week.'),
});
export type SummarizeForecastInput = z.infer<typeof SummarizeForecastInputSchema>;

const SummarizeForecastOutputSchema = z.object({
  summary: z.string().describe('A summarized overview of the weather forecast for the week.'),
});
export type SummarizeForecastOutput = z.infer<typeof SummarizeForecastOutputSchema>;

export async function summarizeForecast(input: SummarizeForecastInput): Promise<SummarizeForecastOutput> {
  return summarizeForecastFlow(input);
}

const summarizeForecastPrompt = ai.definePrompt({
  name: 'summarizeForecastPrompt',
  input: {schema: SummarizeForecastInputSchema},
  output: {schema: SummarizeForecastOutputSchema},
  prompt: `You are a helpful weather assistant. Please summarize the following weather forecast for the upcoming week in a concise and easy-to-understand manner:\n\n{{{forecast}}}`,
});

const summarizeForecastFlow = ai.defineFlow(
  {
    name: 'summarizeForecastFlow',
    inputSchema: SummarizeForecastInputSchema,
    outputSchema: SummarizeForecastOutputSchema,
  },
  async input => {
    const {output} = await summarizeForecastPrompt(input);
    return output!;
  }
);
