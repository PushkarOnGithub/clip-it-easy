import { supabase } from "@/integrations/supabase/client";

interface VideoProcessResponse {
  success?: boolean;
  downloadUrl?: string;
  title?: string;
  duration?: number;
  startTime?: number;
  endTime?: number;
  message?: string;
  error?: string;
  details?: string;
}

export async function processVideoClip(
  url: string,
  startTime: number,
  endTime: number
): Promise<VideoProcessResponse> {
  const { data, error } = await supabase.functions.invoke('process-video', {
    body: { url, startTime, endTime },
  });

  if (error) {
    console.error('Error invoking process-video:', error);
    return {
      error: 'Failed to connect to video processing service',
      details: error.message,
    };
  }

  return data as VideoProcessResponse;
}

export async function downloadVideo(downloadUrl: string, filename: string): Promise<void> {
  try {
    // Fetch the video file
    const response = await fetch(downloadUrl);
    
    if (!response.ok) {
      throw new Error(`Failed to download: ${response.statusText}`);
    }
    
    const blob = await response.blob();
    
    // Create download link
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Download error:', error);
    // If CORS blocks direct download, open in new tab
    window.open(downloadUrl, '_blank');
  }
}
