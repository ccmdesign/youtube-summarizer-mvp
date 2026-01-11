export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

export function deslugify(slug: string, originalNames: string[]): string | undefined {
  return originalNames.find(name => slugify(name) === slug)
}
