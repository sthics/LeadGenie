import React from 'react'
import { motion } from 'framer-motion'
import { 
  X, 
  User, 
  Building, 
  Mail, 
  Calendar,
  MessageSquare,
  Brain,
  TrendingUp
} from 'lucide-react'
import AIExplanation from './AIExplanation'

const LeadDetailsModal = ({ lead, isOpen, onClose }) => {
  if (!isOpen || !lead) return null

  const categoryColors = {
    hot: 'bg-red-500',
    warm: 'bg-orange-500', 
    cold: 'bg-blue-500',
  }

  const categoryLabels = {
    hot: 'Hot Lead',
    warm: 'Warm Lead',
    cold: 'Cold Lead',
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-xl">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${categoryColors[lead.category]}`} />
              <span className="font-semibold text-lg">{categoryLabels[lead.category]}</span>
            </div>
            
            <div className="flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-700 rounded-full">
              <Brain className="h-4 w-4" />
              <span className="text-sm font-medium">
                {lead.enhanced_score || lead.score}% Score
              </span>
            </div>
          </div>
          
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Lead Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Contact Details */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg flex items-center gap-2">
                <User className="h-5 w-5" />
                Contact Information
              </h3>
              
              <div className="space-y-3 bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center gap-3">
                  <User className="h-4 w-4 text-gray-500" />
                  <div>
                    <span className="text-sm text-gray-500">Name</span>
                    <p className="font-medium">{lead.name}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-gray-500" />
                  <div>
                    <span className="text-sm text-gray-500">Email</span>
                    <p className="font-medium">{lead.email}</p>
                  </div>
                </div>
                
                {lead.company && (
                  <div className="flex items-center gap-3">
                    <Building className="h-4 w-4 text-gray-500" />
                    <div>
                      <span className="text-sm text-gray-500">Company</span>
                      <p className="font-medium">{lead.company}</p>
                    </div>
                  </div>
                )}
                
                <div className="flex items-center gap-3">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <div>
                    <span className="text-sm text-gray-500">Submitted</span>
                    <p className="font-medium">
                      {new Date(lead.created_at || lead.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long', 
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Lead Message */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Lead Message
              </h3>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm leading-relaxed">
                  {lead.message || lead.description || 'No message provided'}
                </p>
              </div>
            </div>
          </div>

          {/* AI Explanation Section */}
          <div className="border-t pt-6">
            <h3 className="font-semibold text-xl flex items-center gap-2 mb-6">
              <TrendingUp className="h-6 w-6 text-blue-600" />
              AI Analysis & Explanation
            </h3>
            
            <AIExplanation 
              lead={lead}
              compact={false}
              showConfidenceBar={true}
              className="bg-gradient-to-br from-blue-50 to-purple-50 p-6 rounded-lg border"
            />
          </div>

          {/* Recommended Actions */}
          {lead.next_actions && lead.next_actions.length > 0 && (
            <div className="border-t pt-6">
              <h3 className="font-semibold text-lg flex items-center gap-2 mb-4">
                <TrendingUp className="h-5 w-5" />
                Recommended Next Actions
              </h3>
              
              <div className="space-y-2">
                {lead.next_actions.map((action, idx) => (
                  <div key={idx} className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
                    <div className="w-2 h-2 rounded-full bg-green-500 mt-2 flex-shrink-0" />
                    <p className="text-sm text-green-800">{action}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Status and Metadata */}
          <div className="border-t pt-6">
            <h3 className="font-semibold text-lg mb-4">Lead Status & Metadata</h3>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {lead.status && (
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-xs text-gray-500 block">Status</span>
                  <span className={`text-sm font-medium capitalize ${
                    lead.status === 'qualified' ? 'text-green-600' :
                    lead.status === 'processing' ? 'text-yellow-600' :
                    lead.status === 'failed' ? 'text-red-600' :
                    'text-gray-600'
                  }`}>
                    {lead.status}
                  </span>
                </div>
              )}
              
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <span className="text-xs text-gray-500 block">Source</span>
                <span className="text-sm font-medium capitalize">
                  {lead.source || 'Web Form'}
                </span>
              </div>
              
              {lead.processed_at && (
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-xs text-gray-500 block">Processed</span>
                  <span className="text-sm font-medium">
                    {new Date(lead.processed_at).toLocaleDateString()}
                  </span>
                </div>
              )}
              
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <span className="text-xs text-gray-500 block">Category</span>
                <span className="text-sm font-medium capitalize">
                  {lead.category}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 rounded-b-xl">
          <div className="flex justify-between items-center">
            <div className="text-xs text-gray-500">
              Lead ID: {lead.id}
            </div>
            <div className="flex gap-2">
              <button
                onClick={onClose}
                className="px-4 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-100 transition-colors"
              >
                Close
              </button>
              <button
                className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Take Action
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default LeadDetailsModal