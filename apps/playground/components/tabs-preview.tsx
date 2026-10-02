"use client";

import { useState, type ReactNode } from "react";
import { Button } from "@aazenc/ui/button";
import { Tabs, TabsContent, TabsItemsList, TabsList, TabsTrigger, type TabsItem } from "@aazenc/ui/tabs";
import { useTheme } from "@aazenc/themes";

function Icon({ children }: { children: ReactNode }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true" className="size-3.5">
      {children}
    </svg>
  );
}

function CompassIcon(props: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true" className={props.className}>
      <circle cx="12" cy="12" r="9" />
      <path d="m15.5 8.5-2 6-6 2 2-6z" strokeLinejoin="round" />
    </svg>
  );
}

function PeopleIcon(props: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true" className={props.className}>
      <circle cx="9" cy="8" r="3" />
      <path d="M3 19c.6-2.8 2.8-4 6-4s5.4 1.2 6 4" strokeLinecap="round" />
      <circle cx="17" cy="9" r="2" />
      <path d="M16 15c2.2.3 3.6 1.4 4.2 4" strokeLinecap="round" />
    </svg>
  );
}

function JobsIcon(props: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true" className={props.className}>
      <rect x="3" y="7" width="18" height="13" rx="2" />
      <path d="M8 7V5h8v2" strokeLinecap="round" />
    </svg>
  );
}

const companyItems: TabsItem[] = [
  { value: "overview", label: "Overview", icon: CompassIcon },
  { value: "people", label: "People", icon: PeopleIcon, badge: 48 },
  { value: "jobs", label: "Jobs", icon: JobsIcon, badge: 6 },
  { value: "updates", label: "Updates" },
  { value: "analytics", label: "Analytics" },
  { value: "archive", label: "Archive", disabled: true },
];

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="mt-10">
      <h2 className="text-lg font-semibold">{title}</h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}

export function TabsPreview() {
  const { mode, toggleMode } = useTheme();
  const [section, setSection] = useState("posts");
  const [company, setCompany] = useState("people");

  return (
    <main className="mx-auto max-w-5xl px-6 py-12">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm text-muted-foreground">Component</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">Tabs</h1>
          <p className="mt-3 max-w-2xl text-muted-foreground">
            Underline or pill. The active mark uses the primary color. Icons and counts belong on the tab.
          </p>
        </div>
        <Button type="button" variant="outline" onClick={toggleMode}>
          {mode === "dark" ? "Light mode" : "Dark mode"}
        </Button>
      </div>

      <Section title="Underline">
        <Tabs value={section} onValueChange={setSection}>
          <TabsList>
            <TabsTrigger value="about">About</TabsTrigger>
            <TabsTrigger value="posts" badge={12}>
              Posts
            </TabsTrigger>
            <TabsTrigger value="articles">Articles</TabsTrigger>
          </TabsList>
          <TabsContent value="about">About the profile.</TabsContent>
          <TabsContent value="posts">Posts in this profile.</TabsContent>
          <TabsContent value="articles">Articles in this profile.</TabsContent>
        </Tabs>
      </Section>

      <Section title="Underline with icons">
        <Tabs defaultValue="explore">
          <TabsList>
            <TabsTrigger value="explore">
              <Icon>
                <circle cx="12" cy="12" r="9" />
                <path d="m15.5 8.5-2 6-6 2 2-6z" strokeLinejoin="round" />
              </Icon>
              Explore
            </TabsTrigger>
            <TabsTrigger value="following">
              <Icon>
                <path d="M12 3l2.2 4.6L19 8.2l-3.5 3.4.8 4.9L12 14.8 7.7 16.5l.8-4.9L5 8.2l4.8-.6z" strokeLinejoin="round" />
              </Icon>
              Following
            </TabsTrigger>
          </TabsList>
          <TabsContent value="explore">Explore feed.</TabsContent>
          <TabsContent value="following">Following feed.</TabsContent>
        </Tabs>
      </Section>

      <Section title="Pill">
        <Tabs variant="pill" value={company} onValueChange={setCompany}>
          <TabsItemsList items={companyItems} />
          <TabsContent value="overview">Company overview.</TabsContent>
          <TabsContent value="people">People at this company.</TabsContent>
          <TabsContent value="jobs">Open jobs.</TabsContent>
          <TabsContent value="updates">Company updates.</TabsContent>
          <TabsContent value="analytics">Company analytics.</TabsContent>
          <TabsContent value="archive">Archived pages.</TabsContent>
        </Tabs>
      </Section>
    </main>
  );
}
