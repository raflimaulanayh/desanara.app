/**
 * Required partner logos (HIMA SI, SATU University) have not been supplied yet (PRODUCT.md).
 * This is a marked, empty slot — never draw or approximate the real logos.
 */
export function LogoSlot({ label }: { label: string }) {
  return (
    <span className="border-nota-rule-strong text-muted inline-flex h-16 w-36 items-center justify-center border-2 border-dashed px-2 text-center text-xs leading-tight">
      {label}
    </span>
  )
}
