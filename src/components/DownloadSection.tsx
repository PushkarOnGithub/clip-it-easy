import { Button } from "@/components/ui/button";
import { Download, Loader2, CheckCircle, AlertCircle } from "lucide-react";

interface DownloadSectionProps {
  videoId: string;
  startTime: number;
  endTime: number;
  isProcessing: boolean;
  onDownload: () => void;
  status: "idle" | "processing" | "ready" | "error";
  errorMessage?: string;
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

export function DownloadSection({
  startTime,
  endTime,
  isProcessing,
  onDownload,
  status,
  errorMessage,
}: DownloadSectionProps) {
  const clipDuration = endTime - startTime;

  return (
    <div className="w-full p-6 bg-card rounded-xl border border-border/50 shadow-card animate-slide-up">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Clip Info */}
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg gradient-primary flex items-center justify-center shadow-glow">
              <Download className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Ready to clip</p>
              <p className="font-mono text-foreground">
                {formatTime(startTime)} → {formatTime(endTime)}
                <span className="text-muted-foreground ml-2">
                  ({formatTime(clipDuration)})
                </span>
              </p>
            </div>
          </div>
        </div>

        {/* Download Button */}
        <div className="flex flex-col items-end gap-2">
          <Button
            variant="glow"
            size="lg"
            onClick={onDownload}
            disabled={isProcessing || status === "processing"}
            className="min-w-[180px]"
          >
            {status === "processing" ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Processing...
              </>
            ) : status === "ready" ? (
              <>
                <CheckCircle className="h-5 w-5" />
                Download Ready
              </>
            ) : (
              <>
                <Download className="h-5 w-5" />
                Download Clip
              </>
            )}
          </Button>

          {status === "error" && errorMessage && (
            <div className="flex items-center gap-2 text-destructive text-sm">
              <AlertCircle className="h-4 w-4" />
              <span>{errorMessage}</span>
            </div>
          )}
        </div>
      </div>

      {/* Processing Progress */}
      {status === "processing" && (
        <div className="mt-4 space-y-2">
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div className="h-full bg-primary animate-pulse-glow rounded-full w-2/3 transition-all duration-500" />
          </div>
          <p className="text-xs text-muted-foreground text-center">
            Processing your clip... This may take a moment.
          </p>
        </div>
      )}
    </div>
  );
}
