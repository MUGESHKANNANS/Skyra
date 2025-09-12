import { config } from 'dotenv';
config();

import '@/ai/flows/summarize-forecast.ts';
import '@/ai/flows/weather-recommendation.ts';
import '@/ai/flows/suggest-city.ts';
import '@/ai/flows/autocomplete-city.ts';
import '@/ai/flows/farming-recommendation.ts';
import '@/ai/flows/event-planner.ts';
