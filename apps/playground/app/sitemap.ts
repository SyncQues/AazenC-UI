import type { MetadataRoute } from "next";

const routes = [
  "",
  "/getting-started",
  "/components",
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
