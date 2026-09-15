import { useEffect, useState } from "react"

import { Link } from "react-router"

import {
  LayoutDashboard,
  Users,
  Package,
  CalendarCheck,
  Flag,
  LogOut,
  ChevronLeft,
  Search,
  CheckCircle2,
  XCircle,
  Eye,
  Trash2,
  ShieldCheck,
  ArrowUpRight,
  ArrowDownRight,
  BadgeCheck,
  AlertTriangle,
  CircleDollarSign,
  Star,
  Menu,
  MoreHorizontal,
  Loader2,
} from "lucide-react"

import {
  getAdminStats,
  listAdminUsers,
  suspendUser,
  activateUser,
  deleteUser,
  listAdminListings,
  approveListing,
  rejectListing,
  deleteListing,
  listAdminBookings,
  listAdminReports,
  resolveReport,
  deleteReport,
  type AdminStats,
  type AdminUser,
  type AdminListing,
  type AdminBooking,
  type AdminReport,
} from "../services/admin"

import { friendlyError } from "../lib/api"

type Tab = "overview" | "users" | "listings" | "bookings" | "reports"

function cityText(city: unknown): string {
  if (!city) return "—"
  if (typeof city === "string") return city

  const ref = city as { nameAr?: string nameEn?: string id?: string }
  return ref.nameAr ?? ref.nameEn ?? ref.id ?? "—"
}

// ── Shared UI helpers ─────────────────────────────────────────────────────────

const USER_STATUS: Record<string, string> = {
  active: "bg-green/10 text-green",

  suspended: "bg-rose/10 text-rose",
}

const USER_STATUS_AR: Record<string, string> = {
  active: "نشط",
  suspended: "موقوف",
}

const LISTING_STATUS: Record<string, string> = {
  active: "bg-green/10 text-green",

  pending: "bg-amber/15 text-[#b53d13]",

  rejected: "bg-rose/10 text-rose",
}

const LISTING_STATUS_AR: Record<string, string> = {
  active: "نشط",
  pending: "معلّق",
  rejected: "مرفوض",
}

const BOOKING_STATUS: Record<string, string> = {
  completed: "bg-brand-soft text-brand",

  active: "bg-green/10 text-green",

  pending: "bg-amber/15 text-[#b53d13]",

  cancelled: "bg-rose/10 text-rose",
}

const BOOKING_STATUS_AR: Record<string, string> = {
  completed: "مكتمل",
  active: "نشط",
  pending: "قيد الانتظار",
  cancelled: "ملغي",
}

const REPORT_STATUS: Record<string, string> = {
  pending: "bg-amber/15 text-[#b53d13]",

  resolved: "bg-brand-soft text-brand",
}

const REPORT_STATUS_AR: Record<string, string> = {
  pending: "قيد المراجعة",
  resolved: "تمت المعالجة",
}

function Badge({ label, style }: { label: string style: string }) {
  return (
    <span
      className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-bold ${style}`}
    >
      {label}
    </span>
  )
}

function ActionBtn({
  icon: Icon,
  label,
  danger,
  onClick,
  disabled,
}: {
  icon: typeof Eye
  label: string
  danger?: boolean
  onClick?: () => void
  disabled?: boolean
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={label}
      className={`grid h-8 w-8 place-items-center rounded-lg transition disabled:opacity-40 ${
        danger
          ? "text-rose hover:bg-rose/10"
          : "text-ink/50 hover:bg-brand-soft hover:text-brand"
      }`}
    >
      <Icon size={15} />
    </button>
  )
}

function Spinner() {
  return (
    <div className="flex items-center justify-center py-20">
      <Loader2 size={28} className="animate-spin text-brand/40" />
    </div>
  )
}

function ErrorMsg({
  message,
  onRetry,
}: {
  message: string
  onRetry: () => void
}) {
  return (
    <div className="rounded-2xl border border-rose/20 bg-rose/5 px-6 py-10 text-center">
      <p className="text-sm font-bold text-rose">{message}</p>
      <button
        onClick={onRetry}
        className="mt-4 rounded-xl bg-brand px-4 py-2 text-xs font-black text-cream"
      >
        إعادة المحاولة
      </button>
    </div>
  )
}

function SectionHeader({
  title,
  count,
  search,
  onSearch,
}: {
  title: string
  count: number
  search: string
  onSearch: (v: string) => void
}) {
  return (
    <div className="mb-6 flex flex-wrap items-center gap-4">
      <div className="flex-1">
        <h2 className="text-2xl font-black text-ink">{title}</h2>
        <p className="mt-0.5 text-sm text-ink/50">
          {count.toLocaleString("ar-EG")} إجمالي
        </p>
      </div>
      <label className="flex items-center gap-2 rounded-xl border border-line bg-white px-3 py-2.5 text-sm text-ink/60 focus-within:border-brand focus-within:ring-2 focus-within:ring-brand/10">
        <Search size={15} />
        <input
          value={search}
          onChange={(e) => onSearch(e.target.value)}
          placeholder="بحث..."
          className="w-44 bg-transparent outline-none placeholder:text-ink/40"
        />
      </label>
    </div>
  )
}

function useAsync<T>(fn: () => Promise<T>, deps: unknown[] = []) {
  const [data, setData] = useState<T | null>(null)

  const [loading, setLoading] = useState(true)

  const [error, setError] = useState("")

  const run = () => {
    setLoading(true)

    setError("")

    fn()
      .then(setData)
      .catch((e) => setError(friendlyError(e)))
      .finally(() => setLoading(false))
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps

  useEffect(run, deps)

  return { data, loading, error, reload: run }
}

// ── Overview ──────────────────────────────────────────────────────────────────

function Overview({ onNav }: { onNav: (tab: Tab) => void }) {
  const {
    data: stats,
    loading,
    error,
    reload,
  } = useAsync(() => getAdminStats())

  const { data: bookingsPage } = useAsync(() => listAdminBookings({ limit: 4 }))

  const { data: reportsPage } = useAsync(() =>
    listAdminReports({ status: "pending", limit: 4 }),
  )

  const { data: usersPage } = useAsync(() => listAdminUsers({ limit: 4 }))

  const metrics = stats
    ? [
        {
          label: "إجمالي المستخدمين",
          value: stats.totalUsers.toLocaleString("ar-EG"),
          delta: `${stats.usersDelta > 0 ? "+" : ""}${stats.usersDelta}٪`,
          up: stats.usersDelta >= 0,
          icon: Users,
          color: "bg-brand-soft text-brand",
          tab: "users" as Tab,
        },

        {
          label: "الإعلانات النشطة",
          value: stats.activeListings.toLocaleString("ar-EG"),
          delta: `${stats.listingsDelta > 0 ? "+" : ""}${stats.listingsDelta}٪`,
          up: stats.listingsDelta >= 0,
          icon: Package,
          color: "bg-green/10 text-green",
          tab: "listings" as Tab,
        },

        {
          label: "حجوزات الشهر",
          value: stats.bookingsThisMonth.toLocaleString("ar-EG"),
          delta: `${stats.bookingsDelta > 0 ? "+" : ""}${stats.bookingsDelta}٪`,
          up: stats.bookingsDelta >= 0,
          icon: CalendarCheck,
          color: "bg-amber/15 text-[#b53d13]",
          tab: "bookings" as Tab,
        },

        {
          label: "الإيرادات (ج.م)",
          value: stats.revenueThisMonth.toLocaleString("ar-EG"),
          delta: `${stats.revenueDelta > 0 ? "+" : ""}${stats.revenueDelta}٪`,
          up: stats.revenueDelta >= 0,
          icon: CircleDollarSign,
          color: "bg-brand-soft text-brand",
          tab: "overview" as Tab,
        },
      ]
    : []

  if (error) return <ErrorMsg message={error} onRetry={reload} />

  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs font-black tracking-[.13em] text-brand">
          لوحة التحكم
        </p>
        <h1 className="mt-1 text-3xl font-black text-ink">مرحبًا، أدمن 👋</h1>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {loading
          ? Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="h-32 animate-pulse rounded-[1.4rem] border border-line bg-white"
              />
            ))
          : metrics.map((m) => (
              <button
                key={m.label}
                onClick={() => onNav(m.tab)}
                className="group rounded-[1.4rem] border border-line bg-white p-5 text-right shadow-sm transition hover:border-brand/30 hover:shadow-[0_14px_32px_-22px_rgba(7,92,61,.2)]"
              >
                <div className="flex items-start justify-between">
                  <span
                    className={`grid h-10 w-10 place-items-center rounded-2xl ${m.color}`}
                  >
                    <m.icon size={18} />
                  </span>
                  <span
                    className={`flex items-center gap-1 text-xs font-bold ${
                      m.up ? "text-green" : "text-rose"
                    }`}
                  >
                    {m.up ? (
                      <ArrowUpRight size={14} />
                    ) : (
                      <ArrowDownRight size={14} />
                    )}
                    {m.delta}
                  </span>
                </div>
                <p className="mt-5 text-2xl font-black text-ink">{m.value}</p>
                <p className="mt-1 text-sm text-ink/55">{m.label}</p>
              </button>
            ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        <div className="rounded-[1.4rem] border border-line bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-line px-6 py-4">
            <h2 className="font-black text-ink">آخر الحجوزات</h2>
            <button
              onClick={() => onNav("bookings")}
              className="text-xs font-bold text-brand hover:underline"
            >
              عرض الكل
            </button>
          </div>
          {!bookingsPage ? (
            <Spinner />
          ) : (
            <div className="divide-y divide-line/60">
              {bookingsPage.items.map((b) => (
                <div key={b.id} className="flex items-center gap-4 px-6 py-3.5">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold text-ink">
                      {b.listingName}
                    </p>
                    <p className="mt-0.5 text-xs text-ink/50">
                      {b.renterName} ← {b.ownerName}
                    </p>
                  </div>
                  <p className="shrink-0 text-sm font-black text-brand">
                    {b.total.toLocaleString("ar-EG")} ج.م
                  </p>
                  <Badge
                    label={BOOKING_STATUS_AR[b.status] ?? b.status}
                    style={BOOKING_STATUS[b.status] ?? ""}
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-[1.4rem] border border-line bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-line px-6 py-4">
            <h2 className="font-black text-ink">البلاغات المعلّقة</h2>
            <button
              onClick={() => onNav("reports")}
              className="text-xs font-bold text-brand hover:underline"
            >
              عرض الكل
            </button>
          </div>
          {!reportsPage ? (
            <Spinner />
          ) : (
            <div className="divide-y divide-line/60">
              {reportsPage.items.length === 0 && (
                <p className="py-8 text-center text-xs text-ink/40">
                  لا توجد بلاغات معلّقة
                </p>
              )}
              {reportsPage.items.map((r) => (
                <div key={r.id} className="flex items-start gap-3 px-6 py-3.5">
                  <span className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-full bg-amber/15 text-[#b53d13]">
                    <AlertTriangle size={14} />
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-ink">
                      {r.targetName}
                    </p>
                    <p className="mt-0.5 truncate text-xs text-ink/50">
                      {r.reason}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="rounded-[1.4rem] border border-line bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-line px-6 py-4">
          <h2 className="font-black text-ink">أحدث المستخدمين</h2>
          <button
            onClick={() => onNav("users")}
            className="text-xs font-bold text-brand hover:underline"
          >
            عرض الكل
          </button>
        </div>
        {!usersPage ? (
          <Spinner />
        ) : (
          <div className="divide-y divide-line/60">
            {usersPage.items.map((u) => (
              <div key={u.id} className="flex items-center gap-4 px-6 py-3.5">
                <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-brand text-sm font-black text-cream">
                  {u.avatar}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-bold text-ink">{u.name}</p>
                    {u.verified && (
                      <BadgeCheck size={14} className="text-brand" />
                    )}
                  </div>
                  <p className="mt-0.5 text-xs text-ink/50">
                    {cityText(u.city)} · {u.phone}
                  </p>
                </div>
                <Badge
                  label={USER_STATUS_AR[u.status] ?? u.status}
                  style={USER_STATUS[u.status] ?? ""}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// ── Users ─────────────────────────────────────────────────────────────────────

function UsersTab() {
  const [search, setSearch] = useState("")

  const { data, loading, error, reload } = useAsync(
    () => listAdminUsers({ search }),
    [search],
  )

  const [busy, setBusy] = useState<string | null>(null)

  const toggle = async (u: AdminUser) => {
    setBusy(u.id)

    try {
      u.status === "active" ? await suspendUser(u.id) : await activateUser(u.id)

      reload()
    } finally {
      setBusy(null)
    }
  }

  const remove = async (id: string) => {
    setBusy(id)

    try {
      await deleteUser(id)
      reload()
    } finally {
      setBusy(null)
    }
  }

  const users = data?.items ?? []

  return (
    <div>
      <SectionHeader
        title="إدارة المستخدمين"
        count={data?.total ?? 0}
        search={search}
        onSearch={setSearch}
      />
      {loading ? (
        <Spinner />
      ) : error ? (
        <ErrorMsg message={error} onRetry={reload} />
      ) : (
        <div className="overflow-hidden rounded-[1.4rem] border border-line bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px] text-right text-sm">
              <thead>
                <tr className="border-b border-line bg-cream/60 text-xs font-black tracking-wide text-ink/50">
                  <th className="px-5 py-3.5">المستخدم</th>
                  <th className="px-5 py-3.5">الجوال</th>
                  <th className="px-5 py-3.5">المدينة</th>
                  <th className="px-5 py-3.5">الإعلانات</th>
                  <th className="px-5 py-3.5">تاريخ الانضمام</th>
                  <th className="px-5 py-3.5">الحالة</th>
                  <th className="px-5 py-3.5">إجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line/50">
                {users.map((u) => (
                  <tr key={u.id} className="transition hover:bg-cream/40">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-brand text-sm font-black text-cream">
                          {u.avatar}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5 font-bold text-ink">
                            {u.name}
                            {u.verified && (
                              <BadgeCheck size={13} className="text-brand" />
                            )}
                          </div>
                          <p className="text-[11px] text-ink/45">#{u.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-ink/70" dir="ltr">
                      {u.phone}
                    </td>
                    <td className="px-5 py-4 text-ink/70">{cityText(u.city)}</td>
                    <td className="px-5 py-4 font-bold text-brand">
                      {u.listingCount}
                    </td>
                    <td className="px-5 py-4 text-xs text-ink/55">
                      {u.joinedAt}
                    </td>
                    <td className="px-5 py-4">
                      <Badge
                        label={USER_STATUS_AR[u.status] ?? u.status}
                        style={USER_STATUS[u.status] ?? ""}
                      />
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1">
                        <ActionBtn icon={Eye} label="عرض" />
                        <ActionBtn
                          disabled={busy === u.id}
                          icon={u.status === "active" ? XCircle : CheckCircle2}
                          label={u.status === "active" ? "إيقاف" : "تفعيل"}
                          onClick={() => toggle(u)}
                        />
                        <ActionBtn
                          disabled={busy === u.id}
                          icon={Trash2}
                          label="حذف"
                          danger
                          onClick={() => remove(u.id)}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {users.length === 0 && (
              <p className="py-12 text-center text-sm text-ink/40">
                لا توجد نتائج مطابقة
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

// ── Listings ──────────────────────────────────────────────────────────────────

function ListingsTab() {
  const [search, setSearch] = useState("")

  const { data, loading, error, reload } = useAsync(
    () => listAdminListings({ search }),
    [search],
  )

  const [busy, setBusy] = useState<string | null>(null)

  const approve = async (id: string) => {
    setBusy(id)
    try {
      await approveListing(id)
      reload()
    } finally {
      setBusy(null)
    }
  }

  const reject = async (id: string) => {
    setBusy(id)
    try {
      await rejectListing(id)
      reload()
    } finally {
      setBusy(null)
    }
  }

  const remove = async (id: string) => {
    setBusy(id)
    try {
      await deleteListing(id)
      reload()
    } finally {
      setBusy(null)
    }
  }

  const listings = data?.items ?? []

  return (
    <div>
      <SectionHeader
        title="إدارة الإعلانات"
        count={data?.total ?? 0}
        search={search}
        onSearch={setSearch}
      />
      {loading ? (
        <Spinner />
      ) : error ? (
        <ErrorMsg message={error} onRetry={reload} />
      ) : (
        <div className="overflow-hidden rounded-[1.4rem] border border-line bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[780px] text-right text-sm">
              <thead>
                <tr className="border-b border-line bg-cream/60 text-xs font-black tracking-wide text-ink/50">
                  <th className="px-5 py-3.5">الإعلان</th>
                  <th className="px-5 py-3.5">الفئة</th>
                  <th className="px-5 py-3.5">المالك</th>
                  <th className="px-5 py-3.5">السعر / يوم</th>
                  <th className="px-5 py-3.5">التقييم</th>
                  <th className="px-5 py-3.5">تاريخ الإضافة</th>
                  <th className="px-5 py-3.5">الحالة</th>
                  <th className="px-5 py-3.5">إجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line/50">
                {listings.map((l) => (
                  <tr key={l.id} className="transition hover:bg-cream/40">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <img
                          src={l.image}
                          alt={l.name}
                          className="h-10 w-14 shrink-0 rounded-xl bg-brand-soft object-cover"
                        />
                        <span className="font-bold text-ink">{l.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-ink/65">{l.category}</td>
                    <td className="px-5 py-3.5 text-ink/65">{l.owner}</td>
                    <td className="px-5 py-3.5 font-bold text-brand">
                      {l.price.toLocaleString("ar-EG")} ج.م
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="flex items-center gap-1 text-xs font-bold text-ink/70">
                        <Star size={12} className="fill-amber text-amber" />
                        {l.rating}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-xs text-ink/55">
                      {l.createdAt}
                    </td>
                    <td className="px-5 py-3.5">
                      <Badge
                        label={LISTING_STATUS_AR[l.status] ?? l.status}
                        style={LISTING_STATUS[l.status] ?? ""}
                      />
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-1">
                        <ActionBtn icon={Eye} label="عرض" />
                        {l.status !== "active" && (
                          <ActionBtn
                            disabled={busy === l.id}
                            icon={CheckCircle2}
                            label="قبول"
                            onClick={() => approve(l.id)}
                          />
                        )}
                        {l.status === "active" && (
                          <ActionBtn
                            disabled={busy === l.id}
                            icon={XCircle}
                            label="رفض"
                            onClick={() => reject(l.id)}
                          />
                        )}
                        <ActionBtn
                          disabled={busy === l.id}
                          icon={Trash2}
                          label="حذف"
                          danger
                          onClick={() => remove(l.id)}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {listings.length === 0 && (
              <p className="py-12 text-center text-sm text-ink/40">
                لا توجد نتائج مطابقة
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

// ── Bookings ──────────────────────────────────────────────────────────────────

function BookingsTab() {
  const [search, setSearch] = useState("")

  const { data, loading, error, reload } = useAsync(
    () => listAdminBookings({ search }),
    [search],
  )

  const bookings = data?.items ?? []

  return (
    <div>
      <SectionHeader
        title="الحجوزات"
        count={data?.total ?? 0}
        search={search}
        onSearch={setSearch}
      />
      {loading ? (
        <Spinner />
      ) : error ? (
        <ErrorMsg message={error} onRetry={reload} />
      ) : (
        <div className="overflow-hidden rounded-[1.4rem] border border-line bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px] text-right text-sm">
              <thead>
                <tr className="border-b border-line bg-cream/60 text-xs font-black tracking-wide text-ink/50">
                  <th className="px-5 py-3.5">الإعلان</th>
                  <th className="px-5 py-3.5">المستأجر</th>
                  <th className="px-5 py-3.5">المالك</th>
                  <th className="px-5 py-3.5">الفترة</th>
                  <th className="px-5 py-3.5">الإجمالي</th>
                  <th className="px-5 py-3.5">الحالة</th>
                  <th className="px-5 py-3.5">إجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line/50">
                {bookings.map((b) => (
                  <tr key={b.id} className="transition hover:bg-cream/40">
                    <td className="px-5 py-4 font-bold text-ink">
                      {b.listingName}
                    </td>
                    <td className="px-5 py-4 text-ink/70">{b.renterName}</td>
                    <td className="px-5 py-4 text-ink/70">{b.ownerName}</td>
                    <td className="px-5 py-4 text-xs text-ink/60">
                      {b.startDate} — {b.endDate}
                    </td>
                    <td className="px-5 py-4 font-black text-brand">
                      {b.total.toLocaleString("ar-EG")} ج.م
                    </td>
                    <td className="px-5 py-4">
                      <Badge
                        label={BOOKING_STATUS_AR[b.status] ?? b.status}
                        style={BOOKING_STATUS[b.status] ?? ""}
                      />
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1">
                        <ActionBtn icon={Eye} label="عرض" />
                        <ActionBtn icon={MoreHorizontal} label="المزيد" />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {bookings.length === 0 && (
              <p className="py-12 text-center text-sm text-ink/40">
                لا توجد نتائج مطابقة
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

// ── Reports ───────────────────────────────────────────────────────────────────

function ReportsTab() {
  const [search, setSearch] = useState("")

  const { data, loading, error, reload } = useAsync(
    () => listAdminReports(),
    [],
  )

  const [busy, setBusy] = useState<string | null>(null)

  const resolve = async (id: string) => {
    setBusy(id)
    try {
      await resolveReport(id)
      reload()
    } finally {
      setBusy(null)
    }
  }

  const remove = async (id: string) => {
    setBusy(id)
    try {
      await deleteReport(id)
      reload()
    } finally {
      setBusy(null)
    }
  }

  const reports = (data?.items ?? []).filter(
    (r: AdminReport) =>
      !search ||
      r.targetName.includes(search) ||
      r.reporterName.includes(search) ||
      r.reason.includes(search),
  )

  return (
    <div>
      <SectionHeader
        title="البلاغات"
        count={data?.total ?? 0}
        search={search}
        onSearch={setSearch}
      />
      {loading ? (
        <Spinner />
      ) : error ? (
        <ErrorMsg message={error} onRetry={reload} />
      ) : (
        <div className="space-y-4">
          {reports.map((r) => (
            <div
              key={r.id}
              className="rounded-[1.4rem] border border-line bg-white p-5 shadow-sm transition hover:border-brand/25"
            >
              <div className="flex flex-wrap items-start gap-4">
                <span
                  className={`grid h-10 w-10 shrink-0 place-items-center rounded-2xl ${
                    r.status === "pending"
                      ? "bg-amber/15 text-[#b53d13]"
                      : "bg-brand-soft text-brand"
                  }`}
                >
                  <Flag size={17} />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-black tracking-wide text-ink/40">
                      {r.type === "listing" ? "إعلان" : "مستخدم"}
                    </span>
                    <span className="font-black text-ink">{r.targetName}</span>
                    <Badge
                      label={REPORT_STATUS_AR[r.status] ?? r.status}
                      style={REPORT_STATUS[r.status] ?? ""}
                    />
                  </div>
                  <p className="mt-2 text-sm leading-6 text-ink/65">
                    {r.reason}
                  </p>
                  <p className="mt-2 text-xs text-ink/40">
                    بلّغ:{" "}
                    <span className="font-bold text-ink/60">
                      {r.reporterName}
                    </span>{" "}
                    · {r.reportedAt}
                  </p>
                </div>
                <div className="flex shrink-0 gap-2">
                  {r.status === "pending" && (
                    <button
                      disabled={busy === r.id}
                      onClick={() => resolve(r.id)}
                      className="flex items-center gap-1.5 rounded-xl bg-brand px-4 py-2 text-xs font-black text-cream hover:bg-[#064b32] disabled:opacity-50"
                    >
                      <CheckCircle2 size={14} /> معالجة
                    </button>
                  )}
                  <ActionBtn
                    icon={Trash2}
                    label="حذف"
                    danger
                    disabled={busy === r.id}
                    onClick={() => remove(r.id)}
                  />
                </div>
              </div>
            </div>
          ))}
          {reports.length === 0 && (
            <div className="rounded-[1.4rem] border border-dashed border-line bg-white py-20 text-center">
              <ShieldCheck className="mx-auto text-brand" size={36} />
              <p className="mt-4 text-sm font-bold text-ink/50">
                لا توجد بلاغات
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ── Layout ────────────────────────────────────────────────────────────────────

const NAV: { id: Tab label: string icon: typeof LayoutDashboard }[] = [
  { id: "overview", label: "نظرة عامة", icon: LayoutDashboard },

  { id: "users", label: "المستخدمون", icon: Users },

  { id: "listings", label: "الإعلانات", icon: Package },

  { id: "bookings", label: "الحجوزات", icon: CalendarCheck },

  { id: "reports", label: "البلاغات", icon: Flag },
]

function Flag({ size, className }: { size: number className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
      <line x1="4" x2="4" y1="22" y2="15" />
    </svg>
  )
}

export default function Admin() {
  const [tab, setTab] = useState<Tab>("overview")

  const [sidebarOpen, setSidebarOpen] = useState(false)

  const { data: reportsPage } = useAsync(() =>
    listAdminReports({ status: "pending" }),
  )

  const pendingReports = reportsPage?.total ?? 0

  const SidebarContent = () => (
    <>
      <div className="flex items-center gap-3 border-b border-white/10 px-6 py-5">
        <span className="grid h-9 w-9 place-items-center rounded-xl bg-white/15 text-cream">
          <ShieldCheck size={18} />
        </span>
        <div>
          <p className="text-xs font-black tracking-[.12em] text-cream/60">
            سيركل
          </p>
          <p className="text-sm font-black">لوحة الإدارة</p>
        </div>
      </div>
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <ul className="space-y-1">
          {NAV.map((n) => (
            <li key={n.id}>
              <button
                onClick={() => {
                  setTab(n.id)
                  setSidebarOpen(false)
                }}
                className={`flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-bold transition ${
                  tab === n.id
                    ? "bg-white/15 text-cream"
                    : "text-cream/60 hover:bg-white/8 hover:text-cream"
                }`}
              >
                <n.icon size={17} />
                <span className="flex-1 text-right">{n.label}</span>
                {n.id === "reports" && pendingReports > 0 && (
                  <span className="grid h-5 min-w-5 place-items-center rounded-full bg-rose px-1 text-[10px] font-black text-white">
                    {pendingReports}
                  </span>
                )}
              </button>
            </li>
          ))}
        </ul>
      </nav>
      <div className="border-t border-white/10 px-3 py-4">
        <Link
          to="/"
          className="flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-bold text-cream/60 transition hover:bg-white/8 hover:text-cream"
        >
          <ChevronLeft size={17} />
          <span>العودة للموقع</span>
        </Link>
        <button className="mt-1 flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-bold text-rose/80 transition hover:bg-rose/10 hover:text-rose">
          <LogOut size={17} />
          <span>تسجيل الخروج</span>
        </button>
      </div>
    </>
  )

  return (
    <div dir="rtl" lang="ar" className="flex min-h-screen bg-[#f5f3ef]">
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col bg-brand text-cream lg:flex">
        <SidebarContent />
      </aside>

      {sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div
            className="absolute inset-0 bg-ink/40"
            onClick={() => setSidebarOpen(false)}
          />
          <aside className="absolute inset-y-0 right-0 flex w-64 flex-col bg-brand text-cream">
            <SidebarContent />
          </aside>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex items-center justify-between border-b border-line bg-white/80 px-5 py-4 backdrop-blur-sm lg:px-8">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="grid h-9 w-9 place-items-center rounded-xl text-ink/60 hover:bg-brand-soft lg:hidden"
            >
              <Menu size={19} />
            </button>
            <div>
              <p className="font-black text-ink">
                {NAV.find((n) => n.id === tab)?.label}
              </p>
              <p className="text-xs text-ink/45">١٢ سبتمبر ٢٠٢٦</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {pendingReports > 0 && (
              <button
                onClick={() => setTab("reports")}
                className="flex items-center gap-2 rounded-xl bg-amber/15 px-3 py-2 text-xs font-bold text-[#b53d13] transition hover:bg-amber/25"
              >
                <AlertTriangle size={14} />
                {pendingReports} بلاغ معلّق
              </button>
            )}
            <div className="grid h-9 w-9 place-items-center rounded-full bg-brand text-sm font-black text-cream">
              أ
            </div>
          </div>
        </header>

        <main className="flex-1 px-5 py-7 lg:px-8 lg:py-8">
          {tab === "overview" && <Overview onNav={setTab} />}
          {tab === "users" && <UsersTab />}
          {tab === "listings" && <ListingsTab />}
          {tab === "bookings" && <BookingsTab />}
          {tab === "reports" && <ReportsTab />}
        </main>
      </div>
    </div>
  )
}
