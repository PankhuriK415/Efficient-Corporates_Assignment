# Anonymous Feedback Wall

A lightweight full-stack web application built with modern edge technologies. Users can submit anonymous feedback, which is stored in Supabase and cached in Cloudflare KV for high-performance reads.

## 🚀 Live Demo
- **Frontend:** [https://feedback-wall.pages.dev](https://feedback-wall.pages.dev) (Placeholder)
- **API:** [https://feedback-api.workers.dev](https://feedback-api.workers.dev) (Placeholder)

## 🛠️ Tech Stack
- **Frontend:** [Astro](https://astro.build/) (Static Site Generation / SSR)
- **Backend:** [Cloudflare Workers](https://workers.cloudflare.com/) (Edge Runtime)
- **Database:** [Supabase](https://supabase.com/) (PostgreSQL)
- **Cache:** [Cloudflare KV](https://www.cloudflare.com/products/workers-kv/) (Key-Value Storage)
- **Styling:** Vanilla CSS (Glassmorphism design)

## 🏗️ Architecture
1. **Astro Frontend:** A responsive UI that allows users to view and submit feedback. It communicates with the Worker API via REST.
2. **Cloudflare Worker:** Acts as a serverless backend.
   - **GET /api/messages:** Checks Cloudflare KV for cached messages. If empty, fetches from Supabase and populates KV.
   - **POST /api/submit:** Validates input, inserts into Supabase, and updates the KV cache with the 10 latest messages.
3. **Supabase:** Primary persistent storage for all feedback.
4. **Cloudflare KV:** Distributed cache that stores the latest 10 messages for near-instant retrieval across the globe.

## 📋 Database Schema
Run this SQL in your Supabase SQL Editor:
```sql
CREATE TABLE feedbacks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT DEFAULT 'Anonymous',
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security (optional but recommended)
ALTER TABLE feedbacks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read access" ON feedbacks FOR SELECT USING (true);
CREATE POLICY "Allow public insert access" ON feedbacks FOR INSERT WITH CHECK (true);
```

## ⚙️ Setup Instructions

### 1. Backend (Worker API)
1. Navigate to `worker-api/`.
2. Install dependencies: `npm install`.
3. Update `wrangler.toml` with your Cloudflare KV ID and Supabase credentials.
4. Deploy: `npm run deploy`.

### 2. Frontend (Astro)
1. Navigate to `astro-frontend/`.
2. Install dependencies: `npm install --legacy-peer-deps` (if encountering version conflicts between Astro and Cloudflare adapter).
3. Configure the API URL in components by setting the `PUBLIC_API_URL` environment variable.
4. Build: `npm run build`.
5. Deploy to Cloudflare Pages.

## ✨ Bonus Features Implemented
- [x] **Premium UI:** Glassmorphism design with a vibrant dark mode.
- [x] **Character Counter:** Real-time feedback for message length.
- [x] **Animations:** Smooth entry animations for cards and headers.
- [x] **HTML Escaping:** Security measure against XSS in feedback messages.
- [x] **Timestamp Formatting:** User-friendly dates.

## 📝 Assumptions
- The frontend and backend are deployed on the same domain or CORS is properly configured in the Worker.
- The user has created a Supabase project and a Cloudflare KV namespace.
- No authentication is required as per the "Anonymous" requirement.
