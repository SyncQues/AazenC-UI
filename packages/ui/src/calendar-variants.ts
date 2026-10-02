/**
 * One month grid and one pill field.
 * Chrome, outline, elevated, and size skins were the same calendar.
 * Date, range, month, time, and date-time share this field.
 */

export const calendarClass = "relative w-fit p-1 text-foreground";

export const calendarMonthsClass = "relative flex w-fit flex-col";

export const calendarMonthClass = "flex w-fit flex-col gap-2";

export const calendarNavClass =
  "pointer-events-none absolute inset-x-1 top-1 z-10 flex h-9 items-center justify-between";

export const calendarNavButtonClass =
  "pointer-events-auto inline-flex size-8 items-center justify-center rounded-full text-foreground outline-none hover:bg-foreground/10 focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-40";

export const calendarCaptionClass = "flex h-9 items-center justify-center px-10 text-sm font-medium";

export const calendarDropdownsClass = "flex items-center justify-center gap-1.5";

export const calendarDropdownRootClass =
  "relative inline-flex h-7 items-center rounded-md border border-border bg-foreground/10 px-2 text-sm font-medium has-[:focus]:border-ring has-[:focus]:ring-[3px] has-[:focus]:ring-ring/50";

export const calendarDropdownClass = "absolute inset-0 cursor-pointer opacity-0";

export const calendarDropdownLabelClass =
  "pointer-events-none flex items-center gap-1 tabular-nums [&_svg]:size-3.5 [&_svg]:text-muted-foreground";

export const calendarWeekdaysClass = "flex";

export const calendarWeekdayClass =
  "flex size-9 items-center justify-center text-[0.7rem] font-medium text-muted-foreground";

export const calendarWeekClass = "mt-1 flex";

export const calendarDayClass = "relative flex size-9 items-center justify-center p-0 text-center";

export const calendarDayButtonClass = [
  "inline-flex size-8 items-center justify-center rounded-full text-sm tabular-nums",
  "cursor-pointer outline-none transition-colors duration-150 ease-out motion-reduce:transition-none",
  "hover:bg-foreground/10 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring/50",
  "disabled:pointer-events-none disabled:opacity-40",
  "data-[outside=true]:text-muted-foreground",
  "data-[today=true]:ring-1 data-[today=true]:ring-inset data-[today=true]:ring-foreground/40",
  "data-[selection=single]:bg-primary data-[selection=single]:text-primary-foreground data-[selection=single]:ring-0",
  "data-[selection=start]:bg-primary data-[selection=start]:text-primary-foreground data-[selection=start]:ring-0",
  "data-[selection=end]:bg-primary data-[selection=end]:text-primary-foreground data-[selection=end]:ring-0",
  "data-[selection=middle]:bg-transparent data-[selection=middle]:text-foreground",
].join(" ");

export const calendarRangeStartClass = "rounded-l-full bg-primary/15";

export const calendarRangeMiddleClass = "bg-primary/15";

export const calendarRangeEndClass = "rounded-r-full bg-primary/15";

export const dateFieldClass = [
  "flex h-9 w-full cursor-pointer items-center gap-2 rounded-full border border-input bg-transparent px-4 text-left text-base shadow-xs",
  "outline-none transition-[color,box-shadow,border-color] duration-150 ease-out motion-reduce:transition-none md:text-sm",
  "focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50",
  "disabled:cursor-not-allowed disabled:opacity-50 dark:bg-input/30",
  "data-[empty=true]:text-muted-foreground",
  "aria-invalid:border-destructive aria-invalid:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40",
].join(" ");

export const datePanelClass =
  "menu-motion pointer-events-auto z-[var(--z-popper)] flex w-fit flex-col rounded-[var(--radius-panel)] border border-border bg-popover p-2 text-popover-foreground shadow-md outline-none";

export const timePartClass =
  "h-9 min-w-14 cursor-pointer appearance-none rounded-full border border-input bg-transparent px-3 text-center text-sm tabular-nums outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 dark:bg-input/30";

export const monthButtonClass =
  "inline-flex h-9 items-center justify-center rounded-full text-sm outline-none transition-colors duration-150 ease-out hover:bg-foreground/10 focus-visible:ring-[3px] focus-visible:ring-ring/50 data-[selected=true]:bg-primary data-[selected=true]:text-primary-foreground motion-reduce:transition-none";
