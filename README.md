# LeadGenie - AI-Powered Lead Qualification System

LeadGenie is an enterprise-grade lead qualification system that uses AI to analyze and score incoming leads, helping sales teams prioritize their efforts effectively.

## Features

- AI-powered lead qualification using GPT-4
- Secure authentication with JWT tokens
- Role-based access control
- Real-time lead scoring and categorization
- Comprehensive analytics and reporting
- Email notifications for hot leads
- RESTful API with OpenAPI documentation

## Tech Stack

- **Backend**: FastAPI 0.100+ with Python 3.11+
- **Database**: PostgreSQL with SQLAlchemy 2.0 (async)
- **Authentication**: JWT with refresh tokens
- **AI Integration**: OpenAI GPT-4 API
- **Caching**: Redis
- **Task Queue**: Celery
- **Monitoring**: Structured logging with correlation IDs

## Prerequisites

- Python 3.11+
- PostgreSQL 14+
- Redis 6+
- Docker (optional)

## Getting Started

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/leadgenie.git
   cd leadgenie
   ```

2. Create and activate a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Set up environment variables:
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

5. Initialize the database:
   ```bash
   alembic upgrade head
   ```

6. Run the development server:
   ```bash
   uvicorn app.main:app --reload
   ```

The API will be available at `http://localhost:8000`

## API Documentation

- Swagger UI: `http://localhost:8000/api/v1/docs`
- ReDoc: `http://localhost:8000/api/v1/redoc`

## Testing

Run the test suite:
```bash
pytest
```


## Security Features

- JWT-based authentication
- Role-based access control
- Rate limiting
- CORS protection
- Input validation
- SQL injection prevention
- XSS protection
- PII encryption

## Monitoring

- Structured logging with correlation IDs
- Performance metrics
- Error tracking
- API usage statistics
- AI service monitoring

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## Authors

- Ambar - Intern @FirstHive

## Acknowledgments

- OpenAI for GPT-4 API
- FastAPI team for the amazing framework
- All contributors and supporters 