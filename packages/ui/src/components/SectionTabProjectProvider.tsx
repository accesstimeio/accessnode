"use client";
import { ComponentProps, createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { Address, zeroAddress } from "viem";
import { usePonderQuery } from "@ponder/react";
import { getChainName, SUPPORTED_CHAIN } from "@accesstimeio/accesstime-common";

import { tabClassName } from "@/config";
import { cn } from "@/lib/utils";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import Section from "./Section";

import { accessTime } from "../../../full/ponder.schema";

type ActiveProject = {
  id: number,
  owner: Address;
  nextOwner: Address;
  chainId: number;
  accessTimeId: string;
  accessTimeAddress: Address;
  packages: bigint[];
  removedPackages: bigint[];
  extraTimes: bigint[];
  removedExtraTimes: bigint[];
};

type TabProjectProviderState = {
  activeProject: ActiveProject;
}

const initialState: TabProjectProviderState = {
  activeProject: {
    id: 0,
    owner: zeroAddress,
    nextOwner: zeroAddress,
    chainId: 0,
    accessTimeId: "0",
    accessTimeAddress: zeroAddress,
    packages: [],
    removedPackages: [],
    extraTimes: [],
    removedExtraTimes: [],
  }
}

const TabProjectProviderContext = createContext<TabProjectProviderState>(initialState)

export function SectionTabProjectProvider({
  title,
  children,
  rightSection
}: {
  title: string;
  children: ReactNode;
  rightSection?: ComponentProps<typeof Section>["rightSection"];
}) {
  const firstTab = useRef<HTMLButtonElement>(null);
  const [activeProject, setActiveProject] = useState<ActiveProject>({
    id: 0,
    owner: zeroAddress,
    nextOwner: zeroAddress,
    chainId: 0,
    accessTimeId: "0",
    accessTimeAddress: zeroAddress,
    packages: [],
    removedPackages: [],
    extraTimes: [],
    removedExtraTimes: [],
  });

  const { data, isSuccess } = usePonderQuery({
    queryFn: (db) =>
      db
        .select({
          owner: accessTime.owner,
          nextOwner: accessTime.nextOwner,
          chainId: accessTime.chainId,
          accessTimeId: accessTime.accessTimeId,
          accessTimeAddress: accessTime.id,
          packages: accessTime.packages,
          removedPackages: accessTime.removedPackages,
          extraTimes: accessTime.extraTimes,
          removedExtraTimes: accessTime.removedExtraTimes,
        })
        .from(accessTime)
  });

  const deployments = useMemo(() => {
    if (!isSuccess || !data) {
      return [];
    }

    return data;
  }, [isSuccess, data]);

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
    let nextOwner: Address = zeroAddress;
    if (deployments[index].nextOwner) {
      nextOwner = deployments[index].nextOwner;
    }

    setActiveProject({
      id: index,
      owner: deployments[index].owner,
      nextOwner,
      chainId: deployments[index].chainId,
      accessTimeId: deployments[index].accessTimeId.toString(),
      accessTimeAddress: deployments[index].accessTimeAddress,
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
    <TabProjectProviderContext.Provider value={{ activeProject }}>
      <Section title={title} rightSection={rightSection}>
        <Tabs className="grid" defaultValue="tab-1">
          <div className="overflow-x-auto">
            <TabsList className={cn(
              "relative h-auto gap-0.5 bg-transparent p-0 px-2",
              "before:absolute before:inset-x-0 before:bottom-0 before:h-px before:bg-border"
            )}>
              {deployments.map((deployment, index) =>
                <TabsTrigger
                  key={`overview-tab-${index}`}
                  onClick={() => setProject(index)}
                  ref={index == 0 ? firstTab : undefined}
                  value={`tab-${index}`}
                  className={tabClassName}
                >
                  [{getChainName(deployment.chainId as SUPPORTED_CHAIN)}] #{deployment.accessTimeId} Project</TabsTrigger>
              )}
            </TabsList>
          </div>
          {
            deployments.map((_deployment, index) => (
              <TabsContent key={`overview-tab-content-${index}`} value={`tab-${index}`}>
                {children}
              </TabsContent>
            ))
          }
        </Tabs>
      </Section>
    </TabProjectProviderContext.Provider>
  );
}

export const useTabProject = () => {
  const context = useContext(TabProjectProviderContext);

  if (context === undefined)
    throw new Error("useTabProject must be used within a TabProjectProvider");

  return context;
}