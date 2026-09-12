import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { Logo } from '../Logo'
import { Check, ChevronRight, Clock3, FileText, LockKeyhole, ShieldCheck, Upload, UserRound, X } from 'lucide-react'

type UploadFieldProps = {
  label: string
  hint: string
  file: File | null
  onChange: (file: File | null) => void
  icon: typeof FileText
}

function UploadField({ label, hint, file, onChange, icon: Icon }: UploadFieldProps) {
  const preview = useMemo(() => file ? URL.createObjectURL(file) : '', [file])
  useEffect(() => () => { if (preview) URL.revokeObjectURL(preview) }, [preview])

  return (
    <div>
      <p className="mb-2 text-sm font-bold text-ink">{label}</p>
      {file ? (
        <div className="flex items-center gap-3 rounded-2xl border border-green/30 bg-green/5 p-3">
          {preview ? <img src={preview} alt={`معاينة ${label}`} className="h-12 w-12 rounded-xl object-cover" /> : <div className="grid h-12 w-12 place-items-center rounded-xl bg-green/10 text-green"><FileText size={22} /></div>}
          <div className="min-w-0 flex-1"><p className="truncate text-sm font-bold text-ink">{file.name}</p><p className="mt-0.5 text-xs text-green">تمت الإضافة بنجاح</p></div>
          <button type="button" onClick={() => onChange(null)} aria-label={`حذف ${label}`} className="grid h-8 w-8 place-items-center rounded-full text-ink/45 transition hover:bg-rose/10 hover:text-rose"><X size={16} /></button>
        </div>
      ) : (
        <label className="flex min-h-32 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-line bg-cream/65 px-4 text-center transition hover:border-brand hover:bg-brand-soft/45">
          <Icon size={27} className="text-brand" />
          <span className="mt-2 text-sm font-bold text-brand">ارفع الصورة</span>
          <span className="mt-1 text-xs leading-5 text-ink/55">{hint}</span>
          <input type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" onChange={event => onChange(event.target.files?.[0] ?? null)} />
        </label>
      )}
    </div>
  )
}

function VerificationShell({ children }: { children: React.ReactNode }) {
  return <div dir="rtl" lang="ar" className="min-h-screen bg-cream">
    <header className="border-b border-line bg-cream/90 px-5 py-4 backdrop-blur"><div className="mx-auto flex max-w-5xl items-center justify-between"><Link to="/"><Logo /></Link><span className="inline-flex items-center gap-2 text-xs font-bold text-ink/55"><LockKeyhole size={15} className="text-green" /> بياناتك محمية ومشفّرة</span></div></header>
    {children}
  </div>
}

export default function Verification() {
  const navigate = useNavigate()
  const [phone, setPhone] = useState('')
  const [identityCard, setIdentityCard] = useState<File | null>(null)
  const [selfie, setSelfie] = useState<File | null>(null)
  const [submitted, setSubmitted] = useState(false)
  const canSubmit = phone.trim().length >= 8 && Boolean(identityCard) && Boolean(selfie)

  useEffect(() => {
    if (sessionStorage.getItem('circle-verification') === 'pending') navigate('/verification/pending', { replace: true })
  }, [navigate])

  const submit = (event: React.FormEvent) => {
    event.preventDefault()
    if (!canSubmit) return
    setSubmitted(true)
    sessionStorage.setItem('circle-verification', 'pending')
    window.setTimeout(() => navigate('/verification/pending', { replace: true }), 550)
  }

  return <VerificationShell><main className="mx-auto grid max-w-5xl gap-10 px-5 py-10 lg:grid-cols-[.75fr_1.25fr] lg:py-16">
    <aside className="rounded-3xl bg-brand p-7 text-cream shadow-[0_25px_65px_-34px_rgba(7,92,61,.68)] sm:p-8"><div className="grid h-11 w-11 place-items-center rounded-2xl bg-amber text-brand"><ShieldCheck size={24} /></div><p className="mt-8 text-sm font-bold tracking-[.13em] text-amber">تحقق الحساب</p><h1 className="mt-3 text-3xl font-black leading-tight">خطوة صغيرة<br />لمجتمع أكثر أمانًا.</h1><p className="mt-4 text-sm leading-7 text-cream/75">نتحقق من الهوية لحماية المالكين والمستأجرين وبناء تجربة تأجير موثوقة للجميع.</p><ol className="mt-10 space-y-4">{[['١', 'بيانات التواصل', true], ['٢', 'الهوية وصورة السيلفي', true], ['٣', 'مراجعة الطلب', false]].map(([number, label, active]) => <li key={String(number)} className="flex items-center gap-3"><span className={`grid h-7 w-7 place-items-center rounded-full text-xs font-bold ${active ? 'bg-cream text-brand' : 'bg-white/15 text-cream/65'}`}>{number}</span><span className={`text-sm ${active ? 'font-bold text-cream' : 'text-cream/65'}`}>{label}</span></li>)}</ol><div className="mt-10 border-t border-white/15 pt-5 text-xs leading-5 text-cream/65">لن نعرض مستنداتك علنًا أو نشاركها مع مستخدمين آخرين.</div></aside>
    <section className="rounded-3xl border border-line bg-white p-6 shadow-sm sm:p-8"><div className="flex items-start gap-3"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-brand-soft text-brand"><UserRound size={20} /></span><div><h2 className="text-2xl font-black text-ink">تأكيد هويتك</h2><p className="mt-1 text-sm leading-6 text-ink/60">هذه الخطوة مطلوبة قبل استخدام ميزات التأجير أو إدارة الإعلانات.</p></div></div>
      <form onSubmit={submit} className="mt-8 space-y-6"><div><label htmlFor="phone" className="mb-2 block text-sm font-bold text-ink">رقم الهاتف</label><input id="phone" required inputMode="tel" value={phone} onChange={event => setPhone(event.target.value)} placeholder="+20 100 000 0000" className="w-full rounded-xl border border-line px-4 py-3 text-sm text-ink outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/15" /><p className="mt-2 text-xs text-ink/50">سنستخدمه للتحقق والتواصل فقط.</p></div>
        <div className="grid gap-4 sm:grid-cols-2"><UploadField label="بطاقة الهوية" hint="صورة واضحة للوجه الأمامي من البطاقة" file={identityCard} onChange={setIdentityCard} icon={FileText} /><UploadField label="صورة سيلفي" hint="صورة حديثة وواضحة لوجهك" file={selfie} onChange={setSelfie} icon={UserRound} /></div>
        <div className="flex gap-3 rounded-2xl border border-amber/30 bg-amber/10 p-4 text-xs leading-6 text-ink/70"><LockKeyhole size={18} className="mt-0.5 shrink-0 text-[#b53d13]" />تأكد أن الاسم والصورة في البطاقة واضحان. نقبل JPG وPNG وWebP فقط.</div>
        <button disabled={!canSubmit || submitted} type="submit" className="flex w-full items-center justify-center gap-2 rounded-full bg-brand py-3.5 text-sm font-bold text-cream transition hover:bg-[#064b32] disabled:cursor-not-allowed disabled:opacity-45">{submitted ? <><Clock3 size={18} /> جارٍ إرسال طلبك...</> : <><Upload size={18} /> إرسال طلب التحقق</>}</button>
      </form>
    </section>
  </main></VerificationShell>
}

export function VerificationPending() {
  const navigate = useNavigate()
  const signOut = () => { sessionStorage.removeItem('circle-verification'); navigate('/login', { replace: true }) }
  return <VerificationShell><main className="mx-auto flex min-h-[calc(100vh-73px)] max-w-xl items-center px-5 py-12"><section className="w-full rounded-3xl border border-line bg-white p-7 text-center shadow-sm sm:p-10"><div className="relative mx-auto grid h-20 w-20 place-items-center rounded-full bg-amber/15 text-[#b53d13]"><Clock3 size={34} /><span className="absolute -bottom-1 -right-1 grid h-7 w-7 place-items-center rounded-full bg-green text-white"><Check size={16} /></span></div><p className="mt-7 text-xs font-bold tracking-[.14em] text-[#b53d13]">تم استلام الطلب</p><h1 className="mt-3 text-3xl font-black text-ink">حسابك قيد المراجعة</h1><p className="mx-auto mt-4 max-w-md text-sm leading-7 text-ink/60">شكرًا لإرسال بياناتك. يراجع فريق سيركل طلبك عادةً خلال ٢٤ ساعة، وسنرسل إليك إشعارًا فور اكتمال التحقق.</p><div className="mt-8 grid gap-3 rounded-2xl bg-cream p-4 text-right text-sm"><div className="flex items-center gap-3"><span className="grid h-7 w-7 place-items-center rounded-full bg-green text-white"><Check size={15} /></span><span className="font-medium text-ink">تم إرسال رقم الهاتف والمستندات</span></div><div className="flex items-center gap-3"><span className="grid h-7 w-7 place-items-center rounded-full bg-amber/20 text-[#b53d13]"><Clock3 size={15} /></span><span className="font-medium text-ink">مراجعة الهوية قيد التنفيذ</span></div><div className="flex items-center gap-3"><span className="grid h-7 w-7 place-items-center rounded-full bg-white text-ink/35"><ShieldCheck size={15} /></span><span className="text-ink/55">ستُفعّل ميزات الحساب بعد الموافقة</span></div></div><p className="mt-6 text-xs leading-5 text-ink/50">لن تتمكن من الدخول إلى لوحة التحكم أو نشر الإعلانات قبل اعتماد التحقق.</p><button onClick={signOut} className="mt-6 text-sm font-bold text-brand hover:underline">تسجيل الخروج</button></section></main></VerificationShell>
}
