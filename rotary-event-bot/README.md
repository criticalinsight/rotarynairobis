# Rotary Event Bot

Automated bot to scrape Rotary Club events from Instagram, analyze them with Gemini, and post them to Twitter.

## Setup

1.  **Install Dependencies**:
    ```bash
    npm install
    ```

2.  **Configure Credentials**:
    Copy `.env.example` to `.env` and fill in your details:
    ```env
    TWITTER_USERNAME=...
    TWITTER_PASSWORD=...
    TWITTER_EMAIL=...
    GEMINI_API_KEY=...
    ```

3.  **Run Locally**:
    ```bash
    npm start
    ```

## GitHub Actions (Automation)

This repo includes a workflow in `.github/workflows/daily-bot.yml` that runs the bot every day at 6:00 AM EAT.

To enable it:
1.  Push this code to a GitHub repository.
2.  Go to **Settings > Secrets and variables > Actions**.
3.  Add the following Repository Secrets:
    - `TWITTER_USERNAME`
    - `TWITTER_PASSWORD`
    - `TWITTER_EMAIL`
    - `GEMINI_API_KEY`

## How it Works

1.  **Scrapes** the latest posts from 29 Nairobi Rotary Clubs on Instagram.
2.  **Analyzes** the posters using Google Gemini to extract Date, Time, Venue, etc.
3.  **Filters** events:
    - **Today**: Posted immediately to Twitter.
    - **Future**: Saved to `data/store.json` for later.
    - **Past**: Ignored.
4.  **Posts** a thread to Twitter with the event details and the original poster image.
