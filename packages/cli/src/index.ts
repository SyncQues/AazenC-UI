#!/usr/bin/env node

import { parseArgs } from "./lib/args.js";
import { help } from "./lib/help.js";
import { init } from "./commands/init.js";
import { list } from "./commands/list.js";
import { add } from "./commands/add.js";
import { update } from "./commands/update.js";

function main(): void {
  const args = parseArgs(process.argv.slice(2));
  if (!args.command || args.command === "help" || args.flags.get("help") === true) {
    console.log(help);
    return;
  }

  if (args.command === "init") {
    init(args);
    return;
  }
  if (args.command === "list") {
    list(args);
    return;
  }
  if (args.command === "add") {
    add(args);
    return;
  }
  if (args.command === "update") {
    update(args);
    return;
  }

  throw new Error(`Unknown command "${args.command}".\n\n${help}`);
}

try {
  main();
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
}
