# Framer

**בקצרה:** Framer הוא עורך אתרים שהקנבס שלו בנוי ב-React, ולכן הוא יכול לצייר על הקנבס כל רכיב React, כולל רכיבי קוד שהמשתמש כותב. אבל מה שמוצג על הקנבס הוא **מודל עיצוב פנימי** (עץ של שכבות, וריאנטים ונקודות שבירה), לא קוד של פרויקט. המודל הזה הופך ל-HTML/CSS/React רק בפרסום, ונשמר בשרתים של Framer. רכיבי קוד הם קבצים בודדים בתוך הפרויקט, עם רשימה סגורה של ספריות מותרות. אין להם קשר לריפו שלך, חוץ מסנכרון קבצים דרך Code Link. בצד הסוכן Framer הלכו רחוק: יש MCP רשמי (`mcp.framer.com/mcp`), CLI (`@framer/agent`) ו-Server API (`framer-api`). שלושתם מריצים את אותו מנוע עורך בלי ממשק, בשרת. הסוכן כותב לקנבס בשפת פקודות קצרה משלהם (`applyChanges`), קורא את הפרויקט בשאילתות, ובודק את עצמו לפי מלבנים, לינטר וצילום מסך מדפדפן בשרת. הסוכן עובד על ענף (branch) ולא על האתר החי.

תגיות: **[תיעוד]** כתוב בתיעוד או בבלוג של Framer. **[קוד]** ראיתי בקוד, בחבילת npm או בהגדרות טיפוסים. **[הסקה]** מסקנה שלי.

## 1. מודל הציור

- [תיעוד] לפי Koen Bok (מייסד Framer), הקנבס החופשי "נבנה ב-React, ולכן הוא יכול לצייר כל רכיב React". באותו פוסט הוא כותב שהקוד ב-Framer בנוי כולו על ES modules, ושהעורך משתמש ב-swc וב-wasm כדי להציג שינויים מיד. ([Koen Bok, dev.to](https://dev.to/koen/code-on-canvas-develop-and-design-at-the-same-time-258l))
- [תיעוד] רכיבי קוד מוצגים "ישירות על הקנבס, בתצוגה המקדימה ובאתר המפורסם". ([Code Components](https://www.framer.com/developers/components-introduction))
- [תיעוד] רכיב קוד יכול לדעת איפה הוא מצויר דרך `RenderTarget`: `canvas`, `export`, `thumbnail` או `preview`. על הקנבס ובייצוא Framer מבקשים שרכיב מונפש יישאר סטטי (`useIsStaticRenderer`), כדי לא להאט את הקנבס. ([API Reference](https://www.framer.com/developers/components-reference), [Prepare component for review](https://www.framer.com/help/articles/prepare-component-review/))
- [תיעוד] במדריך הבדיקה של רכיבים כתוב ש"ייתכן שממשקי הדפדפן זמינים גם על הקנבס", ומבקשים לא לגעת ב-`document.body`/`head` ולא להחיל סגנונות גלובליים, כי רכיבים חולקים את העמוד עם אלמנטים אחרים. ([Prepare component for review](https://www.framer.com/help/articles/prepare-component-review/))
- [תיעוד] על הקנבס Framer "מודד במדויק כל תוכן", ועוטף רכיב בגודל קבוע במיכל. ([Auto-Sizing](https://www.framer.com/developers/auto-sizing))
- [הסקה] יחד, כל הסימנים האלה מצביעים על כך שהדפדפן מצייר את הקנבס כ-DOM רגיל, דרך React. אין סימן ל-WebGL או ל-Canvas2D בתוכן העיצוב, ואין סימן לכך שרכיבי קוד רצים ב-iframe. מבנה פנימי מפורט של הקנבס **לא פורסם**. בפוסט על Rolldown כתוב רק שאחת המטרות של 2026 היא "לשפר את ביצועי הקנבס". ([Rolldown](https://www.framer.com/blog/framer-rolldown/))
- [קוד] השם הפנימי של מנוע העורך הוא "Vekter". הוא מופיע בהערה בטיפוסים של `framer-api`: "resolves when Vekter's plugin handler answers". ([framer-api index.d.ts](https://unpkg.com/framer-api@5.1.0/dist/index.d.ts))
- שפה: TypeScript/React בצד הלקוח, ו-swc/wasm לקומפילציה של קוד ([dev.to](https://dev.to/koen/code-on-canvas-develop-and-design-at-the-same-time-258l)). מעבר לזה **לא פורסם**.

## 2. מה מוצג על הקנבס

- [תיעוד] מה שמוצג הוא **מודל עיצוב של Framer**: שכבות, Stacks, רכיבים עם וריאנטים ונקודות שבירה. הפוסט על הסוכנים מתאר את עץ הפרויקט כעץ "מפורט ודומה ל-HTML" של צמתים עם מאפיינים. ([Building Agents for Framer](https://www.framer.com/blog/building-framer-agents/))
- [תיעוד] קוד אמיתי מופיע רק כ"רכיבי קוד" (Code Components) ו"עוקפי קוד" (Code Overrides) שנכתבים בתוך Framer. Override הוא React Higher-Order Component. הוא מוצמד לשכבה על הקנבס, אבל **פעיל רק בתצוגה המקדימה ובאתר המפורסם**. ([Overrides](https://www.framer.com/developers/overrides-introduction))
- [קוד] לרכיב קוד יש מגבלות חזקות: קובץ אחד עם export ברירת מחדל, ייבוא רק מ-`react`, `react-dom`, `framer` ו-`framer-motion`, בלי `position: fixed`, ושמירה מגישה ל-`window` בגלל SSR. אלה הכללים שכתובים בסקיל שמגיע עם `@framer/agent`. ([SKILL.md בחבילה](https://unpkg.com/@framer/agent@0.0.47/skills/framer-code-components/SKILL.md)) באותו קובץ יש גם דוגמה שמייבאת מ-URL (`https://jspm.dev/...`). כלומר ייבוא ESM מכתובת עובד בפועל.
- [קוד] האתר המפורסם (נבדק על framer.com עצמו) הוא HTML מרונדר מראש, עם מחלקות שנוצרות אוטומטית (`framer-7Nc6N framer-v-140pdlc`), מאפייני `data-framer-name` (1,738 מופעים), `data-framer-component-type` ו-`data-framer-hydrate-v2`, `@media` לפי נקודות השבירה, ומודולי ‎`.mjs` מ-`framerusercontent.com/sites/...` (react, framer, rolldown-runtime). ([framer.com, HTML גולמי](https://www.framer.com/))
- [הסקה] "מה שאתה רואה זה מה שעולה לאוויר" נכון ברמת **הפיקסלים**, כי גם הקנבס וגם האתר הם React+DOM. זה **לא** נכון ברמת **הקוד**: הקוד שמתפרסם נוצר אוטומטית מהמודל, לא נכתב בידי אדם, ואינו קוד של פרויקט קיים. שאר התוכן (שכבות, טקסט, תמונות) הוא מודל ש"מתורגם" לקוד בפרסום.

## 3. בידוד בין פריימים

- [הסקה] אין בידוד אמיתי במובן שלנו. הפריימים הם חלק ממודל אחד, ו-Framer שולט בכל ה-CSS שנוצר. לכן לא צריך לבודד, חוץ מאשר את רכיבי הקוד.
- [תיעוד] את רכיבי הקוד מבודדים בעזרת **כללי התנהגות**, לא בעזרת iframe או shadow root: "תחום את פעולות ה-DOM לרכיב שלך", לא לשנות body/head, לא לשים סגנונות גלובליים, ולנקות מאזינים. ([Prepare component for review](https://www.framer.com/help/articles/prepare-component-review/))
- [קוד] תוספים (Plugins), לעומת זאת, רצים ב-iframe ומדברים עם העורך דרך `window.parent.postMessage`. ([framer-plugin index.js](https://unpkg.com/framer-plugin@3.10.3/dist/index.js))
- **נקודות שבירה** [תיעוד]: כל נקודת שבירה "יורשת מנקודת השבירה הראשית", ובכל אחת אפשר לדרוס רק את המאפיינים שצריך. הרוחב על הקנבס הוא "רוחב ה-viewport המינימלי שבו נקודת השבירה נכנסת לפעולה". ([Breakpoints](https://framer.com/academy/lessons/breakpoints)) [קוד] באתר המפורסם זה הופך ל-`@media (min-width:810px) and (max-width:1199.98px)` וכדומה ([framer.com HTML](https://www.framer.com/)). [הסקה] מכאן שעל הקנבס כל נקודת שבירה היא פריים ברוחב קבוע, ו-Framer מחליט בעצמו איזה layout להציג. הוא לא מריץ media query אמיתי לפי גודל הפריים. המנגנון המדויק **לא פורסם**.
- **פונטים** [קוד]: בתוך המודל יש `getFonts`/`getFont`, ורכיבי קוד מקבלים פונט דרך `ControlType.Font`. את משפחת הפונט אי אפשר לקבוע בברירת מחדל, רק המשתמש בוחר אותה. ([framer-plugin d.ts](https://unpkg.com/framer-plugin@3.10.3/dist/index.d.ts), [SKILL.md](https://unpkg.com/@framer/agent@0.0.47/skills/framer-code-components/SKILL.md)) איך הפונטים נטענים לקנבס **לא פורסם**.
- **משתנים** [קוד]: Color Styles ו-Text Styles הם אובייקטים במודל (`createColorStyle`, `createTextStyle`). אין בהם CSS custom properties חופשיים מהקוד.
- **ירושה מהעמוד**: **לא פורסם** ל-Framer, ובמודל שלהם זה כנראה לא רלוונטי.

## 4. מודל המסמך

- [קוד] סוגי הצמתים לפי ה-Plugin API: `FrameNode`, `TextNode`, `SVGNode`, `ComponentNode`, `ComponentInstanceNode`, `WebPageNode`, `DesignPageNode`, ו-`UnknownNode`. ([framer-plugin d.ts](https://unpkg.com/framer-plugin@3.10.3/dist/index.d.ts)) מאפייני הצמתים בנויים מ-"traits": מיקום, pins, גודל, layout, grid item, רקע, גבול, פונט, `WithComponentVariantTrait`, `WithBreakpointTrait` ועוד. ([framer-api d.ts](https://unpkg.com/framer-api@5.1.0/dist/index.d.ts))
- [קוד] לרכיב יש `componentIdentifier` ו-`insertURL`. מופע (instance) מחזיק `controls`, כלומר הערכים של המאפיינים שלו. יש `addVariant`, `addGestureVariant` (וריאנט לריחוף או לחיצה), ו-`getVariables`/`addVariables` לרכיב. ([framer-api d.ts](https://unpkg.com/framer-api@5.1.0/dist/index.d.ts))
- [תיעוד] וריאנטים: כל וריאנט יורש מבנה ומאפיינים מהוריאנט הראשי. שינוי בוריאנט אחר הופך ל-override, שמסומן בסגול וניתן לאיפוס. ([Component Variants](https://www.framer.com/academy/lessons/component-variants-in-framer)) Component Variables חושפים מאפיינים כ"בקרים" בכל מופע. ([Component Variables](https://www.framer.com/academy/lessons/component-variables-in-framer))
- [קוד] סוגי משתנים: Boolean, Number, String, FormattedText, Enum, Color, Image, File, Link, Date, Border. ([framer-plugin d.ts](https://unpkg.com/framer-plugin@3.10.3/dist/index.d.ts))
- [תיעוד] רכיב קוד מגדיר את המאפיינים שלו בעזרת `addPropertyControls`, ואת הגודל שלו בהערות JSDoc: `@framerSupportedLayoutWidth/Height` עם הערכים `auto`/`fixed`/`any`/`any-prefer-fixed`, ו-`@framerIntrinsicWidth/Height`. ([Auto-Sizing](https://www.framer.com/developers/auto-sizing))
- Slots [קוד]: בקר `ControlType.ComponentInstance` מאפשר לרכיב לקבל רכיבים אחרים מהקנבס כ-React node. זה הדבר הקרוב ביותר ל-slot. ([SKILL.md](https://unpkg.com/@framer/agent@0.0.47/skills/framer-code-components/SKILL.md))
- פורמט הקובץ ואיך שינויים נשמרים: **לא פורסם**. [הסקה] הפרויקט חי בשרת ולא כקובץ שאפשר לפתוח. העריכות נשמרות כמאפיינים על הצמתים במודל, לא כ-CSS ולא כ-stylesheet. יש ענפים (branches), גרסאות לקבצי קוד (`CodeFile.getVersions`), ו-`getChangedPaths`/`getChangeContributors`.

## 5. הלוך ושוב לקוד

- [תיעוד] אין דרך להחזיר עריכה מהקנבס לקוד של ריפו. הכיוון היחיד הוא מודל → אתר מפורסם.
- [קוד] קבצי קוד: Framer מחזיק קבצי קוד בתוך הפרויקט (`createCodeFile`, `CodeFile.setFileContent`, `getVersions`, `typecheck`, `lint`). ([framer-api d.ts](https://unpkg.com/framer-api@5.1.0/dist/index.d.ts))
- [קוד] **Code Link**, תוסף רשמי ו-CLI בקוד פתוח, מסנכרן את קבצי הקוד של הפרויקט לתיקייה מקומית בשני הכיוונים. ה-CLI מרים שרת WSS מקומי, והתוסף (שרץ ב-iframe בעורך) מתחבר אליו. ההודעות כוללות `file-change`, `file-delete`, `file-rename`, ו-`conflicts-detected` עם תוכן מקומי מול תוכן מרוחק. ([README](https://github.com/framer/plugins/blob/main/plugins/code-link/README.md), [types.ts](https://github.com/framer/plugins/blob/main/packages/code-link-shared/src/types.ts), [connection.ts](https://github.com/framer/plugins/blob/main/packages/code-link-cli/src/helpers/connection.ts)) [הסקה] זה סנכרון של קבצים, לא חיבור בין אלמנט לקוד. אלמנט רגיל על הקנבס לא יודע מאיזה קובץ הוא בא, כי הוא לא בא מקובץ.
- [קוד] הקשר בין מופע לרכיב קוד הוא דרך `insertURL`/`componentIdentifier`, כלומר כתובת מודול. ([framer-plugin d.ts](https://unpkg.com/framer-plugin@3.10.3/dist/index.d.ts)) [תיעוד] רכיבים משותפים דרך "URL ייחודי עם גרסה". ([Code Components](https://www.framer.com/developers/components-introduction))
- [תיעוד] כשהקוד משתנה, התצוגה מתעדכנת בשמירה ("live preview updates when you save"). ([Code Components](https://www.framer.com/developers/components-introduction)) [קוד] יש `getRuntimeError()` על מופע של רכיב קוד, כדי לקרוא שגיאת ריצה. ([framer-api d.ts](https://unpkg.com/framer-api@5.1.0/dist/index.d.ts))

## 6. ממשק לסוכן

שלוש שכבות, וכולן מריצות את אותו מנוע:

- **MCP רשמי** [תיעוד]: `https://mcp.framer.com/mcp`, מרוחק ומחובר ב-OAuth. בלשונם "There's no local Framer bridge to install". הסוכן עובד על "הקנבס, רכיבים, הגדרות פרויקט נתמכות ו-CMS". השינויים נשארים בפרויקט או בענף עד פרסום מפורש. ([Framer MCP](https://www.framer.com/developers/mcp), [framer/agent-plugins](https://github.com/framer/agent-plugins)) רשימת הכלים של ה-MCP **לא פורסמה** בתיעוד. הסקיל הישן מזכיר כלי בשם `open_project`.
- **CLI `@framer/agent`** [קוד]: `session new <url>`, `project list/new/remix`, `exec -s <id>` (מריץ JS מול האובייקט `framer`, עם `state` שנשמר בין קריאות), `apply-changes`, `docs`. לכל פרויקט הוא יוצר קבצי הקשר: `index.md`, `project-inventory.md`, `recipes.md`. ([SKILL.md](https://unpkg.com/@framer/agent@0.0.47/skills/framer/SKILL.md))
- **Server API `framer-api`** [קוד]: מתחבר ב-WebSocket ל-`wss://api.framer.com/channel/headless-plugin` ([index.js](https://unpkg.com/framer-api@5.1.0/dist/index.js)), כלומר "תוסף בלי ממשק". [תיעוד] הקוד רץ "ב-v8 sandbox בשרת" עם "DOM API מלא", יש cold start של שנייה או שתיים, ו"הסקריפטים אינם טרנזקציוניים". ([Server API FAQ](https://www.framer.com/developers/server-api-faq))
- **הפעולות של הסוכן** (`framer.agent.*`) [קוד] ([framer-api d.ts](https://unpkg.com/framer-api@5.1.0/dist/index.d.ts)):
  - `getSystemPrompt()`: הפרומפט הקבוע, שכולל את תחביר הפקודות, כללי עיצוב ודוגמאות. בלשונם "This is the sole documentation for the command syntax".
  - `getContext()`: פונטים, טוקנים של צבע, סגנונות טקסט ואייקונים של הפרויקט.
  - `readProject(queries[], {pagePath})`: שאילתות קריאה.
  - `applyChanges(dsl, {pagePath})`: מחרוזת פקודות מופרדות ב-`;` ליצירה, עדכון, מחיקה, הזזה ושכפול. פקודה שנכשלת לא עוצרת את השאר. מחזיר את המזהים של הצמתים החדשים.
  - `replaceText`, `listComponents`, `readComponentControls`, `listIconSets`/`readIcons`, `readLayoutTemplateControls`, `readShaderControls`, `queryImages`, `publish` (preview / confirm_publish / deploy_to_production), שאילתות analytics.
  - ענפים: `getBranches`, `createBranch`, `switchBranch`, `mergeBranch`, `getBranchChanges` ועוד.
  - קריאת עץ: `getNode`, `getNodes`, `getDescendantsOfTypes`, `getRect`, `serialize`, `paginate`, `flattenComponentInstance`.
  - מחוץ ל-agent: `screenshot(nodeId)`, `exportSVG(nodeId)`, `TextNode.setHTML` (alpha), ניהול קבצי קוד.
- [תיעוד] שפת הפקודות: שמות מאפיינים מקוצרים (`bg` במקום `backgroundColor`) ובלי ערכי ברירת מחדל, כדי ש"כל טוקן ינוצל". הסוכן מקבל משוב כמלבנים של מיקום, כלינטר (layout, טיפוגרפיה, ניגודיות, נגישות), ולפי בקשה גם כצילום "בדפדפן על שרת". כל סשן רץ על עותק של הפרויקט, וכל הודעה ניתנת לביטול. ([Building Agents](https://www.framer.com/blog/building-framer-agents/))
- [תיעוד] הכלים מבקשים להעדיף `applyChanges` על פני API נמוך כמו `setAttributes` לעבודת עיצוב. ([SKILL.md](https://unpkg.com/@framer/agent@0.0.47/skills/framer/SKILL.md))
- התחביר המלא של שפת הפקודות **לא פורסם** בפומבי. הוא חוזר רק מ-`getSystemPrompt()`, שדורש מפתח API.

## 7. ביצועים

- [תיעוד] הבקשה לרכיבי קוד היא להישאר סטטיים על הקנבס, לעצור אנימציות, טיימרים ו-WebGL כשהם מחוץ למסך, ולא לעשות עבודת רקע. "כל מדידה כזו תפגע בביצועי האתר וגם הקנבס" (לגבי `useMeasuredSize`). ([Prepare component for review](https://www.framer.com/help/articles/prepare-component-review/), [Auto-Sizing](https://www.framer.com/developers/auto-sizing))
- [תיעוד] "אופטימיזציית פרויקט" לפרויקטים ישנים מסירה חישובים כבדים, למשל hash ל-SVG, כדי להאיץ עריכה. ([Optimizing projects](https://www.framer.com/help/articles/optimizing-projects/))
- [תיעוד] מספרים של הסוכן: כ-50 טוקנים בשנייה, עמוד מלא תוך 40–100 שניות, כ-3 דולר לעמוד ו-0.5 דולר לעריכה בינונית. ([Building Agents](https://www.framer.com/blog/building-framer-agents/))
- כמות שכבות מקסימלית, culling, אסטרטגיית זום או וירטואליזציה של הקנבס: **לא פורסם**.

## 8. אינטראקציה/הרצה

- [תיעוד] יש תצוגה מקדימה (`RenderTarget.preview`) שמתנהגת כמו האתר החי. על הקנבס (`RenderTarget.canvas`) רכיבים אמורים להיות סטטיים, ו-Overrides **לא פעילים** בכלל. הם פועלים רק בתצוגה המקדימה ובאתר. ([API Reference](https://www.framer.com/developers/components-reference), [Overrides](https://www.framer.com/developers/overrides-introduction))
- [הסקה] כלומר, בדיוק כמו אצלנו, מצב העריכה "מוקפא" ומצב ההרצה הוא נפרד. ההבדל: אצלם ההפרדה נאכפת בעזרת כללים ודגל שהרכיב קורא, בלי sandbox. האם התצוגה המקדימה רצה ב-iframe **לא פורסם**.

## 9. מה רלוונטי לנו

1. **שפת פקודות קצרה לסוכן במקום API של צמתים.** Framer מחזירים ל-Claude מלבנים ושגיאות לכל פקודה, ממשיכים גם אחרי פקודה שנכשלה, ומבקשים להעדיף אותה על פני `setAttributes`. **לאמץ**: אצלנו הסוכן כותב HTML, אז אפשר לתת לו פעולת patch אחת (החלפה או הוספה לפי מזהה) שמחזירה `getBoundingClientRect` של מה שנוצר, ולינטר קטן (חריגה, ניגודיות). זה זול ממסך מלא. כדאי גם להחזיר את המזהים החדשים, כמו שהם עושים.
2. **ענף לכל סשן של סוכן, וביטול לכל הודעה.** הסוכן אף פעם לא כותב על "החי". **לאמץ בגרסה פשוטה**: snapshot של הפריימים לפני כל ריצה של Claude, וכפתור "בטל" או "מזג". זה בונה אמון אצל משתמש ראשון, בלי לבנות מערכת ענפים מלאה.
3. **רכיבי קוד בלי בידוד, רק בכללים.** אצלם רכיב קוד רץ באותו DOM, והם מבקשים מהכותבים "לא לגעת ב-body". זה עובד כי הם שולטים בכל ה-CSS ומגבילים את הייבוא. **לא לאמץ**: Sketchpad מציג רכיבים אמיתיים מריפו זר, עם CSS גלובלי ו-`:root`. ה-shadow root שלנו הוא בדיוק מה שחסר להם, ולכן כדאי להשאיר אותו.
4. **`RenderTarget`/`useIsStaticRenderer`.** רכיב יודע שהוא על קנבס ועוצר אנימציות. **לשקול**: אצלנו סקריפטים כבר לא רצים בעריכה, אבל לרכיבים מהריפו של Sketchpad שצריכים JS כדי להיראות נכון אפשר לחשוף דגל גלובלי פשוט, כמו `window.__SKETCHPAD_CANVAS__`, במקום להריץ הכול או כלום.
5. **הקשר מראש לסוכן.** `getContext()`/`project-inventory.md` כוללים פונטים, טוקנים, רכיבים ובקרים שלהם, ונוצרים פעם אחת לכל סשן. **לאמץ**: ב-Sketchpad לייצר בתחילת סשן קובץ אחד עם רשימת הרכיבים של הריפו, ה-props שלהם והטוקנים, כדי ש-Claude לא יסרוק את הריפו בכל פעם. זה דומה ל-`readComponentControls` שלהם.

## מקורות

1. https://dev.to/koen/code-on-canvas-develop-and-design-at-the-same-time-258l: Koen Bok, "הקנבס נבנה ב-React", ES modules, swc/wasm
2. https://www.framer.com/developers/components-introduction: רכיבי קוד על הקנבס, בתצוגה ובאתר; שיתוף ב-URL
3. https://www.framer.com/developers/components-reference: `RenderTarget`, `useIsStaticRenderer`
4. https://www.framer.com/help/articles/prepare-component-review/: כללי DOM, סטטיות על הקנבס, ביצועים
5. https://www.framer.com/developers/auto-sizing: הערות גודל, מדידה על הקנבס
6. https://www.framer.com/developers/overrides-introduction: Overrides פעילים רק בתצוגה ובאתר
7. https://www.framer.com/blog/framer-rolldown/: "Boost the performance of our canvas" כמטרה
8. https://www.framer.com/blog/building-framer-agents/: שפת פקודות, משוב, ענפים, עלויות
9. https://www.framer.com/developers/mcp: MCP רשמי, OAuth, ענפים
10. https://github.com/framer/agent-plugins: תוסף סוכנים, כתובת ה-MCP
11. https://www.framer.com/developers/server-api-introduction: Server API, מתי משתמשים
12. https://www.framer.com/developers/server-api-faq: v8 sandbox, DOM מלא, socket, לא טרנזקציוני
13. https://unpkg.com/framer-api@5.1.0/dist/index.d.ts: טיפוסי Server API, `FramerAgentAPI`, screenshot, setHTML
14. https://unpkg.com/framer-api@5.1.0/dist/index.js: `wss://api.framer.com/channel/headless-plugin`
15. https://unpkg.com/framer-plugin@3.10.3/dist/index.d.ts: Plugin API, סוגי צמתים ומשתנים
16. https://unpkg.com/framer-plugin@3.10.3/dist/index.js: `window.parent.postMessage` (תוסף ב-iframe)
17. https://unpkg.com/@framer/agent@0.0.47/skills/framer/SKILL.md: CLI לסוכן, פקודות ותהליך עבודה
18. https://unpkg.com/@framer/agent@0.0.47/skills/framer-code-components/SKILL.md: מגבלות רכיבי קוד, בקרים
19. https://github.com/framer/plugins/blob/main/plugins/code-link/README.md: Code Link, סנכרון דו-כיווני
20. https://github.com/framer/plugins/blob/main/packages/code-link-shared/src/types.ts: הודעות הסנכרון
21. https://github.com/framer/plugins/blob/main/packages/code-link-cli/src/helpers/connection.ts: שרת WSS מקומי
22. https://framer.com/academy/lessons/breakpoints: ירושה מנקודת השבירה הראשית
23. https://www.framer.com/academy/lessons/component-variants-in-framer: ירושת וריאנטים, overrides בסגול
24. https://www.framer.com/academy/lessons/component-variables-in-framer: Component Variables
25. https://www.framer.com/help/articles/optimizing-projects/: אופטימיזציית פרויקטים ישנים
26. https://www.framer.com/: HTML גולמי של אתר מפורסם (מחלקות, data-framer, @media, ‎.mjs)
