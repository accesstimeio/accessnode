"use client";
// tab-credits: https://21st.dev/originui/tabs/file-tabs
import { usePonderQuery } from "@ponder/react";
import { Check, CornerDownRight, ExternalLink, X } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Chain, Contract, Dashboard, getChainName, getFactoryAddress, Module, SUPPORTED_CHAIN } from "@accesstimeio/accesstime-common"
import { Address, zeroAddress } from "viem";

import Section from "../Section";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import * as fullSchema from "../../../../full/ponder.schema";
import { Label } from "../ui/label";
import CopyableAddress from "../CopyableAddress";
import { buttonVariants } from "../ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import usePaymentMethods from "@/hooks/usePaymentMethods";
import usePackageDetails from "@/hooks/usePackageDetails";
import useExtraTimeDetails from "@/hooks/useExtraTimeDetails";
import { useReadContract } from "wagmi";
import { Badge } from "../ui/badge";

const overviewTabClassName = "overflow-hidden rounded-b-none border-x border-t border-border bg-muted py-2 data-[state=active]:z-10 data-[state=active]:shadow-none";

export default function Overview() {
  const firstTab = useRef<HTMLButtonElement>(null);
  const [activeProject, setActiveProject] = useState<{
    chainId: number;
    accessTimeAddress: Address;
    packages: bigint[];
    removedPackages: bigint[];
    extraTimes: bigint[];
    removedExtraTimes: bigint[];
  }>({
    chainId: 0,
    accessTimeAddress: zeroAddress,
    packages: [],
    removedPackages: [],
    extraTimes: [],
    removedExtraTimes: [],
  });

  const { paymentMethods } = usePaymentMethods({
    chainId: activeProject.chainId as SUPPORTED_CHAIN,
    accessTimeAddress: activeProject.accessTimeAddress
  });

  const { packages } = usePackageDetails({
    chainId: activeProject.chainId as SUPPORTED_CHAIN,
    accessTimeAddress: activeProject.accessTimeAddress,
    packages: activeProject.packages,
    removedPackages: activeProject.removedPackages,
  });

  const { extraTimes } = useExtraTimeDetails({
    chainId: activeProject.chainId as SUPPORTED_CHAIN,
    accessTimeAddress: activeProject.accessTimeAddress,
    extraTimes: activeProject.extraTimes,
    removedExtraTimes: activeProject.removedExtraTimes,
  });

  const { data, isSuccess } = usePonderQuery({
    queryFn: (db) =>
      db
        .select()
        .from(fullSchema.accessTime)
  });

  const deployments = useMemo(() => {
    if (!isSuccess || !data) {
      return [];
    }

    return data;
  }, [isSuccess, data]);

  const {
    data: deploymentDetail,
    isSuccess: deploymentDetailSuccess,
    // isLoading: deploymentDetailLoading
  } = useReadContract({
    abi: Contract.abis.factory,
    functionName: "deploymentDetails",
    args: [activeProject.accessTimeAddress],
    address: getFactoryAddress(activeProject.chainId as SUPPORTED_CHAIN),
    chainId: activeProject.chainId
  });

  const modules = useMemo(() => {
    if (!deploymentDetail || !deploymentDetailSuccess) {
      return [];
    }

    const extraTimeModule = Dashboard.modules.find(module => module.type == "extra");
    const packageModule = Dashboard.modules.find(module => module.type == "package");
    const activeModules: Module[] = [];

    if (deploymentDetail[2] == true && extraTimeModule) {
      activeModules.push(extraTimeModule);
    }

    if (deploymentDetail[3] == true && packageModule) {
      activeModules.push(packageModule);
    }

    return activeModules;
  }, [deploymentDetail, deploymentDetailSuccess]);

  const setProject = useCallback((index: number) => {
    let packages: bigint[] = [];
    if (deployments[index].packages) {
      packages = deployments[index].packages;
    }
    let removedPackages: bigint[] = [];
    if (deployments[index].removedPackages) {
      removedPackages = deployments[index].removedPackages;
    }

    let extraTimes: bigint[] = [];
    if (deployments[index].extraTimes) {
      extraTimes = deployments[index].extraTimes;
    }
    let removedExtraTimes: bigint[] = [];
    if (deployments[index].removedExtraTimes) {
      removedExtraTimes = deployments[index].removedExtraTimes;
    }

    setActiveProject({
      chainId: deployments[index].chainId,
      accessTimeAddress: deployments[index].id,
      packages,
      removedPackages,
      extraTimes,
      removedExtraTimes
    });
  }, [deployments]);

  useEffect(() => {
    if (firstTab.current && deployments.length > 0) {
      firstTab.current.focus();
      setProject(0);
    }
  }, [deployments]);

  return (
    <Section title="Overview">
      <Tabs className="w-full" defaultValue="tab-1">
        <TabsList className="relative h-auto w-fit gap-0.5 bg-transparent p-0 px-2 before:absolute before:inset-x-0 before:bottom-0 before:h-px before:bg-border">
          {deployments.map((deployment, index) =>
            <TabsTrigger
              key={`overview-tab-${index}`}
              onClick={() => setProject(index)}
              ref={index == 0 ? firstTab : undefined}
              value={`tab-${index}`}
              className={overviewTabClassName}
            >
              [{getChainName(deployment.chainId as SUPPORTED_CHAIN)}] #{deployment.accessTimeId} Project</TabsTrigger>
          )}
        </TabsList>
        {
          deployments.map((deployment, index) => (
            <TabsContent key={`overview-tab-content-${index}`} value={`tab-${index}`}>
              <div className="grid md:grid-cols-2 gap-3">
                <div className="grid gap-3">
                  <div>
                    <Label>Project Name</Label>
                    <p>#{deployment.accessTimeId} Project</p>
                  </div>
                  <div>
                    <Label>Description</Label>
                    <p>example description</p>
                  </div>
                  <div>
                    <Label>Website</Label>
                    <p>fewfwe</p>
                  </div>
                  <div>
                    <Label>Contract Address</Label>
                    <CopyableAddress className="text-sm" address={deployment.id} />
                  </div>
                  <div>
                    <Label>Owner</Label>
                    <CopyableAddress className="text-sm" address={deployment.owner} />
                    {deployment.nextOwner && deployment.nextOwner != zeroAddress && (
                      <div className="flex flex-row text-xs items-center gap-1 ml-5">
                        <CornerDownRight className="text-neutral-700 dark:text-neutral-200 h-3 w-3 flex-shrink-0" />
                        <p>Next Owner:</p>
                        <CopyableAddress className="text-xs" address={deployment.nextOwner} />
                      </div>
                    )}
                  </div>
                  <div>
                    <Label>Modules</Label>
                    <div className="flex flex-row gap-1 pt-1">
                      {
                        modules.length > 0 ?
                          modules.map((module, index) => (
                            <Badge key={`${activeProject.accessTimeAddress}_module_${index}`}>{module.name}</Badge>
                          ))
                          :
                          "-"
                      }
                    </div>
                  </div>
                  <div>
                    <Label>Links</Label>
                    <div className="my-2 grid grid-cols-2 md:grid-cols-3 gap-3">
                      {
                        Chain.wagmiConfig.find(chain => chain.id == deployment.chainId) && (
                          <a href={`${Chain.wagmiConfig.find(chain => chain.id == deployment.chainId)?.blockExplorers.default.url}/address/${deployment.id}`} target="_blank" className={buttonVariants({ size: "sm" })}>
                            Explorer <ExternalLink />
                          </a>
                        )
                      }
                      <a href={`https://app.accesstime.io/#!/list/deployments/${deployment.chainId}/${deployment.accessTimeId}`} target="_blank" className={buttonVariants({ size: "sm" })}>
                        Dashboard <ExternalLink />
                      </a>
                      <a href={`https://portal.accesstime.io/subscription/${deployment.chainId}/${deployment.id}`} target="_blank" className={buttonVariants({ size: "sm" })}>
                        Portal <ExternalLink />
                      </a>
                    </div>
                  </div>
                </div>
                <div>
                  <Tabs className="w-full" defaultValue="payment-methods">
                    <TabsList className="w-full">
                      <TabsTrigger value="payment-methods">Payment Methods</TabsTrigger>
                      <TabsTrigger value="packages">Packages</TabsTrigger>
                      <TabsTrigger value="extratimes">Extra Times</TabsTrigger>
                    </TabsList>
                    <TabsContent value="payment-methods">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="w-[150px]">Currency</TableHead>
                            <TableHead>Symbol</TableHead>
                            <TableHead>Contract Address</TableHead>
                            <TableHead className="text-right">Balance</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {
                            paymentMethods.length > 0 ?
                              paymentMethods.map((paymentMethod, index) => (
                                <TableRow key={`${activeProject.accessTimeAddress}_paymentMethod_${index}`}>
                                  <TableCell className="font-medium">{paymentMethod.name}</TableCell>
                                  <TableCell>{paymentMethod.symbol}</TableCell>
                                  <TableCell><CopyableAddress className="text-sm" address={paymentMethod.address} /></TableCell>
                                  <TableCell className="text-right">{paymentMethod.balance}</TableCell>
                                </TableRow>
                              ))
                              :
                              <TableRow>
                                <TableCell colSpan={4} className="text-center">
                                  No results.
                                </TableCell>
                              </TableRow>
                          }
                        </TableBody>
                      </Table>
                    </TabsContent>
                    <TabsContent value="packages">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="w-[100px]">Id</TableHead>
                            <TableHead>Active</TableHead>
                            <TableHead className="text-right">Time</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {
                            packages.length > 0 ?
                              packages.map((_package, index) => (
                                <TableRow key={`${activeProject.accessTimeAddress}_package_${index}`}>
                                  <TableCell className="font-medium">{_package.id}</TableCell>
                                  <TableCell>
                                    {
                                      _package.active ?
                                        <Check className="text-green-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />
                                        :
                                        <X className="text-red-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />
                                    }
                                  </TableCell>
                                  <TableCell className="text-right">{_package.formattedTime}</TableCell>
                                </TableRow>
                              ))
                              :
                              <TableRow>
                                <TableCell colSpan={3} className="text-center">
                                  No results.
                                </TableCell>
                              </TableRow>
                          }
                        </TableBody>
                      </Table>
                    </TabsContent>
                    <TabsContent value="extratimes">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="w-[100px]">Id</TableHead>
                            <TableHead>Active</TableHead>
                            <TableHead className="text-right">Extra Percent</TableHead>
                            <TableHead className="text-right">Time</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {
                            extraTimes.length > 0 ?
                              extraTimes.map((_extraTime, index) => (
                                <TableRow key={`${activeProject.accessTimeAddress}_extratimes_${index}`}>
                                  <TableCell className="font-medium">{_extraTime.id}</TableCell>
                                  <TableCell>
                                    {
                                      _extraTime.active ?
                                        <Check className="text-green-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />
                                        :
                                        <X className="text-red-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />
                                    }
                                  </TableCell>
                                  <TableCell className="text-right">{_extraTime.percent} %</TableCell>
                                  <TableCell className="text-right">{_extraTime.formattedTime}</TableCell>
                                </TableRow>
                              ))
                              :
                              <TableRow>
                                <TableCell colSpan={3} className="text-center">
                                  No results.
                                </TableCell>
                              </TableRow>
                          }
                        </TableBody>
                      </Table>
                    </TabsContent>
                  </Tabs>
                </div>
              </div>
            </TabsContent>
          ))
        }
      </Tabs>
    </Section>
  );
}