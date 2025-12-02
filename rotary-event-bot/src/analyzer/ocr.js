import { GoogleGenerativeAI } from "@google/generative-ai";
import fs from "fs";
import dotenv from "dotenv";

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function extractEventDetails(imagePath) {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-preview-09-2025", apiVersion: "v1beta" });

        const imageBuffer = fs.readFileSync(imagePath);
        const base64Image = imageBuffer.toString("base64");

        const prompt = `
      Analyze this Rotary Club event poster. Extract the following details into a JSON object:
      {
        "clubName": "Name of the Rotary Club hosting",
        "speaker": "Name of the speaker (if any)",
        "topic": "Topic of the event",
        "venue": "Location/Venue of the meeting",
        "date": "Date of the event in YYYY-MM-DD format (assume current year if not specified, today is ${new Date().toISOString().split('T')[0]})",
        "startTime": "Start time (e.g. 6:00 PM)",
        "endTime": "End time (e.g. 7:30 PM)"
      }
      If a field is missing, use null.
      Ensure the date is strictly YYYY-MM-DD.
      Return ONLY the JSON string, no markdown formatting.
    `;

        const result = await model.generateContent([
            prompt,
            {
                inlineData: {
                    data: base64Image,
                    mimeType: "image/jpeg", // Assume JPEG for now, can detect later
                },
            },
        ]);

        const response = await result.response;
        const text = response.text();

        // Clean up markdown if present
        const jsonString = text.replace(/```json/g, "").replace(/```/g, "").trim();

        return JSON.parse(jsonString);
    } catch (error) {
        console.error("Error extracting details with Gemini:", error);
        return null;
    }
}
