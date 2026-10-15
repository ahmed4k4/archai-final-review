import MarketingPage from "@/components/marketing/MarketingPage";
import { pageSeo } from "@/lib/seo";
import { isLocale } from "@/lib/i18n";
import { notFound } from "next/navigation";
import type { Locale } from "@/lib/types";

const copy = {
  ar: {
    eyebrow: "الأسئلة الشائعة",
    title: "إجابات واضحة",
    accent: "قبل أن نبدأ",
    description:
      "معلومات تساعدك على فهم طريقة العمل، نطاق المشاريع، والتعاون مع Archai.",
    cards: [
      { number: "01", icon: "◈", title: "ما الخدمات التي تقدمها أركاي سوليوشنز؟", body: "نقدم ثلاث تخصصات: هندسة البرمجيات، والأنظمة المدمجة، والذكاء الاصطناعي - لبناء أنظمة متكاملة تخدم احتياجات حقيقية.", tags: ["SERVICES", "SCOPE"] },
      { number: "02", icon: "✳", title: "كيف يبدأ المشروع؟", body: "نبدأ بمرحلة الاستكشاف لفهم المشكلة وجمع المتطلبات وتحديد القيود وتعريف معايير النجاح.", tags: ["DISCOVERY", "START"] },
      { number: "03", icon: "▤", title: "ما المعلومات المطلوبة لتقدير التكلفة؟", body: "الهدف من النظام، الوظائف الأساسية، القيود، الجمهور المستهدف، الجدول الزمني المتوقع، وأي تكاملات مطلوبة.", tags: ["QUOTATION", "BRIEF"] },
      { number: "04", icon: "↻", title: "هل توفرون الدعم والصيانة؟", body: "نعم، نوفر دعمًا طويل المدى يشمل الصيانة وتحديثات الأمان والتطوير المستمر للمنتج بعد الإطلاق.", tags: ["SUPPORT", "MAINTENANCE"] },
      { number: "05", icon: "⌘", title: "ما التقنيات التي تعملون بها؟", body: "نعمل عبر الواجهة الأمامية والخلفية والأنظمة المدمجة والذكاء الاصطناعي والسحابة وإنترنت الأشياء والموبايل، ونختار الأدوات وفق القيمة العملية.", tags: ["TECHNOLOGY", "STACK"] },
      { number: "06", icon: "◎", title: "هل تدعمون عملاء خارج مصر؟", body: "نعم، نعمل مع عملاء عن بُعد ونعتمد على تواصل منتظم ومراحل واضحة، مع مراعاة فارق التوقيت.", tags: ["GLOBAL", "REMOTE"] },
      { number: "07", icon: "⚙", title: "ما الجدول الزمني المعتاد للمشروع؟", body: "يعتمد على النطاق والتعقيد. نحدد المدة بعد مرحلة الاستكشاف عبر مراحل قابلة للمراجعة مع نقاط تسليم واضحة.", tags: ["TIMELINE", "PLANNING"] },
      { number: "08", icon: "✓", title: "كيف تضمنون جودة المشروع؟", body: "نضع الجودة والأمان والأداء ضمن دورة التطوير: مراجعة الكود، الاختبارات الآلية، والتحقق من سلوك النظام قبل النشر.", tags: ["QUALITY", "VALIDATION"] },
      { number: "09", icon: "⌁", title: "هل يمكنكم العمل على أنظمة مدمجة وأجهزة؟", body: "نعم، نطور البرامج الثابتة والبرمجيات المدركة للهاردوير للمتحكمات والأجهزة الطرفية مع مراعاة قيود الذاكرة والطاقة والوقت الحقيقي.", tags: ["EMBEDDED", "HARDWARE"] },
      { number: "10", icon: "↗", title: "كيف تتم عملية النشر؟", body: "نطلق المنتج، ونراقب التشغيل، وندعم الرجوع المضبوط، ثم نصون النظام ونحسنه باستمرار.", tags: ["DEPLOYMENT", "RELEASE"] },
    ],
    outroTitle: "لم تجد إجابتك؟",
    outroText: "أرسل سؤالك من صفحة التواصل وسنساعدك في تحديد الخطوة المناسبة.",
  },
  en: {
    eyebrow: "FAQ",
    title: "Clear answers",
    accent: "before we begin",
    description:
      "Helpful context on our delivery approach, project scope and how to work with Archai.",
    cards: [
      { number: "01", icon: "◈", title: "What services does Archai Solutions provide?", body: "Three disciplines: software engineering, embedded systems and artificial intelligence - combined to build integrated systems for real needs.", tags: ["SERVICES", "SCOPE"] },
      { number: "02", icon: "✳", title: "How does a project begin?", body: "We start with discovery: understanding the problem, gathering requirements, identifying constraints and defining success criteria.", tags: ["DISCOVERY", "START"] },
      { number: "03", icon: "▤", title: "What information is required for a quotation?", body: "The goal of the system, core functionality, constraints, target users, expected timeline and any required integrations.", tags: ["QUOTATION", "BRIEF"] },
      { number: "04", icon: "↻", title: "Does the company provide maintenance?", body: "Yes. We provide long-term support including maintenance, security updates and continued product development after launch.", tags: ["SUPPORT", "MAINTENANCE"] },
      { number: "05", icon: "⌘", title: "Which technologies can the company work with?", body: "Frontend, backend, embedded systems, AI and machine learning, cloud and DevOps, IoT and connectivity, and mobile - chosen for practical value.", tags: ["TECHNOLOGY", "STACK"] },
      { number: "06", icon: "◎", title: "Does the company support international clients?", body: "Yes. We work with clients remotely, relying on regular communication and clear milestones, with attention to time differences.", tags: ["GLOBAL", "REMOTE"] },
      { number: "07", icon: "⚙", title: "What is the typical project timeline?", body: "It depends on scope and complexity. We define it after discovery, in reviewable stages with clear deliverables.", tags: ["TIMELINE", "PLANNING"] },
      { number: "08", icon: "✓", title: "How is project quality ensured?", body: "Quality, security and performance run through delivery: code review, automated tests and verifying system behavior before deployment.", tags: ["QUALITY", "VALIDATION"] },
      { number: "09", icon: "⌁", title: "Can you work on embedded systems and hardware?", body: "Yes. We develop firmware and hardware-aware software for microcontrollers and peripherals, around memory, power and real-time constraints.", tags: ["EMBEDDED", "HARDWARE"] },
      { number: "10", icon: "↗", title: "How does deployment work?", body: "We release the product, monitor operation, support controlled rollbacks, then maintain and improve the system.", tags: ["DEPLOYMENT", "RELEASE"] },
    ],
    outroTitle: "Still have a question?",
    outroText: "Send your question through the contact page and we will help identify the right next step.",
  },
} as const;

export async function generateMetadata({ params }: { params: { lang: string } }) {
  const lang = isLocale(params.lang) ? params.lang : "en";
  const c = copy[lang];
  return pageSeo(lang, "faq", `${c.title} ${c.accent}`, c.description);
}

export default function Page({ params }: { params: { lang: string } }) {
  if (!isLocale(params.lang)) notFound();
  const lang = params.lang as Locale;
  const c = copy[lang];

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: c.cards.map((card) => ({
      "@type": "Question",
      name: card.title,
      acceptedAnswer: { "@type": "Answer", text: card.body },
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema).replace(/</g, "\\u003c") }}
      />
      <MarketingPage
        lang={lang}
        kind="faq"
        eyebrow={c.eyebrow}
        title={c.title}
        accent={c.accent}
        description={c.description}
        primary={lang === "ar" ? "تواصل معنا" : "Talk to us"}
        primaryHref={`/${lang}/contact`}
        secondary={lang === "ar" ? "استكشف الخدمات" : "Explore services"}
        secondaryHref={`/${lang}/services`}
        cards={c.cards}
        outroTitle={c.outroTitle}
        outroText={c.outroText}
        accentColor="rose"
      />
    </>
  );
}