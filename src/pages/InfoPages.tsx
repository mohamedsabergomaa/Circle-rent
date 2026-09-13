import { useState } from 'react'
import { Link } from 'react-router'
import { Footer, Header } from '../App'
import { AlertTriangle, ArrowLeft, BadgeCheck, ChevronDown, CircleHelp, FileText, HeartHandshake, Info, Mail, MapPin, MessageCircle, Phone, Search, Send, Shield, ShieldCheck, Sparkles, Star, WalletCards } from 'lucide-react'

const pageCopy = {
  about: {
    eyebrow: 'عن سيركل',
    title: 'الأشياء تستحق حياة أطول.',
    description: 'سيركل مساحة محلية بسيطة تجعل الوصول إلى ما تحتاجه أسهل، وتمكّن ما تملكه من خدمة شخص آخر.',
  },
  contact: {
    eyebrow: 'تواصل معنا',
    title: 'كيف يمكننا مساعدتك؟',
    description: 'أرسل لنا رسالتك، وسنعود إليك عند ربط فريق الدعم ونظام التواصل.',
  },
}

function PageShell({ children }: { children: React.ReactNode }) {
  return <div dir="rtl" lang="ar" className="min-h-screen bg-cream"><Header />{children}<Footer /></div>
}

function Intro({ eyebrow, title, description, children }: { eyebrow: string, title: string, description: string, children?: React.ReactNode }) {
  return <section className="border-b border-line bg-brand text-cream"><div className="mx-auto grid max-w-6xl gap-8 px-5 py-16 sm:py-20 lg:grid-cols-[1.2fr_.8fr] lg:items-end"><div><p className="text-xs font-bold tracking-[.16em] text-amber">{eyebrow}</p><h1 className="mt-4 max-w-2xl text-4xl font-black leading-[1.2] sm:text-5xl">{title}</h1><p className="mt-5 max-w-xl text-base leading-8 text-cream/75">{description}</p></div>{children && <div className="rounded-3xl border border-white/15 bg-white/10 p-6 text-sm leading-7 text-cream/80">{children}</div>}</div></section>
}

export default function AboutPage() {
  return <PageShell><Intro {...pageCopy.about}><span className="text-amber">رؤيتنا</span><br />أن يصبح التأجير بين الأفراد اختيارًا طبيعيًا، موثوقًا، ومحليًا في كل مدينة.</Intro><main className="mx-auto max-w-6xl px-5 py-16 sm:py-20"><section className="grid gap-10 lg:grid-cols-[.85fr_1.15fr]"><div><p className="text-xs font-bold tracking-[.16em] text-rose">لماذا سيركل؟</p><h2 className="mt-3 text-3xl font-black leading-tight text-ink">لأن الامتلاك ليس دائمًا هو الحل.</h2></div><div className="space-y-5 text-base leading-8 text-ink/70"><p>نؤمن بأن الأدوات والكاميرات والمنتجات التي نحتاجها لفترة قصيرة يجب أن تكون سهلة الوصول، دون تكلفة شراء كبيرة أو هدر في الموارد.</p><p>نبني سيركل حول الثقة: تجربة واضحة للمالك، وخيارات مرنة للمستأجر، ومجتمع يعرف أن المشاركة الأفضل تبدأ بالقرب منا.</p></div></section><section className="mt-16 grid gap-4 md:grid-cols-3">{[[HeartHandshake, 'مشاركة أذكى', 'استخدم ما تحتاجه فقط، واترك ما لا تستخدمه يخلق قيمة لغيرك.'], [ShieldCheck, 'ثقة أولًا', 'خطوات واضحة للتحقق والحجز والتواصل بين أطراف التأجير.'], [Sparkles, 'بسيط ومحلي', 'ابحث في مدينتك وتواصل مباشرةً عبر تجربة عربية مصممة بعناية.']].map(([Icon, title, text]) => { const IconComponent = Icon as typeof HeartHandshake; return <article key={String(title)} className="rounded-3xl border border-line bg-white p-6 shadow-sm"><span className="grid h-11 w-11 place-items-center rounded-2xl bg-brand-soft text-brand"><IconComponent size={21} /></span><h3 className="mt-6 text-lg font-bold text-ink">{String(title)}</h3><p className="mt-2 text-sm leading-6 text-ink/60">{String(text)}</p></article> })}</section><section className="mt-16 rounded-3xl bg-amber/15 p-7 sm:p-10"><p className="text-xs font-bold tracking-[.15em] text-[#b53d13]">ما الذي نبنيه الآن؟</p><h2 className="mt-3 max-w-2xl text-2xl font-black leading-tight text-ink sm:text-3xl">منصة تجعل التأجير أسهل للطرفين، خطوة بخطوة.</h2><p className="mt-4 max-w-2xl text-sm leading-7 text-ink/65">هذه الصفحة جاهزة لتحديث القصة والأرقام والفريق من مصدر المحتوى الذي ستربطونه لاحقًا.</p></section></main></PageShell>
}

export function HowItWorksPage() {
  const steps = [[Search, 'ابحث عمّا تحتاجه', 'اكتشف المنتجات القريبة منك، وقارن السعر والتقييم والتوافر.'], [MessageCircle, 'أرسل طلب الإيجار', 'اختر التاريخ المناسب وأرسل طلبك بوضوح إلى صاحب المنتج.'], [BadgeCheck, 'استلم واستخدم بثقة', 'نسّق الاستلام أو التوصيل، وأعد المنتج في الموعد المتفق عليه.'], [WalletCards, 'أكمل التجربة', 'أكد الإرجاع، وقيّم التجربة لتساعد المجتمع على الاختيار.']]
  return <PageShell><Intro eyebrow="كيف تعمل سيركل" title="تأجير واضح، من أول بحث حتى الإرجاع." description="صممنا الرحلة لتكون بسيطة للمستأجر، ومجزية لصاحب المنتج."><span className="text-amber">للمستأجر والمالك</span><br />كل خطوة موثقة ومصممة لبناء الثقة بين أفراد المجتمع.</Intro><main className="mx-auto max-w-6xl px-5 py-16 sm:py-20"><div className="grid gap-5 md:grid-cols-2">{steps.map(([Icon, title, text], index) => { const IconComponent = Icon as typeof Search; return <article key={String(title)} className="relative rounded-3xl border border-line bg-white p-7 shadow-sm"><span className="absolute left-6 top-6 text-4xl font-black text-brand-soft">٠{index + 1}</span><span className="grid h-12 w-12 place-items-center rounded-2xl bg-brand text-cream"><IconComponent size={22} /></span><h2 className="mt-8 text-xl font-bold text-ink">{String(title)}</h2><p className="mt-3 max-w-sm text-sm leading-7 text-ink/60">{String(text)}</p></article> })}</div><section className="mt-16 grid gap-5 lg:grid-cols-2"><div className="rounded-3xl bg-brand p-7 text-cream"><p className="text-xs font-bold tracking-[.15em] text-amber">لأصحاب المنتجات</p><h2 className="mt-3 text-2xl font-black">حوّل ما تملك إلى قيمة.</h2><p className="mt-3 text-sm leading-7 text-cream/75">أضف منتجك، خصص الأسعار والتوافر، وأدر الطلبات من لوحة تحكم واحدة.</p><Link to="/signup" className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-amber hover:underline">ابدأ بإضافة منتج <ArrowLeft size={16} /></Link></div><div className="rounded-3xl border border-line bg-white p-7"><p className="text-xs font-bold tracking-[.15em] text-rose">الأمان والثقة</p><h2 className="mt-3 text-2xl font-black text-ink">التحقق جزء من التجربة.</h2><p className="mt-3 text-sm leading-7 text-ink/60">تساعد خطوات التحقق والتقييمات والاتفاقات الواضحة على خلق تجربة أفضل للجميع.</p><Link to="/verification" className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-brand hover:underline">اعرف أكثر عن التحقق <ArrowLeft size={16} /></Link></div></section></main></PageShell>
}

const faqs = [
  ['كيف أستأجر منتجًا؟', 'ابحث عن المنتج، حدّد التواريخ المناسبة، ثم أرسل طلب الإيجار. يراجع المالك الطلب ويؤكده قبل إتمام الحجز.'],
  ['هل أحتاج إلى التحقق من الهوية؟', 'نعم، نطلب التحقق من جميع المستخدمين قبل تفعيل ميزات التأجير وإدارة الإعلانات، بهدف تعزيز الثقة والأمان.'],
  ['كيف أحدد سعر منتجي؟', 'من لوحة التحكم يمكنك وضع سعر يومي، وإضافة أسعار أسبوعية أو شهرية ومبلغ تأمين ورسوم توصيل اختيارية.'],
  ['ماذا يحدث إذا لم يكن المنتج متاحًا؟', 'يظهر التوافر في صفحة المنتج، ويمكن للمالك حظر الأيام غير المناسبة له من لوحة التحكم.'],
  ['كيف أتواصل مع الطرف الآخر؟', 'يوفر سيركل مساحة رسائل مرتبطة بطلب الإيجار لتنسيق التفاصيل قبل الاستلام والإرجاع.'],
  ['كيف تُدار المدفوعات؟', 'ستُعرض تفاصيل المدفوعات والأرباح وسجل العمليات داخل لوحة التحكم عند ربط خدمة الدفع.'],
]

export function FaqPage() {
  const [open, setOpen] = useState<number | null>(0)
  return <PageShell><Intro eyebrow="الأسئلة الشائعة" title="إجابات واضحة قبل أن تبدأ." description="هذه إجابات أولية قابلة للتحديث من مركز المساعدة أو نظام المحتوى لاحقًا." /><main className="mx-auto max-w-3xl px-5 py-16 sm:py-20"><div className="space-y-3">{faqs.map(([question, answer], index) => <article key={question} className="overflow-hidden rounded-2xl border border-line bg-white"><button onClick={() => setOpen(current => current === index ? null : index)} aria-expanded={open === index} className="flex w-full items-center justify-between gap-5 px-5 py-5 text-right"><span className="font-bold text-ink">{question}</span><ChevronDown size={19} className={`shrink-0 text-brand transition-transform ${open === index ? 'rotate-180' : ''}`} /></button>{open === index && <p className="border-t border-line px-5 py-4 text-sm leading-7 text-ink/65">{answer}</p>}</article>)}</div><div className="mt-10 flex flex-col items-center rounded-3xl bg-brand-soft p-7 text-center"><CircleHelp size={26} className="text-brand" /><h2 className="mt-3 text-lg font-bold text-ink">لم تجد إجابتك؟</h2><p className="mt-1 text-sm text-ink/60">فريقنا موجود لمساعدتك عند تفعيل مركز الدعم.</p><Link to="/contact" className="mt-4 rounded-full bg-brand px-5 py-2.5 text-sm font-bold text-cream hover:bg-[#064b32]">تواصل معنا</Link></div></main></PageShell>
}

export function ContactPage() {
  const [sent, setSent] = useState(false)
  return <PageShell><Intro {...pageCopy.contact}><span className="text-amber">قناة التواصل</span><br />نموذج أولي جاهز للربط مع خدمة البريد أو نظام دعم العملاء.</Intro><main className="mx-auto grid max-w-6xl gap-7 px-5 py-16 sm:py-20 lg:grid-cols-[.78fr_1.22fr]"><aside className="space-y-4">{[[Mail, 'البريد الإلكتروني', 'hello@circle.example'], [Phone, 'الهاتف', '+20 100 000 0000'], [MapPin, 'موقعنا', 'القاهرة، مصر']].map(([Icon, label, value]) => { const IconComponent = Icon as typeof Mail; return <div key={String(label)} className="flex gap-3 rounded-2xl border border-line bg-white p-5"><span className="grid h-10 w-10 place-items-center rounded-xl bg-brand-soft text-brand"><IconComponent size={19} /></span><div><p className="text-xs font-bold text-ink/50">{String(label)}</p><p className="mt-1 text-sm font-bold text-ink">{String(value)}</p></div></div>})}<div className="rounded-2xl bg-amber/15 p-5 text-sm leading-7 text-ink/70">للطلبات المرتبطة بحجز حالي، يُفضّل استخدام الرسائل داخل الطلب نفسه حتى تبقى كل التفاصيل موثقة.</div></aside><section className="rounded-3xl border border-line bg-white p-6 shadow-sm sm:p-8"><h2 className="text-2xl font-black text-ink">أرسل رسالة</h2><p className="mt-2 text-sm text-ink/60">سنضيف الربط الفعلي مع البريد أو مركز الدعم لاحقًا.</p>{sent ? <div className="mt-8 rounded-2xl bg-green/10 p-6 text-center"><BadgeCheck size={30} className="mx-auto text-green" /><h3 className="mt-3 font-bold text-ink">تم تجهيز رسالتك</h3><p className="mt-1 text-sm leading-6 text-ink/60">هذه رسالة تجريبية؛ اربط النموذج بخدمة الدعم لإرسالها فعليًا.</p><button onClick={() => setSent(false)} className="mt-4 text-sm font-bold text-brand hover:underline">إرسال رسالة أخرى</button></div> : <form onSubmit={event => { event.preventDefault(); setSent(true) }} className="mt-7 space-y-4"><div className="grid gap-4 sm:grid-cols-2"><Field label="الاسم" placeholder="اسمك الكامل" /><Field label="البريد الإلكتروني" placeholder="name@example.com" type="email" /></div><Field label="الموضوع" placeholder="كيف يمكننا مساعدتك؟" /><label className="block"><span className="mb-1.5 block text-sm font-bold text-ink">الرسالة</span><textarea required rows={5} placeholder="اكتب رسالتك هنا..." className="w-full resize-y rounded-xl border border-line px-4 py-3 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/15" /></label><button className="inline-flex items-center gap-2 rounded-full bg-brand px-6 py-3 text-sm font-bold text-cream hover:bg-[#064b32]"><Send size={17} /> إرسال الرسالة</button></form>}</section></main></PageShell>
}

function Field({ label, placeholder, type = 'text' }: { label: string, placeholder: string, type?: string }) { return <label className="block"><span className="mb-1.5 block text-sm font-bold text-ink">{label}</span><input required type={type} placeholder={placeholder} className="w-full rounded-xl border border-line px-4 py-3 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/15" /></label> }

const policySections = [
  {
    id: 'who-we-are',
    icon: Info,
    color: 'bg-brand-soft text-brand',
    title: 'من نحن ودور المنصة',
    body: [
      'سيركل منصة تربط بين الأفراد الراغبين في تأجير ممتلكاتهم وأولئك الراغبين في الاستئجار. لا تمتلك المنصة أيًا من المنتجات المدرجة، وليست طرفًا في أي عقد إيجار.',
      'يقتصر دور سيركل على نشر الإعلانات، وتيسير التواصل، وتوفير أدوات الثقة والتحقق والتقييم والإبلاغ عن الإساءة. المنصة غير مسؤولة عن تنفيذ اتفاقيات الإيجار أو ضمانها.',
    ],
  },
  {
    id: 'business-model',
    icon: WalletCards,
    color: 'bg-amber/15 text-[#b53d13]',
    title: 'نموذج العمل',
    body: [
      'تعتمد سيركل على الإيرادات من خدمات الإعلانات والترويج. لا تُحصّل المنصة أي عمولة على عمليات التأجير إلا في حال الإعلان عن خدمة مدفوعة منفصلة.',
    ],
  },
  {
    id: 'verification',
    icon: BadgeCheck,
    color: 'bg-green/10 text-green',
    title: 'التحقق من المستخدمين',
    body: [
      'قد تطلب المنصة التحقق عبر البريد الإلكتروني أو الهاتف أو الهوية الوطنية أو العنوان أو وسائل أخرى. التحقق يعزز الثقة لكنه لا يضمن سلوك المستخدم في جميع الأحوال.',
    ],
  },
  {
    id: 'rental-agreement',
    icon: FileText,
    color: 'bg-brand-soft text-brand',
    title: 'اتفاقية التأجير والمدفوعات',
    body: [
      'تُتفق جميع شروط الإيجار — السعر، والمدة، والاستلام أو التوصيل، والودائع، وغرامات التأخير، والتمديدات — مباشرةً بين الطرفين.',
      'جميع المدفوعات تتم مباشرةً بين المالك والمستأجر. لا تستقبل المنصة الأموال ولا تعالجها ولا تضمنها.',
    ],
  },
  {
    id: 'deposits',
    icon: Shield,
    color: 'bg-rose/10 text-rose',
    title: 'التأمينات والودائع',
    body: [
      'أي اتفاقية وديعة هي شأن حصري بين طرفي العقد. لا تتحمل المنصة أي مسؤولية عن الودائع أو التأمينات المتفق عليها بين المستخدمين.',
    ],
  },
  {
    id: 'responsibilities',
    icon: HeartHandshake,
    color: 'bg-amber/15 text-[#b53d13]',
    title: 'مسؤوليات المؤجر والمستأجر',
    subsections: [
      {
        label: 'على المؤجر',
        items: ['تقديم معلومات دقيقة عن المنتج وحالته', 'تسليم المنتج بالحالة المتفق عليها في الموعد المحدد', 'الإفصاح عن أي عيوب أو قيود قبل الاتفاق', 'الالتزام بالتواصل الواضح طوال فترة الإيجار'],
      },
      {
        label: 'على المستأجر',
        items: ['التعامل مع المنتج باعتدال ووفق الغرض المخصص له', 'إعادة المنتج في الموعد المتفق عليه وبنفس حالته', 'الإبلاغ الفوري عن أي ضرر أو عطل يطرأ أثناء الاستخدام', 'عدم إعادة تأجير المنتج لطرف ثالث دون إذن صريح من المالك'],
      },
    ],
  },
  {
    id: 'damages',
    icon: AlertTriangle,
    color: 'bg-rose/10 text-rose',
    title: 'الأضرار والفقدان والنزاعات',
    body: [
      'لا تتحمل المنصة أي مسؤولية عن الأضرار أو الفقدان أو السرقة. يُحسم كل خلاف مباشرةً بين الطرفين.',
      'يُشجَّع الطرفان على محاولة الحل الودي أولًا. قد تيسّر المنصة التواصل بينهما، غير أنها لا تعمل كطرف تحكيم أو ضامن.',
    ],
  },
  {
    id: 'reviews',
    icon: Star,
    color: 'bg-amber/15 text-[#b53d13]',
    title: 'التقييمات',
    body: [
      'يحق للمستخدمين ترك تقييمات بعد كل عملية إيجار. للمنصة حق إزالة التقييمات المضللة أو المسيئة أو المخالفة للسياسات.',
    ],
  },
  {
    id: 'prohibited',
    icon: ShieldCheck,
    color: 'bg-brand-soft text-brand',
    title: 'الأنشطة المحظورة',
    items: [
      'نشر معلومات كاذبة أو مضللة عن المنتج أو المستخدم',
      'الاحتيال أو محاولة الاحتيال على الطرف الآخر',
      'إدراج منتجات مسروقة أو غير قانونية أو مقيّدة',
      'التحرش أو التهديد أو الإساءة لأي مستخدم',
      'نشر تقييمات مزيفة أو التلاعب بالتقييمات',
      'أي استخدام مخالف للقوانين المعمول بها',
    ],
    note: 'تحتفظ المنصة بحق تعليق أو حذف الحسابات المخالفة لهذه البنود دون إشعار مسبق.',
  },
  {
    id: 'safety',
    icon: Sparkles,
    color: 'bg-green/10 text-green',
    title: 'إرشادات السلامة',
    items: [
      'تحقق من هوية الطرف الآخر قبل إتمام الصفقة',
      'صوّر حالة المنتج قبل التسليم وبعد الاستلام',
      'احتفظ بسجل مكتوب لشروط الاتفاق',
      'اختر أماكن آمنة وعامة لتبادل المنتجات',
      'أبلغ عن أي نشاط مشبوه عبر نظام الإبلاغ في المنصة',
    ],
  },
  {
    id: 'liability',
    icon: Info,
    color: 'bg-brand-soft text-brand',
    title: 'حدود المسؤولية والتزامنا',
    body: [
      'إلى أقصى حد يسمح به القانون، لا تتحمل سيركل أي مسؤولية عن النزاعات أو المطالبات المالية أو الأضرار أو التأخيرات أو خسائر الأرباح الناشئة عن أي عملية تأجير.',
      'نلتزم ببناء مجتمع موثوق عبر أدوات التحقق والتقييمات وآليات الإبلاغ ومعايير الاستخدام العادل. علاقة الإيجار والمسؤولية الكاملة تبقى بين المالك والمستأجر.',
    ],
  },
]

type PolicySection = typeof policySections[number]

function PolicyCard({ section }: { section: PolicySection }) {
  const IconComponent = section.icon
  return (
    <article id={section.id} className="scroll-mt-24 rounded-3xl border border-line bg-white p-6 shadow-sm sm:p-7">
      <div className="flex items-start gap-4">
        <span className={`mt-0.5 grid h-10 w-10 shrink-0 place-items-center rounded-2xl ${section.color}`}>
          <IconComponent size={19} />
        </span>
        <h2 className="text-lg font-black text-ink leading-tight">{section.title}</h2>
      </div>

      {'body' in section && section.body && (
        <div className="mt-4 space-y-3">
          {section.body.map((p, i) => (
            <p key={i} className="text-sm leading-7 text-ink/65">{p}</p>
          ))}
        </div>
      )}

      {'subsections' in section && section.subsections && (
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          {section.subsections.map(sub => (
            <div key={sub.label} className="rounded-2xl bg-[#faf8fb] p-4">
              <p className="mb-2 text-xs font-bold tracking-[.12em] text-brand">{sub.label}</p>
              <ul className="space-y-2">
                {sub.items.map(item => (
                  <li key={item} className="flex items-start gap-2 text-sm leading-6 text-ink/65">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand/40" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}

      {'items' in section && section.items && (
        <ul className="mt-4 space-y-2.5">
          {section.items.map(item => (
            <li key={item} className="flex items-start gap-2.5 text-sm leading-6 text-ink/65">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand/40" />
              {item}
            </li>
          ))}
        </ul>
      )}

      {'note' in section && section.note && (
        <p className="mt-4 rounded-xl border border-rose/20 bg-rose/5 px-4 py-3 text-xs leading-6 text-rose/80">{section.note}</p>
      )}
    </article>
  )
}

export function PolicyPage() {
  const [activeId, setActiveId] = useState<string | null>(null)
  const navLabels: [string, string][] = [
    ['من نحن ودورنا', 'who-we-are'],
    ['نموذج العمل', 'business-model'],
    ['التحقق', 'verification'],
    ['الاتفاقية والمدفوعات', 'rental-agreement'],
    ['الودائع والتأمين', 'deposits'],
    ['المسؤوليات', 'responsibilities'],
    ['الأضرار والنزاعات', 'damages'],
    ['التقييمات', 'reviews'],
    ['الأنشطة المحظورة', 'prohibited'],
    ['إرشادات السلامة', 'safety'],
    ['حدود المسؤولية', 'liability'],
  ]

  function scrollTo(id: string) {
    setActiveId(id)
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <PageShell>
      <Intro
        eyebrow="السياسة والشروط"
        title="استخدم سيركل بثقة."
        description="هذه الوثيقة تحدد دور المنصة، وحدود مسؤوليتها، وما يُتوقع من كل مستخدم. اقرأها بعناية قبل الاستخدام."
      >
        <span className="text-amber">وثيقة محدّثة</span>
        <br />
        آخر تحديث: أغسطس ٢٠٢٦ — تُطبَّق هذه الشروط على جميع مستخدمي المنصة.
      </Intro>

      <main className="mx-auto max-w-6xl px-5 py-14 sm:py-20 lg:grid lg:grid-cols-[220px_1fr] lg:gap-10 lg:items-start">
        {/* Sticky side nav — desktop only */}
        <nav className="sticky top-24 hidden lg:block">
          <p className="mb-3 text-xs font-bold tracking-[.13em] text-ink/40">المحاور</p>
          <ul className="space-y-1">
            {navLabels.map(([label, id]) => (
              <li key={id}>
                <button
                  onClick={() => scrollTo(id)}
                  className={`w-full rounded-xl px-3 py-2 text-right text-sm transition-colors ${
                    activeId === id
                      ? 'bg-brand text-cream font-bold'
                      : 'text-ink/60 hover:bg-brand-soft hover:text-brand'
                  }`}
                >
                  {label}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        {/* Policy sections */}
        <div className="space-y-4">
          {policySections.map(section => (
            <PolicyCard key={section.id} section={section} />
          ))}

          {/* Last updated / contact footer */}
          <div className="rounded-3xl border border-line bg-[#faf8fb] p-6 sm:p-7">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-bold text-ink">هل لديك استفسار حول هذه الشروط؟</p>
                <p className="mt-1 text-sm text-ink/55">يسعدنا الرد عبر صفحة التواصل.</p>
              </div>
              <Link
                to="/contact"
                className="inline-flex items-center gap-2 rounded-full bg-brand px-5 py-2.5 text-sm font-bold text-cream hover:bg-[#064b32] transition-colors"
              >
                تواصل معنا
                <ArrowLeft size={15} />
              </Link>
            </div>
          </div>
        </div>
      </main>
    </PageShell>
  )
}
