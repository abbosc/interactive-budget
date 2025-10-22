# Budget App - React + TypeScript + Vite + Supabase

Modern budget management application built with cutting-edge technologies.

## 🚀 Technology Stack

- **Vite** - Lightning-fast build tool
- **React 18** - UI framework
- **TypeScript** - Type safety
- **Supabase** - Database & backend
- **Tailwind CSS** - Styling
- **React Query** - Server state management
- **Zustand** - Client state management
- **React Router** - Routing

## 📋 Setup Instructions

### 1. Supabase Database Setup

1. Go to [Supabase Dashboard](https://app.supabase.com/)
2. Open your project: https://corihazwcqrmwmjkkcnl.supabase.co
3. Navigate to **SQL Editor**
4. Copy and paste the contents of `supabase-schema.sql`
5. Click "Run" to create all tables and policies

### 2. Local Development

```bash
# Install dependencies (already done)
npm install

# Start development server
npm run dev
```

The app will open at `http://localhost:5173`

### 3. Deploy to Netlify

```bash
# Build the project
npm run build

# Deploy to Netlify
# Option 1: Connect GitHub repo to Netlify (recommended)
# Option 2: Use Netlify CLI
npm install -g netlify-cli
netlify deploy --prod
```

**Environment Variables in Netlify:**
- `VITE_SUPABASE_URL`: https://corihazwcqrmwmjkkcnl.supabase.co
- `VITE_SUPABASE_ANON_KEY`: (your anon key)

## 📁 Project Structure

```
src/
├── components/        # Reusable UI components
├── features/          # Feature modules
│   ├── budget/       # Budget adjustment page
│   ├── admin/        # Admin panel
│   ├── summary/      # Summary page
│   └── plans/        # Budget plans list
├── lib/              # Utilities
├── stores/           # Zustand stores
├── types/            # TypeScript types
└── App.tsx           # Main app with routing
```

## 🎯 Next Steps

The following components need to be built:

1. **Admin Panel** - CRUD for categories/subcategories
2. **Budget Page** - Main budget adjustment interface
3. **Summary Page** - Budget change overview
4. **Plans Page** - List of saved budgets

## 🔧 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

## 📝 Notes

- No localStorage used - all data in Supabase cloud
- Number formatting: space for thousands, comma for decimals
- Sliders allow ±10% adjustment from default values
