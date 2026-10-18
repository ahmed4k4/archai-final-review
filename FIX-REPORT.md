# تقرير الإصلاحات — archai-final-review

**التاريخ:** 2026-10-16
**المسار:** `C:\Users\pc\OneDrive\Desktop\archai-next-refactored\archai-seo-3d-upgrade\archai-final-review`

---

## 1. إصلاح عرض الصفحة الرئيسية (تداخل النص العربي/الإنجليزي) ✅

**المشكلة:** كان يتم عرض العنوان العربي والعنوان الإنجليزي داخل نفس `<h1>` متراكمين، مما سبب تداخل الأحرف وكسر تأثير SplitText.

**الإصلاح:**

- `src/components/Hero.tsx` — يُعرض الآن **فقط العنوان الخاص باللغة النشطة** (`hero[lang]`)، ولم يعد يتم تكديس اللغتين.
- إضافة `overflow-hidden` على الأب لمنع تسرّب الأحرف المتحركة.
- إعادة تعيين (reset) آلية لـ SplitText قبل كل تشغيل.
- ضبط `lineHeight` و`wordBreak` لمنع القفز فوق الأحرف.
- فصل RTL/LTR بشكل صحيح حسب `lang`.

**التحقق:** typecheck + build يمرّان بنجاح، والصفحة تُعرض نظيفة بلا تداخل بالعربية والإنجليزية.

---

## 2. حذف الخلفية الغريبة على اليمين ✅

**المشكلة:** كرة/توهّج (nebula blob) ساطع في الزاوية العلوية اليمنى كان يظهر كشكل غريب خلف النص.

**الإصلاح:**

- `src/components/Hero.tsx` — تقليل شفافية الكرات الشعاعية ونقلها بعيداً عن الزاوية اليمنى (الطبقة 2).
- ضمان أن أي canvas/شبكة لا تتداخل مع منطقة الـ hero على اليمين.

**التحقق:** الخلفية أصبحت نظيفة وهادئة، والعنوان هو محور التركيز.

---

## 3. صفحة المشاريع منفصلة ✅

**الحالة:** الصفحة `/portfolio` **موجودة** وفعّالة: `src/app/[lang]/portfolio/page.tsx`.

**الإصلاح:**

- التحقق من الروابط في Header/Footer وتوجيهها إلى `/portfolio`.
- الصفحة الرئيسية تعرض 3 مشاريع فقط + زر "عرض الكل" → `/portfolio`.
- شبكة المشاريع + فلاتر + SEO schema.

> ⚠️ **تصحيح (مراجعة بصرية 2026-10-18):** الشبكة تعرض فعلياً العدد الموجود في الداتابيز،
> وليس "8 مشاريع" كما ذُكر سابقاً. حالياً يوجد **مشروع واحد منشور فقط** (عنصر اختباري
> "5555")، لذا تظهر الشبكة بعنصر واحد + فراغ كبير أسفل العنوان. هذا نقص في *المحتوى*
> (بيانات الداتابيز) وليس خطأ في الكود — أضف مشاريع حقيقية من الداشبورد لإكمال الشبكة.

---

## 4. تحسين الأداء ✅

**الإصلاح:**

- مشاهد 3D: `lazy` + `ssr: false` عبر `next/dynamic`.
- `IntersectionObserver` لتفعيل الـ scenes قبل 200px من الظهور.
- Starfield على الجوال: 200 نجمة فقط، `dpr [1,1]`.
- دعم `prefers-reduced-motion` (تجميد الحركة).
- `next.config.cjs`: صور AVIF/WebP، `optimizePackageImports`، ضغط، رؤوس كاش قوية.

**التحقق:** `npm run build` يمر بنجاح.

---

## 5. الداشبورد يتحكم في كل شيء ✅

**الحالة:** لوحة التحكم تحتوي على صفحات كاملة:

- `src/app/admin/projects` (+ `[id]/media`) — إضافة/تعديل/حذف/وسائط
- `src/app/admin/categories`
- `src/app/admin/content` — محتوى الـ hero والأقسام
- `src/app/admin/settings` — إعدادات الموقع
- `src/app/admin/seo` — بيانات SEO لكل صفحة
- `src/app/admin/analytics`
- `src/app/admin/tools`

**الإصلاح:**

- نقل الأقسام الثابتة إلى `site_settings` (أعمدة JSONB).
- عرض forms لكل قسم في الداشبورد.
- seed البيانات الحالية كـ defaults في DB.

---

## 6. تحسين مساحة الداتابيز ✅

**ضمن:** `supabase/01_setup.sql` (تم دمج محتوى `04_optimize.sql` فيه وحُذف الملف المنفصل)

**يتضمن:**

- `VACUUM ANALYZE` لكل الجداول.
- حذف صفوف قديمة: `page_views` (>30 يوم)، `project_views` (>30 يوم)، `visitor_sessions` (>90 يوم).
- وظيفة `purge_old_analytics` + جدولتها عبر `pg_cron` يومياً.
- فحص وحذف الفهارس غير المستخدمة (`pg_stat_user_indexes`).
- partial indexes للاستعلامات الشائعة.
- التأكد من أن `project_images` تستخدم روابط Storage (لا base64).

**تقليل Log Ingestion:**

- Rate limiting على مسارات `/api`.
- Supabase Realtime بدل polling.
- إيقاف debug logs في production.
- حماية من البوتات عبر إعدادات rate limit في لوحة Supabase.

**تقليل Log Query (11.9 GB):**

- توثيق في README: عدم ترك Logs Explorer مفتوحاً، استخدام نطاق زمني قصير (آخر ساعة)، فلترة دقيقة.

**تنظيم الجداول:**

- `jsonb` للأقسام الثابتة (`site_settings`)، عدم تكرار البيانات، `cascade delete` صحيح.

**File Storage:**

- bucket في Supabase Storage (لا قاعدة)، صور WebP فقط، حذف الصور اليتيمة (orphans).

---

## 7. الاختبارات ✅

- `npm run typecheck` — يمر بنجاح.
- `npm run build` — يمر بنجاح.
- `npm run dev` — يعمل.

---

## ملاحظات نهائية

- جميع الألوان ملتزمة بدليل الهوية: **Arc Blue** (`#2ED2FF`) · **Silver** · **Copper** (`#C48A5C`) · **Carbon** (`#141A1F`).
- لم يتم اختراع أي محتوى.
- admin/auth لم يُكسر.
- `prefers-reduced-motion` مدعوم في كل الحركات.
