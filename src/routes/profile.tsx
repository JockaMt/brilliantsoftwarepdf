import {Header} from "@/components/header";
import {H1} from "@/components/titles/h1.tsx";
import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar.tsx";

export default function ()  {
  return (
    <div>
      <div className={"flex flex-col h-screen"}>
        <Header url={"/"} name={"Perfil"}/>
        <div className={"relative flex h-full flex-row p-3"}>
          <div className="flex flex-1 flex-col items-center">
            <Avatar>
              <AvatarImage src={"https://github.com/jockamt.png"}/>
              <AvatarFallback>JM</AvatarFallback>
            </Avatar>
            <H1 side={'center'} text={"User name"}/>
          </div>
        </div>
      </div>
    </div>
  )
};