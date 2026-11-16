"use client";

import { useState } from "react";
import { Button } from "@aazenc/ui/button";
import { Label } from "@aazenc/ui/label";
import { RadioGroup, RadioGroupItem } from "@aazenc/ui/radio-group";
import { useTheme } from "@aazenc/themes";

const plans = [
  { value: "free", label: "Free" },
  { value: "pro", label: "Pro" },
  { value: "team", label: "Team" },
] as const;

export function RadioGroupPreview() {
  const { mode, toggleMode } = useTheme();
  const [plan, setPlan] = useState("pro");
  const [cadence, setCadence] = useState("monthly");

  return (
    <main className="mx-auto max-w-5xl px-6 py-12">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm text-muted-foreground">Component</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">Radio group</h1>
          <p className="mt-3 max-w-2xl text-muted-foreground">
            One circle. Arrow keys move the choice. The chosen option shows a primary dot.
          </p>
        </div>
        <Button type="button" variant="outline" onClick={toggleMode}>
          {mode === "dark" ? "Light mode" : "Dark mode"}
        </Button>
      </div>

      <div className="mt-10 grid max-w-md gap-8">
        <RadioGroup value={plan} onValueChange={setPlan} aria-label="Plan">
          {plans.map((option) => (
            <div key={option.value} className="flex items-center gap-2">
              <RadioGroupItem id={`plan-${option.value}`} value={option.value} />
              <Label htmlFor={`plan-${option.value}`}>{option.label}</Label>
            </div>
          ))}
        </RadioGroup>
        <p className="text-sm">Plan: {plan}</p>

        <div className="grid gap-3">
          <p className="text-sm font-medium">Billing</p>
          <RadioGroup orientation="horizontal" value={cadence} onValueChange={setCadence} aria-label="Billing">
            <div className="flex items-center gap-2">
              <RadioGroupItem id="cadence-monthly" value="monthly" />
              <Label htmlFor="cadence-monthly">Monthly</Label>
            </div>
            <div className="flex items-center gap-2">
              <RadioGroupItem id="cadence-yearly" value="yearly" />
              <Label htmlFor="cadence-yearly">Yearly</Label>
            </div>
          </RadioGroup>
        </div>

        <div className="grid gap-2">
          <RadioGroup invalid defaultValue="no" aria-label="Terms">
            <div className="flex items-center gap-2">
              <RadioGroupItem id="terms-yes" value="yes" invalid />
              <Label htmlFor="terms-yes">I accept</Label>
            </div>
            <div className="flex items-center gap-2">
              <RadioGroupItem id="terms-no" value="no" invalid />
              <Label htmlFor="terms-no">I do not accept</Label>
            </div>
          </RadioGroup>
          <p className="text-sm text-destructive">Required before you continue.</p>
        </div>

        <RadioGroup defaultValue="locked" aria-label="Disabled">
          <div className="flex items-center gap-2">
            <RadioGroupItem id="locked" value="locked" disabled />
            <Label htmlFor="locked">Disabled</Label>
          </div>
        </RadioGroup>
      </div>
    </main>
  );
}
