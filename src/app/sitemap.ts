import type { MetadataRoute } from 'next'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const url = (path: string): string => new URL(path, 'https://chat.mewis.me').toString()

  return [
    {
      url: url('/'),
      changeFrequency: 'monthly',
      priority: 1
    }
  ]
}
