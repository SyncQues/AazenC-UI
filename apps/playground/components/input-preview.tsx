"use client";

import { useState } from "react";
import { Button } from "@aazenc/ui/button";
import { Input } from "@aazenc/ui/input";
import { useTheme } from "@aazenc/themes";

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" strokeLinecap="round" />
    </svg>
  );
}

export function InputPreview() {
  const { mode, toggleMode } = useTheme();
  const [value, setValue] = useState("");
  const [saved, setSaved] = useState("");

  return (
    <main className="mx-auto max-w-5xl px-6 py-12">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm text-muted-foreground">Component</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">Input</h1>
          <p className="mt-3 max-w-2xl text-muted-foreground">
            One field. Password, email, number, and file use the native type. A leading icon keeps the same chrome, and
            showCount counts the text against a limit.
          </p>
        </div>
        <Button type="button" variant="outline" onClick={toggleMode}>
          {mode === "dark" ? "Light mode" : "Dark mode"}
        </Button>
      </div>

      <form
        className="mt-10 grid max-w-md gap-4"
        onSubmit={(event) => {
          event.preventDefault();
          const data = new FormData(event.currentTarget);
          setSaved(String(data.get("name") ?? ""));
        }}
      >
        <label className="grid gap-1.5 text-sm font-medium" htmlFor="input-name">
          Name
          <Input id="input-name" name="name" value={value} onChange={(event) => setValue(event.target.value)} placeholder="Ada Lovelace" />
        </label>
        <label className="grid gap-1.5 text-sm font-medium" htmlFor="input-username">
          Username
          <Input id="input-username" name="username" maxLength={24} showCount placeholder="ada" autoComplete="off" />
        </label>
        <label className="grid gap-1.5 text-sm font-medium" htmlFor="input-email">
          Email
          <Input id="input-email" name="email" type="email" placeholder="ada@example.com" autoComplete="email" />
        </label>
        <label className="grid gap-1.5 text-sm font-medium" htmlFor="input-password">
          Password
          <Input id="input-password" name="password" type="password" autoComplete="current-password" placeholder="Password" />
        </label>
        <label className="grid gap-1.5 text-sm font-medium" htmlFor="input-search">
          Search
          <Input id="input-search" type="search" icon={<SearchIcon />} placeholder="Search jobs" />
        </label>
        <label className="grid gap-1.5 text-sm font-medium" htmlFor="input-invalid">
          Invalid
          <Input id="input-invalid" invalid defaultValue="Not an email" aria-describedby="input-invalid-hint" />
          <span id="input-invalid-hint" className="text-sm font-normal text-destructive">
            Enter a valid email.
          </span>
        </label>
        <label className="grid gap-1.5 text-sm font-medium" htmlFor="input-file">
          File
          <Input id="input-file" type="file" />
        </label>
        <Input disabled placeholder="Disabled" />
        <Button type="submit">Save name</Button>
        {saved ? <p className="text-sm">Saved: {saved}</p> : null}
      </form>
    </main>
  );
}
