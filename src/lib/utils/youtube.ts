const YOUTUBE_PATTERNS = [
  /(?:youtube\.com\/watch\?v=)([\w-]+)/,
  /(?:youtu\.be\/)([\w-]+)/,
  /(?:youtube\.com\/embed\/)([\w-]+)/,
  /(?:youtube\.com\/v\/)([\w-]+)/,
]

export function parseVideoId(url: string): string | null {
  for (const pattern of YOUTUBE_PATTERNS) {
    const match = url.match(pattern)
    if (match?.[1]) return match[1]
  }
  return null
}

export function getThumbnailUrl(videoId: string): string {
  return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`
}

export function getEmbedUrl(videoId: string): string {
  return `https://www.youtube.com/embed/${videoId}`
}

export function extractYoutubeInfo(url: string) {
  const videoId = parseVideoId(url)
  if (!videoId) return null
  return {
    videoId,
    thumbnailUrl: getThumbnailUrl(videoId),
    embedUrl: getEmbedUrl(videoId),
  }
}
