"use server";

import { getTransportRoute } from "@/ai/flows/transport-planner";

export async function calculateSmartRoute(origin: string, destination: string, travelMode: string) {
    try {
        const result = await getTransportRoute({ origin, destination, travelMode });
        return { success: true, data: result };
    } catch (error: any) {
        console.error("AI Routing Error:", error);
        return { success: false, error: error.message };
    }
}
