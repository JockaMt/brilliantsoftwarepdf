import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table.tsx";
import {
  ColumnDef,
  ColumnFiltersState,
  flexRender, getCoreRowModel, getFilteredRowModel, getPaginationRowModel, getSortedRowModel,
  SortingState,
  useReactTable,
  VisibilityState
} from "@tanstack/react-table";
import { useEffect, useState } from "react";
import { Separator } from "@/components/ui/separator.tsx";
import { Button } from "@/components/ui/button.tsx";
import { ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { H1 } from "@/components/titles/h1";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { useTranslation } from "react-i18next";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  search: string
}

function tableDef<TData, TValue>(data: TData[], columns: ColumnDef<TData, TValue>[]) {
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = useState({})

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
  })
  return table;
}

export default function TableSet<TData, TValue>({ ...props }: DataTableProps<TData, TValue>) {
  const table = tableDef(props.data, props.columns);
  const { t } = useTranslation()
  const [selectedItems, setSelectedItems] = useState<string[]>([])

  const selectAll = () => {
    setSelectedItems(
      table.getSelectedRowModel().rows.map(e => (e.original as { name: string }).name)
    )
  }

  useEffect(() => {
    selectAll()
  }, [table.getState().rowSelection])

  useEffect(() => {
  }, [selectedItems]);

  return (
    <div className="flex flex-col">
      <div className="flex flex-row justify-between">
        <DropdownMenu>
          <DropdownMenuTrigger>
            <Button>{t("actions")}<ChevronDown /></Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align={"start"}>
            <DropdownMenuLabel>{`${selectedItems ? selectedItems!.length : 0} ${t("items").toLowerCase()}`}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={(e) => {
                e.preventDefault()
                selectedItems!.length == table.getRowCount() ? table.toggleAllRowsSelected(false) : table.toggleAllRowsSelected(true)
                selectAll()
              }}
              variant="default"
            >
              {selectedItems!.length == table.getRowCount() ? t("deselect_all") : t("select_all")}
            </DropdownMenuItem>
            <Dialog>
              <DialogTrigger asChild>
                <DropdownMenuItem
                  className="flex w-full"
                  variant="destructive"
                  disabled={selectedItems?.length === 0}
                  onSelect={(e) => e.preventDefault()}
                >
                  {t("delete")}
                </DropdownMenuItem>
              </DialogTrigger>
              <DialogContent className="flex flex-col w-96 max-w-96">
                <DialogHeader>
                  <DialogTitle><H1 text={t("delete_items")} side={'start'} /></DialogTitle>
                  <DialogDescription>{t("delect_selected_items")}</DialogDescription>
                </DialogHeader>
                <Separator />
                <div className="flex w-full justify-center gap-4 py-4">
                  <p>{t("sure_delete")} {table.getSelectedRowModel().rows.length} {t("items").toLowerCase()}?</p>
                </div>
                <Separator />
                <DialogFooter>
                  <DialogClose asChild>
                    <Button variant="ghost">{t("cancel")}</Button>
                  </DialogClose>
                  <DialogClose asChild>
                    <Button variant="destructive" type="submit">{t("delete")}</Button>
                  </DialogClose>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </DropdownMenuContent>
        </DropdownMenu>
        <div className="flex justify-end space-x-3">
          <Label className={"flex"}>
            <span>{t("filter")}</span>
            <Input placeholder={t("search")}
              value={(table.getColumn(props.search)?.getFilterValue() as string) ?? ""}
              onChange={(event) =>
                table.getColumn(props.search)?.setFilterValue(event.target.value)
              }
            />
          </Label>
        </div>
      </div>
      <div className="border-1 border-b-0 overflow-hidden rounded-md rounded-b-none mt-3">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      className="cursor-pointer"
                      onClick={() => console.log(cell.getContext().row.original)}
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={props.columns.length} className="h-24 text-center">
                  {t("no_results")}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table></div>
      <Separator />
      <div className="flex justify-center items-center space-x-2 border-1 border-t-0 rounded-b-md p-4">
        {table.getState().pagination.pageIndex > 0 &&
          <Button className={"flex w-10"} variant="ghost" size="sm" onClick={() => table.firstPage()}>1</Button>
        }
        {(table.getPageCount() > 1) &&
          <div className="flex items-center justify-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              <ChevronLeft />
              {t("previous")}
            </Button>
            <Button variant="ghost" disabled className={"disabled:opacity-100 px-2"}>{table.getState().pagination.pageIndex + 1}</Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              {t("next")}
              <ChevronRight />
            </Button>
          </div>
        }
        <DropdownMenu>
          <DropdownMenuTrigger className="flex justify-center items-center">
            <Button variant="ghost">{t("show").toLocaleLowerCase()}<ChevronDown /></Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent onChange={(e) => console.log(e)}>
            {[5, 10, 15, 20].map(pageSize => (
              <DropdownMenuItem key={pageSize} onSelect={() => table.setPageSize(pageSize)}>
                {t("show").toLocaleLowerCase()} {pageSize}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}
