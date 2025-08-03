# LeadGenie - AI-Powered Lead Qualification Platform

LeadGenie is an intelligent lead qualification system that uses AI to automatically analyze, score, and categorize incoming leads. It helps sales teams focus their efforts on high-conversion prospects by providing instant AI-powered insights and automated lead routing.

## Current Status: MVP Ready

**Development Phase**: Core functionality implemented with authentication system and AI qualification engine.

## Features

- **AI-Powered Qualification**: Uses Groq API (llama3-8b-8192 model) for intelligent lead analysis
- **Smart Lead Scoring**: Automatic categorization as Hot/Warm/Cold with confidence scores
- **Multi-Layer Fallback**: Rule-based qualification when AI is unavailable
- **Authentication System**: JWT-based auth with role-based access control (Admin/Manager/Rep)
- **Modern Frontend**: React 18 + TypeScript with Tailwind CSS and Framer Motion
- **FastAPI Backend**: Async Python with PostgreSQL and structured logging
- **Performance Monitoring**: Comprehensive logging and AI processing tracking
- **Real-time Updates**: Background task processing with status tracking

## Architecture

### Backend Stack
- **Framework**: FastAPI with async Python 3.9+
- **Database**: PostgreSQL 14+ with Alembic migrations
- **AI Service**: Groq API (llama3-8b-8192 model) with rule-based fallback
- **Authentication**: JWT-based with role-based access control
- **Logging**: Structured logging with timestamps

### Frontend Stack
- **Framework**: React 18 with TypeScript/JSX
- **Styling**: Tailwind CSS with custom design system
- **State Management**: Zustand for global state
- **Build Tool**: Vite for optimal development experience
- **Components**: Custom component library

## Prerequisites

- Python 3.9+
- Node.js 18+
- PostgreSQL 14+
- Redis 7+ (for caching and background tasks)
- Groq API key (for AI functionality)

## Quick Start

### Backend Setup

1. **Clone and setup environment:**
```bash
git clone https://github.com/yourusername/leadgenie.git
cd leadgenie
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

2. **Configure environment variables:**
```bash
cp .env.example .env
# Edit .env with your configuration:
# - Database credentials
# - Groq API key
# - CORS origins for frontend
```

3. **Setup database:**
```bash
# Start PostgreSQL and Redis services
brew services start postgresql@14  # macOS
brew services start redis

# Create database
psql postgres -c "CREATE DATABASE leadgenie_db OWNER leadgenie_user;"

# Run migrations
python -m alembic upgrade head
```

4. **Start backend server:**
```bash
uvicorn app.main:app --reload
```

### Frontend Setup

1. **Install and start frontend:**
```bash
cd frontend
npm install
npm run dev
```

2. **Access the application:**
- Frontend: http://localhost:5173
- API Documentation: http://localhost:8000/api/v1/docs
- Health Check: http://localhost:8000/health

## API Endpoints

### Authentication

```http
# Register new user
POST /api/v1/auth/register
Content-Type: application/json
{
    "email": "user@example.com",
    "password": "securepass123",
    "full_name": "User Name"
}

# Login (returns JWT token)
POST /api/v1/auth/login
Content-Type: application/x-www-form-urlencoded
username=user@example.com&password=securepass123
```

### Lead Qualification

```http
# Qualify a single lead
POST /api/v1/leads/qualify
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
    "name": "John Doe",
    "email": "john@example.com",
    "company": "Acme Corp",
    "message": "Looking for AI solution with $50k budget"
}
```

**Response:**
```json
{
    "id": "uuid",
    "name": "John Doe",
    "email": "john@example.com",
    "company": "Acme Corp", 
    "ai_score": 85,
    "category": "Hot",
    "intent_analysis": {
        "confidence": 0.92,
        "reasoning": "Strong buying signals with clear budget"
    },
    "buying_signals": ["Budget mentioned", "Urgency expressed"],
    "status": "qualified"
}
```

## Project Structure

```
/app/
├── api/v1/endpoints/    # API route handlers (auth.py, leads.py)
├── core/               # Core config, database, security, deps
├── models/             # SQLAlchemy models (User, Lead, AIProcessingLog)
├── schemas/            # Pydantic request/response schemas
├── services/           # Business logic services
│   ├── ai/            # AI-related services (moved for organization)
│   │   ├── ai_service.py      # Main AI qualification service
│   │   ├── fallback_handler.py # Rule-based fallback
│   │   ├── prompt_templates.py # AI prompts
│   │   └── response_parser.py  # Response validation
│   └── auth.py        # Authentication service
└── main.py            # FastAPI application entry point

/frontend/
├── src/components/     # React components (Layout, Auth, etc.)
├── src/pages/         # Application pages (Dashboard, Login, etc.)
├── src/services/      # API client services
├── src/stores/        # Zustand state management
└── src/utils/         # Utility functions

/alembic/              # Database migrations
```

## AI Model Configuration

LeadGenie uses Groq API with llama3-8b-8192 model for lead qualification. The system is configured with:

- **Temperature**: 0.1 (for consistent output)
- **Max Tokens**: 1000
- **Fallback System**: Rule-based qualification when AI is unavailable

**Environment Variables:**
```bash
GROQ_API_KEY=your_groq_api_key_here
```

The AI service includes:
- Structured prompt templates with few-shot examples
- JSON response validation
- Multi-layer fallback (AI → Rules → Heuristics)
- Comprehensive logging and cost tracking

## Database Schema

### Key Models

**Users Table:**
- UUID primary keys for scalability
- Role-based access (admin, sales_manager, sales_rep)
- JWT authentication with bcrypt password hashing

**Leads Table:**
- UUID primary keys
- AI analysis results (score, category, intent_analysis)
- Buying signals and risk factors (JSON fields)
- Status tracking (new, processing, qualified, etc.)

**AI Processing Logs:**
- Complete audit trail of AI interactions
- Performance metrics and error tracking
- Model usage and response validation

## Authentication & Security

- **JWT Tokens**: 15-minute access tokens with refresh capability
- **Role-Based Access**: Granular permissions for different user types
- **Password Security**: bcrypt hashing with salt rounds
- **CORS Protection**: Configured for frontend origins
- **Input Validation**: Pydantic schemas prevent injection attacks

## Performance & Monitoring

**Optimization Features:**
- Async/await throughout the stack
- Background task processing for AI qualification
- Database connection pooling
- Multi-layer fallback system

**Monitoring:**
- Structured logging with timestamps
- API health endpoint: `/health`
- AI processing metrics and cost tracking
- Request/response performance logging

## Current Development Status

### Completed
- **Backend Authentication**: JWT-based auth with role management
- **AI Qualification Engine**: Groq API integration with fallback system
- **Frontend Authentication**: Protected routes with login/logout flow
- **Database Schema**: PostgreSQL with UUID keys and proper relationships
- **API Structure**: RESTful endpoints with comprehensive documentation

### Known Issues
- Database migration conflicts need resolution for full functionality
- Some AI service modules need integration testing

### Next Steps
1. Resolve database schema alignment
2. Complete end-to-end testing of authentication flow
3. Implement refresh token functionality
4. Add user management interface
5. Deploy to staging environment

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support, please open an issue in the GitHub repository or contact the development team. 