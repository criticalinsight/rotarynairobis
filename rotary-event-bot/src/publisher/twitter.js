import { Scraper } from "agent-twitter-client";
import fs from "fs";
import dotenv from "dotenv";

dotenv.config();

const scraper = new Scraper();

export async function loginToTwitter() {
    try {
        await scraper.login(
            process.env.TWITTER_USERNAME,
            process.env.TWITTER_PASSWORD,
            process.env.TWITTER_EMAIL
        );
        console.log("Logged in to Twitter successfully.");
        return true;
    } catch (error) {
        console.error("Failed to login to Twitter:", error);
        return false;
    }
}

export async function postDailyThread(events) {
    if (events.length === 0) return;

    const isLoggedIn = await loginToTwitter();
    if (!isLoggedIn) return;

    const today = new Date().toDateString();

    // 1. Intro Tweet
    const introText = `If you're interested in networking, professional development or community service here are some events you should attend today [${today}]`;

    try {
        let lastTweetId = await scraper.sendTweet(introText);
        console.log("Posted intro tweet:", lastTweetId);

        // 2. Event Tweets (Replies)
        for (const event of events) {
            const tweetText = `The Rotary Club of ${event.clubName} will be hosting ${event.speaker || "a guest"} to speak on ${event.topic || "an interesting topic"} at ${event.venue} from ${event.startTime} to ${event.endTime}. All are welcome`;

            const mediaData = fs.readFileSync(event.imagePath);

            // agent-twitter-client handles media upload internally in sendTweet usually, 
            // but if not, we might need to use a specific media upload method. 
            // Checking docs/types, sendTweet accepts (text, replyToTweetId, media[])
            // media item: { data: Buffer, mediaType: string }

            const media = [{
                data: mediaData,
                mediaType: "image/jpeg"
            }];

            lastTweetId = await scraper.sendTweet(tweetText, lastTweetId, media);
            console.log(`Posted event for ${event.clubName}:`, lastTweetId);

            // Small delay to be safe
            await new Promise(r => setTimeout(r, 2000));
        }
    } catch (error) {
        console.error("Error posting thread:", error);
    }
}
