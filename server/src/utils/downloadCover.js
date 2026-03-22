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
    
    // Add headers for Discogs and other external sites
    const headers = {
      'User-Agent': 'JewelBox-Music-Library/1.0 ( https://github.com/william/jewelbox-music-library )',
    };
    
    // Add Discogs authentication if this is a Discogs URL
    if (imageUrl.includes('discogs.com')) {
      const DISCOGS_KEY = process.env.DISCOGS_KEY;
      const DISCOGS_SECRET = process.env.DISCOGS_SECRET;
      if (DISCOGS_KEY && DISCOGS_SECRET) {
        headers['Authorization'] = `Discogs key=${DISCOGS_KEY}, secret=${DISCOGS_SECRET}`;
        console.log(`[DownloadCover] Using Discogs authentication for image`);
      }
    }
    
    const response = await fetch(imageUrl, { headers });
    if (!response.ok) {
      console.error(`[DownloadCover] HTTP ${response.status} for ${imageUrl}`);
      return null;
    }

    // Check content type
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.startsWith('image/')) {
      console.error(`[DownloadCover] Not an image: ${contentType} for ${imageUrl}`);
      return null;
    }

    // Get the image buffer
    const buffer = await response.arrayBuffer();
    const imageBuffer = Buffer.from(buffer);

    // Generate a unique filename using hash
    const hash = crypto.createHash('md5').update(imageUrl).digest('hex');
    
    // Better extension detection from content type
    let ext = '.jpg';
    if (contentType.includes('png')) ext = '.png';
    else if (contentType.includes('webp')) ext = '.webp';
    else if (contentType.includes('gif')) ext = '.gif';
    else ext = path.extname(new URL(imageUrl).pathname) || '.jpg';
    
    const fileHash = `${hash}${ext}`;
    const filePath = path.join(UPLOADS_DIR, fileHash);

    // Save the file
    fs.writeFileSync(filePath, imageBuffer);
    console.log(`[DownloadCover] Saved to: ${fileHash}`);

    // Return the local URL path
    return `/uploads/${fileHash}`;
  } catch (err) {
    console.error(`[DownloadCover] Failed to download ${imageUrl}:`, err.message);
    return null;
  }
}
