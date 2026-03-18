import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Uploads directory path
const UPLOADS_DIR = path.resolve(__dirname, '../../data/uploads');

// Ensure uploads directory exists
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

/**
 * Download an image from a URL and save it locally
 * @param {string} imageUrl - URL of the image to download
 * @returns {Promise<string|null>} - Local URL path or null if failed
 */
export async function downloadCover(imageUrl) {
  if (!imageUrl) return null;

  try {
    console.log(`[DownloadCover] Downloading: ${imageUrl}`);
    
    const response = await fetch(imageUrl);
    if (!response.ok) {
      console.error(`[DownloadCover] HTTP ${response.status} for ${imageUrl}`);
      return null;
    }

    // Get the image buffer
    const buffer = await response.arrayBuffer();
    const imageBuffer = Buffer.from(buffer);

    // Generate a unique filename using hash
    const hash = crypto.createHash('md5').update(imageUrl).digest('hex');
    const ext = path.extname(new URL(imageUrl).pathname) || '.jpg';
    const filename = `${hash}${ext}`;
    const filepath = path.join(UPLOADS_DIR, filename);

    // Save the file
    fs.writeFileSync(filepath, imageBuffer);
    console.log(`[DownloadCover] Saved to: ${filename}`);

    // Return the local URL path
    return `/uploads/${filename}`;
  } catch (err) {
    console.error(`[DownloadCover] Failed to download ${imageUrl}:`, err.message);
    return null;
  }
}
