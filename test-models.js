require('dotenv').config();

async function listModels() {
    const key = process.env.GEMINI_API_KEY;
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${key}`);
    const data = await response.json();
    if (data.models) {
        console.log("AVAILABLE MODELS:");
        data.models.forEach(m => {
            if (m.name.includes('gemini')) {
                console.log(m.name);
            }
        });
    } else {
        console.log("Error:", data);
    }
}

listModels();
