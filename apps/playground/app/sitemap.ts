import type { MetadataRoute } from "next";

const componentSlugs = [
  "button",
  "card",
  "tabs",
  "dialog",
  "drawer",
  "command",
  "skeleton",
  "empty",
  "dropdown",
  "input",
  "select",
  "accordion",
  "checkbox",
  "collapsible",
  "label",
  "badge",
  "file-upload",
  "toast",
  "switch",
  "tooltip",
  "popover",
  "avatar",
  "carousel",
  "progress",
  "table",
  "navbar",
  "theme-selector",
  "pdf-viewer",
  "calendar",
];

const routes = [
  "",
  "/getting-started",
  "/components",
  ...componentSlugs.map((slug) => `/components/${slug}`),
  "/native",
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
