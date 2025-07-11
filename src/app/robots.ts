import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*'
    },
    sitemap: 'https://chat.mewis.me/sitemap.xml'
  }
}
