# Yeside & Co. — Council Chamber v3
## Lean 6-member council + Supabase Memory + Groq/Gemini AI

### STEP 1 — Supabase Memory Setup (one time only)
Go to your Supabase project → SQL Editor → paste the contents of `supabase_council_memory.sql` → Run

### STEP 2 — Vercel Environment Variables
Add ALL of these in Vercel → Project → Settings → Environment Variables:

| Name | Value |
|---|---|
| GROQ_API_KEY | your Groq key |
| GEMINI_API_KEY | your Gemini key (fallback) |
| SUPABASE_URL | https://obpuwfyagonhkifzcuyt.supabase.co |
| SUPABASE_ANON_KEY | your anon key |

### STEP 3 — Deploy
Push to GitHub → Vercel auto-deploys

### STEP 4 — Test
Visit /api/test — all should show OK

### Council Members (Lean 6 + Chair)
- 👑 Chair — Juliana Yeside Tomori (The Standard)
- 🏢 CEO — Aboyeji (Direction)
- 💰 Sales & Distribution — Alabi + Akinlade (Revenue)
- 🎯 CMO & Social — Asika + Ajibade (Brand)
- ⚙️ COO & Product — Opeke + Eweniyi (Systems)
- 💳 CFO — Aig-Imoukhuede (Finance)
- 🔗 Konnekt Specialist — Deep product focus

### Memory System
Every conversation is stored in Supabase. The council grows smarter with every session.
Tables: council_conversations · council_memory · council_founder_profile
