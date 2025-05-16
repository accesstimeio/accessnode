import { ReactNode } from "react";
import { Receipt, UserRound, FileUser, BriefcaseBusiness, ChartArea, Vote } from "lucide-react";

export const NODE_TYPE = import.meta.env.VITE_ACCESSNODE_TYPE ? import.meta.env.VITE_ACCESSNODE_TYPE : "light";
export const NODE_URL = import.meta.env.VITE_ACCESSNODE_URL ? import.meta.env.VITE_ACCESSNODE_URL : "http://localhost:42069";

import Purchases from "@/components/sections/Purchases";
import AccessTimeUsers from "@/components/sections/AccessTimeUsers";
import Users from "@/components/sections/Users";
import Overview from "@/components/sections/Overview";
import Votes from "@/components/sections/Votes";
import Statistics from "@/components/sections/Statistics";

type SidebarLink = {
    label: string,
    href: string,
    icon: ReactNode
};
type SupportNodeType = "light" | "full";
const sidebarIconClassNames = "text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0";
export const tabClassName = "cursor-pointer overflow-hidden rounded-b-none border-x border-t border-border bg-muted py-2 data-[state=active]:z-10 data-[state=active]:shadow-none";

export const SUPPORTED_NODE_TYPES: SupportNodeType[] = ["light", "full"];
export const SIDEBAR_LINKS: Record<SupportNodeType, SidebarLink[]> = {
    light: [
        {
            label: "Purchases",
            href: "#",
            icon: <Receipt className={sidebarIconClassNames} />,
        },
        {
            label: "AccessTimeUsers",
            href: "#",
            icon: <FileUser className={sidebarIconClassNames} />,
        },
        {
            label: "Users",
            href: "#",
            icon: <UserRound className={sidebarIconClassNames} />,
        }
    ],
    full: [
        {
            label: "Overview",
            href: "#",
            icon: <BriefcaseBusiness className={sidebarIconClassNames} />,
        },
        {
            label: "Purchases",
            href: "#",
            icon: <Receipt className={sidebarIconClassNames} />,
        },
        {
            label: "AccessTimeUsers",
            href: "#",
            icon: <FileUser className={sidebarIconClassNames} />,
        },
        {
            label: "Users",
            href: "#",
            icon: <UserRound className={sidebarIconClassNames} />,
        },
        {
            label: "Statistics",
            href: "#",
            icon: <ChartArea className={sidebarIconClassNames} />,
        },
        {
            label: "Votes",
            href: "#",
            icon: <Vote className={sidebarIconClassNames} />,
        },
    ]
};
export const DASHBOARD_SECTIONS: Record<SupportNodeType, ReactNode[]> = {
    light: [<Purchases />, <AccessTimeUsers />, <Users />],
    full: [
        <Overview />,
        <Purchases />,
        <AccessTimeUsers />,
        <Users />,
        <Statistics />,
        <Votes />
    ]
}

export const defaultTimeTick = 48; // weekly -> 12 as monthly
