import { getChainCurrencyDecimals, getChainCurrencySymbol, getChainName, SUPPORTED_CHAIN } from "@accesstimeio/accesstime-common"
import { and, eq } from "@ponder/client";
import { useBalance, useReadContracts } from "wagmi";
import { Address, erc20Abi, formatUnits, zeroAddress } from "viem";
import { usePonderQuery } from "@ponder/react";

import * as fullSchema from "../../../full/ponder.schema";
import { useEffect, useMemo } from "react";

const tokenContractBalanceCall = {
  abi: erc20Abi,
  functionName: "balanceOf",
} as const;

const tokenContractDecimalCall = {
  abi: erc20Abi,
  functionName: "decimals",
} as const;

const tokenContractNameCall = {
  abi: erc20Abi,
  functionName: "name",
} as const;

type PaymentMethodDetail = {
  symbol: string;
  address: Address;
  balance: string;
  name: string;
}

export default function usePaymentMethods({ chainId, accessTimeAddress }: {
  chainId: SUPPORTED_CHAIN;
  accessTimeAddress: Address;
}): {
  paymentMethods: PaymentMethodDetail[];
  isLoading: boolean;
  isSuccess: boolean;
} {
  const {
    data: paymentMethodDetails,
    isSuccess: paymentMethodDetailsSuccess,
    isLoading: paymentMethodDetailsLoading,
    refetch: paymentMethodDetailsRefetch,
  } = usePonderQuery({
    enabled: false,
    queryFn: (db) =>
      db
        .selectDistinctOn([fullSchema.purchase.symbol], {
          symbol: fullSchema.purchase.symbol,
          address: fullSchema.purchase.paymentMethod,
        })
        .from(fullSchema.purchase)
        .where(and(
          eq(fullSchema.purchase.chainId, chainId),
          eq(fullSchema.purchase.accessTimeAddress, accessTimeAddress)
        ))
  });

  const {
    data: paymentMethodOnChain,
    isSuccess: paymentMethodOnChainSuccess,
    isLoading: paymentMethodOnChainLoading,
    refetch: paymentMethodOnChainRefetch,
  } = useReadContracts({
    query: {
      enabled: false
    },
    contracts: [
      paymentMethodDetails?.filter((pm => pm.address != zeroAddress))
        .map(paymentMethod => ({
          ...tokenContractBalanceCall,
          address: paymentMethod.address,
          chainId: chainId,
          args: [accessTimeAddress]
        })),
      paymentMethodDetails?.filter((pm => pm.address != zeroAddress))
        .map(paymentMethod => ({
          ...tokenContractDecimalCall,
          chainId: chainId,
          address: paymentMethod.address
        })),
      paymentMethodDetails?.filter((pm => pm.address != zeroAddress))
        .map(paymentMethod => ({
          ...tokenContractNameCall,
          chainId: chainId,
          address: paymentMethod.address
        })),
    ].filter((call) => call != undefined).flat(),
  });

  const {
    data: etherBalance,
    isSuccess: etherBalanceSuccess,
    isLoading: etherBalanceLoading,
    refetch: etherBalanceRefetch,
  } = useBalance({
    query: {
      enabled: false,
    },
    address: accessTimeAddress,
    chainId
  });

  const paymentMethods = useMemo(() => {
    if (!paymentMethodDetailsSuccess || !paymentMethodDetails) {
      return [];
    }

    let data: PaymentMethodDetail[] = paymentMethodDetails.map((paymentMethod) => ({
      ...paymentMethod,
      balance: "0",
      name: "TKN"
    }));

    if (paymentMethodOnChain && paymentMethodOnChainSuccess) {
      const etherAccepted = data.findIndex(pm => pm.address == zeroAddress);
      const nonEtherMethods = data
        .filter((pm) => pm.address != zeroAddress)
        .map((pm, index) => {
          const onChainBalance = paymentMethodOnChain[(index * 3)];
          const onChainDecimal = paymentMethodOnChain[(index * 3) + 1];
          const onChainName = paymentMethodOnChain[(index * 3) + 2];

          let _balance: string | bigint = pm.balance;
          let _decimal: number = 18;
          let _name: string = pm.name;

          if (onChainBalance.status == "success") {
            _balance = onChainBalance.result as bigint;
          }

          if (onChainDecimal.status == "success") {
            _decimal = onChainDecimal.result as number;
          }

          if (onChainName.status == "success") {
            _name = onChainName.result as string;
          }

          return {
            ...pm,
            name: _name,
            balance: formatUnits(BigInt(_balance), _decimal)
          };
        });

      data = [
        etherBalanceSuccess && etherAccepted != -1 ? [{
          symbol: getChainCurrencySymbol(chainId),
          address: zeroAddress,
          balance: formatUnits(etherBalance.value, getChainCurrencyDecimals(chainId)),
          name: `[ETH] ${getChainName(chainId)}`
        }] : [],
        nonEtherMethods
      ].flat();
    }

    return data;
  }, [
    paymentMethodDetails,
    paymentMethodDetailsSuccess,
    paymentMethodOnChain,
    paymentMethodOnChainSuccess,
    etherBalance,
    etherBalanceSuccess
  ]);

  const isLoading = useMemo(
    () =>
      paymentMethodDetailsLoading ||
      paymentMethodOnChainLoading ||
      etherBalanceLoading,
    [
      paymentMethodDetailsLoading,
      paymentMethodOnChainLoading,
      etherBalanceLoading
    ]
  );

  const isSuccess = useMemo(
    () =>
      paymentMethodDetailsSuccess ||
      paymentMethodOnChainSuccess ||
      etherBalanceSuccess,
    [
      paymentMethodDetailsSuccess,
      paymentMethodOnChainSuccess,
      etherBalanceSuccess
    ]
  );

  useEffect(() => {
    if (accessTimeAddress != zeroAddress) {
      paymentMethodDetailsRefetch();
      etherBalanceRefetch();
    }
  }, [accessTimeAddress, chainId]);

  useEffect(() => {
    if (paymentMethodDetails) {
      paymentMethodOnChainRefetch();
    }
  }, [paymentMethodDetails]);

  return {
    paymentMethods,
    isLoading,
    isSuccess
  };
}
