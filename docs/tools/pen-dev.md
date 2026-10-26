# Pen.dev

Pen.dev (לשעבר Pencil, pencil.dev) הוא קנבס עיצוב אינסופי שנבנה סביב סוכני AI. זו אפליקציית Electron לשולחן העבודה (macOS, Windows, Linux), תוסף ל-VS Code ול-Cursor, ו-CLI. הפיקסלים לא מצוירים על ידי הדפדפן: יש מנוע ציור משלהם, Skia שקומפל ל-WASM ומצייר דרך WebGL. מה שמוצג על הקנבס הוא **מודל עיצוב נפרד** (קובץ `.pen`, עץ אובייקטים ב-JSON עם layout "דומה ל-flexbox" אבל לא CSS), ולא הקוד של הפרויקט. קוד נוצר רק כשמבקשים מהסוכן או בייצוא HTML/Tailwind, ואין סנכרון אוטומטי. הממשק לסוכן הוא שרת MCP (כתוב ב-Go) עם כלי מרכזי אחד, `execute`, שמריץ קטע JavaScript מול API של הקנבס (Insert/Update/Copy/Replace/Get וכו'). יש גם צומת `browser` שמציג דף אינטרנט חי על הקנבס דרך Electron `<webview>`, ויבוא דף אינטרנט שהופך אותו לשכבות עריכה (DOM ← צמתי `.pen`), כולל זיהוי שם הקומפוננטה של React/Vue/Svelte.

תאריך בדיקה: 2026-10-25. גרסת האפליקציה שנבדקה: Pen.app 1.2.18 (מותקנת מקומית ב-`/Applications/Pen.app`).

**איך נבדק:** בסבב הראשון קראתי את קבצי האפליקציה בלי להריץ אותה. בסבב השני (אותו יום) פתחתי את האפליקציה ועבדתי מול שרת ה-MCP `pencil` בקריאה בלבד: `get_app_state`, `get_style`, כל מסמכי `read_skill`, ו-`execute` עם `Get`/`GetVariables`/`Print` בלבד. כדי לא לגעת בקבצי המשתמש פתחתי **עותק** של טיוטה קיימת בתיקיית scratchpad. אחרי הסגירה העותק נשאר זהה למקור (אותו SHA-1) ושלוש הטיוטות המקוריות לא השתנו. תוצאות הבדיקה החיה מסומנות "pencil MCP, observed 2026-10-25" (מקור 16).

## 1. מודל הציור

- **מנוע משלהם, לא הדפדפן.** [תיעוד] דף הבית: "Thousands of layers stay smooth ... powered by a custom WebGL pipeline" ([pen.dev](https://pen.dev)).
- [קוד] בתוך האפליקציה יש קובץ `out/editor/assets/pencil-D_1SpsMI.wasm` (כ-9.5MB). המחרוזות בתוכו הן נתיבי קוד מקור של Skia (C++): `src/gpu/ganesh/gl/GrGLGpu.cpp`, `src/sksl/...`, `src/pdf/SkPDFDocument.cpp`. כלומר Skia עם צד GPU מסוג Ganesh על WebGL, קומפל ל-WASM ב-Emscripten. ([Pen.app bundle](#מקורות), מקור 9)
- [קוד] זה build משלהם ולא CanvasKit הרגיל: הפונקציות המיוצאות נקראות `_pencil_picture_cull_rect`, `_pencil_text_blob_dispose` וכו', וב-JS יש אובייקט `skiaRenderer` עם `invalidateContent(node)` ו-`fontManager` ([index.js בתוך app.asar](#מקורות), מקור 10).
- [קוד] ב-JS יש גם PixiJS (הודעות `"PixiJS Warning"`, קבצי `browserAll.js`/`webworkerAll.js`) ומבנה scene graph עם `culled`/`cullable` ([מקור 10](#מקורות)). [הסקה] נראה ש-Pixi משמש כ-scene graph/אינטראקציה והציור עצמו של התוכן נעשה ב-Skia. החלוקה המדויקת בין Pixi ל-Skia: **לא פורסם**, וגם בבדיקה החיה לא הצלחתי לאמת אותה בכלים לקריאה בלבד.
- [קוד] בזמן ריצה, תהליכי העזר של Electron (`Pen Helper`) רצים עם הדגל `--enable-unsafe-webgpu` (נראה ב-`ps`, observed 2026-10-25), ויש תהליך `gpu-process` נפרד. [הסקה] יכול להיות שיש מסלול WebGPU או ניסוי בו, אבל מחרוזות ה-Skia ב-WASM הן של Ganesh/GL, ולכן הציור עצמו כנראה על WebGL. אם יש שימוש ב-WebGPU: **לא פורסם**.
- **שפה:** Skia ב-C++ ← WASM; העורך ב-TypeScript; שרת ה-MCP ב-Go ([קוד] הקובץ `mcp-server-darwin-arm64` מכיל `runtime.goexit` ונתיב `github.com/highagency/ha/servers/mcp/tools/spawn_agents.go`, מקור 9).
- **חריג אחד: צומת `browser`.** [קוד] דף אינטרנט חי מוצג ב-Electron `<webview>` אמיתי (תהליך נפרד, כמו iframe) שממוקם מעל הקנבס עם `style.transform`, ובשאר הזמן מוחלף בתמונת snapshot שנכנסת לציור של Skia (`capturePage` / `beginFrameSubscription` ← bitmap) ([browser-node-ipc.js, index.js](#מקורות), מקורות 10–11). כלומר: מעורב, אבל רק לדפים חיים.

## 2. מה מוצג על הקנבס

- [תיעוד] מודל עיצוב נפרד: קובץ `.pen` הוא "an object tree, similar to HTML or SVG" ([The .pen Format](https://docs.pen.dev/for-developers/the-pen-format)).
- [קוד] ההוראות לסוכן אומרות במפורש: "Do NOT use or think in CSS/HTML properties or behavior. pen.dev uses a custom format and has its own layout, rendering" ואין תמיכה ב-margin, אחוזים, `alignItems: baseline/stretch` ([SKILL.md בתוך האפליקציה](#מקורות), מקור 12).
- [תיעוד] קוד נוצר רק כשמבקשים: "Design and code update when you ask the agent to make a change" ([Design ↔ Code](https://docs.pen.dev/design-and-code/design-to-code)). ייצוא ישיר הוא HTML+CSS או HTML+Tailwind ([Import and Export](https://docs.pen.dev/core-concepts/import-and-export)).
- [הסקה] "מה שרואים זה מה שנשלח" נמוך: מה שעל הקנבס הוא ציור של Skia לפי מודל משלהם; הקוד הוא תרגום שהסוכן כותב אחר כך, ולכן ההוראות לסוכן (`guide/code.md`) מבקשות "Verify pixel-perfect match" בין צילום מסך של העיצוב לבין הקומפוננטה ב-React (מקור 13).
- [קוד] יבוא מהדפדפן הופך DOM אמיתי לשכבות `.pen` לפי computed styles, ו"Imported layers do not retain the page's JavaScript interactions" ([תיעוד](https://docs.pen.dev/core-concepts/import-and-export)). אחרי היבוא: "Do NOT think in CSS/HTML afterwards" (תיאור כלי `browser`, MCP tool schema, observed 2026-10-25).

## 3. בידוד בין פריימים

- [הסקה] לא רלוונטי במובן שלנו: פריימים הם צמתים במודל פנימי ש-Skia מצייר, אין CSS ואין ירושה מהדף, ולכן אין מה לבודד.
- **אין ירושה:** [קוד] ההוראות לסוכן: "Properties do not cascade from parents to children. Every node is independent and must have all necessary properties specified". גם overrides במופע "will be only applied to the object it's overriding" (read_skill SKILL.md ו-guide/components.md, pencil MCP, observed 2026-10-25). כלומר אין מקבילה ל-inheritance של CSS (צבע או פונט של אבא), וגם אין מה לבודד.
- **פונטים:** [תיעוד] הסכמה הציבורית לא מתארת איך קבצי פונט נטענים ([.pen Format](https://docs.pen.dev/for-developers/the-pen-format)). [קוד] בקבצי `.pen` אמיתיים על הדיסק יש מפתח עליון **שלא מופיע בסכמה**, `fonts`: מערך של `{name, url, weight?}` שמצביע על קבצי `woff2` שהועתקו לתיקייה `fonts/pen.dev/` ליד המסמך (למשל `{"name": "InterDisplay", "url": "fonts/pen.dev/6896525e24a8d384.woff2", "weight": 500}`; `~/.pencil/documents/<uuid>/untitled.pen`, מקור 17). זה מתחבר ל-`fontManager.setDocumentFontLibrary(...)` בעורך (מקור 10). [קוד] ההוראות לסוכן: "All Google fonts are available" (SKILL.md). [הסקה] יש ספריית פונטים ברמת המסמך, שהקבצים שלה מועתקים פנימה, ופונטי Google מגיעים מהשירות. איך פונטי Google נטענים בפועל (מטמון או רשת): **לא פורסם**.
- **משתנים:** [תיעוד] משתני מסמך (`$name`), לא CSS custom properties (ראו סעיף 4).
- **Media queries:** [תיעוד] אין. במקומם "themes" עם צירים (למשל `device: phone`) שכל צומת יכול לבחור ל-subtree שלו ([.pen Format](https://docs.pen.dev/for-developers/the-pen-format)).
- **צומת browser:** [קוד] כל דף חי רץ ב-`<webview>` נפרד עם `partition` משלו, כלומר בידוד מלא של תהליך (מקור 10).
- **צומת script:** [תיעוד] רץ ב-sandbox בלי גישה ל-"the DOM, network, or filesystem", סינכרוני, עד 1000 צמתים ו-2 שניות ([Code on Canvas](https://docs.pen.dev/core-concepts/code-on-canvas)). [קוד] ה-CLI תלוי ב-`@jitl/quickjs-wasmfile-*` והעורך מכיל QuickJS, כלומר JS רץ במנוע QuickJS בתוך WASM ([npm](https://www.npmjs.com/package/@pen.dev/cli), מקור 10).

## 4. מודל המסמך

- **פורמט:** [תיעוד] JSON (עם הערות), שורש `Document` עם `version`, `themes`, `imports`, `variables`, `children` ([.pen Format](https://docs.pen.dev/for-developers/the-pen-format)). [קוד] הקבצים שמגיעים עם האפליקציה (`out/data/untitled.pen`) הם JSON רגיל עם `"version": "2.6"`; הסכמה הנוכחית `"2.21"` (מקור 12).
- **"מוצפן"? לא. הסתירה נסגרה.** [קוד] הוראות שרת ה-MCP אומרות ".pen files are encrypted: access them only via the MCP tools" (מחרוזת בתוך `mcp-server-darwin-arm64`). בפועל בדקתי את שלוש הטיוטות ששמורות על הדיסק (`~/.pencil/documents/<uuid>/untitled.pen`, הנתיבים מתוך `~/Library/Application Support/Pen/recent-documents.json`): כולן טקסט ASCII/UTF-8 שמתחיל ב-`{"version": "2.21"` (אחת `2.20`), ו-`JSON.parse` עובר עליהן בלי בעיה (271, 375 ו-701 צמתים) (מקור 17). [הסקה] המשפט "encrypted" הוא הנחיה שמטרתה להרחיק סוכנים מעריכה ישירה של ה-JSON, ולא תיאור של הפורמט. זה מתאים לתיעוד: "Don't resolve design conflicts by editing the JSON directly" ([.pen Files](https://docs.pen.dev/core-concepts/pen-files)).
- **מפתחות שלא בסכמה:** [קוד] בקבצים על הדיסק יש גם `fileToken` (מחרוזת של 36 תווים, בצורת UUID) ואת `fonts` שתואר בסעיף 3. אף אחד מהם לא מופיע ב-`pen-schema.md` או בתיעוד (מקור 17). למה משמש `fileToken`: **לא פורסם**.
- **איפה נשמרות טיוטות:** [קוד] טיוטות בדסקטופ נשמרות ב-`~/.pencil/documents/<uuid>/untitled.pen`, עם תיקיות `images/` ו-`fonts/` לידן (מקור 17).
- **סוגי צמתים:** [תיעוד] `frame`, `group`, `rectangle`, `ellipse`, `polygon`, `path`, `text`, `note`, `prompt`, `context`, `icon`, `script`, `browser`, `ref`. אין צומת image; תמונה היא fill ([.pen Format](https://docs.pen.dev/for-developers/the-pen-format), [execute.md](#מקורות)).
- **Layout:** [תיעוד] `layout: none|vertical|horizontal`, `gap`, `padding`, `justifyContent`, `alignItems`, גדלים `fill_container`/`fit_content`, ו-`layoutPosition: "absolute"`.
- **קומפוננטות ומופעים:** [תיעוד] `reusable: true` הופך צומת לקומפוננטה; מופע הוא `{type: "ref", ref: id}`. Override ישיר על המופע, ו-`descendants` לפי מזהה או נתיב עם `/` (למשל `"ok-button/label"`). אם ב-override יש `type` הצומת מוחלף כולו; אם יש `children` רק הילדים מוחלפים.
- **מחיקה בתוך מופע:** [קוד] אי אפשר; מכבים עם `enabled: false` (execute.md, מקור 12).
- **Slots:** [תיעוד] פריים יכול לקבל `slot: false | [ids]` עם רשימת קומפוננטות מומלצות להכנסה ([Slots](https://docs.pen.dev/core-concepts/slots)).
- **משתנים ו-themes:** [תיעוד] משתנים מטיפוס boolean/color/number/string, הפניה עם `$`. ערך יכול להיות מערך של `{value, theme}` ו"the value that wins ... is the _last_ one whose theme is satisfied". הציר הראשון בכל theme הוא ברירת המחדל.
- **איפה נשמרים סגנונות:** [תיעוד] inline על כל צומת (`fill`, `stroke`, `effect`, טקסט), עם קשירה למשתנים. אין אובייקטי style נפרדים.
- **ספריות:** [תיעוד] `imports` ממפה כינוי לנתיב יחסי של קובץ `.pen` אחר. [קוד] האפליקציה מגיעה עם ספריות כמו `shadcn.lib.pen`, `halo.lib.pen` (מקור 9). בטיוטה אמיתית: `"imports": {"u": "pencil:shadcn.lib.pen"}` (סכמת URI פנימית `pencil:`, מקור 17).
- **איך ספרייה מיובאת נראית בזמן ריצה:** [קוד] כל הצמתים, המשתנים וה-themes של הספרייה נכנסים למסמך עם קידומת הכינוי. מזהים כמו `u:VSnC2` ("Button/Default"), משתנים כמו `$u:--primary` ו-`$u:--primary-foreground` (בדיוק השמות של CSS custom properties ב-shadcn), וצירי theme כמו `u:Mode: [Light, Dark]`, `u:Base`, `u:Accent`. לפי `GetVariables` היו במסמך 81 משתנים, ו-`get_app_state` הציג כ-85 קומפוננטות מהספרייה, והשורש של הספרייה (`u:MzSDs`) מופיע כצומת עליון נוסף (pencil MCP, observed 2026-10-25). `Get(..., {resolveVariables: true})` מחזיר ערכים מחושבים (למשל `$u:--primary` ← `#171717`).
- **סתירה קטנה בהוראות:** [קוד] `guide/components.md` אומר "You cannot reference components across files. If you want to use a component from a different file you must copy it over", אבל `get_app_state` מציג קומפוננטות מספרייה מיובאת (`u:...`) כקומפוננטות זמינות. [הסקה] כנראה הכוונה שאי אפשר להפנות לקובץ אחר בלי `imports`. לא פורסם הסבר.
- **שדה `context`:** [קוד] כל ישות יכולה לשאת `context?: string` (pen-schema.md). ביבוא מדפדפן הוא מקבל את שם התגית ואת שם הקומפוננטה (למשל `"Card - div"`) (תיאור כלי `browser`, MCP tool schema, observed 2026-10-25).
- **שיתוף בזמן אמת:** [קוד] ההוראות אומרות "pen.dev is a collaborative multiplayer environment" (SKILL.md), ובעורך יש הפניות ל-`yjs` (מקור 10). [הסקה] כנראה Yjs לסנכרון. איך זה בנוי בפועל: **לא פורסם**.

## 5. הלוך ושוב לקוד

- **קנבס ← קוד:** [תיעוד] רק דרך הסוכן ("Design and code update when you ask the agent") או ייצוא HTML ([Design ↔ Code](https://docs.pen.dev/design-and-code/design-to-code)). [קוד] ההוראות לסוכן: לזהות את ה-framework והסגנון של הפרויקט, "If the UI design element ... already exist in the codebase, update it, not generate a new one", לעבור קומפוננטה אחרי קומפוננטה ולהשוות בצילום מסך (guide/code.md, מקור 13).
- **ייצוא HTML:** [קוד] `Export(ids, "html-tailwind" | "html-css", path, {includeLayerNames, includeLayerIds})` כותב את שמות השכבות ואופציונלית את המזהים כ-data attributes (execute.md, מקור 12). [הסקה] זה הקישור היחיד מהקוד שנוצר בחזרה לצומת; אין קישור מקובץ מקור.
- **איך צומת יודע מאיזה קובץ הגיע:** **לא פורסם**, ולא מצאתי בקוד. [קוד] בבדיקה החיה, צמתים שנקראו עם `Get` מכילים רק `id`, `name`, `type` ותכונות עיצוב, ואין שדה של קובץ או שורה (pencil MCP, observed 2026-10-25). שדה `context` קיים בסכמה, אבל לא הופיע בצמתים שקראתי. [קוד] ביבוא מדפדפן נשמר **שם** הקומפוננטה בלבד: הקוד הולך על ה-fiber של React (`__reactFiber$`), על `__vueParentComponent` ב-Vue 3 ועל `__svelte_meta` ב-Svelte, ושומר את השם רק "on the element where the component's DOM starts" (`@ha/browser-inject/src/component-name-source.ts`, `dom-crawl.ts`, מקור 14). אין שימוש ב-`_debugSource`/מספר שורה.
- **כשהקוד משתנה:** [תיעוד] אין זיהוי אוטומטי; מבקשים מהסוכן לייבא/לסנכרן מחדש. החריגים הם צומת `script` (שמירה של קובץ ה-`.js` מעדכנת את הקנבס מיד) וצומת `browser` (דף חי, למשל localhost עם hot reload) ([Code on Canvas](https://docs.pen.dev/core-concepts/code-on-canvas), whiteboard.md).
- **Git:** [תיעוד] קבצי `.pen` נשמרים ב-repo; בקונפליקט לא לפתור ב-JSON אלא לבחור גרסה ולהחיל מחדש בעורך ([.pen Files](https://docs.pen.dev/core-concepts/pen-files), [Design as Code](https://docs.pen.dev/core-concepts/design-as-code)).

## 6. ממשק לסוכן

- **איך מתחברים:** [תיעוד] שרת MCP בשם `pencil` שמדבר עם הלקוח ב-stdio ומגיע לאפליקציה הפתוחה דרך Unix socket (macOS/Linux) או named pipe (Windows). האפליקציה מגדירה בעצמה את Claude Code, Codex, Gemini CLI, Cursor ואחרים ([AI Integration](https://docs.pen.dev/getting-started/ai-integration), [Installation](https://docs.pen.dev/getting-started/installation)). [קוד] בתוך האפליקציה ארוזים Claude Agent SDK, Codex SDK ו-Cursor SDK לסוכן המובנה (מקור 9).
- **הכלים** (MCP tool schema, observed 2026-10-25; האפליקציה לא רצה בזמן הבדיקה ולכן הקריאות עצמן נכשלו, אבל הסכמות זמינות):
  - `get_app_state` — מצב האפליקציה, הבחירה הנוכחית, ותיעוד `execute`.
  - `read_skill({path?})` — קורא את מסמכי ה-skill (SKILL.md, pen-schema.md, execute.md, guide/*).
  - `get_style({name?, params?})` — ארכיטיפים של סגנון (פונטים, צבעים, תמונות) כערכי ייחוס.
  - `execute({filePath, description, input | edits+editId})` — מריץ קטע JavaScript מול המסמך. אם נכשל: כל השינויים מתבטלים, ומתקנים עם `edits` (find/replace על הקטע שנכשל) במקום לשלוח מחדש.
  - `browser({action, ...})` — `load-page`, `import-to-canvas`, `screenshot-to-canvas`, `return-element` (DOM + computed styles), `return-screenshot`, `cdp` (פקודת Chrome DevTools אחת; מותרים רק DOM, Input, Page, Runtime, Emulation, CSS, Accessibility). רק באפליקציית הדסקטופ.
  - `spawn_agents` — [תיעוד] רק עם הדגל `-enable_spawn_agents`; [קוד] מפצל עבודה בין כמה "designer agents" (מחרוזת בבינארי, מקור 9).
- **ה-API בתוך `execute`:** [קוד] `Insert`, `Copy`, `Update`, `Replace`, `Move`, `Delete`, `Generate` (תמונת AI, stock, SVG, הסרת רקע), `SetVariables`, `Get` (עם visitor שמקבל `bounds` ו-`problems: "partially clipped" | "fully clipped"`), `GetVariables`, `FindEmptySpace`, `Print`, `TakeScreenshot`, `Export`. מזהים נוצרים על ידי המערכת, והסוכן חייב לתת `name` לכל צומת; בסוף כל קריאה חוזרת מפה שם ← מזהה (execute.md, מקור 12).
- **מה ראיתי בבדיקה החיה** (pencil MCP, observed 2026-10-25):
  - בלי מסמך פתוח, כל הכלים (גם `get_app_state` ו-`get_style`) מחזירים "A file needs to be open in the editor to perform this action". כלומר השרת קשור למסמך פתוח באפליקציה.
  - `get_app_state` מחזיר Markdown קצר: הנתיב של המסמך הפעיל, הבחירה, צמתים עליונים, רשימת כל הקומפוננטות (`id: name`), מצב הדפדפן המובנה, והאם המשתמש מחובר ל-pen.dev.
  - `get_style()` מחזיר 62 סגנונות עם משפט תיאור לכל אחד, בעוד שב-SKILL.md מופיעים רק 26. הרשימה בשרת חדשה יותר מהמסמך.
  - `execute` שנכשל באמת מבטל הכל ("All operations in this block have been rolled back") ומחזיר `editId`. התיקון עם `edits` עבד.
  - **באג או מגבלה:** visitor על כל המסמך (`Get(visit)` בלי נתיב) ו-visitor על תת-עץ של ספרייה מיובאת (`Get("u:MzSDs", visit)`) נכשלו שניהם עם "TypeError: cannot read property of undefined". visitor על פריים מקומי (`Get("u15mjA", visit)`) עבד, ו-`Get(id, {depth})` עבד גם על צמתי ספרייה. לא בדקתי מעבר לזה (שני ניסיונות).
  - תוצאת visitor על פריים מקומי: 271 צמתים (145 frame, 78 text, 35 icon, 12 rectangle, 1 ellipse), עומק מקסימלי 7, ואף צומת לא מסומן כ-clipped.
- **דפוסים שימושיים:** [קוד] דגל `placeholder: true` בזמן בנייה ואז `false`; "There is deliberately no visitor-less whole-document read"; צילומי מסך "expensive - use them sparingly" ועדיף לבדוק layout עם `ctx.bounds` (execute.md).
- **CLI:** [תיעוד] `@pen.dev/cli` (פקודה `pen`), כולל `pen interactive -o file.pen` שהוא "local editor with no GUI", ו-`--export` ל-png/jpeg/webp/pdf ([pen.dev CLI](https://docs.pen.dev/for-developers/pen-cli)). [קוד] חבילה `@ha/headless` עם `preview-process.mjs` של כ-4.6MB, כלומר העורך כולו רץ גם בלי חלון (מקור 9).
- **WebMCP:** [תיעוד] מוזכר בדף הבית בלבד. איך הוא עובד: **לא פורסם**.
- **`spawn_agents`:** לא היה זמין בסשן (השרת לא הופעל עם הדגל). איך הוא עובד מעבר למחרוזות בבינארי: **לא פורסם**.

## 7. ביצועים

- [תיעוד] "Thousands of layers stay smooth as you pan, zoom, and edit" ו-"10000 photos, 10GB of content, 60fps" ([pen.dev](https://pen.dev)). אין פירוט טכני או מדידה.
- [קוד] יש culling: צמתים עם `culled`/`cullable`/`cullArea`, ו-Skia `picture` עם `cull_rect` (הקלטה של פקודות ציור לכל צומת ושימוש חוזר, `invalidateContent(node)` רק לצומת שהשתנה) (מקור 10). [הסקה] כלומר מטמון של "תמונת פקודות" לכל צומת וציור מחדש רק של מה שהשתנה.
- [קוד] ייצוא raster מוגבל ל-`Math.min(8192, maxTextureSize)` (מקור 10).
- [קוד] דף חי בצומת `browser`: עדכון snapshot לכל היותר כל 400ms, ברוחב עד 1024px, כ-JPEG באיכות 70 (`FEED_FORWARD_INTERVAL_MS`, `FEED_MAX_WIDTH`, browser-node-ipc.js, מקור 11).
- [תיעוד] צומת `script`: עד 1000 צמתים ו-2 שניות ([Code on Canvas](https://docs.pen.dev/core-concepts/code-on-canvas)).
- מספר מקסימלי של פריימים/צמתים במסמך: **לא פורסם**.
- איך עובד ה-zoom (רזולוציה, tiles, LOD) ומדידות FPS אמיתיות: **לא פורסם**. בבדיקה החיה לא מדדתי ביצועים, כי זה דורש עבודה על הקנבס ולא רק קריאה.
- [קוד] קבצים אמיתיים על הדיסק: 127KB עד 398KB ל-271 עד 701 צמתים (מקור 17). ההוראות לסוכן מגבילות את גודל הקריאה: "There is deliberately no visitor-less whole-document read".

## 8. אינטראקציה/הרצה

- [תיעוד] אין מצב prototype/play לעיצובים. יש רק מצב "Present" לשקפים (`Cmd/Ctrl + Enter`, חיצים, `Esc` חוזר לעריכה) ([Slides and presentations](https://docs.pen.dev/core-concepts/presentations)).
- [תיעוד] צומת `browser` הוא הדבר היחיד שבאמת "רץ": "The user can scroll, click, and sign in inside it" (whiteboard.md, מקור 12). [קוד] כשהוא חי זה `<webview>` מעל הקנבס; כשלא, זו תמונה שקפואה בתוך הציור (מקורות 10–11).
- [תיעוד] צומת `script` מתעדכן מיד כשמשנים קלט או שומרים את קובץ ה-JS, אבל הוא מייצר צמתים סטטיים ולא אינטראקציה.
- [קוד] shaders: יש uniforms מיוחדים `@time` ו-`@mouse` ל-"interactive effects" ואנימציה (scripts-and-shaders.md, pencil MCP, observed 2026-10-25). [הסקה] זו האינטראקציה היחידה שקיימת במצב עריכה, ברמת אפקט גרפי ולא ברמת UI.
- קישורים בין פריימים, מצבי hover או prototype: **לא פורסם**.

## 9. מה רלוונטי לנו

1. **לא לאמץ את מודל הציור.** Pen.dev בחר במנוע משלו (Skia ב-WASM) ובפורמט משלו, ולכן הם צריכים סוכן שמתרגם לקוד ובודק "pixel-perfect match" בצילום מסך. זה בדיוק הפער ש-DOM Canvas נמנע ממנו כשהדפדפן מצייר HTML/CSS אמיתי. היתרון שלנו ל-Sketchpad ("מה שרואים זה הקוד") הוא נקודת המכירה; כדאי להגיד אותה במפורש מול כלים כאלה.
2. **לאמץ את צורת ממשק הסוכן.** כלי אחד `execute` עם API קטן (Insert/Update/Get עם visitor שמחזיר `bounds` ו-"clipped"), ביטול אוטומטי של כל הקריאה כשיש שגיאה, תיקון עם `edits` במקום שליחה מחדש, ומפת שם ← מזהה בסוף. זה חוסך טוקנים לסוכן. אצלנו אפשר לחשוף אותו רעיון מעל פריימים של HTML: הסוכן כותב HTML לפריים, ו-`Get` מחזיר מידות אמיתיות מ-`getBoundingClientRect` ובעיות חיתוך.
3. **לאמץ את "דף חי מעל הקנבס + snapshot כשלא פעיל".** זה הפתרון שלהם לתוכן שרץ באמת: `<webview>` (מקביל ל-iframe שלנו במצב Play) רק כשצריך, ותמונה בשאר הזמן, עם תקרת קצב ורוחב (400ms, 1024px). דומה למצב Play שלנו ומאשר את הכיוון של "סקריפטים רק ב-iframe".
4. **זיהוי קומפוננטה מה-DOM.** הקוד שלהם מוצא שם קומפוננטה דרך `__reactFiber$` / `__vueParentComponent` / `__svelte_meta` ושומר אותו רק בגבול הקומפוננטה. ל-Sketchpad זה שימושי כשמציגים קוד אמיתי: אפשר לסמן שכבות לפי שם קומפוננטה בלי build plugin. אבל הם לא מגיעים לקובץ ולשורה; אם נרצה "מאיזה קובץ זה בא" נצטרך מקור אחר (למשל data attribute שהסוכן כותב, או `_debugSource` ב-React dev).
5. **ספריית פונטים ברמת המסמך, וספריות עם קידומת שם.** אצלם המסמך מחזיק רשימת `fonts` מפורשת עם קבצים שמועתקים לידו, וספרייה מיובאת נכנסת עם קידומת (`u:VSnC2`, `$u:--primary`) כדי שלא תתנגש. שני הרעיונות מתאימים לנו: לנו כבר יש העלאה של `@font-face` לרמת המסמך, ורשימת פונטים מפורשת לכל פרויקט תעזור לסוכן לדעת מה זמין. קידומת שם לטוקנים של ספרייה תמנע התנגשויות כש-Sketchpad יציג כמה ספריות על אותו קנבס.


**פחות חשוב עכשיו:** themes כצירים במקום media queries, slots עם רשימת קומפוננטות מומלצות, ו-multiplayer. אצלנו CSS אמיתי כבר נותן משתנים ו-media queries (container units), ולכן לא צריך להמציא מודל משלנו. שווה רק לזכור את רעיון ה-slot המומלץ כשנגיע לעריכת קומפוננטות.

## מקורות

1. [pen.dev](https://pen.dev) — דף הבית: פלטפורמות, "custom WebGL pipeline", ביצועים, MCP/CLI.
2. [The .pen Format](https://docs.pen.dev/for-developers/the-pen-format) — סכמה, צמתים, layout, קומפוננטות, slots, משתנים, themes.
3. [AI Integration](https://docs.pen.dev/getting-started/ai-integration) — חיבור MCP, stdio, socket/pipe, רשימת כלים.
4. [pen.dev CLI](https://docs.pen.dev/for-developers/pen-cli) — `@pen.dev/cli`, מצב headless, ייצוא.
5. [Design ↔ Code](https://docs.pen.dev/design-and-code/design-to-code) — סנכרון לפי בקשה לסוכן.
6. [Code on Canvas](https://docs.pen.dev/core-concepts/code-on-canvas) — צומת script, sandbox, מגבלות.
7. [.pen Files](https://docs.pen.dev/core-concepts/pen-files), [Design as Code](https://docs.pen.dev/core-concepts/design-as-code), [Import and Export](https://docs.pen.dev/core-concepts/import-and-export), [Installation](https://docs.pen.dev/getting-started/installation), [Slides and presentations](https://docs.pen.dev/core-concepts/presentations), [FAQ](https://pen.dev/faq) — שמירה, Git, יבוא/ייצוא, פלטפורמות, מצב Present.
8. [npm: @pen.dev/cli](https://www.npmjs.com/package/@pen.dev/cli) — גרסה 0.3.13, תלויות (QuickJS WASM, Claude Agent SDK, Codex SDK).
9. חבילת האפליקציה המקומית `/Applications/Pen.app` (גרסה 1.2.18, `dev.pencil.desktop`) — `Electron Framework.framework`, רשימת קבצים ב-`app.asar`, `pencil-*.wasm` עם מחרוזות Skia, `mcp-server-darwin-arm64` (Go), חבילות `@ha/*`. נקרא בלבד, לא הורץ.
10. `out/editor/assets/index.js` מתוך `app.asar` — `skiaRenderer`, `_pencil_*` FFI, PixiJS, culling, `createWebview`, QuickJS, yjs.
11. `out/browser-node-ipc.js` ו-`out/browser-node-capture.js` מתוך `app.asar` — `<webview>`, `capturePage`, `beginFrameSubscription`, קצב 400ms ורוחב 1024px.
12. `app.asar.unpacked/out/skills/pen-dev/` — `SKILL.md`, `execute.md`, `pen-schema.md`, `whiteboard.md` (מסמכי ה-skill ש-`read_skill` מגיש).
13. `app.asar.unpacked/out/skills/pen-dev/guide/code.md` — הוראות לסוכן ליצירת קוד מ-`.pen`.
14. `node_modules/@ha/browser-inject/src/component-name-source.ts` ו-`dom-crawl.ts` מתוך `app.asar` — זיהוי שם קומפוננטה React/Vue/Svelte ביבוא.
15. סכמות כלי ה-MCP `pencil` (`get_app_state`, `read_skill`, `get_style`, `execute`, `browser`) והוראות השרת — MCP tool schema, observed 2026-10-25.
16. pencil MCP, observed 2026-10-25 — הרצה חיה בקריאה בלבד מול עותק של טיוטה: `get_app_state`, `get_style()`, `read_skill` לכל המסמכים (SKILL.md, pen-schema.md, execute.md, generate.md, scripts-and-shaders.md, whiteboard.md, guide/components.md, design-system.md, tailwind.md, slides.md, web-app.md, table.md, landing-page.md, mobile-app.md), ו-`execute` עם `Get`/`GetVariables`/`Print` בלבד; בנוסף `ps` על תהליכי העזר.
17. קבצים מקומיים: `~/Library/Application Support/Pen/recent-documents.json`, `config.json`, וטיוטות ב-`~/.pencil/documents/<uuid>/untitled.pen` (עם `fonts/pen.dev/*.woff2` ו-`images/`). נבדקו בקריאה בלבד: `file`, `xxd`, `JSON.parse`, ספירת צמתים ומפתחות.
