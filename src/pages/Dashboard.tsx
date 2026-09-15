import { useEffect, useMemo, useRef, useState } from "react"
import { Header, Footer, type Listing } from "../App"
import {
  Bell,
  CalendarDays,
  Camera,
  Check,
  CheckCircle2,
  ChevronRight,
  Package,
  Pause,
  Pencil,
  Play,
  Plus,
  Search,
  Settings,
  Star,
  X,
  User,
  ShoppingBag,
  Inbox,
  ShieldCheck,
  Send,
} from "lucide-react"
import { useAuth } from "../context/AuthContext"

type ListingStatus = "نشط" | "موقوف مؤقتًا" | "مسودة" | "مؤرشف"
type RequestStatus = "جديد" | "مؤكد" | "مرفوض" | "مكتمل"

type DashboardListing = Listing & {
  description: string
  condition: string
  included: string[]
  features: string[]
  photos: string[]
  status: ListingStatus
  weeklyPrice: string
  monthlyPrice: string
  deposit: string
  deliveryFee: string
  insurance: string
  blockedDates: string[]
  version: string
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

const statusStyles: Record<ListingStatus | RequestStatus, string> = {
  "نشط": "bg-green/10 text-green",
  "موقوف مؤقتًا": "bg-amber/15 text-[#b53d13]",
  "مسودة": "bg-brand-soft text-brand",
  "مؤرشف": "bg-ink/8 text-ink/55",
  "جديد": "bg-amber/15 text-[#b53d13]",
  "مؤكد": "bg-green/10 text-green",
  "مرفوض": "bg-rose/10 text-rose",
  "مكتمل": "bg-brand-soft text-brand",
}

const emptyListing = (): DashboardListing => ({
  id: `new-${Date.now()}`,
  name: "",
  category: "أخرى",
  price: "",
  city: "الرياض",
  image: image("1516035069371-29a1b244cc32"),
  owner: "أنا",
  rating: "٠٫٠",
  verified: true,
  description: "",
  condition: "",
  included: [],
  features: [],
  photos: [],
  status: "مسودة",
  weeklyPrice: "",
  monthlyPrice: "",
  deposit: "",
  deliveryFee: "",
  insurance: "",
  blockedDates: [],
  version: "",
})

export default function Dashboard() {
  const { user, refreshUser } = useAuth()
  const [activeTab, setActiveTab] = useState<"rented" | "listings" | "requests" | "inbox" | "reviews" | "profile">("rented")

  const [listings, setListings] = useState<DashboardListing[]>([])
  const [requests, setRequests] = useState<RentalRequest[]>([])
  const [rented, setRented] = useState<any[]>([])

  const [conversations, setConversations] = useState<any[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [messages, setMessages] = useState<any[]>([])

  useEffect(() => {
    import("../services/listings").then(({ getOwnerListings }) => {
      getOwnerListings()
        .then((data) => setListings(data as unknown as DashboardListing[]))
        .catch(() => {})
    })

    import("../services/bookings").then(({ getOwnerBookings, getMyBookings }) => {
      getOwnerBookings()
        .then((bookings) => {
          setRequests(
            bookings.map((b) => ({
              id: b.id,
              renter: b.ownerName,
              product: b.listingName,
              dates: `${b.start} – ${b.end}`,
              total: `${b.total.toLocaleString("ar-EG")} ج.م`,
              status: b.status === "pending" ? "جديد" : b.status === "approved" ? "مؤكد" : b.status === "completed" ? "مكتمل" : "مرفوض",
              avatar: b.ownerName.charAt(0),
            })),
          )
        })
        .catch(() => {})
      
      getMyBookings()
        .then(setRented)
        .catch(() => {})
    })

    import("../services/messages").then(({ getConversations }) => {
      getConversations()
        .then(setConversations)
        .catch(() => {})
    })
  }, [])

  useEffect(() => {
    if (selectedId) {
      import("../services/messages").then(({ getMessages }) => {
        getMessages(selectedId)
          .then(setMessages)
          .catch(() => {})
      })
    }
  }, [selectedId])

  const [view, setView] = useState<"list" | "form">("list")
  const [editing, setEditing] = useState<DashboardListing | null>(null)
  const [form, setForm] = useState<DashboardListing>(emptyListing())
  const [featureDraft, setFeatureDraft] = useState("")
  const [includedDraft, setIncludedDraft] = useState("")
  const [listingSearch, setListingSearch] = useState("")
  const [message, setMessage] = useState("")
  const [notice, setNotice] = useState("")

  const [profileName, setProfileName] = useState(user?.fullName ?? "ضيف سيركل")
  const [profileBio, setProfileBio] = useState(user?.bio ?? "")
  const [profileCity, setProfileCity] = useState(user?.city ?? "")

  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl ?? "")
  const [avatarUploading, setAvatarUploading] = useState(false)
  const avatarInputRef = useRef<HTMLInputElement>(null)

  const notify = (text: string) => {
    setNotice(text)
    window.setTimeout(() => setNotice(""), 2600)
  }

  const openNewListing = () => {
    setEditing(null)
    setForm(emptyListing())
    setFeatureDraft("")
    setIncludedDraft("")
    setView("form")
    setActiveTab("listings")
  }

  const openEdit = (listing: DashboardListing) => {
    setEditing(listing)
    setForm({
      ...listing,
      features: [...(listing.features ?? [])],
      included: [...(listing.included ?? [])],
      photos: [...(listing.photos ?? [])],
    })
    setFeatureDraft("")
    setIncludedDraft("")
    setView("form")
  }

  const saveListing = async (event: React.SyntheticEvent, asDraft = false) => {
    event.preventDefault()
    const saved = {
      ...form,
      status: asDraft ? "مسودة" : form.status === "مسودة" ? "نشط" : form.status,
      image: form.photos[0] || form.image,
    }

    try {
      const { createListing, updateListing } = await import("../services/listings")
      if (editing) {
        await updateListing(saved.id, saved as never)
      } else {
        await createListing(saved as never)
      }
    } catch { /* optimistic update */ }

    setListings((current) =>
      editing ? current.map((item) => (item.id === saved.id ? (saved as DashboardListing) : item)) : [(saved as DashboardListing), ...current],
    )
    setView("list")
    notify(asDraft ? "تم حفظ الإعلان كمسودة." : "تم حفظ الإعلان ونشره.")
  }

  const saveProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const { updateProfile } = await import("../services/users")
      await updateProfile({ fullName: profileName, city: profileCity, bio: profileBio, avatarUrl: avatarUrl || undefined })
      await refreshUser()
      notify("تم تحديث الملف الشخصي بنجاح.")
    } catch {
      notify("فشل تحديث الملف الشخصي.")
    }
  }

  const handleAvatarChange = async (file?: File) => {
    if (!file) return
    const preview = URL.createObjectURL(file)
    setAvatarUrl(preview)
    setAvatarUploading(true)
    try {
      const { uploadImage } = await import("../lib/uploadImage")
      const url = await uploadImage(file)
      const { updateProfile } = await import("../services/users")
      await updateProfile({ avatarUrl: url })
      setAvatarUrl(url)
      await refreshUser()
      notify("تم تحديث الصورة الشخصية بنجاح.")
    } catch {
      setAvatarUrl(user?.avatarUrl ?? "")
      notify("فشل رفع الصورة الشخصية.")
    } finally {
      URL.revokeObjectURL(preview)
      setAvatarUploading(false)
    }
  }

  const updateListingStatus = async (id: string, status: ListingStatus) => {
    try {
      const { updateListing } = await import("../services/listings")
      await updateListing(id, { status })
    } catch {}
    setListings((current) => current.map((item) => (item.id === id ? { ...item, status } : item)))
    notify(status === "نشط" ? "الإعلان متاح الآن للمستأجرين." : `تم تحديث حالة الإعلان إلى ${status}.`)
  }

  const addString = (kind: "features" | "included", value: string, clear: () => void) => {
    const clean = value.trim()
    if (!clean) return
    setForm((current) => ({ ...current, [kind]: [...(current[kind] ?? []), clean] }))
    clear()
  }

  const filteredListings = useMemo(() => listings.filter((item) => item.name.includes(listingSearch.trim()) || item.category.includes(listingSearch.trim())), [listings, listingSearch])
  const pendingCount = requests.filter((r) => r.status === "جديد").length
  const formOpen = activeTab === "listings" && view === "form"

  const renderRented = () => (
    <section className="rounded-3xl border border-line bg-white shadow-sm p-4 sm:p-6">
      <h2 className="text-xl font-bold text-ink">المنتجات المستأجرة</h2>
      <p className="mt-1 text-sm text-ink/60">منتجاتك الحالية والسابقة التي استأجرتها.</p>
      <div className="mt-6 space-y-3">
        {rented.length ? rented.map(booking => (
          <div key={booking.id} className="flex items-center gap-3 rounded-2xl border border-line p-3 sm:p-4">
            <img src={booking.listingImage} alt={booking.listingName} className="h-16 w-16 sm:h-20 sm:w-20 shrink-0 rounded-xl object-cover bg-brand-soft" />
            <div className="min-w-0 flex-1">
              <h3 className="truncate font-bold text-ink">{booking.listingName}</h3>
              <p className="truncate text-sm text-ink/60">من المالك: {booking.ownerName}</p>
              <div className="mt-1.5 flex items-center justify-between gap-2">
                <p className="flex min-w-0 items-center gap-1 text-xs font-semibold text-amber"><CalendarDays size={14} className="shrink-0"/> <span className="truncate">تنتهي في: {booking.end}</span></p>
                <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-bold whitespace-nowrap ${booking.status === 'active' ? 'bg-green/10 text-green' : 'bg-brand-soft text-brand'}`}>
                  {booking.status === 'active' ? 'تأجير جارٍ' : 'مكتمل'}
                </span>
              </div>
            </div>
          </div>
        )) : (
          <p className="text-sm text-ink/50 text-center py-8">لم تقم باستئجار أي منتجات بعد.</p>
        )}
      </div>
    </section>
  )

  const renderListings = () => {
    if (view === "form") return (
      <>
      <form id="listing-form" onSubmit={saveListing} className="space-y-6 rounded-3xl border border-line bg-white p-4 sm:p-6 shadow-sm">
        <div className="flex items-center gap-3 border-b border-line pb-6">
          <button type="button" onClick={() => setView("list")} className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-line text-ink/70 hover:bg-brand-soft"><ChevronRight size={20} /></button>
          <h2 className="min-w-0 text-xl font-bold text-ink">{editing ? "تعديل الإعلان" : "إضافة منتج جديد"}</h2>
        </div>
        <div className="grid gap-6 lg:grid-cols-[.75fr_1.25fr]">
          <section className="space-y-5">
            <div>
              <Label>صورة رئيسية وصور إضافية</Label>
              <div className="grid grid-cols-2 gap-2 sm:gap-3">
                {[...form.photos, form.image].filter((v, i, a) => v && a.indexOf(v) === i).map((photo, index) => (
                  <div key={`${photo}-${index}`} className="group relative aspect-square rounded-2xl overflow-hidden bg-brand-soft">
                    <img src={photo} alt="" className="w-full h-full object-cover" />
                    {form.photos.includes(photo) && (
                      <button type="button" onClick={() => setForm(c => ({...c, photos: c.photos.filter(p => p !== photo)}))} className="absolute end-2 top-2 grid h-7 w-7 place-items-center rounded-full bg-white/90 text-rose opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity shadow-sm"><X size={15} /></button>
                    )}
                  </div>
                ))}
              </div>
              <div className="mt-3">
                <input type="file" accept="image/*" onChange={async (e) => {
                  const file = e.target.files?.[0]
                  if (!file) return
                  try {
                    const { uploadImage } = await import("../lib/uploadImage")
                    const url = await uploadImage(file)
                    setForm(c => ({...c, photos: [...c.photos, url]}))
                  } catch {
                    notify("فشل رفع الصورة")
                  }
                }} className="block w-full min-w-0 text-sm text-ink/60 file:ml-4 file:mr-0 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-bold file:bg-brand-soft file:text-brand hover:file:bg-brand hover:file:text-cream cursor-pointer" />
              </div>
            </div>
          </section>
          <section className="space-y-5">
            <Label>عنوان المنتج</Label>
            <input required value={form.name} onChange={(e) => setForm(c => ({...c, name: e.target.value}))} placeholder="عنوان واضح للمنتج" className="field" />
            
            <Label>الإصدار / النسخة (اختياري)</Label>
            <input value={form.version} onChange={(e) => setForm(c => ({...c, version: e.target.value}))} placeholder="مثال: الجيل الثالث، إصدار 2024" className="field" />
            
            <Label>الوصف</Label>
            <textarea required value={form.description} onChange={(e) => setForm(c => ({...c, description: e.target.value}))} placeholder="وصف تفصيلي للمنتج..." rows={3} className="field resize-y" />

            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <Label>السعر / يوم</Label>
                <input required type="number" value={form.price} onChange={(e) => setForm(c => ({...c, price: e.target.value}))} className="field" />
              </div>
              <div>
                <Label>السعر / أسبوع (اختياري)</Label>
                <input type="number" value={form.weeklyPrice} onChange={(e) => setForm(c => ({...c, weeklyPrice: e.target.value}))} className="field" />
              </div>
              <div>
                <Label>السعر / شهر (اختياري)</Label>
                <input type="number" value={form.monthlyPrice} onChange={(e) => setForm(c => ({...c, monthlyPrice: e.target.value}))} className="field" />
              </div>
            </div>
            
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label>التأمين (اختياري)</Label>
                <input type="number" value={form.insurance} onChange={(e) => setForm(c => ({...c, insurance: e.target.value}))} placeholder="رسوم تأمين مستردة" className="field" />
              </div>
            </div>
          </section>
        </div>
        <div className="grid gap-5 lg:grid-cols-2">
          <DynamicChips
            title="مميزات المنتج"
            description="مزايا وخصائص (اختياري)"
            items={form.features ?? []}
            value={featureDraft}
            onChange={setFeatureDraft}
            onAdd={() => addString("features", featureDraft, () => setFeatureDraft(""))}
            onRemove={(i) => setForm(c => ({...c, features: c.features.filter((_, idx) => idx !== i)}))}
            placeholder="ميزة جديدة..."
          />
          <DynamicChips
            title="ما الذي يأتي مع المنتج؟"
            description="ملحقات مشمولة (اختياري)"
            items={form.included ?? []}
            value={includedDraft}
            onChange={setIncludedDraft}
            onAdd={() => addString("included", includedDraft, () => setIncludedDraft(""))}
            onRemove={(i) => setForm(c => ({...c, included: c.included.filter((_, idx) => idx !== i)}))}
            placeholder="مثال: حقيبة، شاحن..."
          />
        </div>
        <div className="hidden gap-3 pt-6 lg:flex lg:justify-end">
          <button type="button" onClick={() => setView("list")} className="rounded-full border border-line px-5 py-2.5 text-sm font-bold hover:bg-cream transition-colors">إلغاء</button>
          <button type="button" onClick={(e) => saveListing(e, true)} className="rounded-full border border-brand text-brand px-5 py-2.5 text-sm font-bold hover:bg-brand-soft transition-colors">حفظ كمسودة</button>
          <button type="submit" className="rounded-full bg-brand text-cream px-5 py-2.5 text-sm font-bold hover:bg-[#064b32] transition-colors">{editing ? "حفظ التعديلات" : "نشر"}</button>
        </div>
      </form>
      <div className="fixed inset-x-0 bottom-[calc(env(safe-area-inset-bottom)+4.75rem)] z-30 border-t border-line bg-white/95 px-4 pt-3 pb-safe backdrop-blur lg:hidden">
        <div className="mx-auto grid max-w-7xl grid-cols-3 gap-2">
          <button type="button" onClick={() => setView("list")} className="h-12 rounded-xl border border-line text-sm font-bold text-ink/70">إلغاء</button>
          <button type="button" onClick={(e) => saveListing(e, true)} className="h-12 rounded-xl border border-brand text-sm font-bold text-brand">مسودة</button>
          <button type="submit" form="listing-form" className="h-12 rounded-xl bg-brand text-sm font-bold text-cream">{editing ? "حفظ" : "نشر"}</button>
        </div>
      </div>
      </>
    )

    return (
      <div className="rounded-3xl border border-line bg-white shadow-sm p-4 sm:p-6">
        <div className="flex flex-wrap gap-2 sm:gap-3 justify-between items-center border-b border-line pb-6">
          <h2 className="text-xl font-bold text-ink min-w-0 truncate">منتجاتي المعروضة</h2>
          <button onClick={openNewListing} className="shrink-0 whitespace-nowrap rounded-full bg-brand text-cream px-4 py-2 text-sm font-bold flex items-center gap-2 hover:bg-[#064b32] transition-colors"><Plus size={18}/> إضافة منتج</button>
        </div>
        <div className="mt-6 grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {filteredListings.map(listing => (
            <article key={listing.id} className="flex min-w-0 flex-col gap-3 overflow-hidden rounded-2xl border border-line p-3 sm:p-4">
              <div className="relative aspect-[4/3] shrink-0 overflow-hidden rounded-xl bg-brand-soft">
                <img src={listing.image} alt={listing.name} className="absolute inset-0 h-full w-full object-cover" />
                <span className={`absolute end-2 top-2 rounded-full px-2 py-0.5 text-[10px] font-bold text-cream ${listing.status === "نشط" ? "bg-green" : listing.status === "موقوف مؤقتًا" ? "bg-amber" : listing.status === "مسودة" ? "bg-brand" : "bg-ink/55"}`}>{listing.status}</span>
              </div>
              <div className="min-w-0">
                <h3 className="leading-tight line-clamp-2 min-h-[2.75rem] break-words font-bold text-ink">{listing.name || "بدون عنوان"}</h3>
                <p className="mt-1 text-sm font-bold text-amber">{listing.price} ج.م / يوم</p>
              </div>
              <button onClick={() => openEdit(listing)} className="mt-auto rounded-xl bg-cream py-2.5 text-sm font-bold text-brand">تعديل</button>
            </article>
          ))}
        </div>
      </div>
    )
  }

  const renderRequests = () => (
    <section className="rounded-3xl border border-line bg-white shadow-sm p-4 sm:p-6">
      <h2 className="text-xl font-bold text-ink">طلبات الإيجار (Orders)</h2>
      <div className="divide-y divide-line mt-4">
        {requests.map((request) => (
          <div key={request.id} className="py-4 sm:py-5 flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            <span className="w-10 h-10 shrink-0 rounded-full bg-brand-soft text-brand grid place-items-center font-bold">{request.avatar}</span>
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-ink truncate">{request.renter}</h3>
              <p className="text-sm text-ink/60 truncate break-words">{request.product} • {request.dates}</p>
              <p className="text-sm font-bold text-brand truncate">السعر المقترح: {request.total}</p>
            </div>
            {request.status === 'جديد' ? (
              <div className="flex w-full sm:w-auto shrink-0 gap-2 self-stretch sm:self-auto">
                <button onClick={() => {
                  setRequests(items => items.map(item => item.id === request.id ? { ...item, status: "مؤكد" } : item))
                  notify("تم تأكيد الطلب.")
                }} className="flex-1 sm:flex-none bg-brand text-cream px-3 py-1.5 rounded-full text-xs font-bold">قبول</button>
                <button onClick={() => {
                  setRequests(items => items.map(item => item.id === request.id ? { ...item, status: "مرفوض" } : item))
                  notify("تم رفض الطلب.")
                }} className="flex-1 sm:flex-none border border-line text-ink/65 hover:text-rose px-3 py-1.5 rounded-full text-xs font-bold">رفض</button>
              </div>
            ) : (
              <span className={`shrink-0 self-start sm:self-auto text-xs font-bold px-3 py-1.5 rounded-full whitespace-nowrap ${statusStyles[request.status]}`}>{request.status}</span>
            )}
          </div>
        ))}
      </div>
    </section>
  )

  const renderInbox = () => (
    <div className="grid overflow-hidden rounded-3xl border border-line bg-white shadow-sm md:grid-cols-[17rem_1fr] h-[min(70dvh,560px)] min-h-[440px] max-h-[80dvh] sm:h-[560px]">
      <aside className={`${selectedId ? "hidden md:block" : "block"} border-b md:border-b-0 md:border-l border-line p-3 sm:p-4 overflow-y-auto min-h-0 ${selectedId ? "max-h-none" : "max-h-[42%] md:max-h-none"}`}>
        <h2 className="font-bold text-ink mb-3 sm:mb-4 text-sm sm:text-base">الرسائل</h2>
        {conversations.length ? conversations.map((conv) => (
          <button key={conv.id} onClick={() => setSelectedId(conv.id)} className={`w-full text-right p-3 rounded-2xl flex items-center gap-3 overflow-hidden ${selectedId === conv.id ? "bg-cream" : "hover:bg-cream/50"}`}>
            <span className="w-10 h-10 shrink-0 rounded-full bg-brand text-cream grid place-items-center font-bold text-sm">{conv.ownerInitial || conv.ownerName?.[0] || "?"}</span>
            <div className="min-w-0 flex-1 text-right">
              <strong className="block text-sm text-ink truncate">{conv.ownerName}</strong>
              <p className="text-xs text-ink/60 truncate">{conv.listingName}</p>
            </div>
          </button>
        )) : (
          <p className="text-sm text-ink/50 text-center py-6">لا توجد محادثات بعد</p>
        )}
      </aside>
      <section className={`${selectedId ? "fixed inset-0 z-50 flex flex-col bg-cream md:static md:z-auto" : "hidden md:flex flex-col"} min-h-0`}>
        {selectedId ? (
          <>
            <div className="flex items-center gap-3 p-3 pt-[max(0.75rem,env(safe-area-inset-top))] sm:p-4 border-b border-line shrink-0">
              <button type="button" onClick={() => setSelectedId(null)} className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-line bg-white text-ink/70 hover:bg-brand-soft md:hidden" aria-label="رجوع للمحادثات">
                <ChevronRight size={18} />
              </button>
              <h2 className="font-bold text-sm sm:text-base truncate min-w-0">{conversations.find(c => c.id === selectedId)?.ownerName ?? "محادثة"}</h2>
            </div>
            <div className="flex-1 min-h-0 p-3 sm:p-4 space-y-3 overflow-y-auto flex flex-col">
              {messages.map(m => (
                <p key={m.id} className={`p-3 rounded-2xl max-w-[78%] sm:max-w-[360px] break-words whitespace-pre-wrap text-sm ${m.sender === "me" || m.senderId === user?.id ? "bg-brand text-cream rounded-tl-sm mr-auto" : "bg-cream rounded-tr-sm text-ink"}`}>
                  {m.body}
                </p>
              ))}
              {!messages.length && <p className="text-xs text-ink/40 text-center py-4">ابدأ المحادثة الآن</p>}
            </div>
            <div className="p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:p-4 border-t border-line flex gap-2 shrink-0">
              <input value={message} onChange={e => setMessage(e.target.value)} onKeyDown={async (e) => { if (e.key === "Enter" && message.trim()) { const { sendMessage, getMessages } = await import("../services/messages"); await sendMessage(selectedId, message.trim()); setMessage(""); getMessages(selectedId).then(setMessages); } }} className="flex-1 min-w-0 bg-cream rounded-xl px-4 py-3 text-sm outline-none h-11" placeholder="اكتب رسالة..." />
              <button type="button" onClick={async () => { if (message.trim()) { const { sendMessage, getMessages } = await import("../services/messages"); await sendMessage(selectedId, message.trim()); setMessage(""); getMessages(selectedId).then(setMessages); } }} className="w-11 h-11 shrink-0 bg-brand text-cream rounded-xl grid place-items-center hover:bg-[#064b32] transition-colors"><Send size={18}/></button>
            </div>
          </>
        ) : (
          <div className="flex-1 grid place-items-center text-ink/50 p-6 text-sm text-center">اختر محادثة لعرضها</div>
        )}
      </section>
    </div>
  )

  const renderProfile = () => (
    <section className="rounded-3xl border border-line bg-white shadow-sm p-4 sm:p-6">
      <h2 className="text-xl font-bold text-ink">تعديل الملف الشخصي</h2>
      <form onSubmit={saveProfile} className="mt-6 space-y-5 max-w-md">
        <div className="flex flex-wrap items-center gap-4">
          <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-full bg-brand">
            {avatarUrl ? (
              <img src={avatarUrl} alt="صورتك الشخصية" className="h-full w-full object-cover" />
            ) : (
              <span className="grid h-full w-full place-items-center text-2xl font-black text-cream">{profileName[0] || "?"}</span>
            )}
            <button
              type="button"
              onClick={() => avatarInputRef.current?.click()}
              aria-label="رفع صورة شخصية"
              disabled={avatarUploading}
              className="absolute -bottom-1 -end-1 grid h-8 w-8 place-items-center rounded-full bg-amber text-brand shadow-md transition disabled:opacity-60"
            >
              <Camera size={15} />
            </button>
          </div>
          <div className="min-w-0">
            <button type="button" onClick={() => avatarInputRef.current?.click()} disabled={avatarUploading} className="shrink-0 text-sm font-bold text-brand hover:underline flex items-center gap-2 disabled:opacity-60"><Camera size={16}/> {avatarUploading ? "جاري الرفع..." : "رفع صورة جديدة"}</button>
            <p className="mt-1 text-xs text-ink/50">PNG أو JPG — تُحفظ وتظهر فورًا في رأس الصفحة.</p>
          </div>
          <input ref={avatarInputRef} type="file" accept="image/png,image/jpeg" className="hidden" onChange={(e) => { handleAvatarChange(e.target.files?.[0]); e.target.value = "" }} />
        </div>
        <div>
          <Label>الاسم الكامل</Label>
          <input value={profileName} onChange={e => setProfileName(e.target.value)} className="field" />
        </div>
        <div>
          <Label>المدينة</Label>
          <input value={profileCity} onChange={e => setProfileCity(e.target.value)} className="field" />
        </div>
        <div>
          <Label>نبذة عنك (Bio)</Label>
          <textarea value={profileBio} onChange={e => setProfileBio(e.target.value)} rows={3} className="field resize-y" />
        </div>
        <button type="submit" className="w-full lg:w-auto bg-brand text-cream px-6 py-3.5 lg:py-2.5 rounded-full font-bold text-sm">حفظ التغييرات</button>
      </form>
      <button type="button" onClick={() => setActiveTab("reviews")} className="mt-5 flex lg:hidden w-full items-center justify-center gap-2 rounded-xl border border-line py-3 text-sm font-bold text-brand">
        <Star size={16} /> التقييمات والمراجعات
      </button>
    </section>
  )

  const renderReviews = () => (
    <section className="rounded-3xl border border-line bg-white shadow-sm p-4 sm:p-6">
      <h2 className="text-xl font-bold text-ink">التقييمات والمراجعات</h2>
      <button type="button" onClick={() => setActiveTab("profile")} className="mt-4 flex lg:hidden items-center gap-2 rounded-full border border-line px-4 py-2.5 text-sm font-bold text-ink/70">
        <ChevronRight size={18} /> العودة للحساب
      </button>
      <div className="mt-4 space-y-4">
        {[
          ["ندى محمود", "تجربة رائعة، الكاميرا نظيفة والمالك متعاون جدًا.", "٥٫٠"],
          ["أحمد سمير", "استلام سهل ومنتج ممتاز.", "٤٫٨"],
        ].map(([name, review, rating]) => (
          <div key={name} className="p-4 sm:p-5 border border-line rounded-2xl">
            <div className="flex items-center gap-3">
              <span className="w-8 h-8 shrink-0 rounded-full bg-brand-soft text-brand font-bold grid place-items-center">{name[0]}</span>
              <div className="min-w-0">
                <h3 className="font-bold">{name}</h3>
                <span className="text-xs text-amber font-bold flex items-center gap-1 shrink-0"><Star size={12} fill="currentColor" className="shrink-0"/> {rating}</span>
              </div>
            </div>
            <p className="mt-3 text-sm text-ink/70">{review}</p>
          </div>
        ))}
      </div>
    </section>
  )

  const content = {
    rented: renderRented,
    listings: renderListings,
    requests: renderRequests,
    inbox: renderInbox,
    reviews: renderReviews,
    profile: renderProfile,
  }[activeTab]

  const navigation = [
    ["rented", "المنتجات المستأجرة", ShoppingBag],
    ["listings", "منتجاتي المعروضة", Package],
    ["requests", "طلبات الإيجار", Bell],
    ["inbox", "الرسائل", Inbox],
    ["reviews", "التقييمات", Star],
    ["profile", "تعديل الحساب", User],
  ] as const

  const mobileTabs = [
    ["rented", "المستأجرة", ShoppingBag],
    ["listings", "إعلاناتي", Package],
    ["requests", "الطلبات", Bell],
    ["inbox", "الرسائل", Inbox],
    ["account", "الحساب", User],
  ] as const

  return (
    <div dir="rtl" lang="ar" className="min-h-screen bg-cream">
      <Header />
      <main className={`mx-auto max-w-7xl px-3 pt-8 sm:px-5 sm:pt-12 ${formOpen ? "pb-[calc(env(safe-area-inset-bottom)+10rem)]" : "pb-28 lg:pb-16"}`}>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="min-w-0">
            <h1 className="mt-2 text-3xl font-black text-brand sm:text-4xl break-words">لوحة التحكم</h1>
            <p className="mt-2 text-sm text-ink/60">إدارة منتجاتك المستأجرة والمعروضة وحسابك في مكان واحد.</p>
          </div>
        </div>
        {notice && <div role="status" className="fixed bottom-[calc(env(safe-area-inset-bottom)+5rem)] inset-x-4 sm:inset-x-auto sm:left-6 sm:right-auto lg:bottom-6 z-50 max-w-[calc(100vw-2rem)] sm:max-w-sm break-words rounded-2xl bg-ink px-4 py-3 text-sm font-bold text-cream shadow-xl">{notice}</div>}
        <div className="mt-8 grid items-start gap-5 sm:gap-7 lg:grid-cols-[14rem_minmax(0,1fr)]">
          <aside className="hidden lg:sticky lg:top-[9.5rem] lg:block">
            <nav className="flex gap-1 overflow-x-auto scrollbar-none snap-x snap-mandatory rounded-3xl border border-line bg-white p-2 shadow-sm lg:flex-col lg:overflow-visible lg:snap-none">
              {navigation.map(([id, label, Icon]) => (
                <button
                  key={id}
                  onClick={() => { setActiveTab(id); setView("list"); }}
                  className={`flex shrink-0 snap-start items-center gap-3 rounded-2xl px-4 py-3 text-right text-sm transition whitespace-nowrap lg:whitespace-normal ${
                    activeTab === id ? "bg-brand font-bold text-cream shadow-sm" : "font-medium text-ink/65 hover:bg-brand-soft hover:text-brand"
                  }`}
                >
                  <Icon size={17} className="shrink-0" /> <span className="truncate min-w-0 flex-1">{label}</span>
                  {id === "requests" && pendingCount > 0 && <span className={`mr-auto shrink-0 grid h-5 min-w-5 place-items-center rounded-full px-1 text-[10px] ${activeTab === id ? "bg-cream text-brand" : "bg-rose text-white"}`}>{pendingCount}</span>}
                </button>
              ))}
            </nav>
          </aside>
          <section className="min-w-0">{content && content()}</section>
        </div>
      </main>
      <Footer />
      <nav aria-label="أقسام لوحة التحكم" className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-white/95 pb-safe backdrop-blur lg:hidden">
        <div className="mx-auto grid max-w-7xl grid-cols-5 gap-1 px-2">
          {mobileTabs.map(([id, label, Icon]) => {
            const active = id === "account" ? activeTab === "profile" || activeTab === "reviews" : activeTab === id
            const showCount = id === "requests" && pendingCount > 0
            return (
              <button
                key={id}
                onClick={() => setActiveTab(id === "account" ? "profile" : id)}
                aria-current={active ? "page" : undefined}
                className={`relative flex min-h-[3.5rem] flex-col items-center justify-center gap-0.5 rounded-xl text-[11px] font-semibold transition-colors ${active ? "text-brand" : "text-ink/45 hover:text-brand"}`}
              >
                <span className="relative">
                  <Icon size={20} strokeWidth={active ? 2.4 : 1.8} />
                  {showCount && <span className="absolute -top-1 -end-1 grid h-4 min-w-4 place-items-center rounded-full bg-rose px-1 text-[9px] font-bold text-white">{pendingCount}</span>}
                </span>
                <span className="truncate">{label}</span>
              </button>
            )
          })}
        </div>
      </nav>
    </div>
  )
}

function Label({ children }: { children: React.ReactNode }) {
  return <label className="mb-1.5 block text-sm font-bold text-ink">{children}</label>
}

function DynamicChips({ title, description, items, value, onChange, onAdd, onRemove, placeholder }: any) {
  return (
    <section className="rounded-3xl border border-line bg-white p-4 sm:p-5">
      <h3 className="font-bold text-ink">{title}</h3>
      <p className="mt-1 text-xs leading-5 text-ink/55">{description}</p>
      <div className="mt-4 flex gap-2">
        <input value={value} onChange={e => onChange(e.target.value)} onKeyDown={e => { if(e.key==='Enter'){e.preventDefault(); onAdd();} }} placeholder={placeholder} className="field min-w-0 flex-1" />
        <button type="button" onClick={onAdd} className="shrink-0 px-3 rounded-xl border border-brand text-brand hover:bg-brand hover:text-cream text-xs sm:text-sm font-bold"><Plus size={15}/> إضافة</button>
      </div>
      {items.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {items.map((item: string, i: number) => (
            <span key={i} className="inline-flex gap-1 items-center bg-brand-soft text-brand px-2 py-1.5 rounded-full text-xs font-medium">
              {item} <button type="button" onClick={() => onRemove(i)} className="hover:text-rose"><X size={12}/></button>
            </span>
          ))}
        </div>
      )}
    </section>
  )
}
