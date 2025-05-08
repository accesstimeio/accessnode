"use client";
import { ColumnFiltersState, createColumnHelper, getCoreRowModel, getFacetedUniqueValues, getFilteredRowModel, getPaginationRowModel, getSortedRowModel, PaginationState, SortingState, useReactTable, VisibilityState } from "@tanstack/react-table";
import { useId, useMemo, useState } from "react";
import { Address } from "ox/Address";
import { Hex } from "ox/Hex";
import moment from "moment";
import { schema } from "@/lib/ponder";
import { usePonderQuery } from "@ponder/react";

import { shortenAddress } from "@/helpers";
import Section from "../Section";
import SkeletonSection from "../skeletons/Section";

type AccessTimeUserDto = {
  id: Hex;
  chainId: number;
  address: Address;
  endTime: bigint;
  accessTimeAddress: Address;
  totalPurchasedTime: bigint;
  usedPaymentMethods: Address[];
}

const columnHelper = createColumnHelper<AccessTimeUserDto>();

export default function AccessTimeUsers() {
  const id = useId();
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({
    id: false
  });
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const [sorting, setSorting] = useState<SortingState>([
    {
      id: "totalPurchasedTime",
      desc: true,
    },
  ]);

  const { data, isSuccess, isLoading } = usePonderQuery({
    queryFn: (db) =>
      db
        .select()
        .from(schema.accessTimeUser)
  });

  const tableColumns = useMemo(
    () => [
      columnHelper.accessor('id', {
        header: 'Id',
      }),
      columnHelper.accessor('chainId', {
        header: 'Chain Id',
      }),
      columnHelper.accessor('accessTimeAddress', {
        header: 'AccessTime',
        cell: ({ getValue }) => shortenAddress(getValue()),
      }),
      columnHelper.accessor('address', {
        header: 'User Wallet',
        cell: ({ getValue }) => shortenAddress(getValue()),
      }),
			columnHelper.accessor('endTime', {
				header: 'Subscription End',
				cell: ({ getValue }) => moment.unix(Number(getValue())).fromNow(),
			}),
			columnHelper.accessor('totalPurchasedTime', {
				header: 'Total Purchased',
				enableSorting: true,
				cell: ({ getValue }) => moment.duration(Number(getValue()), 'seconds').humanize(),
			}),
      columnHelper.accessor('usedPaymentMethods', {
				header: 'Payment Methods',
				enableSorting: false,
				cell: ({ row }) => (
					<div className="flex gap-2">
						{row.original.usedPaymentMethods?.map(method => shortenAddress(method)).join(", ")}
					</div>
				),
			}),
    ],
    []
  );

  const table = useReactTable({
    data: isSuccess ? data : [],
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

  return (
    isLoading ?
      <SkeletonSection title="AccessTimeUsers" />
      :
      <Section<AccessTimeUserDto>
        id={id}
        title="AccessTimeUsers"
        table={table}
        tableColumns={tableColumns}
        filters={[
          table.getColumn("chainId")!,
          table.getColumn("accessTimeAddress")!
        ]}
      />
  )
}