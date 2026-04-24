'use client';

import { useMemo, useState } from 'react';

type UploadResponse = {
  ok?: boolean;
  images?: string[];
  error?: string;
};

type AdminImagePickerProps = {
  label: string;
  value?: string;
  values?: string[];
  multiple?: boolean;
  className?: string;
  onChange?: (value: string) => void;
  onChangeMany?: (values: string[]) => void;
};

function uniqueImages(values: string[]) {
  return Array.from(new Set(values.map((item) => item.trim()).filter(Boolean)));
}

export function AdminImagePicker({
  label,
  value = '',
  values = [],
  multiple = false,
  className = '',
  onChange,
  onChangeMany,
}: AdminImagePickerProps) {
  const [status, setStatus] = useState('');
  const [uploading, setUploading] = useState(false);

  const selected = useMemo(
    () => uniqueImages(multiple ? values : value ? [value] : []),
    [multiple, value, values],
  );

  function removeImage(image: string) {
    if (!multiple) {
      onChange?.('');
      return;
    }

    onChangeMany?.(selected.filter((item) => item !== image));
  }

  function clearSelection() {
    if (multiple) {
      onChangeMany?.([]);
    } else {
      onChange?.('');
    }
  }

  async function uploadImages(files: FileList | null) {
    if (!files?.length) {
      return;
    }

    setUploading(true);
    setStatus('');

    try {
      const form = new FormData();
      Array.from(files).forEach((file) => form.append('images', file));

      const response = await fetch('/api/admin/uploads', {
        method: 'POST',
        body: form,
      });
      const data = (await response.json()) as UploadResponse;

      if (!response.ok || !data.ok || !Array.isArray(data.images)) {
        throw new Error(data.error || 'Image upload failed.');
      }

      if (multiple) {
        onChangeMany?.(uniqueImages([...selected, ...data.images]));
      } else {
        onChange?.(data.images[0] || '');
      }
    } catch (error) {
      setStatus(
        error instanceof Error ? error.message : 'Image upload failed.',
      );
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className={`adminImagePicker ${className}`.trim()}>
      <div className="adminImagePicker__head">
        <span className="adminLabel">{label}</span>
        {selected.length ? (
          <button
            className="adminTextButton"
            type="button"
            onClick={clearSelection}
          >
            Clear
          </button>
        ) : null}
      </div>

      {selected.length ? (
        <div className="adminSelectedImages">
          {selected.map((image) => (
            <button
              className="adminSelectedImage"
              key={image}
              type="button"
              onClick={() => removeImage(image)}
              title="Remove image"
            >
              <img src={image} alt="" />
              <span>{image.split('/').pop()}</span>
            </button>
          ))}
        </div>
      ) : (
        <p className="adminImagePicker__empty">No image selected.</p>
      )}

      {status ? <p className="adminMuted">{status}</p> : null}

      <label className="adminUploadButton">
        {uploading
          ? 'Uploading...'
          : multiple
            ? 'Choose Images'
            : 'Choose Image'}
        <input
          type="file"
          accept="image/*"
          multiple={multiple}
          disabled={uploading}
          onChange={(event) => {
            void uploadImages(event.target.files);
            event.currentTarget.value = '';
          }}
        />
      </label>
    </div>
  );
}
