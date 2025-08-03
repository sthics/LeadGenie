class FallbackHandler:
    def rule_based_qualify(self, lead_data: dict) -> dict:
        """
        Pure rule-based qualification when AI fails
        """
        score = 50  # Base score
        signals = []
        risks = []

        if self._has_budget_mentioned(lead_data.get("message")):
            score += 20
            signals.append("Budget mentioned")

        if self._has_urgency_signals(lead_data.get("message")):
            score += 15
            signals.append("Urgency expressed")

        return {
            "score": min(100, score),
            "category": self._assign_category(score),
            "confidence": 0.7,  # Lower confidence for rule-based
            "reasoning": "Rule-based qualification due to AI service failure.",
            "buying_signals": signals,
            "risk_factors": risks,
            "next_actions": ["Manual review required"],
        }

    def _assign_category(self, score: int) -> str:
        if score >= 80:
            return "Hot"
        elif score >= 60:
            return "Warm"
        else:
            return "Cold"

    def _has_budget_mentioned(self, description: str) -> bool:
        if not description:
            return False
        budget_keywords = ["budget", "price", "cost", "pricing", "quote"]
        return any(keyword in description.lower() for keyword in budget_keywords)

    def _has_urgency_signals(self, description: str) -> bool:
        if not description:
            return False
        urgency_keywords = ["urgent", "asap", "immediately", "now", "deadline"]
        return any(keyword in description.lower() for keyword in urgency_keywords)