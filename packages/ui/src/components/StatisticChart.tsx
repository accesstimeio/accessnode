import { ChartConfig } from "@/components/ui/chart";
import { defaultTimeTick } from "@/config";
import { StatisticTimeGap, StatisticType } from "@accesstimeio/accesstime-common";
import { usePonderQuery } from "@ponder/react";
import { ComponentProps, useEffect, useMemo, useState } from "react";
import { statistic } from "../../../full/ponder.schema";
import { and, desc, eq } from "@ponder/client";
import { Statistic } from "@/helpers";
import Charts from "@/components/Charts";
import { Address } from "viem";

export default function StatisticChart({
  chainId,
  accessTimeAddress,
  timeGap,
  statisticType,
  statisticInternalType,
  title,
  description,
  chartConfig,
  type,
  extraDataCalculation,
  tickFormatter
}: {
  chainId: number,
  accessTimeAddress: Address,
  timeGap: StatisticTimeGap;
  statisticType: StatisticType;
  statisticInternalType: number;
  title: string;
  description: string;
  chartConfig: ChartConfig;
  type: ComponentProps<typeof Charts>["type"];
  extraDataCalculation: (data: {
    date: string;
    value: number;
  }[]) => any;
  tickFormatter?: (data: number) => any;
}) {
  const [activeChart, setActiveChart] = useState<keyof typeof chartConfig>("value");

  const timeTick = useMemo(() =>
    timeGap == StatisticTimeGap.MONTH ? defaultTimeTick / 4 : defaultTimeTick, [timeGap]);

  const { data, isSuccess, refetch, isLoading } = usePonderQuery({
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
          eq(statistic.chainId, chainId),
          eq(statistic.address, accessTimeAddress),
          eq(statistic.type, statisticType),
          eq(statistic.internalType, statisticInternalType),
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
        value: tickFormatter ? tickFormatter(Number(_data.value)) : Number(_data.value),
      }))
      .reverse()
  }, [data, isSuccess, timeGap, timeTick]);


  const extraData = useMemo(
    () => ({
      value: extraDataCalculation(ticks),
    }),
    [ticks],
  );

  useEffect(() => {
    refetch();
  }, [accessTimeAddress, timeGap]);

  return (
    <Charts
      type={type}
      title={title}
      description={description}
      chartConfig={chartConfig}
      activeChart={activeChart}
      data={ticks}
      extraData={extraData}
      loading={isLoading}
      setActiveChart={setActiveChart}
    />
  );
}