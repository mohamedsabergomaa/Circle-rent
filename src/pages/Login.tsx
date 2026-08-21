import { Link, useLocation, useNavigate } from 'react-router'
import { useState, type FormEvent } from 'react'
import { LoaderCircle } from 'lucide-react'
import AuthLayout, { PhoneField, SubmitButton } from './AuthLayout'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const navigate = useNavigate(); const location = useLocation(); const { signIn } = useAuth()
  const [phone, setPhone] = useState(''); const [error, setError] = useState(''); const [loading, setLoading] = useState(false)
  const redirect = new URLSearchParams(location.search).get('redirect') ?? '/'
  const fullPhone = `+20${phone}`
  const handleSubmit = async (event: FormEvent) => { event.preventDefault(); if (phone.length < 9) { setError('أدخل رقم جوال صالحًا.'); return }; setLoading(true); setError(''); try { await signIn({ phoneNumber: fullPhone }); navigate(`/auth/verify-phone?phone=${encodeURIComponent(fullPhone)}&redirect=${encodeURIComponent(redirect)}`) } catch (err) { setError(err instanceof Error ? err.message : 'تعذّر تسجيل الدخول.') } finally { setLoading(false) } }
  return <AuthLayout variant="signin" eyebrow="أهلاً بعودتك" title="سجّل دخولك إلى سيركل" subtitle="استأجر ما تحتاجه أو أضف ما لديك — كل شيء يبدأ من هنا." footer={<>ليس لديك حساب؟ <Link to="/signup" className="font-black text-brand hover:underline">أنشئ حسابًا</Link></>}><form onSubmit={handleSubmit} className="space-y-6"><PhoneField value={phone} onChange={value => { setPhone(value); setError('') }} error={error} /><SubmitButton loading={loading}>{loading ? <><LoaderCircle size={18} className="animate-spin" /> جارٍ المتابعة</> : 'متابعة'}</SubmitButton><div className="relative py-1 text-center"><span className="relative z-10 bg-cream px-3 text-xs text-muted">أو</span><div className="absolute inset-x-0 top-1/2 border-t border-line" /></div><p className="rounded-2xl bg-brand-soft/65 p-3 text-center text-xs leading-5 text-ink/60">استخدم رقم الجوال الذي أنشأت به حسابك. ستنتقل إلى خطوة التحقق عند الحاجة.</p></form></AuthLayout>
}
