import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router'
import { LoaderCircle, ShieldCheck } from 'lucide-react'
import AuthLayout, { PhoneField, TextField, SubmitButton } from './AuthLayout'
import { useAuth } from '../context/AuthContext'
import { friendlyError } from '../lib/api'

type Method = 'phone' | 'email'

export default function ForgotPassword() {
  const navigate = useNavigate()
  const { signIn } = useAuth()
  const [method, setMethod] = useState<Method>('phone')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setError('')
    if (method === 'phone') {
      if (phone.length < 9) { setError('أدخل رقم جوال صالحًا.'); return }
      setLoading(true)
      try {
        await signIn({ phoneNumber: `+20${phone}` })
        navigate(`/auth/verify-phone?phone=${encodeURIComponent(`+20${phone}`)}&redirect=/`)
      } catch (err) {
        setError(friendlyError(err, 'تعذّر إرسال رمز التحقق.'))
      } finally {
        setLoading(false)
      }
    } else {
      if (!email.includes('@')) { setError('أدخل بريدًا إلكترونيًا صالحًا.'); return }
      setLoading(true)
      try {
        await signIn({ phoneNumber: email })
        navigate(`/auth/verify-phone?redirect=/`)
      } catch (err) {
        setError(friendlyError(err, 'تعذّر إرسال رابط الاستعادة.'))
      } finally {
        setLoading(false)
      }
    }
  }

  return (
    <AuthLayout
      variant="signin"
      eyebrow="استعادة الوصول"
      title="نسيت كلمة المرور؟"
      subtitle="اختر طريقة التحقق وسنرسل لك رمزًا لإعادة الوصول إلى حسابك."
      footer={<>تذكّرت بياناتك؟ <Link to="/login" className="font-black text-brand hover:underline">سجّل الدخول</Link></>}
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="flex items-start gap-3 rounded-2xl border border-brand/20 bg-brand-soft/50 p-4">
          <ShieldCheck size={20} className="mt-0.5 shrink-0 text-brand" />
          <p className="text-xs leading-6 text-ink/65">
            سنرسل لك رمز تحقق مؤقتًا لإعادة تأكيد هويتك وتسجيل الدخول مجددًا.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2 rounded-2xl border border-line bg-white p-1.5">
          {([['phone', 'رقم الجوال'], ['email', 'البريد الإلكتروني']] as [Method, string][]).map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() => { setMethod(value); setError('') }}
              className={`rounded-xl py-2.5 text-sm font-bold transition ${method === value ? 'bg-brand text-cream shadow-sm' : 'text-ink/55 hover:text-ink'}`}
            >
              {label}
            </button>
          ))}
        </div>

        {method === 'phone'
          ? <PhoneField value={phone} onChange={value => { setPhone(value); setError('') }} error={error} />
          : <TextField label="البريد الإلكتروني" value={email} onChange={value => { setEmail(value); setError('') }} type="email" placeholder="name@example.com" error={error} />
        }

        <SubmitButton loading={loading}>
          {loading
            ? <><LoaderCircle size={18} className="animate-spin" /> جارٍ الإرسال</>
            : method === 'phone' ? 'إرسال رمز التحقق' : 'إرسال رابط الاستعادة'}
        </SubmitButton>
      </form>
    </AuthLayout>
  )
}
