"use client";

import {
  Box,
  Center,
  Container,
  Flex,
  Grid,
  Spacer,
  Split,
  Stack,
} from "@aazenc/ui/layout";
import { Button } from "@aazenc/ui/button";
import { Badge } from "@aazenc/ui/badge";
import { useTheme } from "@aazenc/themes";

function Demo({ children }: { children: React.ReactNode }) {
  return <div className="rounded-lg border border-border p-6">{children}</div>;
}

function Filler({ children }: { children: React.ReactNode }) {
  return <span className="text-sm text-muted-foreground">{children}</span>;
}

export function LayoutPreview() {
  const { mode, toggleMode } = useTheme();

  return (
    <main className="mx-auto max-w-5xl px-6 py-12">
      <Split gap={6}>
        <Box>
          <p className="text-sm text-muted-foreground">Component</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">Layout</h1>
          <p className="mt-3 max-w-2xl text-muted-foreground">
            The boxes a page is made of. Stack, Grid, Flex, Center, Split,
            Container, Box and Spacer, each one a named axis instead of a class
            string, each one carrying{" "}
            <code className="font-mono text-foreground">min-w-0</code> so a wide
            child cannot scroll the page sideways.
          </p>
        </Box>
        <Button type="button" variant="outline" onClick={toggleMode}>
          {mode === "dark" ? "Light mode" : "Dark mode"}
        </Button>
      </Split>

      <Stack gap={6} className="mt-10 max-w-2xl">
        <Box>
          <p className="text-sm font-medium">Stack</p>
          <p className="mt-1 text-sm text-muted-foreground">
            A column,{" "}
            <code className="font-mono text-foreground">gap=&#123;4&#125;</code>{" "}
            by default.{" "}
            <code className="font-mono text-foreground">
              direction=&quot;row&quot;
            </code>{" "}
            turns it, and{" "}
            <code className="font-mono text-foreground">wrap</code> turns it
            into a cluster, so the badge row below needs no component of its
            own.
          </p>
          <Demo>
            <Stack gap={2}>
              <p className="text-sm">React</p>
              <p className="text-sm">Tailwind</p>
              <Stack direction="row" wrap gap={2} align="center">
                <Badge variant="outline">TypeScript</Badge>
                <Badge variant="outline">RSC</Badge>
                <Badge variant="outline">a11y</Badge>
                <Badge variant="outline">dark mode</Badge>
              </Stack>
            </Stack>
          </Demo>
        </Box>

        <Box>
          <p className="text-sm font-medium">Flex</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Raw flex, and the one primitive with no gap of its own —{" "}
            <code className="font-mono text-foreground">Stack</code> is the one
            with rhythm. Reach for this when you already know the exact row you
            want.
          </p>
          <Demo>
            <Flex align="center" justify="between">
              <Filler>Free to set your own spacing</Filler>
              <Badge variant="outline">flex-1</Badge>
            </Flex>
          </Demo>
        </Box>

        <Box>
          <p className="text-sm font-medium">Grid</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Equal columns, one to six. Breakpoints stay yours:{" "}
            <code className="font-mono text-foreground">
              className=&quot;sm:grid-cols-2&quot;
            </code>{" "}
            wins over <code className="font-mono text-foreground">columns</code>
            , because the caller&rsquo;s classes are merged last.
          </p>
          <Demo>
            <Grid columns={3} gap={3} className="sm:grid-cols-1">
              {["Plans", "Usage", "Billing"].map((label) => (
                <div
                  key={label}
                  className="rounded border border-border p-3 text-sm"
                >
                  {label}
                </div>
              ))}
            </Grid>
          </Demo>
        </Box>

        <Box>
          <p className="text-sm font-medium">Split</p>
          <p className="mt-1 text-sm text-muted-foreground">
            A heading at one end and its action at the other. This is the row a
            page repeats; a split you can drag is{" "}
            <code className="font-mono text-foreground">resizable</code>, not
            this.
          </p>
          <Demo>
            <Split>
              <Box>
                <p className="text-sm font-medium">Members</p>
                <Filler>12 people with access</Filler>
              </Box>
              <Button type="button" variant="outline" size="sm">
                Invite
              </Button>
            </Split>
          </Demo>
        </Box>

        <Box>
          <p className="text-sm font-medium">Center and Spacer</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Center for the empty state and the spinner. Spacer grows to push
            what follows to the far end, so a footer sits at the bottom without
            anyone writing{" "}
            <code className="font-mono text-foreground">mt-auto</code>.
          </p>
          <Demo>
            <Stack className="min-h-40">
              <p className="text-sm">Top</p>
              <Spacer />
              <p className="text-sm text-muted-foreground">Bottom</p>
            </Stack>
            <Center className="min-h-24 rounded border border-dashed border-border">
              <Filler>Nothing here yet</Filler>
            </Center>
          </Demo>
        </Box>

        <Box>
          <p className="text-sm font-medium">Container</p>
          <p className="mt-1 text-sm text-muted-foreground">
            The centred page column. Sizes are Tailwind&rsquo;s own{" "}
            <code className="font-mono text-foreground">max-w</code> steps, so{" "}
            <code className="font-mono text-foreground">
              size=&quot;7xl&quot;
            </code>{" "}
            is the same number as{" "}
            <code className="font-mono text-foreground">max-w-7xl</code> —
            without the{" "}
            <code className="font-mono text-foreground">mx-auto px-4</code> you
            would otherwise retype on every page.
          </p>
          <Box className="rounded-lg border border-border p-4">
            <Container
              size="md"
              className="rounded border border-dashed border-border p-3"
            >
              <Filler>size=&quot;md&quot;</Filler>
            </Container>
          </Box>
        </Box>

        <Box>
          <p className="text-sm font-medium">as and asChild</p>
          <p className="mt-1 text-sm text-muted-foreground">
            A layout is not always a div.{" "}
            <code className="font-mono text-foreground">as</code> gives it
            another tag and{" "}
            <code className="font-mono text-foreground">asChild</code> adopts
            the child&rsquo;s, so a grid can be a form and a stack can be a
            list.
          </p>
          <Demo>
            <Stack as="ul" gap={2}>
              {["First", "Second", "Third"].map((item) => (
                <li key={item} className="text-sm">
                  {item}
                </li>
              ))}
            </Stack>
          </Demo>
        </Box>
      </Stack>
    </main>
  );
}
