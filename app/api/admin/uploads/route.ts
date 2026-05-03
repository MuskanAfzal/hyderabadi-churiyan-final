import { randomUUID } from 'crypto';
import { NextResponse } from 'next/server';
import sharp from 'sharp';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const maxFileSize = 10 * 1024 * 1024;
const blockedMimeTypes = new Set(['image/svg+xml']);

function supabaseStorageConfig() {
  const url = String(
    process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  ).replace(/\/+$/, '');

  const key = String(process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim();

  const bucket = String(
    process.env.SUPABASE_STORAGE_BUCKET || 'store-images',
  ).trim();

  if (!url || !key || !bucket) return null;

  return { bucket, key, url };
}

async function ensurePublicBucket(config: {
  bucket: string;
  key: string;
  url: string;
}) {
  const supabase = createClient(config.url, config.key, {
    auth: {
      persistSession: false,
    },
  });

  const { data: bucket, error: getBucketError } =
    await supabase.storage.getBucket(config.bucket);

  if (getBucketError) {
    const { error: createBucketError } = await supabase.storage.createBucket(
      config.bucket,
      {
        allowedMimeTypes: ['image/webp'],
        fileSizeLimit: maxFileSize,
        public: true,
      },
    );

    if (createBucketError) {
      throw new Error(
        `Supabase Storage bucket "${config.bucket}" was not found and could not be created: ${createBucketError.message}`,
      );
    }

    return supabase;
  }

  if (!bucket.public) {
    const { error: updateBucketError } = await supabase.storage.updateBucket(
      config.bucket,
      {
        allowedMimeTypes: ['image/webp'],
        fileSizeLimit: maxFileSize,
        public: true,
      },
    );

    if (updateBucketError) {
      throw new Error(
        `Supabase Storage bucket "${config.bucket}" must be public for storefront images: ${updateBucketError.message}`,
      );
    }
  }

  return supabase;
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
            'Supabase Storage is not configured. Add SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, and SUPABASE_STORAGE_BUCKET.',
        },
        { status: 500 },
      );
    }

    const supabase = await ensurePublicBucket(supabaseStorage);

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

      const { error: uploadError } = await supabase.storage
        .from(supabaseStorage.bucket)
        .upload(objectPath, bytes, {
          cacheControl: '31536000',
          contentType: 'image/webp',
          upsert: true,
        });

      if (uploadError) {
        throw new Error(`Supabase upload failed: ${uploadError.message}`);
      }

      const { data } = supabase.storage
        .from(supabaseStorage.bucket)
        .getPublicUrl(objectPath);

      images.push(data.publicUrl);
    }

    return NextResponse.json({ ok: true, images });
  } catch (error) {
    console.error('UPLOAD ERROR:', error);

    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : 'Image upload failed.',
      },
      { status: 400 },
    );
  }
}
