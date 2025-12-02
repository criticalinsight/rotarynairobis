import axios from "axios";
import * as cheerio from "cheerio";

export async function getLatestPosts(username) {
    try {
        console.log(`Fetching posts for ${username} via Greatfon...`);
        const url = `https://greatfon.com/v/${username}`;

        const { data } = await axios.get(url, {
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
            }
        });

        const $ = cheerio.load(data);
        const posts = [];

        // Select the post containers. 
        // Based on HTML: div.group.overflow-hidden.rounded-xl
        // We filter out ads which might share some classes but usually lack the image structure we want.
        $(".group.overflow-hidden.rounded-xl").each((i, el) => {
            if (posts.length >= 3) return false; // Limit to 3 posts

            const $el = $(el);
            const $img = $el.find("img");
            const imageUrl = $img.attr("src");
            const caption = $el.find("div.p-4 p").text().trim();

            if (imageUrl) {
                // Use the image filename as ID since there's no direct post link
                const id = imageUrl.split("/").pop().split(".")[0];

                posts.push({
                    id: id,
                    url: imageUrl,
                    caption: caption,
                    date: new Date().toISOString(), // Greatfon doesn't show date on grid, Gemini will extract it
                    username: username
                });
            }
        });

        return posts;
    } catch (error) {
        console.error(`Error fetching posts for ${username}:`, error.message);
        return [];
    }
}
