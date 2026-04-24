import { randomUUID } from 'crypto';
import { NextResponse } from 'next/server';
import sharp from 'sharp';

export const dynamic = 'force-dynamic';

const maxFileSize = 10 * 1024 * 1024;
const blockedMimeTypes = new Set(['image/svg+xml']);

function supabaseStorageConfig() {
  const url = String(
    process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || '',
  ).replace(/\/+$/, '');

  const key = String(process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim();

  const bucket = String(
    process.env.SUPABASE_STORAGE_BUCKET || 'store-images',
  ).trim();

  if (!url || !key || !bucket) return null;

  return { bucket, key, url };
}

function safeName(name: string) {
  return (
    name
      .replace(/\.[^/.]+$/, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 60) || 'image'
  );
}

export async function POST(request: Request) {
  try {
    const supabaseStorage = supabaseStorageConfig();

    if (!supabaseStorage) {
      return NextResponse.json(
        {
          ok: false,
          error:
            'Supabase Storage is not configured. Add NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, and SUPABASE_STORAGE_BUCKET in Vercel.',
        },
        { status: 500 },
      );
    }

    const form = await request.formData();
    const files = form
      .getAll('images')
      .filter((entry): entry is File => entry instanceof File);

    if (!files.length) {
      return NextResponse.json(
        { ok: false, error: 'No images were selected.' },
        { status: 400 },
      );
    }

    const images: string[] = [];

    for (const file of files) {
      if (!file.type.startsWith('image/') || blockedMimeTypes.has(file.type)) {
        throw new Error(`${file.name} is not a supported image type.`);
      }

      if (file.size > maxFileSize) {
        throw new Error(`${file.name} is larger than 10MB.`);
      }

      const filename = `${randomUUID()}-${safeName(file.name)}.webp`;
      const objectPath = `dashboard/${filename}`;

      const bytes = await sharp(Buffer.from(await file.arrayBuffer()))
        .rotate()
        .webp({ quality: 86 })
        .toBuffer();

      const uploadUrl = `${supabaseStorage.url}/storage/v1/object/${supabaseStorage.bucket}/${objectPath}`;

      const uploadResponse = await fetch(uploadUrl, {
        method: 'POST',
        headers: {
          apikey: supabaseStorage.key,
          Authorization: `Bearer ${supabaseStorage.key}`,
          'Cache-Control': '31536000',
          'Content-Type': 'image/webp',
          'x-upsert': 'true',
        },
        body: bytes,
      });

      if (!uploadResponse.ok) {
        const text = await uploadResponse.text();
        throw new Error(`Supabase upload failed: ${text}`);
      }

      images.push(
        `${supabaseStorage.url}/storage/v1/object/public/${supabaseStorage.bucket}/${objectPath}`,
      );
    }

    return NextResponse.json({ ok: true, images });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : 'Image upload failed.',
      },
      { status: 400 },
    );
  }
}