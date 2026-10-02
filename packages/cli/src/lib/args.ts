const valueFlags = new Set(["ui", "utils", "css", "cwd"]);

export type Args = {
  command: string | undefined;
  positionals: string[];
  flags: Map<string, string | boolean>;
};

export function parseArgs(argv: string[]): Args {
  const positionals: string[] = [];
  const flags = new Map<string, string | boolean>();

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === undefined) continue;
    if (arg === "--") {
      positionals.push(...argv.slice(index + 1).filter((item): item is string => item !== undefined));
      break;
    }
    if (!arg.startsWith("--")) {
      positionals.push(arg);
      continue;
    }

    const equals = arg.indexOf("=");
    const key = equals === -1 ? arg.slice(2) : arg.slice(2, equals);
    if (!key) throw new Error(`Unknown flag ${arg}`);

    if (equals !== -1) {
      flags.set(key, arg.slice(equals + 1));
      continue;
    }

    if (valueFlags.has(key)) {
      const next = argv[index + 1];
      if (next === undefined || next.startsWith("-")) throw new Error(`--${key} needs a value`);
      flags.set(key, next);
      index += 1;
      continue;
    }

    flags.set(key, true);
  }

  return {
    command: positionals[0],
    positionals: positionals.slice(1),
    flags,
  };
}

export function flagString(flags: Map<string, string | boolean>, key: string): string | undefined {
  const value = flags.get(key);
  return typeof value === "string" ? value : undefined;
}

export function flagOn(flags: Map<string, string | boolean>, key: string): boolean {
  return flags.get(key) === true;
}
