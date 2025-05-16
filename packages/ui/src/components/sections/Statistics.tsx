"use client";
import { useState } from "react";
import { StatisticNewUserType, StatisticSoldAccessTimeType, StatisticTimeGap, StatisticType, StatisticUserType } from "@accesstimeio/accesstime-common";

import { SectionTabProjectProvider, useTabProject } from "../SectionTabProjectProvider";
import StatisticChart from "../StatisticChart";
import { Switch } from "../ui/switch";
import { Label } from "../ui/label";

// total sold accessTimes
// total user
// new user growth
// total income by payment methods

function StatisticsContent({ activeTimeGap }: { activeTimeGap: StatisticTimeGap }) {
  const { activeProject } = useTabProject();

  return (
    <div className="grid gap-3 lg:grid-cols-2">
      <StatisticChart
        type="area"
        chainId={activeProject.chainId}
        accessTimeAddress={activeProject.accessTimeAddress}
        timeGap={activeTimeGap}
        statisticType={StatisticType.USER}
        statisticInternalType={StatisticUserType.PROJECT}
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
        extraDataCalculation={(data) => data.length > 0 ? data[data.length - 1].value : 0}
      />
      <StatisticChart
        type="bar"
        chainId={activeProject.chainId}
        accessTimeAddress={activeProject.accessTimeAddress}
        timeGap={activeTimeGap}
        statisticType={StatisticType.NEW_USER}
        statisticInternalType={StatisticNewUserType.PROJECT}
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
        type="bar"
        chainId={activeProject.chainId}
        accessTimeAddress={activeProject.accessTimeAddress}
        timeGap={activeTimeGap}
        statisticType={StatisticType.SOLD_ACCESSTIME}
        statisticInternalType={StatisticSoldAccessTimeType.PROJECT}
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
        extraDataCalculation={(data) => data.reduce((acc, curr) => acc + curr.value, 0) + "/h"}
        tickFormatter={(data) => data / 3600}
      />
    </div>
  );
}

export default function Statistics() {
  const [activeTimeGap, setActiveTimeGap] = useState<StatisticTimeGap>(StatisticTimeGap.MONTH);

  return (
    <SectionTabProjectProvider title="Statistics" rightSection={(
      <div className="flex items-center space-x-2">
        <Switch
          className="cursor-pointer"
          id="statistics-weekly-timegap"
          checked={activeTimeGap == StatisticTimeGap.WEEK}
          onCheckedChange={(checked) => checked ? setActiveTimeGap(StatisticTimeGap.WEEK) : setActiveTimeGap(StatisticTimeGap.MONTH)}
        />
        <Label className="cursor-pointer" htmlFor="statistics-weekly-timegap">Weekly</Label>
      </div>
    )}>
      <StatisticsContent activeTimeGap={activeTimeGap} />
    </SectionTabProjectProvider>
  );
}