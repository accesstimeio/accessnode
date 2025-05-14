"use client";
import { SectionTabProjectProvider, useTabProject } from "../SectionTabProjectProvider";

function StatisticsContent() {
  const { activeProject } = useTabProject();
  return (
    <>
      asd {activeProject.accessTimeAddress}
    </>
  );
}

export default function Statistics() {
  return (
    <SectionTabProjectProvider title="Statistics">
      <StatisticsContent />
    </SectionTabProjectProvider>
  );
}