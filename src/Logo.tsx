import circleLogo from './imports/Gemini_Generated_Image_jw9ka4jw9ka4jw9k.png'

export function Logo({ light = false }: { light?: boolean }) {
  return (
    <div
      role="img"
      aria-label="Circle logo"
      className={`relative h-14 w-28 shrink-0 overflow-hidden transition-transform duration-200 hover:scale-[1.02] sm:w-32 ${
        light ? 'rounded-2xl bg-white shadow-sm' : ''
      }`}
    >
      <img
        src={circleLogo}
        alt="Circle"
        className="h-full w-full object-contain"
      />
    </div>
  )
}
