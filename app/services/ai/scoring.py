
from typing import List, Dict, Any
import re

class ScoringService:
    def __init__(self):
        # Enhanced buying signals with weights based on analysis
        self.buying_signal_weights = {
            # High-impact signals (discovered from analysis)
            "budget allocated": 25,
            "budget mentioned": 25,
            "timeline pressure": 20,
            "urgent need": 20,
            "asap": 20,
            "replace current system": 18,
            "losing money": 22,
            "pain points": 15,
            "current vendor": 15,
            
            # Medium-impact signals
            "timeline defined": 12,
            "short timeline": 12,
            "interest in product": 10,
            "interest in learning more": 8,
            "good fit": 10,
            "team size mentioned": 8,
            "company size": 8,
            "implementation": 10,
            "demo": 8,
            "proposal": 8,
            
            # Specific budget indicators
            "10k": 20, "$10k": 20, "10,000": 20,
            "50k": 25, "$50k": 25, "50,000": 25,
            "5k": 15, "$5k": 15, "5,000": 15,
            "budget": 15,
            
            # Timeline indicators
            "2 months": 15,
            "q1": 12, "q2": 12, "q3": 12, "q4": 12,
            "next year": 10,
            "months": 8,
            "weeks": 12,
        }
        
        # Risk factors with negative weights
        self.risk_factor_weights = {
            # High-risk factors
            "no budget": -25,
            "no specific budget": -20,
            "unknown budget": -15,
            "no timeline": -20,
            "maybe later": -25,
            "just browsing": -30,
            "might be interested": -20,
            
            # Medium-risk factors
            "limited details": -10,
            "limited crm requirement details": -10,
            "complexity": -8,
            "small startup": -5,
            "5 employees": -8,
            "startup": -5,
            "not specified": -15,
            
            # Low-risk factors
            "vendor dissatisfaction": -3,  # Actually could be positive
            "financial loss": -5,
        }
    
    def calculate_score(self, validated_data: Dict[str, Any]) -> int:
        """
        Enhanced scoring based on AI insights and analysis patterns
        """
        # Start with AI confidence as base (scaled up)
        base_score = int(validated_data.get("confidence", 0.5) * 70)
        
        # Add AI score influence (scaled down to prevent dominance)
        ai_score = validated_data.get("score", 50)
        ai_influence = int(ai_score * 0.3)  # 30% influence from AI score
        base_score += ai_influence
        
        # Process buying signals with fuzzy matching
        buying_signals = validated_data.get("buying_signals", [])
        risk_factors = validated_data.get("risk_factors", [])
        
        # Enhanced signal processing
        signal_score = self._calculate_signal_score(buying_signals)
        risk_score = self._calculate_risk_score(risk_factors)
        
        # Combine all factors
        total_score = base_score + signal_score + risk_score
        
        # Apply bonuses for strong combinations
        total_score += self._calculate_combination_bonuses(buying_signals, risk_factors)
        
        # Ensure score is within 0-100 range
        return max(0, min(100, total_score))
    
    def _calculate_signal_score(self, buying_signals: List[str]) -> int:
        """Calculate score from buying signals with fuzzy matching"""
        score = 0
        
        # Convert signals to lowercase for matching
        signals_text = " ".join(buying_signals).lower()
        
        for signal_key, weight in self.buying_signal_weights.items():
            # Fuzzy matching for signal detection
            if self._fuzzy_match(signal_key, signals_text):
                score += weight
        
        # Cap the signal bonus to prevent over-scoring
        return min(score, 40)
    
    def _calculate_risk_score(self, risk_factors: List[str]) -> int:
        """Calculate score from risk factors with fuzzy matching"""
        score = 0
        
        # Convert risks to lowercase for matching
        risks_text = " ".join(risk_factors).lower()
        
        for risk_key, weight in self.risk_factor_weights.items():
            if self._fuzzy_match(risk_key, risks_text):
                score += weight  # These are negative weights
        
        # Cap the risk penalty
        return max(score, -30)
    
    def _fuzzy_match(self, pattern: str, text: str) -> bool:
        """Fuzzy matching for signal/risk detection"""
        # Exact match
        if pattern in text:
            return True
        
        # Word boundary matching
        words = pattern.split()
        if len(words) == 1:
            return bool(re.search(r'\b' + re.escape(pattern) + r'\b', text))
        
        # Multi-word partial matching
        return all(word in text for word in words)
    
    def _calculate_combination_bonuses(self, buying_signals: List[str], risk_factors: List[str]) -> int:
        """Apply bonuses for powerful signal combinations"""
        signals_text = " ".join(buying_signals).lower()
        risks_text = " ".join(risk_factors).lower()
        combined_text = signals_text + " " + risks_text
        
        bonus = 0
        
        # Budget + Timeline combo
        has_budget = any(b in combined_text for b in ["budget", "$", "k/month", "allocated"])
        has_timeline = any(t in combined_text for t in ["timeline", "asap", "months", "weeks", "q1", "q2", "q3", "q4"])
        
        if has_budget and has_timeline:
            bonus += 15
        
        # Urgency + Pain combo
        has_urgency = any(u in combined_text for u in ["asap", "urgent", "pressure", "losing money"])
        has_pain = any(p in combined_text for p in ["pain", "terrible", "losing", "replace", "current vendor"])
        
        if has_urgency and has_pain:
            bonus += 12
        
        # Large budget bonus
        if any(large in combined_text for large in ["50k", "$50k", "50,000", "100k", "$100k"]):
            bonus += 10
        
        return bonus
    
    def assign_category(self, score: int) -> str:
        """Updated category thresholds based on analysis"""
        if score >= 70:
            return "Hot"
        elif score >= 45:
            return "Warm"
        else:
            return "Cold"
    
    def get_scoring_breakdown(self, validated_data: Dict[str, Any]) -> Dict[str, Any]:
        """Provide detailed scoring breakdown for transparency"""
        base_score = int(validated_data.get("confidence", 0.5) * 70)
        ai_influence = int(validated_data.get("score", 50) * 0.3)
        
        buying_signals = validated_data.get("buying_signals", [])
        risk_factors = validated_data.get("risk_factors", [])
        
        signal_score = self._calculate_signal_score(buying_signals)
        risk_score = self._calculate_risk_score(risk_factors)
        combo_bonus = self._calculate_combination_bonuses(buying_signals, risk_factors)
        
        total_score = max(0, min(100, base_score + ai_influence + signal_score + risk_score + combo_bonus))
        
        return {
            "base_confidence_score": base_score,
            "ai_influence_score": ai_influence,
            "buying_signals_score": signal_score,
            "risk_factors_score": risk_score,
            "combination_bonus": combo_bonus,
            "total_score": total_score,
            "category": self.assign_category(total_score),
            "breakdown": {
                "confidence_contribution": f"{(base_score/total_score*100):.1f}%" if total_score > 0 else "0%",
                "ai_contribution": f"{(ai_influence/total_score*100):.1f}%" if total_score > 0 else "0%",
                "signals_contribution": f"{(signal_score/total_score*100):.1f}%" if total_score > 0 else "0%",
                "risks_contribution": f"{(risk_score/total_score*100):.1f}%" if total_score > 0 else "0%",
            }
        }
