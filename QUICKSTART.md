# MindEase AI - Quick Start Guide

## Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)
- npm or yarn

## Backend Setup

### 1. Install Dependencies
```bash
cd backend
npm install
```

### 2. Environment Variables
Create `.env` in `backend/`:
```env
# Database
MONGODB_URI=mongodb://localhost:27017/mindease
# or for Atlas: mongodb+srv://user:pass@cluster.mongodb.net/mindease

# JWT
JWT_SECRET=your_jwt_secret_key_here

# LLM APIs (optional; fallback to local CBT)
GEMINI_API_KEY=your_gemini_key_or_leave_empty
OPENAI_API_KEY=your_openai_key_or_leave_empty

# Server
PORT=5001
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```

### 3. Start Backend
```bash
npm run dev
```
Server starts on `http://localhost:5001`

### 4. Verify
```bash
curl http://localhost:5001/health
# Expected: { "status": "OK", "timestamp": "..." }
```

---

## Frontend Setup

### 1. Install Dependencies
```bash
cd frontend
npm install
```

### 2. Environment Variables
Create `.env.local` in `frontend/`:
```env
NEXT_PUBLIC_API_URL=http://localhost:5001
```

### 3. Start Frontend
```bash
npm run dev
```
Frontend starts on `http://localhost:3000`

---

## Key Features to Test

### 1. Long-Term Memory
- Start a conversation in `/chat`
- Send a message
- Refresh page
- Send another message
- AI should reference previous messages

### 2. Crisis Detection
- Go to `/chat`
- Type: "I want to die"
- AI should show crisis resources instead of therapy

### 3. Emotion Detection
- Go to `/emotion-analytics`
- Messages are analyzed for 16 emotions
- Each message stores emotion distribution

### 4. Knowledge Resources
- Go to `/knowledge-resources`
- Search: "anxiety"
- Should retrieve CBT chunks on anxiety management

### 5. Weekly Insights
- Go to `/insights`
- Click "Generate Insights"
- Should show: mood trends, meditation minutes, journal activity, etc.

### 6. Memory Timeline
- Go to `/memory-timeline`
- Lists all conversations by date
- Click to view `/conversation-history`

---

## API Examples

### Get Recent Insights
```bash
curl -H "Authorization: Bearer <token>" \
  http://localhost:5001/api/insights/user-insights
```

### Search Knowledge Base
```bash
curl "http://localhost:5001/api/knowledgebase/search?q=anxiety"
```

### Get Conversations
```bash
curl -H "Authorization: Bearer <token>" \
  http://localhost:5001/api/conversations
```

### Get Messages in Conversation
```bash
curl -H "Authorization: Bearer <token>" \
  "http://localhost:5001/api/conversations/<conversationId>/messages"
```

---

## Folder Structure

### Backend
```
backend/
├── src/
│   ├── app.ts              # Express app setup
│   ├── server.ts           # Server entry
│   ├── config/             # DB, Socket setup
│   ├── controllers/        # HTTP handlers
│   ├── services/           # Business logic
│   ├── repositories/       # Data access
│   ├── models/             # DB schemas
│   ├── middleware/         # Auth, validation
│   ├── routes/             # API routes
│   ├── ai/                 # Prompt building
│   ├── utils/              # Helpers, KB init
│   └── types/              # TypeScript interfaces
├── prisma/                 # (Optional) Prisma schema
└── package.json
```

### Frontend
```
frontend/
├── src/
│   ├── app/
│   │   ├── layout.tsx      # Root layout
│   │   ├── page.tsx        # Home page
│   │   ├── chat/           # Chat page
│   │   ├── memory-timeline/    # NEW
│   │   ├── emotion-analytics/  # NEW
│   │   ├── insights/           # NEW
│   │   ├── knowledge-resources/ # NEW
│   │   ├── conversation-history/ # NEW
│   │   ├── safety-center/       # NEW
│   │   └── (other pages)
│   ├── components/
│   │   └── layout/DashboardLayout.tsx
│   ├── context/
│   │   ├── AuthContext.tsx
│   │   └── SocketContext.tsx
│   ├── lib/
│   │   └── api.ts          # HTTP client
│   └── types/
│       └── index.ts        # Shared types
├── public/
├── package.json
└── tsconfig.json
```

---

## Common Development Tasks

### Add New Route
1. Create service in `backend/src/services/`
2. Create repository in `backend/src/repositories/`
3. Create route handler in `backend/src/routes/`
4. Mount in `backend/src/app.ts`

### Add New Frontend Page
1. Create folder in `frontend/src/app/<page-name>/`
2. Add `page.tsx`
3. Import `DashboardLayout` and use existing patterns
4. Add API calls via `api.ts`

### Database Debugging
```bash
# Connect to MongoDB
mongosh mongodb://localhost:27017/mindease

# View collections
db.getCollectionNames()

# Check messages
db.messages.find({}).limit(5)

# Check conversations
db.conversations.find({}).limit(5)
```

---

## Production Deployment

### Environment Setup
```env
NODE_ENV=production
MONGODB_URI=<production_mongodb_uri>
JWT_SECRET=<secure_random_secret>
GEMINI_API_KEY=<your_key>
OPENAI_API_KEY=<your_key>
FRONTEND_URL=<your_domain>
```

### Build & Run
```bash
# Backend
cd backend
npm run build  # (if needed)
npm start

# Frontend (separate terminal/process)
cd frontend
npm run build
npm start

# Or use PM2/Docker for process management
```

### Verify Production
```bash
# Test API
curl https://your-domain/api/health

# Test Socket
wscat -c wss://your-domain --auth "token=<jwt_token>"
```

---

## Troubleshooting

### Socket Connection Fails
1. Verify backend running: `curl http://localhost:5001/health`
2. Check JWT token validity
3. Check CORS settings in socket config
4. Check browser console for errors

### LLM API Errors
1. Check API keys  in `.env`
2. Fallback to local CBT (works without API keys)
3. Check API rate limits
4. Review backend logs for errors

### Database Connection Fails
1. Verify MongoDB is running: `mongosh`
2. Check `MONGODB_URI` in `.env`
3. Verify network/firewall access
4. Check MongoDB authentication credentials

---

## Next Steps

1. **Customize CBT Knowledge Base:** Add/modify documents in `backend/src/utils/initializeKB.ts`
2. **Upgrade Embeddings:** Replace TF-IDF with semantic embeddings in `ragService.ts`
3. **Add Testing:** Create Jest test suite for services
4. **Integrate Recharts:** Add visualization to insights/analytics pages
5. **Set Up CI/CD:** GitHub Actions or similar for automated testing/deployment

---

**Last Updated:** July 15, 2026
**Version:** 2.0 (Upgraded with Long-Term Memory, RAG, Crisis Detection, Emotion Detection, and Insights)
