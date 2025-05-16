"use client";
// credits: https://21st.dev/shadcn/chart/default
import { useEffect, useMemo, useState } from "react";
import { usePonderQuery } from "@ponder/react";
import { and, desc, eq } from "@ponder/client";
import { StatisticTimeGap, StatisticType, StatisticVoteType } from "@accesstimeio/accesstime-common";

import { Statistic } from "@/helpers";
import { defaultTimeTick } from "@/config";

import { SectionTabProjectProvider, useTabProject } from "../SectionTabProjectProvider";
import Charts from "../Charts";
import { ChartConfig } from "../ui/chart";
import { Switch } from "../ui/switch";
import { Label } from "../ui/label";

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
    color: "var(--color-blue-500)",
  },
} satisfies ChartConfig;

function VotesContent({ activeTimeGap }: { activeTimeGap: StatisticTimeGap }) {
  const [activeChart, setActiveChart] = useState<keyof typeof chartConfig>("point");

  const { activeProject } = useTabProject();

  const userCountTimeTick = useMemo(() =>
    activeTimeGap == StatisticTimeGap.MONTH ? defaultTimeTick / 4 : defaultTimeTick, [activeTimeGap]);

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
        .limit(defaultTimeTick)
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
    let filledTotalPoint = Statistic.fillIndexGap(StatisticType.VOTE, StatisticTimeGap.WEEK, formattedTotalPoint, defaultTimeTick);

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
    <Charts
      type="bar"
      title="Total Votes"
      description="Showing total votes for the last 1 year"
      chartConfig={chartConfig}
      activeChart={activeChart}
      data={ticks}
      extraData={total}
      setActiveChart={setActiveChart}
    />
  );
}

export default function Votes() {
  const [activeTimeGap, setActiveTimeGap] = useState<StatisticTimeGap>(StatisticTimeGap.MONTH);

  return (
    <SectionTabProjectProvider title="Votes" rightSection={(
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
      <VotesContent activeTimeGap={activeTimeGap} />
    </SectionTabProjectProvider>
  );
}