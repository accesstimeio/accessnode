"use client";
import { useState } from "react";
import { SectionTabProjectProvider, useTabProject } from "../SectionTabProjectProvider";
import StatisticChart from "../StatisticChart";
import { StatisticTimeGap, StatisticType } from "@accesstimeio/accesstime-common";

// total sold accessTimes
// total user
// new user growth
// total income by payment methods

function StatisticsContent({ activeTimeGap }: { activeTimeGap: StatisticTimeGap }) {
  const { activeProject } = useTabProject();

  return (
    <div className="grid gap-3 md:grid-cols-2">
      <StatisticChart
        type="area"
        activeProject={activeProject}
        timeGap={activeTimeGap}
        statisticType={StatisticType.USER}
        title="Total Users"
        description="Showing total user growth for the last 1 year"
        chartConfig={{
          views: {
            label: "Value",
          },
          value: {
            label: "Total",
            color: "var(--color-green-500)",
          },
        }}
        extraDataCalculation={(data) => data[0] ? data[0].value : 0}
      />
      <StatisticChart
        type="area"
        activeProject={activeProject}
        timeGap={activeTimeGap}
        statisticType={StatisticType.NEW_USER}
        title="New Users"
        description="Showing new user growth for the last 1 year"
        chartConfig={{
          views: {
            label: "Value",
          },
          value: {
            label: "Total",
            color: "var(--color-green-500)",
          },
        }}
        extraDataCalculation={(data) => data.reduce((acc, curr) => acc + curr.value, 0)}
      />
      <StatisticChart
        type="area"
        activeProject={activeProject}
        timeGap={activeTimeGap}
        statisticType={StatisticType.SOLD_ACCESSTIME}
        title="Total Sold AccessTime"
        description="Showing total sold accesstime for the last 1 year"
        chartConfig={{
          views: {
            label: "Value",
          },
          value: {
            label: "Total",
            color: "var(--color-green-500)",
          },
        }}
        extraDataCalculation={(data) => data.reduce((acc, curr) => acc + curr.value, 0)}
      />
    </div>
  );
}

export default function Statistics() {
  const [activeTimeGap] = useState<StatisticTimeGap>(StatisticTimeGap.MONTH); // todo: make changeable

  return (
    <SectionTabProjectProvider title="Statistics">
      <StatisticsContent activeTimeGap={activeTimeGap} />
    </SectionTabProjectProvider>
  );
}