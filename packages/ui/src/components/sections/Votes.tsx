"use client";
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";
import { useEffect, useMemo, useState } from "react";
import { usePonderQuery } from "@ponder/react";
import { and, desc, eq } from "@ponder/client";
import { StatisticTimeGap, StatisticType, StatisticVoteType } from "@accesstimeio/accesstime-common";

import { Statistic } from "@/helpers";

import { SectionTabProjectProvider, useTabProject } from "../SectionTabProjectProvider";
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "../ui/chart";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";

import { statistic, accessVote } from "../../../../full/ponder.schema";

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

const timeTick = 48;

function VotesContent() {
  const [activeChart, setActiveChart] = useState<keyof typeof chartConfig>("point");
  const [activeTimeGap, setActiveTimeGap] = useState<StatisticTimeGap>(StatisticTimeGap.MONTH);

  const { activeProject } = useTabProject();

  const userCountTimeTick = useMemo(() =>
    activeTimeGap == StatisticTimeGap.MONTH ? timeTick / 4 : timeTick, [activeTimeGap]);

  const { data: userCount, isSuccess: userCountSuccess, refetch: userCountRefetch } = usePonderQuery({
    enabled: false,
    queryFn: (db) =>
      db
        .select({
          timeIndex: statistic.timeIndex,
          value: statistic.value,
        })
        .from(statistic)
        .limit(userCountTimeTick)
        .orderBy(desc(statistic.timeIndex))
        .where(and(
          eq(statistic.chainId, activeProject.chainId),
          eq(statistic.address, activeProject.accessTimeAddress),
          eq(statistic.type, StatisticType.VOTE),
          eq(statistic.internalType, StatisticVoteType.PROJECT),
          eq(statistic.timeGap, BigInt(activeTimeGap)),
        ))
  });

  const { data: totalPoint, isSuccess: totalPointSuccess, refetch: totalPointRefetch } = usePonderQuery({
    enabled: false,
    queryFn: (db) =>
      db
        .select({
          epochWeek: accessVote.epochWeek,
          votePoint: accessVote.votePoint,
        })
        .from(accessVote)
        .limit(timeTick)
        .orderBy(desc(accessVote.epochWeek))
        .where(and(
          eq(accessVote.chainId, activeProject.chainId),
          eq(accessVote.accessTimeAddress, activeProject.accessTimeAddress),
        ))
  });

  const ticks = useMemo(() => {
    if (!userCount || !userCountSuccess || !totalPoint || !totalPointSuccess) {
      return [];
    }

    const formattedTotalPoint = totalPoint.map(_totalPoint => ({
      timeIndex: _totalPoint.epochWeek,
      value: _totalPoint.votePoint ? _totalPoint.votePoint : 0n
    }));

    const filledUserCount = Statistic.fillIndexGap(StatisticType.VOTE, activeTimeGap, userCount, userCountTimeTick);
    let filledTotalPoint = Statistic.fillIndexGap(StatisticType.VOTE, StatisticTimeGap.WEEK, formattedTotalPoint, timeTick);

    if (activeTimeGap == StatisticTimeGap.MONTH) {
      filledTotalPoint = Statistic.convertToByMonthly(filledTotalPoint);
    }
    
    const mergedData = Statistic.mergeAB(filledUserCount, filledTotalPoint);

    return Array.from(mergedData.entries())
      .sort(([a], [b]) => (a < b ? -1 : 1))
      .map(([timeIndex, { a = 0n, b = 0n }]) => ({
        date: Statistic.formatUnixEpoch(timeIndex, activeTimeGap),
        userCount: Number(a),
        point: Number(b),
      }))
  }, [userCount, userCountSuccess, totalPoint, totalPointSuccess, activeTimeGap, userCountTimeTick]);


  const total = useMemo(
    () => ({
      point: ticks.reduce((acc, curr) => acc + curr.point, 0),
      userCount: ticks.reduce((acc, curr) => acc + curr.userCount, 0),
    }),
    [ticks],
  );

  useEffect(() => {
    userCountRefetch();
    totalPointRefetch();
  }, [activeProject.accessTimeAddress, activeTimeGap]);

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
            data={ticks}
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