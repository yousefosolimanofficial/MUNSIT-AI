# Phase 07 — Landing copy approval package (Arabic from Figma; English PROPOSED)

- **Status:** English is **PENDING FINAL APPROVAL** (P07-D1, owner, 2026-11-19). The Arabic is
  final: it is Figma verbatim (P07-D11).
- **Arabic:** extracted **verbatim** from the Figma Landing frames (read-only, including
  component-instance overrides). It is not rewritten.
- **English: every string is PROPOSED, not approved.** It preserves meaning and adds no product
  claims. Ambiguous choices are flagged in §12. Figma has no LTR frames, so the source of English copy is
  the open decision O-1 ([design-values](../design-values.md)). Nothing in English ships until the
  owner approves it (P07-D1).
- **Placement:** in implementation, all copy lives in `src/i18n/messages/{ar,en}/landing.json`
  (Roadmap DoD). Components hold none.

Desktop `5:3` is the source. Tablet and Mobile use the same strings, except where §8 and §11
note otherwise.

## 0. Where the copy lives (Increment 1)

- **Files:** `src/i18n/messages/ar/landing.json` (Arabic, final, Figma verbatim; checked
  string-by-string against Figma on 2026-11-19) and `src/i18n/messages/en/landing.json` (the
  English below, **PROPOSED**).
- **English gate (P07-D1):** English is served only outside production
  (`src/features/landing/model/gates.ts`, `LANDING_ENGLISH_APPROVED = false`). A production build
  returns 404 for `/en` and shows no language link.
- **Exact Figma details kept:**
  - the Showcase heading contains a **U+2028 line separator** between "ذكي" and "كل" (a forced
    line break), not a space. CSS does not break at U+2028, so the page keeps the character in the
    text and adds a `<br>` after it (Increment 3);
  - the copyright line is the exact string, rendered with a **left-to-right base direction**, as
    Figma draws it.

## 1. Navigation

| Key            | Arabic (Figma)  | English (PROPOSED) | Note                                                                                                   |
| -------------- | --------------- | ------------------ | ------------------------------------------------------------------------------------------------------ |
| nav.home       | الرئيسية        | Home               |                                                                                                        |
| nav.features   | المميزات        | Features           |                                                                                                        |
| nav.howItWorks | كيف يعمل ؟      | How it works       | Kept **exactly**: the space before "؟" and the trailing space (P07-D11). The footer writes "كيف يعمل؟" |
| nav.faq        | الأسئلة الشائعة | FAQ                |                                                                                                        |
| nav.language   | EN              | AR (in English)    | Existing language switch                                                                               |
| nav.login      | تسجيل الدخول    | Log in             |                                                                                                        |

## 2. Hero

| Key               | Arabic (Figma)                                                                                 | English (PROPOSED)                                                                                                                                      |
| ----------------- | ---------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| hero.heading      | كل كلمة ليها قيمة ومنصت مش بيفوّت كلمة                                                          | Every word matters, and Munsit doesn't miss a single one                                                                                                |
| hero.description  | منصتك الذكية لفهم المحاضرات، وتحويلها إلى ملخصات منظمة وأسئلة تفاعلية تساعدك تتعلم بكفاءة أكبر | Your smart platform for understanding lectures and turning them into organized summaries and interactive questions that help you learn more efficiently |
| hero.ctaPrimary   | ابدأ مجانًا                                                                                     | Get started free                                                                                                                                        |
| hero.ctaSecondary | اكتشف كيف يعمل                                                                                 | See how it works                                                                                                                                        |

**Hero video control labels.** These are not Figma copy. The owner approved them (P07-D15,
2026-11-19), and they are final in both languages:

| Key             | Arabic              | English                |
| --------------- | ------------------- | ---------------------- |
| hero.videoPause | إيقاف الفيديو مؤقتًا | Pause background video |
| hero.videoPlay  | تشغيل الفيديو       | Play background video  |

## 3. Product Showcase

| Key                  | Arabic (Figma)                                                                                                                 | English (PROPOSED)                                                                                                                                                                            |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| showcase.heading     | محاضرتك تتحوّل لمحتوى ذكي كل اللي تحتاجه في مكان واحد                                                                           | Your lecture becomes smart content: everything you need in one place                                                                                                                          |
| showcase.description | منصت بيساعدك تحوّل محاضراتك إلى نصوص فورية، ويحددلك أهم المعلومات، ويجهزلك ملخصات منظمة وأسئلة تفاعلية تساعدك تراجع وتفهم أسرع. | Munsit helps you turn your lectures into instant transcripts, highlights the key information, and prepares organized summaries and interactive questions so you review and understand faster. |

**App window mock (Desktop and Tablet):** these strings are part of a product illustration.

| Key                    | Arabic (Figma)            | English (PROPOSED)                      |
| ---------------------- | ------------------------- | --------------------------------------- |
| showcase.recording     | جاري التسجيل              | Recording                               |
| showcase.timer         | 00:12:34                  | 00:12:34 (LTR numerals)                 |
| showcase.lectureTitle  | مقدمة في الذكاء الاصطناعي | Introduction to Artificial Intelligence |
| showcase.lectureType   | محاضرة مباشرة             | Live lecture                            |
| showcase.sidebarTitle  | القائمة الرئيسية          | Main menu                               |
| showcase.nav.dashboard | لوحة التحكم               | Dashboard                               |
| showcase.nav.lectures  | المحاضرات                 | Lectures                                |
| showcase.nav.live      | التسجيل المباشر           | Live recording                          |
| showcase.nav.summaries | الملخصات الذكية           | Smart summaries                         |
| showcase.nav.questions | بنك الاسئلة               | Question bank                           |
| showcase.nav.history   | سجل المحادثات             | Chat history                            |

**Mobile only** (`200:722`, a live transcript card):

| Key                | Arabic (Figma)                                                        | English (PROPOSED)                                                                      |
| ------------------ | --------------------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| showcase.m.live    | مباشر                                                                 | Live                                                                                    |
| showcase.m.heading | التفريغ الحي للمحاضرة                                                 | Live lecture transcript                                                                 |
| showcase.m.time1   | 01:12                                                                 | 01:12 (LTR numerals)                                                                    |
| showcase.m.line1   | أهلاً بكم في محاضرة اليوم حول الذكاء الاصطناعي وتطبيقاته.              | Welcome to today's lecture on artificial intelligence and its applications.             |
| showcase.m.time2   | 02:05                                                                 | 02:05 (LTR numerals)                                                                    |
| showcase.m.line2   | من المهم جداً فهم كيفية تدريب هذه النماذج على كميات هائلة من البيانات. | It's very important to understand how these models are trained on huge amounts of data. |
| showcase.m.pause   | إيقاف مؤقت                                                            | Pause                                                                                   |

## 4. Features

| Key                  | Arabic (Figma)                                                                                                                        | English (PROPOSED)                                                                                                                                                               |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| features.heading     | أدوات ذكية لكل خطوة في تعلّمك.                                                                                                         | Smart tools for every step of your learning.                                                                                                                                     |
| features.description | من تسجيل المحاضرات وتفريغها، لتحديد أهم المعلومات وإنشاء الملخصات والأسئلة التفاعلية. ⏎ منصت بيساعدك تستفيد من كل محاضرة بأفضل طريقة. | From recording and transcribing lectures to highlighting key information and creating summaries and interactive questions. ⏎ Munsit helps you get the most out of every lecture. |
| features.1.title     | تفريغ المحاضرات مباشرة                                                                                                                | Live lecture transcription                                                                                                                                                       |
| features.1.text      | حوّل صوت المحاضرة إلى نص مباشر، ⏎ وارجع لأي جزء منها بسهولة.                                                                           | Turn the lecture audio into live text, ⏎ and go back to any part of it easily.                                                                                                   |
| features.2.title     | تمييز المعلومات الذكي                                                                                                                 | Smart highlights                                                                                                                                                                 |
| features.2.text      | حدد أهم النقاط والمعلومات تلقائيًا، ⏎ وركّز على اللي يستحق المراجعة.                                                                    | Mark the key points automatically, ⏎ and focus on what deserves review.                                                                                                          |
| features.3.title     | ملخصات ذكية ومنظمة                                                                                                                    | Smart, organized summaries                                                                                                                                                       |
| features.3.text      | حوّل محاضراتك إلى ملخصات واضحة، ⏎ تساعدك تراجع وتفهم أسرع.                                                                             | Turn your lectures into clear summaries ⏎ that help you review and understand faster.                                                                                            |
| features.4.title     | بنك أسئلة تفاعلي                                                                                                                      | Interactive question bank                                                                                                                                                        |
| features.4.text      | اختبر فهمك بأسئلة ذكية مستخرجة ⏎ من محتوى محاضراتك.                                                                                   | Test your understanding with smart questions ⏎ drawn from your lecture content.                                                                                                  |
| features.5.title     | مساعدك التعليمي الذكي                                                                                                                 | Your smart learning assistant                                                                                                                                                    |
| features.5.text      | اسأل عن أي معلومة في محاضرتك، ⏎ واحصل على شرح يساعدك تفهمها.                                                                          | Ask about anything in your lecture, ⏎ and get an explanation that helps you understand it.                                                                                       |
| features.6.title     | عرض شرائح المحاضرات                                                                                                                   | Lecture slide viewer                                                                                                                                                             |
| features.6.text      | تابع شرائح محاضراتك بسهولة، ⏎ ونظّم المحتوى في مكان واحد.                                                                              | Follow your lecture slides easily, ⏎ and keep the content in one place.                                                                                                          |

The ⏎ symbol marks a line break drawn in Figma.

## 5. How It Works

| Key             | Arabic (Figma)                                                                                        | English (PROPOSED)                                                                                                                           |
| --------------- | ----------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| how.heading     | إزاي منصت بيشتغل؟                                                                                     | How does Munsit work?                                                                                                                        |
| how.description | من أول تسجيل المحاضرة لحد المراجعة واختبار فهمك، منصت بيخلّي رحلتك التعليمية أسهل وأذكى في أربع خطوات. | From recording the lecture to reviewing and testing your understanding, Munsit makes your learning journey easier and smarter in four steps. |
| how.1.title     | ابدأ تسجيل محاضرتك                                                                                    | Start recording your lecture                                                                                                                 |
| how.1.text      | سجّل محاضرتك مباشرة، وركّز مع شرح الدكتور بدل الانشغال بكتابة كل كلمة.                                  | Record your lecture live and focus on the lecturer instead of writing down every word.                                                       |
| how.2.title     | سيب منصت يحلّل                                                                                         | Let Munsit analyze                                                                                                                           |
| how.2.text      | منصت بيحوّل صوت المحاضرة لنص مكتوب، ويساعدك تحدد أهم المعلومات تلقائيًا.                                | Munsit turns the lecture audio into written text and helps you mark the key information automatically.                                       |
| how.3.title     | راجع محاضرتك بذكاء                                                                                    | Review your lecture smartly                                                                                                                  |
| how.3.text      | احصل على ملخصات منظمة، وارجع للمعلومات المهمة بسهولة علشان تراجع وتفهم أسرع.                          | Get organized summaries and return to the important information easily, so you review and understand faster.                                 |
| how.4.title     | اختبر فهمك واتقدّم                                                                                     | Test your understanding and progress                                                                                                         |
| how.4.text      | اختبر نفسك بأسئلة من محتوى محاضرتك، واستعن بالمساعد الذكي لفهم الأجزاء الصعبة.                        | Test yourself with questions from your lecture content, and use the smart assistant to understand the hard parts.                            |

**Step numbers:** "01"–"04" (Geist Mono, LTR).

## 6. Use Cases

| Key                  | Arabic (Figma)                                                                                                              | English (PROPOSED)                                                                                                                                                   |
| -------------------- | --------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| useCases.heading     | منصت معاك في كل خطوة من رحلتك التعليمية.                                                                                    | Munsit is with you at every step of your learning journey.                                                                                                           |
| useCases.description | سواء كنت في المحاضرة، بتذاكر، أو بتستعد للامتحان، منصت بيساعدك تتعلم بذكاء وتستفيد من وقتك.                                 | Whether you're in a lecture, studying or preparing for an exam, Munsit helps you learn smartly and make the most of your time.                                       |
| useCases.1.eyebrow   | 01 — أثناء المحاضرة                                                                                                         | 01 — During the lecture                                                                                                                                              |
| useCases.1.title     | ركّز في الشرح... وسيب الباقي على منصت.                                                                                       | Focus on the explanation… and leave the rest to Munsit.                                                                                                              |
| useCases.1.text      | بدل ما تنشغل بكتابة كل كلمة، ركّز مع الدكتور ومنصت يساعدك في تسجيل المحاضرة وتحويلها لنص منظم تقدر ترجعله في أي وقت.         | Instead of being busy writing every word, focus on the lecturer while Munsit helps you record the lecture and turn it into organized text you can return to anytime. |
| useCases.2.eyebrow   | 02 — وقت المذاكرة                                                                                                           | 02 — Study time                                                                                                                                                      |
| useCases.2.title     | مذاكرة منظمة من غير تضييع وقت.                                                                                              | Organized studying without wasted time.                                                                                                                              |
| useCases.2.text      | ارجع لمحاضراتك بسهولة، وراجع أهم المعلومات من خلال الملخصات الذكية والنقاط المحددة تلقائيًا، علشان تستوعب المحتوى بشكل أسرع. | Return to your lectures easily and review the key information through smart summaries and automatically marked points, so you take in the content faster.            |
| useCases.3.eyebrow   | 03 — قبل الامتحان                                                                                                           | 03 — Before the exam                                                                                                                                                 |
| useCases.3.title     | اختبر فهمك قبل ما تدخل الامتحان.                                                                                            | Test your understanding before you walk into the exam.                                                                                                               |
| useCases.3.text      | راجع معلوماتك بأسئلة تفاعلية مستخرجة من محاضراتك، واستعن بالمساعد الذكي لفهم الأجزاء الصعبة وتقوية مستواك.                  | Review with interactive questions drawn from your lectures, and use the smart assistant to understand the hard parts and strengthen your level.                      |

## 7. FAQ

| Key             | Arabic (Figma)                                                                                                                                                   | English (PROPOSED)                                                                                                                                                                                |
| --------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| faq.heading     | لسه عندك أسئلة عن منصت؟                                                                                                                                          | Still have questions about Munsit?                                                                                                                                                                |
| faq.description | جمعنالك إجابات لأهم الأسئلة علشان تبدأ رحلتك مع منصت بكل وضوح.                                                                                                   | We've gathered answers to the most important questions so you can start your journey with Munsit clearly.                                                                                         |
| faq.1.q         | إيه هي منصة منصت؟                                                                                                                                                | What is Munsit?                                                                                                                                                                                   |
| faq.1.a         | منصت منصة تعليمية بتستخدم الذكاء الاصطناعي لمساعدتك في تسجيل المحاضرات وتفريغها، وتنظيم المعلومات، وإنشاء الملخصات والأسئلة التفاعلية لتسهيل المذاكرة والمراجعة. | Munsit is a learning platform that uses AI to help you record and transcribe lectures, organize information, and create summaries and interactive questions that make studying and review easier. |
| faq.2.q         | هل منصت بيحوّل المحاضرات لنص مكتوب؟                                                                                                                               | Does Munsit turn lectures into written text?                                                                                                                                                      |
| faq.2.a         | أيوه، منصت بيساعدك تحوّل صوت المحاضرة إلى نص مكتوب تقدر ترجعله وتراجعه بسهولة.                                                                                    | Yes. Munsit helps you turn the lecture audio into written text that you can return to and review easily.                                                                                          |
| faq.3.q         | إزاي منصت بيحدد المعلومات المهمة؟                                                                                                                                | How does Munsit identify the important information?                                                                                                                                               |
| faq.3.a         | بيستخدم تقنيات الذكاء الاصطناعي لتحليل محتوى المحاضرة والمساعدة في تمييز النقاط والمعلومات المهمة علشان تركز عليها أثناء المراجعة.                               | It uses AI techniques to analyze the lecture content and help mark the important points so you can focus on them while reviewing.                                                                 |
| faq.4.q         | هل أقدر أعمل ملخص لمحاضرتي؟                                                                                                                                      | Can I create a summary of my lecture?                                                                                                                                                             |
| faq.4.a         | أيوه، منصت بيساعدك تنظم محتوى المحاضرة وتحوّله إلى ملخصات واضحة تسهّل عليك مراجعة أهم الأفكار والمعلومات.                                                          | Yes. Munsit helps you organize the lecture content and turn it into clear summaries that make reviewing the main ideas easier.                                                                    |
| faq.5.q         | هل منصت يقدر يساعدني أستعد للامتحانات؟                                                                                                                           | Can Munsit help me prepare for exams?                                                                                                                                                             |
| faq.5.a         | منصت بيساعدك تراجع من خلال أسئلة تفاعلية مبنية على محتوى محاضراتك، علشان تختبر فهمك وتحدد النقاط اللي محتاجة تراجعها.                                            | Munsit helps you review with interactive questions based on your lecture content, so you can test your understanding and find the points you need to revisit.                                     |
| faq.6.q         | هل أقدر أسأل منصت عن حاجة مش فاهمها؟                                                                                                                             | Can I ask Munsit about something I don't understand?                                                                                                                                              |
| faq.6.a         | أيوه، تقدر تستخدم المساعد التعليمي الذكي علشان تسأل عن المعلومات الصعبة وتحصل على شرح يساعدك تفهمها بشكل أفضل.                                                   | Yes. You can use the smart learning assistant to ask about difficult information and get an explanation that helps you understand it better.                                                      |

## 8. Pricing

**Section intro** (Tablet `200:640` and Mobile `200:789` only; Desktop has none, P07-D5):

| Key                 | Arabic (Figma)                                                           | English (PROPOSED)                                                                 |
| ------------------- | ------------------------------------------------------------------------ | ---------------------------------------------------------------------------------- |
| pricing.eyebrow     | خطط الاشتراك                                                             | Plans                                                                              |
| pricing.heading     | اختار الخطة اللي تناسب رحلتك التعليمية.                                  | Choose the plan that fits your learning journey.                                   |
| pricing.description | خطط مرنة تساعدك تستفيد من منصت بالطريقة اللي تناسب احتياجاتك التعليمية.  | Flexible plans that help you use Munsit in the way that suits your learning needs. |
| pricing.note        | تفاصيل الباقات والأسعار وحدود الاستخدام سيتم تحديدها قبل الإطلاق الرسمي. | Plan details, prices and usage limits will be set before the official launch.      |

**Plan cards:** all three variants (Standard, Featured, Secondary) carry the **same placeholder
copy** in Figma (P07-D4).

| Key                    | Arabic (Figma)                     | English (PROPOSED)                                    |
| ---------------------- | ---------------------------------- | ----------------------------------------------------- |
| pricing.plan.label     | Starter                            | Starter                                               |
| pricing.plan.name      | البداية                            | Starter                                               |
| pricing.plan.text      | خطوتك الأولى نحو تجربة تعلم أذكى.  | Your first step toward a smarter learning experience. |
| pricing.plan.price     | —                                  | —                                                     |
| pricing.plan.priceNote | السعر وتفاصيل الاستخدام تُحدد لاحقًا | Price and usage details to be announced               |
| pricing.plan.feature   | ميزة الخطة — تُحدد لاحقًا (× 4)      | Plan feature — to be announced (× 4)                  |
| pricing.plan.cta       | ابدأ مجانًا                         | Get started free                                      |
| pricing.badge          | الخطة المميزة (Featured only)      | Featured plan                                         |

## 9. Final CTA

| Key             | Arabic (Figma)                                                                                     | English (PROPOSED)                                                                                                            |
| --------------- | -------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| cta.heading     | جاهز تخلي كل محاضرة خطوة لقدّام؟                                                                    | Ready to make every lecture a step forward?                                                                                   |
| cta.description | ابدأ رحلتك مع منصت، وخلّي الذكاء الاصطناعي يساعدك تنظم محاضراتك، تفهم معلوماتك، وتراجع بطريقة أذكى. | Start your journey with Munsit, and let AI help you organize your lectures, understand your material and review more smartly. |
| cta.secondary   | اكتشف المميزات                                                                                     | Explore features                                                                                                              |
| cta.primary     | ابدأ مجانًا                                                                                         | Get started free                                                                                                              |

## 10. Footer

| Key                  | Arabic (Figma)                                                                              | English (PROPOSED)                                                                                                                   |
| -------------------- | ------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| footer.brandText     | منصت، مساعدك التعليمي الذكي لفهم محاضراتك وتنظيم مذاكرتك والاستعداد لامتحاناتك بطريقة أذكى. | Munsit, your smart learning assistant for understanding your lectures, organizing your studies and preparing for exams more smartly. |
| footer.platformTitle | المنصة                                                                                      | Platform                                                                                                                             |
| footer.home          | الرئيسية                                                                                    | Home                                                                                                                                 |
| footer.features      | المميزات                                                                                    | Features                                                                                                                             |
| footer.howItWorks    | كيف يعمل؟                                                                                   | How it works                                                                                                                         |
| footer.faq           | الأسئلة الشائعة                                                                             | FAQ                                                                                                                                  |
| footer.accountTitle  | حسابك                                                                                       | Your account                                                                                                                         |
| footer.login         | تسجيل الدخول                                                                                | Log in                                                                                                                               |
| footer.register      | إنشاء حساب                                                                                  | Create account                                                                                                                       |
| footer.terms         | الشروط والأحكام                                                                             | Terms and conditions                                                                                                                 |
| footer.privacy       | سياسة الخصوصية                                                                              | Privacy policy                                                                                                                       |
| footer.copyright     | © 2026 Munsit AI. جميع الحقوق محفوظة.                                                       | © 2026 Munsit AI. All rights reserved.                                                                                               |

**Copyright:** it mixes directions, so the year and "Munsit AI" are isolated as LTR.

**Footer title sizes:** "المنصة" is 24 and "حسابك" is 20 in Figma (P07-D11).

## 11. Copy observations (Arabic kept verbatim, P07-D11)

- **Navigation and footer:** "كيف يعمل ؟ " (navigation, with a space before "؟" and a trailing
  space) and "كيف يعمل؟" (footer) are both kept **exactly as in Figma**. No normalization.
- **Two text nodes:** the Showcase lecture title is one Figma text node with a line break:
  "مقدمة في الذكاء الاصطناعي" ⏎ "محاضرة مباشرة". It is shown as two lines.
- **Hamza:** "بنك الاسئلة" (Showcase mock) has no hamza, while Feature 04 writes "بنك أسئلة". Both
  are kept verbatim.
- **Placeholder pricing:** "تُحدد لاحقًا" (to be determined later) appears on all three plans.
  It is development only and never shown to real visitors (P07-D4).

## 12. Translation flags (owner review)

| #    | Arabic                                | Proposed English                                         | Why it is flagged                                                                                         | Alternative                                       |
| ---- | ------------------------------------- | -------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- | ------------------------------------------------- |
| F-1  | منصت                                  | Munsit                                                   | Brand name: confirm the Latin spelling (the logo and copyright use "Munsit AI")                           | "Munsit AI" in headings                           |
| F-2  | ابدأ مجانًا                            | Get started free                                         | **"Free" is a commercial statement.** It is in the Arabic Figma copy, but no pricing is approved (P07-D4) | "Get started" (drops "free")                      |
| F-3  | كل كلمة ليها قيمة ومنصت مش بيفوّت كلمة | Every word matters, and Munsit doesn't miss a single one | Egyptian colloquial idiom with wordplay on "كلمة"; English loses the repetition                           | "Every word counts, and Munsit catches every one" |
| F-4  | الدكتور                               | the lecturer                                             | In Egyptian usage "الدكتور" means the university lecturer, not a medical doctor                           | "your professor"                                  |
| F-5  | خطط الاشتراك                          | Plans                                                    | Literal: "Subscription plans". "Subscription" can imply a paid offer, which is not approved               | "Subscription plans"                              |
| F-6  | البداية / Starter                     | Starter / Starter                                        | The Arabic name and the Latin label become the same word in English                                       | Show the label only                               |
| F-7  | تُحدد لاحقًا                            | to be announced                                          | Literal: "to be determined later". Development-only text                                                  | "to be determined"                                |
| F-8  | EN (language switch)                  | AR or "العربية"                                          | The English page needs the switch label for Arabic                                                        | "عربي"                                            |
| F-9  | تمييز المعلومات الذكي                 | Smart highlights                                         | Literal: "Smart information highlighting". The shorter form is a marketing paraphrase                     | "Smart information highlighting"                  |
| F-10 | سجل المحادثات                         | Chat history                                             | A mock sidebar label naming a feature that is not in the Features list. Kept as an illustration           | "Conversation history"                            |
| F-11 | الأسئلة الشائعة                       | FAQ                                                      | The abbreviation is shorter than the Arabic; the full form fits the footer                                | "Frequently asked questions"                      |

**Not flagged:** numbers, timestamps and step numbers stay as written, as LTR runs.
