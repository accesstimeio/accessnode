import { PonderProvider } from "@ponder/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { cn } from "./lib/utils";
import Sidebar from "./components/Sidebar";
import Dashboard from "./components/Dashboard";
import { client } from "./lib/ponder";
import { useState } from "react";

export default function App() {
    const [queryClient] = useState<QueryClient>(new QueryClient());
    return (
        <PonderProvider client={client}>
            <QueryClientProvider client={queryClient}>
                <div
                    className={cn(
                        "rounded-md flex flex-col md:flex-row bg-gray-100 dark:bg-neutral-800 w-full flex-1 max-w-7xl mx-auto border border-neutral-200 dark:border-neutral-700 overflow-hidden",
                        "h-screen"
                    )}
                >
                    <Sidebar />
                    <Dashboard />
                </div>
            </QueryClientProvider>
        </PonderProvider>
    );
}
