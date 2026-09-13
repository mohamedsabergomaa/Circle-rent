import { useEffect, useRef, useState } from 'react'
import { RouterProvider, createBrowserRouter, Link, Navigate, useLocation, useNavigate, useParams, useSearchParams } from 'react-router'
import { Logo } from './Logo'
import heroBackground from './imports/image-3.png'
import Login from './pages/Login'
import PhoneVerification from './pages/PhoneVerification'
import Onboarding from './pages/Onboarding'
import Checkout from './pages/Checkout'
import MyBookings, { BookingDetail } from './pages/MyBookings'
import Messages from './pages/Messages'
import Profile, { PublicProfile } from './pages/Profiles'
import Favorites from './pages/Favorites'
import SavedSearches from './pages/SavedSearches'
import RentalReturn from './pages/RentalReturn'
import OwnerBookings from './pages/OwnerBookings'
import CreateListing from './pages/CreateListing'
import { getSavedSearches, deleteSavedSearch } from './services/savedSearches'
import type { SavedSearch } from './types'
import { checkFavorite, addFavorite, removeFavorite } from './services/favorites'
import { useAuth, AuthProvider } from './context/AuthContext'
import SignUp from './pages/SignUp'
import ForgotPassword from './pages/ForgotPassword'
import Admin from './pages/Admin'
import Dashboard from './pages/Dashboard'
import Verification, { VerificationPending } from './pages/Verification'
import AboutPage, { ContactPage, FaqPage, HowItWorksPage, PolicyPage } from './pages/InfoPages'
import type { ReactNode } from 'react'
import {
  Search,
  MapPin,
  Heart,
  Star,
  Menu,
  X,
  ArrowLeft,
  MessageCircle,
  AtSign,
  Send,
  Mail,
  Globe,
  ChevronDown,
  UserRound,
  LayoutDashboard,
  LogIn,
  UserPlus,
  LogOut,
  SlidersHorizontal,
  RotateCcw,
  Check,
  Clock3,
  CalendarDays,
  ShieldCheck,
  Truck,
  PackageCheck,
  Minus,
  Plus,
  ChevronRight,
  Share2,
  Flag,
  BadgeCheck,
  Camera,
  Monitor,
  Drill,
  Gamepad2,
  Car,
  Music2,
  Dumbbell,
  Shirt,
  BookOpen,
  PawPrint,
  Home,
  Bike,
  UsersRound,
  Tags,
  Headphones,
  ClipboardCheck,
  Building2,
} from 'lucide-react'

export type Listing = {
  id: string
  name: string
  category: string
  price: string
  city: string
  image: string
  owner: string
  rating: string
  verified?: boolean
  features?: string[]
}

const img = (id: string) =>
  `https://images.unsplash.com/photo-${id}?w=640&h=560&fit=crop&auto=format`

const forYou: Listing[] = [
  { id: 'fy1', name: 'كاميرا سوني ألفا', category: 'تصوير فوتوغرافي', price: '٣٠٠', city: 'القاهرة', image: img('1516035069371-29a1b244cc32'), owner: 'مروان', rating: '٤٫٩', verified: true },
  { id: 'fy2', name: 'مثقاب كهربائي ديوالت', category: 'عُدد وأدوات', price: '١٠٠', city: 'الجيزة', image: img('1572981779307-38b8cabb2407'), owner: 'أحمد', rating: '٤٫٧' },
  { id: 'fy3', name: 'بلايستيشن ٥', category: 'ألعاب وترفيه', price: '٢٥٠', city: 'القاهرة', image: img('1607853202273-797f1c22a38e'), owner: 'يوسف', rating: '٥٫٠', verified: true },
  { id: 'fy4', name: 'لابتوب ألعاب', category: 'إلكترونيات', price: '٣٥٠', city: 'المعادي', image: img('1603302576837-37561b2e2302'), owner: 'سلمى', rating: '٤٫٨' },
  { id: 'fy5', name: 'كاميرا مع حامل ثلاثي', category: 'تصوير فوتوغرافي', price: '٢٢٠', city: 'مدينة نصر', image: img('1612548403247-aa2873e9422d'), owner: 'ندى', rating: '٤٫٦' },
]

const recommended: Listing[] = [
  { id: 'rc1', name: 'سماعة دي جي', category: 'صوتيات وحفلات', price: '٤٠٠', city: 'الإسكندرية', image: img('1724858103797-6d388eb1006a'), owner: 'كريم', rating: '٤٫٩', verified: true },
  { id: 'rc2', name: 'دراجة كهربائية', category: 'تنقّل', price: '١٨٠', city: 'الزمالك', image: img('1620802051782-725fa33db067'), owner: 'ليلى', rating: '٤٫٨' },
  { id: 'rc3', name: 'عدسة كانون', category: 'تصوير فوتوغرافي', price: '٢٥٠', city: 'القاهرة', image: img('1502920917128-1aa500764cbd'), owner: 'هشام', rating: '٤٫٧' },
  { id: 'rc4', name: 'خلاط عجين احترافي', category: 'أدوات منزلية', price: '١٢٠', city: '٦ أكتوبر', image: img('1758565810987-ca8d617ea7be'), owner: 'منى', rating: '٤٫٥' },
  { id: 'rc5', name: 'جيتار أكوستيك', category: 'آلات موسيقية', price: '٩٠', city: 'المعادي', image: img('1510915361894-db8b60106cb1'), owner: 'عمر', rating: '٤٫٩', verified: true },
]

const recent: Listing[] = [
  { id: 'nw1', name: 'خيمة تخييم', category: 'رحلات وتخييم', price: '١٥٠', city: 'العين السخنة', image: img('1510312305653-8ed496efae75'), owner: 'رنا', rating: '٤٫٨' },
  { id: 'nw2', name: 'بروجكتر منزلي', category: 'إلكترونيات', price: '٣٠٠', city: 'القاهرة', image: img('1535016120720-40c646be5580'), owner: 'طارق', rating: '٤٫٦', verified: true },
  { id: 'nw3', name: 'طقم عُدد كهربائية', category: 'عُدد وأدوات', price: '٢٠٠', city: 'الجيزة', image: img('1645651964715-d200ce0939cc'), owner: 'باسم', rating: '٤٫٧' },
  { id: 'nw4', name: 'سكوتر كهربائي', category: 'تنقّل', price: '١٦٠', city: 'الإسكندرية', image: img('1565300480288-deb407e6ae15'), owner: 'دينا', rating: '٤٫٥' },
  { id: 'nw5', name: 'تلسكوب فلكي', category: 'هوايات', price: '٢٨٠', city: 'الفيوم', image: img('1609000142140-fb449c139c82'), owner: 'زياد', rating: '٥٫٠', verified: true },
]

const navItems = [
  { label: 'من نحن', to: '/about' },
  { label: 'كيف يعمل', to: '/how-it-works' },
  { label: 'الأسئلة الشائعة', to: '/faqs' },
  { label: 'تواصل معنا', to: '/contact' },
  { label: 'الشروط والسياسة', to: '/policy' },
]

function CountrySelect({ compact = false }: { compact?: boolean }) {
  const [open, setOpen] = useState(false)
  const [country, setCountry] = useState('مصر')
  const countries = ['مصر', 'السعودية', 'الإمارات', 'الأردن', 'المغرب']
  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 rounded-full border border-line px-3 py-1.5 text-sm font-medium text-ink/80 transition-colors hover:border-brand hover:text-brand"
      >
        <Globe size={16} className="text-brand" />
        {!compact && <span>{country}</span>}
        <ChevronDown size={14} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <ul className="absolute left-0 top-11 z-40 w-40 overflow-hidden rounded-xl border border-line bg-white py-1 shadow-[0_16px_40px_-24px_rgba(7,92,61,0.26)]">
          {countries.map((c) => (
            <li key={c}>
              <button
                onClick={() => {
                  setCountry(c)
                  setOpen(false)
                }}
                className={`flex w-full items-center gap-2 px-4 py-2 text-right text-sm transition-colors hover:bg-brand-soft ${
                  c === country ? 'font-semibold text-brand' : 'text-ink/80'
                }`}
              >
                {c}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

function AccountMenu() {
  const [open, setOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()
  const { user, signOut } = useAuth()
  useEffect(() => {
    const close = (event: MouseEvent) => { if (menuRef.current && !menuRef.current.contains(event.target as Node)) setOpen(false) }
    const escape = (event: KeyboardEvent) => { if (event.key === 'Escape') setOpen(false) }
    document.addEventListener('mousedown', close)
    document.addEventListener('keydown', escape)
    return () => { document.removeEventListener('mousedown', close); document.removeEventListener('keydown', escape) }
  }, [])
  const closeMenu = () => setOpen(false)
  const leave = async () => { await signOut(); closeMenu(); navigate('/') }
  return <div ref={menuRef} className="relative">
    <button type="button" onClick={() => setOpen(value => !value)} aria-expanded={open} aria-controls="account-menu" aria-label="فتح قائمة الحساب" className="grid h-10 w-10 place-items-center overflow-hidden rounded-full border border-line bg-white text-brand shadow-sm transition hover:border-brand hover:bg-brand-soft focus:outline-none focus:ring-2 focus:ring-brand/25">
      {user?.avatarUrl ? <img src={user.avatarUrl} alt="صورة الملف الشخصي" className="h-full w-full object-cover" /> : user ? <span className="text-sm font-black">{user.fullName.charAt(0)}</span> : <Menu size={20} strokeWidth={2.25} />}
    </button>
    {open && <div id="account-menu" className="absolute left-0 top-[calc(100%+0.65rem)] z-50 w-72 overflow-hidden rounded-2xl border border-line bg-white shadow-[0_18px_45px_-18px_rgba(27,41,35,0.18)]">
      {user ? <><div className="flex items-center gap-3 bg-brand-soft/60 px-4 py-4"><div className="grid h-11 w-11 place-items-center rounded-full bg-brand text-sm font-black text-cream">{user.fullName.charAt(0)}</div><div className="min-w-0"><p className="truncate text-sm font-bold text-ink">{user.fullName}</p><p className="mt-0.5 text-xs text-muted">{user.city ?? 'عضو في سيركل'}</p></div></div><div className="p-2"><Link to="/profile" onClick={closeMenu} className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-ink transition hover:bg-brand-soft hover:text-brand"><UserRound size={18} className="text-brand" /> ملفي الشخصي</Link><Link to="/dashboard" onClick={closeMenu} className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-ink transition hover:bg-brand-soft hover:text-brand"><LayoutDashboard size={18} className="text-brand" /> لوحة التحكم</Link><Link to="/dashboard/bookings" onClick={closeMenu} className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-ink transition hover:bg-brand-soft hover:text-brand"><PackageCheck size={18} className="text-brand" /> حجوزات إعلاناتي</Link><Link to="/my-bookings" onClick={closeMenu} className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-ink transition hover:bg-brand-soft hover:text-brand"><CalendarDays size={18} className="text-brand" /> حجوزاتي</Link><Link to="/messages" onClick={closeMenu} className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-ink transition hover:bg-brand-soft hover:text-brand"><MessageCircle size={18} className="text-brand" /> الرسائل</Link><Link to="/favorites" onClick={closeMenu} className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-ink transition hover:bg-brand-soft hover:text-brand"><Heart size={18} className="text-brand" /> المفضلة</Link><Link to="/saved-searches" onClick={closeMenu} className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-ink transition hover:bg-brand-soft hover:text-brand"><Search size={18} className="text-brand" /> عمليات البحث المحفوظة</Link></div><div className="border-t border-line p-2"><button type="button" onClick={leave} className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-right text-sm font-medium text-rose transition hover:bg-rose/10"><LogOut size={18} /> تسجيل الخروج</button></div></> : <><div className="bg-brand-soft/60 px-4 py-4"><p className="text-sm font-bold text-ink">مرحبًا بك في سيركل</p><p className="mt-0.5 text-xs text-muted">سجّل الدخول لإدارة حسابك وحجوزاتك.</p></div><div className="p-2"><Link to="/login" onClick={closeMenu} className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-brand transition hover:bg-brand-soft"><LogIn size={18} /> تسجيل الدخول</Link><Link to="/signup" onClick={closeMenu} className="mt-1 flex items-center gap-3 rounded-xl bg-brand px-3 py-2.5 text-sm font-semibold text-cream transition hover:bg-[#064b32]"><UserPlus size={18} /> إنشاء حساب</Link></div></>}
    </div>}
  </div>
}

export function Header() {
  const [open, setOpen] = useState(false)
  return (
    <header className="sticky top-0 z-30 bg-cream/85 backdrop-blur-md">
      {/* Upper bar: logo + country + profile */}
      <div className="border-b border-line">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-2">
          <Link to="/"><Logo compact /></Link>
          <div className="flex items-center gap-3">
            <CountrySelect />
            <AccountMenu />
          </div>
        </div>
      </div>

      {/* Lower bar: navigation links + CTA */}
      <div className="border-b border-line bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5">
          <nav className="hidden items-center gap-8 md:flex">
            {navItems.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className="border-b-2 border-transparent py-3.5 text-sm font-semibold text-ink/75 transition-colors hover:border-amber hover:text-brand"
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <Link to="/create-listing" className="my-2 hidden rounded-full bg-brand px-5 py-2 text-sm font-bold text-cream shadow-[0_8px_18px_-10px_rgba(7,92,61,0.45)] transition-colors hover:bg-[#064b32] md:inline-block">أضِف إعلانك</Link>
          <button
            onClick={() => setOpen((v) => !v)}
            className="my-2 flex items-center gap-2 rounded-full border border-line px-4 py-2 text-sm font-medium text-brand md:hidden"
            aria-label="القائمة"
          >
            {open ? <X size={18} /> : <Menu size={18} />}
            القائمة
          </button>
        </div>
      </div>

      {/* Third bar: category tags */}
      <div className="border-b border-brand/20 bg-brand shadow-[inset_0_-1px_0_rgba(255,255,255,0.08)]">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-0.5 overflow-x-auto scrollbar-none px-3 py-1.5 sm:px-5">
          {categoryNav.map(({ label, icon: Icon }) => (
            <Link
              key={label}
              to={`/search?category=${encodeURIComponent(label)}`}
              className="group inline-flex shrink-0 flex-col items-center gap-0.5 rounded-md px-2.5 py-1 text-[10px] font-semibold text-cream/75 transition-colors hover:bg-white/10 hover:text-cream"
            >
              <Icon size={18} strokeWidth={1.8} className="text-cream transition-transform group-hover:-translate-y-0.5" />
              <span className="whitespace-nowrap">{label}</span>
            </Link>
          ))}
        </div>
      </div>

      {open && (
        <nav className="flex flex-col gap-1 border-b border-brand bg-brand px-5 pb-4 pt-2 md:hidden">
          {navItems.map((item) => (
            <Link key={item.to} to={item.to} onClick={() => setOpen(false)} className="rounded-lg px-2 py-2.5 text-sm font-medium text-cream/85 hover:bg-white/10 hover:text-amber">
              {item.label}
            </Link>
          ))}
          <Link to="/create-listing" onClick={() => setOpen(false)} className="mt-2 rounded-full bg-brand px-5 py-2.5 text-center text-sm font-semibold text-cream">أضِف إعلانك</Link>
        </nav>
      )}
    </header>
  )
}

const categoryNav = [
  { label: 'تصوير فوتوغرافي', icon: Camera },
  { label: 'إلكترونيات', icon: Monitor },
  { label: 'عُدد وأدوات', icon: Drill },
  { label: 'ألعاب وترفيه', icon: Gamepad2 },
  { label: 'تنقّل', icon: Bike },
  { label: 'سيارات ومركبات', icon: Car },
  { label: 'آلات موسيقية', icon: Music2 },
  { label: 'رياضة ولياقة', icon: Dumbbell },
  { label: 'ملابس وأزياء', icon: Shirt },
  { label: 'كتب ومراجع', icon: BookOpen },
  { label: 'أدوات منزلية', icon: Home },
  { label: 'حيوانات أليفة', icon: PawPrint },
  { label: 'شقق ومنازل', icon: Building2 },
]
const rotatingPhrases = [
  'من جارك القريب',
  'دون أن تشتريه',
  'بسعر يناسبك',
  'لساعات أو لأيام',
]


function Hero() {
  const navigate = useNavigate()
  const [phraseIndex, setPhraseIndex] = useState(0)
  const [visible, setVisible] = useState(true)
  const assurances = [
    [Headphones, 'دعم على مدار الساعة', 'نحن هنا لمساعدتك دائمًا'],
    [Tags, 'أسعار مناسبة', 'وفّر المال واستأجر بذكاء'],
    [ShieldCheck, 'معاملات آمنة', 'حماية وخصوصية تامة'],
    [UsersRound, 'مجتمع موثوق', 'آلاف المستخدمين يثقون بنا'],
  ]

  useEffect(() => {
    const interval = setInterval(() => {
      setVisible(false)
      setTimeout(() => {
        setPhraseIndex((i) => (i + 1) % rotatingPhrases.length)
        setVisible(true)
      }, 350)
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  const handleSearch = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    navigate('/search')
  }

  return (
    <section className="relative isolate -mt-px overflow-hidden bg-[#f7f3ee]">
      <img
        src={heroBackground}
        alt="كاميرا وسماعات ونباتات تمثل تنوع المنتجات المتاحة للإيجار"
        className="pointer-events-none absolute inset-0 h-full w-full object-cover object-center"
      />
      <div className="pointer-events-none absolute inset-0 bg-[#f7f3ee]/15" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-brand/20 via-brand/5 to-transparent" />

      <div className="relative mx-auto max-w-6xl px-5 pt-16 text-center sm:pt-20 lg:min-h-[390px]">
        <h1 className="mx-auto max-w-3xl text-[2.6rem] font-black leading-[1.18] tracking-tight text-brand sm:text-6xl">
          استأجر <span className="text-amber">ما تحتاجه.</span>
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-base font-medium text-ink/75 sm:text-xl">
          اكتشف الأشياء التي يؤجّرها الناس من حولك.
        </p>
        <span
          className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-brand/75 transition-all duration-350"
          style={{ opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(8px)' }}
        >
          <span className="h-1.5 w-1.5 rounded-full bg-amber" />
          {rotatingPhrases[phraseIndex]}
        </span>

        <form onSubmit={handleSearch} className="relative z-10 mx-auto mt-8 max-w-3xl translate-y-8">
          <div className="flex flex-col gap-2 rounded-[1.9rem] border border-white bg-white p-2.5 shadow-[0_22px_48px_-22px_rgba(7,92,61,0.35)] sm:flex-row sm:items-center sm:rounded-full sm:gap-0">
            <div className="flex flex-1 items-center gap-3 px-5 py-3">
              <Search size={22} className="shrink-0 text-ink" strokeWidth={2} />
              <input className="w-full bg-transparent text-sm text-ink placeholder:text-muted focus:outline-none" placeholder="ماذا تريد أن تستأجر؟" />
            </div>
            <span className="mx-1 hidden h-9 w-px bg-line sm:block" />
            <div className="flex items-center gap-3 px-5 py-3 sm:w-48">
              <MapPin size={21} className="shrink-0 text-brand" />
              <input className="w-full bg-transparent text-sm text-ink placeholder:text-muted focus:outline-none" placeholder="الموقع" />
            </div>
            <button type="submit" className="grid h-12 shrink-0 place-items-center rounded-2xl bg-brand px-5 text-white transition-colors hover:bg-[#064b32] sm:h-12 sm:w-12 sm:rounded-full sm:px-0" aria-label="بحث">
              <Search size={21} />
              <span className="mr-2 text-sm font-semibold sm:hidden">بحث</span>
            </button>
          </div>
        </form>
      </div>

      <div className="relative mx-auto max-w-6xl px-5 pb-10 pt-16 sm:pb-14">
        <div className="grid overflow-hidden rounded-2xl bg-brand text-white shadow-[0_18px_35px_-24px_rgba(7,92,61,0.9)] sm:grid-cols-2 lg:grid-cols-4">
          {assurances.map(([Icon, title, copy], index) => {
            const AssuranceIcon = Icon as typeof Headphones
            return (
              <article key={title as string} className={`flex items-center gap-3 px-5 py-4 ${index ? 'border-t border-white/20 sm:border-r sm:border-t-0' : ''}`}>
                <AssuranceIcon size={29} strokeWidth={1.65} className="shrink-0 text-white" />
                <div><h2 className="text-sm font-black">{title as string}</h2><p className="mt-0.5 text-[11px] text-white/70">{copy as string}</p></div>
              </article>
            )
          })}
        </div>
      </div>
    </section>
  )
}

function Stripe() {
  const benefits = [
    [ClipboardCheck, 'اختر ما يناسبك', 'تصفّح آلاف المنتجات المتاحة'],
    [MessageCircle, 'تواصل مع المؤجر', 'تفاهم بسهولة وأمان'],
    [CalendarDays, 'احجز واستلم', 'في الوقت والمكان المناسبين'],
    [BadgeCheck, 'استمتع وجرّب', 'منتجات مميزة من حولك'],
    [RotateCcw, 'أعدها بسهولة', 'استلام وإعادة دون تعقيد'],
  ]
  return (
    <section className="relative z-10 mx-auto max-w-6xl px-5">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {benefits.map(([Icon, title, copy]) => {
          const BenefitIcon = Icon as typeof ClipboardCheck
          return <article key={title as string} className="flex items-center gap-3 rounded-xl border border-line bg-white p-4 shadow-[0_10px_22px_-20px_rgba(27,41,35,.45)]"><BenefitIcon size={28} strokeWidth={1.75} className="shrink-0 text-amber" /><div><h2 className="text-sm font-black text-ink">{title as string}</h2><p className="mt-0.5 text-[11px] leading-4 text-muted">{copy as string}</p></div></article>
        })}
      </div>
    </section>
  )
}

function ListingCard({ listing, full = false }: { listing: Listing; full?: boolean }) {
  const [saved, setSaved] = useState(false)
  useEffect(() => { checkFavorite(listing.id).then(setSaved).catch(() => {}) }, [listing.id])
  const toggleSaved = async () => {
    try {
      if (saved) { await removeFavorite(listing.id); setSaved(false) }
      else { await addFavorite({ id: listing.id, name: listing.name, category: listing.category, price: listing.price, city: listing.city, image: listing.image, owner: listing.owner, rating: listing.rating }); setSaved(true) }
    } catch (err) { console.error(err) }
  }
  return (
    <article className={`group ${full ? 'w-full' : 'w-64 shrink-0 snap-start'} overflow-hidden rounded-2xl border border-line bg-white transition-all duration-300 hover:-translate-y-1 hover:border-brand/30 hover:shadow-[0_20px_44px_-28px_rgba(7,92,61,0.26)]`}>
      <div className="relative aspect-[4/3] overflow-hidden bg-brand-soft">
        <img
          src={listing.image}
          alt={listing.name}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <button
          onClick={(event) => { event.preventDefault(); event.stopPropagation(); toggleSaved() }}
          aria-label="حفظ"
          className="absolute left-3 top-3 grid h-9 w-9 place-items-center rounded-full bg-white/90 backdrop-blur transition-colors hover:bg-white"
        >
          <Heart
            size={17}
            className={saved ? 'fill-rose text-rose' : 'text-ink/50'}
          />
        </button>
        {listing.verified && (
          <span className="absolute bottom-3 right-3 rounded-full bg-green/95 px-2.5 py-1 text-[11px] font-semibold text-white">
            مالك موثّق
          </span>
        )}
      </div>
      <div className="p-4">
        <p className="text-[11px] font-medium text-muted">{listing.category}</p>
        <h3 className="mt-1 truncate text-[15px] font-semibold text-ink">{listing.name}</h3>
        <div className="mt-2 flex items-baseline gap-1">
          <span className="text-lg font-bold text-amber">{listing.price}</span>
          <span className="text-xs font-medium text-ink/60">ج.م / يوم</span>
        </div>
        <div className="mt-3 flex items-center justify-between border-t border-line pt-3">
          <span className="flex items-center gap-1 text-xs text-ink/60">
            <MapPin size={13} className="text-brand" />
            {listing.city}
          </span>
          <span className="flex items-center gap-2 text-xs text-ink/70">
            <span className="flex items-center gap-0.5 font-semibold">
              <Star size={12} className="fill-amber text-amber" />
              {listing.rating}
            </span>
            <span className="grid h-6 w-6 place-items-center rounded-full bg-brand-soft text-[11px] font-bold text-brand">
              {listing.owner.charAt(0)}
            </span>
          </span>
        </div>
      </div>
    </article>
  )
}

function ListingRow({ title, items }: { title: string; items: Listing[] }) {
  return (
    <section className="mx-auto max-w-6xl px-5 py-10 sm:py-14">
      <Link to="/search" className="group mb-5 inline-flex items-center gap-2">
        <h2 className="editorial-display text-3xl leading-none text-brand sm:text-4xl">{title}</h2>
        <ArrowLeft
          size={20}
          className="text-brand transition-transform group-hover:-translate-x-1"
        />
      </Link>
      <div className="rail flex snap-x gap-4 overflow-x-auto pb-2">
        {items.map((l) => (
          <Link key={l.id} to={`/listing/${l.id}`} className="block shrink-0 snap-start">
            <ListingCard listing={l} />
          </Link>
        ))}
      </div>
    </section>
  )
}

export function Footer() {
  const socials = [MessageCircle, AtSign, Send, Mail]
  return (
    <footer className="bg-brand text-cream">
      <div className="mx-auto grid max-w-6xl gap-10 px-5 py-14 md:grid-cols-3">
        <div>
          <Logo light />
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-cream/70">
            استأجر ما تحتاجه. اربح مما تملك.
          </p>
          <div className="mt-6 flex gap-3">
            <div className="flex-1 rounded-xl bg-cream/10 p-3">
              <p className="text-2xl font-bold text-cream">١٢٬٤٠٠+</p>
              <p className="text-[11px] text-cream/60">إعلان نشط</p>
            </div>
            <div className="flex-1 rounded-xl bg-cream/10 p-3">
              <p className="text-2xl font-bold text-cream">٨٦٠٠+</p>
              <p className="text-[11px] text-cream/60">عملية تأجير</p>
            </div>
          </div>
          <div className="mt-6 flex gap-3">
            {socials.map((Icon, i) => (
              <button
                key={i}
                type="button"
                className="grid h-9 w-9 place-items-center rounded-full bg-cream/10 text-cream transition-colors hover:bg-cream/20"
                aria-label="قناة سيركل الاجتماعية"
              >
                <Icon size={16} />
              </button>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-sm font-bold text-cream">سيركل</h3>
          <ul className="mt-4 space-y-3 text-sm text-cream/70">
            {[['من نحن', '/about'], ['كيف يعمل', '/how-it-works'], ['الأسئلة الشائعة', '/faqs'], ['تواصل معنا', '/contact'], ['الشروط والسياسة', '/policy']].map(([label, to]) => (
              <li key={to}>
                <Link to={to} className="transition-colors hover:text-cream">{label}</Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-bold text-cream">للمستخدمين</h3>
          <ul className="mt-4 space-y-3 text-sm text-cream/70">
            {[['تصفّح المنتجات', '/search'], ['أضِف منتجًا', '/signup'], ['إعلاناتي', '/dashboard'], ['الدعم والمساعدة', '/contact']].map(([label, to]) => (
              <li key={to}>
                <Link to={to} className="transition-colors hover:text-cream">{label}</Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="border-t border-cream/15">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-2 px-5 py-6 sm:flex-row sm:justify-between">
          <p className="text-xs text-cream/60">© ٢٠٢٦ سيركل. جميع الحقوق محفوظة.</p>
          <Link to="/policy" className="text-xs text-cream/50 transition-colors hover:text-cream">الشروط والسياسة</Link>
        </div>
      </div>
    </footer>
  )
}

function HomePage() {
  return (
    <div dir="rtl" lang="ar" className="min-h-screen bg-cream">
      <Header />
      <Hero />
      <div className="pt-6 sm:pt-8">
        <Stripe />
      </div>
      <section className="mx-auto max-w-6xl px-5 pt-16 sm:pt-20">
        <p className="text-xs font-extrabold tracking-[0.18em] text-rose">اختر من حولك</p>
        <div className="mt-3 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <h2 className="editorial-display max-w-xl text-4xl leading-tight text-brand sm:text-5xl">أشياء مميزة، تنتظر أن تبدأ بها يومك.</h2>
          <Link to="/search" className="inline-flex items-center gap-2 text-sm font-bold text-brand hover:text-rose">استكشف كل المنتجات <ArrowLeft size={17} /></Link>
        </div>
      </section>
      <ListingRow title="مختارة لك" items={forYou} />
      <ListingRow title="مقترح لك" items={recommended} />
      <ListingRow title="أُضيف حديثًا" items={recent} />
      <div className="mx-auto mt-6 max-w-6xl px-5">
        <hr className="border-line" />
      </div>
      <Footer />
    </div>
  )
}


export const allListings = [...forYou, ...recommended, ...recent]

function toNumber(value: string) {
  return Number(
    value
      .replace(/[٠-٩]/g, (digit) => String('٠١٢٣٤٥٦٧٨٩'.indexOf(digit)))
      .replace('٫', '.'),
  )
}

function SearchResultsPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [query, setQuery] = useState(() => searchParams.get('q') ?? '')
  const [showSaveSearch, setShowSaveSearch] = useState(false)
  const [saveName, setSaveName] = useState('')
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [priceRange, setPriceRange] = useState(() => searchParams.get('price') ?? 'any')
  const [minimumRating, setMinimumRating] = useState(() => Number(searchParams.get('rating') ?? 0))
  const [location, setLocation] = useState(() => searchParams.get('location') ?? 'كل المدن')
  const [latestOnly, setLatestOnly] = useState(() => searchParams.get('latest') === '1')

  const results = allListings.filter((listing) => {
    const normalizedQuery = query.trim()
    const matchesQuery = !normalizedQuery || `${listing.name} ${listing.category}`.includes(normalizedQuery)
    const price = toNumber(listing.price)
    const matchesPrice =
      priceRange === 'any' ||
      (priceRange === 'under-150' && price < 150) ||
      (priceRange === '150-250' && price >= 150 && price <= 250) ||
      (priceRange === 'over-250' && price > 250)
    const matchesRating = toNumber(listing.rating) >= minimumRating
    const matchesLocation = location === 'كل المدن' || listing.city === location
    const matchesLatest = !latestOnly || listing.id.startsWith('nw')
    return matchesQuery && matchesPrice && matchesRating && matchesLocation && matchesLatest
  })

  const resetFilters = () => {
    setPriceRange('any')
    setMinimumRating(0)
    setLocation('كل المدن')
    setLatestOnly(false)
  }

  const saveSearch = async () => {
    const name = saveName.trim() || (query.trim() ? `بحث: ${query.trim()}` : 'بحث مخصص')
    try {
      await import('./services/savedSearches').then(m => m.createSavedSearch({ name, query, priceRange, minimumRating, location, latestOnly }))
      setShowSaveSearch(false)
      setSaveName('')
      navigate('/saved-searches')
    } catch (err) {
      console.error(err)
    }
  }

  const filterPanel = (
    <div className="rounded-2xl border border-line bg-white p-5 shadow-[0_14px_32px_-28px_rgba(7,92,61,0.24)]">
      <div className="flex items-center justify-between">
        <h2 className="font-bold text-ink">تصفية النتائج</h2>
        <button onClick={resetFilters} className="inline-flex items-center gap-1 text-xs font-semibold text-brand hover:text-rose">
          <RotateCcw size={14} />
          مسح الكل
        </button>
      </div>

      <fieldset className="mt-5 border-t border-line pt-5">
        <legend className="text-sm font-bold text-ink">السعر اليومي</legend>
        <div className="mt-3 space-y-2.5">
          {[
            ['any', 'كل الأسعار'],
            ['under-150', 'أقل من ١٥٠ ج.م'],
            ['150-250', 'من ١٥٠ إلى ٢٥٠ ج.م'],
            ['over-250', 'أكثر من ٢٥٠ ج.م'],
          ].map(([value, label]) => (
            <label key={value} className="flex cursor-pointer items-center gap-2.5 text-sm text-ink/70">
              <input type="radio" name="price" value={value} checked={priceRange === value} onChange={() => setPriceRange(value)} className="accent-[#075c3d]" />
              {label}
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset className="mt-5 border-t border-line pt-5">
        <legend className="text-sm font-bold text-ink">التقييم</legend>
        <div className="mt-3 flex flex-wrap gap-2">
          {[0, 4, 4.5].map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setMinimumRating(value)}
              className={`inline-flex items-center gap-1 rounded-full border px-3 py-1.5 text-xs font-semibold transition ${minimumRating === value ? 'border-amber bg-amber/15 text-ink' : 'border-line text-ink/65 hover:border-amber'}`}
            >
              {value === 0 ? 'الكل' : `${value}+`}
              {value !== 0 && <Star size={13} className="fill-amber text-amber" />}
            </button>
          ))}
        </div>
      </fieldset>

      <fieldset className="mt-5 border-t border-line pt-5">
        <legend className="text-sm font-bold text-ink">الموقع</legend>
        <div className="mt-3 space-y-2.5">
          {['كل المدن', 'القاهرة', 'الجيزة', 'المعادي', 'الإسكندرية'].map((place) => (
            <label key={place} className="flex cursor-pointer items-center gap-2.5 text-sm text-ink/70">
              <input type="radio" name="location" checked={location === place} onChange={() => setLocation(place)} className="accent-[#075c3d]" />
              {place}
            </label>
          ))}
        </div>
      </fieldset>

      <label className="mt-5 flex cursor-pointer items-center justify-between border-t border-line pt-5 text-sm font-bold text-ink">
        الأحدث أولًا
        <input type="checkbox" checked={latestOnly} onChange={(event) => setLatestOnly(event.target.checked)} className="h-4 w-4 accent-[#075c3d]" />
      </label>
    </div>
  )

  return (
    <div dir="rtl" lang="ar" className="min-h-screen bg-cream">
      <Header />
      <main className="mx-auto max-w-6xl px-5 py-9 sm:py-12">
        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div>
            <p className="text-xs font-bold tracking-[0.12em] text-rose">اكتشف ما تحتاجه</p>
            <h1 className="mt-2 text-3xl font-bold text-brand sm:text-4xl">نتائج البحث</h1>
          </div>
          <p className="text-sm text-ink/60">أغراض مميزة متاحة للإيجار بالقرب منك</p>
        </div>

        <form
          onSubmit={(event) => {
            event.preventDefault()
            navigate('/search')
          }}
          className="mt-7 flex flex-col gap-3 sm:flex-row"
        >
          <div className="flex flex-1 items-center gap-3 rounded-2xl border border-line bg-white px-4 py-3 shadow-sm transition focus-within:border-brand focus-within:ring-2 focus-within:ring-brand/15">
            <Search size={20} className="shrink-0 text-brand" />
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="ابحث عن كاميرا، أدوات، أو معدات حفلات..." className="w-full bg-transparent text-sm text-ink placeholder:text-muted focus:outline-none" />
            <button type="submit" className="hidden rounded-xl bg-brand px-4 py-2 text-sm font-semibold text-cream hover:bg-[#064b32] sm:block">بحث</button>
          </div>
          <button
            type="button"
            aria-controls="search-filters"
            onClick={() => {
              setFiltersOpen((open) => !open)
              document.getElementById('search-filters')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
            }}
            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-brand bg-brand-soft px-5 py-3 text-sm font-bold text-brand transition hover:bg-brand hover:text-cream"
          >
            <SlidersHorizontal size={18} />
            الفلاتر
          </button>
          <button type="button" onClick={() => { setSaveName(query.trim() ? `بحث: ${query.trim()}` : 'بحث مخصص'); setShowSaveSearch(true) }} className="inline-flex items-center justify-center gap-2 rounded-2xl border border-line bg-white px-5 py-3 text-sm font-bold text-brand transition hover:border-brand hover:bg-brand-soft"><Clock3 size={18} /> حفظ البحث</button>
        </form>
        {showSaveSearch && <div className="mt-4 rounded-2xl border border-amber/30 bg-amber/10 p-4"><div className="flex flex-wrap items-center gap-3"><label className="min-w-0 flex-1 text-sm font-bold text-ink">اسم البحث<input autoFocus value={saveName} onChange={event => setSaveName(event.target.value)} className="mt-2 w-full rounded-xl border border-line bg-white px-3 py-2.5 text-sm font-normal outline-none focus:border-brand" /></label><div className="flex gap-2 pt-6"><button onClick={saveSearch} className="rounded-xl bg-brand px-4 py-2.5 text-sm font-black text-cream">حفظ</button><button onClick={() => setShowSaveSearch(false)} className="rounded-xl border border-line bg-white px-4 py-2.5 text-sm font-bold text-ink/60">إلغاء</button></div></div></div>}

        {filtersOpen && <div className="mt-4 lg:hidden">{filterPanel}</div>}

        <div className="mt-8 grid items-start gap-8 lg:grid-cols-[17rem_minmax(0,1fr)]">
          <aside id="search-filters" className="sticky top-36 hidden lg:block">{filterPanel}</aside>
          <section aria-live="polite">
            <div className="mb-5 flex items-center justify-between gap-4">
              <p className="text-sm font-medium text-ink/65"><span className="font-bold text-ink">{results.length}</span> إعلانًا متاحًا</p>
              <div className="inline-flex items-center gap-1.5 rounded-full border border-line bg-white px-3 py-1.5 text-xs font-medium text-ink/65"><Clock3 size={14} className="text-brand" /> يتم التحديث يوميًا</div>
            </div>
            {results.length ? (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {results.map((listing) => (
                  <Link key={listing.id} to={`/listing/${listing.id}`} className="block">
                    <ListingCard listing={listing} full />
                  </Link>
                ))}
              </div>
            ) : (
              <div className="grid min-h-72 place-items-center rounded-2xl border border-dashed border-brand/30 bg-white p-8 text-center">
                <div>
                  <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-brand-soft text-brand"><Search size={22} /></div>
                  <h2 className="mt-4 font-bold text-ink">لم نجد نتائج مطابقة</h2>
                  <p className="mt-1 text-sm text-ink/60">جرّب تغيير كلمات البحث أو إزالة بعض الفلاتر.</p>
                  <button onClick={resetFilters} className="mt-4 rounded-full bg-brand px-4 py-2 text-sm font-semibold text-cream">إزالة الفلاتر</button>
                </div>
              </div>
            )}
          </section>
        </div>
      </main>
      <Footer />
    </div>
  )
}


function ProductPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const listing = allListings.find((item) => item.id === id) ?? forYou[0]
  const [activeImage, setActiveImage] = useState(0)
  const [startDate, setStartDate] = useState('2026-08-20')
  const [endDate, setEndDate] = useState('2026-08-23')
  const [quantity, setQuantity] = useState(1)
  const [delivery, setDelivery] = useState(false)
  const [saved, setSaved] = useState(false)
  useEffect(() => { checkFavorite(listing.id).then(setSaved).catch(() => {}) }, [listing.id])
  const toggleSaved = async () => {
    try {
      if (saved) { await removeFavorite(listing.id); setSaved(false) }
      else { await addFavorite({ id: listing.id, name: listing.name, category: listing.category, price: listing.price, city: listing.city, image: listing.image, owner: listing.owner, rating: listing.rating }); setSaved(true) }
    } catch (err) { console.error(err) }
  }
  const [notice, setNotice] = useState('')
  const [reviewFilter, setReviewFilter] = useState<'all' | 'photos'>('all')
  const [gallery, setGallery] = useState<string[]>([listing.image])
  const [unavailable, setUnavailable] = useState<string[]>([])
  const [apiReviews, setApiReviews] = useState<Array<{ name: string; rating: string; text: string; photo: boolean }>>([])

  useEffect(() => {
    import('./services/listings').then(({ getListing, getUnavailableDates, getListingReviews }) => {
      getListing(listing.id).then(data => { if (data.photos?.length) setGallery(data.photos) }).catch(() => {})
      getUnavailableDates(listing.id).then(dates => setUnavailable(dates)).catch(() => {})
      getListingReviews(listing.id).then(reviews => setApiReviews(reviews.map(r => ({ name: r.authorName, rating: r.rating.toFixed(1).replace('.', '٫'), text: r.text, photo: !!r.photoUrl })))).catch(() => {})
    })
  }, [listing.id])
  const calendarDays = Array.from({ length: 14 }, (_, index) => `2026-08-${String(index + 18).padStart(2, '0')}`)
  const days = Math.max(1, Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / 86400000))
  const dailyPrice = toNumber(listing.price)
  const rentalCost = dailyPrice * days * quantity
  const serviceFee = 25
  const deliveryFee = delivery ? 60 : 0
  const deposit = 500
  const total = rentalCost + serviceFee + deliveryFee + deposit
  const feedback = (message: string) => { setNotice(message); window.setTimeout(() => setNotice(''), 2600) }
  const dateLabel = (date: string) => new Intl.DateTimeFormat('ar-EG', { day: 'numeric', month: 'short' }).format(new Date(date))
  const reviews = apiReviews.filter(review => reviewFilter === 'all' || review.photo)

  return <div dir="rtl" lang="ar" className="min-h-screen bg-cream pb-24 lg:pb-0">
    <Header />
    {notice && <div role="status" className="fixed bottom-24 left-5 z-50 rounded-2xl bg-ink px-4 py-3 text-sm font-bold text-cream shadow-xl lg:bottom-6">{notice}</div>}
    <main className="mx-auto max-w-6xl px-5 py-7 sm:py-10">
      <nav aria-label="مسار التنقل" className="flex items-center gap-1.5 text-xs text-ink/55"><Link to="/" className="hover:text-brand">الرئيسية</Link><ChevronRight size={14} /><Link to="/search" className="hover:text-brand">تصفّح المنتجات</Link><ChevronRight size={14} /><span className="truncate text-ink/75">{listing.name}</span></nav>
      <div className="mt-5 grid gap-9 lg:grid-cols-[minmax(0,1.45fr)_minmax(21rem,.82fr)]">
        <section>
          <div className="relative aspect-[4/3] overflow-hidden rounded-3xl bg-brand-soft"><img src={gallery[activeImage] ?? listing.image} alt={listing.name} className="h-full w-full object-cover" /><div className="absolute left-4 top-4 flex gap-2"><button onClick={() => feedback('تم نسخ رابط الإعلان للمشاركة.')} aria-label="مشاركة الإعلان" className="grid h-10 w-10 place-items-center rounded-full bg-white/90 text-brand shadow-sm hover:bg-white"><Share2 size={18} /></button><button onClick={toggleSaved} aria-label="حفظ الإعلان" className={`grid h-10 w-10 place-items-center rounded-full bg-white/90 shadow-sm ${saved ? 'text-rose' : 'text-brand'}`}><Heart size={18} fill={saved ? 'currentColor' : 'none'} /></button></div>{listing.verified && <span className="absolute bottom-4 right-4 inline-flex items-center gap-1.5 rounded-full bg-green px-3 py-1.5 text-xs font-bold text-white"><BadgeCheck size={15} /> مالك موثّق</span>}</div>
          <div className="mt-3 grid grid-cols-4 gap-3">{gallery.map((image, index) => <button key={`${image}-${index}`} onClick={() => setActiveImage(index)} className={`aspect-[4/3] overflow-hidden rounded-xl border-2 transition ${activeImage === index ? 'border-brand' : 'border-transparent opacity-70 hover:opacity-100'}`}><img src={image} alt={`صورة ${index + 1} لـ ${listing.name}`} className="h-full w-full object-cover" /></button>)}</div>
          <div className="mt-9 border-t border-line pt-8"><div className="flex flex-wrap items-start justify-between gap-4"><div><p className="text-xs font-bold tracking-[.12em] text-rose">{listing.category}</p><h1 className="mt-2 text-3xl font-black leading-tight text-ink sm:text-4xl">{listing.name}</h1><div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-ink/65"><span className="inline-flex items-center gap-1"><MapPin size={16} className="text-brand" /> {listing.city}</span><span className="h-4 w-px bg-line" /><span className="inline-flex items-center gap-1 font-semibold text-ink"><Star size={16} className="fill-amber text-amber" /> {listing.rating} <span className="font-normal text-ink/55">(١٩ تقييمًا)</span></span></div></div><div className="flex gap-3"><button onClick={() => feedback('أضيف الإعلان إلى قائمة المقارنة.')} className="text-xs font-semibold text-brand hover:underline">قارن</button><button onClick={() => feedback('تم تسجيل البلاغ وسيراجعه فريقنا.')} className="inline-flex items-center gap-1 text-xs font-semibold text-ink/50 hover:text-rose"><Flag size={15} /> إبلاغ</button></div></div>
            <div className="mt-8 space-y-9 border-t border-line pt-8"><section><h2 className="text-xl font-bold text-ink">عن هذا المنتج</h2><p className="mt-3 text-sm leading-7 text-ink/70">معدات احترافية بحالة ممتازة ومُعتنى بها جيدًا، مناسبة لجلسات التصوير وصناعة المحتوى والمشاريع الإبداعية. يتم تسليم المنتج بعد تأكيد الهوية والحجز.</p><div className="mt-5 grid gap-3 sm:grid-cols-2"><InfoBlock title="حالة المنتج" text="ممتازة — استخدام خفيف" /><InfoBlock title="ما يشمله الإيجار" text="حقيبة حماية، بطارية إضافية، وكابل شحن" /></div></section>
              <section className="grid gap-5 md:grid-cols-2"><div><h2 className="text-xl font-bold text-ink">المميزات</h2><div className="mt-4 flex flex-wrap gap-2">{['تصوير 4K', 'عدسة 24–70 مم', 'واي فاي', 'بطارية إضافية', 'حقيبة حماية'].map(feature => <span key={feature} className="rounded-full bg-brand-soft px-3 py-1.5 text-xs font-bold text-brand">{feature}</span>)}</div></div><div><h2 className="text-xl font-bold text-ink">قواعد المالك</h2><ul className="mt-3 space-y-2 text-sm leading-6 text-ink/65"><li>• الاستلام بين ١٠ ص و٨ م بعد التنسيق.</li><li>• الإلغاء المجاني قبل ٢٤ ساعة.</li><li>• يرجى إعادة المنتج نظيفًا وبملحقاته.</li></ul></div></section>
              <section className="rounded-3xl border border-line bg-white p-5 sm:p-6"><div className="flex flex-wrap items-center justify-between gap-3"><div><h2 className="text-xl font-bold text-ink">تقييمات المستأجرين</h2><p className="mt-1 text-sm text-ink/55">٤٫٩ من ٥ • ١٩ تجربة إيجار مكتملة</p></div><div className="flex rounded-full bg-cream p-1 text-xs font-bold"><button onClick={() => setReviewFilter('all')} className={`rounded-full px-3 py-1.5 ${reviewFilter === 'all' ? 'bg-white text-brand shadow-sm' : 'text-ink/55'}`}>الكل</button><button onClick={() => setReviewFilter('photos')} className={`rounded-full px-3 py-1.5 ${reviewFilter === 'photos' ? 'bg-white text-brand shadow-sm' : 'text-ink/55'}`}>مع صور</button></div></div><div className="mt-5 space-y-5">{reviews.map(review => <article key={review.name} className="border-t border-line pt-5"><div className="flex items-center justify-between"><div className="flex items-center gap-2"><span className="grid h-8 w-8 place-items-center rounded-full bg-brand-soft text-xs font-bold text-brand">{review.name[0]}</span><span className="text-sm font-bold text-ink">{review.name}</span></div><span className="inline-flex items-center gap-1 text-xs font-bold text-amber"><Star size={13} fill="currentColor" />{review.rating}</span></div><p className="mt-3 text-sm leading-6 text-ink/65">{review.text}</p>{review.photo && <img src={gallery[1] ?? gallery[0]} alt="صورة من المستأجر" className="mt-3 h-20 w-28 rounded-xl object-cover" />}</article>)}</div></section>
              <section className="rounded-3xl bg-brand-soft/60 p-6"><div className="flex gap-3"><ShieldCheck className="shrink-0 text-green" size={22} /><div><h2 className="font-bold text-ink">حماية التأجير من سيركل</h2><p className="mt-1 text-sm leading-6 text-ink/65">تحقق الهوية، اتفاق الحجز، وتفاصيل التأمين تجعل تجربتك أوضح قبل الاستلام وأثناءه وبعد الإرجاع.</p></div></div></section>
            </div></div>
        </section>
        <aside className="space-y-4 lg:sticky lg:top-32 lg:self-start"><section className="rounded-3xl border border-line bg-white p-5 shadow-sm"><div className="flex items-end justify-between"><div><p className="text-xs text-ink/55">ابتداءً من</p><p className="mt-1 text-2xl font-black text-brand">{listing.price} <span className="text-sm font-bold">ج.م/يوم</span></p></div><span className="rounded-full bg-green/10 px-2.5 py-1 text-xs font-bold text-green">متاح</span></div><div className="mt-5 border-t border-line pt-5"><div className="flex items-center justify-between"><h2 className="font-bold text-ink">اختر التواريخ</h2><span className="text-xs text-ink/50">الأيام المحجوزة غير قابلة للاختيار</span></div><div className="mt-3 grid grid-cols-7 gap-1.5">{calendarDays.map(date => { const blocked = unavailable.includes(date); const selected = date === startDate || date === endDate; return <button key={date} type="button" disabled={blocked} onClick={() => { if (date < startDate || (date > startDate && date === endDate)) setStartDate(date); else setEndDate(date) }} className={`rounded-lg py-2 text-[11px] font-bold transition ${blocked ? 'cursor-not-allowed bg-rose/10 text-rose line-through' : selected ? 'bg-brand text-cream' : 'bg-cream text-ink/70 hover:bg-brand-soft'}`}>{new Date(date).getDate()}</button> })}</div><div className="mt-4 grid grid-cols-2 gap-2"><label className="text-xs font-bold text-ink/60">من<input type="date" value={startDate} onChange={event => setStartDate(event.target.value)} className="mt-1 w-full rounded-lg border border-line px-2 py-2 text-xs font-normal text-ink outline-none focus:border-brand" /></label><label className="text-xs font-bold text-ink/60">إلى<input type="date" value={endDate} min={startDate} onChange={event => setEndDate(event.target.value)} className="mt-1 w-full rounded-lg border border-line px-2 py-2 text-xs font-normal text-ink outline-none focus:border-brand" /></label></div></div><div className="mt-5 flex items-center justify-between border-t border-line pt-4"><span className="text-sm font-bold text-ink">الكمية</span><div className="flex items-center gap-3"><button onClick={() => setQuantity(value => Math.max(1, value - 1))} className="grid h-7 w-7 place-items-center rounded-full bg-brand-soft text-brand"><Minus size={15} /></button><span className="w-4 text-center text-sm font-bold">{quantity}</span><button onClick={() => setQuantity(value => value + 1)} className="grid h-7 w-7 place-items-center rounded-full bg-brand-soft text-brand"><Plus size={15} /></button></div></div><label className="mt-4 flex cursor-pointer items-center justify-between rounded-xl bg-cream px-3 py-3 text-sm"><span className="inline-flex items-center gap-2 font-bold text-ink"><Truck size={16} className="text-brand" />توصيل إلى موقعك</span><span className="flex items-center gap-2 text-xs text-ink/60">٦٠ ج.م <input checked={delivery} onChange={event => setDelivery(event.target.checked)} type="checkbox" className="accent-[#075c3d]" /></span></label><div className="mt-4 space-y-2 border-t border-line pt-4 text-sm"><PriceRow label={`${days} ${days === 1 ? 'يوم' : 'أيام'} × ${quantity}`} value={`${rentalCost.toLocaleString('ar-EG')} ج.م`} /><PriceRow label="رسوم الخدمة" value="٢٥ ج.م" /><PriceRow label="التأمين المسترد" value="٥٠٠ ج.م" /><PriceRow label="التوصيل" value={delivery ? '٦٠ ج.م' : '—'} /><div className="flex justify-between border-t border-line pt-3 text-base font-black text-ink"><span>الإجمالي</span><span>{total.toLocaleString('ar-EG')} ج.م</span></div></div><button onClick={() => navigate(`/checkout?listing=${encodeURIComponent(listing.id)}&item=${encodeURIComponent(listing.name)}&image=${encodeURIComponent(listing.image)}&city=${encodeURIComponent(listing.city)}&owner=${encodeURIComponent(listing.owner)}&dailyPrice=${dailyPrice}&start=${encodeURIComponent(dateLabel(startDate))}&end=${encodeURIComponent(dateLabel(endDate))}&days=${days}&delivery=${delivery ? '1' : '0'}`)} className="mt-5 w-full rounded-full bg-brand py-3.5 text-sm font-bold text-cream hover:bg-[#064b32]">الانتقال للدفع</button><p className="mt-3 text-center text-xs leading-5 text-ink/50">لن يتم خصم أي مبلغ قبل موافقة المالك.</p></section>
          <section className="rounded-2xl border border-line bg-white p-5"><p className="text-xs font-bold text-muted">مُقدّم من</p><div className="mt-3 flex items-center gap-3"><div className="grid h-11 w-11 place-items-center rounded-full bg-brand text-base font-bold text-cream">{listing.owner.charAt(0)}</div><div><p className="font-bold text-ink">{listing.owner}</p><p className="mt-0.5 text-xs text-ink/55">عضو منذ ٢٠٢٤ • ٢٧ تأجيرًا مكتملًا</p></div></div><div className="mt-4 grid grid-cols-2 gap-2 border-t border-line pt-4 text-xs text-ink/65"><span className="flex items-center gap-1.5"><ShieldCheck size={16} className="text-green" /> هوية موثّقة</span><span className="flex items-center gap-1.5"><BadgeCheck size={16} className="text-green" /> معدل قبول ٩٢٪</span><span className="flex items-center gap-1.5"><Clock3 size={16} className="text-green" /> يرد خلال ساعة</span><span className="flex items-center gap-1.5"><Star size={16} className="text-amber" /> ٤٫٩ تقييم</span></div><div className="mt-4 grid grid-cols-2 gap-2"><button onClick={() => feedback('تم فتح محادثة مع المالك.')} className="rounded-full border border-brand py-2.5 text-sm font-bold text-brand hover:bg-brand-soft">راسل المالك</button><button onClick={() => feedback('هل الاستلام متاح مساءً؟ تم إرسال السؤال.')} className="rounded-full bg-brand-soft py-2.5 text-sm font-bold text-brand">اسأل سؤالًا</button></div></section>
          <section className="overflow-hidden rounded-2xl border border-line bg-white"><div className="flex items-center gap-2 px-4 py-3"><MapPin size={17} className="text-brand" /><div><h2 className="text-sm font-bold text-ink">الاستلام أو التوصيل</h2><p className="mt-0.5 text-xs text-ink/55">منطقة {listing.city} — يظهر العنوان الدقيق بعد التأكيد</p></div></div><iframe title={`خريطة موقع الاستلام في ${listing.city}`} src={`https://www.google.com/maps?q=${encodeURIComponent(`${listing.city}, Egypt`)}&z=13&output=embed`} className="h-44 w-full border-0" loading="lazy" referrerPolicy="no-referrer-when-downgrade" /></section>
        </aside>
      </div>
      <section className="mt-14 border-t border-line pt-9"><div className="flex items-center justify-between"><h2 className="text-2xl font-bold text-ink">منتجات مشابهة بالقرب منك</h2><Link to="/search" className="inline-flex items-center gap-1 text-sm font-bold text-brand hover:underline">عرض الكل <ArrowLeft size={17} /></Link></div><div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{recommended.slice(0, 4).map(item => <Link key={item.id} to={`/listing/${item.id}`}><ListingCard listing={item} full /></Link>)}</div></section>
    </main>
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-white/95 p-3 backdrop-blur lg:hidden"><div className="mx-auto flex max-w-md items-center justify-between gap-4"><div><p className="text-xs text-ink/55">{days} أيام</p><p className="font-black text-brand">{total.toLocaleString('ar-EG')} ج.م</p></div><button onClick={() => navigate(`/checkout?listing=${encodeURIComponent(listing.id)}&item=${encodeURIComponent(listing.name)}&image=${encodeURIComponent(listing.image)}&city=${encodeURIComponent(listing.city)}&owner=${encodeURIComponent(listing.owner)}&dailyPrice=${dailyPrice}&start=${encodeURIComponent(dateLabel(startDate))}&end=${encodeURIComponent(dateLabel(endDate))}&days=${days}&delivery=${delivery ? '1' : '0'}`)} className="rounded-full bg-brand px-5 py-3 text-sm font-bold text-cream">الدفع</button></div></div>
    <Footer />
  </div>
}

function InfoBlock({ title, text }: { title: string, text: string }) { return <div className="rounded-2xl border border-line bg-white p-4"><p className="text-xs font-bold text-ink/50">{title}</p><p className="mt-1 text-sm font-semibold text-ink">{text}</p></div> }
function PriceRow({ label, value }: { label: string, value: string }) { return <div className="flex justify-between text-ink/65"><span>{label}</span><span>{value}</span></div> }


function AuthRoute({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth()
  const location = useLocation()
  if (loading) return <div dir="rtl" className="grid min-h-screen place-items-center bg-cream text-sm font-bold text-brand">جارٍ التحميل...</div>
  if (!user) return <Navigate to={`/login?redirect=${encodeURIComponent(location.pathname)}`} replace />
  return <>{children}</>
}

function DashboardGate() {
  const { user, loading } = useAuth()
  if (loading) return <div dir="rtl" className="grid min-h-screen place-items-center bg-cream text-sm font-bold text-brand">جارٍ التحميل...</div>
  if (!user) return <Navigate to="/login?redirect=/dashboard" replace />
  if (!user.onboardingCompleted) return <Navigate to="/onboarding" replace />
  return <Dashboard />
}

function OnboardingGate() {
  const { user, loading } = useAuth()
  if (loading) return <div dir="rtl" className="grid min-h-screen place-items-center bg-cream text-sm font-bold text-brand">جارٍ التحميل...</div>
  if (!user) return <Navigate to="/login?redirect=/onboarding" replace />
  if (user.onboardingCompleted) return <Navigate to="/dashboard" replace />
  return <Onboarding />
}

function AdminRoute({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth()
  if (loading) return <div dir="rtl" className="grid min-h-screen place-items-center bg-cream text-sm font-bold text-brand">جارٍ التحقق من الصلاحيات...</div>
  if (!user) return <Navigate to={`/login?redirect=/admin`} replace />
  if (!user.isAdmin) return <Navigate to="/" replace />
  return <>{children}</>
}

function NotFoundPage() {
  return <div dir="rtl" lang="ar" className="min-h-screen bg-cream"><Header /><main className="mx-auto flex min-h-[calc(100vh-120px)] max-w-xl items-center px-5 py-16 text-center"><section className="w-full rounded-[2rem] border border-line bg-white p-8 shadow-[0_22px_55px_-40px_rgba(7,92,61,.22)]"><p className="text-xs font-black tracking-[.14em] text-amber">٤٠٤</p><h1 className="editorial-display mt-3 text-4xl text-ink">لم نجد هذه الصفحة.</h1><p className="mt-4 text-sm leading-7 text-ink/60">ربما تم نقل الرابط أو أن العنوان غير صحيح. يمكنك العودة إلى الاستكشاف من الصفحة الرئيسية.</p><Link to="/" className="mt-7 inline-flex items-center gap-2 rounded-xl bg-brand px-5 py-3 text-sm font-black text-cream">العودة للرئيسية <ArrowLeft size={17} /></Link></section></main></div>
}


const router = createBrowserRouter([
  { path: '/', Component: HomePage },
  { path: '/login', Component: Login },
  { path: '/signup', Component: SignUp },
  { path: '/auth/sign-in', Component: Login },
  { path: '/auth/sign-up', Component: SignUp },
  { path: '/auth/verify-phone', Component: PhoneVerification },
  { path: '/forgot-password', Component: ForgotPassword },
  { path: '/onboarding', Component: OnboardingGate },
  { path: '/checkout', element: <AuthRoute><Checkout /></AuthRoute> },
  { path: '/my-bookings', element: <AuthRoute><MyBookings /></AuthRoute> },
  { path: '/my-bookings/:id', element: <AuthRoute><BookingDetail /></AuthRoute> },
  { path: '/my-bookings/:id/return', element: <AuthRoute><RentalReturn /></AuthRoute> },
  { path: '/dashboard/bookings', element: <AuthRoute><OwnerBookings /></AuthRoute> },
  { path: '/create-listing', element: <AuthRoute><CreateListing /></AuthRoute> },
  { path: '/messages', element: <AuthRoute><Messages /></AuthRoute> },
  { path: '/profile', element: <AuthRoute><Profile /></AuthRoute> },
  { path: '/users/:userId', Component: PublicProfile },
  { path: '/favorites', element: <AuthRoute><Favorites /></AuthRoute> },
  { path: '/saved-searches', element: <AuthRoute><SavedSearches /></AuthRoute> },
  { path: '/dashboard', Component: DashboardGate },
  { path: '/verification', Component: Verification },
  { path: '/verification/pending', Component: VerificationPending },
  { path: '/search', Component: SearchResultsPage },
  { path: '/about', Component: AboutPage },
  { path: '/how-it-works', Component: HowItWorksPage },
  { path: '/faqs', Component: FaqPage },
  { path: '/contact', Component: ContactPage },
  { path: '/policy', Component: PolicyPage },
  { path: '/admin', element: <AdminRoute><Admin /></AdminRoute> },
  { path: '/listing/:id', Component: ProductPage },
  { path: '*', Component: NotFoundPage },
])

export default function App() {
  return <AuthProvider><RouterProvider router={router} /></AuthProvider>
}
