/**
 * SyncQues breadcrumb.
 *
 * The trail is a list, so it is an `ol` inside a labelled `nav`. A page with two
 * navs needs names a screen reader can tell apart, which is why the label is a prop.
 */
export const breadcrumbClass = "text-sm";

/** Wraps rather than scrolls: a path that runs off a narrow screen should reflow, not hide. */
export const breadcrumbListClass = "flex flex-wrap items-center gap-1.5";

export const breadcrumbItemClass =
  "flex min-w-0 items-center gap-1.5 [&:first-child>[data-slot=breadcrumb-separator]]:hidden";

export const breadcrumbLinkClass =
  "rounded-full px-2 py-0.5 text-muted-foreground outline-none transition-colors duration-150 hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50 motion-reduce:transition-none";

/**
 * The page you are on is not a link: you cannot navigate to where you already are,
 * and a link there is a control that does nothing. `truncate` keeps a long title
 * from pushing the ancestors out of the row.
 */
export const breadcrumbPageClass = "min-w-0 truncate px-2 py-0.5 font-medium text-foreground";

/**
 * The rule that hides this chevron lives on the item, not here: it has to be the
 * *first item* that is suppressed, and the svg is the first child of every item.
 * The chevron is decorative, so it renders as `aria-hidden` — a screen reader hears
 * "Home, Settings, Billing", not "Home, chevron, Settings".
 */
export const breadcrumbSeparatorClass =
  "flex size-3.5 shrink-0 items-center justify-center text-muted-foreground";
