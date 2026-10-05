import type { MetadataRoute } from "next";
import { themes } from "@aazenc/themes";

const componentSlugs = [
  "button",
  "card",
  "tabs",
  "dialog",
  "drawer",
  "command",
  "skeleton",
  "spinner",
  "empty",
  "alert",
  "separator",
  "sheet",
  "resizable",
  "dropdown",
  "context-menu",
  "breadcrumb",
  "input",
  "textarea",
  "select",
  "accordion",
  "checkbox",
  "collapsible",
  "label",
  "badge",
  "segmented-control",
  "file-upload",
  "toast",
  "switch",
  "tooltip",
  "popover",
  "hover-card",
  "toggle-group",
  "toggle",
  "avatar",
  "carousel",
  "progress",
  "table",
  "navbar",
  "theme-selector",
  "pdf-viewer",
  "calendar",
  "code-block",
  "markdown-viewer",
  "typeset",
  "charts",
  "heat-map",
  "metric-card",
  "layout",
];

const routes = [
  "",
  "/getting-started",
  "/components",
  ...componentSlugs.map((slug) => `/components/${slug}`),
  "/themes",
  // One showcase per theme, straight from the manifest, so a newly registered
  // theme is discoverable without editing this file.
  ...themes.map((item) => `/themes/${item.id}`),
  "/guides",
  "/about",
  "/sitemap",
];

export default function sitemap(): MetadataRoute.Sitemap {
  return routes.map((path) => ({
    url: path || "/",
    changeFrequency: "weekly",
    priority: path === "" ? 1 : 0.6,
  }));
}
