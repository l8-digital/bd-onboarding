'use client';
import { useCallback, useState } from 'react';
import api from '@/lib/axios';
import { authApi } from '@/lib/urlApi';

export type UploadResult = {
  id?: string;
  path: string;         // caminho retornado pelo backend (ex.: "/documents/clients/....pdf")
  name?: string;
  mime?: string;
  size?: number;
  [k: string]: any;
};

export function useUploadDocument() {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const upload = useCallback(async (file: File): Promise<UploadResult> => {
    setUploading(true);
    setProgress(0);
    setError(null);

    const fd = new FormData();
    fd.append('file', file);

    const res = await api.post(
      `${authApi}//v1/client/documents/upload`,
      fd,
      {
        onUploadProgress: (evt) => {
          if (!evt.total) return;
          const pct = Math.round((evt.loaded * 100) / evt.total);
          setProgress(pct);
        },
      }
    );

    // Ajuste se o shape do backend for diferente
    const data = res?.data || {};
    const result: UploadResult = {
      id: data.id,
      path: data.path,
      name: data.original_name ?? file.name,
      mime: data.mime ?? file.type,
      size: data.size ?? file.size,
      ...data,
    };

    setUploading(false);
    return result;
  }, []);

  return { upload, uploading, progress, error, setError };
}
