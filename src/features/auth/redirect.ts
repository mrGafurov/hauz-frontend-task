export function getSafeRedirect(value: string | undefined): string {
  if (!value || !value.startsWith('/') || value.startsWith('//')) {
    return '/'
  }

  try {
    const url = new URL(value, 'http://hauz.local')

    if (url.origin !== 'http://hauz.local') {
      return '/'
    }

    return `${url.pathname}${url.search}${url.hash}`
  } catch {
    return '/'
  }
}
