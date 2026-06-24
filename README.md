# مساعد الجامعة السعودية الإلكترونية 🎓

**AI Chatbot** متخصص في الإجابة على استفسارات الجامعة السعودية الإلكترونية بدقة عالية.

## المميزات

- ✅ **إجابات دقيقة** مع جداول ومعلومات منظمة
- 🔗 **روابط مصدرية** مباشرة من موقع الجامعة
- 📄 **تصدير PDF** للمحادثة كاملة
- 📋 **نسخ الإجابة** مع السؤال بنقرة واحدة
- ⚡ **بث مباشر** للإجابات (Streaming)
- 🌙 **دعم كامل للغة العربية** (RTL)
- 🆓 **مجاني** - يعمل بـ Google Gemini

---

## الحصول على مفتاح Google Gemini API (مجاني)

### الخطوات:
1. افتح هذا الرابط: **https://aistudio.google.com/app/apikey**
2. سجّل دخول بحساب Google الخاص بك
3. اضغط **"Create API Key"**
4. انسخ المفتاح (يبدأ بـ `AIzaSy...`)

> المفتاح مجاني تماماً — لا يحتاج بطاقة ائتمان

---

## النشر على Vercel

1. افتح **[vercel.com](https://vercel.com)** وسجّل بحساب GitHub
2. اضغط **"Add New Project"** → **"Import Git Repository"**
3. اختر مستودع `royaseu0-lab/seu`
4. في قسم **"Environment Variables"** أضف:
   ```
   Name:  GEMINI_API_KEY
   Value: AIzaSy... (المفتاح الذي نسخته)
   ```
5. اضغط **"Deploy"** ✅

---

## التشغيل المحلي

```bash
git clone <repo-url>
cd seu
npm install
cp .env.example .env.local
# افتح .env.local وضع: GEMINI_API_KEY=AIzaSy...
npm run dev
```

افتح http://localhost:3000

---

## التقنيات

- **Next.js 14** - إطار العمل
- **Google Gemini 2.0 Flash** - نموذج الذكاء الاصطناعي (مجاني)
- **TailwindCSS** - التنسيق
- **react-markdown + remark-gfm** - الجداول والـ Markdown
- **jsPDF** - تصدير PDF

## روابط الجامعة المرجعية

- [الموقع الرئيسي](https://www.seu.edu.sa)
- [بوابة الطالب](https://sso.seu.edu.sa)
- [بوابة القبول](https://admission.seu.edu.sa)
- [نظام التعلم](https://lms.seu.edu.sa)
