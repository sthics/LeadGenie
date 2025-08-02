import json

class ResponseValidator:
    def validate_ai_response(self, response: str) -> bool:
        try:
            parsed = json.loads(response)
            required_fields = ['score', 'category', 'confidence']

            if not all(field in parsed for field in required_fields):
                return False

            if not (0 <= parsed['score'] <= 100):
                return False

            if parsed['category'] not in ['Hot', 'Warm', 'Cold']:
                return False

            return True
        except json.JSONDecodeError:
            return False