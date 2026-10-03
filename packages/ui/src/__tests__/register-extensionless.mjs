import { registerHooks } from "node:module";

// Node's test loader does not resolve extensionless relative imports. Shipped
// sources stay extensionless so a copied registry file typechecks in an app.
registerHooks({
  resolve(specifier, context, nextResolve) {
    const hasExtension = /\.(?:mjs|cjs|js|json|node|ts|tsx|mts|cts)$/.test(
      specifier,
    );
    if (
      (specifier.startsWith("./") || specifier.startsWith("../")) &&
      !hasExtension
    ) {
      for (const extension of [".ts", ".tsx", ".mts"]) {
        try {
          return nextResolve(specifier + extension, context);
        } catch {
          // try the next extension
        }
      }
    }
    return nextResolve(specifier, context);
  },
});
