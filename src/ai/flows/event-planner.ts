'use server';
/**
 * @fileOverview An AI-powered event planner that provides weather-based recommendations.
 *
 * - getEventPlan - A function that handles the event planning process.
 * - EventPlannerInput - The input type for the getEventPlan function.
 * - EventPlannerOutput - The return type for the getEventPlan function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const EventPlannerInputSchema = z.object({
    date: z.string().describe("The selected date for the event in ISO format."),
    location: z.object({
        city: z.string(),
        country: z.string(),
    }).describe("The selected location for the event."),
    forecast: z.string().describe("The weather forecast for the selected date as a JSON string."),
    userNotes: z.string().optional().describe("Any personal notes or reminders from the user."),
});
export type EventPlannerInput = z.infer<typeof EventPlannerInputSchema>;

const EventPlannerOutputSchema = z.object({
    eventSuitability: z.object({
        recommendation: z.enum(['Indoor', 'Outdoor', 'Flexible']).describe("Recommendation for holding the event indoors or outdoors."),
        reasoning: z.string().describe("A brief explanation for the recommendation."),
        bestTimeSlot: z.enum(['Morning', 'Afternoon', 'Evening', 'Anytime']).describe("The best time slot for the event based on weather."),
    }).describe("Analysis of event suitability."),
    smartSuggestions: z.object({
        dressCode: z.string().describe("Suggestions for what to wear (e.g., umbrella, jacket, sunglasses)."),
        foodAndDrink: z.string().describe("Tips for food and drinks suitable for the weather."),
        travelMode: z.string().describe("Suggestion for the best mode of travel."),
    }).describe("Smart suggestions for the event."),
    backupOptions: z.object({
        alternativeDate: z.string().optional().describe("An alternative date suggestion if the weather is unfavorable."),
        venueType: z.string().describe("Recommendation for a suitable venue type (e.g., banquet hall, open ground)."),
    }).describe("Backup options in case of bad weather."),
    aiReminders: z.array(z.string()).describe("A list of AI-generated weather alerts and reminders for the user."),
});
export type EventPlannerOutput = z.infer<typeof EventPlannerOutputSchema>;

export async function getEventPlan(input: EventPlannerInput): Promise<EventPlannerOutput> {
    return eventPlannerFlow(input);
}

const eventPlannerPrompt = ai.definePrompt({
    name: 'eventPlannerPrompt',
    input: {schema: EventPlannerInputSchema},
    output: {schema: EventPlannerOutputSchema},
    prompt: `You are an expert Event Planner AI. Analyze the provided weather forecast for the user's selected date and location to create a detailed event plan. Use a friendly, helpful tone with emojis.

Event Details:
Date: {{{date}}}
Location: {{{location.city}}}, {{{location.country}}}
User Notes: {{#if userNotes}}{{{userNotes}}}{{else}}None{{/if}}

Weather Forecast:
{{{forecast}}}

Based on this data, provide the following:
- Event Suitability: Recommend if the event should be 'Indoor' or 'Outdoor', and suggest the 'best time slot'.
- Smart Suggestions: Give tips for 'dress code', 'food & drink', and 'travel mode'.
- Backup Options: If the weather looks bad, suggest an 'alternative date'. Always recommend a 'venue type'.
- AI Reminders: Create a list of weather-related reminders.

Structure your output precisely according to the provided JSON schema.
`,
});

const eventPlannerFlow = ai.defineFlow(
    {
        name: 'eventPlannerFlow',
        inputSchema: EventPlannerInputSchema,
        outputSchema: EventPlannerOutputSchema,
    },
    async input => {
        const {output} = await eventPlannerPrompt(input);
        return output!;
    }
);
