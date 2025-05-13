"use client";
import { ColumnFiltersState, createColumnHelper, getCoreRowModel, getFacetedUniqueValues, getFilteredRowModel, getPaginationRowModel, getSortedRowModel, PaginationState, SortingState, useReactTable, VisibilityState } from "@tanstack/react-table";
import { useId, useMemo, useState } from "react";
import moment from "moment";
import { schema } from "@/lib/ponder";
import { usePonderQuery } from "@ponder/react";
import { Address, Hex } from "viem";

import { shortenAddress } from "@/helpers";
import SectionTable from "../SectionTable";
import SkeletonSection from "../skeletons/Section";

type PurchaseDto = {
  id: Hex;
  chainId: number;
  address: Address;
  accessTimeAddress: Address;
  accessTimeUserId: Hex;
  amount: bigint;
  paymentAmount: bigint;
  formattedPaymentAmount: string;
  symbol: string;
  paymentMethod: Address;
  packageId: bigint;
  timestamp: bigint;
}

const columnHelper = createColumnHelper<PurchaseDto>();

export default function Purchases() {
  const id = useId();
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({
    paymentMethod: false,
    paymentAmount: false,
    accessTimeUserId: false,
    id: false
  });
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

  const { data, isSuccess, isLoading } = usePonderQuery({
    queryFn: (db) => 
      db
        .select()
        .from(schema.purchase)
  });

  const tableColumns = useMemo(
    () => [
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
      columnHelper.accessor('packageId', {
        header: 'Package Id',
      }),
      columnHelper.accessor('symbol', {
        header: 'Currency',
      }),
      columnHelper.accessor('paymentMethod', {
        header: 'Payment Method',
        cell: ({ getValue }) => shortenAddress(getValue()),
      }),
      columnHelper.accessor('paymentAmount', {
        header: 'Raw Amount',
      }),
      columnHelper.accessor('formattedPaymentAmount', {
        header: 'Amount',
      }),
      columnHelper.accessor('amount', {
        header: 'Time',
        cell: ({ getValue }) => moment.duration(Number(getValue()), 'seconds').humanize(),
      }),
      columnHelper.accessor('timestamp', {
        header: 'Timestamp',
        cell: ({ getValue }) => moment.unix(Number(getValue())).format('YYYY-MM-DD HH:mm:ss'),
      }),
      columnHelper.accessor('accessTimeUserId', {
        header: 'AccessTimeUser Id',
      }),
      columnHelper.accessor('id', {
        header: 'Id',
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
      <SkeletonSection title="Purchases" />
      :
      <SectionTable<PurchaseDto>
        id={id}
        title="Purchases"
        table={table}
        tableColumns={tableColumns}
        filters={[
          table.getColumn("chainId")!,
          table.getColumn("accessTimeAddress")!,
          table.getColumn("address")!,
          table.getColumn("packageId")!,
          table.getColumn("symbol")!
        ]}
        filterInputs={[
          table.getColumn("address")!
        ]}
      />
  )
}