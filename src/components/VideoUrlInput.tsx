import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Link2, Loader2 } from "lucide-react";

interface VideoUrlInputProps {
  onSubmit: (url: string) => void;
  isLoading: boolean;
}

export function VideoUrlInput({ onSubmit, isLoading }: VideoUrlInputProps) {
  const [url, setUrl] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (url.trim()) {
      onSubmit(url.trim());
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full animate-fade-in">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">
            <Link2 className="h-5 w-5" />
          </div>
          <Input
            type="url"
            placeholder="Paste YouTube URL here..."
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="pl-12 h-14 text-base bg-card border-border/50 focus-visible:border-primary"
            disabled={isLoading}
          />
        </div>
        <Button
          type="submit"
          variant="glow"
          size="xl"
          disabled={!url.trim() || isLoading}
          className="min-w-[140px]"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              Loading...
            </>
          ) : (
            "Load Video"
          )}
        </Button>
      </div>
    </form>
  );
}
