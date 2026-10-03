export interface ThemeDefinition {
  id: string;
  label: string;
  description: string;
  cssFile: string;
}

/** Surface treatment, orthogonal to color theme (`data-theme`). */
export type MaterialId = "solid";

export interface MaterialDefinition {
  id: MaterialId;
  label: string;
  description: string;
}

export const materials: MaterialDefinition[] = [
  {
    id: "solid",
    label: "Solid",
    description: "Opaque paper fills and hairline borders.",
  },
];

export const themes: ThemeDefinition[] = [
  {
    id: "slate",
    label: "Slate",
    description: "SyncQues product palette — neutral slate chrome, blue-to-cyan brand",
    cssFile: "./slate.css",
  },
  {
    id: "mono",
    label: "Mono Basic",
    description: "Pure black and white — foundational minimal UI",
    cssFile: "./mono.css",
  },
];

export type ThemeId = (typeof themes)[number]["id"];