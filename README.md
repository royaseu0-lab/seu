# مساعد الجامعة السعودية الإلكترونية 🎓

**AI Chatbot** متخصص في الإجابة على استفسارات الجامعة السعودية الإلكترونية بدقة عالية.

## المميزات

- ✅ **إجابات دقيقة** مع جداول ومعلومات منظمة
- 🔗 **روابط مصدرية** مباشرة من موقع الجامعة
- 📄 **تصدير PDF** للمحادثة كاملة
- 📋 **نسخ الإجابة** مع السؤال بنقرة واحدة
- ⚡ **بث مباشر** للإجابات (Streaming)
- 🌙 **دعم كامل للغة العربية** (RTL)

## التثبيت المحلي

```bash
# 1. استنساخ المستودع
git clone <repo-url>
cd seu

# 2. تثبيت التبعيات
npm install

# 3. إعداد متغيرات البيئة
cp .env.example .env.local
# ثم افتح .env.local وضع مفتاح Anthropic API

# 4. تشغيل التطبيق
npm run dev
```

افتح http://localhost:3000

## النشر على Vercel

1. اذهب إلى [vercel.com](https://vercel.com)
2. ربط هذا المستودع
3. أضف **Environment Variable**:
   - الاسم: `ANTHROPIC_API_KEY`
   - القيمة: مفتاح API من [console.anthropic.com](https://console.anthropic.com)
4. انشر!

## الحصول على مفتاح Anthropic API

1. سجّل في [console.anthropic.com](https://console.anthropic.com)
2. اذهب إلى **API Keys**
3. انشئ مفتاحاً جديداً
4. انسخه في `.env.local` أو في إعدادات Vercel

## التقنيات المستخدمة

- **Next.js 14** - إطار العمل
- **Anthropic Claude** - نموذج الذكاء الاصطناعي
- **TailwindCSS** - التنسيق
- **react-markdown + remark-gfm** - عرض Markdown والجداول
- **jsPDF** - تصدير PDF

## الروابط المرجعية للجامعة

- [الموقع الرئيسي](https://www.seu.edu.sa)
- [بوابة الطالب](https://sso.seu.edu.sa)
- [بوابة القبول](https://admission.seu.edu.sa)
- [نظام التعلم](https://lms.seu.edu.sa)
