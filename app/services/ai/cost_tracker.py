class CostTracker:
    # Groq pricing for different models
    # Note: Groq offers free tier, but these are reference prices for cost tracking
    MODEL_PRICING = {
        "llama3-8b-8192": {
            "input": 0.05,   # per million tokens
            "output": 0.08,  # per million tokens
        },
        "llama3-70b-8192": {
            "input": 0.59,
            "output": 0.79,
        },
        "mixtral-8x7b-32768": {
            "input": 0.24,
            "output": 0.24,
        }
    }
    
    # Default fallback pricing
    INPUT_PRICE_PER_MILLION_TOKENS = 0.05
    OUTPUT_PRICE_PER_MILLION_TOKENS = 0.08

    def calculate_cost(self, tokens_used: dict, model: str = "llama3-8b-8192") -> float:
        prompt_tokens = tokens_used.get("prompt_tokens", 0)
        completion_tokens = tokens_used.get("completion_tokens", 0)

        # Get model-specific pricing or use defaults
        if model in self.MODEL_PRICING:
            input_price = self.MODEL_PRICING[model]["input"]
            output_price = self.MODEL_PRICING[model]["output"]
        else:
            input_price = self.INPUT_PRICE_PER_MILLION_TOKENS
            output_price = self.OUTPUT_PRICE_PER_MILLION_TOKENS

        input_cost = (prompt_tokens / 1_000_000) * input_price
        output_cost = (completion_tokens / 1_000_000) * output_price

        return input_cost + output_cost