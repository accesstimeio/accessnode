"use client";
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";
import { useMemo, useState } from "react";
import { usePonderQuery } from "@ponder/react";

import { SectionTabProjectProvider, useTabProject } from "../SectionTabProjectProvider";
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "../ui/chart";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";

import { accessTime } from "../../../../full/ponder.schema";

const chartConfig = {
  views: {
    label: "Value",
  },
  point: {
    label: "Vote Point",
    color: "var(--color-green-500)",
  },
  userCount: {
    label: "Voter Count",
    color: "var(--color-red-500)",
  },
} satisfies ChartConfig;

const chartData = [{ date: "2024-04-01", point: 222, userCount: 150 }];

function VotesContent() {
  const [activeChart, setActiveChart] = useState<keyof typeof chartConfig>("point");

  const { activeProject } = useTabProject();

  // const { data, isSuccess } = usePonderQuery({
  //   queryFn: (db) =>
  //     db
  //       .select({
  //         owner: accessTime.owner,
  //         nextOwner: accessTime.nextOwner,
  //         chainId: accessTime.chainId,
  //         accessTimeId: accessTime.accessTimeId,
  //         accessTimeAddress: accessTime.id,
  //         packages: accessTime.packages,
  //         removedPackages: accessTime.removedPackages,
  //         extraTimes: accessTime.extraTimes,
  //         removedExtraTimes: accessTime.removedExtraTimes,
  //       })
  //       .from(accessTime)
  // });

  const total = useMemo(
    () => ({
      point: chartData.reduce((acc, curr) => acc + curr.point, 0),
      userCount: chartData.reduce((acc, curr) => acc + curr.userCount, 0),
    }),
    [],
  );

  return (
    <Card className="p-0 m-0 border-0 shadow-none">
      <CardHeader className="flex flex-col items-stretch space-y-0 border-b p-0 sm:flex-row">
        <div className="flex flex-1 flex-col justify-center gap-1 px-6 py-5 sm:py-6">
          <CardTitle>Total Votes</CardTitle>
          <CardDescription>
            Showing total votes for the last 1 year
          </CardDescription>
        </div>
        <div className="flex">
          {["point", "userCount"].map((key) => {
            const chart = key as keyof typeof chartConfig
            return (
              <button
                key={chart}
                data-active={activeChart === chart}
                className="cursor-pointer relative z-30 flex flex-1 flex-col justify-center gap-1 border-t px-6 py-4 text-left even:border-l data-[active=true]:bg-muted/50 sm:border-l sm:border-t-0 sm:px-8 sm:py-6"
                onClick={() => setActiveChart(chart)}
              >
                <span className="text-xs text-muted-foreground">
                  {chartConfig[chart].label}
                </span>
                <span className="text-lg font-bold leading-none sm:text-3xl">
                  {total[key as keyof typeof total].toLocaleString()}
                </span>
              </button>
            )
          })}
        </div>
      </CardHeader>
      <CardContent className="px-2 sm:p-6">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[250px] w-full"
        >
          <BarChart
            accessibilityLayer
            data={chartData}
            margin={{
              left: 0,
              right: 0,
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={(value) => {
                const date = new Date(value)
                return date.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })
              }}
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  className="w-[150px]"
                  nameKey="views"
                  labelFormatter={(value) => {
                    return new Date(value).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })
                  }}
                />
              }
            />
            <Bar dataKey={activeChart} fill={`var(--color-${activeChart})`} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

export default function Votes() {
  return (
    <SectionTabProjectProvider title="Votes">
      <VotesContent />
    </SectionTabProjectProvider>
  );
}