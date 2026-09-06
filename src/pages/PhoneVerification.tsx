import { useEffect, useRef, useState, type FormEvent } from 'react'
import { Link, useLocation, useNavigate } from 'react-router'
import { ArrowLeft, CheckCircle2, ChevronRight, LoaderCircle, LockKeyhole, RotateCcw } from 'lucide-react'
import { Logo } from '../Logo'
import { useAuth } from '../context/AuthContext'

export default function PhoneVerification() {
  const { user, verifyOtp, signIn } = useAuth(); const navigate = useNavigate(); const location = useLocation()
  const [digits, setDigits] = useState(['', '', '', '', '', '']); const [error, setError] = useState(''); const [loading, setLoading] = useState(false); const [seconds, setSeconds] = useState(42)
  const refs = useRef<Array<HTMLInputElement | null>>([])
  const params = new URLSearchParams(location.search)
  const redirect = params.get('redirect') ?? '/'
  const phoneParam = params.get('phone') ?? user?.phoneNumber ?? ''
  const userEmail = user?.email ?? params.get('email') ?? ''
  useEffect(() => { if (user?.phoneVerified) navigate(user.onboardingCompleted ? redirect : '/onboarding', { replace: true }) }, [navigate, redirect, user])
  useEffect(() => { if (!seconds) return; const timer = window.setTimeout(() => setSeconds(value => value - 1), 1000); return () => window.clearTimeout(timer) }, [seconds])
  const update = (index: number, value: string) => { const digit = value.replace(/\D/g, '').slice(-1); const next = [...digits]; next[index] = digit; setDigits(next); setError(''); if (digit && index < 5) refs.current[index + 1]?.focus() }
  const submit = async (event: FormEvent) => { event.preventDefault(); const code = digits.join(''); setLoading(true); setError(''); try { const session = await verifyOtp(phoneParam, code); navigate(session.user.onboardingCompleted ? redirect : '/onboarding') } catch (err) { setError(err instanceof Error ? err.message : 'تعذر التحقق من الرمز.') } finally { setLoading(false) } }
  
  const handleResend = async () => {
    try {
      await signIn({ phoneNumber: phoneParam })
      setSeconds(42)
      setDigits(['', '', '', '', '', ''])
      refs.current[0]?.focus()
      setError('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'تعذر إرسال الرمز مرة أخرى.')
    }
  }

  const maskedEmail = userEmail ? userEmail.replace(/^(..)[^@]*/, '$1***') : ''
  return <div dir="rtl" lang="ar" className="min-h-screen bg-cream px-5 py-5 sm:px-10"><header className="mx-auto flex max-w-6xl items-center justify-between"><Link to="/" aria-label="العودة للرئيسية"><Logo /></Link><Link to="/login" className="inline-flex items-center gap-1.5 text-xs font-bold text-ink/55 hover:text-brand"><ChevronRight size={16} /> العودة لتسجيل الدخول</Link></header><main className="mx-auto flex min-h-[calc(100vh-90px)] max-w-md items-center py-12"><section className="w-full rounded-[2rem] border border-line bg-white p-6 shadow-[0_25px_60px_-34px_rgba(91,46,95,.35)] sm:p-9"><div className="grid h-14 w-14 place-items-center rounded-2xl bg-green/10 text-green"><LockKeyhole size={25} /></div><p className="mt-7 text-xs font-black tracking-[.13em] text-brand">تأكيد الحساب</p><h1 className="editorial-display mt-3 text-3xl leading-tight text-ink">تحقق من بريدك الإلكتروني</h1><p className="mt-3 text-sm leading-7 text-ink/60">أرسلنا رمزًا من ٦ أرقام إلى <span dir="ltr" className="font-bold text-ink">{maskedEmail || 'بريدك الإلكتروني'}</span>.</p><form onSubmit={submit} className="mt-8"><div dir="ltr" className="flex justify-between gap-2">{digits.map((digit, index) => <input key={index} ref={element => { refs.current[index] = element }} value={digit} onChange={event => update(index, event.target.value)} onKeyDown={event => { if (event.key === 'Backspace' && !digits[index] && index > 0) refs.current[index - 1]?.focus() }} inputMode="numeric" maxLength={1} aria-label={`رقم ${index + 1} من رمز التحقق`} className="h-12 w-11 rounded-xl border border-line text-center text-lg font-black text-brand outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/15 sm:h-14 sm:w-12" autoFocus={index === 0} />)}</div>{error && <p className="mt-4 rounded-xl bg-rose/10 px-3 py-2 text-center text-xs font-bold text-rose">{error}</p>}<button disabled={loading} type="submit" className="mt-7 flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-amber text-sm font-black text-brand transition hover:bg-[#f7b850] disabled:opacity-60">{loading ? <><LoaderCircle size={18} className="animate-spin" /> جارٍ التحقق</> : <><CheckCircle2 size={18} /> تأكيد الرمز</>}</button></form><div className="mt-7 border-t border-line pt-6 text-center"><p className="text-xs text-ink/50">لم يصلك الرمز؟</p>{seconds ? <p className="mt-2 text-sm font-bold text-ink/65">أعد الإرسال خلال ٠:{String(seconds).padStart(2, '0')}</p> : <button type="button" onClick={handleResend} className="mt-2 inline-flex items-center gap-1.5 text-sm font-black text-brand hover:underline"><RotateCcw size={15} /> إعادة إرسال الرمز</button>}</div><p className="mt-7 rounded-xl bg-brand-soft/60 p-3 text-center text-xs leading-5 text-ink/55">للعرض التجريبي: أدخل أي رمز مكوّن من ٦ أرقام.</p></section></main></div>
}
