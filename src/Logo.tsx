import circleLogo from "./imports/CIRCLE_logo_rebrand_-_Omar_Awad_1_.png"

export function Logo({ light = false, compact = false }: { light?: boolean; compact?: boolean }) {
  return (
    <img
      src={circleLogo}
      alt="Circle"
      className={`shrink-0 object-contain transition-transform duration-200 hover:scale-[1.02] ${
        compact ? "h-8 w-auto" : "h-10 w-auto"
      } ${light ? "brightness-0 invert" : ""}`}
    />
  )
}
