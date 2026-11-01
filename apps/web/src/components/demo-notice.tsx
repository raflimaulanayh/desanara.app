import { Stamp } from './stamp'

export function DemoNotice({ label, children }: { label: string; children: string }) {
  return (
    <p className="bg-nota-yellow flex flex-wrap items-center gap-x-3 gap-y-2 px-4 py-3 text-sm">
      <Stamp tone="demo" size="sm" rotate={-2}>
        {label}
      </Stamp>
      <span>{children}</span>
    </p>
  )
}
