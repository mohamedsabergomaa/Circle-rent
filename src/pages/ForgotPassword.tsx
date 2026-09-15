import { useState, type FormEvent } from "react"
import { Link } from "react-router"
import { CheckCircle2, KeyRound, LoaderCircle, Mail } from "lucide-react"
import AuthLayout, { SubmitButton, TextField } from "./AuthLayout"
import { requestPasswordReset, resetPassword } from "../services/auth"
import { ApiError, friendlyError } from "../lib/api"

type Step = "email" | "code"

export default function ForgotPassword() {
  const [step, setStep] = useState<Step>("email")
  const [email, setEmail] = useState("")
  const [code, setCode] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [resent, setResent] = useState(false)
  const [done, setDone] = useState(false)

  const sendCode = async (): Promise<void> => {
    setLoading(true)
    setError("")
    try {
      await requestPasswordReset(email)
      setResent(false)
    } catch (err) {
      if (err instanceof ApiError && err.status === 404)
        setError("لم نعثر على حساب مرتبط بهذا البريد الإلكتروني.")
      else if (err instanceof ApiError && err.message) setError(err.message)
      else setError(friendlyError(err, "تعذّر إرسال رمز التحقق، حاول مرة أخرى."))
      throw err
    } finally {
      setLoading(false)
    }
  }

  const handleEmail = async (event: FormEvent) => {
    event.preventDefault()
    if (!email.includes("@")) {
      setError("أدخل بريدًا إلكترونيًا صالحًا.")
      return
    }
    try {
      await sendCode()
      setCode("")
      setPassword("")
      setStep("code")
    } catch {
      /* error already shown */
    }
  }

  const handleResend = async (event?: FormEvent) => {
    event?.preventDefault()
    if (loading) return
    try {
      await sendCode()
      setResent(true)
    } catch {
      /* error already shown */
    }
  }

  const handleReset = async (event: FormEvent) => {
    event.preventDefault()
    if (code.trim().length < 4) {
      setError("أدخل رمز التحقق المُرسل إلى بريدك الإلكتروني.")
      return
    }
    if (password.length < 8) {
      setError("كلمة المرور الجديدة يجب أن تكون ٨ أحرف على الأقل.")
      return
    }
    setLoading(true)
    setError("")
    try {
      await resetPassword(email, code.trim(), password)
      setDone(true)
    } catch (err) {
      if (err instanceof ApiError && err.status === 404)
        setError("الرمز غير صحيح أو انتهت صلاحيته. اطلب رمزًا جديدًا.")
      else if (err instanceof ApiError && err.message) setError(err.message)
      else setError(friendlyError(err, "تعذّر إعادة تعيين كلمة المرور."))
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout
      variant="signin"
      eyebrow="استعادة الوصول"
      title={done ? "تم تحديث كلمة المرور" : step === "code" ? "أدخل الرمز" : "نسيت كلمة المرور؟"}
      subtitle={
        done
          ? "يمكنك الآن تسجيل الدخول بكلمة المرور الجديدة."
          : step === "code"
            ? "أدخل الرمز الذي أرسلناه إلى بريدك، ثم اختر كلمة مرور جديدة."
            : "أدخل بريدك الإلكتروني وسنرسل لك رمزًا لإعادة تعيين كلمة المرور."
      }
      footer={
        <Link to="/login" className="font-black text-brand hover:underline">
          تذكّرت بياناتك؟ سجّل الدخول
        </Link>
      }
    >
      {done ? (
        <div className="rounded-3xl border border-green/25 bg-green/5 p-6 text-center">
          <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-green/10 text-green">
            <CheckCircle2 size={26} />
          </div>
          <h2 className="mt-5 text-xl font-black text-ink">كلمة المرور جاهزة</h2>
          <Link
            to="/login"
            className="mt-6 inline-flex h-11 items-center justify-center rounded-2xl bg-brand px-6 text-sm font-black text-cream hover:bg-[#064b32]"
          >
            تسجيل الدخول
          </Link>
        </div>
      ) : step === "email" ? (
        <form onSubmit={handleEmail} className="space-y-6">
          <div className="flex items-start gap-3 rounded-2xl border border-brand/20 bg-brand-soft/50 p-4">
            <Mail size={20} className="mt-0.5 shrink-0 text-brand" />
            <p className="text-xs leading-6 text-ink/65">
              سنرسل رمزًا إلى البريد الإلكتروني المرتبط بحسابك.
            </p>
          </div>
          <TextField
            label="البريد الإلكتروني"
            value={email}
            onChange={(value) => {
              setEmail(value)
              setError("")
            }}
            type="email"
            autoComplete="email"
            placeholder="name@example.com"
            error={error}
          />
          <SubmitButton loading={loading}>
            {loading ? (
              <>
                <LoaderCircle size={18} className="animate-spin" /> جارٍ الإرسال
              </>
            ) : (
              "إرسال رمز التحقق"
            )}
          </SubmitButton>
        </form>
      ) : (
        <form onSubmit={handleReset} className="space-y-6">
          <div className="flex items-start gap-3 rounded-2xl border border-brand/20 bg-brand-soft/50 p-4">
            <KeyRound size={20} className="mt-0.5 shrink-0 text-brand" />
            <div className="min-w-0 flex-1 text-xs leading-6 text-ink/65">
              <p className="truncate font-bold text-ink">{email}</p>
              <p className="mt-0.5">
                أدخل الرمز المكوّن من ٤ إلى ٨ أرقام ثم كلمة مرور جديدة.
              </p>
            </div>
          </div>
          <TextField
            label="رمز التحقق"
            value={code}
            onChange={(value) => {
              setCode(value.replace(/[^0-9]/g, ""))
              setError("")
            }}
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={8}
            placeholder="000000"
            error={error}
          />
          <TextField
            label="كلمة المرور الجديدة"
            value={password}
            onChange={(value) => {
              setPassword(value)
              setError("")
            }}
            type="password"
            autoComplete="new-password"
            placeholder="٨ أحرف على الأقل"
          />
          <SubmitButton loading={loading}>
            {loading ? (
              <>
                <LoaderCircle size={18} className="animate-spin" /> جارٍ الحفظ
              </>
            ) : (
              "إعادة تعيين كلمة المرور"
            )}
          </SubmitButton>
          <div className="flex items-center justify-between text-sm">
            <button
              type="button"
              onClick={handleResend}
              disabled={loading}
              className="font-bold text-brand transition hover:underline disabled:opacity-50"
            >
              إعادة إرسال الرمز
            </button>
            <button
              type="button"
              onClick={() => {
                setError("")
                setStep("email")
              }}
              disabled={loading}
              className="font-bold text-ink/55 transition hover:text-brand disabled:opacity-50"
            >
              تغيير البريد الإلكتروني
            </button>
          </div>
          {resent && (
            <p className="text-center text-xs font-medium text-green">
              أعدنا إرسال الرمز إلى بريدك الإلكتروني.
            </p>
          )}
        </form>
      )}
    </AuthLayout>
  )
}