import crypto from 'crypto';

/**
 * UUID v4 formatında benzersiz bir id oluşturur
 * uuid paketi sorun çıkardığı için native crypto kullanıyoruz
 */
export function generateUUID(): string {
  return crypto.randomUUID();
}

/**
 * Format a date as a readable string
 */
export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('tr-TR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

/**
 * Format an API fetch with credentials and JSON headers
 */
export function createApiRequest(method: string = 'GET', body?: any) {
  return {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include' as RequestCredentials,
    ...(body && { body: JSON.stringify(body) })
  };
}