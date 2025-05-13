import { Contract, SUPPORTED_CHAIN } from "@accesstimeio/accesstime-common";
import moment from "moment";
import { useEffect, useMemo } from "react";
import { Address, zeroAddress } from "viem";
import { useReadContracts } from "wagmi";

type ExtraTimeDetail = {
  id: string;
  active: boolean;
  percent: string;
  time: string;
  formattedTime: string;
}

const accessTimeExtraTimeCall = {
  abi: Contract.abis.accessTime,
  functionName: "extras",
} as const;

export default function useExtraTimeDetails({
  chainId,
  accessTimeAddress,
  extraTimes,
  removedExtraTimes
}: {
  chainId: SUPPORTED_CHAIN;
  accessTimeAddress: Address;
  extraTimes: bigint[];
  removedExtraTimes: bigint[]
}): {
  extraTimes: ExtraTimeDetail[];
  isLoading: boolean;
  isSuccess: boolean;
} {


  const {
    data: extraTimesOnChain,
    isSuccess,
    isLoading,
    refetch: extraTimesOnChainRefetch,
  } = useReadContracts({
    query: {
      enabled: false
    },
    contracts: extraTimes.map(_extraTime => ({
      ...accessTimeExtraTimeCall,
      address: accessTimeAddress,
      chainId: chainId,
      args: [_extraTime]
    })),
  });

  const _extraTimes = useMemo(() => {
    if (!extraTimesOnChain || !isSuccess) {
      return [];
    }

    let availableExtraTimes: ExtraTimeDetail[] = [];

    if (extraTimesOnChain && isSuccess) {
      availableExtraTimes = extraTimes.map((_extraTime, index) => {
        const extraTimeOnChain = extraTimesOnChain[index];

        let _active: boolean = false;
        let _percent: string = "0";
        let _time: string = "0";
        let _formattedTime: string = "0";

        if (extraTimeOnChain.status == "success") {
          _time = extraTimeOnChain.result[0].toString();
          _percent = extraTimeOnChain.result[1].toString();
          _active = extraTimeOnChain.result[2];

          _formattedTime = moment.duration(Number(_time), 'seconds').humanize()
        }

        return {
          id: _extraTime.toString(),
          active: _active,
          percent: _percent,
          time: _time,
          formattedTime: _formattedTime
        };
      });
    }

    const combinedExtraTimes = [
      ...availableExtraTimes,
      ...removedExtraTimes.map((_extraTime) => ({
        id: _extraTime.toString(),
        active: false,
        percent: "0",
        time: "0",
        formattedTime: "0"
      })),
    ].flat();

    return combinedExtraTimes;
  }, [extraTimesOnChain, isSuccess]);

  useEffect(() => {
    if (accessTimeAddress != zeroAddress) {
      extraTimesOnChainRefetch();
    }
  }, [accessTimeAddress != zeroAddress, chainId]);

  return {
    extraTimes: _extraTimes,
    isLoading,
    isSuccess,
  }
}