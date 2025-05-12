"use client";
// credits: https://21st.dev/aceternity/sidebar/default
import { useCallback, useState } from "react";
import { motion } from "framer-motion";

import { Sidebar as SidebarWrapper, SidebarBody, SidebarLink } from "./ui/sidebar";
import { NODE_TYPE, SIDEBAR_LINKS } from "@/config";
import { ModeToggle } from "./mode-toggle";
import { cx } from "class-variance-authority";

export default function Sidebar() {
    const [open, setOpen] = useState(false);
    const scrollToSection = useCallback((section: string) => {
        const element = document.getElementById(`section_${section.toLowerCase().split(" ").join()}`);
        element?.scrollIntoView({
            behavior: 'smooth'
        }); 
    }, []);
    return (
        <SidebarWrapper open={open} setOpen={setOpen}>
            <SidebarBody className="justify-between gap-10">
                <div className="flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
                    {open ? <Logo /> : <LogoIcon />}
                    <div className="mt-8 flex flex-col gap-2">
                        {SIDEBAR_LINKS[NODE_TYPE].map((link, idx) => (
                            <SidebarLink key={idx} link={link} onClick={() => scrollToSection(link.label)} />
                        ))}
                    </div>
                </div>
                <div className="flex flex-col    items-center">
                    <ModeToggle />
                    <p className={cx("text-xs font-bold", NODE_TYPE == "full" ? "text-orange-500" : "text-zinc-500")}>{NODE_TYPE.toUpperCase()}</p>
                </div>
            </SidebarBody>
        </SidebarWrapper>
    );
}

export const Logo = () => {
    return (
        <a
            href="#"
            className="font-normal flex space-x-2 items-center text-sm text-black py-1 relative z-20"
        >
            <img className="h-7 w-7" src="favicon.svg" alt="AccessTime" />
            <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="font-bold text-black dark:text-white whitespace-pre"
            >
                AccessNode
            </motion.span>
        </a>
    );
};

export const LogoIcon = () => {
    return (
        <a
            href="#"
            className="font-normal flex space-x-2 items-center text-sm text-black py-1 relative z-20"
        >
            <img className="h-7 w-7" src="favicon.svg" alt="AccessTime" />
        </a>
    );
};
