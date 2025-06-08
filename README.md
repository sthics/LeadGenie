# LeadGenie - AI-Powered Lead Qualification

LeadGenie is an intelligent lead qualification system that uses AI to automatically analyze and score incoming leads. It helps sales teams prioritize their efforts by categorizing leads as hot, warm, or cold based on various factors.

## Features

- 🤖 AI-powered lead qualification using Mistral 7B
- 📊 Automatic lead scoring and categorization
- 🔄 Rule-based fallback system
- 📈 Performance monitoring and logging
- 🚀 FastAPI backend with async support
- 🐳 Docker deployment support
- 🔒 Multi-tenant support

## Prerequisites

- Docker and Docker Compose
- Python 3.11+
- PostgreSQL 15+
- Redis 7+
- Ollama (for local model deployment)

## Quick Start

1. Clone the repository:
```bash
git clone https://github.com/yourusername/leadgenie.git
cd leadgenie
```

2. Start the services:
```bash
docker-compose up -d
```

3. Initialize the database:
```bash
docker-compose exec app alembic upgrade head
docker-compose exec app python -m app.core.init_db
```

4. Access the API:
- API Documentation: http://localhost:8000/api/v1/docs
- Health Check: http://localhost:8000/health

## API Endpoints

### Lead Qualification

```http
POST /api/v1/leads/qualify
Content-Type: application/json

{
    "name": "John Doe",
    "email": "john@example.com",
    "company": "Acme Corp",
    "description": "Looking for AI solution",
    "budget": "$50k-100k",
    "timeline": "Q3 2024"
}
```

### Batch Qualification

```http
POST /api/v1/leads/batch-qualify
Content-Type: application/json

[
    {
        "name": "John Doe",
        "email": "john@example.com",
        "company": "Acme Corp"
    },
    {
        "name": "Jane Smith",
        "email": "jane@example.com",
        "company": "TechStart Inc"
    }
]
```

## Development Setup

1. Create a virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # Linux/Mac
.\venv\Scripts\activate  # Windows
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your configuration
```

4. Run migrations:
```bash
alembic upgrade head
```

5. Start the development server:
```bash
uvicorn app.main:app --reload
```

## AI Model Configuration

LeadGenie uses Mistral 7B through Ollama for lead qualification. The model is configured with:

- Temperature: 0.1 (for consistent output)
- Top P: 0.9
- Max Tokens: 1000

To use a different model:

1. Edit `app/services/ai_service.py`
2. Change the `model_name` in `LeadQualificationAI.__init__`
3. Pull the new model: `ollama pull <model_name>`

## Performance Optimization

The system includes several optimizations:

- Response caching for similar leads
- Batch processing for multiple leads
- Background task processing
- Connection pooling
- Rule-based fallback system

## Monitoring

Monitor the system through:

- API health endpoint: `/api/v1/leads/health`
- Structured logging
- Database metrics
- AI processing logs

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support, please open an issue in the GitHub repository or contact the maintainers. 