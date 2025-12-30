import { useState, useRef, useEffect } from "react";
import { Slider } from "@/components/ui/slider";
import { Scissors, Clock } from "lucide-react";

interface TimelineEditorProps {
  duration: number;
  startTime: number;
  endTime: number;
  onStartChange: (time: number) => void;
  onEndChange: (time: number) => void;
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
}

export function TimelineEditor({
  duration,
  startTime,
  endTime,
  onStartChange,
  onEndChange,
}: TimelineEditorProps) {
  const clipDuration = endTime - startTime;

  return (
    <div className="w-full space-y-6 p-6 bg-card rounded-xl border border-border/50 shadow-card animate-slide-up">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-foreground">
          <Scissors className="h-5 w-5 text-primary" />
          <span className="font-medium">Timeline Editor</span>
        </div>
        <div className="flex items-center gap-2 text-muted-foreground font-mono text-sm">
          <Clock className="h-4 w-4" />
          <span>Clip: {formatTime(clipDuration)}</span>
        </div>
      </div>

      {/* Timeline Track */}
      <div className="space-y-4">
        {/* Visual Timeline */}
        <div className="relative h-16 bg-muted rounded-lg overflow-hidden">
          {/* Background grid */}
          <div className="absolute inset-0 opacity-20">
            {Array.from({ length: 20 }).map((_, i) => (
              <div
                key={i}
                className="absolute top-0 bottom-0 w-px bg-border"
                style={{ left: `${(i + 1) * 5}%` }}
              />
            ))}
          </div>
          
          {/* Selected range */}
          <div
            className="absolute top-0 bottom-0 bg-primary/30 border-x-2 border-primary transition-all duration-150"
            style={{
              left: `${(startTime / duration) * 100}%`,
              width: `${((endTime - startTime) / duration) * 100}%`,
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-primary/10 to-primary/20" />
          </div>

          {/* Start handle */}
          <div
            className="absolute top-0 bottom-0 w-1 bg-primary cursor-ew-resize transition-transform hover:scale-x-150"
            style={{ left: `${(startTime / duration) * 100}%` }}
          >
            <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-4 h-4 bg-primary rounded-full shadow-glow" />
          </div>

          {/* End handle */}
          <div
            className="absolute top-0 bottom-0 w-1 bg-primary cursor-ew-resize transition-transform hover:scale-x-150"
            style={{ left: `${(endTime / duration) * 100}%` }}
          >
            <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-4 h-4 bg-primary rounded-full shadow-glow" />
          </div>
        </div>

        {/* Time Labels */}
        <div className="flex justify-between text-xs text-muted-foreground font-mono">
          <span>{formatTime(0)}</span>
          <span>{formatTime(duration / 4)}</span>
          <span>{formatTime(duration / 2)}</span>
          <span>{formatTime((duration * 3) / 4)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      {/* Precise Controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Start Time Control */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-sm text-muted-foreground">Start Time</label>
            <span className="font-mono text-primary text-sm">{formatTime(startTime)}</span>
          </div>
          <Slider
            value={[startTime]}
            min={0}
            max={Math.max(0, endTime - 1)}
            step={1}
            onValueChange={([value]) => onStartChange(value)}
            className="cursor-pointer"
          />
        </div>

        {/* End Time Control */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-sm text-muted-foreground">End Time</label>
            <span className="font-mono text-primary text-sm">{formatTime(endTime)}</span>
          </div>
          <Slider
            value={[endTime]}
            min={startTime + 1}
            max={duration}
            step={1}
            onValueChange={([value]) => onEndChange(value)}
            className="cursor-pointer"
          />
        </div>
      </div>
    </div>
  );
}
