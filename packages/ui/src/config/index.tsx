import { ReactNode } from "react";
import { Receipt, UserRound, FileUser } from "lucide-react";

import Purchases from "@/components/sections/Purchases";
import AccessTimeUsers from "@/components/sections/AccessTimeUsers";
import Users from "@/components/sections/Users";

type SidebarLink = {
    label: string,
    href: string,
    icon: ReactNode
};
type SupportNodeType = "light" | "full";
const sidebarIconClassNames = "text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0";

export const SUPPORTED_NODE_TYPES: SupportNodeType[] = ["light", "full"];
export const SIDEBAR_LINKS: Record<SupportNodeType, SidebarLink[]> = {
    light: [
        {
            label: "Purchases",
            href: "#",
            icon: <Receipt className={sidebarIconClassNames} />,
        },
        {
            label: "AccessTime Users",
            href: "#",
            icon: <FileUser className={sidebarIconClassNames} />,
        },
        {
            label: "Users",
            href: "#",
            icon: <UserRound className={sidebarIconClassNames} />,
        }
    ],
    full: []
};
export const DASHBOARD_SECTIONS: Record<SupportNodeType, ReactNode[]> = {
    light: [<Purchases />, <AccessTimeUsers />, <Users />],
    full: []
}
