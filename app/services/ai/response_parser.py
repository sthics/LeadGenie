import json
import re

class ResponseValidator:
    def clean_json_response(self, response: str) -> str:
        """Clean and fix common JSON formatting issues"""
        # Remove any text before the first {
        response = response.strip()
        start_brace = response.find('{')
        if start_brace != -1:
            response = response[start_brace:]
        
        # Find the last } to handle any text after JSON
        end_brace = response.rfind('}')
        if end_brace != -1:
            response = response[:end_brace + 1]
        
        # Add missing closing brace if needed
        open_braces = response.count('{')
        close_braces = response.count('}')
        if open_braces > close_braces:
            response += '}' * (open_braces - close_braces)
        
        # Clean up common formatting issues
        response = re.sub(r',\s*}', '}', response)  # Remove trailing commas
        response = re.sub(r',\s*]', ']', response)  # Remove trailing commas in arrays
        
        return response

    def validate_ai_response(self, response: str) -> bool:
        try:
            # First try cleaning the response
            cleaned_response = self.clean_json_response(response)
            parsed = json.loads(cleaned_response)
            
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
    
    def parse_ai_response(self, response: str) -> dict:
        """Parse AI response with cleaning"""
        cleaned_response = self.clean_json_response(response)
        return json.loads(cleaned_response)