const fs = require('fs');

const dashboardCode = `import { useEffect, useMemo, useState } from "react"
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

const image = (id: string) => \`https://images.unsplash.com/photo-\${id}?w=960&h=720&fit=crop&auto=format\`

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
  id: \`new-\${Date.now()}\`,
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
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState<"rented" | "listings" | "requests" | "inbox" | "reviews" | "profile">("rented")

  const [listings, setListings] = useState<DashboardListing[]>([])
  const [requests, setRequests] = useState<RentalRequest[]>([])
  const [rented, setRented] = useState<any[]>([])

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
              dates: \`\${b.start} – \${b.end}\`,
              total: \`\${b.total.toLocaleString("ar-EG")} ج.م\`,
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
  }, [])

  const [view, setView] = useState<"list" | "form">("list")
  const [editing, setEditing] = useState<DashboardListing | null>(null)
  const [form, setForm] = useState<DashboardListing>(emptyListing())
  const [featureDraft, setFeatureDraft] = useState("")
  const [includedDraft, setIncludedDraft] = useState("")
  const [photoDraft, setPhotoDraft] = useState("")
  const [listingSearch, setListingSearch] = useState("")
  const [message, setMessage] = useState("")
  const [sentMessages, setSentMessages] = useState<string[]>([])
  const [notice, setNotice] = useState("")

  const [profileName, setProfileName] = useState(user?.fullName ?? "ضيف سيركل")
  const [profileBio, setProfileBio] = useState(user?.bio ?? "")
  const [profileCity, setProfileCity] = useState(user?.city ?? "")

  const notify = (text: string) => {
    setNotice(text)
    window.setTimeout(() => setNotice(""), 2600)
  }

  const openNewListing = () => {
    setEditing(null)
    setForm(emptyListing())
    setFeatureDraft("")
    setIncludedDraft("")
    setPhotoDraft("")
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
    setPhotoDraft("")
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
      await updateProfile({ fullName: profileName, city: profileCity, bio: profileBio })
      notify("تم تحديث الملف الشخصي بنجاح.")
    } catch {
      notify("فشل تحديث الملف الشخصي.")
    }
  }

  const updateListingStatus = async (id: string, status: ListingStatus) => {
    try {
      const { updateListing } = await import("../services/listings")
      await updateListing(id, { status })
    } catch {}
    setListings((current) => current.map((item) => (item.id === id ? { ...item, status } : item)))
    notify(status === "نشط" ? "الإعلان متاح الآن للمستأجرين." : \`تم تحديث حالة الإعلان إلى \${status}.\`)
  }

  const addString = (kind: "features" | "included", value: string, clear: () => void) => {
    const clean = value.trim()
    if (!clean) return
    setForm((current) => ({ ...current, [kind]: [...(current[kind] ?? []), clean] }))
    clear()
  }

  const filteredListings = useMemo(() => listings.filter((item) => item.name.includes(listingSearch.trim()) || item.category.includes(listingSearch.trim())), [listings, listingSearch])
  const pendingCount = requests.filter((r) => r.status === "جديد").length

  const renderRented = () => (
    <section className="rounded-3xl border border-line bg-white shadow-sm p-6">
      <h2 className="text-xl font-bold text-ink">المنتجات المستأجرة</h2>
      <p className="mt-1 text-sm text-ink/60">منتجاتك الحالية والسابقة التي استأجرتها.</p>
      <div className="mt-6 space-y-4">
        {rented.length ? rented.map(booking => (
          <div key={booking.id} className="flex gap-4 p-4 border border-line rounded-2xl items-center">
            <img src={booking.listingImage} alt={booking.listingName} className="w-20 h-20 rounded-xl object-cover" />
            <div className="flex-1">
              <h3 className="font-bold text-ink">{booking.listingName}</h3>
              <p className="text-sm text-ink/60">من المالك: {booking.ownerName}</p>
              <p className="mt-2 text-xs font-semibold text-amber flex items-center gap-1"><CalendarDays size={14}/> تنتهي في: {booking.end}</p>
            </div>
            <span className={\`rounded-full px-2.5 py-1 text-xs font-bold \${booking.status === 'active' ? 'bg-green/10 text-green' : 'bg-brand-soft text-brand'}\`}>
              {booking.status === 'active' ? 'تأجير جارٍ' : 'مكتمل'}
            </span>
          </div>
        )) : (
          <p className="text-sm text-ink/50 text-center py-8">لم تقم باستئجار أي منتجات بعد.</p>
        )}
      </div>
    </section>
  )

  const renderListings = () => {
    if (view === "form") return (
      <form onSubmit={saveListing} className="space-y-6 rounded-3xl border border-line bg-white p-6 shadow-sm">
        <div className="flex items-center gap-3 border-b border-line pb-6">
          <button type="button" onClick={() => setView("list")} className="grid h-10 w-10 place-items-center rounded-full border border-line text-ink/70 hover:bg-brand-soft"><ChevronRight size={20} /></button>
          <h2 className="text-xl font-bold text-ink">{editing ? "تعديل الإعلان" : "إضافة منتج جديد"}</h2>
        </div>
        <div className="grid gap-6 xl:grid-cols-[.75fr_1.25fr]">
          <section className="space-y-5">
            <div>
              <Label>صورة رئيسية وصور إضافية</Label>
              <div className="grid grid-cols-2 gap-2">
                {[...form.photos, form.image].filter((v, i, a) => v && a.indexOf(v) === i).map((photo, index) => (
                  <div key={\`\${photo}-\${index}\`} className="group relative aspect-square rounded-2xl overflow-hidden bg-brand-soft">
                    <img src={photo} className="w-full h-full object-cover" />
                    {form.photos.includes(photo) && (
                      <button type="button" onClick={() => setForm(c => ({...c, photos: c.photos.filter(p => p !== photo)}))} className="absolute left-2 top-2 grid h-7 w-7 rounded-full bg-white/90 text-rose opacity-0 group-hover:opacity-100"><X size={15} /></button>
                    )}
                  </div>
                ))}
              </div>
              <div className="mt-3 flex gap-2">
                <input value={photoDraft} onChange={(e) => setPhotoDraft(e.target.value)} placeholder="رابط صورة المنتج" className="field min-w-0 flex-1" />
                <button type="button" onClick={() => { if(photoDraft.trim()) { setForm(c => ({...c, photos: [...c.photos, photoDraft.trim()]})); setPhotoDraft(""); } }} className="rounded-xl border border-brand px-3 text-brand hover:bg-brand hover:text-cream"><Camera size={17} /></button>
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
        <div className="flex justify-end gap-3 pt-6">
          <button type="button" onClick={() => setView("list")} className="rounded-full border border-line px-5 py-2.5 text-sm font-bold">إلغاء</button>
          <button type="button" onClick={(e) => saveListing(e, true)} className="rounded-full border border-brand text-brand px-5 py-2.5 text-sm font-bold">حفظ كمسودة</button>
          <button type="submit" className="rounded-full bg-brand text-cream px-5 py-2.5 text-sm font-bold">{editing ? "حفظ التعديلات" : "نشر"}</button>
        </div>
      </form>
    )

    return (
      <div className="rounded-3xl border border-line bg-white shadow-sm p-6">
        <div className="flex justify-between items-center border-b border-line pb-6">
          <h2 className="text-xl font-bold text-ink">منتجاتي المعروضة</h2>
          <button onClick={openNewListing} className="rounded-full bg-brand text-cream px-4 py-2 text-sm font-bold flex gap-2"><Plus size={18}/> إضافة منتج</button>
        </div>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredListings.map(listing => (
            <article key={listing.id} className="border border-line rounded-2xl p-4 flex flex-col gap-3">
              <img src={listing.image} className="w-full h-32 object-cover rounded-xl bg-brand-soft" />
              <div>
                <h3 className="font-bold text-ink">{listing.name}</h3>
                <p className="text-sm text-amber font-bold">{listing.price} ج.م / يوم</p>
                <span className={\`text-[10px] mt-2 inline-block px-2 py-1 rounded-full font-bold \${statusStyles[listing.status]}\`}>{listing.status}</span>
              </div>
              <button onClick={() => openEdit(listing)} className="mt-auto bg-cream text-brand text-sm font-bold py-2 rounded-xl">تعديل</button>
            </article>
          ))}
        </div>
      </div>
    )
  }

  const renderRequests = () => (
    <section className="rounded-3xl border border-line bg-white shadow-sm p-6">
      <h2 className="text-xl font-bold text-ink">طلبات الإيجار (Orders)</h2>
      <div className="divide-y divide-line mt-4">
        {requests.map((request) => (
          <div key={request.id} className="py-4 flex flex-col sm:flex-row gap-4 items-center">
            <span className="w-10 h-10 rounded-full bg-brand-soft text-brand grid place-items-center font-bold">{request.avatar}</span>
            <div className="flex-1">
              <h3 className="font-bold text-ink">{request.renter}</h3>
              <p className="text-sm text-ink/60">{request.product} • {request.dates}</p>
              <p className="text-sm font-bold text-amber">السعر المقترح: {request.total}</p>
            </div>
            {request.status === 'جديد' ? (
              <div className="flex gap-2">
                <button onClick={() => {
                  setRequests(items => items.map(item => item.id === request.id ? { ...item, status: "مؤكد" } : item))
                  notify("تم تأكيد الطلب.")
                }} className="bg-brand text-cream px-3 py-1.5 rounded-full text-xs font-bold">قبول</button>
                <button onClick={() => {
                  setRequests(items => items.map(item => item.id === request.id ? { ...item, status: "مرفوض" } : item))
                  notify("تم رفض الطلب.")
                }} className="border border-line text-ink/65 hover:text-rose px-3 py-1.5 rounded-full text-xs font-bold">رفض</button>
              </div>
            ) : (
              <span className={\`text-xs font-bold px-3 py-1.5 rounded-full \${statusStyles[request.status]}\`}>{request.status}</span>
            )}
          </div>
        ))}
      </div>
    </section>
  )

  const renderInbox = () => (
    <div className="grid overflow-hidden rounded-3xl border border-line bg-white shadow-sm md:grid-cols-[17rem_1fr] h-[500px]">
      <aside className="border-l border-line p-4 overflow-y-auto">
        <h2 className="font-bold text-ink mb-4">الرسائل</h2>
        {["سارة أحمد", "عمر خالد", "ندى محمود"].map((name, i) => (
          <button key={name} className={\`w-full text-right p-3 rounded-2xl \${i===0 ? 'bg-cream' : 'hover:bg-cream/50'}\`}>
            <strong className="block text-sm">{name}</strong>
          </button>
        ))}
      </aside>
      <section className="flex flex-col">
        <div className="p-4 border-b border-line"><h2 className="font-bold">سارة أحمد</h2></div>
        <div className="flex-1 p-4 space-y-3 overflow-y-auto">
          <p className="bg-cream p-3 rounded-2xl rounded-tr-sm w-max max-w-sm text-sm">مرحبًا، هل الكاميرا متاحة للاستلام مساءً؟</p>
          <p className="bg-brand text-cream p-3 rounded-2xl rounded-tl-sm w-max max-w-sm mr-auto text-sm">أهلًا سارة، نعم متاحة.</p>
          {sentMessages.map((m, i) => <p key={i} className="bg-brand text-cream p-3 rounded-2xl rounded-tl-sm w-max max-w-sm mr-auto text-sm">{m}</p>)}
        </div>
        <div className="p-4 border-t border-line flex gap-2">
          <input value={message} onChange={e => setMessage(e.target.value)} onKeyDown={e => { if(e.key === 'Enter' && message.trim()) { setSentMessages(c => [...c, message.trim()]); setMessage(""); } }} className="flex-1 bg-cream rounded-xl px-4 text-sm outline-none" placeholder="اكتب رسالة..." />
          <button onClick={() => { if(message.trim()) { setSentMessages(c => [...c, message.trim()]); setMessage(""); } }} className="w-11 h-11 bg-brand text-cream rounded-xl grid place-items-center"><Send size={18}/></button>
        </div>
      </section>
    </div>
  )

  const renderProfile = () => (
    <section className="rounded-3xl border border-line bg-white shadow-sm p-6">
      <h2 className="text-xl font-bold text-ink">تعديل الملف الشخصي</h2>
      <form onSubmit={saveProfile} className="mt-6 space-y-5 max-w-md">
        <div className="flex items-center gap-4">
          <div className="w-20 h-20 bg-brand text-cream rounded-full grid place-items-center text-2xl font-black">{profileName[0]}</div>
          <button type="button" className="text-sm font-bold text-brand hover:underline flex items-center gap-2"><Camera size={16}/> رفع صورة جديدة</button>
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
        <button type="submit" className="bg-brand text-cream px-6 py-2.5 rounded-full font-bold text-sm">حفظ التغييرات</button>
      </form>
    </section>
  )

  const renderReviews = () => (
    <section className="rounded-3xl border border-line bg-white shadow-sm p-6">
      <h2 className="text-xl font-bold text-ink">التقييمات والمراجعات</h2>
      <div className="mt-4 space-y-4">
        {[
          ["ندى محمود", "تجربة رائعة، الكاميرا نظيفة والمالك متعاون جدًا.", "٥٫٠"],
          ["أحمد سمير", "استلام سهل ومنتج ممتاز.", "٤٫٨"],
        ].map(([name, review, rating]) => (
          <div key={name} className="p-4 border border-line rounded-2xl">
            <div className="flex items-center gap-3">
              <span className="w-8 h-8 rounded-full bg-brand-soft text-brand font-bold grid place-items-center">{name[0]}</span>
              <div>
                <h3 className="font-bold">{name}</h3>
                <span className="text-xs text-amber font-bold flex items-center gap-1"><Star size={12} fill="currentColor"/> {rating}</span>
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

  return (
    <div dir="rtl" lang="ar" className="min-h-screen bg-cream">
      <Header />
      <main className="mx-auto max-w-7xl px-5 py-8 sm:py-12">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="mt-2 text-3xl font-black text-brand sm:text-4xl">لوحة التحكم</h1>
            <p className="mt-2 text-sm text-ink/60">إدارة منتجاتك المستأجرة والمعروضة وحسابك في مكان واحد.</p>
          </div>
        </div>
        {notice && <div role="status" className="fixed bottom-6 left-6 z-50 rounded-2xl bg-ink px-4 py-3 text-sm font-bold text-cream shadow-xl">{notice}</div>}
        <div className="mt-8 grid items-start gap-7 lg:grid-cols-[14rem_minmax(0,1fr)]">
          <aside className="lg:sticky lg:top-28">
            <nav className="flex gap-1 overflow-x-auto rounded-3xl border border-line bg-white p-2 shadow-sm lg:flex-col">
              {navigation.map(([id, label, Icon]) => (
                <button
                  key={id}
                  onClick={() => { setActiveTab(id); setView("list"); }}
                  className={\`flex shrink-0 items-center gap-3 rounded-2xl px-4 py-3 text-right text-sm transition \${
                    activeTab === id ? "bg-brand font-bold text-cream shadow-sm" : "font-medium text-ink/65 hover:bg-brand-soft hover:text-brand"
                  }\`}
                >
                  <Icon size={17} /> <span>{label}</span>
                  {id === "requests" && pendingCount > 0 && <span className={\`mr-auto grid h-5 min-w-5 place-items-center rounded-full px-1 text-[10px] \${activeTab === id ? "bg-cream text-brand" : "bg-rose text-white"}\`}>{pendingCount}</span>}
                </button>
              ))}
            </nav>
          </aside>
          <section className="min-w-0">{content && content()}</section>
        </div>
      </main>
      <Footer />
    </div>
  )
}

function Label({ children }: { children: React.ReactNode }) {
  return <label className="mb-1.5 block text-sm font-bold text-ink">{children}</label>
}

function DynamicChips({ title, description, items, value, onChange, onAdd, onRemove, placeholder }: any) {
  return (
    <section className="rounded-3xl border border-line bg-white p-5">
      <h3 className="font-bold text-ink">{title}</h3>
      <p className="mt-1 text-xs leading-5 text-ink/55">{description}</p>
      <div className="mt-4 flex gap-2">
        <input value={value} onChange={e => onChange(e.target.value)} onKeyDown={e => { if(e.key==='Enter'){e.preventDefault(); onAdd();} }} placeholder={placeholder} className="field min-w-0 flex-1" />
        <button type="button" onClick={onAdd} className="px-3 rounded-xl border border-brand text-brand hover:bg-brand hover:text-cream text-sm font-bold"><Plus size={15}/> إضافة</button>
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
`;

fs.writeFileSync('src/pages/Dashboard.tsx', dashboardCode, 'utf8');
console.log('Done writing src/pages/Dashboard.tsx');
