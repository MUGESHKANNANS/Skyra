import { z } from 'zod';
import { ai } from '../genkit';

export const TransportInputSchema = z.object({
    origin: z.string(),
    destination: z.string(),
    travelMode: z.string() // 'DRIVE' or 'TRANSIT'
});

export const TransportOutputSchema = z.object({
    distanceText: z.string().describe("Human readable distance, e.g. '600 km'"),
    distanceMeters: z.number().describe("Distance in exact meters, e.g. 600000"),
    durationText: z.string().describe("Human readable time, e.g. '10 hrs 30 mins'"),
    durationSeconds: z.number().describe("Duration in exact seconds, e.g. 37800"),
    steps: z.array(z.object({
        instructions: z.string().describe("Step by step instructions. For DRIVE, keep it to 3-5 major highway transitions. For TRANSIT, list 3-5 major subway/bus stops."),
        distanceText: z.string(),
        durationText: z.string()
    }))
});

export const getTransportRoute = ai.defineFlow(
    {
        name: 'getTransportRoute',
        inputSchema: TransportInputSchema,
        outputSchema: TransportOutputSchema,
    },
    async (input) => {
        const prompt = `You are a highly accurate mapping routing engine. 
The user wants to travel from "${input.origin}" to "${input.destination}" via ${input.travelMode}.
Calculate the real-world distance and estimated travel time. 
For the steps, provide a strictly accurate sequence of major highway routes (for DRIVE) or public transport lines (for TRANSIT).
Ensure the distanceMeters and durationSeconds precisely match your text estimates (e.g. 1 km = 1000 meters, 1 hour = 3600 seconds).`;

        const { output } = await ai.generate({
            prompt: prompt,
            output: { schema: TransportOutputSchema }
        });
        
        return output!;
    }
);
