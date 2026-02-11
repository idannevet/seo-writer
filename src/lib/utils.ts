import { type ClassValue, clsx } from "clsx"

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs)
}

export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-\u0590-\u05FF]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '')
    || `article-${Date.now()}`
}

export function countWords(text: string): number {
  const stripped = text.replace(/<[^>]*>/g, ' ').replace(/&[^;]+;/g, ' ')
  const words = stripped.split(/\s+/).filter(w => w.length > 0)
  return words.length
}

export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString('he-IL', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export function getStatusLabel(status: string): string {
  const map: Record<string, string> = {
    draft: 'טיוטה',
    generated: 'נוצר',
    edited: 'נערך',
    published: 'פורסם',
  }
  return map[status] || status
}

export function getStatusColor(status: string): string {
  const map: Record<string, string> = {
    draft: 'bg-[#333]',
    generated: 'bg-[#C8FF00]/80 !text-black',
    edited: 'bg-yellow-600',
    published: 'bg-[#C8FF00] !text-black',
  }
  return map[status] || 'bg-[#333]'
}
