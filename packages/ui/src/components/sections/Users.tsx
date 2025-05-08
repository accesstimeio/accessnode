"use client";
import { ColumnFiltersState, createColumnHelper, getCoreRowModel, getFacetedUniqueValues, getFilteredRowModel, getPaginationRowModel, getSortedRowModel, PaginationState, SortingState, useReactTable, VisibilityState } from "@tanstack/react-table";
import { useId, useMemo, useState } from "react";
import { Address } from "ox/Address";
import { schema } from "@/lib/ponder";
import { usePonderQuery } from "@ponder/react";

import { shortenAddress } from "@/helpers";
import Section from "../Section";
import SkeletonSection from "../skeletons/Section";

type UserDto = {
  id: Address;
  chainId: number;
}

const columnHelper = createColumnHelper<UserDto>();

export default function Users() {
  const id = useId();
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const [sorting, setSorting] = useState<SortingState>([]);

  const { data, isSuccess, isLoading } = usePonderQuery({
    queryFn: (db) =>
      db
        .select()
        .from(schema.user)
  });

  const tableColumns = useMemo(
    () => [
      columnHelper.accessor('id', {
        header: 'Wallet Address',
        cell: ({ getValue }) => shortenAddress(getValue()),
      }),
      columnHelper.accessor('chainId', {
        header: 'Chain Id',
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
      <SkeletonSection title="Users" />
      :
      <Section<UserDto>
        id={id}
        title="Users"
        table={table}
        tableColumns={tableColumns}
        filters={[
            table.getColumn("chainId")!
        ]}
      />
  )
}