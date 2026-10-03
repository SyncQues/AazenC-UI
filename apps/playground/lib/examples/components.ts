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
  input: {
    filename: "input.tsx",
    code: `import { Input } from "@aazenc/ui/input"
import { Label } from "@aazenc/ui/label"

export function Example() {
  return (
    <div>
      <Label htmlFor="email">Email</Label>
      <Input id="email" type="email" placeholder="ada@example.com" />
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
  const { theme, mode, material, setTheme, setMode, setMaterial, availableThemes } = useTheme()

  return (
    <ThemeSelector
      theme={theme}
      themes={availableThemes}
      mode={mode}
      material={material}
      onTheme={(id) => {
        const next = availableThemes.find((item) => item.id === id)
        if (next) setTheme(next.id)
      }}
      onMode={setMode}
      onMaterial={setMaterial}
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
};
