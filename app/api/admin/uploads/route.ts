import { randomUUID } from 'crypto';
import { mkdir, writeFile } from 'fs/promises';
import path from 'path';
import { NextResponse } from 'next/server';
import sharp from 'sharp';

export const dynamic = 'force-dynamic';

const maxFileSize = 10 * 1024 * 1024;
const blockedMimeTypes = new Set(['image/svg+xml']);

function supabaseStorageConfig() {
  const url = String(process.env.SUPABASE_URL || '').replace(/\/+$/, '');
  const key = String(
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
      process.env.SUPABASE_ANON_KEY ||
      '',
  ).trim();
  const bucket = String(process.env.SUPABASE_STORAGE_BUCKET || '').trim();

  if (!url || !key || !bucket) return null;
  return { bucket, key, url };
}

function safeName(name: string) {
  return (
    path
      .basename(name, path.extname(name))
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 60) || 'image'
  );
}

export async function POST(request: Request) {
  try {
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

    const supabaseStorage = supabaseStorageConfig();
    const uploadDir = supabaseStorage
      ? ''
      : path.join(process.cwd(), 'public', 'uploads', 'dashboard');

    if (!supabaseStorage) {
      await mkdir(uploadDir, { recursive: true });
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

      if (supabaseStorage) {
        const uploadUrl = `${supabaseStorage.url}/storage/v1/object/${encodeURIComponent(supabaseStorage.bucket)}/${objectPath}`;
        const uploadResponse = await fetch(uploadUrl, {
          method: 'POST',
          headers: {
            apikey: supabaseStorage.key,
            Authorization: `Bearer ${supabaseStorage.key}`,
            'Cache-Control': '31536000',
            'Content-Type': 'image/webp',
            'x-upsert': 'true',
          },
          body: new Blob([new Uint8Array(bytes)], { type: 'image/webp' }),
        });

        if (!uploadResponse.ok) {
          throw new Error(`Supabase upload failed for ${file.name}.`);
        }

        images.push(
          `${supabaseStorage.url}/storage/v1/object/public/${encodeURIComponent(supabaseStorage.bucket)}/${objectPath}`,
        );
      } else {
        const diskPath = path.join(uploadDir, filename);
        await writeFile(diskPath, bytes);
        images.push(`/uploads/dashboard/${filename}`);
      }
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
