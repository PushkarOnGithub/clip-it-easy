import { useState, useCallback } from "react";
import { VideoUrlInput } from "@/components/VideoUrlInput";
import { VideoPlayer } from "@/components/VideoPlayer";
import { TimelineEditor } from "@/components/TimelineEditor";
import { DownloadSection } from "@/components/DownloadSection";
import { extractVideoId, fetchVideoInfo } from "@/lib/youtube";
import { processVideoClip, downloadVideo } from "@/lib/videoApi";
import { useToast } from "@/hooks/use-toast";
import { Scissors, Sparkles, Zap, Shield, Clock } from "lucide-react";

const Index = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [videoId, setVideoId] = useState<string | null>(null);
  const [videoUrl, setVideoUrl] = useState<string>("");
  const [videoTitle, setVideoTitle] = useState<string>("");
  const [duration, setDuration] = useState(300);
  const [startTime, setStartTime] = useState(0);
  const [endTime, setEndTime] = useState(60);
  const [downloadStatus, setDownloadStatus] = useState<"idle" | "processing" | "ready" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string>();
  const [downloadUrl, setDownloadUrl] = useState<string>();

  const handleUrlSubmit = async (url: string) => {
    setIsLoading(true);
    setVideoId(null);
    setDownloadStatus("idle");
    setDownloadUrl(undefined);

    const id = extractVideoId(url);
    
    if (!id) {
      toast({
        title: "Invalid URL",
        description: "Please enter a valid YouTube video URL.",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    try {
      const info = await fetchVideoInfo(id);
      
      if (!info) {
        toast({
          title: "Video not found",
          description: "Could not load the video. Please check the URL.",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      setVideoId(id);
      setVideoUrl(url);
      setVideoTitle(info.title);
      setDuration(info.duration);
      setStartTime(0);
      setEndTime(Math.min(60, info.duration));

      toast({
        title: "Video loaded",
        description: "Use the timeline editor to select your clip.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load video information.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = useCallback(async () => {
    if (!videoId || !videoUrl) return;

    setDownloadStatus("processing");
    setErrorMessage(undefined);

    try {
      const result = await processVideoClip(videoUrl, startTime, endTime);

      if (result.error) {
        setDownloadStatus("error");
        setErrorMessage(result.details || result.error);
        toast({
          title: "Processing failed",
          description: result.error,
          variant: "destructive",
        });
        return;
      }

      if (result.success && result.downloadUrl) {
        setDownloadUrl(result.downloadUrl);
        setDownloadStatus("ready");
        toast({
          title: "Video ready!",
          description: "Click download to save your clip.",
        });
        
        // Trigger download
        const filename = `${videoTitle.replace(/[^a-zA-Z0-9]/g, '_')}_clip.mp4`;
        await downloadVideo(result.downloadUrl, filename);
      }
    } catch (error) {
      setDownloadStatus("error");
      setErrorMessage("An unexpected error occurred. Please try again.");
      toast({
        title: "Error",
        description: "Failed to process video.",
        variant: "destructive",
      });
    }
  }, [videoId, videoUrl, startTime, endTime, videoTitle, toast]);

  return (
    <div className="min-h-screen bg-background">
      {/* Background effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] gradient-glow opacity-50" />
        <div className="absolute bottom-0 right-0 w-[600px] h-[400px] gradient-glow opacity-30" />
      </div>

      <div className="relative z-10">
        {/* Header */}
        <header className="py-8 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-card/50 border border-border/50 mb-6 animate-fade-in">
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="text-sm text-muted-foreground">YouTube Video Clipper</span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-4 animate-fade-in">
              <span className="text-gradient">Clip</span> YouTube Videos
              <br />
              <span className="text-muted-foreground">in Seconds</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto animate-fade-in" style={{ animationDelay: "0.1s" }}>
              Paste a YouTube link, select your start and end times, and download the perfect clip.
            </p>
          </div>
        </header>

        {/* Main Content */}
        <main className="px-4 pb-16">
          <div className="max-w-4xl mx-auto space-y-8">
            {/* URL Input */}
            <section>
              <VideoUrlInput onSubmit={handleUrlSubmit} isLoading={isLoading} />
            </section>

            {/* Video Player & Editor */}
            {videoId && (
              <>
                {/* Video Title */}
                {videoTitle && (
                  <div className="flex items-center gap-3 animate-fade-in">
                    <Scissors className="h-5 w-5 text-primary" />
                    <h2 className="text-lg font-medium text-foreground truncate">
                      {videoTitle}
                    </h2>
                  </div>
                )}

                {/* Video Preview */}
                <section>
                  <VideoPlayer
                    videoId={videoId}
                    startTime={startTime}
                    endTime={endTime}
                  />
                </section>

                {/* Timeline Editor */}
                <section>
                  <TimelineEditor
                    duration={duration}
                    startTime={startTime}
                    endTime={endTime}
                    onStartChange={setStartTime}
                    onEndChange={setEndTime}
                  />
                </section>

                {/* Download Section */}
                <section>
                  <DownloadSection
                    videoId={videoId}
                    startTime={startTime}
                    endTime={endTime}
                    isProcessing={downloadStatus === "processing"}
                    onDownload={handleDownload}
                    status={downloadStatus}
                    errorMessage={errorMessage}
                  />
                </section>
              </>
            )}

            {/* Empty State */}
            {!videoId && !isLoading && (
              <div className="text-center py-16 animate-fade-in">
                <div className="w-20 h-20 mx-auto mb-6 rounded-2xl gradient-primary flex items-center justify-center shadow-glow">
                  <Scissors className="h-10 w-10 text-primary-foreground" />
                </div>
                <h3 className="text-xl font-medium text-foreground mb-2">
                  Ready to clip
                </h3>
                <p className="text-muted-foreground mb-12">
                  Paste a YouTube URL above to get started
                </p>

                {/* Features */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto">
                  <div className="p-6 rounded-xl bg-card/50 border border-border/50 text-left">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                      <Zap className="h-5 w-5 text-primary" />
                    </div>
                    <h4 className="font-medium text-foreground mb-2">Fast Processing</h4>
                    <p className="text-sm text-muted-foreground">
                      Get your clips ready in seconds with our optimized processing.
                    </p>
                  </div>
                  <div className="p-6 rounded-xl bg-card/50 border border-border/50 text-left">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                      <Clock className="h-5 w-5 text-primary" />
                    </div>
                    <h4 className="font-medium text-foreground mb-2">Precise Timing</h4>
                    <p className="text-sm text-muted-foreground">
                      Select exact start and end times with our intuitive timeline.
                    </p>
                  </div>
                  <div className="p-6 rounded-xl bg-card/50 border border-border/50 text-left">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                      <Shield className="h-5 w-5 text-primary" />
                    </div>
                    <h4 className="font-medium text-foreground mb-2">No Watermark</h4>
                    <p className="text-sm text-muted-foreground">
                      Download clean clips without any added watermarks.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>

        {/* Footer */}
        <footer className="py-8 px-4 border-t border-border/50">
          <div className="max-w-4xl mx-auto text-center">
            <p className="text-sm text-muted-foreground">
              Built with precision for content creators
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Index;
