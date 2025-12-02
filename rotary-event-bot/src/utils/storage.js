import fs from "fs";
import path from "path";

const DATA_DIR = "data";
const STORE_FILE = path.join(DATA_DIR, "store.json");

export function loadEvents() {
    if (!fs.existsSync(STORE_FILE)) {
        return [];
    }
    try {
        const data = fs.readFileSync(STORE_FILE, "utf8");
        return JSON.parse(data);
    } catch (error) {
        console.error("Error loading events:", error);
        return [];
    }
}

export function saveEvents(events) {
    try {
        if (!fs.existsSync(DATA_DIR)) {
            fs.mkdirSync(DATA_DIR);
        }
        fs.writeFileSync(STORE_FILE, JSON.stringify(events, null, 2));
    } catch (error) {
        console.error("Error saving events:", error);
    }
}
