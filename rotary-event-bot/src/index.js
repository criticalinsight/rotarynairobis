import { clubs } from "./data/clubs.js";
import { getLatestPosts } from "./fetcher/instagram.js";
import { extractEventDetails } from "./analyzer/ocr.js";
import { createPoster } from "./generator/poster.js";
import { postDailyThread } from "./publisher/twitter.js";
import { loadEvents, saveEvents } from "./utils/storage.js";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";


dotenv.config();

const TEMP_DIR = "temp";
const OUTPUT_DIR = "output";

if (!fs.existsSync(TEMP_DIR)) fs.mkdirSync(TEMP_DIR);
if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR);

async function downloadImage(url, filepath) {
    // instagram-url-direct might return a list of links, we need to fetch the actual file
    // For simplicity, let's assume we get a direct URL or use fetch
    const response = await fetch(url);
    const buffer = await response.arrayBuffer();
    fs.writeFileSync(filepath, Buffer.from(buffer));
}

async function main() {
    console.log("Starting Rotary Event Bot...");

    // 1. Load Future Events
    let futureEvents = loadEvents();
    const today = new Date().toISOString().split('T')[0];

    const eventsToTweet = [];
    const newFutureEvents = [];

    // Check stored future events first
    console.log(`Checking ${futureEvents.length} stored future events...`);
    for (const event of futureEvents) {
        if (event.date === today) {
            eventsToTweet.push(event);
        } else if (event.date > today) {
            newFutureEvents.push(event);
        }
        // Past events are dropped
    }

    // 2. Scrape New Posts
    console.log("Scraping Instagram...");
    for (const club of clubs) {
        const posts = await getLatestPosts(club.username);

        for (const post of posts) {
            // Check if we already processed this post (simple check by ID in futureEvents or just processed list)
            // For now, we rely on date filtering.

            const imagePath = path.join(TEMP_DIR, `${post.id}.jpg`);

            // Download image
            try {
                // Note: getLatestPosts returns a URL. We need to download it.
                // If the URL is expired (Instagram links expire), we might need to refresh or use the library's download.
                // For this demo, we assume the URL is fresh.
                await downloadImage(post.url, imagePath);
            } catch (e) {
                console.error(`Failed to download image for ${club.name}:`, e);
                continue;
            }

            // 3. Analyze
            const details = await extractEventDetails(imagePath);

            if (details && details.date) {
                // Normalize date just in case
                // details.date should be YYYY-MM-DD from Gemini

                const eventData = {
                    ...details,
                    clubName: club.name, // Use our canonical name
                    originalImage: post.url,
                    imagePath: imagePath // We keep the local path for posting
                };

                if (details.date === today) {
                    // Check if already in queue to avoid duplicates
                    if (!eventsToTweet.find(e => e.clubName === club.name && e.topic === details.topic)) {
                        eventsToTweet.push(eventData);
                    }
                } else if (details.date > today) {
                    if (!newFutureEvents.find(e => e.clubName === club.name && e.date === details.date)) {
                        newFutureEvents.push(eventData);
                    }
                }
            }
        }
    }

    // 4. Publish
    console.log(`Found ${eventsToTweet.length} events for today.`);
    if (eventsToTweet.length > 0) {
        await postDailyThread(eventsToTweet);
    }

    // 5. Save Future Events
    console.log(`Saving ${newFutureEvents.length} future events.`);
    saveEvents(newFutureEvents);

    console.log("Done.");
}

main().catch(console.error);
