export function appendUTMParams(url: string, params: Record<string, string>): string {
  try {
    const u = new URL(url)
    for (const [key, value] of Object.entries(params)) {
      u.searchParams.set(key, value)
    }
    return u.toString()
  } catch {
    return url
  }
}
