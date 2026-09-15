import type { ReactNode } from "react"

import {
  ArrowLeft,
  BadgeCheck,
  ChevronRight,
  MapPin,
  ShieldCheck,
  Sparkles,
} from "lucide-react"

import { Link } from "react-router"

type AuthLayoutProps = {
  eyebrow: string

  title: string

  subtitle: string

  variant: "signin" | "signup"

  children: ReactNode

  footer: ReactNode
}

export default function AuthLayout({
  eyebrow,
  title,
  subtitle,
  variant,
  children,
  footer,
}: AuthLayoutProps) {
  const signUp = variant === "signup"

  return (
    <div
      dir="rtl"
      lang="ar"
      className="grid min-h-screen bg-cream lg:grid-cols-[1fr_1.04fr]"
    >
      <main className="order-1 flex min-h-screen flex-col bg-cream px-5 py-5 sm:px-10 lg:order-2 lg:px-[clamp(3rem,7vw,8.5rem)] lg:py-9">
        <div className="flex items-center">
          <Link
            to="/"
            className="group inline-flex items-center gap-1.5 text-xs font-bold text-ink/55 transition hover:text-brand"
          >
            <ChevronRight
              size={16}
              className="transition-transform group-hover:translate-x-0.5"
            />{" "}
            العودة للرئيسية
          </Link>
        </div>
        <div className="mx-auto flex w-full max-w-[455px] flex-1 flex-col justify-center py-10 lg:py-14">
          <p className="text-xs font-black tracking-[.12em] text-brand">
            {eyebrow}
          </p>
          <h1 className="editorial-display mt-3 text-4xl leading-[1.15] text-ink sm:text-[2.8rem]">
            {title}
          </h1>
          <p className="mt-4 max-w-md text-[15px] leading-7 text-ink/60">
            {subtitle}
          </p>
          <div className="mt-9">{children}</div>
          <p className="mt-7 text-center text-sm leading-6 text-ink/60">
            {footer}
          </p>
          <p className="mt-9 text-center text-xs leading-5 text-ink/42">
            بالمتابعة، أنت توافق على{" "}
            <Link
              to="/policy"
              className="font-bold text-brand underline underline-offset-2 hover:text-[#064b32]"
            >
              الشروط وسياسة الخصوصية
            </Link>{" "}
            في سيركل.
          </p>
        </div>
      </main>

      <aside className="relative order-2 hidden overflow-hidden bg-brand p-12 text-cream lg:order-1 lg:flex lg:min-h-screen lg:flex-col">
        <div className="pointer-events-none absolute -right-16 top-16 h-56 w-56 rounded-full border-[2.2rem] border-amber" />
        <div className="pointer-events-none absolute -bottom-20 -left-12 h-72 w-72 rounded-full bg-brand-soft/15" />
        <div className="relative flex h-full flex-col justify-between">
          <section className="max-w-lg">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-bold text-cream/90">
              <Sparkles size={14} className="text-amber" /> مجتمع قريب، أشياء
              تدور
            </div>
            <h2 className="editorial-display mt-7 text-5xl leading-[1.16] text-cream">
              {signUp ? (
                <>
                  أعطِ أغراضك
                  <br />
                  حياةً ثانية.
                </>
              ) : (
                <>
                  كل ما تحتاجه،
                  <br />
                  أقرب مما تتوقع.
                </>
              )}
            </h2>
            <p className="mt-5 max-w-md text-base leading-8 text-cream/72">
              {signUp
                ? "اعرض ما لديك، وحدد سعرك، واجعل الأشياء المفيدة تدور داخل مجتمعك."
                : "استأجر من مجتمعك المحلي بدل شراء ما تحتاجه لمرة واحدة."}
            </p>
          </section>
          {signUp ? <ListingPreview /> : <TrustPreview />}
        </div>
      </aside>
    </div>
  )
}

function TrustPreview() {
  return (
    <div className="relative mt-12 w-[min(100%,31rem)] rounded-[1.8rem] border border-white/14 bg-white/10 p-4 backdrop-blur-sm">
      <div className="flex items-center gap-4">
        <div className="grid h-16 w-16 place-items-center rounded-2xl bg-cream text-brand shadow-lg">
          <ShieldCheck size={29} />
        </div>
        <div>
          <p className="font-bold">تجربة مبنية على الثقة</p>
          <p className="mt-1 text-sm text-cream/65">
            تحقق بسيط، وتواصل واضح، وتأجير مطمئن.
          </p>
        </div>
      </div>
      <div className="mt-4 flex items-center justify-between rounded-2xl bg-cream px-4 py-3 text-brand">
        <span className="flex items-center gap-2 text-sm font-bold">
          <span className="h-2 w-2 rounded-full bg-brand" /> من جارك القريب
        </span>
        <BadgeCheck size={19} className="text-green" />
      </div>
    </div>
  )
}

function ListingPreview() {
  return (
    <div className="relative mt-12 w-[min(100%,31rem)] overflow-hidden rounded-[1.8rem] border border-white/14 bg-cream p-3 text-ink shadow-[0_25px_60px_-25px_rgba(0,0,0,.55)]">
      <div className="flex gap-3">
        <div className="grid h-20 w-24 place-items-center rounded-2xl bg-amber/20 text-3xl">
          📷
        </div>
        <div className="flex-1 py-1">
          <p className="text-xs font-bold text-brand">تصوير فوتوغرافي</p>
          <p className="mt-1 font-bold">كاميرا سوني ألفا</p>
          <p className="mt-2 text-sm text-ink/55">٣٠٠ ر.س / اليوم</p>
        </div>
      </div>
      <div className="mt-3 flex items-center justify-between rounded-xl bg-brand-soft px-3 py-2.5 text-xs font-bold text-brand">
        <span className="flex items-center gap-1.5">
          <MapPin size={14} /> الرياض · النخيل
        </span>
        <span className="rounded-full bg-white px-2 py-1 text-[11px]">
          متاح الآن
        </span>
      </div>
      <div className="absolute -top-3 left-4 rounded-full bg-amber px-3 py-1.5 text-xs font-black text-brand shadow-sm">
        أضِف إعلانك خلال دقائق
      </div>
    </div>
  )
}

export function PhoneField({
  value,
  onChange,
  error,
}: {
  value: string
  onChange: (value: string) => void
  error?: string
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-bold text-ink">رقم الجوال</span>
      <div
        className={`flex overflow-hidden rounded-2xl border bg-white transition ${
          error
            ? "border-rose ring-2 ring-rose/10"
            : "border-line focus-within:border-brand focus-within:ring-2 focus-within:ring-brand/10"
        }`}
        dir="ltr"
      >
        <div className="flex items-center border-r border-line bg-brand-soft px-3 text-sm font-black text-brand">
          +20
        </div>
        <input
          value={value}
          onChange={(event) =>
            onChange(event.target.value.replace(/[^0-9]/g, ""))
          }
          inputMode="tel"
          maxLength={10}
          placeholder="1X XXXX XXXX"
          className="min-w-0 flex-1 bg-transparent px-4 py-3.5 text-right text-sm font-semibold text-ink outline-none placeholder:text-muted/70"
        />
      </div>
      {error ? (
        <span className="mt-2 block text-xs font-medium text-rose">
          {error}
        </span>
      ) : (
        <span className="mt-2 block text-xs leading-5 text-ink/50">
          سنستخدم رقمك لحماية حسابك والتواصل بشأن الحجوزات.
        </span>
      )}
    </label>
  )
}

export function TextField({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
  optional = false,
  error,
  inputMode,
  autoComplete,
  maxLength,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  type?: string
  placeholder: string
  optional?: boolean
  error?: string
  inputMode?: "text" | "email" | "tel" | "numeric" | "none"
  autoComplete?: string
  maxLength?: number
}) {
  return (
    <label className="block">
      <span className="mb-2 flex items-center justify-between text-sm font-bold text-ink">
        {label}
        {optional && (
          <span className="text-xs font-medium text-muted">اختياري</span>
        )}
      </span>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        type={type}
        inputMode={inputMode}
        autoComplete={autoComplete}
        maxLength={maxLength}
        placeholder={placeholder}
        className={`w-full rounded-2xl border bg-white px-4 py-3.5 text-sm text-ink outline-none transition placeholder:text-muted/70 ${
          error
            ? "border-rose ring-2 ring-rose/10"
            : "border-line focus:border-brand focus:ring-2 focus:ring-brand/10"
        }`}
      />
      {error && (
        <span className="mt-2 block text-xs font-medium text-rose">
          {error}
        </span>
      )}
    </label>
  )
}

export function SubmitButton({
  children,
  loading,
}: {
  children: ReactNode
  loading?: boolean
}) {
  return (
    <button
      disabled={loading}
      type="submit"
      className="flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-brand text-sm font-black text-cream transition hover:-translate-y-0.5 hover:bg-[#064b32] focus:outline-none focus:ring-2 focus:ring-brand focus:ring-offset-2 disabled:cursor-wait disabled:opacity-60"
    >
      {children}
      {!loading && <ArrowLeft size={18} />}
    </button>
  )
}
