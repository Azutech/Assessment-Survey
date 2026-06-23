// export/helpers/compress-image.helper.ts
import sharp from 'sharp';
import axios from 'axios';

export interface CompressedImage {
  buffer: Buffer;
  originalSize: number;
  compressedSize: number;
}

export const qualityMap = {
  low: { width: 800, jpegQuality: 50 },
  medium: { width: 800, jpegQuality: 70 },
  high: { width: 800, jpegQuality: 85 },
};

export async function fetchImageBuffer(url: string): Promise<Buffer | null> {
  try {
    const response = await axios.get(url, { responseType: 'arraybuffer' });
    return Buffer.from(response.data);
  } catch {
    return null;
  }
}

export async function compressImage(
  url: string,
  quality: 'low' | 'medium' | 'high' = 'medium',
): Promise<CompressedImage | null> {
  const buffer = await fetchImageBuffer(url);
  if (!buffer) return null;

  const originalSize = buffer.length;
  const { width, jpegQuality } = qualityMap[quality];

  const compressed = await sharp(buffer)
    .resize({ width, withoutEnlargement: true })
    .jpeg({ quality: jpegQuality })
    .toBuffer();

  return {
    buffer: compressed,
    originalSize,
    compressedSize: compressed.length,
  };
}