/* ============================================
   HTTP helper — session-based auth
   Laravel sets XSRF-TOKEN cookie on every web
   response; we read it and forward as header.
   ============================================ */

export interface ValidationErrors {
  [field: string]: string[];
}

export class ApiError extends Error {
  constructor(
    public status: number,
    public data: { message?: string; errors?: ValidationErrors }
  ) {
    super(data.message ?? 'Terjadi kesalahan pada server.');
    this.name = 'ApiError';
  }

  fieldError(field: string): string | undefined {
    return this.data.errors?.[field]?.[0];
  }
}

function getCsrf(): string {
  const match = document.cookie.match(/(?:^|;\s*)XSRF-TOKEN=([^;]+)/);
  return match ? decodeURIComponent(match[1]) : '';
}

export async function apiFetch<T>(
  url: string,
  options: RequestInit = {}
): Promise<T> {
  const isFormData = options.body instanceof FormData;
  const res = await fetch(url, {
    ...options,
    credentials: 'same-origin',
    headers: {
      ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
      'Accept': 'application/json',
      'X-XSRF-TOKEN': getCsrf(),
      ...(options.headers as Record<string, string>),
    },
  });

  if (res.status === 204) {
    return undefined as T;
  }

  let data: Record<string, unknown> = {};
  try {
    data = await res.json();
  } catch {
    throw new ApiError(res.status, { message: `Server mengembalikan respons bukan JSON (HTTP ${res.status}). Coba login ulang atau restart server.` });
  }

  if (!res.ok) {
    throw new ApiError(res.status, data as { message?: string; errors?: ValidationErrors });
  }

  return data as T;
}
