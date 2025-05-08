import { ChevronFirst, ChevronLast, ChevronLeft, ChevronRight } from "lucide-react";
import { Label } from "../ui/label";
import { Pagination, PaginationContent, PaginationItem } from "../ui/pagination";
import { Skeleton } from "../ui/skeleton";
import H1 from "../ui/typography/h1";
import { Button } from "../ui/button";

export default function Section({ title }: {title: string}) {
    return (
        <div id={`section_${title.toLowerCase().split(" ").join()}`} className="grid gap-3 my-3">
          <div className="grid gap-3 md:grid-cols-2 pb-3 border-b-1">
            <H1 content={title} />
            <div className="flex flex-col items-end">
                <Skeleton className="w-[147px] h-[36px] rounded-lg" />
            </div>
          </div>
          <div className="flex items-center gap-3 overflow-y-auto">
            <Skeleton className="w-[108px] h-[36px] rounded-lg" />
            <Skeleton className="w-[108px] h-[36px] rounded-lg" />
            <Skeleton className="w-[108px] h-[36px] rounded-lg" />
          </div>
          <Skeleton className="w-full h-[414px] rounded-none" />
    
          <div className="flex items-center justify-between gap-8">
            <div className="flex items-center gap-3">
              <Label className="max-sm:sr-only">
                Rows per page
              </Label>
              <Skeleton className="w-[65px] h-[36px] rounded-lg" />
            </div>
            <div className="flex grow justify-end whitespace-nowrap text-sm text-muted-foreground">
                <Skeleton className="w-[36px] h-[20px] rounded-none" />
            </div>
    
            <div>
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <Button
                      size="icon"
                      variant="outline"
                      className="disabled:pointer-events-none disabled:opacity-50"
                      disabled={true}
                      aria-label="Go to first page"
                    >
                      <ChevronFirst size={16} strokeWidth={2} aria-hidden="true" />
                    </Button>
                  </PaginationItem>
                  <PaginationItem>
                    <Button
                      size="icon"
                      variant="outline"
                      className="disabled:pointer-events-none disabled:opacity-50"
                      disabled={true}
                      aria-label="Go to previous page"
                    >
                      <ChevronLeft size={16} strokeWidth={2} aria-hidden="true" />
                    </Button>
                  </PaginationItem>
                  <PaginationItem>
                    <Button
                      size="icon"
                      variant="outline"
                      className="disabled:pointer-events-none disabled:opacity-50"
                      disabled={true}
                      aria-label="Go to next page"
                    >
                      <ChevronRight size={16} strokeWidth={2} aria-hidden="true" />
                    </Button>
                  </PaginationItem>
                  <PaginationItem>
                    <Button
                      size="icon"
                      variant="outline"
                      className="disabled:pointer-events-none disabled:opacity-50"
                      disabled={true}
                      aria-label="Go to last page"
                    >
                      <ChevronLast size={16} strokeWidth={2} aria-hidden="true" />
                    </Button>
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          </div>
        </div>
      );
}