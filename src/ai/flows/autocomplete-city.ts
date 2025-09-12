'use server';

/**
 * @fileOverview This file defines a Genkit flow for providing city name autocomplete suggestions.
 *
 * - autocompleteCity - A function that takes a partial user input and returns a list of city suggestions.
 * - AutocompleteCityInput - The input type for the autocompleteCity function.
 * - AutocompleteCityOutput - The return type for the autocompleteCity function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AutocompleteCityInputSchema = z.object({
  partialInput: z.string().describe('The partial city name entered by the user.'),
});
export type AutocompleteCityInput = z.infer<typeof AutocompleteCityInputSchema>;

const AutocompleteCityOutputSchema = z.object({
  suggestions: z.array(z.string()).describe('A list of city name suggestions.'),
});
export type AutocompleteCityOutput = z.infer<typeof AutocompleteCityOutputSchema>;

export async function autocompleteCity(input: AutocompleteCityInput): Promise<AutocompleteCityOutput> {
  return autocompleteCityFlow(input);
}

const autocompleteCityPrompt = ai.definePrompt({
  name: 'autocompleteCityPrompt',
  input: {schema: AutocompleteCityInputSchema},
  output: {schema: AutocompleteCityOutputSchema},
  prompt: `You are a geography expert. A user is typing a city name. Based on their partial input, provide a list of up to 5 likely city name completions. Only return city names.

User Input: {{{partialInput}}}

Return a list of suggested city names.`,
});

const autocompleteCityFlow = ai.defineFlow(
  {
    name: 'autocompleteCityFlow',
    inputSchema: AutocompleteCityInputSchema,
    outputSchema: AutocompleteCityOutputSchema,
  },
  async (input) => {
    if (!input.partialInput || input.partialInput.length < 3) {
        return { suggestions: [] };
    }
    const {output} = await autocompleteCityPrompt(input);
    return output!;
  }
);
