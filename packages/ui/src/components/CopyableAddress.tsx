"use client"
// credits: https://21st.dev/kroist/copyableaddress/default
import { cn } from "@/lib/utils";
import { Check, Copy } from "lucide-react";
import { useState } from "react";

export interface CopyableAddressProps {
  className?: string;
  address: string;
}

export default function CopyableAddress(props: CopyableAddressProps) {
  const [isCopied, setIsCopied] = useState(false);

  const truncateAddress = (addr: string) => {
    if (addr.length > 13) {
      return `${addr.slice(0, 5)}...${addr.slice(-5)}`;
    }
    return addr;
  };

  const copyAddress = (addr: string) => {
    navigator.clipboard.writeText(addr);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div
      className={cn(
        props.className,
        "flex items-center space-x-1 font-mono cursor-pointer",
        "transition-colors duration-200 ease-in-out",
        isCopied ? "text-green-500" : "hover:text-blue-500"
      )}
      onClick={() => copyAddress(props.address)}
    >
      <div>{truncateAddress(props.address)}</div>
      <div className="transition-transform duration-200 ease-in-out">
        {isCopied ? (
          <Check className="h-3 w-3" />
        ) : (
          <Copy className="h-3 w-3" />
        )}
      </div>
    </div>
  );
};