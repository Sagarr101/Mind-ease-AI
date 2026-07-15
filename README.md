# MindEase AI 🌿

MindEase AI is a production-ready, full-stack mental health application designed to assist users in tracking their emotional health and connecting with an empathetic AI Therapist. Built with a modern, glassmorphic design system using Next.js 15, Express.js, MongoDB, and Socket.io.

## Features

- 👤 **Secure Authentication**: JWT-based session management.
- 🔥 **Wellness Streaks**: Automated login-streak tracking.
- 💬 **AI Therapist Chat**: Real-time Socket.io messages supported by a Cognitive Behavioral Therapy (CBT) conversational agent.
- 📊 **Mood Tracker**: Calendar-driven daily mood scoring and tag collection.
- 📝 **Self-Reflection Journal**: Auto-analyzes text blocks to tag positive/negative/neutral sentiment.
- 🧘 **Meditation Center**: Immersive countdown timers and cataloged guides.
- 📈 **Analytics & Reports**: Visualized mood/relaxation graphs and weekly reports.
- 🔔 **Alerts & Notifications**: Notifications for streak milestones and compiled reports.

## Project Structure

```
MindEase AI/
├── backend/            # Express, Node, MongoDB, Socket.io, TypeScript
└── frontend/           # Next.js 15, Tailwind CSS, Framer Motion, Recharts
```

## Setup Instructions

### Prerequisites
- Node.js (v18+)
- MongoDB (running locally or Atlas)
- Docker (optional, for containerized run)

### Running Locally

1. **Database Setup**:
   Ensure MongoDB is running locally on `mongodb://127.0.0.1:27017/mindease`.

2. **Backend Setup**:
   ```bash
   cd backend
   npm install
   npm run seed      # Seeds 60 days of realistic dummy logs
   npm run dev       # Launches API at http://localhost:5001
   ```

3. **Frontend Setup**:
   ```bash
   cd frontend
   npm install
   npm run dev       # Launches Next.js dev server at http://localhost:3000
   ```

### Docker Compose Run

Run the entire stack (Database + Backend + Frontend) using Docker:
```bash
docker-compose up --build
```
This boots up:
- MongoDB at port `27017`
- Express backend API at port `5001`
- Next.js frontend app at port `3000`
