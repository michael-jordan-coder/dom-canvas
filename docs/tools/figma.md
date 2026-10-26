# Figma

**בקצרה:** Figma לא משתמשת ב-DOM כדי לצייר את הקנבס. יש לה מנוע משלה ב-C++ שעובר קומפילציה ל-WebAssembly ומצייר דרך WebGL, ולאחרונה גם דרך WebGPU. מה שמוצג על הקנבס הוא מודל עיצוב נפרד, עץ של אובייקטים עם תכונות, ולא הקוד של הפרויקט. הקוד נוצר רק ביציאה (Dev Mode, MCP), וכשיש Code Connect הוא מוחלף בדוגמת קוד שהצוות כתב ידנית. יש שלושה יוצאים מן הכלל שמתקרבים לקוד אמיתי. **Figma Sites** מציג תצוגה מקדימה ב-HTML/CSS. **Figma Make** מריץ אפליקציית React/Vue/Svelte אמיתית ואפילו dev server של הריפו. **Code layers** הן שכבות React על הקנבס, אבל לא מצאתי שום תיעוד על איך הן מצוירות. מודל הרכיבים עשיר: component ו-instance, ארבעה סוגי properties, slots (רשמי מיוני 2026), ומשתנים עם modes שעוברים בירושה מההורה. לסוכן יש ממשק כתיבה מלא בשם `use_figma`, שמריץ JavaScript של Plugin API בתוך הקובץ, ולצדו כלים להמרת HTML לשכבות. מספרי ביצועים: תקרת זיכרון של 2GB לכל טאב, טעינת עמודים לפי דרישה (70% פחות nodes בזיכרון), ו-WebAssembly שקיצר את זמן הטעינה פי 3.

> מחקר האינטראקציה ופאנל העיצוב של Figma נמצא בנפרד ב-[figma-interface/README.md](figma-interface/README.md).

## 1. מודל הציור

- **[תיעוד]** הקנבס כולו מצויר במנוע משלהם על WebGL, בלי HTML, SVG או Canvas2D. העורך כתוב ב-C++ ועובר קומפילציה ב-Emscripten. בניסוח שלהם, בנו "a browser inside a browser" עם DOM, compositor ומנוע פריסת טקסט משלהם. המנוע מבוסס tiles ותומך ב-masking, blur, blend modes ו-dithered gradients ([1](https://www.figma.com/blog/building-a-professional-design-tool-on-the-web/)).
- **[תיעוד]** הנימוקים שלהם נגד DOM ו-SVG: עומס גדול, אופטימיזציה לגלילה במקום לזום, תוצאות שונות בין דפדפנים במסכות, blur ו-blend, פריסת טקסט שונה בין דפדפנים ובין מערכות הפעלה, ו-Canvas2D ששולח את כל הגיאומטריה מחדש בכל פריים ([1](https://www.figma.com/blog/building-a-professional-design-tool-on-the-web/)).
- **[תיעוד]** הקוד עבר מ-asm.js ל-WebAssembly, וזמן הטעינה ירד פי 3 ויותר ([2](https://www.figma.com/blog/webassembly-cut-figmas-load-time-by-3x/)).
- **[תיעוד]** המעבר ל-WebGPU: הרנדרר עדיין ב-C++ ועובר ל-WebAssembly. השיידרים נכתבים ב-GLSL ומתורגמים אוטומטית ל-WGSL (עם naga). אם WebGPU נכשל באמצע עבודה, המנוע חוזר ל-WebGL בלי לעצור. השיפור דווח רק במילים ("on some classes of devices"), בלי מספרים ([3](https://www.figma.com/blog/figma-rendering-powered-by-webgpu/)).
- **[תיעוד]** טקסט: מנוע פריסה משלהם. כל text node שומר צורה וקטורית מחושבת, ולכן העיצוב נראה נכון גם אצל מי שאין לו את הגופן מותקן. כדי לערוך טקסט צריך קודם לטעון את הגופן (`loadFontAsync`) ([4](https://developers.figma.com/docs/plugins/working-with-text/)).
- **[תיעוד]** החלק בשרת: שרת ה-multiplayer כתוב ב-Node.js, והחלק הכבד בו ב-Rust, תהליך נפרד לכל מסמך ([5](https://www.figma.com/blog/rust-in-production-at-figma/)).
- **[הסקה]** כלומר, הדפדפן משמש אצלם רק כמקום שמריץ WebAssembly וכצינור ל-GPU. לפיקסלים עצמם הוא לא נוגע. זה ההפך הגמור מ-DOM Canvas.

## 2. מה מוצג על הקנבס

- **[תיעוד]** על הקנבס מוצג מודל עיצוב נפרד, עץ אובייקטים "similar to the HTML DOM" ([6](https://www.figma.com/blog/how-figmas-multiplayer-technology-works/)). קוד נוצר ממנו רק ביציאה. ב-Dev Mode הוא מופיע כ-snippets שנוצרו אוטומטית לפי שפה ([7](https://help.figma.com/hc/en-us/articles/15023124644247)). ב-MCP הוא מופיע כ-"React and Tailwind" כברירת מחדל, ו-Figma כותבים במפורש שזה "not production-ready code" ([8](https://developers.figma.com/docs/figma-mcp-server/server-returning-web-code/)).
- **[תיעוד]** כשיש Code Connect, במקום הקוד שנוצר אוטומטית מופיע קוד שהצוות כתב ידנית לאותו רכיב ([7](https://help.figma.com/hc/en-us/articles/15023124644247)). זה עדיין קוד שמוצג ליד העיצוב. הוא לא מה שמצויר על הקנבס.
- **[תיעוד] Figma Sites:** התצוגה המקדימה "rendered with HTML and CSS". ה-breakpoints מותאמים אוטומטית, ואפשר לכוונן אותם ידנית ([9](https://www.figma.com/blog/introducing-figma-sites/)). אי אפשר לייצא את קוד האתר ולפרסם אותו במקום אחר ([10](https://help.figma.com/hc/articles/31242845959703)). **[הסקה]** הקנבס של Sites ממשיך להיות שכבות עיצוב שמצוירות במנוע של Figma. ה-HTML נוצר רק בתצוגה המקדימה ובפרסום, ולכן זה "מה שרואים יוצא לאוויר" רק דרך תרגום.
- **[תיעוד] Figma Make:** יש בו לשונית Files לעריכת קוד ולשונית Browser שמריצה את האפליקציה. כלי point-and-edit מאפשר לבחור חלק מהתצוגה המקדימה ולערוך אותו בפאנל שדומה ל-Figma Design. אפשר להעתיק את התצוגה לשכבות ב-Figma Design, אבל רק כ-snapshot ([11](https://help.figma.com/hc/en-us/articles/31304412302231-Explore-Figma-Make)). בגרסת ה-beta "Make in your local codebase", Make מתחבר לריפו Git ועורך את האפליקציה כשהיא רצה, דרך ה-dev server של הפרויקט (למשל `localhost:3000`). React, Vue ו-Svelte מאומתים ([12](https://help.figma.com/hc/en-us/articles/40789739982871)). **[הסקה]** מבין כל הכלים של Figma, זה הקרוב ביותר ל-"what you see is what ships", וזה גם המודל הכי קרוב ל-Sketchpad.
- **[תיעוד] Code layers:** שכבות React על הקנבס שאפשר להזיז ולשנות להן גודל "and get an immediate code response". אפשר לייבא ריפו מ-GitHub. "Extract designs" ממיר את המצב הנוכחי בחזרה לשכבות עיצוב ([13](https://www.figma.com/blog/code-on-the-figma-canvas/), [14](https://www.figma.com/blog/building-figmas-code-layers/)). **לא פורסם** איך code layer מצויר בתוך קנבס ה-WebGL: iframe, DOM מעל הקנבס או רסטר.

## 3. בידוד בין פריימים

- **[הסקה]** הבעיה הזו לא קיימת אצלם: כל הפריימים הם nodes באותו מודל פנימי, ואין CSS שיכול לזלוג מאחד לשני.
- **[תיעוד] גופנים:** הקבצים לא נטענים כולם לזיכרון, אלא לפי דרישה. בזכות הצורה הווקטורית ששמורה בכל text node, אפשר להציג טקסט גם כשהגופן חסר ([4](https://developers.figma.com/docs/plugins/working-with-text/)). דרך MCP, "Fonts must be uploaded to your Figma account" ([15](https://developers.figma.com/docs/figma-mcp-server/write-to-canvas/)).
- **[תיעוד] משתנים ו-themes:** כל node מקבל את ה-mode של ההורה כברירת מחדל ("Auto"). החיפוש עולה בעץ, ואם אין mode בשום מקום, נלקח ה-mode של ברירת המחדל של ה-collection. לעמוד אפשר לקבוע mode, אבל אין לו "Auto" ([16](https://help.figma.com/hc/en-us/articles/15343816063383-Modes-for-variables)). **[הסקה]** זה מקביל ל-CSS custom properties שעוברות בירושה בתוך ה-shadow root, כשה-mode מתפקד כמו class על ה-host.
- **[תיעוד] Breakpoints:** ב-Figma Design אין breakpoints. ב-Sites, breakpoint הוא רוחב מסך שבו הפריסה משתנה, וסגנונות טקסט יכולים לקבל ערכים שונים לכל breakpoint ([9](https://www.figma.com/blog/introducing-figma-sites/), [17](https://help.figma.com/hc/articles/31230436657815)). משתנים עם modes משמשים גם ל-"device sizes" ([18](https://help.figma.com/hc/en-us/articles/14506821864087-Overview-of-variables-collections-and-modes)).

## 4. מודל המסמך

- **[תיעוד] מבנה:** document, ותחתיו pages, ותחתיהם תוכן העמוד. כל אובייקט שמור כ-`Map<ObjectID, Map<Property, Value>>`. ההורה הוא property של הילד, וכך מעבר להורה אחר לא משנה את הזהות של האובייקט. סדר האחים נקבע ב-fractional index (מספר בין 0 ל-1), וההורה והמיקום נשמרים יחד ב-property אחד ([6](https://www.figma.com/blog/how-figmas-multiplayer-technology-works/)).
- **[תיעוד] שמירת עריכות:** מסנכרנים כל property בנפרד, והשינוי האחרון שהגיע לשרת מנצח (last-writer-wins). שרת מרכזי קובע את הסדר. זה דומה ל-CRDT, אבל לא CRDT מלא. אובייקט שנמחק נשמר ב-undo של הלקוח שמחק אותו, לא בשרת ([6](https://www.figma.com/blog/how-figmas-multiplayer-technology-works/)).
- **[קוד] פורמט REST:** `GET /v1/files/:key` מחזיר `document` (עץ JSON של Nodes), `components`, `componentSets`, `styles`, `version` ו-`branches` ([19](https://developers.figma.com/docs/rest-api/file-endpoints/)). **לא פורסם** תיעוד של הפורמט הבינארי `.fig`.
- **[קוד] סוגי nodes:** ב-Plugin API יש 38 סוגים, ביניהם `FrameNode`, `ComponentNode`, `ComponentSetNode`, `InstanceNode`, `SlotNode`, `TextNode` ו-`SectionNode` ([20](https://developers.figma.com/docs/plugins/api/nodes/)).
- **[קוד] רכיבים:** `addComponentProperty` מקבלת את הסוגים `'BOOLEAN'`, `'TEXT'`, `'INSTANCE_SWAP'`, `'VARIANT'` ו-`'SLOT'` ([21](https://developers.figma.com/docs/plugins/api/ComponentNode/)). ל-instance יש `mainComponent`, `componentProperties` ו-`setProperties()`. האחרונה לא תומכת ב-SLOT וזורקת `cannotSetSlotProperty`. יש גם `overrides` (רק ה-overrides הישירים), `swapComponent()` ששומר overrides, `removeOverrides()`, `detachInstance()` ו-`exposedInstances`. האזהרה שלהם: "Updating an InstanceNode when a ComponentNode changes has the potential to be slow" ([22](https://developers.figma.com/docs/plugins/api/InstanceNode/)).
- **[תיעוד] הפצת שינויים:** בתוך אותו קובץ, שינוי ב-main component מגיע מיד לכל ה-instances. בקבצים אחרים הוא מגיע רק אחרי publish של הספרייה. אפשר לדחוף overrides חזרה ל-main ("Push overrides"), אבל רק באותו קובץ ([23](https://help.figma.com/hc/en-us/articles/360038665934)).
- **[קוד] Slots:** `SlotNode` הוא "a slot within a component or instance". הוא נוצר ב-`createSlot()`, שמוסיף גם property מסוג SLOT. אפשר להגדיר מינימום ומקסימום ילדים ו-preferred values, ויש `resetSlot()`. העתקה של slot מחזירה `FrameNode` רגיל ([24](https://developers.figma.com/docs/plugins/api/SlotNode/)). **[תיעוד]** התמיכה הרשמית (GA) ב-Plugin API הגיעה ב-10 ביוני 2026 ([25](https://developers.figma.com/docs/plugins/updates/2026/06/10/update/)).
- **[תיעוד] משתנים:** הסוגים הם Color, Number, String, Boolean, Timing ו-Easing, עם עד 5,000 משתנים ב-collection. כל mode שומר ערך אחד לכל משתנה ([18](https://help.figma.com/hc/en-us/articles/14506821864087-Overview-of-variables-collections-and-modes)). מספר ה-modes תלוי בתוכנית ([16](https://help.figma.com/hc/en-us/articles/15343816063383-Modes-for-variables)). **[קוד]** הקישור לשדות נעשה ב-`setBoundVariable(field, variable)`, ומשתנה יכול להפנות למשתנה אחר (alias) ([26](https://developers.figma.com/docs/plugins/working-with-variables/)).

## 5. הלוך ושוב לקוד

- **[תיעוד]** Code Connect הוא "a bridge between your codebase and Figma's Dev Mode". יש שתי דרכים לחבר. דרך ה-UI ב-Figma (עם GitHub), שמאפשרת לחבר רכיב אחד לכמה מימושים בקוד. ודרך ה-CLI, שבה חיבור שנוצר יופיע ב-UI אבל אפשר לערוך אותו רק ב-CLI ([27](https://developers.figma.com/docs/code-connect/)).
- **[קוד] איך אלמנט יודע לאיזה רכיב קוד הוא שייך:** הקובץ בקוד מצביע על ה-URL של הרכיב ב-Figma (עם `node-id`) ([27](https://developers.figma.com/docs/code-connect/), [28](https://developers.figma.com/docs/code-connect/react/)). לדוגמה, `figma.connect(Button, 'https://...', { props: { label: figma.string('Text Content'), disabled: figma.boolean('Disabled'), type: figma.enum('Type', {...}) }, example: ... })`. יש גם `figma.instance`, `figma.children` ו-`figma.nestedProps` לרכיבים מקוננים ([28](https://developers.figma.com/docs/code-connect/react/)). **[הסקה]** הכיוון של החיבור הוא מהקוד אל Figma. ב-Figma עצמה הרכיב לא מכיר את הקוד, עד שהמיפוי מתפרסם.
- **[תיעוד]** ב-MCP, כל רכיב מחובר נעטף ב-`<CodeConnectSnippet>` עם ערכי ה-properties הנוכחיים, import ו-snippet ([29](https://developers.figma.com/docs/figma-mcp-server/code-connect-integration/)).
- **[תיעוד]** Dev Mode כולל: פאנל inspect, snippets אוטומטיים לפי שפה, סטטוס "Ready for dev", "Compare changes" (היסטוריה של פריים), ו-dev resources (קישורים ל-GitHub, Storybook ועוד) שעוברים מהרכיב לכל ה-instances ([7](https://help.figma.com/hc/en-us/articles/15023124644247)).
- **לא פורסם** מה קורה כשהקוד משתנה: אם המיפוי נשבר, אם יש בדיקה אוטומטית או אם צריך לפרסם מחדש. **[הסקה]** אין סנכרון אוטומטי. העיצוב והקוד הם שני מקורות אמת נפרדים, ו-Code Connect הוא רק טבלת מיפוי ביניהם.
- **[תיעוד]** בכיוון ההפוך, מקוד לעיצוב: `generate_figma_design` מצלם UI חי מהדפדפן לשכבות רגילות "without a connection to your libraries". משתנים תואמים נקשרים אוטומטית אם הספרייה כבר בקובץ ([30](https://developers.figma.com/docs/figma-mcp-server/code-to-canvas/)). ב-code layers יש "Extract designs" והחזרה לריפו ([13](https://www.figma.com/blog/code-on-the-figma-canvas/)).

## 6. ממשק לסוכן

- **[תיעוד] MCP:** יש שרת מרוחק (`https://mcp.figma.com/mcp`, מומלץ) ושרת desktop דרך האפליקציה ([31](https://developers.figma.com/docs/figma-mcp-server/)). רשימת הכלים המלאה ([32](https://developers.figma.com/docs/figma-mcp-server/tools-and-prompts/)):
  - **קריאה:** `get_design_context` (קוד והקשר), `get_metadata` (XML קל עם id, שם, סוג, מיקום וגודל, ל-"very large designs"), `get_screenshot`, `get_variable_defs`, `get_code_connect_map`, `get_code_connect_suggestions`, `get_context_for_code_connect`, `search_design_system`, `get_libraries`, `download_assets`, `get_figjam`, `get_motion_context`, `get_shader`, `list_shaders`, `whoami` ועוד.
  - **כתיבה:** `use_figma` ("Creates, edits, and inspects content"), `html_to_figma`, `generate_figma_design`, `send_code_to_figma`, `upload_assets`, `generate_image`, `create_new_file`, `generate_diagram`, `add_code_connect_map`, `send_code_connect_mappings`, ושיידרים ו-generative plugins.
- **[תיעוד]** `use_figma` מריץ קוד דרך ה-Plugin API בתוך הקובץ. כל קריאה מחזירה עד 20KB. הוא לא יכול להוסיף תמונות חדשות, והוא ב-beta ([15](https://developers.figma.com/docs/figma-mcp-server/write-to-canvas/)). **[קוד]** הסכמה של הכלי: `code` (JavaScript עם הגלובלי `figma`, עד 50,000 תווים), `fileKey` ו-`description`. בתיאור הכלי יש אזהרות כמו "MUST NEVER use loadAllPagesAsync, setPluginData, createImageAsync" (מתוך סכמת הכלי `use_figma` שנטענה בסביבה הזו).
- **[קוד]** `html_to_figma`: מסמך HTML עצמאי (עד 50MB) נשלח ב-POST ל-URL חד-פעמי. עם `cssSelector` אפשר להפוך עד 20 אלמנטים לפריימים נפרדים. התוצאה היא "plain layers", בלי רכיבים ובלי משתנים (סכמת הכלי, וגם [32](https://developers.figma.com/docs/figma-mcp-server/tools-and-prompts/)).
- **[קוד]** `send_code_to_figma`: מעלים ארכיון של הפרויקט, והוא הופך לקובץ Make או ל-code layer. "Does not create native Design shapes" (סכמת הכלי, וגם [32](https://developers.figma.com/docs/figma-mcp-server/tools-and-prompts/)).
- **[קוד]** שרת ה-desktop בסביבה הזו (`mcp__Figma__*`) כולל רק `get_design_context`, `get_metadata`, `get_screenshot`, `get_variable_defs`, `get_code_connect_map`, `add_code_connect_map` ו-`create_design_system_rules`, כלומר אין בו כתיבה לקנבס. זה מתאים לתיעוד שכלי הכתיבה זמינים רק בשרת המרוחק ([30](https://developers.figma.com/docs/figma-mcp-server/code-to-canvas/)).
- **[תיעוד] Plugin API:** הלוגיקה רצה ב-main thread בתוך sandbox (מכונה וירטואלית של JavaScript שכתובה ב-C ועוברת ל-WebAssembly, אחרי שעזבו את Realms). ה-UI רץ ב-iframe עם null origin, והשניים מדברים רק דרך postMessage ([33](https://www.figma.com/blog/how-we-built-the-figma-plugin-system/)).
- **[תיעוד] REST:** בעיקר קריאה: קבצים, nodes, ורינדור תמונות (`GET /v1/images`, עד 32 מגה-פיקסל). אין endpoint לכתיבת nodes ([19](https://developers.figma.com/docs/rest-api/file-endpoints/)). כתיבת משתנים (`POST variables`) זמינה רק ב-Enterprise ([34](https://developers.figma.com/docs/rest-api/variables/)).

## 7. ביצועים

- **[תיעוד]** תקרת זיכרון: "2GB per browser tab". ב-90% מופיעה התראה, וב-100% הקובץ ננעל. שכבות מוסתרות הן "a big contributor" כי צריך לשמור ולצייר אותן גם כשלא רואים אותן. אין מספר קבוע של שכבות שמגדיר את הגבול ([35](https://help.figma.com/hc/en-us/articles/360040528173-Reduce-memory-usage-in-files)).
- **[תיעוד]** טעינת עמודים לפי דרישה: נטען רק העמוד הנוכחי, יחד עם כל מה שהוא תלוי בו לקריאה ולכתיבה (QueryGraph). למשל, instance תלוי ב-component שיכול לשבת בעמוד אחר. התוצאות: 33% פחות זמן טעינה ב-5% האיטיים, כ-70% פחות nodes בזיכרון, ו-33% פחות קריסות זיכרון. בתצוגת prototype נטענים רק הפריים הנוכחי והקרובים אליו ([36](https://www.figma.com/blog/speeding-up-file-load-times-one-page-at-a-time/)).
- **[תיעוד]** WebAssembly הוריד את זמן הטעינה פי 3 ויותר ([2](https://www.figma.com/blog/webassembly-cut-figmas-load-time-by-3x/)). ב-2018, שינוי מבנה הרנדרר האיץ פי 3 בערך. בדיקות העומס כוללות "thousands of layers edited by 50 multiplayer users". הציור מחולק לפרוסות זמן, כך שעריכה מקומית קודמת לעריכה מרחוק ([37](https://www.figma.com/blog/keeping-figma-fast/)).
- **[תיעוד]** מנוע tiles על ה-GPU, עם מטרה של 60fps והימנעות מעצירות GC ([1](https://www.figma.com/blog/building-a-professional-design-tool-on-the-web/)).
- **לא פורסם:** איך עובד culling, גודל ה-tiles, ספירות nodes מקסימליות או מספרי FPS.

## 8. אינטראקציה והרצה

- **[תיעוד]** Prototype: ב-edit mode מגדירים חיבורים (חצים כחולים) עם trigger ו-action. Presentation view נפתח בטאב חדש, עם מסגרת מכשיר ([38](https://help.figma.com/hc/en-us/articles/360040314193-Guide-to-prototyping-in-Figma), [39](https://help.figma.com/hc/en-us/articles/360040318013-Present-designs-and-prototypes)).
- **[קוד]** סוגי הפעולות: `NODE` (`NAVIGATE`, `SWAP`, `OVERLAY`, `SCROLL_TO`, `CHANGE_TO`), `BACK`, `CLOSE`, `URL`, `SET_VARIABLE`, `SET_VARIABLE_MODE`, `CONDITIONAL` ו-`UPDATE_MEDIA_RUNTIME`, וביטויים עם חשבון, השוואות ולוגיקה ([40](https://developers.figma.com/docs/plugins/api/Action/)).
- **[הסקה]** ה-prototype לא מריץ קוד. זו מכונת מצבים הצהרתית מעל אותו מודל עיצוב, ולכן אין בה הפרדה בין "עריכה" ל"הרצה בטוחה" כמו אצלנו. המצב נשמר רק בזמן הריצה. **לא פורסם** תיעוד רשמי על איפוס משתנים בין ריצות.
- **[תיעוד]** הקוד האמיתי רץ רק ב-Make, בלשונית Browser או מול ה-dev server המקומי ([11](https://help.figma.com/hc/en-us/articles/31304412302231-Explore-Figma-Make), [12](https://help.figma.com/hc/en-us/articles/40789739982871)), ובתצוגה המקדימה של Sites ([9](https://www.figma.com/blog/introducing-figma-sites/)). **לא פורסם** אם ה-Browser של Make הוא iframe עם sandbox. **[הסקה]** ב-plugins הם בחרו ב-iframe עם null origin ([33](https://www.figma.com/blog/how-we-built-the-figma-plugin-system/)), וזה בדיוק המודל של Play ב-DOM Canvas.

## 9. מה רלוונטי לנו

1. **לאמץ את מודל ה-properties לרכיבים, אבל לגזור אותו מהקוד.** הסוגים BOOLEAN, TEXT, INSTANCE_SWAP, VARIANT ו-SLOT ([21](https://developers.figma.com/docs/plugins/api/ComponentNode/)) מתאימים כמעט אחד לאחד ל-props של React (boolean, string, ReactNode, union, children). ב-Sketchpad ה-properties צריכות לבוא ישירות מהטיפוסים של הרכיב בקוד. כך לא צריך שכבת מיפוי כמו Code Connect, שהיא נקודת החולשה של Figma: שני מקורות אמת ושום סנכרון כשהקוד משתנה. **[הסקה]**
2. **לאמץ את "Auto mode" למשתנים.** ירושת mode מההורה, ובהיעדרו ברירת המחדל של ה-collection ([16](https://help.figma.com/hc/en-us/articles/15343816063383-Modes-for-variables)), ממופה ישירות לבחירת theme על ה-shadow host (class או `data-theme`) ולירושה רגילה של custom properties. אצלנו זה עולה כמעט כלום. **[הסקה]**
3. **לאמץ "מטא-דאטה קודם, תוכן אחר כך" לממשק הסוכן.** `get_metadata` (XML קל) לפני `get_design_context` הכבד, ותקרה של 20KB לכל קריאה ([32](https://developers.figma.com/docs/figma-mcp-server/tools-and-prompts/), [15](https://developers.figma.com/docs/figma-mcp-server/write-to-canvas/)), הם דפוס טוב לחסוך בטוקנים של Claude. אצלנו ה-"design context" הוא פשוט ה-HTML של הפריים, כך שהתרגום שלהם ל-React ו-Tailwind מיותר אצלנו. **[הסקה]**
4. **לא לאמץ רנדרר משלנו, אבל כן ללמוד מטעינה לפי דרישה ומהשכבות המוסתרות.** הסיבה של Figma להתרחק מה-DOM הייתה שליטה בפיקסלים וזום ([1](https://www.figma.com/blog/building-a-professional-design-tool-on-the-web/)). אצלנו המטרה הפוכה: הפיקסלים של הדפדפן הם המוצר. הלקחים שכן עוברים: לטעון ולמנות (mount) רק את מה שנראה או שמישהו תלוי בו, כמו QueryGraph ([36](https://www.figma.com/blog/speeding-up-file-load-times-one-page-at-a-time/)), ולהתייחס לתוכן מוסתר כעלות אמיתית ([35](https://help.figma.com/hc/en-us/articles/360040528173-Reduce-memory-usage-in-files)). ב-DOM, shadow roots מחוץ למסך עדיין עולים זיכרון ועבודת style. **[הסקה]**
5. **Make עם הריפו המקומי הוא המתחרה הישיר של Sketchpad.** Figma עצמה מגיעה ל-"קוד אמיתי על משטח עבודה" דרך dev server של הריפו ועריכה בהצבעה ([12](https://help.figma.com/hc/en-us/articles/40789739982871)), ו-code layers על הקנבס ([13](https://www.figma.com/blog/code-on-the-figma-canvas/)). זה מאשר את הכיוון. היתרון שנשאר לנו: כמה פריימים חיים, זה לצד זה, באותו מסמך, בלי iframe לכל אחד, ועם בחירה ובדיקה (inspect) אמיתיות של ה-DOM. כדאי לבנות את זה מוקדם ולהראות אותו למשתמשים, לפני ש-code layers יוצא מ-beta. **[הסקה]**

## מקורות

1. https://www.figma.com/blog/building-a-professional-design-tool-on-the-web/ : C++, WebGL, tiles, למה לא DOM
2. https://www.figma.com/blog/webassembly-cut-figmas-load-time-by-3x/ : WebAssembly, טעינה מהירה פי 3
3. https://www.figma.com/blog/figma-rendering-powered-by-webgpu/ : המעבר ל-WebGPU וחזרה ל-WebGL
4. https://developers.figma.com/docs/plugins/working-with-text/ : טעינת גופנים, צורה וקטורית שמורה
5. https://www.figma.com/blog/rust-in-production-at-figma/ : שרת multiplayer ב-Rust
6. https://www.figma.com/blog/how-figmas-multiplayer-technology-works/ : מודל המסמך, LWW, fractional index
7. https://help.figma.com/hc/en-us/articles/15023124644247 : מדריך Dev Mode
8. https://developers.figma.com/docs/figma-mcp-server/server-returning-web-code/ : למה ה-MCP מחזיר React ו-Tailwind
9. https://www.figma.com/blog/introducing-figma-sites/ : השקת Figma Sites
10. https://help.figma.com/hc/articles/31242845959703 : FAQ של Sites (אין ייצוא קוד)
11. https://help.figma.com/hc/en-us/articles/31304412302231-Explore-Figma-Make : סקירה של Figma Make
12. https://help.figma.com/hc/en-us/articles/40789739982871 : Make in your local codebase (beta)
13. https://www.figma.com/blog/code-on-the-figma-canvas/ : code layers על הקנבס
14. https://www.figma.com/blog/building-figmas-code-layers/ : "Canvas, meet code"
15. https://developers.figma.com/docs/figma-mcp-server/write-to-canvas/ : use_figma ומגבלותיו
16. https://help.figma.com/hc/en-us/articles/15343816063383-Modes-for-variables : modes וירושת Auto
17. https://help.figma.com/hc/articles/31230436657815 : מבוא ל-Figma Sites, breakpoints
18. https://help.figma.com/hc/en-us/articles/14506821864087-Overview-of-variables-collections-and-modes : סוגי משתנים, מגבלות
19. https://developers.figma.com/docs/rest-api/file-endpoints/ : REST של קבצים ותמונות
20. https://developers.figma.com/docs/plugins/api/nodes/ : רשימת סוגי ה-nodes
21. https://developers.figma.com/docs/plugins/api/ComponentNode/ : ComponentNode וסוגי ה-properties
22. https://developers.figma.com/docs/plugins/api/InstanceNode/ : InstanceNode ו-overrides
23. https://help.figma.com/hc/en-us/articles/360038665934 : עריכת main component והפצה
24. https://developers.figma.com/docs/plugins/api/SlotNode/ : SlotNode
25. https://developers.figma.com/docs/plugins/updates/2026/06/10/update/ : slots רשמי (GA) ב-Plugin API
26. https://developers.figma.com/docs/plugins/working-with-variables/ : משתנים ב-Plugin API
27. https://developers.figma.com/docs/code-connect/ : Code Connect, UI מול CLI
28. https://developers.figma.com/docs/code-connect/react/ : figma.connect ל-React
29. https://developers.figma.com/docs/figma-mcp-server/code-connect-integration/ : Code Connect בתוך MCP
30. https://developers.figma.com/docs/figma-mcp-server/code-to-canvas/ : generate_figma_design
31. https://developers.figma.com/docs/figma-mcp-server/ : סקירה של שרת ה-MCP
32. https://developers.figma.com/docs/figma-mcp-server/tools-and-prompts/ : רשימת כל כלי ה-MCP
33. https://www.figma.com/blog/how-we-built-the-figma-plugin-system/ : sandbox ו-iframe של plugins
34. https://developers.figma.com/docs/rest-api/variables/ : REST של משתנים (Enterprise)
35. https://help.figma.com/hc/en-us/articles/360040528173-Reduce-memory-usage-in-files : תקרת 2GB, שכבות מוסתרות
36. https://www.figma.com/blog/speeding-up-file-load-times-one-page-at-a-time/ : טעינת עמודים לפי דרישה, QueryGraph
37. https://www.figma.com/blog/keeping-figma-fast/ : תשתית בדיקות ביצועים
38. https://help.figma.com/hc/en-us/articles/360040314193-Guide-to-prototyping-in-Figma : prototyping
39. https://help.figma.com/hc/en-us/articles/360040318013-Present-designs-and-prototypes : presentation view
40. https://developers.figma.com/docs/plugins/api/Action/ : סוגי הפעולות ב-prototype
