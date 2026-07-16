Backend Architecture (scaffold)

This folder contains the new clean architecture scaffolding to be incrementally integrated:

- `controllers/` - HTTP handlers (Express)
- `services/` - Business logic orchestrating repositories and AI components
- `repositories/` - Data access layer (Mongoose models)
- `models/` - Mongoose schemas for long-term memory and messages
- `middleware/` - Express middleware (crisis detection, validation)
- `ai/` - Prompt builder, RAG integration, embeddings
- `utils/` - Helpers like `logger`
- `types/` - Shared TypeScript interfaces

Notes:
- This scaffold is intentionally non-invasive: existing routes/controllers remain until we migrate them.
- Next steps: create DB schemas for JournalEntries, MoodLogs, MeditationSessions and implement message persistence in Socket handlers.
