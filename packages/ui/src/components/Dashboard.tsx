import { DASHBOARD_SECTIONS, NODE_TYPE } from "@/config";

export default function Dashboard() {
    return (
        <div className="flex flex-1">
            <div className="overflow-y-auto p-2 md:p-10 rounded-tl-2xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 flex flex-col gap-2 flex-1 w-full h-full">
                {DASHBOARD_SECTIONS[NODE_TYPE].map((section, index) => (
                    <div key={`section-${index}`}>
                        {section}
                    </div>
                ))}
            </div>
        </div>
    );
}
