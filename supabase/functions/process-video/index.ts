import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ProcessRequest {
  url: string;
  startTime: number;
  endTime: number;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { url, startTime, endTime }: ProcessRequest = await req.json();

    console.log('Processing video request:', { url, startTime, endTime });

    if (!url) {
      return new Response(
        JSON.stringify({ error: 'URL is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Extract video ID from URL
    const videoIdMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/);
    const videoId = videoIdMatch ? videoIdMatch[1] : null;

    if (!videoId) {
      return new Response(
        JSON.stringify({ error: 'Invalid YouTube URL' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Video ID extracted:', videoId);

    // Use Cobalt API to get video download URL
    // Cobalt is a free, open-source service for downloading social media videos
    const cobaltResponse = await fetch('https://api.cobalt.tools/api/json', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url: `https://www.youtube.com/watch?v=${videoId}`,
        vCodec: 'h264',
        vQuality: '720',
        aFormat: 'mp3',
        isAudioOnly: false,
        isNoTTWatermark: true,
        isTTFullAudio: false,
        disableMetadata: false,
      }),
    });

    const cobaltData = await cobaltResponse.json();
    console.log('Cobalt API response:', cobaltData);

    if (cobaltData.status === 'error') {
      // If Cobalt fails, try alternative approach with yt-dlp API
      console.log('Cobalt failed, trying alternative...');
      
      // Try using a different free API service
      const altResponse = await fetch(`https://yt-download.org/api/json/mp4/${videoId}`);
      const altData = await altResponse.json();
      
      if (altData.formats && altData.formats.length > 0) {
        const bestFormat = altData.formats.find((f: any) => f.quality === '720p') || altData.formats[0];
        return new Response(
          JSON.stringify({
            success: true,
            downloadUrl: bestFormat.url,
            title: altData.title || 'YouTube Video',
            duration: altData.duration || 0,
            startTime,
            endTime,
            message: 'Video ready for download. Note: Clipping requires client-side processing.',
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      return new Response(
        JSON.stringify({ 
          error: 'Unable to process video. The video may be restricted or unavailable.',
          details: cobaltData.text || 'Unknown error'
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Success - return the download URL
    const downloadUrl = cobaltData.url || cobaltData.audio;
    
    if (!downloadUrl) {
      return new Response(
        JSON.stringify({ 
          error: 'No download URL available',
          details: 'The service could not generate a download link'
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        downloadUrl,
        startTime,
        endTime,
        message: 'Video URL generated successfully. Client-side clipping will be applied.',
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error processing video:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(
      JSON.stringify({ 
        error: 'Failed to process video',
        details: errorMessage 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
