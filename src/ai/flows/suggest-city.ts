'use server';

/**
 * @fileOverview This file defines a Genkit flow for suggesting a correct city name
 * based on user input that might be misspelled.
 *
 * - suggestCity - A function that takes a user's input and returns a suggested city name.
 * - SuggestCityInput - The input type for the suggestCity function.
 * - SuggestCityOutput - The return type for the suggestCity function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestCityInputSchema = z.object({
  userInput: z.string().describe('The city name entered by the user, which might be misspelled.'),
});
export type SuggestCityInput = z.infer<typeof SuggestCityInputSchema>;

const SuggestCityOutputSchema = z.object({
  suggestedCity: z.string().describe('The corrected or suggested city name.'),
});
export type SuggestCityOutput = z.infer<typeof SuggestCityOutputSchema>;

export async function suggestCity(input: SuggestCityInput): Promise<SuggestCityOutput> {
  return suggestCityFlow(input);
}

const suggestCityPrompt = ai.definePrompt({
  name: 'suggestCityPrompt',
  input: {schema: SuggestCityInputSchema},
  output: {schema: SuggestCityOutputSchema},
  prompt: `You are an expert in geography. A user has entered a city name that might be misspelled. Please correct it to the most likely intended city name. If the input looks like a valid city name, return it as is.

User Input: {{{userInput}}}

Return only the corrected city name.`,
});

const suggestCityFlow = ai.defineFlow(
  {
    name: 'suggestCityFlow',
    inputSchema: SuggestCityInputSchema,
    outputSchema: SuggestCityOutputSchema,
  },
  async (input) => {
    const {output} = await suggestCityPrompt(input);
    return output!;
  }
);
