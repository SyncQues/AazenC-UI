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

function FeedIcon(props: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true" className={props.className}>
      <path d="M21 12a8 8 0 0 1-8 8H4l2.2-2.9A8 8 0 1 1 21 12z" strokeLinejoin="round" />
    </svg>
  );
}

function CalendarIcon(props: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true" className={props.className}>
      <rect x="3" y="5" width="18" height="16" rx="3" />
      <path d="M8 3v4M16 3v4M3 11h18" strokeLinecap="round" />
    </svg>
  );
}

function BookIcon(props: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true" className={props.className}>
      <path d="M12 6c-1.5-1.2-3.4-1.6-6-1.4v13c2.6-.2 4.5.2 6 1.4 1.5-1.2 3.4-1.6 6-1.4v-13c-2.6-.2-4.5.2-6 1.4z" strokeLinejoin="round" />
      <path d="M12 6v13" />
    </svg>
  );
}

function ClipboardIcon(props: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true" className={props.className}>
      <path d="M9 4h6v3H9z" strokeLinejoin="round" />
      <path d="M9 5.5H6.5A1.5 1.5 0 0 0 5 7v12.5A1.5 1.5 0 0 0 6.5 21h11a1.5 1.5 0 0 0 1.5-1.5V7a1.5 1.5 0 0 0-1.5-1.5H15" strokeLinecap="round" />
      <path d="M9 13l2 2 4-4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function InfoIcon(props: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true" className={props.className}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 11v5" strokeLinecap="round" />
      <circle cx="12" cy="7.8" r="0.6" fill="currentColor" stroke="none" />
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

const dashboardItems: TabsItem[] = [
  { value: "overview", label: "Overview" },
  { value: "analytics", label: "Analytics" },
  { value: "reports", label: "Reports" },
  { value: "settings", label: "Settings" },
];

/** One hue per section, the way a community page reads. */
const communityItems: TabsItem[] = [
  { value: "feed", label: "Feed", icon: FeedIcon, color: "blue" },
  { value: "events", label: "Events", icon: CalendarIcon, color: "orange", badge: 3 },
  { value: "resources", label: "Resources", icon: BookIcon, color: "teal" },
  { value: "assessments", label: "Assessments", icon: ClipboardIcon, color: "purple" },
  { value: "members", label: "Members", icon: PeopleIcon, color: "green" },
  { value: "about", label: "About", icon: InfoIcon, color: "teal" },
];

const coloredSegments: TabsItem[] = [
  { value: "overview", label: "Overview", color: "blue" },
  { value: "analytics", label: "Analytics", color: "orange" },
  { value: "reports", label: "Reports", color: "purple" },
  { value: "settings", label: "Settings", color: "green" },
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
  const [dashboard, setDashboard] = useState("overview");
  const [community, setCommunity] = useState("feed");
  const [coloredBar, setColoredBar] = useState("overview");
  const [coloredSection, setColoredSection] = useState("feed");

  return (
    <main className="mx-auto max-w-5xl px-6 py-12">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm text-muted-foreground">Component</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">Tabs</h1>
          <p className="mt-3 max-w-2xl text-muted-foreground">
            Underline, pill, or segmented. The segmented bar is one pill track with a single inset pill on the
            active tab. The underline and pill marks use the primary color. Icons and counts belong on the tab.
            Pass color to give a tab its own hue: blue, green, orange, teal, purple, or pink.
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

      <Section title="Segmented">
        <Tabs variant="segmented" value={dashboard} onValueChange={setDashboard}>
          <TabsItemsList items={dashboardItems} />
          <TabsContent value="overview">Workspace overview.</TabsContent>
          <TabsContent value="analytics">Workspace analytics.</TabsContent>
          <TabsContent value="reports">Saved reports.</TabsContent>
          <TabsContent value="settings">Workspace settings.</TabsContent>
        </Tabs>
      </Section>

      <Section title="Segmented with icons and counts">
        <Tabs variant="segmented" defaultValue="overview">
          <TabsItemsList items={companyItems} />
          <TabsContent value="overview">Company overview.</TabsContent>
          <TabsContent value="people">People at this company.</TabsContent>
          <TabsContent value="jobs">Open jobs.</TabsContent>
          <TabsContent value="updates">Company updates.</TabsContent>
          <TabsContent value="analytics">Company analytics.</TabsContent>
          <TabsContent value="archive">Archived pages.</TabsContent>
        </Tabs>
      </Section>

      <Section title="Pill with colors">
        <p className="-mt-2 max-w-2xl text-sm text-muted-foreground">
          A tab color is a section identity, not a state. The icon keeps the hue in both states, the label and
          the wash take it on the active chip, and the mark slides into the next hue with it.
        </p>
        <Tabs variant="pill" value={community} onValueChange={setCommunity}>
          <TabsItemsList items={communityItems} />
          <TabsContent value="feed">Community feed.</TabsContent>
          <TabsContent value="events">Upcoming events.</TabsContent>
          <TabsContent value="resources">Shared resources.</TabsContent>
          <TabsContent value="assessments">Community assessments.</TabsContent>
          <TabsContent value="members">Members.</TabsContent>
          <TabsContent value="about">About this community.</TabsContent>
        </Tabs>
      </Section>

      <Section title="Segmented with colors">
        <Tabs variant="segmented" value={coloredBar} onValueChange={setColoredBar}>
          <TabsItemsList items={coloredSegments} />
          <TabsContent value="overview">Workspace overview.</TabsContent>
          <TabsContent value="analytics">Workspace analytics.</TabsContent>
          <TabsContent value="reports">Saved reports.</TabsContent>
          <TabsContent value="settings">Workspace settings.</TabsContent>
        </Tabs>
      </Section>

      <Section title="Underline with colors">
        <Tabs value={coloredSection} onValueChange={setColoredSection}>
          <TabsList>
            <TabsTrigger value="feed" icon={FeedIcon} color="blue">
              Feed
            </TabsTrigger>
            <TabsTrigger value="events" icon={CalendarIcon} color="orange">
              Events
            </TabsTrigger>
            <TabsTrigger value="resources" icon={BookIcon} color="teal">
              Resources
            </TabsTrigger>
          </TabsList>
          <TabsContent value="feed">Community feed.</TabsContent>
          <TabsContent value="events">Upcoming events.</TabsContent>
          <TabsContent value="resources">Shared resources.</TabsContent>
        </Tabs>
      </Section>
    </main>
  );
}
