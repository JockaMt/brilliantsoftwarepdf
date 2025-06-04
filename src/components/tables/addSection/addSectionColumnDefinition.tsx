import {Column, ColumnDef} from "@tanstack/react-table";
import {Checkbox} from '@/components/ui/checkbox.tsx';
import {SortDescIcon} from "lucide-react";
import {Button} from "@/components/ui/button.tsx";
import {IItem} from "@/@types/interfaces/types.ts";
import { useTranslation } from "react-i18next";

interface IButtonFilter {
  translationKey: string
  column: Column<IItem, unknown>
}

function ButtonFilter (props: IButtonFilter) {
  const { t } = useTranslation()
  return (
    <Button
        className="flex-grow text-left"
        variant="ghost"
        onClick={() => props.column.toggleSorting(props.column.getIsSorted() === "asc")}
      >
        {t(props.translationKey)}
        <SortDescIcon className="ml-2 h-4 w-4" />
      </Button>
  )
}

export const columnsItems: ColumnDef<IItem>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <div className="w-3 flex max-w-3 justify-center">
        <Checkbox
          className="bg-white"
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      </div>
    ),
    cell: ({ row }) => (
      <div className="w-3 flex max-w-3 justify-center">
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
          onClick={(e) => e.stopPropagation()}
        />
      </div>
    ),
  },
  {
    accessorKey: "code",
    header: ({ column }) => (
      <ButtonFilter translationKey="item.code" column={column}/>
    ),
    cell: ({ row }) => (
      <span className="flex w-20 text-wrap overflow-hidden pl-3">
        {row.original.code}
      </span>
    ),
  },
  {
    accessorKey: "description",
    header: ({ column }) => (
      <ButtonFilter translationKey="item.description"  column={column}/>
    ),
    cell: ({ row }) => (
      <span className="flex w-96 text-wrap h-5 shrink-0 overflow-hidden pl-3">
        {row.original.description}
      </span>
    ),
  },
]
