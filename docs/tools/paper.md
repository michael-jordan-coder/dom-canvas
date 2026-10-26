# Paper

Paper (paper.design) הוא כלי עיצוב על קנבס אינסופי שבו כל שכבה היא אלמנט HTML אמיתי בדפדפן, ולא ציור במנוע משלו כמו Figma. כל הפריימים יושבים **באותו מסמך**: בלי iframe ובלי shadow root, בתוך div אחד של "מצלמה" שזז ב־transform. גם האפליקציה למחשב היא רק מעטפת Electron שטוענת את אותה אפליקציית ווב מ־`app.paper.design`. מה שנשמר בקובץ הוא **לא** הקוד של הפרויקט אלא מודל עיצוב משלו: עץ צמתים מסוג Frame, Text, SVG ו־Shader*, שכל אחד מהם נושא אובייקט סגנונות inline מתוך תת־קבוצה מצומצמת של CSS (flex, padding, gap; בלי margin, grid, class או stylesheet). הקובץ הוא JSON שמסתנכרן לשרת בזמן אמת דרך WebSocket. כש־HTML נכנס (מסוכן, מהדבקה או מ־Snapshot), הוא מתפרק לצמתים, וכשהוא יוצא (Copy as React / Tailwind, `get_jsx`) הוא נבנה מחדש. הממשק לסוכן הוא שרת MCP שרץ ב־Electron ומפעיל פונקציות בתוך דף העורך. קומפוננטות, מופעים וקומפוננטות מהקוד לא קיימים, לא בתיעוד ולא בקוד שנבדק (אוקטובר 2026).

הערה על השיטה: בסבב הראשון Paper Desktop לא רץ. בסבב השני (25.10.2026) הפעלתי את האפליקציה, קראתי את המדריכים של ה־MCP, והרצתי כלי קריאה בלבד על הקובץ הפתוח "Welcome to Paper" (artboard אחד, 17 צמתים). בנוסף בדקתי את חבילת האפליקציה `/Applications/Paper.app`, ‏Paper Desktop **0.5.16** (build `261015tx3mukqib`, ‏Electron עם Chrome 152), ואת קבצי ה־JS הציבוריים של העורך מ־`app.paper.design/assets/` (הקובץ הראשי `main-BqJp0QF7.js`, כ־4MB, נשלף ב־25.10.2026). כל החילוץ נעשה לתיקיית scratchpad בלבד, והחבילה לא שונתה. ראיות מהקוד הממוזער מסומנות [קוד] עם שם הקובץ. שמות הפונקציות שם מקוצרים, ולכן הפרשנות שלהן נשענת על מחרוזות, מאפיינים ומבנה.

## 1. מודל הציור

- **הדפדפן מצייר את השכבות כ־HTML/CSS.** [תיעוד] "Paper bet on HTML and CSS as our rendering engine" ([Series A](https://paper.design/blog/series-a)), ‏"html, css, dom" ([A real space to design](https://paper.design/blog/a-real-space-to-design-in-the-age-of-agents)).
- **כל צומת הוא קומפוננטת React שמציירת אלמנט DOM.** [קוד] בעורך יש קומפוננטה בשם `RenderNode` שמציירת לכל צומת `p.component` עם `"data-node-id"`, ‏`style:t.renderingStyleData.styles`, ואת הילדים באופן רקורסיבי (`main-BqJp0QF7.js`). המצב מנוהל ב־MobX (‏`makeAutoObservable`, ‏`transaction`), ועריכת הטקסט ב־ProseMirror (‏`applyTransaction`, ‏`filterTransaction`) (אותו קובץ).
- **מצלמה = div אחד עם transform.** [קוד] div בשם `paper-camera` עם `transformOrigin:"top left"`, ‏`backfaceVisibility:"hidden"`, ‏`pointerEvents:"none"`, ועוטף אותו div עם `contain:"strict"` (`main-BqJp0QF7.js`).
- **שיידרים ב־WebGL2.** [קוד] בעורך יש סוגי צמתים כמו `ShaderMeshGradient`, ‏`ShaderLiquidMetal` ועוד כ־20 (`main-BqJp0QF7.js`). בספרייה הפתוחה, ‏`ShaderMount` יוצר `getContext('webgl2')` ([shader-mount.ts](https://github.com/paper-design/shaders/blob/main/packages/shaders/src/shader-mount.ts)).
- **"HTML-in-canvas" משמש לייצוא בלבד.** [קוד] ב־Electron מופעל דגל Chromium בשם `CanvasDrawElement`, עם ההערה "This enables html-in-canvas which we're using for video export on desktop. See: https://github.com/WICG/html-in-canvas" (`Paper.app/Contents/Resources/app.asar` → `src/main.ts`, גרסה 0.5.16). בעורך יש בדיקה ל־`CanvasRenderingContext2D.prototype.drawElementImage` ול־`requestPaint`, וקריאה ל־`drawElementImage(...)` בתוך `onpaint`, עם גבול של `16e3` פיקסלים לצלע (`main-BqJp0QF7.js`, ובחלקים `video-html-in-canvas-*.js` ו־`video-element-capture-*.js`). כלומר הקנבס החי לא מצויר ב־canvas: הם מציירים את ה־DOM לתוך canvas רק כדי להוציא וידאו או תמונה.
- **שפה:** [קוד] TypeScript + React + MobX, נבנה ב־Vite (שמות חלקים `name-hash.js`). המעטפת היא Electron דרך ToDesktop, עם Hono ו־`@modelcontextprotocol/sdk` לשרת ה־MCP (`app.asar` → `package.json`, גרסה 0.5.16). WASM יש רק לקידוד AVIF (`avif_enc*.wasm`). הצהרה רשמית על שפת העורך: לא פורסם. השפה נקבעה כאן רק מהקוד.

## 2. מה מוצג על הקנבס

- **מודל עיצוב משלו, ולא הקוד של הפרויקט.** [קוד] התיאור של `write_html`: "HTML string to parse into design nodes". ‏`get_node_info` החזיר `"component": "Frame"`, ובעורך נמצאו סוגי הצמתים `Frame`, ‏`Text`, ‏`SVG` ו־`Shader*` (Paper MCP, נצפה 25.10.2026; `main-BqJp0QF7.js`).
- **ייבוא HTML מתרגם, לא מעתיק.** [קוד] חלק הייבוא (`code-import-DJDd27_2.js`) קורא רק את `style` ה־inline של כל אלמנט (דרך `e.style` ו־`getAttribute("style")`), ולא קורא `getComputedStyle` או stylesheets. הוא מוחק `top/left` ממיקום static, ומתייחס במיוחד ל־`marginTop/Bottom/Left/Right` לצד `gap` במכלי flex. [הסקה] כנראה מתרגם margin ל־gap. הוכחה ישירה לתרגום הזה: לא פורסם.
- **תת־קבוצה של CSS.** [קוד] חוקי `write_html`: "Do NOT use: margin, display: inline, display: grid, HTML tables", ‏"Rich text isn't supported in Paper". מדריך ייבוא Figma מוסיף: "Paper's write_html only understands concrete, literal CSS values" (Paper MCP get_guide "figma-import", נצפה 25.10.2026).
- **איך "מילוי" נשמר.** [קוד] ב־`get_jsx` על הקובץ הפתוח, צומת שממלא מקום נשמר כ־`flexBasis: '404px', flexGrow: '404'` (כלומר grow שווה ל־basis), ויש `minWidth: '0px'` ו־`minHeight: '0px'` על כל ילד (Paper MCP get_jsx, נצפה 25.10.2026). [הסקה] זה ייצוג פנימי של "fill" שלא תמיד יהיה מה שמפתח היה כותב.
- **כמה "מה שרואים זה מה שיוצא".** [תיעוד] המייסד: Copy as React "exports the exact 1:1 code that the designer was looking at" ([EverydayUX](https://www.everydayux.net/paper-code-native-design-tool/)). [הסקה] זה נכון כי מה שעל המסך הוא אותו div עם אותם inline styles. אבל זה לא הקוד של הריפו, ולכן ההנחיה הרשמית לסוכן היא "Always use the conventions of the user's codebase, translating the Paper CSS export into their conventions" (Paper MCP get_guide "paper-mcp-instructions", נצפה 25.10.2026).
- **קומפוננטות מהקוד לא קיימות.** [תיעוד] "Use your code components" מסומן "in progress" ([Roadmap](https://paper.design/roadmap)). [קוד] לא נמצאו בעורך מחרוזות כמו `mainComponent`, ‏`componentId`, ‏`instanceOf` או `Slot` (`main-BqJp0QF7.js`).

## 3. בידוד בין פריימים

- **אין בידוד: כל הפריימים במסמך אחד.** [קוד] בעורך אין `attachShadow` בכלל. ‏`iframe` מופיע רק בספריית dom-to-image (‏`domtoimage-sandbox`), ברשימות של sanitizer ובקוד focus, ולא בציור הצמתים. הצמתים מצוירים כילדים ישירים של `paper-camera` (`main-BqJp0QF7.js`).
- [הסקה] הם לא צריכים בידוד כי המודל לא מאפשר CSS שדולף: אין class, אין `<style>`, ואין stylesheet של משתמש. כל הסגנון inline. זה פתרון "בעיצוב המודל" ולא במנגנון. המחיר: אי אפשר להציג קוד אמיתי שתלוי ב־CSS גלובלי.
- **פונטים: רמת המסמך, משותפים לכל הפריימים.** [קוד] פונטים מקומיים נטענים כ־`new FontFace(postscriptName, 'local("...")')` ונוספים עם `document.fonts.add(...)`. פונטים מ־Google נטענים מכתובת `https://fonts.googleapis.com/css2?family=...&display=block`, כולל צירים של פונטים משתנים (`main-BqJp0QF7.js`).
- **משתנים (טוקנים):** [קוד] `get_tokens` בפורמט css מחזיר `:root { ... }`, והקוד שמייצר את זה בונה `:root {` או `@theme {` (`main-BqJp0QF7.js`; Paper MCP get_tokens, נצפה 25.10.2026). איך המשתנים מוזרקים לקנבס החי: לא פורסם (וגם לא נמצא בקוד).
- **יחידות viewport ו־media queries:** [קוד] לא נמצא שום תרגום של `vw/vh` לצמתים. הקוד היחיד שנמצא מחזיר `null` לערכים שמסתיימים ב־`%`, ‏`em`, ‏`rem`, ‏`vw` או `vh` בפונקציה שמפרשת גודל בפיקסלים. ‏`cqw` מופיע רק בממשק עורך הגרדיאנט (`main-BqJp0QF7.js`). חלק הייבוא ושל ה־MCP לא מכיל `vw` בכלל (`code-import-*.js`, ‏`MCPHandlers-*.js`). [הסקה] כיוון שהכל במסמך אחד, `vw` בצומת היה מתייחס לחלון העורך. נראה שהם פשוט לא תומכים בזה, ורוחב פריים נקבע בפיקסלים. ‏`@media` מופיע רק ב־CSS של ממשק העורך עצמו.

## 4. מודל המסמך

- **פורמט ושמירה:** [קוד] קובץ JSON בשרת. העורך פותח `new WebSocket(`${SYNC}/sync/${fileId}?tabId=...`)`, כאשר `SYNC` הוא `wss://sync.paper.design`, ומקבל את כל הקובץ בטעינה (`r.file`, ‏`clientIndex`, ‏`syncMachineId`). שינויים נשלחים כ־`JSON.stringify({type: FileEditBatch, fileId, edits})` עם מספר רצף לכל לקוח, וחבילות גדולות מפוצלות (`"needs-chunk"`). יש גם מנגנון "fly machine" לכל קובץ (`setCurrentFlyMachine`) (`main-BqJp0QF7.js`). [קוד] לא נמצאו yjs, ‏Automerge, ‏Loro, ‏Liveblocks, ‏Replicache, ‏IndexedDB, ‏sqlite או OPFS. [הסקה] זה שרת מרכזי וסמכותי עם רשימת עריכות JSON, כנראה על Fly.io, ולא CRDT. אין עבודה לא מקוונת. המבנה המדויק של כל עריכה בתוך `edits` ואיך השרת פותר התנגשויות: לא פורסם.
- **ביטול (undo):** [קוד] כל עריכה נכנסת ל־`addEdit` שמקבץ עריכות קרובות בזמן (`autoGroupDebounceMs`) לצעד undo אחד (`main-BqJp0QF7.js`).
- **צמתים:** [קוד] ID קצר כמו `S2J-0`, שם שכבה, ‏`component`, ‏`parentId`, ‏`childIds`, ‏`artboardId`, ‏`worldX/worldY` (Paper MCP get_node_info, נצפה 25.10.2026). ‏`move_nodes` שומר על ה־ID, ו־`duplicate_nodes` מחזיר מפת IDs.
- **שכפול במקום מופע:** [קוד] `<x-paper-clone node-id="..." style="..."/>` בתוך `write_html` הוא עותק ולא מופע מקושר (Paper MCP, ‏`MCPHandlers-*.js`).
- **קומפוננטות, מופעים, overrides, slots:** [תיעוד] עדיין לא קיימים. "Components with slots" מסומן "coming soon" ([Roadmap](https://paper.design/roadmap)). [קוד] לא נמצא להם קוד בעורך. איך ייראו הקומפוננטות העתידיות: לא פורסם.
- **טוקנים:** [תיעוד] "also known as CSS variables" ([Tokens](https://paper.design/docs/tokens)). [קוד] 11 סוגים (כולל `opacity`), כינוי דרך `var(--other)`, ושימוש בשכבה דרך `var(--token)`. המדריך מורה לבנות אותם בפורמט Tailwind v4 (`--color-*`, ‏`--spacing-*`, ‏`--text-*` וכו'), ולהנמיך שקיפות עם `color-mix(var(--color-primary) 40%, transparent)` (Paper MCP get_guide "paper-mcp-instructions", נצפה 25.10.2026).
- **ערכות נושא:** [תיעוד] עדיין לא, "Theme modes" מתוכנן ([Tokens](https://paper.design/docs/tokens)).
- **איך נשמרות עריכות:** [קוד] כאובייקט סגנונות על הצומת (camelCase, "like React.CSSProperties"). מה שה־MCP קורא לו "computed styles" הוא בפועל האובייקט השמור ולא `getComputedStyle`: על הצומת `S2M-0` הוא החזיר רק 8 מאפיינים, בלי ערכי ברירת מחדל (Paper MCP get_computed_styles, נצפה 25.10.2026).

## 5. הלוך ושוב לקוד

- **אין סנכרון אוטומטי.** [תיעוד] ההנחיה הרשמית: "Always use get_jsx, get_computed_styles, get_fill_image... Always use the conventions of the user's codebase... Pass `includeNodeIds: false`" (Paper MCP get_guide "paper-mcp-instructions", נצפה 25.10.2026). הסוכן הוא הגשר.
- **איך שכבה יודעת מאיזה קובץ היא באה:** [קוד] היא לא יודעת. בצומת אין שום שדה של קובץ מקור (get_node_info). ‏`get_jsx` מוסיף רק `id` של Paper (Paper MCP, נצפה 25.10.2026). גם Snapshot והדבקה הם העתקה חד־פעמית.
- **מה קורה כשהקוד משתנה:** [הסקה] כלום. אין קישור.
- **טענות push/pull** בהודעת הגיוס עוברות דרך סוכן הקוד של הלקוח (Ramp Inspect), ולא דרך מנגנון של Paper ([Series A](https://paper.design/blog/series-a)).

## 6. ממשק לסוכן

- **איך זה מחובר:** [קוד] השרת רץ בתהליך הראשי של Electron (Hono + MCP SDK). כל קריאת כלי עוברת "bridge" שמריץ `webContents.executeJavaScript` על `window.mcpHandlers` בדף העורך (`app.asar` → `src/mcp/bridge.ts`, גרסה 0.5.16). קריאה עם `fileId` מנותבת ללשונית של אותו קובץ, ונפתחת ברקע אם צריך ("There is no sticky session — every call resolves its target fresh"). בדף העורך הלוגיקה בחלק `MCPHandlers-DNO4CJpX.js` (כ־197KB). [תיעוד] החיבור הוא stdio דרך `paper mcp`, או HTTP ב־`127.0.0.1:29979` ([MCP docs](https://paper.design/docs/mcp)). בדפדפן יש WebMCP לשותפים ([webmcp-agent-example](https://github.com/paper-design/webmcp-agent-example)). בסביבות השרת מופיעה גם כתובת `MCP:"https://mcp.paper.design"` (`main-BqJp0QF7.js`). [הסקה] זה ה־Remote MCP שמסומן "coming soon".
- **כל תשובה מגיעה עם כותרת:** [קוד] כל כלי מחזיר `file.id`, ‏`file.name` ו־`contentHash.tokens`, כדי שהסוכן יזהה אם טוקנים השתנו מאחורי הגב (Paper MCP, נצפה 25.10.2026; ההסבר ב־get_guide).

[קוד] הפעולות כפי שנצפו בסכמות (25.10.2026):

| סוג | כלים |
| --- | --- |
| קריאה | `get_basic_info`, `get_tree_summary`, `get_children`, `get_node_info`, `get_selection`, `get_jsx` (inline או tailwind), `get_computed_styles`, `get_screenshot`, `get_fill_image`, `find_nodes` (לפי סגנון, טוקן או טקסט), `get_tokens` (json / css / tailwind), `get_font_family_info`, `list_resources` |
| כתיבה | `create_file`, `open_file`, `create_page`, `update_pages`, `arrange_pages`, `rename_resource`, `create_artboard`, `write_html` (insert-children / replace), `update_styles`, `set_text_content`, `duplicate_nodes`, `move_nodes`, `rename_nodes`, `delete_nodes`, `create_tokens`, `set_tokens` |
| ייצוא | `export` (png, jpg, webp, avif, svg, pdf, mp4, webm), `export_combined_pdf` |
| תקשורת | `list_comment_threads`, `get_comment_thread`, `set_comment_thread_status`, `list_comment_thread_authors`, `finish_working_on_nodes` |
| מדריכים | `get_guide`: ‏paper-mcp-instructions, ‏mobile-status-bar, ‏figma-import, ‏image-generation |

- [תיעוד] המדריך הראשי (Paper MCP get_guide "paper-mcp-instructions", נצפה 25.10.2026) מורה לסוכן:
  - לכתוב "small, write often": קבוצה חזותית אחת לכל `write_html`, ולא יותר מכ־15 שורות HTML, "The human sees your work appear on the canvas in real-time".
  - לצלם מסך ולבקר את עצמו לפי רשימת בדיקה (ריווח, טיפוגרפיה, ניגודיות, יישור, חיתוך ב־artboard).
  - לשלוח לפני כל כתיבה "design brief" (mood, palette, type).
  - לשכפל עם `x-paper-clone` כדי לחסוך טוקנים.
  - לסיים תמיד ב־`finish_working_on_nodes`.
  רוב המדריך הוא הנחיות טעם עיצובי (פלטות, טיפוגרפיה), לא הנחיות טכניות.

## 7. ביצועים

- **Culling: הסתרה, לא הסרה מה־DOM.** [קוד] יש מחלקת culling ששומרת `culled` ומסמנת אלמנטים ב־`data-culled`. ה־CSS הוא `.paper-camera [data-culled], .paper-camera [data-lod-hidden] { visibility: hidden }`, עם חריגה ל־`clipPath`, ‏`mask`, ‏`pattern` ו־`marker` שנשארים visible (`main-BqJp0QF7.js`, ‏`main-D0mD97sb.css`). החישוב נעשה לפי "units" (מכלים), לפי סדר מרחק מאזור המסך (`omt` מחשב מרחק בריבוע מ־bbox), עם תקרות `500` ו־`50`. [הסקה] הצמתים נשארים ב־DOM ונחסך רק הציור. אין virtualization של צמתי הקנבס עצמם.
- **רמת פירוט לפי זום (LOD).** [קוד] טבלת סף: מתחת לזום `0.4` מוסתרים צמתים קטנים מ־`7.5` פיקסלי עולם, מתחת ל־`0.2` קטנים מ־`15`, מתחת ל־`0.1` קטנים מ־`30`, מתחת ל־`0.05` קטנים מ־`60`, ומתחת ל־`0.025` קטנים מ־`120`. יש גם `data-lod-fx` שמכבה אפקטים כבדים בזום רחוק, וטקסט מוסתר הופך שקוף (`-webkit-text-fill-color: transparent`) (`main-BqJp0QF7.js`, ‏`main-D0mD97sb.css`).
- **תקציב restyle לכל פריים.** [קוד] `restyleBudget` עם `allowance` ו־`spend()` שמתאפס בכל tick. ‏culling ו־LOD "מוציאים" ממנו, כדי לא לשנות יותר מדי אלמנטים בבת אחת (`main-BqJp0QF7.js`).
- **פאנל השכבות** וירטואלי (`getVirtualItems`, ‏`overscan`) ומשתמש ב־`contentVisibility:"auto"` (`main-BqJp0QF7.js`). [תיעוד] מוזכר גם בראיון ([Designer Founders](https://designerfounders.substack.com/p/paper-stephen-haney)).
- **מדידות:** [קוד] מיקום וגודל נמדדים מה־DOM (`pendingPositionMeasurements`, ‏`pendingSizeMeasurements`) ואז מסמנים `cullingState.markGeometryChanged()` (`main-BqJp0QF7.js`). זו הסיבה ש־MCP מחזיר `null` לגודל בדף לא פעיל ("the node was not measured").
- [תיעוד] טענות כלליות ביומן השינויים: זיכרון "nearly half", ‏pan/zoom חלק יותר בקבצים גדולים ([Build log](https://paper.design/build-log)). יש גם "fileSizeStatus" מהשרת ([קוד], ‏`main-BqJp0QF7.js`). [הסקה] יש מגבלת גודל קובץ. הערך שלה: לא פורסם.
- [קוד] שיידרים עוצרים כשהם מחוץ למסך, עם תקרה של `1920*1080*4` פיקסלים ([shader-mount.ts](https://github.com/paper-design/shaders/blob/main/packages/shaders/src/shader-mount.ts)).

## 8. אינטראקציה והרצה

- **אין מצב Play או prototype.** [תיעוד] אין שום פריט כזה ביומן השינויים או ב־Roadmap ([Build log](https://paper.design/build-log), [Roadmap](https://paper.design/roadmap)).
- [קוד] הקנבס כולו `pointerEvents:"none"` (ב־`paper-camera`), והעורך מטפל בכל הקלטים בעצמו (`main-BqJp0QF7.js`). אין JavaScript בצמתים: ה־sanitizer מסיר `script`, ‏`iframe` ו־`object` (רשימות ב־`main-BqJp0QF7.js`). [הסקה] התנועה היחידה היא שיידרים ווידאו, וייצוא mp4/webm עם html-in-canvas.

## 9. מה רלוונטי לנו

1. **לא לאמץ: מסמך אחד בלי בידוד.** Paper יכולים לוותר על בידוד רק כי הם אוסרים class, stylesheet, grid, margin ו־vw. Sketchpad צריך להציג קומפוננטות אמיתיות עם ה־CSS הגלובלי שלהן, ולכן shadow root + המרת `:root` ל־`:host` + המרת viewport units ליחידות container הוא בדיוק מה ש־Paper **לא** פתרו. זה היתרון שלנו. כדאי להגיד את זה בדף הנחיתה: "הקוד שלך, לא תרגום שלו".
2. **לאמץ: culling שמסתיר ולא מוריד מה־DOM, ו־LOD לפי זום.** `visibility:hidden` על פריימים מחוץ למסך, הסתרת אלמנטים קטנים מסף פיקסלים בזום רחוק (הטבלה שלהם היא נקודת התחלה טובה), כיבוי אפקטים כבדים בזום רחוק, ותקציב שינויים לכל פריים. כל אלה מתאימים ישירות ל־DOM Canvas, וזול לממש אותם.
3. **לאמץ: צורת ה־API לסוכן.** כותרת לכל תשובה עם `fileId` ו־hash של הטוקנים, קריאה זולה לפני כתיבה (`get_tree_summary`), ‏`find_nodes` לפי טוקן, ‏`move_nodes` ששומר זהות, `x-paper-clone`, וכתיבה הדרגתית שהמשתמש רואה ("write small, write often"). גם החיבור עצמו פשוט ושווה העתקה: שרת MCP שמריץ פונקציות בדף העורך הפתוח (bridge ל־`window.mcpHandlers`).
4. **לאמץ: html-in-canvas רק לייצוא.** הם מפעילים `CanvasDrawElement` ב־Electron רק לייצוא וידאו ותמונה, ולא לציור הקנבס. אם DOM Canvas ירצה ייצוא PNG או thumbnails, זו הדרך. בדפדפן רגיל זה עדיין מאחורי דגל.
5. **לא להתעכב על שרת סנכרון.** Paper בנו שרת WebSocket מרכזי עם עריכות JSON. בשביל Sketchpad (משתמש אחד, קבצים מקומיים) זה מיותר בשלב הזה. כדאי לשמור קבצים מקומיים ולהגיע מהר למשתמשים.

## מקורות

1. [paper.design](https://paper.design) — דף הבית, "built on web standards".
2. [MCP docs](https://paper.design/docs/mcp) — איך השרת רץ (stdio, ‏`paper mcp`, פורט 29979).
3. [Tokens docs](https://paper.design/docs/tokens) — טוקנים כ־CSS variables, אין עדיין themes.
4. [FAQ & Troubleshooting](https://paper.design/docs/support) — MCP על localhost, קיצורי ייצוא.
5. [Paste docs](https://paper.design/docs/paste) — הדבקת HTML ו־Figma כשכבות.
6. [Build log](https://paper.design/build-log) — יומן שינויים ספטמבר 2025 עד ספטמבר 2026.
7. [Roadmap](https://paper.design/roadmap) — Components with slots, ‏Use your code components, ‏CSS Grid.
8. [Blog: A real space to design in the age of agents](https://paper.design/blog/a-real-space-to-design-in-the-age-of-agents) — "html, css, dom".
9. [Blog: Seed](https://paper.design/blog/seed) — הבטחה לייבא קומפוננטות קוד.
10. [Blog: Series A](https://paper.design/blog/series-a) — "HTML and CSS as our rendering engine".
11. [Designer Founders: Stephen Haney](https://designerfounders.substack.com/p/paper-stephen-haney) — ראיון: בלי מנוע קנייני, פאנל שכבות וירטואלי.
12. [EverydayUX: Paper](https://www.everydayux.net/paper-code-native-design-tool/) — ראיון: Copy as React "1:1".
13. [GitHub paper-design](https://github.com/paper-design) — ריפוזיטוריז פתוחים.
14. [paper-design/shaders, shader-mount.ts](https://github.com/paper-design/shaders/blob/main/packages/shaders/src/shader-mount.ts) — WebGL2, ‏IntersectionObserver, תקרת פיקסלים.
15. [paper-design/agent-plugins](https://github.com/paper-design/agent-plugins) — README של התוסף, ‏`mcp.claude.json`.
16. [paper-design/webmcp-agent-example](https://github.com/paper-design/webmcp-agent-example) — WebMCP דרך iframe.
17. Paper MCP, נצפה 25.10.2026 — סכמות הכלים, ‏`get_guide` (paper-mcp-instructions, figma-import), ופלט קריאה בלבד מהקובץ "Welcome to Paper": ‏`get_basic_info`, ‏`list_resources`, ‏`get_tree_summary`, ‏`get_jsx`, ‏`get_node_info`, ‏`get_computed_styles`, ‏`get_tokens`.
18. חבילת האפליקציה `/Applications/Paper.app`, ‏Paper Desktop 0.5.16 (build `261015tx3mukqib`, ‏Electron, ‏Chrome 152) — ‏`Info.plist` ו־`app.asar` (`package.json`, ‏`README.md`, ‏`src/main.ts`, ‏`src/mcp/bridge.ts`).
19. קבצי העורך הציבוריים מ־`https://app.paper.design/assets/` (נשלפו 25.10.2026) — ‏`main-BqJp0QF7.js`, ‏`main-D0mD97sb.css`, ‏`code-import-DJDd27_2.js`, ‏`MCPHandlers-DNO4CJpX.js`, ‏`video-html-in-canvas-B2-_U8CW.js`.
20. [WICG html-in-canvas](https://github.com/WICG/html-in-canvas) ו־[Codrops: Exploring the HTML-in-Canvas Proposal](https://tympanus.net/codrops/2026/05/13/exploring-the-html-in-canvas-proposal/) — רקע על `drawElementImage`.
