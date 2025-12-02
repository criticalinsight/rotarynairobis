import axios from "axios";
import fs from "fs";

async function fetchHtml() {
    try {
        const url = "https://greatfon.com/v/rotaryclubofwestlands";
        console.log(`Fetching ${url}...`);
        const { data } = await axios.get(url, {
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
            }
        });
        fs.writeFileSync("greatfon.html", data);
        console.log("Saved HTML to greatfon.html");
    } catch (error) {
        console.error("Error:", error.message);
    }
}

fetchHtml();
