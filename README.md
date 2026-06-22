# Yeside & Co. — Council Chamber

AI-powered leadership council for Yeside & Co. ventures.

## Deploy to Vercel

### 1. Add your Anthropic API Key
In Vercel dashboard → Project → Settings → Environment Variables:
```
ANTHROPIC_API_KEY = sk-ant-your-key-here
```

### 2. Deploy
```bash
# Option A — Vercel CLI
npm i -g vercel
vercel --prod

# Option B — GitHub
Push this folder to GitHub → Import repo in vercel.com → Deploy
```

### 3. Done
Your Council Chamber is live at your Vercel URL.

## Project Structure
```
yeside-council/
├── index.html        ← Full app (UI + council logic)
├── api/
│   └── council.js    ← Serverless proxy (keeps API key safe)
├── vercel.json       ← Routing config
└── README.md
```

## Council Members
- 👑 Chair — Juliana Yeside Tomori (Founding Chair)
- 🏢 CEO — Iyinoluwa Aboyeji
- ⚙️ COO — Funke Opeke · Juliet Ehimuan
- 🎯 CMO — Obi Asika · Jide Sipe · Tosin Ajibade
- 💰 Sales — Akin Alabi · Mitchell Elegbe · Sim Shagaya
- 📦 Distribution — Tunde Kehinde · Ezra Olubi · Shola Akinlade
- 💳 CFO — Aig-Imoukhuede · Herbert Wigwe · Wale Ayeni
- 📱 Social & Digital — Tayo Aina · Fisayo Fosudo · Pamilerin Adegoke
- 🚀 CPO — Odunayo Eweniyi · Olugbenga Agboola
- 🧠 CAIO — Oluwasanmi Koyejo · Pelumi Ade-Oshineye
- 🏛 Policy & Trust — Bosun Tijani · Nnenna Nwakanma
- ⬡ Full Council — All voices together

Powered by Claude Sonnet 4.6
