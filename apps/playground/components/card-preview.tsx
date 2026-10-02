"use client";

import { useState, type ReactNode } from "react";
import { Button } from "@aazenc/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@aazenc/ui/card";
import { useTheme } from "@aazenc/themes";

function TrendIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true" className="size-4">
      <path d="M4 16l5-5 3 3 8-8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M14 6h6v6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="mt-10">
      <h2 className="text-lg font-semibold">{title}</h2>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">{children}</div>
    </section>
  );
}

export function CardPreview() {
  const { mode, toggleMode } = useTheme();
  const [saved, setSaved] = useState(false);
  const [reply, setReply] = useState("");

  return (
    <main className="mx-auto max-w-5xl px-6 py-12">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm text-muted-foreground">Component</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">Card</h1>
          <p className="mt-3 max-w-2xl text-muted-foreground">
            Default, glass, or plain. Corners are standard or round. Padding is flush, compact, or comfortable.
          </p>
        </div>
        <Button type="button" variant="outline" onClick={toggleMode}>
          {mode === "dark" ? "Light mode" : "Dark mode"}
        </Button>
      </div>

      <Section title="Surfaces">
        <Card>
          <CardHeader>
            <CardTitle>Weekly brief</CardTitle>
            <CardDescription>The standard product panel.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm">Hairline border, soft shadow, 10px corners.</p>
          </CardContent>
        </Card>

        <div className="rounded-xl bg-muted/40 p-4">
          <Card variant="glass">
            <CardHeader layout="row">
              <CardTitle size="sm">
                <TrendIcon />
                Community
              </CardTitle>
              <Button type="button" variant="ghost" size="sm">
                Follow
              </Button>
            </CardHeader>
            <CardContent>
              <p className="text-sm">Frosted community surface.</p>
            </CardContent>
          </Card>
        </div>

        <Card variant="plain">
          <CardHeader>
            <CardTitle>Plain group</CardTitle>
            <CardDescription>No fill, border, or shadow.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm">Use this when the card is only a group.</p>
          </CardContent>
        </Card>
      </Section>

      <Section title="Product patterns">
        <Card padding="sm" radius="round">
          <CardHeader layout="row">
            <CardTitle size="sm">
              <TrendIcon />
              Trending
            </CardTitle>
            <Button type="button" variant="ghost" size="sm">
              See all
            </Button>
          </CardHeader>
          <CardContent gap="md">
            <p className="text-sm">Design systems</p>
            <p className="text-sm">Frontend roles</p>
            <p className="text-sm">Interview notes</p>
          </CardContent>
        </Card>

        <Card align="center">
          <CardHeader>
            <CardTitle>Welcome back</CardTitle>
            <CardDescription>Sign in to continue to your workspace.</CardDescription>
          </CardHeader>
          <CardContent gap="md">
            <Button type="button" width="full">
              Continue
            </Button>
          </CardContent>
          <CardFooter align="center">
            <Button type="button" variant="link">
              Create an account
            </Button>
          </CardFooter>
        </Card>

        <Card variant="plain" padding="sm">
          <CardContent gap="md">
            <CardTitle size="sm">Reply</CardTitle>
            <input
              value={reply}
              onChange={(event) => setReply(event.target.value)}
              placeholder="Write a reply"
              aria-label="Reply"
              className="h-9 w-full rounded-md border border-border bg-background px-3 text-sm"
            />
            <Button type="button" size="sm" disabled={reply.trim().length === 0}>
              Send
            </Button>
          </CardContent>
        </Card>

        <Card interactive padding="sm" onClick={() => setSaved((value) => !value)}>
          <CardHeader>
            <CardTitle size="sm">{saved ? "Saved" : "Save this item"}</CardTitle>
            <CardDescription>Click the card.</CardDescription>
          </CardHeader>
        </Card>
      </Section>

      <Section title="Flush content">
        <Card radius="round" padding="none">
          <div className="flex h-24 items-center justify-center bg-muted text-sm">
            Flush, 24px corners
          </div>
        </Card>
        <Card>
          <div className="h-16 bg-muted" />
          <CardContent>
            <p className="text-sm">The media sits flush. The text keeps its padding.</p>
          </CardContent>
        </Card>
      </Section>
    </main>
  );
}
