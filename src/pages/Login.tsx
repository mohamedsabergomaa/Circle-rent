import { Link, useLocation, useNavigate } from "react-router"
import { useState, type FormEvent } from "react"
import { LoaderCircle } from "lucide-react"
import AuthLayout, { SubmitButton, TextField } from "./AuthLayout"
import { useAuth } from "../context/AuthContext"
import { friendlyError } from "../lib/api"

export default function Login() {
  const navigate = useNavigate()
  const location = useLocation()
  const { signIn } = useAuth()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const redirect = new URLSearchParams(location.search).get("redirect") ?? "/"
  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    if (!email.includes("@")) {
      setError("أدخل بريدًا إلكترونيًا صالحًا.")
      return
    }
    if (password.length < 8) {
      setError("كلمة المرور يجب أن تكون ٨ أحرف على الأقل.")
      return
    }
    setLoading(true)
    setError("")
    try {
      await signIn({ email, password })
      navigate(redirect)
    } catch (err) {
      setError(friendlyError(err, "تعذّر تسجيل الدخول."))
    } finally {
      setLoading(false)
    }
  }
  return (
    <AuthLayout
      variant="signin"
      eyebrow="أهلاً بعودتك"
      title="سجّل دخولك إلى سيركل"
      subtitle="استأجر ما تحتاجه أو أضف ما لديك — كل شيء يبدأ من هنا."
      footer={
        <>
          ليس لديك حساب؟{" "}
          <Link to="/signup" className="font-black text-brand hover:underline">
            أنشئ حسابًا
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <TextField
          label="البريد الإلكتروني"
          value={email}
          onChange={(value) => {
            setEmail(value)
            setError("")
          }}
          type="email"
          placeholder="name@example.com"
          error={error}
        />
        <TextField
          label="كلمة المرور"
          value={password}
          onChange={(value) => {
            setPassword(value)
            setError("")
          }}
          type="password"
          placeholder="كلمة المرور"
          error={error}
        />
        <div className="text-left">
          <Link
            to="/forgot-password"
            className="text-xs font-bold text-brand hover:underline"
          >
            نسيت كلمة المرور؟
          </Link>
        </div>
        <SubmitButton loading={loading}>
          {loading ? (
            <>
              <LoaderCircle size={18} className="animate-spin" /> جارٍ تسجيل
              الدخول
            </>
          ) : (
            "تسجيل الدخول"
          )}
        </SubmitButton>
        <div className="relative py-1 text-center">
          <span className="relative z-10 bg-cream px-3 text-xs text-muted">
            أو
          </span>
          <div className="absolute inset-x-0 top-1/2 border-t border-line" />
        </div>
      </form>
    </AuthLayout>
  )
}
