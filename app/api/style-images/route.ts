import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// API route to get images for a specific style
// GET /api/style-images?style=cinematic
export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const style = searchParams.get('style');

    if (!style) {
        return NextResponse.json({ error: 'Style parameter required' }, { status: 400 });
    }

    // Convert style name to folder-safe name
    const folderName = style.toLowerCase().replace(/\s+/g, '-');
    const stylesDir = path.join(process.cwd(), 'public', 'styles', folderName);

    try {
        // Check if directory exists
        if (!fs.existsSync(stylesDir)) {
            return NextResponse.json({ images: [] });
        }

        // Read all image files from the directory
        const files = fs.readdirSync(stylesDir);
        const imageExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];

        const images = files
            .filter(file => imageExtensions.some(ext => file.toLowerCase().endsWith(ext)))
            .map(file => `/styles/${folderName}/${file}`);

        return NextResponse.json({ images });
    } catch (error) {
        console.error('Error reading style images:', error);
        return NextResponse.json({ images: [] });
    }
}
