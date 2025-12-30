export function extractVideoId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/v\/)([^&\n?#]+)/,
    /^([a-zA-Z0-9_-]{11})$/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) {
      return match[1];
    }
  }

  return null;
}

export function isValidYouTubeUrl(url: string): boolean {
  return extractVideoId(url) !== null;
}

export function getYouTubeThumbnail(videoId: string, quality: 'default' | 'medium' | 'high' | 'maxres' = 'high'): string {
  const qualityMap = {
    default: 'default',
    medium: 'mqdefault',
    high: 'hqdefault',
    maxres: 'maxresdefault',
  };
  
  return `https://img.youtube.com/vi/${videoId}/${qualityMap[quality]}.jpg`;
}

// Simple duration fetch using oEmbed (doesn't give duration, but confirms video exists)
export async function fetchVideoInfo(videoId: string): Promise<{ title: string; duration: number } | null> {
  try {
    // Using noembed.com as a free proxy for YouTube oEmbed
    const response = await fetch(`https://noembed.com/embed?url=https://www.youtube.com/watch?v=${videoId}`);
    const data = await response.json();
    
    if (data.error) {
      return null;
    }

    // Since we can't get duration from oEmbed, we'll use a default
    // In a real app, you'd use the YouTube Data API or a backend service
    return {
      title: data.title || 'YouTube Video',
      duration: 300, // Default 5 minutes, will be updated when video loads
    };
  } catch (error) {
    console.error('Error fetching video info:', error);
    return null;
  }
}
