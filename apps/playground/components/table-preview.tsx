"use client";

import { Button } from "@aazenc/ui/button";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@aazenc/ui/table";
import { useTheme } from "@aazenc/themes";

const rows = [
  { role: "Designer", team: "Product", status: "Open" },
  { role: "Engineer", team: "Platform", status: "Interview" },
  { role: "Recruiter", team: "People", status: "Offer" },
];

export function TablePreview() {
  const { mode, toggleMode } = useTheme();

  return (
    <main className="mx-auto max-w-5xl px-6 py-12">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm text-muted-foreground">Component</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">Table</h1>
          <p className="mt-3 max-w-2xl text-muted-foreground">
            One bordered grid. Rows highlight on hover. Scroll sideways when the columns do not fit.
          </p>
        </div>
        <Button type="button" variant="outline" onClick={toggleMode}>
          {mode === "dark" ? "Light mode" : "Dark mode"}
        </Button>
      </div>

      <div className="mt-10">
    <Table>
      <TableCaption>Open roles</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead>Role</TableHead>
          <TableHead>Team</TableHead>
          <TableHead>Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((row) => (
          <TableRow key={row.role}>
            <TableCell>{row.role}</TableCell>
            <TableCell>{row.team}</TableCell>
            <TableCell>{row.status}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
      </div>
    </main>
  );
}
