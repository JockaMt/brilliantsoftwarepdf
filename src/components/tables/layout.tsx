import {
  Table,
} from "@tanstack/react-table";
import {ReactElement, useEffect, useState} from "react";
import {Button} from "@/components/ui/button.tsx";
import {Separator} from "@/components/ui/separator.tsx";
import {ChevronDown, ChevronLeft, ChevronRight} from "lucide-react";
import {Input} from "@/components/ui/input.tsx";
import {Label} from "@/components/ui/label.tsx";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu.tsx";
import {
  Dialog, DialogClose,
  DialogContent, DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog.tsx";
import {H1} from "@/components/titles/h1.tsx";

interface ILayout {
  table: Table<any> // tipagem correta da instância de tabela
  children: ReactElement // necessário para o JSX da tabela
}


export default function Layout(props: ILayout) {
  const [selectedSections, setSelectedSections] = useState<string[]>([])

  const selectAll = () => {
    setSelectedSections(
      props.table.getSelectedRowModel().rows.map(e => (e.original as { name: string }).name)
    )
  }

  useEffect(() => {
    selectAll()
  }, [props.table.getState().rowSelection])

  useEffect(() => {
  }, [selectedSections]);

  return (
    <div className={"space-y-3"}>
      <div className="flex flex-row justify-between">
        <DropdownMenu>
          <DropdownMenuTrigger>
            <Button>Ações <ChevronDown /></Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align={"start"}>
            <DropdownMenuLabel>{`${selectedSections ? selectedSections!.length : 0} seções`}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => {
                selectedSections!.length > 0 ? props.table.toggleAllRowsSelected(false):props.table.toggleAllRowsSelected(true)
                selectAll()
              }}
              variant="default"
            >
              {props.table.getIsAllRowsSelected() ? "Desselecionar tudo" : "Selecionar tudo"}
            </DropdownMenuItem>
            <Dialog>
              <DialogTrigger asChild>
                <DropdownMenuItem
                  className="flex w-full"
                  variant="destructive"
                  disabled={selectedSections?.length === 0}
                  onSelect={(e) => e.preventDefault()} // ⛔️ evita que o Dropdown feche
                >
                  Deletar
                </DropdownMenuItem>
              </DialogTrigger>
              <DialogContent className="flex flex-col w-96 max-w-96">
                <DialogHeader>
                  <DialogTitle><H1 text={"Deletar seções"} side={'start'}/></DialogTitle>
                  <DialogDescription>Deletar itens selecionados</DialogDescription>
                </DialogHeader>
                <Separator/>
                <div className="flex w-full justify-center gap-4 py-4">
                  <p>Deseja mesmo deletar {props.table.getSelectedRowModel().rows.length} seções?</p>
                </div>
                <Separator/>
                <DialogFooter>
                  <DialogClose asChild>
                    <Button variant="ghost">Cancelar</Button>
                  </DialogClose>
                  <DialogClose asChild>
                    <Button variant="destructive" type="submit">Deletar</Button>
                  </DialogClose>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </DropdownMenuContent>
        </DropdownMenu>
        <div className="flex justify-end space-x-3">
          <Label className={"flex"}>
            <span>Filtrar</span>
            <Input placeholder="Pesquisar seção..."
                   value={(props.table.getColumn("name")?.getFilterValue() as string) ?? ""}
                   onChange={(event) =>
                     props.table.getColumn("name")?.setFilterValue(event.target.value)
                   }
            />
          </Label>
        </div>
      </div>
      <div className="rounded-md border">
        {props.children}
      <Separator/>
      <div className="flex justify-center items-center space-x-2 p-4">
        {props.table.getState().pagination.pageIndex > 0 &&
            <Button className={"flex w-10"} variant="ghost" size="sm" onClick={() => props.table.firstPage()}>1</Button>
        }
        {(props.table.getPageCount() > 1) &&
            <div className="flex items-center justify-center">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => props.table.previousPage()}
                    disabled={!props.table.getCanPreviousPage()}
                >
                    <ChevronLeft/>
                    Anterior
                </Button>
                <Button variant="ghost" disabled className={"disabled:opacity-100 px-2"}>{props.table.getState().pagination.pageIndex + 1}</Button>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => props.table.nextPage()}
                    disabled={!props.table.getCanNextPage()}
                >
                    Próximo
                    <ChevronRight/>
                </Button>
            </div>
          }
          <select
            value={props.table.getState().pagination.pageSize}
            onChange={(e) => props.table.setPageSize(Number(e.target.value))}
          >
            {[5, 10, 15, 20].map(pageSize => (
              <option key={pageSize} value={pageSize}>
                Mostrar {pageSize}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  )
}