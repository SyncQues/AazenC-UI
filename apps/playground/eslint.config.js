import { globalIgnores } from "eslint/config";
import { nextJsConfig } from "@repo/eslint-config/next-js";

/** @type {import("eslint").Linter.Config[]} */
export default [
  ...nextJsConfig,
  // `public/pdfjs/` is vendored pdf.js runtime copied in by
  // scripts/copy-pdfjs-assets.mjs on prebuild/predev, and it is gitignored.
  // ESLint does not read .gitignore, so without this the generated minified
  // wasm bundle is linted and `pnpm lint --max-warnings 0` fails after any
  // local build. CI only passes because Lint runs before Build on a clean
  // checkout that has no public/pdfjs yet.
  globalIgnores(["public/pdfjs/**"]),
];
