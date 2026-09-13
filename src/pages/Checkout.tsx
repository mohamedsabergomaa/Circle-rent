import { useState, type FormEvent } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router'
import {
  ArrowLeft, CalendarDays, Check, CheckCircle2, ChevronRight, CreditCard,
  Landmark, LockKeyhole, MapPin, PackageCheck, ShieldCheck, Smartphone, Truck, WalletCards,
} from 'lucide-react'
import { Header } from '../App'
import { createBooking } from '../services/bookings'

const number = (value: number) => value.toLocaleString('ar-SA')
type Method = 'mada' | 'card' | 'apple'

const paymentMethods: Array<{ id: Method; title: string; caption: string; icon: typeof CreditCard }> = [
  { id: 'mada', title: 'مدى', caption: 'بطاقة مدى البنكية', icon: Landmark },
  { id: 'card', title: 'بطاقة بنكية', caption: 'Visa أو Mastercard', icon: CreditCard },
  { id: 'apple', title: 'Apple Pay', caption: 'دفع سريع وآمن', icon: Smartphone },
]

export default function Checkout() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const [method, setMethod] = useState<Method>('mada')
  const [stage, setStage] = useState<'form' | 'processing' | 'success'>('form')
  const [saveCard, setSaveCard] = useState(false)
  const [cardName, setCardName] = useState('')
  const [cardNumber, setCardNumber] = useState('')
  const [error, setError] = useState('')
  const [orderId, setOrderId] = useState('')

  const listingId = params.get('listing') ?? ''
  const listingName = params.get('item') ?? ''
  const listingImage = params.get('image') ?? ''
  const listingCity = params.get('city') ?? ''
  const ownerName = params.get('owner') ?? ''
  const dailyPrice = Number(params.get('dailyPrice') ?? 0)
  const start = params.get('start') ?? ''
  const end = params.get('end') ?? ''
  const days = Number(params.get('days') ?? 1)
  const delivery = params.get('delivery') === '1'
  const rental = dailyPrice * days
  const serviceFee = 25
  const deliveryFee = delivery ? 60 : 0
  const deposit = 500
  const total = rental + serviceFee + deliveryFee + deposit

  const submit = (event: FormEvent) => {
    event.preventDefault()
    if (method === 'card' && (!cardName.trim() || cardNumber.replace(/\s/g, '').length < 12)) {
      setError('أدخل بيانات البطاقة لإكمال العرض التجريبي.')
      return
    }
    setError('')
    setStage('processing')
    createBooking({ listingId, listingName, listingImage, ownerName, start, end, days, total, delivery })
      .then(booking => { setOrderId(booking.id); setStage('success') })
      .catch(err => { setError(err instanceof Error ? err.message : 'تعذّر إتمام الحجز.'); setStage('form') })
  }

  if (stage === 'success') {
    return <SuccessScreen listingName={listingName} total={total} orderId={orderId} onHome={() => navigate('/')} />
  }

  return (
    <div dir="rtl" lang="ar" className="min-h-screen bg-cream">
      <Header />
      <main className="mx-auto max-w-6xl px-5 py-7 sm:py-10">
        <nav aria-label="مسار التنقل" className="flex items-center gap-1.5 text-xs text-ink/55">
          <Link to="/" className="hover:text-brand">الرئيسية</Link>
          <ChevronRight size={14} />
          <Link to={`/listing/${params.get('listing') ?? 'fy1'}`} className="hover:text-brand">الإعلان</Link>
          <ChevronRight size={14} />
          <span className="font-bold text-brand">إتمام الحجز</span>
        </nav>

        <div className="mt-7 grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_23rem]">
          <section>
            <div className="flex items-start gap-4 border-b border-line pb-7">
              <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-brand text-cream"><WalletCards size={23} /></div>
              <div>
                <p className="text-xs font-black tracking-[.12em] text-amber">إتمام الحجز</p>
                <h1 className="editorial-display mt-1 text-4xl leading-tight text-ink">خطوة واحدة وتصبح جاهزًا.</h1>
                <p className="mt-2 text-sm leading-6 text-ink/60">راجع تفاصيل الدفع واختر طريقتك المفضلة. هذا نموذج تجريبي ولا يتم خصم أي مبلغ فعلي.</p>
              </div>
            </div>

            <form onSubmit={submit} className="mt-7 space-y-5">
              <section className="rounded-[1.6rem] border border-line bg-white p-5 sm:p-6">
                <div className="flex items-center justify-between">
                  <div><p className="text-xs font-black tracking-[.12em] text-brand">١ · طريقة الدفع</p><h2 className="mt-1 text-xl font-black text-ink">اختر وسيلة آمنة</h2></div>
                  <LockKeyhole size={20} className="text-green" />
                </div>
                <div className="mt-5 grid gap-3 sm:grid-cols-3">
                  {paymentMethods.map(payment => <PaymentOption key={payment.id} payment={payment} active={method === payment.id} onSelect={() => { setMethod(payment.id); setError('') }} />)}
                </div>

                {method === 'card' ? (
                  <div className="mt-5 grid gap-4 border-t border-line pt-5 sm:grid-cols-2">
                    <label className="sm:col-span-2"><span className="mb-2 block text-sm font-bold text-ink">الاسم على البطاقة</span><input value={cardName} onChange={event => setCardName(event.target.value)} placeholder="الاسم كما يظهر على البطاقة" className="w-full rounded-xl border border-line px-4 py-3 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/10" /></label>
                    <label className="sm:col-span-2"><span className="mb-2 block text-sm font-bold text-ink">رقم البطاقة</span><input dir="ltr" value={cardNumber} onChange={event => setCardNumber(event.target.value.replace(/[^0-9 ]/g, '').slice(0, 19))} placeholder="0000 0000 0000 0000" className="w-full rounded-xl border border-line px-4 py-3 text-right text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/10" /></label>
                    <label><span className="mb-2 block text-sm font-bold text-ink">تاريخ الانتهاء</span><input dir="ltr" placeholder="MM / YY" className="w-full rounded-xl border border-line px-4 py-3 text-right text-sm outline-none focus:border-brand" /></label>
                    <label><span className="mb-2 block text-sm font-bold text-ink">رمز الأمان</span><input dir="ltr" placeholder="CVV" maxLength={3} className="w-full rounded-xl border border-line px-4 py-3 text-right text-sm outline-none focus:border-brand" /></label>
                    <label className="sm:col-span-2 flex cursor-pointer items-center gap-2 text-sm text-ink/60"><input checked={saveCard} onChange={event => setSaveCard(event.target.checked)} type="checkbox" className="accent-[#075c3d]" /> احفظ هذه البطاقة لدفعة تجريبية لاحقة</label>
                  </div>
                ) : null}
                {error && <p className="mt-4 rounded-xl bg-rose/10 px-3 py-2 text-xs font-bold text-rose">{error}</p>}
              </section>

              <section className="rounded-[1.6rem] border border-line bg-white p-5 sm:p-6">
                <p className="text-xs font-black tracking-[.12em] text-brand">٢ · تأكيد الحجز</p>
                <div className="mt-4 flex items-start gap-3 rounded-2xl bg-cream p-4"><ShieldCheck size={21} className="mt-0.5 shrink-0 text-green" /><p className="text-sm leading-7 text-ink/70">لن يُسلَّم المبلغ للمالك قبل تأكيد الحجز. يظهر مبلغ التأمين منفصلاً ويمكن استرداده وفق حالة العنصر عند الإرجاع.</p></div>
                <button disabled={stage === 'processing'} className="mt-5 flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-brand text-sm font-black text-cream transition hover:bg-[#064b32] disabled:opacity-65">
                  {stage === 'processing' ? <><span className="h-4 w-4 animate-spin rounded-full border-2 border-brand border-t-transparent" /> جارٍ تجهيز التأكيد...</> : <><LockKeyhole size={18} /> تأكيد طلب الحجز · {number(total)} ر.س</>}
                </button>
                <p className="mt-3 text-center text-xs text-ink/45">نموذج دفع تجريبي للواجهة فقط — لن تتم أي عملية مالية.</p>
              </section>
            </form>
          </section>

          <aside className="space-y-4 lg:sticky lg:top-28">
            <section className="overflow-hidden rounded-[1.6rem] border border-line bg-white">
              <img src={listingImage} alt={listingName} className="h-40 w-full bg-brand-soft object-cover" />
              <div className="p-5">
                <p className="text-xs font-bold text-brand">ملخص الحجز</p>
                <h2 className="mt-2 text-lg font-black text-ink">{listingName}</h2>
                <div className="mt-5 space-y-3 border-y border-line py-4 text-sm text-ink/65">
                  <div className="flex items-center gap-2"><CalendarDays size={17} className="text-brand" /><span>{start} — {end} · {number(days)} أيام</span></div>
                  {listingCity && <div className="flex items-center gap-2"><MapPin size={17} className="text-brand" /><span>{listingCity}</span></div>}
                  <div className="flex items-center gap-2"><Truck size={17} className="text-brand" /><span>{delivery ? 'توصيل إلى موقعك' : 'استلام من المالك'}</span></div>
                </div>
                <div className="mt-4 space-y-2.5 text-sm">
                  <Price label={`الإيجار · ${number(days)} أيام`} value={`${number(rental)} ر.س`} />
                  <Price label="رسوم الخدمة" value={`${number(serviceFee)} ر.س`} />
                  <Price label="التوصيل" value={delivery ? `${number(deliveryFee)} ر.س` : '—'} />
                  <Price label="تأمين مسترد" value={`${number(deposit)} ر.س`} accent />
                  <div className="flex items-center justify-between border-t border-line pt-3 text-base font-black text-ink"><span>الإجمالي اليوم</span><span>{number(total)} ر.س</span></div>
                </div>
              </div>
            </section>
            <div className="rounded-2xl bg-brand p-4 text-cream"><p className="flex items-center gap-2 text-sm font-black"><PackageCheck size={18} className="text-amber" /> ما الذي سيحدث بعد ذلك؟</p><ol className="mt-3 space-y-2 text-xs leading-5 text-cream/72"><li>١. يُرسل طلبك إلى المالك.</li><li>٢. تتلقى إشعارًا عند الموافقة.</li><li>٣. تتابع تفاصيل الاستلام من حجوزاتك.</li></ol></div>
          </aside>
        </div>
      </main>
    </div>
  )
}

function PaymentOption({ payment, active, onSelect }: { payment: { id: Method; title: string; caption: string; icon: typeof CreditCard }; active: boolean; onSelect: () => void }) {
  const Icon = payment.icon
  return <button onClick={onSelect} type="button" className={`relative flex min-h-28 flex-col items-start rounded-2xl border p-4 text-right transition ${active ? 'border-brand bg-brand text-cream shadow-[0_14px_28px_-20px_rgba(7,92,61,.68)]' : 'border-line bg-cream/45 text-ink hover:border-brand'}`}><span className={`grid h-8 w-8 place-items-center rounded-xl ${active ? 'bg-white/15 text-amber' : 'bg-white text-brand'}`}><Icon size={18} /></span><span className="mt-3 text-sm font-black">{payment.title}</span><span className={`mt-1 text-xs ${active ? 'text-cream/70' : 'text-ink/50'}`}>{payment.caption}</span>{active && <span className="absolute left-3 top-3 grid h-5 w-5 place-items-center rounded-full bg-amber text-brand"><Check size={13} /></span>}</button>
}

function Price({ label, value, accent = false }: { label: string; value: string; accent?: boolean }) { return <div className={accent ? 'flex justify-between text-green' : 'flex justify-between text-ink/60'}><span>{label}</span><span className="font-bold">{value}</span></div> }

function SuccessScreen({ listingName, total, orderId, onHome }: { listingName: string; total: number; orderId: string; onHome: () => void }) {
  return <div dir="rtl" lang="ar" className="min-h-screen bg-cream"><Header /><main className="mx-auto flex min-h-[calc(100vh-90px)] max-w-xl items-center px-5 py-12"><section className="w-full rounded-[2rem] border border-line bg-white p-7 text-center shadow-[0_28px_70px_-44px_rgba(7,92,61,.22)] sm:p-10"><div className="relative mx-auto grid h-20 w-20 place-items-center rounded-full bg-green/10 text-green"><CheckCircle2 size={39} /><span className="absolute -bottom-1 -left-1 grid h-7 w-7 place-items-center rounded-full bg-amber text-brand"><Check size={16} /></span></div><p className="mt-7 text-xs font-black tracking-[.14em] text-green">تم تأكيد طلبك</p><h1 className="editorial-display mt-3 text-4xl leading-tight text-ink">طلبك في طريقه للمالك.</h1><p className="mx-auto mt-4 max-w-md text-sm leading-7 text-ink/60">تم تسجيل طلب حجز <strong className="text-ink">{listingName}</strong> بقيمة {number(total)} ج.م. ستتلقى إشعارًا فور رد المالك.</p><div className="mt-8 rounded-2xl bg-cream p-4 text-right text-sm"><p className="font-bold text-ink">رقم الطلب</p><p className="mt-1 font-mono text-brand">{orderId}</p></div><div className="mt-7 grid gap-3 sm:grid-cols-2"><button onClick={onHome} className="rounded-xl bg-brand py-3.5 text-sm font-black text-cream hover:bg-[#064b32]">العودة للرئيسية</button><Link to="/my-bookings" className="rounded-xl border border-brand py-3.5 text-sm font-black text-brand hover:bg-brand-soft">عرض حجوزاتي</Link></div></section></main></div>
}
