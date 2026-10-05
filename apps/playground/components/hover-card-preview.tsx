"use client";

import { Avatar, AvatarFallback } from "@aazenc/ui/avatar";
import { Badge } from "@aazenc/ui/badge";
import { Button } from "@aazenc/ui/button";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@aazenc/ui/hover-card";
import { useTheme } from "@aazenc/themes";

const PEOPLE = [
  { name: "Adeeb Mirza", handle: "@adeeb", role: "Maintainer", online: true },
  { name: "Sana Qureshi", handle: "@sana", role: "Design", online: true },
  { name: "Vikram Rao", handle: "@vikram", role: "Platform", online: false },
];

function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("");
}

export function HoverCardPreview() {
  const { mode, toggleMode } = useTheme();

  return (
    <main className="mx-auto max-w-5xl px-6 py-12">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm text-muted-foreground">Component</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">
            Hover card
          </h1>
          <p className="mt-3 max-w-2xl text-muted-foreground">
            A preview that opens on hover and on focus. It stays open while the
            pointer is on the card, so the link inside it is actually clickable.
          </p>
        </div>
        <Button type="button" variant="outline" onClick={toggleMode}>
          {mode === "dark" ? "Light mode" : "Dark mode"}
        </Button>
      </div>

      <div className="mt-10 space-y-8">
        <section className="space-y-3">
          <h2 className="text-sm font-medium text-muted-foreground">
            A trigger that is already a link
          </h2>
          <div className="flex flex-wrap items-center gap-6">
            {PEOPLE.map((person) => (
              <HoverCard key={person.handle} openDelay={200} closeDelay={150}>
                <HoverCardTrigger
                  href="#"
                  onClick={(event) => event.preventDefault()}
                  className="rounded-full outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
                >
                  <Avatar size="lg">
                    <AvatarFallback>{initials(person.name)}</AvatarFallback>
                  </Avatar>
                </HoverCardTrigger>
                <HoverCardContent>
                  <div className="flex items-start gap-3">
                    <Avatar size="lg">
                      <AvatarFallback>{initials(person.name)}</AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="truncate font-medium">{person.name}</p>
                      <p className="truncate text-xs text-muted-foreground">
                        {person.handle}
                      </p>
                    </div>
                    {person.online ? (
                      <span className="ml-auto">
                        <Badge variant="soft">Online</Badge>
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-3 text-sm text-muted-foreground">
                    {person.role}
                  </p>
                  <div className="mt-4 grid">
                    <Button type="button" size="sm">
                      View profile
                    </Button>
                  </div>
                </HoverCardContent>
              </HoverCard>
            ))}
          </div>
          <p className="text-xs text-muted-foreground">
            Try it: rest on an avatar, then move down onto the card. The card
            survives the gap — that is the part Radix gets wrong.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-sm font-medium text-muted-foreground">
            By keyboard — tab onto a trigger
          </h2>
          <p className="text-xs text-muted-foreground">
            Focus opens the card with no delay, because tabbing onto a trigger
            is already the request. Tab again to walk into the card, and out
            again to dismiss it.
          </p>
          <HoverCard openDelay={200} closeDelay={150}>
            <HoverCardTrigger
              href="#"
              onClick={(event) => event.preventDefault()}
              className="rounded-[var(--radius)] border border-border bg-background px-3 py-1.5 text-sm shadow-xs outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
            >
              @adeeb
            </HoverCardTrigger>
            <HoverCardContent>
              <p className="font-medium">Adeeb Mirza</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Maintainer. Focus reaches the button inside this card, which it
                would not if the card were left as the primitive ships it.
              </p>
              <div className="mt-4 grid">
                <Button type="button" size="sm">
                  View profile
                </Button>
              </div>
            </HoverCardContent>
          </HoverCard>
        </section>

        <section className="space-y-3">
          <h2 className="text-sm font-medium text-muted-foreground">
            The slow default timing
          </h2>
          <p className="text-xs text-muted-foreground">
            Left at <code>openDelay</code> 700 and <code>closeDelay</code> 300,
            so a pointer crossing a row of triggers does not strobe the cards.
          </p>
          <HoverCard>
            <HoverCardTrigger
              href="#"
              onClick={(event) => event.preventDefault()}
              className="rounded-[var(--radius)] border border-border bg-background px-3 py-1.5 text-sm shadow-xs outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
            >
              Hover me
            </HoverCardTrigger>
            <HoverCardContent>
              <p className="text-sm">
                Same panel as the popover, at 320px instead of 288px — a person
                does not fit in a width sized for a short note.
              </p>
            </HoverCardContent>
          </HoverCard>
        </section>
      </div>
    </main>
  );
}
