import { ActiveProject } from "@/components/SectionTabProjectProvider";
import { ChartConfig } from "@/components/ui/chart";
import { defaultTimeTick } from "@/config";
import { StatisticTimeGap, StatisticType, StatisticVoteType } from "@accesstimeio/accesstime-common";
import { usePonderQuery } from "@ponder/react";
import { ComponentProps, useEffect, useMemo, useState } from "react";
import { statistic } from "../../../full/ponder.schema";
import { and, desc, eq } from "@ponder/client";
import { Statistic } from "@/helpers";
import Charts from "@/components/Charts";

export default function StatisticChart({
  activeProject,
  timeGap,
  statisticType,
  title,
  description,
  chartConfig,
  type,
  extraDataCalculation
}: {
  activeProject: ActiveProject;
  timeGap: StatisticTimeGap;
  statisticType: StatisticType;
  title: string;
  description: string;
  chartConfig: ChartConfig;
  type: ComponentProps<typeof Charts>["type"];
  extraDataCalculation: (data: {
    date: string;
    value: number;
  }[]) => number;
}) {
  const [activeChart, setActiveChart] = useState<keyof typeof chartConfig>("value");

  const timeTick = useMemo(() =>
    timeGap == StatisticTimeGap.MONTH ? defaultTimeTick / 4 : defaultTimeTick, [timeGap]);

  const { data, isSuccess, refetch } = usePonderQuery({
    enabled: false,
    queryFn: (db) =>
      db
        .select({
          timeIndex: statistic.timeIndex,
          value: statistic.value,
        })
        .from(statistic)
        .limit(timeTick)
        .orderBy(desc(statistic.timeIndex))
        .where(and(
          eq(statistic.chainId, activeProject.chainId),
          eq(statistic.address, activeProject.accessTimeAddress),
          eq(statistic.type, statisticType),
          eq(statistic.internalType, StatisticVoteType.PROJECT),
          eq(statistic.timeGap, BigInt(timeGap)),
        ))
  });

  const ticks = useMemo(() => {
    if (!data || !isSuccess) {
      return [];
    }

    const filledData = Statistic.fillIndexGap(statisticType, timeGap, data, timeTick);

    return filledData
      .map((_data) => ({
        date: Statistic.formatUnixEpoch(_data.timeIndex, timeGap),
        value: Number(_data.value),
      }))
  }, [data, isSuccess, timeGap, timeTick]);


  const extraData = useMemo(
    () => ({
      value: extraDataCalculation(ticks),
    }),
    [ticks],
  );

  useEffect(() => {
    refetch();
  }, [activeProject.accessTimeAddress, timeGap]);

  return (
    <Charts
      type={type}
      title={title}
      description={description}
      chartConfig={chartConfig}
      activeChart={activeChart}
      data={ticks}
      extraData={extraData}
      setActiveChart={setActiveChart}
    />
  );
}