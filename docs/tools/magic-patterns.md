# Magic Patterns

Magic Patterns הוא כלי עיצוב מבוסס AI: כותבים בקשה, והסוכן שלהם כותב אפליקציית React קטנה (React 18, TypeScript, Tailwind 3) שמוצגת כתצוגה חיה. כל "design" הוא בעצם אתר קטן עם routes, וכל גרסה שלו היא סט קבצי קוד ("artifact") שעובר קומפילציה בשרת ומוגש מדומיין נפרד. על הקנבס (גם בלשונית Screens של design וגם ב-MagicOS, הקנבס האינסופי שהושק ב-13.10.2026) כל מסך הוא **iframe** עם מסמך HTML מלא, וכל הקשר בין הקנבס לבין מה שבתוך ה-iframe עובר דרך `postMessage`, כולל עריכה ויזואלית שמזהה אלמנטים לפי מאפייני `data-id` / `data-mp`. הקוד שמוצג הוא הקוד האמיתי של ה-prototype, אבל לא הקוד של המוצר של המשתמש: הם עצמם אומרים שהתוצר הוא prototype, וכשמעבירים אותו לקוד אמיתי "הקוד של המוצר מנצח". לסוכנים חיצוניים יש MCP ו-REST API עם שני מצבים: לבקש מה-AI שלהם, או לכתוב קבצים ישירות ואז לקמפל ולפרסם.

המחקר נעשה ב-25.10.2026 מתוך התיעוד הציבורי, הבלוג, וקוד ה-JavaScript הציבורי שהאתר טוען בעמוד design ציבורי. לא נכנסתי לחשבון.

## 1. מודל הציור

- **הדפדפן מצייר הכול, ב-DOM רגיל.** כל design הוא "אתר קטן" עם עמודים ו-routes [תיעוד] ([What is a Design](https://www.magicpatterns.com/docs/documentation/editor/what-is-a-design.md)). בקוד הציבורי יש פונקציה שבונה לכל תצוגה מסמך HTML מלא: `<!DOCTYPE html>`, `<head>` עם פונטים ו-stylesheet, `<div id="root">`, ו-`<script type="module">` שטוען את ה-bundle המקומפל מ-`hostedUrl` [קוד] ([chunk ציבורי](https://www.magicpatterns.com/_next/static/chunks/25758-c211d15f55641e69.js)).
- **כל מסך על הקנבס הוא iframe.** הסקריפטים שמוזרקים למסמך מדברים עם `window.parent.postMessage`, והערות בקוד מדברות במפורש על "the iframe", למשל: גלגלת רגילה "stays in the iframe" כדי לגלול את התוכן, ו-Ctrl/Cmd/Shift + גלגלת נשלחים לקנבס כדי לעשות זום או הזזה [קוד] ([chunk](https://www.magicpatterns.com/_next/static/chunks/25758-c211d15f55641e69.js)).
- **הקומפילציה קורית בשרת.** `publish_artifact` "Compiles all source files (bundling for preview)", ואם הקומפילציה נכשלת חוזרת שגיאה 422 [תיעוד] ([MCP Tools](https://www.magicpatterns.com/docs/documentation/features/mcp-server/available_tools.md), [API publish](https://www.magicpatterns.com/docs/api/publish-artifact.md)). בקוד מופיעים `BASE_COMPILER_SERVICE_DOMAIN = "https://compiler.magicpatterns.com"` ו-`BASE_HOSTING_DOMAIN = "magicpatterns.app"` [קוד]. ב-`COMPILER_DEPENDENCIES` יש רשימה קבועה של 466 חבילות npm עם גרסאות נעולות (למשל react 18.3.1, tailwindcss 3.4.19, framer-motion 11.18.2) [קוד]. מאיזה כלי הקומפיילר בנוי (esbuild או משהו אחר) לא פורסם.
- **האפליקציה עצמה** היא Next.js ב-React/TypeScript (קבצי `_next/static/chunks`) [קוד]. הסנכרון בזמן אמת עובר דרך Liveblocks (`@liveblocks/core` 3.14.1 בקוד, ו-case study רשמי) [קוד][תיעוד] ([Liveblocks](https://liveblocks.io/blog/how-magic-patterns-powers-its-collaborative-experience)). איזו ספרייה מציירת את שכבת הקנבס (הזזה, זום, ידיות): לא פורסם, ולא מצאתי ספרייה מוכרת כמו tldraw או xyflow ב-chunks שבדקתי.
- **בשרת:** הם רצים על Render ו-MongoDB [תיעוד] ([Security](https://www.magicpatterns.com/docs/documentation/enterprise/security.md)). בקוד של MagicOS יש הפניות ל-E2B sandbox (`e2b-traffic-access-token`, `sandboxId`, `x-mp-dev-token`) [קוד]. מכאן אני מסיק ש-MagicOS מריץ חלק מהעבודה (כנראה של הסוכנים או של שרת dev) במכונות sandbox מרוחקות [הסקה].

## 2. מה מוצג על הקנבס

- **מה שמוצג הוא הקוד האמיתי של ה-design**, אחרי קומפילציה ובמסמך חי, ולא מודל עיצוב נפרד. "the code behind it is real front-end code you can read, download, or sync to GitHub" [תיעוד] ([What is a Design](https://www.magicpatterns.com/docs/documentation/editor/what-is-a-design.md)).
- **אבל זה לא הקוד של המוצר.** ה-Integration Skill הרשמי אומר שהתוצר הוא "high-fidelity prototype, not production code", ושכשהקוד שלהם והקוד של המוצר לא מסכימים, "the codebase wins" [תיעוד] ([Integration Skill](https://www.magicpatterns.com/docs/documentation/exporting/integration-skill.md)). כלומר, מה שרואים זה מה שיוצא רק בתוך Magic Patterns. בקוד של המוצר סוכן אחר כותב את המסך מחדש.
- **רכיבים אמיתיים זמינים רק במסלול ארגוני.** במסלול npm הם מבקשים את קוד הרכיבים (חבילה וטוקן, או tarball) כדי "render the components in the Magic Patterns editor and ensures visual parity", ואת התיעוד מ-Storybook או מ-MCP. המסלול הזה דורש שיחה עם הצוות ועדיין לא בשירות עצמי [תיעוד] ([NPM Package](https://www.magicpatterns.com/docs/documentation/design-systems/importing/npm-package.md)). חיבור GitHub ל-design נותן לסוכן רק הקשר לקריאה, "it does not write to your repo" [תיעוד] ([Connect to GitHub](https://www.magicpatterns.com/docs/documentation/importing/connect-github.md)).
- **מה שיוצא ל-Figma הוא צילום סטטי של המצב הנוכחי.** "Whatever you see in Magic Patterns is what will be exported", בלי אינטראקציות [תיעוד] ([Export to Figma](https://www.magicpatterns.com/docs/documentation/get-started/figma-plugin.md)).

## 3. בידוד בין פריימים

- **הבידוד הוא iframe, ולכל מסך יש מסמך HTML משלו** [קוד]. לכן אין שום ירושה מהעמוד של העורך: לכל מסמך יש `<html>`, `<body>` ו-`<head>` משלו [הסקה מהמבנה].
- **פונטים:** כל מסמך טוען בעצמו Google Fonts (Inter ו-Poppins כברירת מחדל), את הפונטים המותאמים של ה-design system, ו-stylesheet של ה-design system מ-`hostedUrl`. ה-`font-family` של `body` נקבע לפי הפונט הראשון של ה-design system [קוד] ([chunk](https://www.magicpatterns.com/_next/static/chunks/25758-c211d15f55641e69.js)).
- **משתנים וערכות נושא:** ה-tokens הם משתני CSS בתוך `index.css`. בקוד יש `parseRootCssVariables` ו-`parseDarkCssVariables`, שקוראות בלוק `:root` ובלוקים של מצב כהה [קוד]. גם בתיעוד מופיעים צבעים "with dark mode and token references" [תיעוד] ([Design Systems](https://www.magicpatterns.com/docs/documentation/design-systems/overview.md)).
- **media queries ו-viewport:** לכל מסך ב-manifest של הקנבס יש `viewport: {width, height}`, ואפשר לבחור viewport לכל מסך בנפרד (Desktop, Tablet, Mobile או מכשיר מסוים) [קוד][תיעוד] ([Changelog](https://www.magicpatterns.com/docs/documentation/feature-releases/changelog.md)). ל-iframe יש viewport אמיתי, ולכן `@media` ו-`vw` עובדים בלי לשכתב שום דבר [הסקה]. יש גם אפשרות `scale` שמקטינה את כל המסמך עם CSS `scale` על `<html>` [קוד].
- **origin ו-sandbox:** הקבצים מוגשים מ-`magicpatterns.app`, דומיין נפרד מהעורך [קוד]. מכאן ה-iframe כנראה cross-origin, וזו הסיבה שכל התקשורת עוברת ב-`postMessage` עם `'*'` [הסקה]. אילו ערכים יש במאפיין `sandbox` של ה-iframe: לא פורסם.

## 4. מודל המסמך

- **design** הוא שיחה ועוד שרשרת גרסאות. כל גרסה היא **artifact**, כלומר סט קבצי מקור. design ריק נפתח עם `App.tsx`, `index.tsx`, `index.css` ו-`tailwind.config.js` [תיעוד] ([MCP Tools](https://www.magicpatterns.com/docs/documentation/features/mcp-server/available_tools.md)). כל בקשה שומרת גרסה חדשה, ואפשר לחזור לגרסה קודמת [תיעוד] ([What is a Design](https://www.magicpatterns.com/docs/documentation/editor/what-is-a-design.md)).
- **מסכים הם routes של אותה אפליקציה.** "Pages in a design are defined by route paths" [תיעוד] ([Multiple Pages](https://www.magicpatterns.com/docs/documentation/get-started/adding-pages.md)).
- **פריסת הקנבס נשמרת כקובץ קוד.** בקוד יש `buildCanvasManifestSource`, שמפיקה טקסט `export const manifest = { screens, sections, texts, arrows, deletedScreens, layers }` [קוד]. לכל מסך יש `name`, `route`, `state` (אופציונלי), `position`, `width`, `height`, `viewport` ו-`isDefaultRow`. ל-sections יש מלבן, ל-texts יש מיקום, טקסט, פונט וגודל, ל-arrows יש התחלה וסוף, ו-`layers` הוא עץ סדר שבו sections מכילים ילדים [קוד]. מסך שנמחק נשמר ב-`deletedScreens` עם `deletedAt` [קוד].
- **MagicOS:** "Everything in a MagicOS is a file on one canvas". סוגי הקבצים הם Design, Document, Image, GitHub repo ו-Text [תיעוד] ([The canvas and files](https://www.magicpatterns.com/docs/documentation/magic-os/canvas-and-files.md)). לפריימים יש רוחב, והגובה הוא Auto (לפי התוכן) או Fixed [תיעוד] ([Changelog](https://www.magicpatterns.com/docs/documentation/feature-releases/changelog.md)). פורמט השמירה של קנבס MagicOS: לא פורסם.
- **רכיבים:** הרכיבים יושבים בתוך Design System, במבנה קבצים קבוע: `components/<Name>/index.tsx` (named exports בלבד), `components/<Name>/<Name>.previews.tsx` (חובה), `components/<Name>/Context.md` (תיעוד בשביל ה-AI, חובה), וגם `index.css`, `tailwind.config.js` ו-`rules/<slug>.md` [תיעוד] ([MCP Tools](https://www.magicpatterns.com/docs/documentation/features/mcp-server/available_tools.md)).
- **מופעים ו-overrides:** מופע הוא פשוט שימוש ברכיב React עם props [הסקה]. אין מודל overrides כמו ב-Figma. יש "Detach", שנותן עותק גולמי של הרכיב ומנתק אותו מהספרייה [תיעוד] ([Detaching](https://www.magicpatterns.com/docs/documentation/design-systems/using/detaching-components.md)). slots: לא פורסם.
- **גרסאות של design system:** הגרסאות הן major ו-minor. הפרסום מזהה שינוי שובר (למשל רכיב או prop שהוסרו) ומעלה major, ואחרי פרסום בוחרים אילו designs לשדרג [תיעוד] ([Components](https://www.magicpatterns.com/docs/documentation/design-systems/editing/components.md), [MCP Tools](https://www.magicpatterns.com/docs/documentation/features/mcp-server/available_tools.md)).
- **Controls** הם וריאנטים ומתגים שמוגדרים בתוך ה-design. שינוי שלהם נשאר מקומי בטאב ולא נשמר. כדי לשמור לוחצים "Make defaults", וזה יוצר בקשה לסוכן [תיעוד] ([Controls](https://www.magicpatterns.com/docs/documentation/editor/controls.md)).

## 5. הלוך ושוב לקוד

- **עריכה ויזואלית על הקנבס חוזרת לקוד של ה-design.** סקריפט עריכה מוזרק ל-iframe (`compiledEditModeScriptV2`). הוא מזהה אלמנטים לפי `data-mp` או `data-id`, נותן מזהה זמני `data-mpe` לכל אלמנט חדש (דרך MutationObserver), ומשתמש ב-`data-mpi` כאינדקס כשאותו אלמנט חוזר ברשימה [קוד]. אלה ההודעות שהוא שולח לחלון האב: `SELECT_ELEMENT`, `TEXT_EDIT_COMMITTED`, `TEXT_NODE_EDIT_COMMITTED`, `PADDING_COMMITTED`, `GAP_COMMITTED`, `MOVE_COMMITTED`, `RESIZE_COMMITTED`, `REORDER_ELEMENT`, `DELETE_ELEMENT`, `DUPLICATE_ELEMENT`, `PLACEHOLDER_EDIT_COMMITTED`, `UNDO_PENDING_EDIT`, `SAVE_PENDING_EDITS` ועוד [קוד]. כל הודעה נושאת `dataId`, את הטקסט המקורי, `instanceIndex` ו-`ephemeralId` [קוד]. לא מצאתי שם קובץ או מספר שורה בסקריפט. איך `dataId` מתורגם למקום בקוד, ומי מוסיף את `data-id` לאלמנטים (הקומפיילר או ה-AI כשהוא כותב), לא פורסם [הסקה: המיפוי קורה בחלון האב או בשרת].
- **עריכה ידנית:** אפשר לערוך בלשונית Code, או ב-Visual Edit (טקסט, צבעים, ריווח) ואז ללחוץ Save [תיעוד] ([How to Prompt](https://www.magicpatterns.com/docs/documentation/editor/how-to-prompt.md)).
- **GitHub:** "Sync with GitHub" יוצר **repo חדש** (React + Vite) עם סנכרון דו-כיווני ידני (push ו-pull). בכיוון הנכנס "we strip out what we deem as unnecessary code" [תיעוד] ([Sync with GitHub](https://www.magicpatterns.com/docs/documentation/get-started/sync-to-github.md)). זה לא חיבור ל-repo הקיים של המוצר.
- **לקוד של המוצר אין הלוך ושוב.** סוכן קוד מושך את ה-design דרך MCP ובונה אותו מחדש בקוד של המוצר, לפי ה-Integration Skill [תיעוד] ([Integration Skill](https://www.magicpatterns.com/docs/documentation/exporting/integration-skill.md)).
- **כשהקוד משתנה:** ב-design system שמחובר ל-GitHub, "will continue to reference any linked sources when you iterate" [תיעוד] ([Design System Agent](https://www.magicpatterns.com/blog/introducing-design-system-agent)). designs קיימים מתעדכנים רק אחרי פרסום גרסה של ה-design system ובחירה לשדרג אותם [תיעוד]. design שכבר נוצר לא מתעדכן לבד כשה-repo משתנה [הסקה].

## 6. ממשק לסוכן

- **MCP** ב-`https://mcp.magicpatterns.com/mcp`, ויש גם `/mcp/readonly`. אפשר להתחבר עם OAuth או עם API key, והכותרת `x-mp-agent-name` מאפשרת לייחס פעולות לסוכן מסוים. יש תוספים רשמיים ל-Claude, ל-Cursor ול-Codex [תיעוד] ([MCP Overview](https://www.magicpatterns.com/docs/documentation/features/mcp-server/overview.md)). **REST v3** הוא מראה של ה-MCP, endpoint מול endpoint [תיעוד] ([API](https://www.magicpatterns.com/docs/api/getting-started.md)).
- **פעולות על designs:** `create_design` (עם prompt, בלי prompt כדי לקבל design ריק, או עם `templateId` כדי לפצל design קיים), `create_slide_deck`, `get_editor_id_from_url` (מקבל גם קישור קנבס `/s/<canvasId>?nodeIds=`), `get_design_status`, `send_prompt`, `read_recent_message_history`, `list_version_history`, `publish_artifact` [תיעוד] ([MCP Tools](https://www.magicpatterns.com/docs/documentation/features/mcp-server/available_tools.md)).
- **פעולות על artifacts (כתיבת קוד ישירה):** `get_artifact`, `create_new_artifact` (שכפול גרסה, כמו branch), `read_artifact_files`, `write_artifact_files` (קובץ שלם בכל פעם), ואחריהם `publish_artifact` שמקמפל ומפעיל [תיעוד].
- **פעולות על design system:** `list_design_systems`, `create_design_system`, `get_design_system`, `read_design_system_files`, `write_design_system_files` (מקבל `baseArtifactId`, ואם הגרסה השתנתה בינתיים חוזרת שגיאה 409), `publish_design_system` (מחמיר: מסרב כל עוד יש `validationErrors`) [תיעוד].
- **פעולות על Inspiration:** `create_inspiration_document`, `inspiration_add_variant`, `inspiration_update_variant`, `get_inspiration_document`, `inspiration_clear_variants`. אלה מקבלים HTML עצמאי ומציגים עד 4 קונספטים זה לצד זה [תיעוד].
- **מגבלות:** יצירה עם AI לוקחת 2 עד 10 דקות. צריך לבדוק סטטוס לכל היותר פעם בדקה, ואין webhooks. המגבלה היא 1000 יצירות ל-10 שעות לכל מפתח [תיעוד] ([API](https://www.magicpatterns.com/docs/api/getting-started.md)).
- **מה חסר:** אין כלי MCP לפריסת קנבס MagicOS (מיקום, הזזה, sections או חצים). לא פורסם [תיעוד: לא מופיע ברשימת הכלים].

## 7. ביצועים

- מספרים על כמות פריימים, culling או מגבלות קנבס: לא פורסם.
- בקוד יש כמה רמזים [קוד] ([chunk](https://www.magicpatterns.com/_next/static/chunks/25758-c211d15f55641e69.js)):
  - **iframes מוסתרים נשארים טעונים.** הערה בקוד מתארת wrapper שעובר מ-`display:none` ל-`display:block`, ואת הצורך לשחזר את מיקום הגלילה כי הדפדפן מאפס אותו. כלומר מסתירים iframe ולא פורקים אותו.
  - **הקפאת אנימציות:** `getFreezeAnimationsScript` מחליף את `requestAnimationFrame` לפני שה-bundle נטען, ואחרי שהמסך "מתייצב" מסיים או עוצר כל אנימציה ושולח `MP_ANIMATIONS_FROZEN`.
  - **מעקב מיקומים חסכוני:** `getElementRectsScript` מריץ לולאת `requestAnimationFrame` שמדווחת מיקומי אלמנטים רק כל עוד יש אלמנטים במעקב.
  - **מגבלות הדבקה:** עד 25 פריטים בהדבקה ב-MagicOS, ועד 1MB תוכן.
- ב-changelog: "Previews now load 5x faster" (פברואר 2025) ו-"loads previews 2x faster" אחרי מעבר תשתית אירוח [תיעוד] ([Changelog](https://www.magicpatterns.com/docs/documentation/feature-releases/changelog.md)). זום כמו ב-Figma (⌘+/-, ⇧0, ⇧1, ⇧2) [תיעוד].

## 8. אינטראקציה והרצה

- **בקנבס יש שלושה כלים:** Pointer (בחירה והזזה), Hand (הזזת הקנבס) ו-Interact ("click inside designs as if they were live"). יש גם כפתור **Play** על design נבחר, "use it like a real app without leaving the canvas" [תיעוד] ([The canvas and files](https://www.magicpatterns.com/docs/documentation/magic-os/canvas-and-files.md)).
- **הקוד רץ תמיד.** כל מסך הוא אפליקציית React חיה ב-iframe [קוד]. ההבדל בין המצבים הוא מי מקבל את העכבר, ואילו סקריפטים מוזרקים: edit, comment, prototype, controls או freeze [קוד][הסקה]. Escape בתוך ה-iframe שולח `CANVAS_REQUEST_DEACTIVATE`, וקליק ימני נשלח לתפריט של הקנבס [קוד].
- **Prototype mode:** מסמנים אלמנט עם `data-id` כיעד של קישור בין מסכים [קוד]. רכיבים של design system לא נתמכים במצב הזה, וצריך לנתק אותם (detach) [תיעוד] ([Detaching](https://www.magicpatterns.com/docs/documentation/design-systems/using/detaching-components.md)).
- **הגנות בתצוגה:** סקריפט שעוצר שליחת טפסים (`getStopFormSubmissionScript`), ותופס שגיאות כדי לדווח עליהן [קוד].

## 9. מה רלוונטי לנו

1. **iframe לכל מסך עולה ביוקר, וזה מחזק את הכיוון של Shadow DOM.** Magic Patterns בנו גשר `postMessage` עם יותר מ-20 סוגי הודעות, העברה ידנית של גלגלת, קליק ימני ו-Escape לקנבס, ותיקונים לגלילה שמתאפסת כשמסתירים iframe. ב-DOM Canvas הכול באותו מסמך, ולכן אין צורך בגשר כזה. **המחיר אצלנו** הוא מה שהם מקבלים בחינם: viewport אמיתי לכל מסך. כדאי לוודא שהשכתוב ל-container units מכסה גם `@media`, ולא רק `vw` ו-`vh`.
2. **לאמץ מזהה יציב לכל אלמנט, כדי להחזיר עריכה לקוד.** אצלם `data-id` מזהה את האלמנט בקוד, `data-mpi` מבדיל בין מופעים ברשימה, ו-`data-mpe` מזהה זמנית אלמנט שנוצר בזמן ריצה. ב-Sketchpad אפשר להוסיף בזמן קומפילציה מזהה שמכיל קובץ ושורה, למשל `data-sp-src`, ולפתור מראש את הבעיה שהם לא פרסמו: איך מזהה הופך למקום בקוד.
3. **לאמץ "manifest כקובץ קוד" בשביל פריסת הקנבס.** אצלם הקנבס של המסכים הוא `export const manifest = {screens:{route,state,position,viewport}, sections, texts, arrows, layers}`. ל-Claude קל לקרוא ולכתוב קובץ כזה. מסך מוגדר כ-route ועוד state, ולא כעותק של קוד, וזה מתאים במיוחד ל-Sketchpad.
4. **לאמץ את תבנית הכתיבה של הסוכן: כותבים קבצים, ואז שלב אחד שמקמפל ומפעיל.** אם הקומפילציה נכשלת חוזרת שגיאה ברורה (422). יש גם בדיקת התנגשות עם `baseArtifactId` (שגיאה 409 אם מישהו שינה בינתיים). כך Claude לא שובר פריים חי באמצע עבודה, ואפשר לחזור לגרסה קודמת.
5. **לא לאמץ את הפער בין ה-prototype למוצר.** אצלם מה שמוצג הוא קוד נפרד שמישהו יכתוב מחדש ("the codebase wins"), והחיבור לרכיבים אמיתיים דורש שיחת onboarding וטוקן npm. היתרון של Sketchpad הוא בדיוק להראות את הרכיבים האמיתיים מה-repo, ולכן זו נקודת המכירה מולם. גם לא לאמץ זמני המתנה של 2 עד 10 דקות עם בדיקת סטטוס: הכתיבה הישירה של Claude לקבצים צריכה להופיע על הקנבס מיד. מה שכן שווה להעתיק הוא הקפאת אנימציות לתמונות ממוזערות או לפריימים סטטיים.

## מקורות

1. [llms.txt](https://www.magicpatterns.com/docs/llms.txt): אינדקס כל דפי התיעוד
2. [What is a Design](https://www.magicpatterns.com/docs/documentation/editor/what-is-a-design.md): design כאתר קטן, גרסאות
3. [What is MagicOS](https://www.magicpatterns.com/docs/documentation/magic-os/overview.md): קנבס, coordinator ו-threads
4. [The canvas and files](https://www.magicpatterns.com/docs/documentation/magic-os/canvas-and-files.md): סוגי קבצים, Play ו-Interact
5. [Agents and threads](https://www.magicpatterns.com/docs/documentation/magic-os/agents-and-threads.md): סוכנים מקבילים על הקנבס
6. [MagicOS vs. Designs](https://www.magicpatterns.com/docs/documentation/magic-os/when-to-use-magicos.md): הקשר בין design ל-MagicOS
7. [Multiple Pages](https://www.magicpatterns.com/docs/documentation/get-started/adding-pages.md): routes ולשונית Screens
8. [Controls](https://www.magicpatterns.com/docs/documentation/editor/controls.md): וריאנטים מקומיים
9. [How to Prompt](https://www.magicpatterns.com/docs/documentation/editor/how-to-prompt.md): Select Mode ו-Visual Edit
10. [Design Systems – Getting Started](https://www.magicpatterns.com/docs/documentation/design-systems/overview.md): tokens, רכיבים, rules
11. [Importing overview](https://www.magicpatterns.com/docs/documentation/design-systems/importing/overview.md): מקורות ייבוא
12. [Importing – GitHub](https://www.magicpatterns.com/docs/documentation/design-systems/importing/github.md): קריאה בלבד מה-repo
13. [Importing – NPM Package](https://www.magicpatterns.com/docs/documentation/design-systems/importing/npm-package.md): רכיבים אמיתיים, Storybook
14. [Components](https://www.magicpatterns.com/docs/documentation/design-systems/editing/components.md): גרסאות ופרסום
15. [Detaching Components](https://www.magicpatterns.com/docs/documentation/design-systems/using/detaching-components.md): detach ו-prototype mode
16. [Connect to GitHub](https://www.magicpatterns.com/docs/documentation/importing/connect-github.md): repo כהקשר בלבד
17. [Sync with GitHub](https://www.magicpatterns.com/docs/documentation/get-started/sync-to-github.md): repo חדש, סנכרון דו-כיווני
18. [Overview of exporting](https://www.magicpatterns.com/docs/documentation/exporting/overview.md): דרכי ייצוא
19. [Export to Figma](https://www.magicpatterns.com/docs/documentation/get-started/figma-plugin.md): צילום סטטי
20. [Integration Skill](https://www.magicpatterns.com/docs/documentation/exporting/integration-skill.md): "the codebase wins", מבנה הקוד שנוצר
21. [MCP Overview](https://www.magicpatterns.com/docs/documentation/features/mcp-server/overview.md): חיבור, readonly, API key
22. [MCP Tools & Workflows](https://www.magicpatterns.com/docs/documentation/features/mcp-server/available_tools.md): רשימת כלים מלאה ומבנה קבצי design system
23. [API Getting Started](https://www.magicpatterns.com/docs/api/getting-started.md): REST v3, מגבלות, שגיאות
24. [API Publish artifact](https://www.magicpatterns.com/docs/api/publish-artifact.md): קומפילציה ושגיאה 422
25. [API Write artifact files](https://www.magicpatterns.com/docs/api/write-artifact-files.md): כתיבת קבצים
26. [Changelog](https://www.magicpatterns.com/docs/documentation/feature-releases/changelog.md): MagicOS, זום, גודל פריימים, ביצועי תצוגה
27. [Live Multiplayer](https://www.magicpatterns.com/docs/documentation/collaboration/live-multiplayer.md): עבודה משותפת בזמן אמת
28. [Merging Designs](https://www.magicpatterns.com/docs/documentation/editor/merging-designs.md): הפניה בין designs
29. [Security](https://www.magicpatterns.com/docs/documentation/enterprise/security.md): Render ו-MongoDB
30. [Blog: Introducing MagicOS](https://www.magicpatterns.com/blog/introducing-magicos): הכרזה, 13.10.2026
31. [Blog: Introducing Design System Agent](https://www.magicpatterns.com/blog/introducing-design-system-agent): ייצוג של design system כקוד
32. [Blog: Using Your Design System](https://www.magicpatterns.com/blog/introducing-design-systems): ייבוא מ-Storybook ו-Figma
33. [Liveblocks case study](https://liveblocks.io/blog/how-magic-patterns-powers-its-collaborative-experience): סנכרון הקנבס והסוכן
34. [עמוד design ציבורי](https://www.magicpatterns.com/c/6cn2um6ndzmu3w4qnxjmez): העמוד שממנו נטען הקוד הציבורי
35. [chunk JS ציבורי 25758](https://www.magicpatterns.com/_next/static/chunks/25758-c211d15f55641e69.js): תבנית HTML לתצוגה, סקריפטי edit/canvas/freeze, manifest, דומיין הקומפיילר, `COMPILER_DEPENDENCIES` (שם הקובץ עשוי להשתנות בגרסה הבאה של האתר)
