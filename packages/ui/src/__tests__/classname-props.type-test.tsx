/**
 * Compile-time contract: a caller must be able to pass `className` to every
 * exported component.
 *
 * A component that omits `className` from its props does not merely reject the
 * attribute — it swallows it. The value then rides along inside `...props` and
 * lands in the spread *after* the computed `className`, replacing the variant
 * classes outright. That shipped: `Button` declared no `className`, so a caller
 * who cast past the type error got a bare `<button>` with every size, shape, and
 * variant class stripped.
 *
 * `Omit<ComponentProps<"button">, "className">` is the pattern that caused it.
 *
 * Written as JSX rather than `ComponentProps<typeof X>` on purpose: the layout
 * primitives are generic (`Box<E extends ElementType = "div">`), and
 * `ComponentProps` cannot resolve that parameter, so it reports a false negative
 * on eight components that are perfectly fine. Asking whether the attribute
 * actually compiles is both the real question and the one that works here.
 *
 * Held in an object rather than an array so `tsc` names the offending component
 * and `react/jsx-key` has nothing to complain about.
 *
 * Checked by `tsc --noEmit`. The Node runner cannot strip `.tsx`, so this file
 * sits deliberately outside its `*.test.mts` glob.
 */

import {
  AccordionContent,
  AccordionTrigger,
  Alert,
  Avatar,
  Badge,
  Box,
  Button,
  Card,
  CardContent,
  Center,
  Checkbox,
  CodeBlock,
  CollapsibleContent,
  Container,
  DatePicker,
  DateTimePicker,
  DialogContent,
  DrawerContent,
  DropdownMenuContent,
  DropdownMenuItem,
  Empty,
  FileUpload,
  Flex,
  Grid,
  Input,
  Label,
  MarkdownViewer,
  MonthPicker,
  Navbar,
  PopoverContent,
  Progress,
  SegmentedControl,
  SelectTrigger,
  Separator,
  SheetContent,
  Skeleton,
  Slider,
  Spacer,
  Split,
  Stack,
  Switch,
  Table,
  TableCell,
  Textarea,
  ThemeSelector,
  TimePicker,
  Toggle,
  ToggleGroupItem,
  TooltipContent,
  Typeset,
} from "../index";

/* If any one of these stops accepting `className`, `tsc` names that line. */
export const acceptsClassName = {
  Button: <Button className="x" />,
  Badge: <Badge className="x" />,
  Card: <Card className="x" />,
  CardContent: <CardContent className="x" />,
  Input: <Input className="x" />,
  Textarea: <Textarea className="x" />,
  SelectTrigger: <SelectTrigger className="x" />,
  Checkbox: <Checkbox className="x" />,
  Switch: <Switch className="x" />,
  Toggle: <Toggle className="x" />,
  ToggleGroupItem: <ToggleGroupItem value="a" className="x" />,
  Slider: <Slider className="x" />,
  Label: <Label className="x" />,
  Avatar: <Avatar className="x" />,
  Separator: <Separator className="x" />,
  Skeleton: <Skeleton className="x" />,
  Progress: <Progress className="x" />,
  Alert: <Alert className="x" />,
  Empty: <Empty className="x" />,
  Table: <Table className="x" />,
  TableCell: <TableCell className="x" />,
  Navbar: <Navbar className="x">brand</Navbar>,
  ThemeSelector: (
    <ThemeSelector
      className="x"
      theme="slate"
      themes={[{ id: "slate", label: "Slate" }]}
      mode="light"
      onTheme={() => {}}
      onMode={() => {}}
    />
  ),
  TooltipContent: <TooltipContent className="x" />,
  PopoverContent: <PopoverContent className="x" />,
  DialogContent: <DialogContent className="x" />,
  SheetContent: <SheetContent className="x" />,
  DrawerContent: <DrawerContent className="x" />,
  DropdownMenuContent: <DropdownMenuContent className="x" />,
  DropdownMenuItem: <DropdownMenuItem className="x" />,
  AccordionTrigger: <AccordionTrigger className="x" />,
  AccordionContent: <AccordionContent className="x" />,
  CollapsibleContent: <CollapsibleContent className="x" />,
  FileUpload: <FileUpload className="x" />,
  SegmentedControl: <SegmentedControl className="x" options={[{ value: "a", label: "A" }]} />,
  DatePicker: <DatePicker className="x" />,
  DateTimePicker: <DateTimePicker className="x" />,
  TimePicker: <TimePicker className="x" />,
  MonthPicker: <MonthPicker className="x" />,
  CodeBlock: <CodeBlock className="x" code="const a = 1;" language="ts" />,
  MarkdownViewer: <MarkdownViewer className="x" source="# hi" />,
  Typeset: <Typeset className="x">text</Typeset>,
  Box: <Box className="x" />,
  Stack: <Stack className="x" />,
  Flex: <Flex className="x" />,
  Grid: <Grid className="x" />,
  Center: <Center className="x" />,
  Container: <Container className="x" />,
  Spacer: <Spacer className="x" />,
  Split: <Split className="x" />,
  // `as` re-types the props with another tag, so className has to survive that.
  StackAs: <Stack as="a" href="/x" className="x" />,
};
