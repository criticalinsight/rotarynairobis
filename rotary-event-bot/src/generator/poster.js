import Jimp from "jimp";
import path from "path";

export async function createPoster(details, originalImagePath, outputDir) {
    try {
        const originalImage = await Jimp.read(originalImagePath);

        // Create a new white background image (1200x675)
        const width = 1200;
        const height = 675;
        const poster = new Jimp(width, height, 0xFFFFFFFF); // White

        // Resize original image to fit on the left
        // Target height = 635 (20px padding)
        const targetHeight = height - 40;
        const scaleFactor = targetHeight / originalImage.bitmap.height;
        const targetWidth = originalImage.bitmap.width * scaleFactor;

        originalImage.resize(targetWidth, targetHeight);

        // Composite original image
        poster.composite(originalImage, 20, 20);

        // Add Text
        const fontTitle = await Jimp.loadFont(Jimp.FONT_SANS_32_BLACK); // Jimp fonts are limited, using 32
        const fontBody = await Jimp.loadFont(Jimp.FONT_SANS_16_BLACK);

        const textX = targetWidth + 60;
        let textY = 80;

        poster.print(fontTitle, textX, textY, "Rotary Event");
        textY += 60;

        poster.print(fontBody, textX, textY, `Club: ${details.clubName || "N/A"}`);
        textY += 40;

        poster.print(fontBody, textX, textY, `Date: ${details.date || "N/A"}`);
        textY += 40;

        poster.print(fontBody, textX, textY, `Time: ${details.startTime || "?"} - ${details.endTime || "?"}`);
        textY += 40;

        poster.print(fontBody, textX, textY, `Venue: ${details.venue || "N/A"}`);
        textY += 40;

        if (details.speaker) {
            poster.print(fontBody, textX, textY, `Speaker: ${details.speaker}`);
            textY += 40;
        }

        // Save
        const filename = `poster_${Date.now()}.jpg`;
        const outputPath = path.join(outputDir, filename);

        await poster.writeAsync(outputPath);
        return outputPath;

    } catch (error) {
        console.error("Error creating poster:", error);
        return originalImagePath; // Fallback
    }
}
