import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table.tsx";
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
import tableDef from "./tableDef";
import { ColumnDef, flexRender } from "@tanstack/react-table";
import { useNavigate } from "react-router";
import { invoke } from "@tauri-apps/api/core";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  search: string
  path: string
  reload: () => void
}

export default function TableSet<TData, TValue>({ ...props }: DataTableProps<TData, TValue>) {
  const table = tableDef(props.data, props.columns);
  const { t } = useTranslation()
  const [selectedItems, setSelectedItems] = useState<string[]>([])
  const navigate = useNavigate();

  const selectAll = () => {
    setSelectedItems(
      table.getSelectedRowModel().rows.map(e => (e.original as { id: string }).id)
    )
  }

  const configItem = (e: string) => { navigate(`/new-${props.path}/id=${e}`) }

  const handleDelete = () => {
    selectedItems.map((selectedItem)=>{
      invoke(`delete_${props.path}`, {uuid: selectedItem})
    })
    setSelectedItems([])
    table.toggleAllRowsSelected(false)
    props.reload();
  }

  useEffect(() => {
    selectAll()
  }, [table.getState().rowSelection])

  return (
    <div className="flex flex-col">
      <div className="flex flex-row justify-between">
        <DropdownMenu>
          <DropdownMenuTrigger>
            <Button>{t("general.actions")}<ChevronDown /></Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align={"start"}>
            <DropdownMenuLabel>
              {`${selectedItems ? selectedItems.length : 0} ${t("item.items").toLowerCase()}`}
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={(e) => {
                e.preventDefault()
                selectedItems.length == table.getRowCount()
                  ? table.toggleAllRowsSelected(false)
                  : table.toggleAllRowsSelected(true)
                selectAll()
              }}
              variant="default"
            >
              {selectedItems.length == table.getRowCount()
                ? t("multi_select.deselect_all")
                : t("multi_select.select_all")}
            </DropdownMenuItem>

            <Dialog>
              <DialogTrigger asChild>
                <DropdownMenuItem
                  className="flex w-full"
                  variant="destructive"
                  disabled={selectedItems.length === 0}
                  onSelect={(e) => e.preventDefault()}
                >
                  {t("general.delete")}
                </DropdownMenuItem>
              </DialogTrigger>
              <DialogContent className="flex flex-col w-96 max-w-96">
                <DialogHeader>
                  <DialogTitle>
                    <H1 text={t("general.delete")} side="start" />
                  </DialogTitle>
                  <DialogDescription>
                    {t("validation.delete_items_desc")}
                  </DialogDescription>
                </DialogHeader>
                <Separator />
                <div className="flex w-full justify-center gap-4 py-4">
                  <p>
                    {t("validation.delete_items_verify")} {table.getSelectedRowModel().rows.length} {t("item.items").toLowerCase()}?
                  </p>
                </div>
                <Separator />
                <DialogFooter>
                  <DialogClose asChild>
                    <Button variant="ghost">{t("general.back")}</Button>
                  </DialogClose>
                  <DialogClose asChild>
                    <Button onClick={handleDelete} variant="destructive">{t("general.delete")}</Button>
                  </DialogClose>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </DropdownMenuContent>
        </DropdownMenu>
        <div className="flex justify-end space-x-3">
          <Label className={"flex"}>
            <span>{t("general.filter")}</span>
            <Input placeholder={t("general.search")}
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
                      onClick={() => configItem((cell.row.original as { id: string }).id)}
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={props.columns.length} className="h-24 text-center">
                  {t("general.no_results")}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table></div>
      <Separator />
      <div className="flex justify-center items-center space-x-2 border-1 border-t-0 rounded-b-md p-4">
        {table.getState().pagination.pageIndex > 0 && (
          <Button className={"flex w-10"} variant="ghost" size="sm" onClick={() => table.firstPage()}>
            1
          </Button>
        )}
        {table.getPageCount() > 1 && (
          <div className="flex items-center justify-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              <ChevronLeft />
              {t("general.previous")}
            </Button>
            <Button variant="ghost" disabled className={"disabled:opacity-100 px-2"}>
              {table.getState().pagination.pageIndex + 1}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              {t("general.next")}
              <ChevronRight />
            </Button>
          </div>
        )}
        <DropdownMenu>
          <DropdownMenuTrigger className="flex justify-center items-center">
            <Button variant="ghost">
              {t("general.show").toLowerCase()}
              <ChevronDown />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            {[5, 10, 15, 20].map((pageSize) => (
              <DropdownMenuItem key={pageSize} onSelect={() => table.setPageSize(pageSize)}>
                {t("general.show").toLowerCase()} {pageSize}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}
