"use client";
import { ReactNode } from "react";
import H1 from "./ui/typography/h1";

export default function Section({ title, children, navButton }: { title: string, children: ReactNode, navButton?: ReactNode }) {
  return (
    <div id={`section_${title.toLowerCase().split(" ").join()}`} className="grid gap-3 my-3">
      <div className="grid gap-3 md:grid-cols-2 pb-3 border-b-1">
        <H1 content={title} />
        <div className="flex flex-col items-end">
          {navButton}
        </div>
      </div>
      <div className="grid gap-3">
        {children}
      </div>
    </div>
  );
}