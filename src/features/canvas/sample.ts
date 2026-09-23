export const SAMPLE_HTML = `
<div class="card">
  <div class="badge">New</div>
  <h1>Paste code, get layers</h1>
  <p>Every element here is a live DOM node on the canvas. Click one to select it, drag it to move it, and edit it in the inspector.</p>
  <div class="actions">
    <button class="primary">Get started</button>
    <button>Learn more</button>
  </div>
  <svg width="120" height="120" viewBox="0 0 120 120" class="art">
    <circle cx="60" cy="60" r="50" fill="#0d99ff" opacity="0.15"/>
    <path d="M30 70 L55 45 L75 65 L95 35" stroke="#0d99ff" stroke-width="6" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>
</div>
`;

export const SAMPLE_CSS = `
body { padding: 40px; background: #f6f7f9; }
.card { position: relative; background: #fff; border-radius: 16px; padding: 32px; box-shadow: 0 8px 30px rgba(0,0,0,.08); max-width: 420px; }
.badge { display: inline-block; background: #0d99ff; color: #fff; font-size: 12px; font-weight: 600; padding: 4px 10px; border-radius: 999px; }
h1 { font-size: 28px; margin: 16px 0 8px; letter-spacing: -0.02em; }
p { color: #555; line-height: 1.5; margin: 0 0 24px; }
.actions { display: flex; gap: 8px; }
button { font: inherit; padding: 10px 16px; border-radius: 8px; border: 1px solid #ddd; background: #fff; cursor: pointer; }
button.primary { background: #111; color: #fff; border-color: #111; }
.art { position: absolute; right: 24px; top: 24px; }
`;
