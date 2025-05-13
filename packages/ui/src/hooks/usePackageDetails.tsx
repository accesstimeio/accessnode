import { Contract, SUPPORTED_CHAIN } from "@accesstimeio/accesstime-common";
import moment from "moment";
import { useEffect, useMemo } from "react";
import { Address, zeroAddress } from "viem";
import { useReadContracts } from "wagmi";

type PackageDetail = {
  id: string;
  active: boolean;
  time: string;
  formattedTime: string;
}

const accessTimePackageCall = {
  abi: Contract.abis.accessTime,
  functionName: "packages",
} as const;

export default function usePackageDetails({
  chainId,
  accessTimeAddress,
  packages,
  removedPackages
}: {
  chainId: SUPPORTED_CHAIN;
  accessTimeAddress: Address;
  packages: bigint[];
  removedPackages: bigint[]
}): {
  packages: PackageDetail[];
  isLoading: boolean;
  isSuccess: boolean;
} {


  const {
    data: packagesOnChain,
    isSuccess,
    isLoading,
    refetch: packagesOnChainRefetch,
  } = useReadContracts({
    query: {
      enabled: false
    },
    contracts: packages.map(_package => ({
      ...accessTimePackageCall,
      address: accessTimeAddress,
      chainId: chainId,
      args: [_package]
    })),
  });

  const _packages = useMemo(() => {
    if (!packagesOnChain || !isSuccess) {
      return [];
    }

    let availablePackages: PackageDetail[] = [];

    if (packagesOnChain && isSuccess) {
      availablePackages = packages.map((_package, index) => {
        const packageOnChain = packagesOnChain[index];

        let _active: boolean = false;
        let _time: string = "0";
        let _formattedTime: string = "0";

        if (packageOnChain.status == "success") {
          _time = packageOnChain.result[0].toString();
          _active = packageOnChain.result[1];

          _formattedTime = moment.duration(Number(_time), 'seconds').humanize()
        }

        return {
          id: _package.toString(),
          active: _active,
          time: _time,
          formattedTime: _formattedTime
        };
      });
    }

    const combinedPackages = [
      ...availablePackages,
      ...removedPackages.map((_package) => ({
        id: _package.toString(),
        active: false,
        time: "0",
        formattedTime: "0"
      })),
    ].flat();

    return combinedPackages;
  }, [packagesOnChain, isSuccess]);

  useEffect(() => {
    if (accessTimeAddress != zeroAddress) {
      packagesOnChainRefetch();
    }
  }, [accessTimeAddress != zeroAddress, chainId]);

  return {
    packages: _packages,
    isLoading,
    isSuccess,
  }
}