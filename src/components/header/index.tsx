import {Button} from "@/components/ui/button.tsx";
import {useLocation, useNavigate} from "react-router";
import {ChevronLeft} from "lucide-react";
import {Label} from "@/components/ui/label.tsx";
import {useEffect} from "react";

interface HeaderProps {
  name: string;
  url?: string;
}

export function Header(props: HeaderProps) {
  const navigate = useNavigate();
  const location = useLocation()
  useEffect(() => {
    console.log(location.pathname)
  }, []);
  return (
    <div className="flex rounded-md m-3 mb-0 min-h-20 justify-between bg-[var(--primary)]">
      <div className={"relative"}>
        {props.url && (
          <Label className={"absolute cursor-pointer px-5 top-0 h-20 text-white"}>
          <ChevronLeft/>
          <Button variant={"link"} className={"text-white"} onClick={() => navigate(props.url!)}>
            Voltar
          </Button>
          </Label>
        )}
      </div>
      <h1 className="flex items-center justify-center text-white font-semibold text-2xl text-center w-1/3"> {props.name} </h1>
      <div />
    </div>
  )
}