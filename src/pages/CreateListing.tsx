import { useMemo, useState, type FormEvent } from "react"

import { Link, useNavigate } from "react-router"

import {
  ArrowLeft,
  CalendarDays,
  Camera,
  Check,
  CheckCircle2,
  ChevronRight,
  CircleDollarSign,
  FileImage,
  MapPin,
  PackageCheck,
  Plus,
  Truck,
  X,
} from "lucide-react"

import { Header } from "../App"

const categories = [
  { icon: "📷", name: "تصوير فوتوغرافي" },
  { icon: "🛠️", name: "عُدد وأدوات" },
  { icon: "🎮", name: "ألعاب وترفيه" },
  { icon: "🏕️", name: "رحلات وتخييم" },
  { icon: "🎉", name: "مناسبات وحفلات" },
  { icon: "🏠", name: "منزل وحديقة" },
]

const steps = ["الفئة", "التفاصيل", "الصور", "السعر", "الموقع", "المراجعة"]

const fallback =
  "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=900&h=720&fit=crop&auto=format"

export default function CreateListing() {
  const navigate = useNavigate()
  const [step, setStep] = useState(0)
  const [category, setCategory] = useState("")
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [condition, setCondition] = useState("ممتازة")
  const [brand, setBrand] = useState("")
  const [photos, setPhotos] = useState<string[]>([])
  const [daily, setDaily] = useState("")
  const [deposit, setDeposit] = useState("")
  const [minimum, setMinimum] = useState("يوم واحد")
  const [city, setCity] = useState("")
  const [neighborhood, setNeighborhood] = useState("")
  const [pickup, setPickup] = useState(true)
  const [delivery, setDelivery] = useState(false)
  const [deliveryFee, setDeliveryFee] = useState("")
  const [error, setError] = useState("")
  const [published, setPublished] = useState(false)

  const image = photos[0] ?? fallback

  const addPhoto = async (file: File | null) => {
    if (!file) return

    const { uploadImage } = await import("../lib/uploadImage")

    uploadImage(file)

      .then((url) => setPhotos((current) => [...current, url]))

      .catch(() =>
        setPhotos((current) => [...current, URL.createObjectURL(file)]),
      )
  }

  const canContinue =
    step === 0
      ? Boolean(category)
      : step === 1
        ? title.trim().length > 2 && description.trim().length > 8
        : step === 2
          ? true
          : step === 3
            ? Number(daily) > 0
            : step === 4
              ? Boolean(city) && (pickup || delivery)
              : true

  const next = () => {
    if (!canContinue) {
      setError("أكمل الحقول المطلوبة للمتابعة.")
      return
    }
    setError("")
    setStep((value) => Math.min(5, value + 1))
  }

  const publish = async () => {
    const payload = {
      id: `local-${Date.now()}`,
      name: title,
      category,
      price: daily,
      city,
      image,
      owner: "أنا",
      rating: "٠٫٠",
      verified: true,
      description,
      condition,
      included: brand ? [brand] : [],
      features: [],
      photos: photos.length ? photos : [image],
      status: "نشط" as const,
      weeklyPrice: String(Number(daily) * 6),
      monthlyPrice: String(Number(daily) * 24),
      deposit,
      deliveryFee,
      blockedDates: [],
    }

    try {
      const { createListing } = await import("../services/listings")

      await createListing(payload)
    } catch {
      /* proceed to success screen */
    }

    setPublished(true)
  }

  if (published)
    return (
      <PublishSuccess
        title={title}
        onDashboard={() => navigate("/dashboard")}
      />
    )

  return (
    <div dir="rtl" lang="ar" className="min-h-screen bg-cream">
      <Header />
      <main className="mx-auto max-w-6xl px-5 py-8 sm:py-10">
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-1.5 text-sm font-bold text-brand hover:underline"
        >
          <ChevronRight size={17} /> العودة إلى لوحة التحكم
        </Link>
        <div className="mt-6 grid gap-8 lg:grid-cols-[15rem_minmax(0,1fr)]">
          <aside className="rounded-[1.8rem] bg-brand p-6 text-cream">
            <p className="text-xs font-black tracking-[.14em] text-amber">
              إعلان جديد
            </p>
            <h1 className="editorial-display mt-3 text-4xl leading-tight">
              شارك ما لديك مع مجتمعك.
            </h1>
            <p className="mt-4 text-sm leading-7 text-cream/70">
              سنأخذك خلال التفاصيل خطوة بخطوة، ويمكنك مراجعة كل شيء قبل النشر.
            </p>
            <ol className="mt-9 space-y-3">
              {steps.map((label, index) => (
                <li
                  key={label}
                  className={`flex items-center gap-3 text-sm ${
                    index === step
                      ? "font-black text-cream"
                      : index < step
                        ? "text-cream/80"
                        : "text-cream/40"
                  }`}
                >
                  <span
                    className={`grid h-7 w-7 place-items-center rounded-full text-xs ${
                      index === step
                        ? "bg-amber text-brand"
                        : index < step
                          ? "bg-cream text-brand"
                          : "bg-white/10"
                    }`}
                  >
                    {index < step ? <Check size={14} /> : index + 1}
                  </span>
                  {label}
                </li>
              ))}
            </ol>
          </aside>
          <section className="min-w-0">
            <div className="flex items-center justify-between border-b border-line pb-5">
              <div>
                <p className="text-xs font-black tracking-[.12em] text-brand">
                  الخطوة {step + 1} من 6
                </p>
                <h2 className="mt-2 text-3xl font-black text-ink">
                  {
                    [
                      "اختر الفئة المناسبة",
                      "صف العنصر بوضوح",
                      "أضف صورًا جذابة",
                      "حدد سعرك",
                      "حدد طريقة التسليم",
                      "راجع إعلانك",
                    ][step]
                  }
                </h2>
              </div>
              <span className="text-sm font-bold text-ink/45">
                {Math.round(((step + 1) / 6) * 100)}٪
              </span>
            </div>
            <div className="mt-7 rounded-[1.7rem] border border-line bg-white p-6 sm:p-8">
              {step === 0 && (
                <CategoryStep category={category} onChange={setCategory} />
              )}
              {step === 1 && (
                <DetailsStep
                  title={title}
                  setTitle={setTitle}
                  description={description}
                  setDescription={setDescription}
                  condition={condition}
                  setCondition={setCondition}
                  brand={brand}
                  setBrand={setBrand}
                />
              )}
              {step === 2 && (
                <PhotosStep
                  photos={photos}
                  onAdd={addPhoto}
                  onRemove={(index) =>
                    setPhotos((current) =>
                      current.filter((_, position) => position !== index),
                    )
                  }
                />
              )}
              {step === 3 && (
                <PriceStep
                  daily={daily}
                  setDaily={setDaily}
                  deposit={deposit}
                  setDeposit={setDeposit}
                  minimum={minimum}
                  setMinimum={setMinimum}
                />
              )}
              {step === 4 && (
                <LocationStep
                  city={city}
                  setCity={setCity}
                  neighborhood={neighborhood}
                  setNeighborhood={setNeighborhood}
                  pickup={pickup}
                  setPickup={setPickup}
                  delivery={delivery}
                  setDelivery={setDelivery}
                  deliveryFee={deliveryFee}
                  setDeliveryFee={setDeliveryFee}
                />
              )}
              {step === 5 && (
                <ReviewStep
                  image={image}
                  title={title}
                  category={category}
                  description={description}
                  daily={daily}
                  deposit={deposit}
                  city={city}
                  pickup={pickup}
                  delivery={delivery}
                  deliveryFee={deliveryFee}
                />
              )}
              {error && (
                <p className="mt-6 rounded-xl bg-rose/10 px-4 py-3 text-sm font-bold text-rose">
                  {error}
                </p>
              )}
              <div className="mt-8 flex items-center justify-between border-t border-line pt-6">
                <button
                  onClick={() => {
                    setError("")
                    setStep((value) => Math.max(0, value - 1))
                  }}
                  disabled={step === 0}
                  className="inline-flex items-center gap-1.5 text-sm font-black text-brand disabled:opacity-30"
                >
                  <ChevronRight size={17} /> السابق
                </button>
                {step < 5 ? (
                  <button
                    onClick={next}
                    className="inline-flex items-center gap-2 rounded-xl bg-brand px-5 py-3 text-sm font-black text-cream hover:bg-[#064b32]"
                  >
                    التالي <ArrowLeft size={17} />
                  </button>
                ) : (
                  <button
                    onClick={publish}
                    className="inline-flex items-center gap-2 rounded-xl bg-brand px-5 py-3 text-sm font-black text-cream hover:bg-[#064b32]"
                  >
                    <PackageCheck size={17} /> نشر الإعلان
                  </button>
                )}
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  )
}

function CategoryStep({
  category,
  onChange,
}: {
  category: string
  onChange: (value: string) => void
}) {
  return (
    <>
      <p className="text-sm leading-7 text-ink/60">
        اختيار الفئة يساعد المستأجرين على العثور على إعلانك بسرعة.
      </p>
      <div className="mt-7 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {categories.map((item) => (
          <button
            onClick={() => onChange(item.name)}
            key={item.name}
            className={`flex items-center gap-3 rounded-2xl border p-4 text-right transition ${
              category === item.name
                ? "border-brand bg-brand text-cream"
                : "border-line bg-cream/45 text-ink hover:border-brand hover:bg-brand-soft"
            }`}
          >
            <span className="grid h-11 w-11 place-items-center rounded-xl bg-white text-2xl">
              {item.icon}
            </span>
            <span className="text-sm font-black">{item.name}</span>
            {category === item.name && (
              <Check size={17} className="mr-auto text-amber" />
            )}
          </button>
        ))}
      </div>
    </>
  )
}

function DetailsStep({
  title,
  setTitle,
  description,
  setDescription,
  condition,
  setCondition,
  brand,
  setBrand,
}: any) {
  return (
    <div className="space-y-5">
      <Field
        label="عنوان الإعلان"
        value={title}
        onChange={setTitle}
        placeholder="مثال: كاميرا سوني ألفا 7III"
      />
      <label className="block text-sm font-bold text-ink">
        وصف العنصر
        <textarea
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          placeholder="اذكر حالة العنصر والملحقات وأي معلومة مهمة للمستأجر."
          rows={5}
          className="mt-2 w-full resize-none rounded-xl border border-line px-4 py-3 text-sm font-normal outline-none focus:border-brand focus:ring-2 focus:ring-brand/10"
        />
      </label>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="text-sm font-bold text-ink">
          حالة العنصر
          <select
            value={condition}
            onChange={(event) => setCondition(event.target.value)}
            className="mt-2 w-full rounded-xl border border-line px-4 py-3 text-sm font-normal outline-none focus:border-brand"
          >
            <option>جديد</option>
            <option>ممتازة</option>
            <option>جيدة جدًا</option>
            <option>جيدة</option>
          </select>
        </label>
        <Field
          label="العلامة أو الموديل"
          value={brand}
          onChange={setBrand}
          placeholder="اختياري"
        />
      </div>
    </div>
  )
}

function PhotosStep({
  photos,
  onAdd,
  onRemove,
}: {
  photos: string[]
  onAdd: (file: File | null) => void
  onRemove: (index: number) => void
}) {
  return (
    <div>
      <p className="text-sm leading-7 text-ink/60">
        الصور الواضحة تساعد المستأجر على اتخاذ القرار بثقة. أول صورة ستكون
        الغلاف.
      </p>
      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
        {photos.map((image, index) => (
          <div
            key={image}
            className="group relative aspect-square overflow-hidden rounded-2xl bg-brand-soft"
          >
            <img
              src={image}
              alt={`صورة الإعلان ${index + 1}`}
              className="h-full w-full object-cover"
            />
            {index === 0 && (
              <span className="absolute bottom-2 right-2 rounded-full bg-brand px-2 py-1 text-[10px] font-bold text-cream">
                الغلاف
              </span>
            )}
            <button
              onClick={() => onRemove(index)}
              className="absolute left-2 top-2 grid h-7 w-7 place-items-center rounded-full bg-white/90 text-rose opacity-0 transition group-hover:opacity-100"
            >
              <X size={15} />
            </button>
          </div>
        ))}
        <label className="flex aspect-square cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-line text-center text-brand transition hover:border-brand hover:bg-brand-soft">
          <Camera size={23} />
          <span className="mt-2 text-sm font-black">إضافة صورة</span>
          <input
            type="file"
            accept="image/*"
            onChange={(event) => onAdd(event.target.files?.[0] ?? null)}
            className="sr-only"
          />
        </label>
      </div>
      <p className="mt-4 text-xs text-ink/45">
        يمكنك النشر الآن دون صور في النموذج التجريبي، لكن الصور ترفع جودة
        الإعلان.
      </p>
    </div>
  )
}

function PriceStep({
  daily,
  setDaily,
  deposit,
  setDeposit,
  minimum,
  setMinimum,
}: any) {
  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field
          label="سعر اليوم (ر.س)"
          value={daily}
          onChange={setDaily}
          placeholder="300"
          type="number"
        />
        <Field
          label="التأمين المسترد (ر.س)"
          value={deposit}
          onChange={setDeposit}
          placeholder="اختياري"
          type="number"
        />
      </div>
      <label className="block text-sm font-bold text-ink">
        الحد الأدنى لمدة الإيجار
        <select
          value={minimum}
          onChange={(event) => setMinimum(event.target.value)}
          className="mt-2 w-full rounded-xl border border-line px-4 py-3 text-sm font-normal outline-none focus:border-brand"
        >
          <option>يوم واحد</option>
          <option>يومان</option>
          <option>٣ أيام</option>
          <option>أسبوع</option>
        </select>
      </label>
      <div className="rounded-2xl bg-amber/10 p-5">
        <p className="flex items-center gap-2 text-sm font-black text-brand">
          <CircleDollarSign size={18} /> اقتراح تسعير
        </p>
        <p className="mt-2 text-sm leading-6 text-ink/65">
          السعر اليومي الواضح مع التأمين المسترد يساعدان على بناء الثقة قبل
          الحجز.
        </p>
      </div>
    </div>
  )
}

function LocationStep({
  city,
  setCity,
  neighborhood,
  setNeighborhood,
  pickup,
  setPickup,
  delivery,
  setDelivery,
  deliveryFee,
  setDeliveryFee,
}: any) {
  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field
          label="المدينة"
          value={city}
          onChange={setCity}
          placeholder="مثال: الرياض"
        />
        <Field
          label="الحي"
          value={neighborhood}
          onChange={setNeighborhood}
          placeholder="اختياري"
        />
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <label
          className={`flex cursor-pointer items-center gap-3 rounded-2xl border p-4 text-sm font-black ${
            pickup
              ? "border-brand bg-brand-soft text-brand"
              : "border-line text-ink/65"
          }`}
        >
          <input
            checked={pickup}
            onChange={(event) => setPickup(event.target.checked)}
            type="checkbox"
            className="accent-[#075c3d]"
          />
          <MapPin size={18} /> استلام شخصي
        </label>
        <label
          className={`flex cursor-pointer items-center gap-3 rounded-2xl border p-4 text-sm font-black ${
            delivery
              ? "border-brand bg-brand-soft text-brand"
              : "border-line text-ink/65"
          }`}
        >
          <input
            checked={delivery}
            onChange={(event) => setDelivery(event.target.checked)}
            type="checkbox"
            className="accent-[#075c3d]"
          />
          <Truck size={18} /> توصيل للمستأجر
        </label>
      </div>
      {delivery && (
        <Field
          label="رسوم التوصيل (ر.س)"
          value={deliveryFee}
          onChange={setDeliveryFee}
          placeholder="60"
          type="number"
        />
      )}
    </div>
  )
}

function ReviewStep({
  image,
  title,
  category,
  description,
  daily,
  deposit,
  city,
  pickup,
  delivery,
  deliveryFee,
}: any) {
  return (
    <div className="grid gap-6 lg:grid-cols-[.8fr_1.2fr]">
      <img
        src={image}
        alt={title || "معاينة الإعلان"}
        className="aspect-[4/3] w-full rounded-2xl bg-brand-soft object-cover"
      />
      <div>
        <p className="text-xs font-black tracking-[.12em] text-brand">
          معاينة الإعلان
        </p>
        <p className="mt-2 text-xs text-ink/45">{category}</p>
        <h3 className="mt-1 text-2xl font-black text-ink">{title}</h3>
        <p className="mt-3 text-sm leading-6 text-ink/60">{description}</p>
        <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
          <Meta label="سعر اليوم" value={`${daily || "—"} ر.س`} />
          <Meta
            label="التأمين"
            value={deposit ? `${deposit} ر.س` : "غير محدد"}
          />
          <Meta label="الموقع" value={city} />
          <Meta
            label="التسليم"
            value={
              pickup && delivery
                ? "استلام وتوصيل"
                : pickup
                  ? "استلام شخصي"
                  : "توصيل"
            }
          />
        </div>
        {delivery && (
          <p className="mt-3 text-xs font-bold text-green">
            رسوم توصيل: {deliveryFee || "—"} ر.س
          </p>
        )}
      </div>
    </div>
  )
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  label: string
  value: string
  onChange: (value: string) => void
  placeholder: string
  type?: string
}) {
  return (
    <label className="block text-sm font-bold text-ink">
      {label}
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        type={type}
        placeholder={placeholder}
        className="mt-2 w-full rounded-xl border border-line px-4 py-3 text-sm font-normal outline-none focus:border-brand focus:ring-2 focus:ring-brand/10"
      />
    </label>
  )
}

function Meta({ label, value }: { label: string value: string }) {
  return (
    <div className="rounded-xl bg-cream p-3">
      <p className="text-xs text-ink/45">{label}</p>
      <p className="mt-1 text-sm font-black text-ink">{value}</p>
    </div>
  )
}

function PublishSuccess({
  title,
  onDashboard,
}: {
  title: string
  onDashboard: () => void
}) {
  return (
    <div dir="rtl" lang="ar" className="min-h-screen bg-cream">
      <Header />
      <main className="mx-auto flex min-h-[calc(100vh-90px)] max-w-xl items-center px-5 py-12">
        <section className="w-full rounded-[2rem] border border-line bg-white p-8 text-center shadow-[0_28px_70px_-44px_rgba(7,92,61,.22)]">
          <div className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-green/10 text-green">
            <CheckCircle2 size={39} />
          </div>
          <p className="mt-7 text-xs font-black tracking-[.14em] text-green">
            تم نشر الإعلان
          </p>
          <h1 className="editorial-display mt-3 text-4xl leading-tight text-ink">
            {title} أصبح جاهزًا للتأجير.
          </h1>
          <p className="mx-auto mt-4 max-w-md text-sm leading-7 text-ink/60">
            سيظهر إعلانك في لوحة المالك داخل هذا العرض التجريبي.
          </p>
          <button
            onClick={onDashboard}
            className="mt-7 inline-flex items-center gap-2 rounded-xl bg-brand px-6 py-3.5 text-sm font-black text-cream"
          >
            العودة إلى لوحة التحكم <ArrowLeft size={17} />
          </button>
        </section>
      </main>
    </div>
  )
}
