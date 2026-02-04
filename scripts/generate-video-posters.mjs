#!/usr/bin/env node
/**
 * Video Poster Generator Script
 *
 * Generates poster images (thumbnails) from video files for lazy loading optimization.
 * Run with: node scripts/generate-video-posters.mjs
 *
 * Prerequisites:
 * - ffmpeg must be installed on the system
 * - Run: brew install ffmpeg (macOS) or apt install ffmpeg (Linux)
 */

import { execSync } from 'child_process';
import { readdirSync, statSync, existsSync, mkdirSync } from 'fs';
import { join, extname, basename } from 'path';

const VIDEO_DIR = './public/videos';
const POSTER_DIR = './public/videos/posters';
const SUPPORTED_EXTENSIONS = ['.mp4', '.webm', '.mov'];

// Ensure poster directory exists
if (!existsSync(POSTER_DIR)) {
  mkdirSync(POSTER_DIR, { recursive: true });
  console.log(`Created poster directory: ${POSTER_DIR}`);
}

/**
 * Generate a poster image from a video file using ffmpeg
 */
function generatePoster(videoPath, outputPath) {
  try {
    // Extract frame at 1 second (or first frame if video is shorter)
    // -vf scale ensures consistent sizing while maintaining aspect ratio
    const cmd = `ffmpeg -i "${videoPath}" -ss 00:00:01 -vframes 1 -vf "scale=640:-1" -q:v 2 -y "${outputPath}"`;
    execSync(cmd, { stdio: 'pipe' });
    return true;
  } catch (error) {
    // Try extracting first frame if 1-second mark fails
    try {
      const cmd = `ffmpeg -i "${videoPath}" -vframes 1 -vf "scale=640:-1" -q:v 2 -y "${outputPath}"`;
      execSync(cmd, { stdio: 'pipe' });
      return true;
    } catch (e) {
      console.error(`  Failed to generate poster for: ${videoPath}`);
      return false;
    }
  }
}

/**
 * Recursively find all video files in a directory
 */
function findVideos(dir, videos = []) {
  const files = readdirSync(dir);

  for (const file of files) {
    const filePath = join(dir, file);
    const stat = statSync(filePath);

    if (stat.isDirectory() && file !== 'posters') {
      findVideos(filePath, videos);
    } else if (SUPPORTED_EXTENSIONS.includes(extname(file).toLowerCase())) {
      videos.push(filePath);
    }
  }

  return videos;
}

/**
 * Main function
 */
async function main() {
  console.log('🎬 Video Poster Generator\n');

  // Check if ffmpeg is installed
  try {
    execSync('ffmpeg -version', { stdio: 'pipe' });
  } catch (error) {
    console.error('❌ ffmpeg is not installed. Please install it first:');
    console.error('   macOS: brew install ffmpeg');
    console.error('   Linux: apt install ffmpeg');
    process.exit(1);
  }

  const videos = findVideos(VIDEO_DIR);
  console.log(`Found ${videos.length} video files\n`);

  let generated = 0;
  let skipped = 0;
  let failed = 0;

  for (const videoPath of videos) {
    const videoName = basename(videoPath, extname(videoPath));
    const relativePath = videoPath.replace(VIDEO_DIR + '/', '').replace(/\//g, '_');
    const posterName = relativePath.replace(extname(videoPath), '.jpg');
    const posterPath = join(POSTER_DIR, posterName);

    // Skip if poster already exists
    if (existsSync(posterPath)) {
      console.log(`⏭️  Skipped (exists): ${videoName}`);
      skipped++;
      continue;
    }

    process.stdout.write(`📸 Generating: ${videoName}...`);

    if (generatePoster(videoPath, posterPath)) {
      console.log(' ✅');
      generated++;
    } else {
      console.log(' ❌');
      failed++;
    }
  }

  console.log('\n📊 Summary:');
  console.log(`   Generated: ${generated}`);
  console.log(`   Skipped:   ${skipped}`);
  console.log(`   Failed:    ${failed}`);
  console.log(`   Total:     ${videos.length}`);

  // Generate a mapping file for use in the app
  const posterMap = {};
  const posterFiles = readdirSync(POSTER_DIR);

  for (const posterFile of posterFiles) {
    const videoName = posterFile.replace('.jpg', '').replace(/_/g, '/');
    posterMap[`/videos/${videoName}.mp4`] = `/videos/posters/${posterFile}`;
    posterMap[`/videos/${videoName}.webm`] = `/videos/posters/${posterFile}`;
    posterMap[`/videos/${videoName}.mov`] = `/videos/posters/${posterFile}`;
  }

  console.log('\n✨ Done! Posters are available in:', POSTER_DIR);
}

main().catch(console.error);
