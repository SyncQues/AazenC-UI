export type ComponentExample = {
  filename: string;
  code: string;
};

export const componentExamples: Record<string, ComponentExample> = {
  button: {
    filename: "button.tsx",
    code: `import { Button } from "@aazenc/ui/button"

export function Example() {
  return (
    <Button type="button" variant="outline">
      Continue
    </Button>
  )
}`,
  },
  card: {
    filename: "card.tsx",
    code: `import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@aazenc/ui/card"

export function Example() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Workspace</CardTitle>
        <CardDescription>One panel for the account.</CardDescription>
      </CardHeader>
      <CardContent>Members and billing live here.</CardContent>
    </Card>
  )
}`,
  },
  tabs: {
    filename: "tabs.tsx",
    code: `import {
  Tabs,
  TabsContent,
  TabsItemsList,
  TabsList,
  TabsTrigger,
  type TabsItem,
} from "@aazenc/ui/tabs"

// variant picks the mark. color gives one tab its own hue.
const items: TabsItem[] = [
  { value: "feed", label: "Feed", color: "blue" },
  { value: "events", label: "Events", color: "orange", badge: 3 },
  { value: "members", label: "Members", color: "green" },
]

export function Example() {
  return (
    <div className="grid gap-8">
      {/* The default look is one underline bar. Counts are props. */}
      <Tabs defaultValue="about">
        <TabsList>
          <TabsTrigger value="about">About</TabsTrigger>
          <TabsTrigger value="posts" badge={12}>
            Posts
          </TabsTrigger>
        </TabsList>
        <TabsContent value="about">About the profile.</TabsContent>
        <TabsContent value="posts">Posts in this profile.</TabsContent>
      </Tabs>

      <Tabs variant="pill" defaultValue="feed">
        <TabsItemsList items={items} />
        <TabsContent value="feed">Community feed.</TabsContent>
        <TabsContent value="events">Upcoming events.</TabsContent>
        <TabsContent value="members">Members.</TabsContent>
      </Tabs>
    </div>
  )
}`,
  },
  dialog: {
    filename: "dialog.tsx",
    code: `import { Button } from "@aazenc/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@aazenc/ui/dialog"

export function Example() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button type="button">Edit note</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit note</DialogTitle>
          <DialogDescription>The same panel for a short form.</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button type="button">Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}`,
  },
  drawer: {
    filename: "drawer.tsx",
    code: `import { Button } from "@aazenc/ui/button"
import {
  Drawer,
  DrawerBody,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@aazenc/ui/drawer"

export function Example() {
  return (
    <Drawer>
      <DrawerTrigger asChild>
        <Button type="button" variant="outline">
          Open
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Details</DrawerTitle>
          <DrawerDescription>The same sheet, from the bottom edge.</DrawerDescription>
        </DrawerHeader>
        <DrawerBody>Swipe the handle or use Close.</DrawerBody>
        <DrawerFooter>
          <DrawerClose asChild>
            <Button type="button">Done</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}`,
  },
  command: {
    filename: "command.tsx",
    code: `import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@aazenc/ui/command"

export function Example() {
  return (
    <Command>
      <CommandInput placeholder="Search roles" />
      <CommandList>
        <CommandEmpty>No roles found.</CommandEmpty>
        <CommandGroup heading="Roles">
          <CommandItem>Designer</CommandItem>
          <CommandItem>Engineer</CommandItem>
        </CommandGroup>
      </CommandList>
    </Command>
  )
}`,
  },
  skeleton: {
    filename: "skeleton.tsx",
    code: `import { Skeleton } from "@aazenc/ui/skeleton"

export function Example() {
  return (
    <div>
      <Skeleton shape="circle" />
      <Skeleton width="long" />
      <Skeleton shape="block" />
    </div>
  )
}`,
  },
  spinner: {
    filename: "spinner.tsx",
    code: `import { Spinner } from "@aazenc/ui/spinner"

export function Example() {
  return <Spinner size="md" label="Loading" />
}`,
  },
  empty: {
    filename: "empty.tsx",
    code: `import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from "@aazenc/ui/empty"

export function Example() {
  return (
    <Empty>
      <EmptyHeader>
        <EmptyTitle>No roles yet</EmptyTitle>
        <EmptyDescription>Published jobs will show up here.</EmptyDescription>
      </EmptyHeader>
    </Empty>
  )
}`,
  },
  alert: {
    filename: "alert.tsx",
    code: `import { Alert, AlertAction, AlertDescription, AlertTitle } from "@aazenc/ui/alert"
import { Button } from "@aazenc/ui/button"

export function Example() {
  return (
    <Alert tone="warning">
      <AlertTitle>This link expires today</AlertTitle>
      <AlertDescription>Share it before midnight or ask for a new one.</AlertDescription>
      <AlertAction>
        <Button type="button" variant="outline" size="sm">
          Renew link
        </Button>
      </AlertAction>
    </Alert>
  )
}`,
  },
  separator: {
    filename: "separator.tsx",
    code: `import { Separator } from "@aazenc/ui/separator"

export function Example() {
  return (
    <div className="grid gap-3">
      <p className="text-sm">Public profile</p>
      <Separator />
      <p className="text-sm text-muted-foreground">Private draft</p>
    </div>
  )
}`,
  },
  sheet: {
    filename: "sheet.tsx",
    code: `import { Button } from "@aazenc/ui/button"
import {
  Sheet,
  SheetBody,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@aazenc/ui/sheet"

export function Example() {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button type="button" variant="outline">
          Notification settings
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Notifications</SheetTitle>
          <SheetDescription>Choose what lands in your inbox.</SheetDescription>
        </SheetHeader>
        <SheetBody>
          <p className="py-4 text-sm text-muted-foreground">
            Only the body scrolls, so the action row never leaves the screen.
          </p>
        </SheetBody>
        <SheetFooter>
          <Button type="button">Save</Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}`,
  },
  resizable: {
    filename: "resizable.tsx",
    code: `import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@aazenc/ui/resizable"

export function Example() {
  return (
    <div className="h-72 overflow-hidden rounded-[var(--radius-panel)] border border-border">
      <ResizablePanelGroup defaultLayout={{ list: 35, detail: 65 }}>
        <ResizablePanel id="list" className="flex flex-col">
          <p className="p-4 text-sm">Roles</p>
          <p className="mt-auto p-4 text-sm text-muted-foreground">32 results</p>
        </ResizablePanel>
        <ResizableHandle variant="band" collapsible />
        <ResizablePanel id="detail">
          <p className="p-4 text-sm">Senior Frontend Engineer</p>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  )
}`,
  },
  dropdown: {
    filename: "dropdown.tsx",
    code: `import { Button } from "@aazenc/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@aazenc/ui/dropdown-menu"

export function Example() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button type="button" variant="outline">
          Open menu
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem>Edit</DropdownMenuItem>
        <DropdownMenuItem tone="destructive">Delete</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}`,
  },
  "context-menu": {
    filename: "context-menu.tsx",
    code: `import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@aazenc/ui/context-menu"

export function Example() {
  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        <div className="grid h-32 place-items-center rounded-lg border border-dashed">
          Right-click here
        </div>
      </ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuItem>Open</ContextMenuItem>
        <ContextMenuItem>Rename</ContextMenuItem>
        <ContextMenuItem tone="destructive">Delete</ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  )
}`,
  },
  breadcrumb: {
    filename: "breadcrumb.tsx",
    code: `import Link from "next/link"
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage } from "@aazenc/ui/breadcrumb"

export function Example() {
  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <Link href="/projects">Projects</Link>
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbItem>
          <BreadcrumbPage>Invoices</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  )
}`,
  },

  input: {
    filename: "input.tsx",
    code: `import { Input } from "@aazenc/ui/input"
import { Label } from "@aazenc/ui/label"

export function Example() {
  return (
    <div>
      <Label htmlFor="username">Username</Label>
      <Input id="username" maxLength={24} showCount placeholder="ada" />
    </div>
  )
}`,
  },
  textarea: {
    filename: "textarea.tsx",
    code: `import { Label } from "@aazenc/ui/label"
import { Textarea } from "@aazenc/ui/textarea"

export function Example() {
  return (
    <div>
      <Label htmlFor="bio">Bio</Label>
      <Textarea id="bio" maxLength={180} showCount rows={4} />
    </div>
  )
}`,
  },
  select: {
    filename: "select.tsx",
    code: `import { Label } from "@aazenc/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@aazenc/ui/select"

export function Example() {
  return (
    <div>
      <Label htmlFor="role">Role</Label>
      <Select>
        <SelectTrigger id="role">
          <SelectValue placeholder="Choose a role" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="engineer">Engineer</SelectItem>
          <SelectItem value="designer">Designer</SelectItem>
        </SelectContent>
      </Select>
    </div>
  )
}`,
  },
  accordion: {
    filename: "accordion.tsx",
    code: `import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@aazenc/ui/accordion"

export function Example() {
  return (
    <Accordion type="single" collapsible>
      <AccordionItem value="plan">
        <AccordionTrigger>Where do plans live?</AccordionTrigger>
        <AccordionContent>Plans stay on the job until someone archives them.</AccordionContent>
      </AccordionItem>
    </Accordion>
  )
}`,
  },
  checkbox: {
    filename: "checkbox.tsx",
    code: `import { Checkbox } from "@aazenc/ui/checkbox"
import { Label } from "@aazenc/ui/label"

export function Example() {
  return (
    <div>
      <Checkbox id="alerts" />
      <Label htmlFor="alerts">Email alerts</Label>
    </div>
  )
}`,
  },
  collapsible: {
    filename: "collapsible.tsx",
    code: `import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@aazenc/ui/collapsible"

export function Example() {
  return (
    <Collapsible>
      <CollapsibleTrigger>Shipping notes</CollapsibleTrigger>
      <CollapsibleContent>Leave the package at the front desk.</CollapsibleContent>
    </Collapsible>
  )
}`,
  },
  label: {
    filename: "label.tsx",
    code: `import { Input } from "@aazenc/ui/input"
import { Label } from "@aazenc/ui/label"

export function Example() {
  return (
    <div>
      <Label htmlFor="name" required>
        Name
      </Label>
      <Input id="name" />
    </div>
  )
}`,
  },
  badge: {
    filename: "badge.tsx",
    code: `import { Badge } from "@aazenc/ui/badge"

export function Example() {
  return (
    <div>
      <Badge>New</Badge>
      <Badge variant="soft">Secondary</Badge>
      <Badge variant="outline">Draft</Badge>
      <Badge variant="destructive">3</Badge>
    </div>
  )
}`,
  },
  "hover-card": {
    filename: "hover-card.tsx",
    code: `import { HoverCard, HoverCardContent, HoverCardTrigger } from "@aazenc/ui/hover-card"

export function Example() {
  return (
    <HoverCard>
      <HoverCardTrigger href="/u/adeeb" className="underline underline-offset-4">
        @adeeb
      </HoverCardTrigger>
      <HoverCardContent>
        <p className="font-medium">Adeeb Mirza</p>
        <p className="mt-1 text-xs text-muted-foreground">Maintainer</p>
      </HoverCardContent>
    </HoverCard>
  )
}`,
  },
  toggle: {
    filename: "toggle.tsx",
    code: `import { Toggle } from "@aazenc/ui/toggle"

export function Example() {
  return (
    <div className="flex gap-2">
      {/* An icon-only toggle still needs an accessible name. */}
      <Toggle aria-label="Pin note" />
      <Toggle variant="outline" defaultPressed>
        Starred
      </Toggle>
    </div>
  )
}`,
  },
  "toggle-group": {
    filename: "toggle-group.tsx",
    code: `"use client"

import { useState } from "react"
import { ToggleGroup, ToggleGroupItem } from "@aazenc/ui/toggle-group"

const FORMATS = ["bold", "italic", "underline"]

export function Example() {
  const [formats, setFormats] = useState<string[]>([])

  return (
    // Pills by default; pass variant="outline" for the joined strip.
    <ToggleGroup
      type="multiple"
      value={formats}
      onValueChange={setFormats}
      label="Text format"
    >
      {FORMATS.map((format) => (
        <ToggleGroupItem key={format} value={format}>
          {format}
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  )
}`,
  },
  "segmented-control": {
    filename: "segmented-control.tsx",
    code: `import { useState } from "react"
import { SegmentedControl } from "@aazenc/ui/segmented-control"

export function Example() {
  const [range, setRange] = useState("7d")

  return (
    <SegmentedControl
      label="Date range"
      value={range}
      onValueChange={setRange}
      options={[
        { value: "24h", label: "24h" },
        { value: "7d", label: "7 days" },
        { value: "30d", label: "30 days" },
        { value: "12m", label: "12 months" },
      ]}
    />
  )
}`,
  },
  "file-upload": {
    filename: "file-upload.tsx",
    code: `import { FileUpload } from "@aazenc/ui/file-upload"

export function Example() {
  return <FileUpload accept=".pdf,.png" label="Resume" hint="PDF or PNG, up to 10 MB." />
}`,
  },
  toast: {
    filename: "toast.tsx",
    code: `"use client"

import { Button } from "@aazenc/ui/button"
import { toast } from "@aazenc/ui/toast"

export function Example() {
  return (
    <Button type="button" onClick={() => toast.success("Invite sent")}>
      Send invite
    </Button>
  )
}`,
  },
  switch: {
    filename: "switch.tsx",
    code: `import { Label } from "@aazenc/ui/label"
import { Switch } from "@aazenc/ui/switch"

export function Example() {
  return (
    <div>
      <Switch id="email-alerts" />
      <Label htmlFor="email-alerts">Email alerts</Label>
    </div>
  )
}`,
  },
  tooltip: {
    filename: "tooltip.tsx",
    code: `import { Button } from "@aazenc/ui/button"
import { Tooltip, TooltipContent, TooltipTrigger } from "@aazenc/ui/tooltip"

export function Example() {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button type="button" variant="outline">
          Share
        </Button>
      </TooltipTrigger>
      <TooltipContent>Copy the link</TooltipContent>
    </Tooltip>
  )
}`,
  },
  popover: {
    filename: "popover.tsx",
    code: `import { Button } from "@aazenc/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@aazenc/ui/popover"

export function Example() {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button type="button" variant="outline">
          Details
        </Button>
      </PopoverTrigger>
      <PopoverContent>Visible to everyone in the workspace.</PopoverContent>
    </Popover>
  )
}`,
  },
  avatar: {
    filename: "avatar.tsx",
    code: `import { Avatar, AvatarFallback, AvatarImage } from "@aazenc/ui/avatar"

export function Example() {
  return (
    <Avatar>
      <AvatarImage src="/portrait.png" alt="Ada" />
      <AvatarFallback>AD</AvatarFallback>
    </Avatar>
  )
}`,
  },
  carousel: {
    filename: "carousel.tsx",
    code: `import { Carousel, CarouselItem } from "@aazenc/ui/carousel"

export function Example() {
  return (
    <Carousel label="Pipeline">
      <CarouselItem>Hiring</CarouselItem>
      <CarouselItem>Interviews</CarouselItem>
      <CarouselItem>Offers</CarouselItem>
    </Carousel>
  )
}`,
  },
  progress: {
    filename: "progress.tsx",
    code: `import { Progress } from "@aazenc/ui/progress"

export function Example() {
  return <Progress value={40} aria-label="Upload" />
}`,
  },
  table: {
    filename: "table.tsx",
    code: `import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@aazenc/ui/table"

export function Example() {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Role</TableHead>
          <TableHead>Team</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow>
          <TableCell>Designer</TableCell>
          <TableCell>Product</TableCell>
        </TableRow>
      </TableBody>
    </Table>
  )
}`,
  },
  navbar: {
    filename: "navbar.tsx",
    code: `import { Button } from "@aazenc/ui/button"
import { Navbar, NavbarActions, NavbarBrand, NavbarLink, NavbarLinks } from "@aazenc/ui/navbar"

export function Example() {
  return (
    <Navbar>
      <NavbarBrand href="/">AazenC</NavbarBrand>
      <NavbarLinks>
        <NavbarLink href="/components" active>
          Components
        </NavbarLink>
        <NavbarLink href="/guides">Guides</NavbarLink>
      </NavbarLinks>
      <NavbarActions>
        <Button type="button" size="sm">
          Sign in
        </Button>
      </NavbarActions>
    </Navbar>
  )
}`,
  },
  "theme-selector": {
    filename: "theme-selector.tsx",
    code: `"use client"

import { ThemeSelector } from "@aazenc/ui/theme-selector"
import { useTheme } from "@aazenc/themes"

export function Example() {
  const { theme, mode, setTheme, setMode, availableThemes } = useTheme()

  return (
    <ThemeSelector
      theme={theme}
      themes={availableThemes}
      mode={mode}
      onTheme={(id) => {
        const next = availableThemes.find((item) => item.id === id)
        if (next) setTheme(next.id)
      }}
      onMode={setMode}
    />
  )
}`,
  },
  "pdf-viewer": {
    filename: "pdf-viewer.tsx",
    code: `import { PdfViewer } from "@aazenc/ui/pdf-viewer"

export function Example() {
  return <PdfViewer src="/sample.pdf" title="Sample" />
}`,
  },
  calendar: {
    filename: "calendar.tsx",
    code: `"use client"

import { useState } from "react"
import { Calendar } from "@aazenc/ui/calendar"

export function Example() {
  const [day, setDay] = useState<Date | undefined>(new Date())

  return <Calendar mode="single" selected={day} onSelect={setDay} />
}`,
  },
  "code-block": {
    filename: "code-block.tsx",
    code: `import { CodeBlock } from "@aazenc/ui/code-block"

const source = \`export function Hello() {
  return <p>Hello</p>
}\`

export function Example() {
  return <CodeBlock filename="hello.tsx" language="tsx" code={source} showLines />
}`,
  },
  "markdown-viewer": {
    filename: "markdown-viewer.tsx",
    code: `import { MarkdownViewer } from "@aazenc/ui/markdown-viewer"

const answer = \`## Result

The build is **green**, and the suite passed.

- [x] Parser
- [x] Renderer
\`

export function Example() {
  return <MarkdownViewer source={answer} label="Model response" />
}`,
  },
  charts: {
    filename: "charts.tsx",
    code: `import { ChartContainer } from "@aazenc/ui/chart-container"
import { AreaChart } from "@aazenc/ui/area-chart"
import { BarChart } from "@aazenc/ui/bar-chart"
import { LineChart } from "@aazenc/ui/line-chart"
import { PieChart } from "@aazenc/ui/pie-chart"

const revenue = [
  { month: "Jan", revenue: 18200, refunds: 900 },
  { month: "Feb", revenue: 20340, refunds: 1240 },
  { month: "Mar", revenue: 22480, refunds: 1100 },
]

const team = [
  { name: "Platform engineering", headcount: 14 },
  { name: "Payments", headcount: 9 },
  { name: "Design systems", headcount: 6 },
  { name: "Support", headcount: 21 },
]


export function Example() {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {/* The container owns the states: loading > error > empty > children,
          decided once, so no call site paints an empty state over a failure. */}
      <ChartContainer title="Revenue" description="Last 3 months">
        <AreaChart
          data={revenue}
          xKey="month"
          series={[{ key: "revenue", label: "Revenue" }]}
          height={220}
          label="Revenue by month"
        />
      </ChartContainer>

      {/* A one-series chart takes yKey instead of an array literal. */}
      <ChartContainer title="Revenue" loading>
        <LineChart data={revenue} xKey="month" yKey="revenue" height={220} />
      </ChartContainer>

      {/* Horizontal bars are what make a long category name readable. */}
      <ChartContainer title="By team">
        <BarChart
          data={team}
          xKey="name"
          series={[{ key: "headcount", label: "Headcount" }]}
          orientation="horizontal"
          height={240}
        />
      </ChartContainer>

      {/* A donut is a variant of Pie, not a second component. */}
      <ChartContainer title="Channels">
        <PieChart
          data={[
            { name: "Organic", value: 4820 },
            { name: "Referral", value: 3140 },
            { name: "Paid", value: 2260 },
          ]}
          variant="donut"
          innerRadius={0.62}
          height={240}
        />
      </ChartContainer>
    </div>
  )
}`,
  },
  "heat-map": {
    filename: "heat-map.tsx",
    code: `import { ChartContainer } from "@aazenc/ui/chart-container"
import { HeatMap } from "@aazenc/ui/heat-map"

const days = ["Mon", "Tue", "Wed", "Thu", "Fri"] as const
const weeks = ["W1", "W2", "W3", "W4", "W5", "W6"] as const

const deploys = weeks.flatMap((week, w) =>
  days.map((day, d) => ({
    week,
    day,
    // \`null\` is a missing reading, not a zero. It renders as a dashed gap, so
    // a day with no deploys never looks like a day with no activity — the
    // lowest band is a claim, and this one is not true.
    value: w === 2 && d === 1 ? null : Math.round(8 + Math.sin(w * 0.9) * 4 + d * 2),
  })),
)

export function Example() {
  return (
    <div className="space-y-4">
      {/* Bands, not a gradient, so a cell\u2019s shade is a swatch the reader can
          find in the scale printed underneath it. The ramp is mixed in oklch,
          which is what makes lightness climb the whole way instead of dipping
          in the middle. */}
      <ChartContainer
        title="Deploys per weekday"
        description="Six weeks. The scale is printed in real numbers, not swatches alone."
      >
        <HeatMap
          data={deploys}
          xKey="day"
          yKey="week"
          valueKey="value"
          color="data-4"
          label="Deploys by weekday over six weeks"
        />
      </ChartContainer>

      {/* A signed map. \`scale="diverging"\` levels both arms against the pivot,
          so a fall of 8 and a rise of 8 are the same shade — an ordinary
          min/max domain would put zero wherever the data happened to end. */}
      <ChartContainer title="Change against last week">
        <HeatMap
          data={deploys}
          xKey="day"
          yKey="week"
          valueKey="value"
          scale="diverging"
          steps={5}
          label="Change in deploys against the previous week"
        />
      </ChartContainer>

      {/* Pin \`domain\` to put two maps side by side. Each one left to its own
          extent stretches to fill, and then they agree on nothing. */}
      <ChartContainer title="One week, one range">
        <HeatMap
          data={deploys.filter((d) => d.week === "W1")}
          xKey="day"
          yKey="week"
          valueKey="value"
          domain={[0, 24]}
          height={72}
          radius={2}
          color="data-4"
          label="Deploys for the first week"
        />
      </ChartContainer>
    </div>
  )
}`,
  },
  "metric-card": {
    filename: "metric-card.tsx",
    code: `import { MetricCard } from "@aazenc/ui/metric-card"

export function Example() {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {/* The trend is coloured by sentiment, not by sign. Revenue up is good. */}
      <MetricCard
        label="Monthly revenue"
        value={48210}
        change={0.124}
        changeLabel="vs last month"
      />

      {/* Latency down is good, so the same arrow is painted the other way. */}
      <MetricCard
        label="p95 latency"
        value={184}
        change={-0.031}
        invertTrend
        changeLabel="vs last week"
        format={{ suffix: "ms" }}
      />
    </div>
  )
}`,
  },
};
