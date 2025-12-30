import { useRef, useEffect } from "react";

interface VideoPlayerProps {
  videoId: string;
  startTime: number;
  endTime: number;
  onTimeUpdate?: (currentTime: number) => void;
}

export function VideoPlayer({ videoId, startTime, endTime }: VideoPlayerProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    // Update iframe src when start time changes
    if (iframeRef.current) {
      const newSrc = `https://www.youtube.com/embed/${videoId}?start=${Math.floor(startTime)}&end=${Math.floor(endTime)}&autoplay=0&rel=0&modestbranding=1`;
      if (iframeRef.current.src !== newSrc) {
        iframeRef.current.src = newSrc;
      }
    }
  }, [videoId, startTime, endTime]);

  return (
    <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-card border border-border/50 shadow-card animate-scale-in">
      <div className="absolute inset-0 gradient-glow pointer-events-none z-10 opacity-30" />
      <iframe
        ref={iframeRef}
        src={`https://www.youtube.com/embed/${videoId}?start=${Math.floor(startTime)}&end=${Math.floor(endTime)}&autoplay=0&rel=0&modestbranding=1`}
        title="YouTube video player"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        className="w-full h-full"
      />
    </div>
  );
}
