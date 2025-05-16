import { StatisticTimeGap, StatisticType } from "@accesstimeio/accesstime-common";
import { Address } from "viem";

export const shortenAddress = (address: Address) => {
  return `${address?.slice(0, 6)}…${address?.slice(-4)}`;
};

export class Statistic {
  private static currentTimestamp() {
    return BigInt(Date.now()) / 1000n;
  }

  private static currentWeekIndex() {
    return this.currentTimestamp() / BigInt(StatisticTimeGap.WEEK);
  }

  private static currentMonthIndex() {
    return this.currentTimestamp() / BigInt(StatisticTimeGap.MONTH);
  }

  private static weeklyEpochToMonthlyEpochIndex(weeklyEpochIndex: bigint) {
    return (BigInt(StatisticTimeGap.WEEK) * weeklyEpochIndex) / BigInt(StatisticTimeGap.MONTH);
  }

  static formatUnixEpoch(index: bigint, timeGap: StatisticTimeGap): string {
    const unixSeconds = index * BigInt(timeGap);
    const date = new Date(Number(unixSeconds) * 1000);
    return date.toISOString().split("T")[0];
  }

  static convertToByMonthly(
    data: { timeIndex: bigint, value: bigint }[]
  ): { timeIndex: bigint, value: bigint }[] {
    const monthlyMap = new Map<bigint, bigint>();

    for (const { timeIndex: weekIndex, value } of data) {
      const monthIndex = this.weeklyEpochToMonthlyEpochIndex(weekIndex);
      const currentSum = monthlyMap.get(monthIndex) || 0n;
      monthlyMap.set(monthIndex, currentSum + value);
    }

    return Array.from(monthlyMap.entries())
      .sort(([a], [b]) => (a > b ? -1 : 1))
      .map(([timeIndex, value]) => ({ timeIndex, value }));
  }

  static fillIndexGap(
    type: StatisticType,
    timeGap: StatisticTimeGap,
    data: { timeIndex: bigint, value: bigint }[],
    timeTick: number,
  ): { timeIndex: bigint, value: bigint }[] {
    let currentIndex: bigint = 0n;
    if (timeGap == StatisticTimeGap.WEEK) {
      currentIndex = this.currentWeekIndex();
    }
    if (timeGap == StatisticTimeGap.MONTH) {
      currentIndex = this.currentMonthIndex();
    }

    if (currentIndex == 0n) {
      return data;
    }

    if (!data[0]) {
      return new Array(timeTick).fill("").map((_item, index) => ({
        timeIndex: currentIndex - BigInt(index),
        value: 0n
      }));
    }

    const newTicks: { timeIndex: bigint, value: bigint }[] = [];
    const lastTickIndex = BigInt(data[0].timeIndex);

    // start
    if (currentIndex != lastTickIndex) {
      const requiredTickCount =
        currentIndex - lastTickIndex > BigInt(timeTick)
          ? BigInt(timeTick)
          : currentIndex - lastTickIndex;
      let fillValue: bigint = 0n;
      if (type == StatisticType.USER) {
        fillValue = data[0].value;
      }
      for (let i = 0; i < Number(requiredTickCount.toString()); i++) {
        newTicks.push({
          timeIndex: currentIndex - BigInt(i),
          value: fillValue
        });
      }
    }

    // between
    for (let i2 = 0; i2 < data.length; i2++) {
      const _timeTick = data[i2];
      const nextTimeTick = data[i2 + 1];
      if (newTicks.length >= timeTick) {
        break;
      }
      newTicks.push(_timeTick);

      const gapAvaliable =
        nextTimeTick && Number(_timeTick.timeIndex) - Number(nextTimeTick.timeIndex) > 1;
      if (gapAvaliable) {
        const gapLength = Number(_timeTick.timeIndex) - Number(nextTimeTick.timeIndex);
        let fillValue: bigint = 0n;
        if (type == StatisticType.USER) {
          fillValue = nextTimeTick.value;
        }
        for (let i3 = 1; i3 < gapLength; i3++) {
          if (newTicks.length >= timeTick) {
            break;
          }
          newTicks.push({
            timeIndex: _timeTick.timeIndex - BigInt(i3),
            value: fillValue
          });
        }
      }
    }

    // end
    const requiredZeroTickCount = timeTick - newTicks.length;
    const lastTick = newTicks[newTicks.length - 1];
    for (let i4 = 0; i4 < requiredZeroTickCount; i4++) {
      newTicks.push({
        timeIndex: lastTick.timeIndex - BigInt((i4 + 1)),
        value: 0n
      });
    }

    return newTicks;
  }

  static mergeAB(
    a: { timeIndex: bigint, value: bigint }[],
    b: { timeIndex: bigint, value: bigint }[]
  ) {
    const map = new Map<bigint, { a?: bigint; b?: bigint }>();

    for (const { timeIndex, value } of a) {
      if (!map.has(timeIndex)) map.set(timeIndex, {});
      map.get(timeIndex)!.a = value;
    }

    for (const { timeIndex, value } of b) {
      if (!map.has(timeIndex)) map.set(timeIndex, {});
      map.get(timeIndex)!.b = value;
    }

    return map;
  }
}
