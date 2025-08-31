import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Brain, 
  TrendingUp, 
  AlertTriangle, 
  Info, 
  ChevronDown, 
  ChevronRight,
  Target,
  Lightbulb,
  BarChart3
} from 'lucide-react'

const ConfidenceBar = ({ confidence, className = "" }) => {
  const percentage = Math.round(confidence * 100)
  
  const getConfidenceColor = (conf) => {
    if (conf >= 0.8) return 'bg-green-500'
    if (conf >= 0.6) return 'bg-yellow-500'  
    return 'bg-red-500'
  }
  
  const getConfidenceLabel = (conf) => {
    if (conf >= 0.9) return 'Very High'
    if (conf >= 0.8) return 'High'
    if (conf >= 0.6) return 'Medium'
    if (conf >= 0.4) return 'Low'
    return 'Very Low'
  }

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium text-muted-foreground">AI Confidence</span>
        <span className="font-semibold">
          {getConfidenceLabel(confidence)} ({percentage}%)
        </span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <motion.div 
          className={`h-2 rounded-full ${getConfidenceColor(confidence)}`}
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        />
      </div>
      <p className="text-xs text-muted-foreground">
        {confidence >= 0.8 
          ? "High confidence in AI assessment"
          : confidence >= 0.6
          ? "Moderate confidence - review recommended"  
          : "Low confidence - manual review strongly recommended"
        }
      </p>
    </div>
  )
}

const ScoreBreakdown = ({ aiScore, enhancedScore, confidence }) => {
  return (
    <div className="space-y-3">
      <h4 className="font-medium flex items-center gap-2">
        <BarChart3 className="h-4 w-4" />
        Scoring Breakdown
      </h4>
      
      <div className="space-y-2">
        <div className="flex items-center justify-between p-2 bg-blue-50 rounded-md">
          <div className="flex items-center gap-2">
            <Brain className="h-4 w-4 text-blue-600" />
            <span className="text-sm font-medium">AI Base Score</span>
          </div>
          <span className="font-semibold text-blue-700">{aiScore}%</span>
        </div>
        
        <div className="flex items-center justify-between p-2 bg-purple-50 rounded-md">
          <div className="flex items-center gap-2">
            <Target className="h-4 w-4 text-purple-600" />
            <span className="text-sm font-medium">Enhanced Score</span>
          </div>
          <span className="font-semibold text-purple-700">{enhancedScore}%</span>
        </div>
        
        {Math.abs(enhancedScore - aiScore) > 5 && (
          <div className="text-xs text-muted-foreground bg-gray-50 p-2 rounded-md">
            <strong>Enhancement:</strong> {enhancedScore > aiScore ? '+' : ''}{enhancedScore - aiScore} points
            {enhancedScore > aiScore 
              ? " (boosted by positive signals)"
              : " (reduced due to risk factors)"
            }
          </div>
        )}
      </div>
    </div>
  )
}

const BuyingSignals = ({ signals }) => {
  const [expanded, setExpanded] = useState(false)
  const displaySignals = expanded ? signals : signals?.slice(0, 3) || []
  
  if (!signals || signals.length === 0) {
    return (
      <div className="text-sm text-muted-foreground">
        No buying signals detected
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h4 className="font-medium text-green-700 flex items-center gap-2">
          <TrendingUp className="h-4 w-4" />
          Buying Signals ({signals.length})
        </h4>
        {signals.length > 3 && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-xs text-green-600 hover:text-green-700 flex items-center gap-1"
          >
            {expanded ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
            {expanded ? 'Show Less' : `Show All ${signals.length}`}
          </button>
        )}
      </div>
      
      <div className="flex flex-wrap gap-1">
        {displaySignals.map((signal, idx) => (
          <motion.span 
            key={idx}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: idx * 0.05 }}
            className="inline-block px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full font-medium"
          >
            {signal}
          </motion.span>
        ))}
      </div>
      
      <p className="text-xs text-green-600 bg-green-50 p-2 rounded-md">
        <strong>Impact:</strong> These positive indicators increase the lead's potential value
      </p>
    </div>
  )
}

const RiskFactors = ({ risks }) => {
  const [expanded, setExpanded] = useState(false)
  const displayRisks = expanded ? risks : risks?.slice(0, 2) || []
  
  if (!risks || risks.length === 0) {
    return (
      <div className="text-sm text-green-600 bg-green-50 p-2 rounded-md">
        ✅ No significant risk factors detected
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h4 className="font-medium text-orange-700 flex items-center gap-2">
          <AlertTriangle className="h-4 w-4" />
          Risk Factors ({risks.length})
        </h4>
        {risks.length > 2 && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-xs text-orange-600 hover:text-orange-700 flex items-center gap-1"
          >
            {expanded ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
            {expanded ? 'Show Less' : `Show All ${risks.length}`}
          </button>
        )}
      </div>
      
      <div className="flex flex-wrap gap-1">
        {displayRisks.map((risk, idx) => (
          <motion.span 
            key={idx}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: idx * 0.05 }}
            className="inline-block px-2 py-1 text-xs bg-orange-100 text-orange-800 rounded-full font-medium"
          >
            {risk}
          </motion.span>
        ))}
      </div>
      
      <p className="text-xs text-orange-600 bg-orange-50 p-2 rounded-md">
        <strong>Impact:</strong> These factors may reduce lead quality and conversion likelihood
      </p>
    </div>
  )
}

const ReasoningSection = ({ reasoning, confidence }) => {
  const [expanded, setExpanded] = useState(false)
  
  if (!reasoning) {
    return (
      <div className="text-sm text-muted-foreground">
        No AI reasoning available
      </div>
    )
  }

  const shortReasoning = reasoning.length > 120 ? reasoning.substring(0, 120) + '...' : reasoning
  const displayReasoning = expanded ? reasoning : shortReasoning

  return (
    <div className="space-y-2">
      <h4 className="font-medium flex items-center gap-2">
        <Lightbulb className="h-4 w-4" />
        AI Reasoning
      </h4>
      
      <div className="bg-blue-50 p-3 rounded-md">
        <p className="text-sm text-blue-800">
          {displayReasoning}
        </p>
        {reasoning.length > 120 && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="mt-2 text-xs text-blue-600 hover:text-blue-700 font-medium"
          >
            {expanded ? 'Show Less' : 'Read More'}
          </button>
        )}
      </div>
      
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Info className="h-3 w-3" />
        This explanation is generated by AI with {Math.round(confidence * 100)}% confidence
      </div>
    </div>
  )
}

const AIExplanation = ({ 
  lead, 
  className = "",
  compact = false,
  showConfidenceBar = true 
}) => {
  const [isExpanded, setIsExpanded] = useState(!compact)
  
  // Extract explainability data from lead
  const aiScore = lead.ai_score || lead.score
  const enhancedScore = lead.enhanced_score || lead.score
  const confidence = lead.intent_analysis?.confidence || 0.7
  const reasoning = lead.intent_analysis?.reasoning
  const buyingSignals = lead.buying_signals || []
  const riskFactors = lead.risk_factors || []

  if (compact) {
    return (
      <div className={`space-y-2 ${className}`}>
        {showConfidenceBar && (
          <ConfidenceBar confidence={confidence} />
        )}
        
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full flex items-center justify-between p-2 bg-blue-50 hover:bg-blue-100 rounded-md transition-colors"
        >
          <div className="flex items-center gap-2">
            <Brain className="h-4 w-4 text-blue-600" />
            <span className="text-sm font-medium">AI Explanation</span>
          </div>
          {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
        </button>
        
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="space-y-4 overflow-hidden"
            >
              <ScoreBreakdown 
                aiScore={aiScore}
                enhancedScore={enhancedScore}
                confidence={confidence}
              />
              
              <ReasoningSection reasoning={reasoning} confidence={confidence} />
              
              <BuyingSignals signals={buyingSignals} />
              
              <RiskFactors risks={riskFactors} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    )
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {showConfidenceBar && (
        <ConfidenceBar confidence={confidence} />
      )}
      
      <ScoreBreakdown 
        aiScore={aiScore}
        enhancedScore={enhancedScore}
        confidence={confidence}
      />
      
      <ReasoningSection reasoning={reasoning} confidence={confidence} />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <BuyingSignals signals={buyingSignals} />
        <RiskFactors risks={riskFactors} />
      </div>
    </div>
  )
}

export default AIExplanation