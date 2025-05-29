export interface IH1 {
  text: string
  side: 'start' | 'center' | 'end'
}

export function H1(props: IH1) {
  return (
    <h1 className={`flex w-full justify-${props.side} scroll-m-20 text-2xl font-normal tracking-tight transition-colors` }>
      {props.text}
    </h1>
  )
}