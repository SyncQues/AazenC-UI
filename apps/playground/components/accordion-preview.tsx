"use client";

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@aazenc/ui/accordion";
import { Button } from "@aazenc/ui/button";
import { useTheme } from "@aazenc/themes";

const questions = [
  { value: "plan", question: "Where do plans live?", answer: "Plans stay on the job until someone archives them." },
  { value: "share", question: "Who can edit a plan?", answer: "Owners and people invited to the workspace." },
  { value: "export", question: "Can I export answers?", answer: "Yes. Export writes a file you can download." },
];

export function AccordionPreview() {
  const { mode, toggleMode } = useTheme();

  return (
    <main className="mx-auto max-w-5xl px-6 py-12">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm text-muted-foreground">Component</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">Accordion</h1>
          <p className="mt-3 max-w-2xl text-muted-foreground">
            One bordered list. Opening an item closes the others. Several can stay open when the type is multiple.
          </p>
        </div>
        <Button type="button" variant="outline" onClick={toggleMode}>
          {mode === "dark" ? "Light mode" : "Dark mode"}
        </Button>
      </div>

      <div className="mt-10 max-w-xl">
        <Accordion type="single" collapsible defaultValue="plan">
          {questions.map((item) => (
            <AccordionItem key={item.value} value={item.value}>
              <AccordionTrigger>{item.question}</AccordionTrigger>
              <AccordionContent>{item.answer}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>

      <h2 className="mt-12 text-lg font-semibold">Multiple</h2>
      <div className="mt-4 max-w-xl">
        <Accordion type="multiple" defaultValue={["share"]}>
        {questions.slice(0, 2).map((item) => (
          <AccordionItem key={item.value} value={item.value}>
            <AccordionTrigger>{item.question}</AccordionTrigger>
            <AccordionContent>{item.answer}</AccordionContent>
          </AccordionItem>
        ))}
        </Accordion>
      </div>
    </main>
  );
}
