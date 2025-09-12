# **App Name**: Skyra

## Core Features:

- Location Search: Display a search bar where users can enter a city or location to fetch weather data. Auto-complete.
- Geolocation and Mapping: Fetch the user
Current location using the browser geolocation API. Display searched location on a map using the Google Maps API. Use key Capstone - AIzaSyCFMy0SuLfpifuScvFj7ntO8VemDPYCoi0
- Weather Data Display: Show current weather conditions, temperature, humidity, and wind speed fetched from the OpenWeatherAPI (key 419ebd68ac13a9e5ddd56f1aa2b55d83), alongside corresponding weather icons. Show forecast for next 5 days in a card-style UI.
- Recommendation System: Using generative AI, act as a tool that provides weather-related recommendations like "Carry an umbrella" based on the weather condition, integrating agriculture, dress, and transport advice based on a specific user profile.
- User Management: Implement a simple user profile system using local storage. Users can add 'members' and save individual preferences related to agriculture, dress, and transport, influencing the advice presented.
- Sidebar Navigation: Navigation tabs in a sidebar: Home, Members, Forecast, Suggestions. Home screen for brief weather summary.
- User Input & Location: Search bar for users to enter city or location.
- Weather Data Display: Show current weather (temperature, humidity, wind speed, condition – sunny, rainy, cloudy).Display weather icons matching the condition (e.g., ☀️ for sunny, 🌧️ for rainy).Show forecast for next 5 days (basic card-style UI).
- Recommendation System (Based on Weather): If rainy → show "Carry an umbrella, Wear waterproof dress, Transport caution." If sunny/hot → show "Wear light clothes, Stay hydrated, Use sunscreen."If cold → show "Wear warm clothes, Transport safe, Agriculture irrigation check."If cloudy → show "Mild weather, Plan outdoor activities carefully."If stormy → show "Avoid travel, Agriculture precaution, Emergency alerts."
- Agriculture & Lifestyle Suggestions: Based on weather, show suggestions for:Agriculture (e.g., "Rainy → irrigation needed" / "Sunny → good for harvesting").Dress (suggestion based on temperature & rain).Transport (safe/not safe depending on condition).
- User Management (Basic – No Backend): Simple "Add Members" option in frontend (localStorage based).Each member can save preferences (e.g., focus on Dress, Agriculture, or Transport).Weather advice shown based on selected member profile.

## Style Guidelines:

- Primary color: Dark slate gray (#29435c), similar to the app's background.
- Background color: Almost black (#121212).
- Accent color: Light blue (#ADD8E6) for highlighting interactive elements, similar to the weather icons.
- Body and headline font: 'Roboto', combining a geometric form with friendly curves, for headlines or body text.
- Use a set of modern, minimalist icons to represent various weather conditions and app features. Consistent and clear, offering instant visual cues for weather data.
- Modern responsive design with a card-based layout to display weather information clearly on different screen sizes. Ensure data is well-organized and easy to read.