  export default function capitalize (e: string | any): string | void {
    if (typeof e != "string") return
    return e.split(" ").map(char => {
      return char.charAt(0).toUpperCase() + char.slice(1).toLowerCase();
    }).join(" ")
  }