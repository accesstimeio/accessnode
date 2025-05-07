"use client";
import { ColumnFiltersState, createColumnHelper, getCoreRowModel, getFacetedUniqueValues, getFilteredRowModel, getPaginationRowModel, getSortedRowModel, PaginationState, SortingState, useReactTable, VisibilityState } from "@tanstack/react-table";
import { useId, useMemo, useState } from "react";
import { Address } from "ox/Address";
import { Hex } from "ox/Hex";
import Section from "../Section";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Button } from "../ui/button";
import { Filter } from "lucide-react";
import { Label } from "../ui/label";
import { Checkbox } from "../ui/checkbox";

type PurchaseDto = {
  paymentMethod: Address;
  timestamp: string;
  paymentAmount: string;
  accessTimeAddress: Address;
  accessTimeUserId: Hex;
  address: Address;
  amount: string;
  chainId: number;
  id: Hex;
  packageId: string;
}

const columnHelper = createColumnHelper<PurchaseDto>();

const items = [
  {
    "paymentMethod": "0xb12604240ab6a2a43c01a86942ecdf8572ff48ea",
    "timestamp": "1742756604",
    "paymentAmount": "2000000",
    "accessTimeAddress": "0xb57527fe48680f4648873ae6fec84b3837317c54",
    "accessTimeUserId": "0xe1d1a1d0a127bc689cfe38d7d7084b445ed411636694a797b629fb16c0b2ed74",
    "address": "0xb82e5804935b4ee8cc7c0bd3f2a1d3aba85d0c48",
    "amount": "3600",
    "chainId": 84532,
    "id": "0x2fc259141dacd4eae8cfe112cbc1b6cf5a3d1dcd6638a9f9ee7aa96b19855605",
    "packageId": "-1"
  },
  {
    "paymentMethod": "0xb12604240ab6a2a43c01a86942ecdf8572ff48ea",
    "timestamp": "1742236574",
    "paymentAmount": "2000000",
    "accessTimeAddress": "0xb57527fe48680f4648873ae6fec84b3837317c54",
    "accessTimeUserId": "0xe1d1a1d0a127bc689cfe38d7d7084b445ed411636694a797b629fb16c0b2ed74",
    "address": "0xb82e5804935b4ee8cc7c0bd3f2a1d3aba85d0c48",
    "amount": "3600",
    "chainId": 84532,
    "id": "0x4cb028d38d2afa3a99c01108d4b6b4022a8b0a615373ba383fdf859a4ca9a849",
    "packageId": "-1"
  },
  {
    "paymentMethod": "0xb12604240ab6a2a43c01a86942ecdf8572ff48ea",
    "timestamp": "1741595876",
    "paymentAmount": "2000000",
    "accessTimeAddress": "0xb57527fe48680f4648873ae6fec84b3837317c54",
    "accessTimeUserId": "0xe1d1a1d0a127bc689cfe38d7d7084b445ed411636694a797b629fb16c0b2ed74",
    "address": "0xb82e5804935b4ee8cc7c0bd3f2a1d3aba85d0c48",
    "amount": "3600",
    "chainId": 84532,
    "id": "0x4f5fcd8d6cad3fdb4454fad80f80c21d7a93cf682176c459c2b43e4bed126286",
    "packageId": "-1"
  },
  {
    "paymentMethod": "0xb12604240ab6a2a43c01a86942ecdf8572ff48ea",
    "timestamp": "1741599532",
    "paymentAmount": "2000000",
    "accessTimeAddress": "0xb57527fe48680f4648873ae6fec84b3837317c54",
    "accessTimeUserId": "0xe1d1a1d0a127bc689cfe38d7d7084b445ed411636694a797b629fb16c0b2ed74",
    "address": "0xb82e5804935b4ee8cc7c0bd3f2a1d3aba85d0c48",
    "amount": "3600",
    "chainId": 84532,
    "id": "0x54b4b754f621598422fd90afb636c01b88cb3369b4f7a67cdf34313bdda0a140",
    "packageId": "-1"
  },
  {
    "paymentMethod": "0x0000000000000000000000000000000000000000",
    "timestamp": "1741082460",
    "paymentAmount": "4000000000000000",
    "accessTimeAddress": "0xb57527fe48680f4648873ae6fec84b3837317c54",
    "accessTimeUserId": "0x215cb0a20a070c19978f15a50c1ca3ddfd4823964b4ec4e4e75ed567be480aa1",
    "address": "0x93453f31d0279b90391d9870daff35055ef49bac",
    "amount": "14400",
    "chainId": 84532,
    "id": "0x6336d051d10742ae211fceadf423f9477960c7824c2798ee0f23f80183f5f476",
    "packageId": "-1"
  },
  {
    "paymentMethod": "0xb12604240ab6a2a43c01a86942ecdf8572ff48ea",
    "timestamp": "1745256720",
    "paymentAmount": "2000000",
    "accessTimeAddress": "0xb57527fe48680f4648873ae6fec84b3837317c54",
    "accessTimeUserId": "0xe1d1a1d0a127bc689cfe38d7d7084b445ed411636694a797b629fb16c0b2ed74",
    "address": "0xb82e5804935b4ee8cc7c0bd3f2a1d3aba85d0c48",
    "amount": "3600",
    "chainId": 84532,
    "id": "0x63d81b82a600314b0ab8f7b28ca73a98e723d4707155a46549de8f145c70fdb1",
    "packageId": "-1"
  },
  {
    "paymentMethod": "0xb12604240ab6a2a43c01a86942ecdf8572ff48ea",
    "timestamp": "1742236926",
    "paymentAmount": "2000000",
    "accessTimeAddress": "0xb57527fe48680f4648873ae6fec84b3837317c54",
    "accessTimeUserId": "0xe1d1a1d0a127bc689cfe38d7d7084b445ed411636694a797b629fb16c0b2ed74",
    "address": "0xb82e5804935b4ee8cc7c0bd3f2a1d3aba85d0c48",
    "amount": "3600",
    "chainId": 84532,
    "id": "0x6ff9fba1e6620ae021f9424c3b642e024de664acade2960faaba4639676889a6",
    "packageId": "-1"
  },
  {
    "paymentMethod": "0xb12604240ab6a2a43c01a86942ecdf8572ff48ea",
    "timestamp": "1744907360",
    "paymentAmount": "2000000",
    "accessTimeAddress": "0xb57527fe48680f4648873ae6fec84b3837317c54",
    "accessTimeUserId": "0xe1d1a1d0a127bc689cfe38d7d7084b445ed411636694a797b629fb16c0b2ed74",
    "address": "0xb82e5804935b4ee8cc7c0bd3f2a1d3aba85d0c48",
    "amount": "3600",
    "chainId": 84532,
    "id": "0x7f7502d1ef7970043c8ebce2ea94112cffd45a122fb2315ae65f588e0ffb5d7c",
    "packageId": "-1"
  },
  {
    "paymentMethod": "0x0000000000000000000000000000000000000000",
    "timestamp": "1741979038",
    "paymentAmount": "100000000000000",
    "accessTimeAddress": "0xb57527fe48680f4648873ae6fec84b3837317c54",
    "accessTimeUserId": "0x4a40e9d6974c69ff5109bddfca137229d62379859a7d955850f6a16b513b9843",
    "address": "0xcc022ff1d4466bd99824f869c3e28e4596d456b4",
    "amount": "360",
    "chainId": 84532,
    "id": "0xaf0c2293ecbd8f04b15eefff3326e442eb765196fa84fee0b1e42eaafafff9c8",
    "packageId": "-1"
  },
  {
    "paymentMethod": "0x0000000000000000000000000000000000000000",
    "timestamp": "1741979262",
    "paymentAmount": "100000000000000",
    "accessTimeAddress": "0xb57527fe48680f4648873ae6fec84b3837317c54",
    "accessTimeUserId": "0x4a40e9d6974c69ff5109bddfca137229d62379859a7d955850f6a16b513b9843",
    "address": "0xcc022ff1d4466bd99824f869c3e28e4596d456b4",
    "amount": "360",
    "chainId": 84532,
    "id": "0xb0dc2cd037d339457cbdab7976128edefd855df9cca0a497bb8a596f4fed0342",
    "packageId": "-1"
  },
  {
    "paymentMethod": "0xb12604240ab6a2a43c01a86942ecdf8572ff48ea",
    "timestamp": "1740125306",
    "paymentAmount": "2000000",
    "accessTimeAddress": "0xb57527fe48680f4648873ae6fec84b3837317c54",
    "accessTimeUserId": "0xe1d1a1d0a127bc689cfe38d7d7084b445ed411636694a797b629fb16c0b2ed74",
    "address": "0xb82e5804935b4ee8cc7c0bd3f2a1d3aba85d0c48",
    "amount": "3600",
    "chainId": 84532,
    "id": "0xbbf6512173d0110cbf84bbdd40f3ae62977d392d6bed36aef3701822cb1bee1f",
    "packageId": "-1"
  },
  {
    "paymentMethod": "0xb12604240ab6a2a43c01a86942ecdf8572ff48ea",
    "timestamp": "1744657822",
    "paymentAmount": "2000000",
    "accessTimeAddress": "0xb57527fe48680f4648873ae6fec84b3837317c54",
    "accessTimeUserId": "0xe1d1a1d0a127bc689cfe38d7d7084b445ed411636694a797b629fb16c0b2ed74",
    "address": "0xb82e5804935b4ee8cc7c0bd3f2a1d3aba85d0c48",
    "amount": "3600",
    "chainId": 84532,
    "id": "0xc3da07a07edbfbbc4949374e312d6a039514e1f2aaf2a523b947de88488be13f",
    "packageId": "-1"
  },
  {
    "paymentMethod": "0x0000000000000000000000000000000000000000",
    "timestamp": "1741945332",
    "paymentAmount": "1000000000000000",
    "accessTimeAddress": "0xb57527fe48680f4648873ae6fec84b3837317c54",
    "accessTimeUserId": "0x1e0b72ccf506342083feafacf69e43d6c424a2e533fa334b7c5ad21e781da976",
    "address": "0x647d80b8a077fec2a594267807fe57d5d16d2750",
    "amount": "3600",
    "chainId": 84532,
    "id": "0xd9a6d051e64f915a3bbf0b184aef7927025a1aff11e62e6aeaf51f95f3e21887",
    "packageId": "-1"
  },
  {
    "paymentMethod": "0x0000000000000000000000000000000000000000",
    "timestamp": "1742236182",
    "paymentAmount": "1000000000000000",
    "accessTimeAddress": "0xb57527fe48680f4648873ae6fec84b3837317c54",
    "accessTimeUserId": "0x95d4ebf3a18471e7fdb076680aa9f2b5b6bff3fd3c61d7844a4ef35ef1825067",
    "address": "0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266",
    "amount": "3600",
    "chainId": 84532,
    "id": "0xe69cca064bd1761dfc7b2f8c5cb867f4a91512a7c49cd4b109ab6d49bb22145e",
    "packageId": "-1"
  },
  {
    "paymentMethod": "0xb12604240ab6a2a43c01a86942ecdf8572ff48ea",
    "timestamp": "1742236806",
    "paymentAmount": "2000000",
    "accessTimeAddress": "0xb57527fe48680f4648873ae6fec84b3837317c54",
    "accessTimeUserId": "0xe1d1a1d0a127bc689cfe38d7d7084b445ed411636694a797b629fb16c0b2ed74",
    "address": "0xb82e5804935b4ee8cc7c0bd3f2a1d3aba85d0c48",
    "amount": "3600",
    "chainId": 84532,
    "id": "0xf4b6c90d8b8b45b0b71da566961eacb5d348a3c2580bdb69f11182be11676e45",
    "packageId": "-1"
  }
];

export default function Purchases() {
  const id = useId();
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const [sorting, setSorting] = useState<SortingState>([
    {
      id: "timestamp",
      desc: true,
    },
  ]);

  const tableColumns = useMemo(
    () => [
      columnHelper.accessor('paymentMethod', {
        header: 'Payment Method',
      }),
      columnHelper.accessor('timestamp', {
        header: 'Timestamp',
      }),
      columnHelper.accessor('paymentAmount', {
        header: 'Amount',
      }),
      columnHelper.accessor('accessTimeAddress', {
        header: 'AccessTime',
      }),
      columnHelper.accessor('accessTimeUserId', {
        header: 'AccessTimeUser Id',
      }),
      columnHelper.accessor('address', {
        header: 'User Wallet',
      }),
      columnHelper.accessor('amount', {
        header: 'Time',
      }),
      columnHelper.accessor('chainId', {
        header: 'Chain Id',
      }),
      columnHelper.accessor('id', {
        header: 'Purchase Id',
      }),
      columnHelper.accessor('packageId', {
        header: 'Package Id',
      }),
    ],
    []
  );

  const table = useReactTable({
    data: items,
    columns: tableColumns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSorting,
    enableSortingRemoval: false,
    getPaginationRowModel: getPaginationRowModel(),
    onPaginationChange: setPagination,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    getFilteredRowModel: getFilteredRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    state: {
      sorting,
      pagination,
      columnFilters,
      columnVisibility,
    },
  });

  const uniquePackageIds = useMemo(() => {
    const packageIdColumn = table.getColumn("packageId");

    if (!packageIdColumn) return [];

    const values = Array.from(packageIdColumn.getFacetedUniqueValues().keys());

    return values.sort();
  }, [table.getColumn("packageId")?.getFacetedUniqueValues()]);
  
  const packageIdCount = useMemo(() => {
    const packageIdColumn = table.getColumn("packageId");
    if (!packageIdColumn) return new Map();
    return packageIdColumn.getFacetedUniqueValues();
  }, [table.getColumn("packageId")?.getFacetedUniqueValues()]);

  const selectedPackageIds = useMemo(() => {
    const filterValue = table.getColumn("packageId")?.getFilterValue() as string[];
    return filterValue ?? [];
  }, [table.getColumn("packageId")?.getFilterValue()]);

  const handlePackageIdChange = (checked: boolean, value: string) => {
    const filterValue = table.getColumn("packageId")?.getFilterValue() as string[];
    const newFilterValue = filterValue ? [...filterValue] : [];

    if (checked) {
      newFilterValue.push(value);
    } else {
      const index = newFilterValue.indexOf(value);
      if (index > -1) {
        newFilterValue.splice(index, 1);
      }
    }

    table.getColumn("packageId")?.setFilterValue(newFilterValue.length ? newFilterValue : undefined);
  };

  return (
    <Section<PurchaseDto>
      id={id}
      title="Purchases"
      graphQLLink="d"
      table={table}
      tableColumns={tableColumns}
      extraSettings={[
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline">
              <Filter
                className="-ms-1 me-2 opacity-60"
                size={16}
                strokeWidth={2}
                aria-hidden="true"
              />
              Package Id
              {selectedPackageIds.length > 0 && (
                <span className="-me-1 ms-3 inline-flex h-5 max-h-full items-center rounded border border-border bg-background px-1 font-[inherit] text-[0.625rem] font-medium text-muted-foreground/70">
                  {selectedPackageIds.length}
                </span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="min-w-36 p-3" align="start">
            <div className="space-y-3">
              <div className="text-xs font-medium text-muted-foreground">Filters</div>
              <div className="space-y-3">
                {uniquePackageIds.map((value, i) => (
                  <div key={value} className="flex items-center gap-2">
                    <Checkbox
                      id={`${id}-${i}`}
                      checked={selectedPackageIds.includes(value)}
                      onCheckedChange={(checked: boolean) => handlePackageIdChange(checked, value)}
                    />
                    <Label
                      htmlFor={`${id}-${i}`}
                      className="flex grow justify-between gap-2 font-normal"
                    >
                      {value}{" "}
                      <span className="ms-2 text-xs text-muted-foreground">
                        {packageIdCount.get(value)}
                      </span>
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          </PopoverContent>
        </Popover>
      ]}
    />
  )
}