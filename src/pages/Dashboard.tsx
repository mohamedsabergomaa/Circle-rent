import { useEffect, useMemo, useState } from 'react'
import { Header, Footer, type Listing } from '../App'
import {
  Archive,
  Bell,
  CalendarCheck,
  CalendarDays,
  Camera,
  Check,
  CheckCircle2,
  ChevronRight,
  CircleDollarSign,
  Copy,
  Eye,
  LayoutDashboard,
  MessageCircle,
  Package,
  Pause,
  Pencil,
  Play,
  Plus,
  Search,
  Send,
  Settings,
  ShieldCheck,
  Star,
  Wallet,
  X,
} from 'lucide-react'

type ListingStatus = 'نشط' | 'موقوف مؤقتًا' | 'مسودة' | 'مؤرشف'
type RequestStatus = 'جديد' | 'مؤكد' | 'مرفوض' | 'مكتمل'
type DashboardListing = Listing & {
  description: string
  condition: string
  included: string[]
  photos: string[]
  status: ListingStatus
  weeklyPrice: string
  monthlyPrice: string
  deposit: string
  deliveryFee: string
  blockedDates: string[]
}

type RentalRequest = {
  id: string
  renter: string
  product: string
  dates: string
  total: string
  status: RequestStatus
  avatar: string
}

const image = (id: string) => `https://images.unsplash.com/photo-${id}?w=960&h=720&fit=crop&auto=format`
const sampleDates = ['١٨ أغسطس', '١٩ أغسطس', '٢٠ أغسطس', '٢١ أغسطس', '٢٢ أغسطس', '٢٣ أغسطس', '٢٤ أغسطس']


const statusStyles: Record<ListingStatus | RequestStatus, string> = {
  'نشط': 'bg-green/10 text-green',
  'موقوف مؤقتًا': 'bg-amber/15 text-[#b53d13]',
  'مسودة': 'bg-brand-soft text-brand',
  'مؤرشف': 'bg-ink/8 text-ink/55',
  'جديد': 'bg-amber/15 text-[#b53d13]',
  'مؤكد': 'bg-green/10 text-green',
  'مرفوض': 'bg-rose/10 text-rose',
  'مكتمل': 'bg-brand-soft text-brand',
}

const emptyListing = (): DashboardListing => ({
  id: `new-${Date.now()}`, name: '', category: 'تصوير فوتوغرافي', price: '', city: 'القاهرة', image: image('1516035069371-29a1b244cc32'), owner: 'أنا', rating: '٠٫٠', verified: true,
  description: '', condition: '', included: [], features: [], photos: [], status: 'مسودة', weeklyPrice: '', monthlyPrice: '', deposit: '', deliveryFee: '', blockedDates: [],
})

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<'overview' | 'listings' | 'requests' | 'calendar' | 'inbox' | 'earnings' | 'reviews' | 'settings'>('overview')
  const [listings, setListings] = useState<DashboardListing[]>([])
  const [requests, setRequests] = useState<RentalRequest[]>([])

  useEffect(() => {
    import('../services/listings').then(({ getOwnerListings }) => {
      getOwnerListings().then(data => setListings(data as unknown as DashboardListing[])).catch(() => {})
    })
    import('../services/bookings').then(({ getOwnerBookings }) => {
      getOwnerBookings().then(bookings => {
        setRequests(bookings.map(b => ({ id: b.id, renter: b.ownerName, product: b.listingName, dates: `${b.start} – ${b.end}`, total: `${b.total.toLocaleString('ar-EG')} ج.م`, status: b.status === 'pending' ? 'جديد' : b.status === 'approved' ? 'مؤكد' : b.status === 'completed' ? 'مكتمل' : 'مرفوض' as RequestStatus, avatar: b.ownerName.charAt(0) })))
      }).catch(() => {})
    })
  }, [])
  const [view, setView] = useState<'list' | 'form'>('list')
  const [editing, setEditing] = useState<DashboardListing | null>(null)
  const [form, setForm] = useState<DashboardListing>(emptyListing())
  const [featureDraft, setFeatureDraft] = useState('')
  const [includedDraft, setIncludedDraft] = useState('')
  const [photoDraft, setPhotoDraft] = useState('')
  const [listingSearch, setListingSearch] = useState('')
  const [message, setMessage] = useState('')
  const [sentMessages, setSentMessages] = useState<string[]>([])
  const [notice, setNotice] = useState('')
  const [withdrawn, setWithdrawn] = useState(false)
  const [repliedReviews, setRepliedReviews] = useState<string[]>([])

  const notify = (text: string) => {
    setNotice(text)
    window.setTimeout(() => setNotice(''), 2600)
  }

  const openNewListing = () => {
    setEditing(null)
    setForm(emptyListing())
    setFeatureDraft('')
    setIncludedDraft('')
    setPhotoDraft('')
    setView('form')
    setActiveTab('listings')
  }

  const openEdit = (listing: DashboardListing) => {
    setEditing(listing)
    setForm({ ...listing, features: [...(listing.features ?? [])], included: [...listing.included], photos: [...listing.photos] })
    setFeatureDraft('')
    setIncludedDraft('')
    setPhotoDraft('')
    setView('form')
  }

  const saveListing = async (event: React.SyntheticEvent, asDraft = false) => {
    event.preventDefault()
    const saved = { ...form, status: asDraft ? 'مسودة' as const : form.status === 'مسودة' ? 'نشط' as const : form.status, image: form.photos[0] || form.image }
    try {
      const { createListing, updateListing } = await import('../services/listings')
      if (editing) {
        await updateListing(saved.id, saved as never)
      } else {
        await createListing(saved as never)
      }
    } catch { /* optimistic update continues */ }
    setListings(current => editing ? current.map(item => item.id === saved.id ? saved : item) : [saved, ...current])
    setView('list')
    notify(asDraft ? 'تم حفظ الإعلان كمسودة.' : 'تم حفظ الإعلان ونشره.')
  }

  const updateListingStatus = async (id: string, status: ListingStatus) => {
    try {
      const { updateListing } = await import('../services/listings')
      await updateListing(id, { status })
    } catch { /* optimistic update continues */ }
    setListings(current => current.map(item => item.id === id ? { ...item, status } : item))
    notify(status === 'نشط' ? 'الإعلان متاح الآن للمستأجرين.' : `تم تحديث حالة الإعلان إلى ${status}.`)
  }

  const duplicateListing = (listing: DashboardListing) => {
    const copy = { ...listing, id: `copy-${Date.now()}`, name: `${listing.name} — نسخة`, status: 'مسودة' as const }
    setListings(current => [copy, ...current])
    notify('تم إنشاء نسخة كمسودة قابلة للتعديل.')
  }

  const addString = (kind: 'features' | 'included', value: string, clear: () => void) => {
    const clean = value.trim()
    if (!clean) return
    setForm(current => ({ ...current, [kind]: [...(current[kind] ?? []), clean] }))
    clear()
  }

  const filteredListings = useMemo(() => listings.filter(item => item.name.includes(listingSearch.trim()) || item.category.includes(listingSearch.trim())), [listings, listingSearch])
  const pendingCount = requests.filter(request => request.status === 'جديد').length
  const activeCount = listings.filter(listing => listing.status === 'نشط').length

  const renderOverview = () => (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-3xl bg-brand px-6 py-7 text-cream shadow-[0_18px_45px_-24px_rgba(7,92,61,.68)] sm:px-8">
        <div className="grid gap-7 lg:grid-cols-[1.3fr_.7fr] lg:items-end">
          <div>
            <p className="text-sm font-semibold text-cream/70">ملخص هذا الشهر</p>
            <h2 className="mt-2 text-3xl font-black sm:text-4xl">١٢٬٤٥٠ <span className="text-lg font-bold text-amber">ج.م</span></h2>
            <p className="mt-2 text-sm leading-6 text-cream/80">إيراداتك زادت ١٨٪ عن الشهر السابق. لديك {pendingCount} طلبات تحتاج قرارك.</p>
            <button onClick={() => setActiveTab('requests')} className="mt-5 inline-flex items-center gap-2 rounded-full bg-cream px-4 py-2.5 text-sm font-bold text-brand transition hover:bg-white"><Bell size={16} /> مراجعة الطلبات</button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[['إعلانات نشطة', `${activeCount}`], ['نسبة القبول', '٩٢٪'], ['متوسط التقييم', '٤٫٩'], ['أيام محجوزة', '١٨']].map(([label, value]) => <div key={label} className="rounded-2xl border border-white/15 bg-white/10 p-4"><p className="text-xs text-cream/65">{label}</p><strong className="mt-1 block text-xl">{value}</strong></div>)}
          </div>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[1.25fr_.75fr]">
        <section className="rounded-3xl border border-line bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between"><div><h2 className="font-bold text-ink">أداء الإعلانات</h2><p className="mt-1 text-xs text-ink/55">المشاهدات وطلبات الإيجار خلال آخر ٧ أيام</p></div><Eye size={19} className="text-brand" /></div>
          <div className="mt-7 flex h-40 items-end gap-3" aria-label="رسم بياني للمشاهدات">
            {[42, 55, 39, 72, 58, 88, 68].map((height, index) => <div key={index} className="flex flex-1 flex-col items-center gap-2"><div className="w-full rounded-t-lg bg-brand/15" style={{ height: `${height}%` }}><div className="h-[62%] rounded-t-lg bg-brand" /></div><span className="text-[10px] text-ink/45">{['س', 'ح', 'ن', 'ث', 'ر', 'خ', 'ج'][index]}</span></div>)}
          </div>
        </section>
        <section className="rounded-3xl border border-line bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between"><h2 className="font-bold text-ink">إجراءات سريعة</h2><Plus size={19} className="text-brand" /></div>
          <div className="mt-4 space-y-2">
            <QuickAction icon={Plus} label="إضافة منتج جديد" onClick={openNewListing} />
            <QuickAction icon={CalendarDays} label="تحديث أيام التوافر" onClick={() => setActiveTab('calendar')} />
            <QuickAction icon={MessageCircle} label="قراءة الرسائل الجديدة" onClick={() => setActiveTab('inbox')} />
          </div>
        </section>
      </div>

      <section className="rounded-3xl border border-line bg-white shadow-sm"><div className="flex items-center justify-between border-b border-line px-6 py-5"><div><h2 className="font-bold text-ink">أحدث طلبات الإيجار</h2><p className="mt-1 text-xs text-ink/55">تحرّك بسرعة لرفع فرص تأكيد الحجز.</p></div><button onClick={() => setActiveTab('requests')} className="text-sm font-bold text-brand hover:underline">عرض الكل</button></div><div className="divide-y divide-line">{requests.slice(0, 3).map(request => <RequestRow key={request.id} request={request} onStatus={status => setRequests(items => items.map(item => item.id === request.id ? { ...item, status } : item))} compact />)}</div></section>
    </div>
  )

  const renderListings = () => {
    if (view === 'form') return renderListingForm()
    return <div className="rounded-3xl border border-line bg-white shadow-sm">
      <div className="flex flex-col gap-4 border-b border-line p-6 sm:flex-row sm:items-center sm:justify-between"><div><h2 className="text-xl font-bold text-ink">إعلاناتي</h2><p className="mt-1 text-sm text-ink/60">أنشئ، انشر، أوقف أو انسخ إعلاناتك بسهولة.</p></div><button onClick={openNewListing} className="inline-flex items-center justify-center gap-2 rounded-full bg-brand px-5 py-2.5 text-sm font-bold text-cream transition hover:bg-[#064b32]"><Plus size={18} /> إضافة منتج</button></div>
      <div className="p-6"><label className="flex items-center gap-3 rounded-2xl border border-line bg-cream px-4 py-3 focus-within:border-brand"><Search size={18} className="text-ink/40" /><input value={listingSearch} onChange={event => setListingSearch(event.target.value)} placeholder="ابحث في إعلاناتك..." className="w-full bg-transparent text-sm outline-none placeholder:text-ink/40" /></label>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{filteredListings.map(listing => <article key={listing.id} className="overflow-hidden rounded-2xl border border-line bg-white transition hover:border-brand/30 hover:shadow-md"><div className="relative aspect-[16/9] overflow-hidden bg-brand-soft"><img src={listing.image} alt={listing.name} className="h-full w-full object-cover transition duration-500 hover:scale-105" /><span className={`absolute right-3 top-3 rounded-full px-2.5 py-1 text-[11px] font-bold ${statusStyles[listing.status]}`}>{listing.status}</span></div><div className="p-4"><div className="flex items-start justify-between gap-3"><div><p className="text-[11px] font-bold text-rose">{listing.category}</p><h3 className="mt-1 font-bold text-ink">{listing.name}</h3></div><button onClick={() => openEdit(listing)} aria-label={`تعديل ${listing.name}`} className="grid h-8 w-8 place-items-center rounded-full bg-brand-soft text-brand hover:bg-brand hover:text-cream"><Pencil size={14} /></button></div><p className="mt-2 text-xs text-ink/55">{listing.blockedDates.length ? `${listing.blockedDates.length} أيام غير متاحة` : 'متاح للحجز الآن'}</p><div className="mt-4 flex items-center justify-between border-t border-line pt-3"><strong className="text-sm text-amber">{listing.price} <span className="font-normal text-ink/60">ج.م/يوم</span></strong><div className="flex gap-1"><SmallAction icon={listing.status === 'نشط' ? Pause : Play} title={listing.status === 'نشط' ? 'إيقاف مؤقت' : 'نشر'} onClick={() => updateListingStatus(listing.id, listing.status === 'نشط' ? 'موقوف مؤقتًا' : 'نشط')} /><SmallAction icon={Copy} title="نسخ الإعلان" onClick={() => duplicateListing(listing)} /><SmallAction icon={Archive} title="أرشفة" onClick={() => updateListingStatus(listing.id, 'مؤرشف')} /></div></div></div></article>)}</div>
        {!filteredListings.length && <EmptyState icon={Package} title="لا توجد إعلانات مطابقة" text="جرّب عبارة بحث أخرى أو أضف منتجًا جديدًا." action="إضافة منتج" onClick={openNewListing} />}
      </div>
    </div>
  }

  const renderListingForm = () => <form onSubmit={event => saveListing(event)} className="space-y-6 rounded-3xl border border-line bg-white p-6 shadow-sm sm:p-8">
    <div className="flex items-start justify-between gap-4 border-b border-line pb-6"><div className="flex gap-3"><button type="button" onClick={() => setView('list')} className="grid h-10 w-10 place-items-center rounded-full border border-line text-ink/70 hover:bg-brand-soft"><ChevronRight size={20} /></button><div><h2 className="text-xl font-bold text-ink">{editing ? 'تعديل الإعلان' : 'إضافة إعلان جديد'}</h2><p className="mt-1 text-sm text-ink/60">كل التفاصيل قابلة للتخصيص، واحفظ المسودة متى شئت.</p></div></div><span className={`rounded-full px-3 py-1.5 text-xs font-bold ${statusStyles[form.status]}`}>{form.status}</span></div>
    <div className="grid gap-6 xl:grid-cols-[.75fr_1.25fr]">
      <section className="space-y-5"><div><Label>صور المنتج</Label><div className="grid grid-cols-2 gap-2">{[...form.photos, form.image].filter((value, index, values) => value && values.indexOf(value) === index).map((photo, index) => <div key={`${photo}-${index}`} className="group relative aspect-square overflow-hidden rounded-2xl bg-brand-soft"><img src={photo} alt={`صورة المنتج ${index + 1}`} className="h-full w-full object-cover" />{form.photos.includes(photo) && <button type="button" onClick={() => setForm(current => ({ ...current, photos: current.photos.filter(item => item !== photo) }))} className="absolute left-2 top-2 grid h-7 w-7 place-items-center rounded-full bg-white/90 text-rose opacity-0 shadow-sm transition group-hover:opacity-100" aria-label="حذف الصورة"><X size={15} /></button>}</div>)}</div><div className="mt-3 flex gap-2"><input value={photoDraft} onChange={event => setPhotoDraft(event.target.value)} placeholder="رابط صورة إضافية" className="min-w-0 flex-1 rounded-xl border border-line px-3 py-2.5 text-sm outline-none focus:border-brand" /><button type="button" onClick={() => { if (photoDraft.trim()) { setForm(current => ({ ...current, photos: [...current.photos, photoDraft.trim()] })); setPhotoDraft('') } }} className="rounded-xl border border-brand px-3 text-brand hover:bg-brand hover:text-cream"><Camera size={17} /></button></div><p className="mt-2 text-xs text-ink/50">يمكنك إضافة وترتيب صور متعددة للمنتج.</p></div>
        <div className="rounded-2xl bg-cream p-4"><Label>معاينة سريعة</Label><p className="mt-2 font-bold text-ink">{form.name || 'اسم المنتج'}</p><p className="mt-1 text-sm text-amber">{form.price || '٠'} ج.م / يوم</p><p className="mt-3 line-clamp-3 text-xs leading-5 text-ink/60">{form.description || 'سيظهر هنا وصف المنتج الذي تكتبه.'}</p></div></section>
      <section className="space-y-5"><div><Label>اسم المنتج</Label><input required value={form.name} onChange={event => setForm(current => ({ ...current, name: event.target.value }))} placeholder="مثال: كاميرا سوني ألفا 7III" className="field" /></div><div className="grid gap-4 sm:grid-cols-2"><div><Label>الفئة</Label><input value={form.category} onChange={event => setForm(current => ({ ...current, category: event.target.value }))} placeholder="اكتب الفئة" className="field" /></div><div><Label>المدينة</Label><input value={form.city} onChange={event => setForm(current => ({ ...current, city: event.target.value }))} placeholder="مدينة الاستلام" className="field" /></div></div><div><Label>وصف المنتج</Label><textarea value={form.description} onChange={event => setForm(current => ({ ...current, description: event.target.value }))} placeholder="اذكر كل ما يهم المستأجر معرفته." rows={3} className="field resize-y" /></div><div className="grid gap-4 sm:grid-cols-2"><div><Label>حالة المنتج</Label><input value={form.condition} onChange={event => setForm(current => ({ ...current, condition: event.target.value }))} placeholder="مثال: ممتازة" className="field" /></div><div><Label>سعر اليوم (ج.م)</Label><input required type="number" value={form.price} onChange={event => setForm(current => ({ ...current, price: event.target.value }))} className="field" /></div></div></section>
    </div>
    <section className="grid gap-5 rounded-3xl border border-line bg-cream/45 p-5 lg:grid-cols-2"><div><h3 className="font-bold text-ink">تسعير مرن</h3><p className="mt-1 text-xs text-ink/55">كلها اختيارية؛ اترك ما لا يناسب منتجك فارغًا.</p><div className="mt-4 grid gap-3 sm:grid-cols-2">{([['weeklyPrice', 'سعر الأسبوع'], ['monthlyPrice', 'سعر الشهر'], ['deposit', 'مبلغ التأمين'], ['deliveryFee', 'رسوم التوصيل']] as const).map(([key, label]) => <div key={key}><Label>{label} (ج.م)</Label><input type="number" value={form[key]} onChange={event => setForm(current => ({ ...current, [key]: event.target.value }))} className="field bg-white" /></div>)}</div></div><div><h3 className="font-bold text-ink">التوفر والحجز</h3><p className="mt-1 text-xs text-ink/55">حدّد الأيام التي لا ترغب بتلقي حجوزات فيها.</p><div className="mt-4 flex flex-wrap gap-2">{sampleDates.map(date => { const blocked = form.blockedDates.includes(date); return <button type="button" key={date} onClick={() => setForm(current => ({ ...current, blockedDates: blocked ? current.blockedDates.filter(item => item !== date) : [...current.blockedDates, date] }))} className={`rounded-xl border px-3 py-2 text-xs font-bold transition ${blocked ? 'border-rose bg-rose/10 text-rose line-through' : 'border-line bg-white text-ink/70 hover:border-brand'}`}>{date}</button> })}</div></div></section>
    <div className="grid gap-5 lg:grid-cols-2"><DynamicChips title="مميزات المنتج" description="اكتب المزايا بالطريقة التي تناسب منتجك؛ لا توجد حقول مفروضة." items={form.features ?? []} value={featureDraft} onChange={setFeatureDraft} onAdd={() => addString('features', featureDraft, () => setFeatureDraft(''))} onRemove={index => setForm(current => ({ ...current, features: (current.features ?? []).filter((_, itemIndex) => itemIndex !== index) }))} placeholder="اكتب ميزة خاصة بمنتجك" /><DynamicChips title="ما الذي يأتي مع المنتج؟" description="أضف الملحقات أو العناصر المشمولة في الإيجار إن وُجدت." items={form.included} value={includedDraft} onChange={setIncludedDraft} onAdd={() => addString('included', includedDraft, () => setIncludedDraft(''))} onRemove={index => setForm(current => ({ ...current, included: current.included.filter((_, itemIndex) => itemIndex !== index) }))} placeholder="اكتب عنصرًا مشمولًا" /></div>
    <div className="flex flex-wrap justify-end gap-3 border-t border-line pt-6"><button type="button" onClick={() => setView('list')} className="rounded-full border border-line px-5 py-2.5 text-sm font-bold text-ink hover:bg-cream">إلغاء</button><button type="button" onClick={event => saveListing(event, true)} className="rounded-full border border-brand px-5 py-2.5 text-sm font-bold text-brand hover:bg-brand-soft">حفظ كمسودة</button><button type="submit" className="inline-flex items-center gap-2 rounded-full bg-brand px-5 py-2.5 text-sm font-bold text-cream hover:bg-[#064b32]"><CheckCircle2 size={17} /> {editing ? 'حفظ التعديلات' : 'نشر الإعلان'}</button></div>
  </form>

  const renderRequests = () => <section className="rounded-3xl border border-line bg-white shadow-sm"><div className="flex items-center justify-between border-b border-line p-6"><div><h2 className="text-xl font-bold text-ink">طلبات الإيجار</h2><p className="mt-1 text-sm text-ink/60">قبول الطلب يثبت الحجز في تقويم التوافر.</p></div><span className="rounded-full bg-amber/15 px-3 py-1.5 text-xs font-bold text-[#b53d13]">{pendingCount} طلبات جديدة</span></div><div className="divide-y divide-line">{requests.map(request => <RequestRow key={request.id} request={request} onStatus={status => { setRequests(items => items.map(item => item.id === request.id ? { ...item, status } : item)); notify(status === 'مؤكد' ? 'تم تأكيد الحجز وإشعار المستأجر.' : 'تم تحديث حالة الطلب.') }} />)}</div></section>

  const renderCalendar = () => <div className="grid gap-6 xl:grid-cols-[1.25fr_.75fr]"><section className="rounded-3xl border border-line bg-white p-6 shadow-sm"><div className="flex items-center justify-between"><div><h2 className="text-xl font-bold text-ink">تقويم التوافر</h2><p className="mt-1 text-sm text-ink/60">انقر على اليوم لمنع الحجز، أو فعّله مجددًا لإتاحته.</p></div><CalendarDays className="text-brand" /></div><div className="mt-6 grid grid-cols-7 gap-2">{sampleDates.concat(['٢٥ أغسطس', '٢٦ أغسطس', '٢٧ أغسطس', '٢٨ أغسطس', '٢٩ أغسطس', '٣٠ أغسطس', '٣١ أغسطس']).map((date, index) => { const isBooked = index === 2 || index === 9; const isBlocked = listings.some(listing => listing.blockedDates.includes(date)); return <button key={date} onClick={() => setListings(current => current.map((listing, listingIndex) => listingIndex === 0 ? { ...listing, blockedDates: listing.blockedDates.includes(date) ? listing.blockedDates.filter(item => item !== date) : [...listing.blockedDates, date] } : listing))} className={`min-h-20 rounded-2xl border p-2 text-right text-xs transition ${isBooked ? 'cursor-not-allowed border-brand/20 bg-brand-soft text-brand' : isBlocked ? 'border-rose/25 bg-rose/10 text-rose' : 'border-line hover:border-brand hover:bg-cream'}`}><span className="block font-bold">{date}</span><span className="mt-2 block text-[10px]">{isBooked ? 'محجوز' : isBlocked ? 'غير متاح' : 'متاح'}</span></button> })}</div><div className="mt-5 flex flex-wrap gap-4 text-xs text-ink/60"><span className="flex items-center gap-1.5"><i className="h-2.5 w-2.5 rounded-full bg-green" /> متاح</span><span className="flex items-center gap-1.5"><i className="h-2.5 w-2.5 rounded-full bg-brand" /> محجوز</span><span className="flex items-center gap-1.5"><i className="h-2.5 w-2.5 rounded-full bg-rose" /> غير متاح</span></div></section><section className="rounded-3xl border border-line bg-white p-6 shadow-sm"><h2 className="font-bold text-ink">قواعد التوافر</h2><div className="mt-4 space-y-3"><ToggleRow label="قبول الحجوزات الفورية" initial /><ToggleRow label="السماح بالاستلام في عطلات الأسبوع" initial /><ToggleRow label="منع الحجز قبل ٢٤ ساعة" /></div><button onClick={() => notify('تم حفظ قواعد التوافر.')} className="mt-6 w-full rounded-full bg-brand py-2.5 text-sm font-bold text-cream hover:bg-[#064b32]">حفظ القواعد</button></section></div>

  const renderInbox = () => <div className="grid overflow-hidden rounded-3xl border border-line bg-white shadow-sm md:grid-cols-[17rem_1fr]"><aside className="border-b border-line bg-cream/55 p-4 md:border-b-0 md:border-l"><div className="flex items-center justify-between px-2 py-2"><h2 className="font-bold text-ink">الرسائل</h2><span className="rounded-full bg-rose px-2 py-0.5 text-[10px] font-bold text-white">٢</span></div>{['سارة أحمد', 'عمر خالد', 'ندى محمود'].map((name, index) => <button key={name} className={`mt-1 w-full rounded-2xl p-3 text-right transition ${index === 0 ? 'bg-white shadow-sm' : 'hover:bg-white/70'}`}><div className="flex items-center gap-3"><span className="grid h-9 w-9 place-items-center rounded-full bg-brand text-sm font-bold text-cream">{name[0]}</span><span><strong className="block text-sm text-ink">{name}</strong><small className="text-xs text-ink/55">{index === 0 ? 'هل الاستلام متاح مساءً؟' : 'آخر رسالة منذ يومين'}</small></span></div></button>)}</aside><section className="flex min-h-[390px] flex-col"><div className="flex items-center gap-3 border-b border-line p-5"><span className="grid h-10 w-10 place-items-center rounded-full bg-brand text-sm font-bold text-cream">س</span><div><h2 className="font-bold text-ink">سارة أحمد</h2><p className="text-xs text-green">متصلة الآن</p></div></div><div className="flex-1 space-y-3 p-5"><p className="max-w-sm rounded-2xl rounded-tr-sm bg-cream p-3 text-sm leading-6 text-ink">مرحبًا، هل الكاميرا متاحة للاستلام مساءً؟</p><p className="mr-auto max-w-sm rounded-2xl rounded-tl-sm bg-brand p-3 text-sm leading-6 text-cream">أهلًا سارة، نعم متاحة. يمكنك اختيار الموعد المناسب لك.</p>{sentMessages.map((item, index) => <p key={index} className="mr-auto max-w-sm rounded-2xl rounded-tl-sm bg-brand p-3 text-sm leading-6 text-cream">{item}</p>)}</div><div className="flex gap-2 border-t border-line p-4"><input value={message} onChange={event => setMessage(event.target.value)} onKeyDown={event => { if (event.key === 'Enter' && message.trim()) { setSentMessages(items => [...items, message.trim()]); setMessage('') } }} placeholder="اكتب رسالة..." className="min-w-0 flex-1 rounded-xl bg-cream px-4 py-3 text-sm outline-none focus:ring-1 focus:ring-brand" /><button onClick={() => { if (message.trim()) { setSentMessages(items => [...items, message.trim()]); setMessage('') } }} className="grid h-11 w-11 place-items-center rounded-xl bg-brand text-cream"><Send size={18} /></button></div></section></div>

  const renderEarnings = () => <div className="space-y-6"><section className="grid gap-4 sm:grid-cols-3"><Metric icon={Wallet} label="الرصيد المتاح" value="٤٬٨٠٠ ج.م" color="brand" /><Metric icon={CircleDollarSign} label="أرباح هذا الشهر" value="١٢٬٤٥٠ ج.م" color="amber" /><Metric icon={CalendarCheck} label="دفعات مكتملة" value="١٨" color="green" /></section><section className="rounded-3xl border border-line bg-white p-6 shadow-sm"><div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center"><div><h2 className="text-xl font-bold text-ink">سحب الرصيد</h2><p className="mt-1 text-sm text-ink/60">سيتم التحويل إلى حسابك البنكي المنتهي بـ ٤٢٧١.</p></div><button onClick={() => { setWithdrawn(true); notify('تم إرسال طلب السحب بنجاح.') }} className="rounded-full bg-brand px-5 py-2.5 text-sm font-bold text-cream hover:bg-[#064b32]">{withdrawn ? 'تم إرسال الطلب' : 'طلب سحب ٤٬٨٠٠ ج.م'}</button></div><div className="mt-6 overflow-x-auto"><table className="w-full min-w-[560px] text-right text-sm"><thead className="text-xs text-ink/50"><tr className="border-b border-line"><th className="pb-3 font-medium">التاريخ</th><th className="pb-3 font-medium">العملية</th><th className="pb-3 font-medium">الحالة</th><th className="pb-3 font-medium">المبلغ</th></tr></thead><tbody>{[['١٦ أغسطس', 'إيجار كاميرا سوني ألفا', 'مكتمل', '+ ٩٢٥ ج.م'], ['١٤ أغسطس', 'إيجار بلايستيشن ٥', 'مكتمل', '+ ٧٧٥ ج.م'], ['١٢ أغسطس', 'رسوم المنصة', 'مكتمل', '− ٦٠ ج.م']].map(row => <tr key={row[1]} className="border-b border-line/70"><td className="py-4 text-ink/65">{row[0]}</td><td className="py-4 font-medium text-ink">{row[1]}</td><td className="py-4"><span className="rounded-full bg-green/10 px-2 py-1 text-xs font-bold text-green">{row[2]}</span></td><td className="py-4 font-bold text-green">{row[3]}</td></tr>)}</tbody></table></div></section></div>

  const renderReviews = () => <section className="rounded-3xl border border-line bg-white shadow-sm"><div className="border-b border-line p-6"><h2 className="text-xl font-bold text-ink">التقييمات والمراجعات</h2><p className="mt-1 text-sm text-ink/60">متوسط تقييمك ٤٫٩ من ٥ بناءً على ٢٨ عملية إيجار.</p></div><div className="divide-y divide-line">{[['ندى محمود', 'تجربة رائعة، الكاميرا نظيفة والمالك متعاون جدًا.', '٥٫٠'], ['أحمد سمير', 'المثقاب أدى الغرض تمامًا والاستلام كان سهلًا.', '٤٫٨']].map(([name, review, rating]) => <article key={name} className="p-6"><div className="flex items-start justify-between gap-4"><div className="flex gap-3"><span className="grid h-10 w-10 place-items-center rounded-full bg-brand-soft font-bold text-brand">{name[0]}</span><div><h3 className="font-bold text-ink">{name}</h3><div className="mt-1 flex items-center gap-1 text-amber"><Star size={14} fill="currentColor" /><span className="text-xs font-bold">{rating}</span></div></div></div><span className="text-xs text-ink/45">منذ ٣ أيام</span></div><p className="mt-4 text-sm leading-6 text-ink/70">{review}</p>{repliedReviews.includes(name) ? <p className="mt-3 rounded-xl bg-green/10 px-3 py-2 text-xs font-bold text-green">تم إرسال ردك، شكرًا لتفاعلك.</p> : <button onClick={() => { setRepliedReviews(items => [...items, name]); notify('تم إرسال ردك على المراجعة.') }} className="mt-4 text-sm font-bold text-brand hover:underline">الرد على المراجعة</button>}</article>)}</div></section>

  const renderSettings = () => <div className="grid gap-6 xl:grid-cols-[1.1fr_.9fr]"><section className="rounded-3xl border border-line bg-white p-6 shadow-sm"><h2 className="text-xl font-bold text-ink">إعدادات الحساب</h2><p className="mt-1 text-sm text-ink/60">بيانات الاستلام والتحويل والإشعارات.</p><div className="mt-6 space-y-4"><div><Label>اسم الحساب</Label><input defaultValue="مروان السيد" className="field" /></div><div><Label>رقم الهاتف</Label><input defaultValue="+20 100 123 4567" className="field" /></div><div><Label>حساب التحويل</Label><input defaultValue="البنك الأهلي •••• ٤٢٧١" className="field" /></div><button onClick={() => notify('تم حفظ إعدادات الحساب.')} className="rounded-full bg-brand px-5 py-2.5 text-sm font-bold text-cream hover:bg-[#064b32]">حفظ التغييرات</button></div></section><section className="rounded-3xl border border-line bg-white p-6 shadow-sm"><h2 className="text-xl font-bold text-ink">الإشعارات</h2><div className="mt-5 space-y-3"><ToggleRow label="طلبات إيجار جديدة" initial /><ToggleRow label="رسائل المستأجرين" initial /><ToggleRow label="تذكير موعد الإرجاع" initial /><ToggleRow label="ملخص الأرباح الأسبوعي" /></div><div className="mt-6 rounded-2xl bg-cream p-4"><div className="flex gap-3"><ShieldCheck className="shrink-0 text-green" /><p className="text-xs leading-5 text-ink/65">تم التحقق من هويتك. حافظ على بيانات الحساب محدثة لضمان سرعة التحويلات.</p></div></div></section></div>

  const content = { overview: renderOverview, listings: renderListings, requests: renderRequests, calendar: renderCalendar, inbox: renderInbox, earnings: renderEarnings, reviews: renderReviews, settings: renderSettings }[activeTab]
  const navigation = [
    ['overview', 'نظرة عامة', LayoutDashboard], ['listings', 'إعلاناتي', Package], ['requests', 'طلبات الإيجار', Bell], ['calendar', 'التوافر', CalendarDays], ['inbox', 'الرسائل', MessageCircle], ['earnings', 'الأرباح', Wallet], ['reviews', 'التقييمات', Star], ['settings', 'الإعدادات', Settings],
  ] as const

  return <div dir="rtl" lang="ar" className="min-h-screen bg-cream"><Header />
    <main className="mx-auto max-w-7xl px-5 py-8 sm:py-12"><div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-xs font-bold tracking-[.16em] text-rose">CIRCLE FOR OWNERS</p><h1 className="mt-2 text-3xl font-black text-brand sm:text-4xl">مساحة إدارة التأجير</h1><p className="mt-2 text-sm text-ink/60">كل ما تحتاج إليه لتشغيل إعلاناتك وتجربة مستأجريك من مكان واحد.</p></div><button onClick={openNewListing} className="inline-flex items-center justify-center gap-2 self-start rounded-full bg-brand px-5 py-3 text-sm font-bold text-cream shadow-sm hover:bg-[#064b32]"><Plus size={18} /> إعلان جديد</button></div>
      {notice && <div role="status" className="fixed bottom-6 left-6 z-50 rounded-2xl bg-ink px-4 py-3 text-sm font-bold text-cream shadow-xl">{notice}</div>}
      <div className="mt-8 grid items-start gap-7 lg:grid-cols-[14rem_minmax(0,1fr)]"><aside className="lg:sticky lg:top-28"><nav className="flex gap-1 overflow-x-auto rounded-3xl border border-line bg-white p-2 shadow-sm lg:flex-col">{navigation.map(([id, label, Icon]) => <button key={id} onClick={() => { setActiveTab(id); setView('list') }} className={`flex shrink-0 items-center gap-3 rounded-2xl px-4 py-3 text-right text-sm transition ${activeTab === id ? 'bg-brand font-bold text-cream shadow-sm' : 'font-medium text-ink/65 hover:bg-brand-soft hover:text-brand'}`}><Icon size={17} /><span>{label}</span>{id === 'requests' && pendingCount > 0 && <span className={`mr-auto grid h-5 min-w-5 place-items-center rounded-full px-1 text-[10px] ${activeTab === id ? 'bg-cream text-brand' : 'bg-rose text-white'}`}>{pendingCount}</span>}</button>)}</nav></aside><section className="min-w-0">{content()}</section></div>
    </main><Footer />
  </div>
}

function Label({ children }: { children: React.ReactNode }) { return <label className="mb-1.5 block text-sm font-bold text-ink">{children}</label> }
function QuickAction({ icon: Icon, label, onClick }: { icon: typeof Plus, label: string, onClick: () => void }) { return <button onClick={onClick} className="flex w-full items-center gap-3 rounded-2xl border border-line px-4 py-3 text-right text-sm font-semibold text-ink transition hover:border-brand/25 hover:bg-brand-soft"><span className="grid h-8 w-8 place-items-center rounded-xl bg-brand-soft text-brand"><Icon size={16} /></span>{label}<ChevronRight size={16} className="mr-auto text-ink/40" /></button> }
function SmallAction({ icon: Icon, title, onClick }: { icon: typeof Plus, title: string, onClick: () => void }) { return <button title={title} aria-label={title} onClick={onClick} className="grid h-7 w-7 place-items-center rounded-full text-ink/50 transition hover:bg-brand-soft hover:text-brand"><Icon size={14} /></button> }
function EmptyState({ icon: Icon, title, text, action, onClick }: { icon: typeof Package, title: string, text: string, action: string, onClick: () => void }) { return <div className="col-span-full mt-4 flex min-h-64 flex-col items-center justify-center rounded-3xl border-2 border-dashed border-line p-8 text-center"><Icon size={38} className="text-ink/25" /><h3 className="mt-3 font-bold text-ink">{title}</h3><p className="mt-1 text-sm text-ink/55">{text}</p><button onClick={onClick} className="mt-4 rounded-full border border-brand px-4 py-2 text-sm font-bold text-brand hover:bg-brand-soft">{action}</button></div> }
function DynamicChips({ title, description, items, value, onChange, onAdd, onRemove, placeholder }: { title: string, description: string, items: string[], value: string, onChange: (value: string) => void, onAdd: () => void, onRemove: (index: number) => void, placeholder: string }) { return <section className="rounded-3xl border border-line bg-white p-5"><h3 className="font-bold text-ink">{title} <span className="mr-1 text-xs font-medium text-ink/45">اختياري</span></h3><p className="mt-1 text-xs leading-5 text-ink/55">{description}</p><div className="mt-4 flex gap-2"><input value={value} onChange={event => onChange(event.target.value)} onKeyDown={event => { if (event.key === 'Enter') { event.preventDefault(); onAdd() } }} placeholder={placeholder} className="min-w-0 flex-1 rounded-xl border border-line px-3 py-2.5 text-sm outline-none focus:border-brand" /><button type="button" onClick={onAdd} className="inline-flex items-center gap-1 rounded-xl border border-brand px-3 text-sm font-bold text-brand hover:bg-brand hover:text-cream"><Plus size={15} /> إضافة</button></div>{items.length > 0 && <div className="mt-3 flex flex-wrap gap-2">{items.map((item, index) => <span key={`${item}-${index}`} className="inline-flex items-center gap-1.5 rounded-full bg-brand-soft px-2 py-1.5 text-xs font-medium text-brand">{item}<button type="button" onClick={() => onRemove(index)} aria-label={`حذف ${item}`} className="grid h-4 w-4 place-items-center rounded-full hover:bg-rose/15 hover:text-rose"><X size={12} /></button></span>)}</div>}</section> }
function RequestRow({ request, onStatus, compact = false }: { request: RentalRequest, onStatus: (status: RequestStatus) => void, compact?: boolean }) { return <article className={`flex flex-col gap-4 p-5 sm:flex-row sm:items-center ${compact ? 'px-6' : 'p-6'}`}><span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-brand-soft font-bold text-brand">{request.avatar}</span><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><h3 className="font-bold text-ink">{request.renter}</h3><span className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${statusStyles[request.status]}`}>{request.status}</span></div><p className="mt-1 text-sm text-ink/60">{request.product} <span className="mx-1 text-line">•</span> {request.dates}</p></div><strong className="text-sm text-amber">{request.total}</strong>{request.status === 'جديد' && <div className="flex gap-2"><button onClick={() => onStatus('مرفوض')} className="rounded-full border border-line px-3 py-2 text-xs font-bold text-ink/65 hover:bg-rose/10 hover:text-rose">رفض</button><button onClick={() => onStatus('مؤكد')} className="inline-flex items-center gap-1 rounded-full bg-brand px-3 py-2 text-xs font-bold text-cream hover:bg-[#064b32]"><Check size={14} /> قبول</button></div>}</article> }
function ToggleRow({ label, initial = false }: { label: string, initial?: boolean }) { const [enabled, setEnabled] = useState(initial); return <button type="button" onClick={() => setEnabled(value => !value)} className="flex w-full items-center justify-between rounded-2xl bg-cream px-4 py-3 text-right text-sm font-medium text-ink"><span>{label}</span><span className={`relative h-6 w-11 rounded-full transition ${enabled ? 'bg-green' : 'bg-ink/20'}`}><span className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow transition ${enabled ? 'right-6' : 'right-1'}`} /></span></button> }
function Metric({ icon: Icon, label, value, color }: { icon: typeof Wallet, label: string, value: string, color: 'brand' | 'amber' | 'green' }) { const classes = { brand: 'bg-brand-soft text-brand', amber: 'bg-amber/15 text-[#b53d13]', green: 'bg-green/10 text-green' }[color]; return <section className="rounded-3xl border border-line bg-white p-5 shadow-sm"><span className={`grid h-10 w-10 place-items-center rounded-2xl ${classes}`}><Icon size={19} /></span><p className="mt-5 text-sm text-ink/60">{label}</p><strong className="mt-1 block text-2xl text-ink">{value}</strong></section> }
