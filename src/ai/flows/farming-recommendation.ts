'use server';
/**
 * @fileOverview An Agriculture & Weather Assistant AI.
 *
 * - getFarmingRecommendation - A function that handles the farming recommendation process.
 * - FarmingRecommendationInput - The input type for the getFarmingRecommendation function.
 * - FarmingRecommendationOutput - The return type for the getFarmingRecommendation function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const FarmingRecommendationInputSchema = z.object({
  weatherCondition: z.string().describe('The current weather condition (e.g., rainy, sunny, cloudy).'),
  temperature: z.number().describe('The current temperature in Celsius.'),
  humidity: z.number().describe('The current humidity percentage.'),
  windSpeed: z.number().describe('The current wind speed in km/h.'),
  rainChance: z.number().describe('The chance of rain in percentage.'),
  uvIndex: z.number().optional().describe('The UV index.'),
  forecast: z.string().describe('The upcoming 5-day weather forecast as a JSON string.'),
  location: z.object({
    city: z.string(),
    country: z.string(),
  }).describe('The user\'s location.'),
});
export type FarmingRecommendationInput = z.infer<typeof FarmingRecommendationInputSchema>;

const FarmingRecommendationOutputSchema = z.object({
    cropSuggestions: z.object({
        bestCrops: z.array(z.string()).describe("List of best crops to plant this week based on local climate."),
        alternativeOptions: z.string().describe("Alternative crop options if there is high risk.")
    }).describe("Suggestions for crops to grow."),
    irrigationTips: z.object({
        recommendation: z.string().describe("Recommendation for irrigation and watering."),
    }).describe("Irrigation and watering tips."),
    pestAlerts: z.object({
        alert: z.string().describe("Alert about potential pests based on current conditions."),
        remedy: z.string().describe("Suggested organic or local remedy for the pest alert."),
    }).describe("Alerts for pests and diseases."),
    weatherRiskAlerts: z.object({
        alert: z.string().describe("Alerts for extreme weather that may harm crops."),
    }).describe("Alerts for weather risks."),
    farmingCalendar: z.object({
        reminders: z.array(z.string()).describe("Reminders for sowing, fertilization, and harvesting."),
        rotationSuggestion: z.string().describe("Suggestion for crop rotation."),
    }).describe("Farming calendar with reminders and suggestions."),
    sustainabilityTips: z.object({
        tip: z.string().describe("A tip for sustainable farming practices."),
    }).describe("Tips for sustainability."),
});
export type FarmingRecommendationOutput = z.infer<typeof FarmingRecommendationOutputSchema>;


export async function getFarmingRecommendation(input: FarmingRecommendationInput): Promise<FarmingRecommendationOutput> {
  return farmingRecommendationFlow(input);
}

const farmingRecommendationPrompt = ai.definePrompt({
  name: 'farmingRecommendationPrompt',
  input: {schema: FarmingRecommendationInputSchema},
  output: {schema: FarmingRecommendationOutputSchema},
  prompt: `You are an expert Agriculture & Weather Assistant AI. Analyze the provided weather data for the user's location and give farming recommendations. Use simple, farmer-friendly language with emojis and bullet points.

Current Location: {{{location.city}}}, {{{location.country}}}

Current Weather:
Condition: {{{weatherCondition}}}
Temperature: {{{temperature}}}°C
Humidity: {{{humidity}}}%
Wind Speed: {{{windSpeed}}} km/h
Chance of Rain: {{{rainChance}}}%
{{#if uvIndex}}UV Index: {{{uvIndex}}}{{/if}}

5-Day Forecast:
{{{forecast}}}

Based on this data, provide the following:
- Recommended crops to grow this week.
- Short-term farming tips (irrigation needs, fertilizer guidance, pest risk alerts).
- Long-term crop cycle planning suggestions.
- Alert if extreme weather may harm crops (frost, drought, heavy rain, storm).
- Soil-friendly and sustainable farming practices.

Structure your output precisely according to the provided JSON schema.
`,
});

const farmingRecommendationFlow = ai.defineFlow(
  {
    name: 'farmingRecommendationFlow',
    inputSchema: FarmingRecommendationInputSchema,
    outputSchema: FarmingRecommendationOutputSchema,
  },
  async input => {
    const {output} = await farmingRecommendationPrompt(input);
    return output!;
  }
);
