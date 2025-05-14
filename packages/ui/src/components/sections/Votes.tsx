"use client";
import { SectionTabProjectProvider, useTabProject } from "../SectionTabProjectProvider";

function VotesContent() {
  const { activeProject } = useTabProject();
  return (
    <>
      asd {activeProject.accessTimeAddress}
    </>
  );
}

export default function Votes() {
  return (
    <SectionTabProjectProvider title="Votes">
      <VotesContent />
    </SectionTabProjectProvider>
  );
}