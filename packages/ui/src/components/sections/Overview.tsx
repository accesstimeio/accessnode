"use client";
import { Check, CornerDownRight, ExternalLink, X } from "lucide-react";
import { useMemo } from "react";
import { Chain, Contract, Dashboard, getFactoryAddress, Module, SUPPORTED_CHAIN } from "@accesstimeio/accesstime-common"
import { zeroAddress } from "viem";
import { useReadContract } from "wagmi";

import usePaymentMethods from "@/hooks/usePaymentMethods";
import usePackageDetails from "@/hooks/usePackageDetails";
import useExtraTimeDetails from "@/hooks/useExtraTimeDetails";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Label } from "../ui/label";
import CopyableAddress from "../CopyableAddress";
import { buttonVariants } from "../ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { Badge } from "../ui/badge";
import { SectionTabProjectProvider, useTabProject } from "../SectionTabProjectProvider";
import { Skeleton } from "../ui/skeleton";

function OverviewContent() {
  const { activeProject } = useTabProject();

  const {
    data: deploymentDetail,
    isSuccess: deploymentDetailSuccess,
    isLoading: deploymentDetailLoading
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

  const projectDetails = useMemo(() => {
    if (!deploymentDetail || !deploymentDetailSuccess || deploymentDetail[0] == false) {
      return {
        name: `#${activeProject.id} Project`,
        description: "-",
        website: "-"
      };
    }

    return {
      name: deploymentDetail[4],
      description: deploymentDetail[5],
      website: deploymentDetail[6]
    };
  }, [activeProject, deploymentDetail, deploymentDetailSuccess]);

  const { paymentMethods, isLoading: paymentMethodsLoading } = usePaymentMethods({
    chainId: activeProject.chainId as SUPPORTED_CHAIN,
    accessTimeAddress: activeProject.accessTimeAddress
  });

  const { packages, isLoading: packagesLoading } = usePackageDetails({
    chainId: activeProject.chainId as SUPPORTED_CHAIN,
    accessTimeAddress: activeProject.accessTimeAddress,
    packages: activeProject.packages,
    removedPackages: activeProject.removedPackages,
  });

  const { extraTimes, isLoading: extraTimesLoading } = useExtraTimeDetails({
    chainId: activeProject.chainId as SUPPORTED_CHAIN,
    accessTimeAddress: activeProject.accessTimeAddress,
    extraTimes: activeProject.extraTimes,
    removedExtraTimes: activeProject.removedExtraTimes,
  });

  return (
    <div className="grid md:grid-cols-2 gap-3">
      {
        deploymentDetailLoading ? (
          <div className="grid gap-3">
            <div>
              <Label>Project Name</Label>
              <Skeleton className="w-[200px] h-[20px] rounded-lg" />
            </div>
            <div>
              <Label>Description</Label>
              <Skeleton className="w-[200px] h-[20px] rounded-lg" />
            </div>
            <div>
              <Label>Website</Label>
              <Skeleton className="w-[100px] h-[20px] rounded-lg" />
            </div>
            <div>
              <Label>Contract Address</Label>
              <Skeleton className="w-[150px] h-[20px] rounded-lg" />
            </div>
            <div>
              <Label>Owner</Label>
              <Skeleton className="w-[150px] h-[20px] rounded-lg" />
            </div>
            <div>
              <Label>Modules</Label>
              <div className="flex flex-row gap-1 pt-1">
                <Skeleton className="w-[85px] h-[22px] rounded-lg" />
                <Skeleton className="w-[85px] h-[22px] rounded-lg" />
              </div>
            </div>
            <div>
              <Label>Links</Label>
              <div className="my-2 grid grid-cols-2 md:grid-cols-3 gap-3">
                <Skeleton className="h-[32px] rounded-lg" />
                <Skeleton className="h-[32px] rounded-lg" />
                <Skeleton className="h-[32px] rounded-lg" />
              </div>
            </div>
          </div>
        ) : (
          <div className="grid gap-3">
            <div>
              <Label>Project Name</Label>
              <p>{projectDetails.name}</p>
            </div>
            <div>
              <Label>Description</Label>
              <p>{projectDetails.description}</p>
            </div>
            <div>
              <Label>Website</Label>
              <p>{projectDetails.website}</p>
            </div>
            <div>
              <Label>Contract Address</Label>
              <CopyableAddress className="text-sm" address={activeProject.accessTimeAddress} />
            </div>
            <div>
              <Label>Owner</Label>
              <CopyableAddress className="text-sm" address={activeProject.owner} />
              {activeProject.nextOwner && activeProject.nextOwner != zeroAddress && (
                <div className="flex flex-row text-xs items-center gap-1 ml-5">
                  <CornerDownRight className="text-neutral-700 dark:text-neutral-200 h-3 w-3 flex-shrink-0" />
                  <p>Next Owner:</p>
                  <CopyableAddress className="text-xs" address={activeProject.nextOwner} />
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
                  Chain.wagmiConfig.find(chain => chain.id == activeProject.chainId) && (
                    <a href={`${Chain.wagmiConfig.find(chain => chain.id == activeProject.chainId)?.blockExplorers.default.url}/address/${activeProject.accessTimeAddress}`} target="_blank" className={buttonVariants({ size: "sm" })}>
                      Explorer <ExternalLink />
                    </a>
                  )
                }
                <a href={`https://app.accesstime.io/#!/list/deployments/${activeProject.chainId}/${activeProject.accessTimeId}`} target="_blank" className={buttonVariants({ size: "sm" })}>
                  Dashboard <ExternalLink />
                </a>
                <a href={`https://portal.accesstime.io/subscription/${activeProject.chainId}/${activeProject.accessTimeAddress}`} target="_blank" className={buttonVariants({ size: "sm" })}>
                  Portal <ExternalLink />
                </a>
              </div>
            </div>
          </div>
        )
      }
      <div className="overflow-x-auto">
        <Tabs className="w-full" defaultValue="payment-methods">
          <TabsList className="w-full">
            <TabsTrigger value="payment-methods">Payment Methods</TabsTrigger>
            <TabsTrigger value="packages">Packages</TabsTrigger>
            <TabsTrigger value="extratimes">Extra Times</TabsTrigger>
          </TabsList>
          <TabsContent className="overflow-x-auto" value="payment-methods">
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
                  paymentMethodsLoading ? (
                    <TableRow>
                      <TableCell colSpan={4}>
                        <Skeleton className="h-[27px] rounded-none" />
                      </TableCell>
                    </TableRow>
                  ) : (
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
                  )
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
                  packagesLoading ? (
                    <TableRow>
                      <TableCell colSpan={4}>
                        <Skeleton className="h-[27px] rounded-none" />
                      </TableCell>
                    </TableRow>
                  ) : (
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
                  )
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
                  extraTimesLoading ? (
                    <TableRow>
                      <TableCell colSpan={4}>
                        <Skeleton className="h-[27px] rounded-none" />
                      </TableCell>
                    </TableRow>
                  ) : (
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
                  )
                }
              </TableBody>
            </Table>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

export default function Overview() {
  return (
    <SectionTabProjectProvider title="Overview">
      <OverviewContent />
    </SectionTabProjectProvider>
  );
}
