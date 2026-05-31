# Project Overview – Pixelectro

**ملخص شامل ومفصل للمشروع**

---

## 1️⃣ بنية المشروع العامة
```
C:\Users\Lenovo - LOQ\.gemini\antigravity\scratch\pixelectro
│
├─ .env                     # متغيرات البيئة (قواعد الاتصال بقاعدة البيانات، مفاتيح Cloudinary …)
├─ .gitignore
├─ README.md                # توثيق سريع للبدء
├─ next.config.ts           # إعدادات Next.js (تشغيل الـ draco‑loader عبر CDN)
├─ package.json
├─ tsconfig.json
│
├─ app/                     # جذور تطبيق Next.js (App Router)
│   ├─ page.tsx             # الصفحة الرئيسية – تحتوي على الأقسام المتغيرة (hero, branding, …)
│   ├─ layout.tsx           # layout عالمي يضم الـ Canvas الثابت وGSAP ScrollTrigger
│   ├─ components/
│   │   ├─ Preloader/
│   │   │   └─ Preloader.tsx          # مكوّن شاشة التحميل (تم إصلاحه ليحاكي تحميل 0‑100 % خلال 2.5 ثانية)
│   │   ├─ Navbar/
│   │   │   └─ Navbar.tsx            # شريط‑التنقل – تم تعديل النص لتلوين **PIX** باللون الأزرق الكهربائي
│   │   ├─ GlobalFootprint/
│   │   │   └─ GlobalFootprint.tsx  # مكوّن إضاءة ثلاثية الأبعاد (Three.js) مع Draco compression
│   │   ├─ PortfolioGrid/
│   │   │   └─ PortfolioGrid.tsx      # شبكة عرض المشاريع (Isotope‑filter) – تُستَخدم بيانات الـ categories/Projects
│   │   └─ … (مكوّنات أخرى مثل Footer, Header …)
│   └─ [service]/page.tsx   # مسارات ديناميكية لكل خدمة (branding, video‑editing, 3d‑vfx …)
│
├─ prisma/
│   ├─ schema.prisma        # تعريف نماذج قاعدة البيانات (Category, Project)
│   └─ seed.ts              # سكريبت حشو القاعدة بـ 8 فئات + ≥2 مشاريع لكل فئة
│
├─ public/
│   ├─ assets/              # مجلد الملفات ثلاثية الأبعاد (glb / gltf) – تم حذف النماذج القديمة واستبدالها بأصول واقعية
│   │   ├─ camera.glb
│   │   ├─ helmet.glb
│   │   └─ brain-core.glb
│   ├─ draco-gltf/          # ملفات d코 decoder من CDN Google (أو نسخة محلية) لتقليل حجم GLB
│   └─ … (صور وشعارات، favicon …)
│
├─ lib/
│   └─ prisma.ts            # عميل Prisma مُستورد لتسهيل الوصول للـ DB
│
├─ node_modules/            # حزم npm
└─ .next/                   # ملفات البناء (مؤقتة)
```

---

## 2️⃣ ما تم إنجازه حتى الآن
| الفئة | ما تم تنفيذه | تفاصيل/ملف |
|------|--------------|------------|
| **واجهة Preloader** | استبدال `useProgress` بـ محاكاة تحميل زمنية ثابتة (2.5 ث) وإضافة تأثير GSAP glitch الانتقالي | `app/components/Preloader/Preloader.tsx` |
| **تحميل assets 3D** | حذف النماذج القديمة وجلب نماذج عالية الدقة (CC0) من Poly Haven & Khronos؛ تخزينها في `public/assets/` | ملفات `*.glb` داخل `public/assets/` |
| **Draco compression** | ربط الـ Three.js GLTFLoader مع الـ Draco decoder من CDN: `https://www.gstatic.com/draco/versioned/decoders/1.5.5/` (أو ملفات محلية في `public/draco-gltf`) | إعداد في `next.config.ts` و`app/components/GlobalFootprint/GlobalFootprint.tsx` |
| **Routing Next.js** | إنشاء مسار ديناميكي `app/[service]/page.tsx`؛ ضبط قيم `slug` في قاعدة البيانات لتطابق الحروف الصغيرة؛ تم إغلاق أخطاء 404 لكل صفحة خدمة | مجلد `app/[service]` + سكريبت الحشو في `prisma/seed.ts` |
| **Navbar Logo** | تعديل الشعار لتلوين أول ثلاثة أحرف **PIX** باللون الأزرق (`text-blue-500`) بدلاً من حرف واحد فقط | `app/components/Navbar/Navbar.tsx` |
| **قاعدة البيانات** | نموذج Prisma مع جدولين: `Category` (8 فئات) و `Project` (≥2 مشاريع لكل فئة).  سكريبت `seed.ts` يملأ القاعدة تلقائيًا ويضيف روابط صور/فيديوهات مجانية. | `prisma/schema.prisma`, `prisma/seed.ts` |
| **Portfolio Grid** | مكوّن Isotope‑filter يسمح بتصفية المشاريع حسب الفئة؛ يستهلك البيانات من Prisma عبر API داخل `app/components/PortfolioGrid/PortfolioGrid.tsx`. | `PortfolioGrid.tsx` |
| **Global Three.js Canvas** | Canvas ثابت في `layout.tsx` يُدير المشهد العام (الإضاءة الثلاثية نقطة، مواد PBR). يدمج الـ GSAP ScrollTrigger لتنسيق حركة الكاميرا بين الأقسام. | `app/layout.tsx` + `GlobalFootprint.tsx` |
| **Footer** | إضافة رابط خفي / رمز Admin في الزاوية السفلية (قابل للنقر للذهاب إلى لوحة المشرف) | `app/components/Footer/Footer.tsx` |
| **إعدادات Styling** | اعتمدنا على **CSS Modules** (ملفات `.module.css`) مع متغيرات ألوان HSL لواجهة فاخرة، ولا تم استخدام Tailwind. | ملفات CSS داخل كل مكوّن (`*.module.css`) |
| **التحكم بالوصول** | تم التخطيط لاستخدام **NextAuth.js** مع SQLite محلي وSupabase في الإنتاج (لم يتم تنفيذه بالكامل – تم تدوينه في خطة التنفيذ). | `app/auth/**` (مستقبل) |
| **الصوتيات/الفيديو** | تم اختيار Cloudinary كمنصة تخزين/ CDN للوسائط 4K؛ تم تهيئة الإعدادات في `.env`. | `.env` يحتوي على `CLOUDINARY_URL` |

---

## 3️⃣ ملفات المفتاح التي يجب مراجعتها
| الملف | ما يحتويه | رابط للملف |
|------|-----------|------------|
| `app/page.tsx` | الـ Home page مع الأقسام (hero, branding, video, vfx, software) | [page.tsx](file:///C:/Users/Lenovo%20-%20LOQ/.gemini/antigravity/scratch/pixelectro/app/page.tsx) |
| `app/components/Preloader/Preloader.tsx` | شاشة التحميل الجديدة | [Preloader.tsx](file:///C:/Users/Lenovo%20-%20LOQ/.gemini/antigravity/scratch/pixelectro/app/components/Preloader/Preloader.tsx) |
| `app/components/Navbar/Navbar.tsx` | تعديل الشعار (تلوين PIX) | [Navbar.tsx](file:///C:/Users/Lenovo%20-%20LOQ/.gemini/antigravity/scratch/pixelectro/app/components/Navbar/Navbar.tsx) |
| `app/components/GlobalFootprint/GlobalFootprint.tsx` | إعدادات Three.js + Draco loader | [GlobalFootprint.tsx](file:///C:/Users/Lenovo%20-%20LOQ/.gemini/antigravity/scratch/pixelectro/app/components/GlobalFootprint/GlobalFootprint.tsx) |
| `app/components/PortfolioGrid/PortfolioGrid.tsx` | شبكة المشاريع مع Isotope | [PortfolioGrid.tsx](file:///C:/Users/Lenovo%20-%20LOQ/.gemini/antigravity/scratch/pixelectro/app/components/PortfolioGrid/PortfolioGrid.tsx) |
| `prisma/schema.prisma` | تعريف الجداول (Category, Project) | [schema.prisma](file:///C:/Users/Lenovo%20-%20LOQ/.gemini/antigravity/scratch/pixelectro/prisma/schema.prisma) |
| `prisma/seed.ts` | سكريبت الحشو (8 فئات + ≥2 مشاريع لكل فئة) | [seed.ts](file:///C:/Users/Lenovo%20-%20LOQ/.gemini/antigravity/scratch/pixelectro/prisma/seed.ts) |
| `public/assets/` | ملفات GLB/GLTF الحقيقية (camera.glb, helmet.glb, brain-core.glb) | — |
| `next.config.ts` | تمكين Draco loader عبر CDN، وإعدادات الصورة/الأنماط | [next.config.ts](file:///C:/Users/Lenovo%20-%20LOQ/.gemini/antigravity/scratch/pixelectro/next.config.ts) |
| `app/layout.tsx` | Layout العام مع Canvas ثابت وGSAP ScrollTrigger | [layout.tsx](file:///C:/Users/Lenovo%20-%20LOQ/.gemini/antigravity/scratch/pixelectro/app/layout.tsx) |

---

## 4️⃣ ما زال قيد التطوير (نقطة للمتابعة)
| المهمة | الحالة | ملاحظات للمتابعة |
|--------|---------|-------------------|
| **NextAuth.js** – دمج المصادقة (SQLite / Supabase) | مخطط فقط | يجب إنشاء ملف `[...nextauth].ts` وإضافة مزود البريد أو Google. |
| **تحسينات الـ GSAP** – تعديل زمن الـ glitch والـ depth‑of‑field حسب الاختبار | مكتمل جزئياً | يمكن ضبط القيم في `Preloader` و`GlobalFootprint` لتناسب الأجهزة الضعيفة. |
| **تحميل إضافي للـ assets** – إضافة نماذج HD إضافية (كاميرا سينمائية، عدسة أنامورف، دماغ سيبراني) | مخطط في `implementation_plan.md` | سيتطلب سكريبت خلفي لتحميل من Poly Haven عبر `curl` واتمام ضغط Draco. |
| **تحسين SEO** – إضافة meta tags ديناميكية لكل صفحة خدمة | غير مفعّل | كل صفحة `app/[service]/page.tsx` تحتاج `<Head>` مع عنوان ووصف مخصص. |
| **إعدادات الإنتاج** – تكامل Cloudinary + Vercel أو Netlify للنشر | غير مُنفّذ | استكمال `README.md` بخطوات النشر. |

---

## 5️⃣ نقاط هامة للمتابعة من قبل النموذج الجديد
1. **الاحتفاظ ببنية المسارات**: يجب الحفاظ على `app/[service]/page.tsx` وملف `slug` في قاعدة البيانات لتفادي أخطاء 404.  
2. **تأكد من وجود ملفات GLB** في `public/assets/` وشغّل `next dev` لتتحقق من تحميلها عبر `GLTFLoader` مع `dracoDecoderPath` المحدد إلى `public/draco-gltf`.  
3. **تحديث المتغيرات في `.env`** إذا تغيرت مفاتيح Cloudinary أو Supabase؛ جميع المتغيرات تُقرأ عبر `process.env`.  
4. **تفعيل الـ CSS Modules** في كل مكوّن لتجنب تسرب الأنماط؛ تأكد من أن أسماء الفئات (`className={styles.xyz}`) متطابقة مع ملفات `.module.css`.  
5. **اختبار الـ Preloader** على متصفحين مختلفين (Chrome & Firefox) لضمان أن العدّ الزمني لا يتعارض مع تحميل real assets.  
6. **تحديث `package.json`** إذا أضيفت حزم جديدة (مثلاً `three-stdlib` أو `@react-three/drei`). بعد أي تعديل، شغّل `npm install` ثم `npm run dev`.  

---

## 6️⃣ كيف تُسلم هذا الملخص
- حفظه كملف **Markdown** داخل دليل المشروع (مثلاً `PROJECT_OVERVIEW.md`).
- إرفاق الروابط للملفات كما هو موضح أعلاه؛ سيستطيع النموذج المستقبل فتحها مباشرة.
- أضف ملاحظة في أعلى الملف تشير إلى أن **الـ AI التالي** يجب أن يواصل بناء الـ WebGL canvas، تحسين الـ auth، وتوسيع مكتبة الأصول 3D.

---

**✅ خلاصة**
تم الآن بناء بنية **Next.js 13 (App Router)** مع **Canvas ثلاثي الأبعاد ثابت** و**GSAP ScrollTrigger**، إصلاح شاشة التحميل، جلب أصول **GLB/GLTF** عالية الدقة، ربط **Draco compression**، إعداد قاعدة بيانات **Prisma** وتعبئتها، تعديل **Navbar** لتوحيد هوية العلامة التجارية، إصلاح مسارات الخدمات، وغيرها من التحسينات. هذا الملف يزود النموذج الجديد بكل المعلومات اللازمة لاستكمال المشروع إلى المستوى النهائي المطلوب.
