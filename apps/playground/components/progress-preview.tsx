"use client";

import { Button } from "@aazenc/ui/button";
import { Progress } from "@aazenc/ui/progress";
import { Slider } from "@aazenc/ui/slider";
import { useTheme } from "@aazenc/themes";
import { useEffect, useState } from "react";

export function ProgressPreview() {
  const { mode, toggleMode } = useTheme();
  const [volume, setVolume] = useState([40]);
  const [upload, setUpload] = useState(0);

  useEffect(() => {
    const id = window.setInterval(() => {
      setUpload((current) => (current >= 100 ? 0 : Math.min(100, current + 16)));
    }, 800);
    return () => window.clearInterval(id);
  }, []);

  return (
    <main className="mx-auto max-w-5xl px-6 py-12">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm text-muted-foreground">Component</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">Progress</h1>
          <p className="mt-3 max-w-2xl text-muted-foreground">
            One track. The fill eases to the value. The slider uses the same track and adds a thumb.
          </p>
        </div>
        <Button type="button" variant="outline" onClick={toggleMode}>
          {mode === "dark" ? "Light mode" : "Dark mode"}
        </Button>
      </div>

      <div className="mt-10 flex max-w-md flex-col gap-8">
      <div className="flex flex-col gap-2">
        <p className="text-sm font-medium">Upload</p>
        <Progress value={upload} aria-label="Upload" />
        <p className="text-sm text-muted-foreground">{upload}%</p>
      </div>
      <div className="flex flex-col gap-2">
        <p className="text-sm font-medium">Volume</p>
        <Slider value={volume} onValueChange={setVolume} aria-label="Volume" />
        <p className="text-sm text-muted-foreground">Level: {volume[0]}</p>
      </div>
      </div>
    </main>
  );
}
