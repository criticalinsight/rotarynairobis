import axios from "axios";

const viewers = [
    "https://www.picuki.com/profile/rotaryclubofwestlands",
    "https://imginn.com/rotaryclubofwestlands/",
    "https://greatfon.com/v/rotaryclubofwestlands",
    "https://dumpoir.com/v/rotaryclubofwestlands",
    "https://instanavigation.com/user-profile/rotaryclubofwestlands"
];

async function testViewers() {
    for (const url of viewers) {
        try {
            console.log(`Testing ${url}...`);
            const response = await axios.get(url, {
                headers: {
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
                },
                timeout: 5000
            });
            console.log(`SUCCESS: ${url} - Status: ${response.status}`);
        } catch (error) {
            console.log(`FAILED: ${url} - ${error.message}`);
        }
    }
}

testViewers();
