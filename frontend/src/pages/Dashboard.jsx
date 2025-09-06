import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Search, Filter, ChevronDown, Star, Clock, Snowflake, TrendingUp, Users, Target, Award, Trash2, MoreVertical, CheckCircle, ThermometerSun, Activity, Mail, UserPlus, XCircle } from 'lucide-react'
import { leads } from '../services/api'
import { toast } from 'react-hot-toast'
import AIExplanation from '../components/AIExplanation'
import LeadDetailsModal from '../components/LeadDetailsModal'

// Mock data for demonstration
const mockLeads = [
  {
    id: 1,
    name: 'John Smith',
    email: 'john.smith@techcorp.com',
    company: 'TechCorp',
    message: 'Looking for a custom CRM solution with AI integration. We have a budget of $50,000 and need to implement this ASAP as our current system is failing.',
    score: 85,
    ai_score: 82,
    enhanced_score: 85,
    category: 'hot',
    status: 'qualified',
    source: 'website',
    createdAt: '2024-02-20T10:00:00Z',
    processed_at: '2024-02-20T10:05:00Z',
    intent_analysis: {
      confidence: 0.92,
      reasoning: "Strong buying signals with immediate need, clear budget authorization, and pain point identified. High urgency indicators suggest ready-to-purchase mindset."
    },
    buying_signals: [
      "Immediate need expressed", 
      "Budget mentioned ($50,000)", 
      "Current system failing", 
      "ASAP timeline",
      "Decision authority implied"
    ],
    risk_factors: [],
    next_actions: [
      "Schedule demo within 24 hours",
      "Prepare custom integration proposal",
      "Connect with technical decision maker"
    ]
  },
  {
    id: 2,
    name: 'Sarah Johnson',
    email: 'sarah@designhub.co',
    company: 'DesignHub',
    message: 'Need a website redesign with e-commerce functionality. Our current site is outdated and we are looking to modernize it.',
    score: 65,
    ai_score: 68,
    enhanced_score: 65,
    category: 'warm',
    status: 'processing',
    source: 'referral',
    createdAt: '2024-02-19T15:30:00Z',
    processed_at: '2024-02-19T15:35:00Z',
    intent_analysis: {
      confidence: 0.75,
      reasoning: "Moderate buying signals with clear project scope but missing urgency and budget indicators. Good fit for services offered."
    },
    buying_signals: [
      "Specific project requirement",
      "Current pain point identified",
      "Modernization need"
    ],
    risk_factors: [
      "No budget mentioned",
      "No timeline specified"
    ],
    next_actions: [
      "Send portfolio and case studies",
      "Qualify budget and timeline",
      "Schedule consultation call"
    ]
  },
  {
    id: 3,
    name: 'Mike Brown',
    email: 'mike@startupx.io',
    company: 'StartupX',
    message: 'Exploring options for cloud migration. Just wanted to see what services you offer.',
    score: 45,
    ai_score: 45,
    enhanced_score: 45,
    category: 'cold',
    status: 'new',
    source: 'google_ads',
    createdAt: '2024-02-18T09:15:00Z',
    processed_at: '2024-02-18T09:20:00Z',
    intent_analysis: {
      confidence: 0.45,
      reasoning: "Low buying intent with vague inquiry. Appears to be in early research phase without immediate purchase intent or specific requirements."
    },
    buying_signals: [
      "Industry relevance"
    ],
    risk_factors: [
      "Vague inquiry",
      "Just exploring mindset",
      "No specific requirements",
      "No urgency indicated"
    ],
    next_actions: [
      "Send educational content about cloud migration",
      "Add to nurturing email sequence",
      "Follow up in 2 weeks with case study"
    ]
  },
]

const categoryColors = {
  hot: 'bg-red-500',
  warm: 'bg-orange-500',
  cold: 'bg-blue-500',
}

const categoryIcons = {
  hot: Star,
  warm: Clock,
  cold: Snowflake,
}

const Dashboard = () => {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [activeKpiFilter, setActiveKpiFilter] = useState(null)
  const [sortBy, setSortBy] = useState('score')
  const [leadsData, setLeadsData] = useState({ leads: [], total: 0, page: 1, per_page: 10, total_pages: 0 })
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [deletingLeadId, setDeletingLeadId] = useState(null)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [leadToDelete, setLeadToDelete] = useState(null)
  const [selectedLeads, setSelectedLeads] = useState(new Set())
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false)
  const [bulkDeleting, setBulkDeleting] = useState(false)
  const [selectedLead, setSelectedLead] = useState(null)
  const [showLeadDetails, setShowLeadDetails] = useState(false)
  const [showAdvancedFilter, setShowAdvancedFilter] = useState(false)
  const [advancedFilters, setAdvancedFilters] = useState({
    scoreRange: [0, 100],
    dateRange: { start: '', end: '' },
    status: [],
    source: []
  })

  // Define displayLeads early to avoid reference errors
  const displayLeads = leadsData.leads.length > 0 ? leadsData.leads : mockLeads

  // Fetch leads and stats
  useEffect(() => {
    fetchLeads()
    fetchStats()
  }, [currentPage, selectedCategory, searchQuery])

  const fetchLeads = async () => {
    try {
      setLoading(true)
      const params = {
        page: currentPage,
        per_page: 10,
        ...(selectedCategory !== 'all' && { category: selectedCategory }),
        ...(searchQuery && { search: searchQuery })
      }
      const data = await leads.getAll(params)
      setLeadsData(data)
    } catch (error) {
      console.error('Error fetching leads:', error)
      toast.error('Failed to load leads')
      // Fallback to mock data
      setLeadsData({
        leads: mockLeads,
        total: mockLeads.length,
        page: 1,
        per_page: 10,
        total_pages: 1
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      const statsData = await leads.getStats()
      setStats(statsData)
    } catch (error) {
      console.error('Error fetching stats:', error)
      // Fallback stats
      setStats({
        total_leads: mockLeads.length,
        hot_leads: mockLeads.filter(l => l.category === 'hot').length,
        warm_leads: mockLeads.filter(l => l.category === 'warm').length,
        cold_leads: mockLeads.filter(l => l.category === 'cold').length,
        avg_score: 65,
        processing_leads: 0,
        qualified_leads: mockLeads.length
      })
    }
  }

  const handleDeleteLead = (lead) => {
    setLeadToDelete(lead)
    setShowDeleteModal(true)
  }

  const confirmDelete = async () => {
    if (!leadToDelete) return

    try {
      setDeletingLeadId(leadToDelete.id)
      await leads.delete(leadToDelete.id)
      toast.success(`Lead "${leadToDelete.name}" deleted successfully`)
      
      // Refresh leads and stats
      await fetchLeads()
      await fetchStats()
      
      // Close modal
      setShowDeleteModal(false)
      setLeadToDelete(null)
    } catch (error) {
      console.error('Error deleting lead:', error)
      toast.error('Failed to delete lead')
    } finally {
      setDeletingLeadId(null)
    }
  }

  const cancelDelete = () => {
    setShowDeleteModal(false)
    setLeadToDelete(null)
  }

  // Bulk selection functions
  const toggleSelectLead = (leadId) => {
    const newSelected = new Set(selectedLeads)
    if (newSelected.has(leadId)) {
      newSelected.delete(leadId)
    } else {
      newSelected.add(leadId)
    }
    setSelectedLeads(newSelected)
  }

  const toggleSelectAll = () => {
    if (selectedLeads.size === displayLeads.length) {
      setSelectedLeads(new Set())
    } else {
      setSelectedLeads(new Set(displayLeads.map(lead => lead.id)))
    }
  }

  const handleBulkDelete = () => {
    if (selectedLeads.size > 0) {
      setShowBulkDeleteModal(true)
    }
  }

  const confirmBulkDelete = async () => {
    if (selectedLeads.size === 0) return

    try {
      setBulkDeleting(true)
      
      // Delete all selected leads
      await Promise.all(
        Array.from(selectedLeads).map(leadId => leads.delete(leadId))
      )
      
      toast.success(`${selectedLeads.size} lead(s) deleted successfully`)
      
      // Clear selection and refresh data
      setSelectedLeads(new Set())
      await fetchLeads()
      await fetchStats()
      
      setShowBulkDeleteModal(false)
    } catch (error) {
      console.error('Error deleting leads:', error)
      toast.error('Failed to delete some leads')
    } finally {
      setBulkDeleting(false)
    }
  }

  const cancelBulkDelete = () => {
    setShowBulkDeleteModal(false)
  }

  const handleLeadClick = (lead) => {
    setSelectedLead(lead)
    setShowLeadDetails(true)
  }

  const closeLeadDetails = () => {
    setShowLeadDetails(false)
    setSelectedLead(null)
  }

  if (loading && !displayLeads.length) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Interactive KPIs */}
      {stats && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              setActiveKpiFilter(activeKpiFilter === 'total' ? null : 'total')
              setSelectedCategory('all')
            }}
            className={`rounded-lg border p-6 text-left transition-all duration-200 hover:shadow-lg ${
              activeKpiFilter === 'total' 
                ? 'border-blue-500 bg-blue-50 shadow-md' 
                : 'bg-card hover:border-blue-200'
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Leads</p>
                <div className="flex items-center gap-2">
                  <p className="text-3xl font-bold">{stats.total_leads}</p>
                  <Activity className="h-4 w-4 text-blue-500" />
                </div>
              </div>
              <Users className="h-10 w-10 text-blue-500" />
            </div>
          </motion.button>
          
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              setActiveKpiFilter(activeKpiFilter === 'hot' ? null : 'hot')
              setSelectedCategory(activeKpiFilter === 'hot' ? 'all' : 'hot')
            }}
            className={`rounded-lg border p-6 text-left transition-all duration-200 hover:shadow-lg ${
              activeKpiFilter === 'hot' 
                ? 'border-red-500 bg-red-50 shadow-md' 
                : 'bg-card hover:border-red-200'
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Hot Leads</p>
                <div className="flex items-center gap-2">
                  <p className="text-3xl font-bold text-red-600">{stats.hot_leads}</p>
                  <ThermometerSun className="h-4 w-4 text-red-500" />
                </div>
              </div>
              <Star className="h-10 w-10 text-red-500" />
            </div>
          </motion.button>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="rounded-lg border bg-card p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Average Lead Score</p>
                <div className="flex items-center gap-3">
                  <p className="text-3xl font-bold text-green-600">{Math.round(stats.avg_enhanced_score || stats.avg_score)}%</p>
                  <div className="flex flex-col">
                    <div className="w-12 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-green-500 transition-all duration-500"
                        style={{ width: `${Math.round(stats.avg_enhanced_score || stats.avg_score)}%` }}
                      />
                    </div>
                    {stats.avg_enhanced_score && stats.avg_enhanced_score !== stats.avg_score && (
                      <div className="text-xs text-muted-foreground mt-1">
                        AI: {Math.round(stats.avg_score)}%
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <Target className="h-10 w-10 text-green-500" />
            </div>
          </motion.div>
          
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              setActiveKpiFilter(activeKpiFilter === 'qualified' ? null : 'qualified')
              // Filter by qualified status when implemented
            }}
            className={`rounded-lg border p-6 text-left transition-all duration-200 hover:shadow-lg ${
              activeKpiFilter === 'qualified' 
                ? 'border-purple-500 bg-purple-50 shadow-md' 
                : 'bg-card hover:border-purple-200'
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Qualified</p>
                <div className="flex items-center gap-2">
                  <p className="text-3xl font-bold text-purple-600">{stats.qualified_leads}</p>
                  <CheckCircle className="h-4 w-4 text-purple-500" />
                </div>
              </div>
              <Award className="h-10 w-10 text-purple-500" />
            </div>
          </motion.button>
        </div>
      )}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Leads Dashboard</h1>
            {activeKpiFilter && (
              <p className="text-sm text-muted-foreground mt-1">
                Filtered by: <span className="font-medium capitalize">{activeKpiFilter === 'total' ? 'All leads' : activeKpiFilter + ' leads'}</span>
                <button 
                  onClick={() => {
                    setActiveKpiFilter(null)
                    setSelectedCategory('all')
                  }}
                  className="ml-2 text-primary hover:text-primary/80 underline"
                >
                  Clear filter
                </button>
              </p>
            )}
          </div>
          {selectedLeads.size > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                {selectedLeads.size} selected
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => toast.success('Bulk assign feature coming soon!')}
                  className="flex items-center gap-1 px-3 py-1.5 text-sm bg-green-100 text-green-700 rounded-md hover:bg-green-200 transition-colors"
                >
                  <UserPlus className="h-4 w-4" />
                  Assign
                </button>
                <button
                  onClick={() => toast.success('Bulk status update coming soon!')}
                  className="flex items-center gap-1 px-3 py-1.5 text-sm bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors"
                >
                  <CheckCircle className="h-4 w-4" />
                  Mark Qualified
                </button>
                <button
                  onClick={handleBulkDelete}
                  className="flex items-center gap-1 px-3 py-1.5 text-sm bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete
                </button>
              </div>
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          {displayLeads.length > 0 && (
            <div className="flex items-center gap-2 mr-2">
              <input
                type="checkbox"
                checked={selectedLeads.size === displayLeads.length && displayLeads.length > 0}
                onChange={toggleSelectAll}
                className="rounded border-gray-300"
              />
              <label className="text-sm text-muted-foreground">Select All</label>
            </div>
          )}
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search leads..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-md border border-input bg-background pl-8 pr-4 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            />
          </div>
          <div className="relative">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="appearance-none rounded-md border border-input bg-background pl-4 pr-8 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            >
              <option value="all">All Categories</option>
              <option value="hot">Hot</option>
              <option value="warm">Warm</option>
              <option value="cold">Cold</option>
            </select>
            <ChevronDown className="absolute right-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          </div>
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="appearance-none rounded-md border border-input bg-background pl-4 pr-8 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            >
              <option value="score">Sort by Score</option>
              <option value="date">Sort by Date</option>
            </select>
            <ChevronDown className="absolute right-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          </div>
          <button
            onClick={() => setShowAdvancedFilter(true)}
            className="flex items-center gap-2 px-4 py-2 text-sm border border-input bg-background rounded-md hover:bg-muted transition-colors"
          >
            <Filter className="h-4 w-4" />
            Advanced Filter
          </button>
        </div>
      </div>

      <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {displayLeads.map((lead) => {
          const category = lead.category || 'cold'
          const CategoryIcon = categoryIcons[category] || categoryIcons.cold
          const enhancedScore = lead.enhanced_score || lead.score || 0
          const aiScore = lead.ai_score
          
          return (
            <motion.div
              key={lead.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ 
                scale: 1.02, 
                y: -4,
                transition: { duration: 0.2, ease: "easeOut" }
              }}
              onClick={() => handleLeadClick(lead)}
              className="group relative rounded-lg border bg-card p-6 hover:shadow-xl hover:border-primary/30 transition-all duration-200 cursor-pointer"
            >
              {/* Selection checkbox */}
              <div className="absolute top-3 left-3">
                <input
                  type="checkbox"
                  checked={selectedLeads.has(lead.id)}
                  onChange={() => toggleSelectLead(lead.id)}
                  className="rounded border-gray-300"
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
              <div className="flex items-start justify-between ml-8">
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">{lead.name}</h3>
                  <p className="text-sm text-muted-foreground font-medium">{lead.company || 'No company'}</p>
                </div>
                <div className="flex items-center gap-2">
                  <div
                    className={`flex items-center gap-1 rounded-full px-3 py-1 text-sm font-semibold text-white shadow-sm ${
                      categoryColors[category] || categoryColors.cold
                    } ${category === 'hot' ? 'animate-pulse' : ''}`}
                  >
                    <CategoryIcon className="h-4 w-4" />
                    {category.toUpperCase()}
                  </div>
                  
                  {/* Delete button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleDeleteLead(lead)
                    }}
                    disabled={deletingLeadId === lead.id}
                    className="opacity-70 group-hover:opacity-100 transition-opacity p-1 hover:bg-red-100 rounded-full text-red-500 hover:text-red-700 disabled:opacity-50"
                    title="Delete lead"
                  >
                    {deletingLeadId === lead.id ? (
                      <div className="animate-spin h-4 w-4 border-2 border-red-500 border-t-transparent rounded-full" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>
              <p className="mt-4 ml-8 text-sm text-muted-foreground line-clamp-2">
                {lead.message || lead.description || 'No description available'}
              </p>
              
              {/* Consolidated AI Score */}
              <div className="mt-4 ml-8">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="text-sm font-medium">AI Score:</div>
                    <div className="flex items-center gap-2">
                      <div className="text-lg font-bold text-primary">
                        {enhancedScore}%
                      </div>
                      <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className={`h-full transition-all duration-500 ${
                            enhancedScore >= 80 ? 'bg-green-500' : 
                            enhancedScore >= 50 ? 'bg-orange-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${enhancedScore}%` }}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {new Date(lead.created_at || lead.createdAt).toLocaleDateString()}
                  </div>
                </div>
                
                <AIExplanation 
                  lead={lead}
                  compact={true}
                  showConfidenceBar={true}
                  className="border border-blue-100 rounded-lg p-3 bg-blue-50/30"
                />
              </div>
              
              {/* Hover Action Buttons */}
              <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      window.location.href = `mailto:${lead.email}?subject=Following up on your inquiry`
                    }}
                    className="p-2 bg-blue-100 hover:bg-blue-200 text-blue-600 rounded-full transition-colors duration-200"
                    title="Contact Lead"
                  >
                    <Mail className="h-4 w-4" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      toast.success('Assign feature coming soon!')
                    }}
                    className="p-2 bg-green-100 hover:bg-green-200 text-green-600 rounded-full transition-colors duration-200"
                    title="Assign Lead"
                  >
                    <UserPlus className="h-4 w-4" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      toast.success('Disqualify feature coming soon!')
                    }}
                    className="p-2 bg-orange-100 hover:bg-orange-200 text-orange-600 rounded-full transition-colors duration-200"
                    title="Disqualify Lead"
                  >
                    <XCircle className="h-4 w-4" />
                  </button>
                </div>
              </div>
              
              {/* Status indicator - Outlined style */}
              {lead.status && (
                <div className="mt-2 ml-8">
                  <span className={`inline-flex items-center px-2 py-1 rounded-md border text-xs font-medium ${
                    lead.status === 'qualified' ? 'border-green-300 text-green-700 bg-green-50' :
                    lead.status === 'processing' ? 'border-yellow-300 text-yellow-700 bg-yellow-50' :
                    lead.status === 'failed' ? 'border-red-300 text-red-700 bg-red-50' :
                    lead.status === 'new' ? 'border-blue-300 text-blue-700 bg-blue-50' :
                    'border-gray-300 text-gray-700 bg-gray-50'
                  }`}>
                    {lead.status.toUpperCase()}
                  </span>
                </div>
              )}
              
              <div className="absolute inset-0 rounded-lg ring-2 ring-inset ring-primary/20 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
              <div className="absolute -inset-1 rounded-lg bg-gradient-to-r from-primary/10 to-secondary/10 opacity-0 group-hover:opacity-100 transition-opacity blur-sm pointer-events-none" />
            </motion.div>
          )
        })}
      </div>

      {displayLeads.length === 0 && !loading && (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-muted">
            <Search className="h-6 w-6 text-muted-foreground" />
          </div>
          <h3 className="mt-4 text-lg font-semibold">No leads found</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Try adjusting your search or filter criteria
          </p>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && leadToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg p-6 max-w-md mx-4 shadow-xl"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-red-100 rounded-full">
                <Trash2 className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">Delete Lead</h3>
                <p className="text-sm text-muted-foreground">This action cannot be undone</p>
              </div>
            </div>

            <p className="text-sm text-muted-foreground mb-6">
              Are you sure you want to delete the lead for{' '}
              <span className="font-semibold text-foreground">
                {leadToDelete.name}
              </span>
              {leadToDelete.company && (
                <>
                  {' '}from{' '}
                  <span className="font-semibold text-foreground">
                    {leadToDelete.company}
                  </span>
                </>
              )}
              ?
            </p>

            <div className="flex gap-3 justify-end">
              <button
                onClick={cancelDelete}
                disabled={deletingLeadId === leadToDelete.id}
                className="px-4 py-2 text-sm border border-input rounded-md hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                disabled={deletingLeadId === leadToDelete.id}
                className="px-4 py-2 text-sm bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {deletingLeadId === leadToDelete.id ? (
                  <>
                    <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="h-4 w-4" />
                    Delete Lead
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Bulk Delete Confirmation Modal */}
      {showBulkDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg p-6 max-w-md mx-4 shadow-xl"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-red-100 rounded-full">
                <Trash2 className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">Delete Multiple Leads</h3>
                <p className="text-sm text-muted-foreground">This action cannot be undone</p>
              </div>
            </div>

            <p className="text-sm text-muted-foreground mb-6">
              Are you sure you want to delete{' '}
              <span className="font-semibold text-foreground">
                {selectedLeads.size} lead{selectedLeads.size !== 1 ? 's' : ''}
              </span>
              ? This will permanently remove {selectedLeads.size === 1 ? 'this lead' : 'these leads'} from your database.
            </p>

            <div className="flex gap-3 justify-end">
              <button
                onClick={cancelBulkDelete}
                disabled={bulkDeleting}
                className="px-4 py-2 text-sm border border-input rounded-md hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                onClick={confirmBulkDelete}
                disabled={bulkDeleting}
                className="px-4 py-2 text-sm bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {bulkDeleting ? (
                  <>
                    <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                    Deleting {selectedLeads.size} lead{selectedLeads.size !== 1 ? 's' : ''}...
                  </>
                ) : (
                  <>
                    <Trash2 className="h-4 w-4" />
                    Delete {selectedLeads.size} Lead{selectedLeads.size !== 1 ? 's' : ''}
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Lead Details Modal */}
      <LeadDetailsModal 
        lead={selectedLead}
        isOpen={showLeadDetails}
        onClose={closeLeadDetails}
      />

      {/* Advanced Filter Modal */}
      {showAdvancedFilter && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg p-6 max-w-md mx-4 shadow-xl max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold">Advanced Filters</h3>
              <button
                onClick={() => setShowAdvancedFilter(false)}
                className="p-1 hover:bg-gray-100 rounded-full"
              >
                <XCircle className="h-5 w-5 text-gray-500" />
              </button>
            </div>

            <div className="space-y-6">
              {/* Score Range */}
              <div>
                <label className="block text-sm font-medium mb-2">Score Range</label>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={advancedFilters.scoreRange[0]}
                    onChange={(e) => setAdvancedFilters(prev => ({
                      ...prev,
                      scoreRange: [parseInt(e.target.value), prev.scoreRange[1]]
                    }))}
                    className="flex-1"
                  />
                  <span className="text-sm font-medium w-12">{advancedFilters.scoreRange[0]}%</span>
                </div>
                <div className="flex items-center gap-3 mt-2">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={advancedFilters.scoreRange[1]}
                    onChange={(e) => setAdvancedFilters(prev => ({
                      ...prev,
                      scoreRange: [prev.scoreRange[0], parseInt(e.target.value)]
                    }))}
                    className="flex-1"
                  />
                  <span className="text-sm font-medium w-12">{advancedFilters.scoreRange[1]}%</span>
                </div>
              </div>

              {/* Date Range */}
              <div>
                <label className="block text-sm font-medium mb-2">Date Range</label>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">From</label>
                    <input
                      type="date"
                      value={advancedFilters.dateRange.start}
                      onChange={(e) => setAdvancedFilters(prev => ({
                        ...prev,
                        dateRange: { ...prev.dateRange, start: e.target.value }
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">To</label>
                    <input
                      type="date"
                      value={advancedFilters.dateRange.end}
                      onChange={(e) => setAdvancedFilters(prev => ({
                        ...prev,
                        dateRange: { ...prev.dateRange, end: e.target.value }
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Status Filter */}
              <div>
                <label className="block text-sm font-medium mb-2">Status</label>
                <div className="space-y-2">
                  {['new', 'processing', 'qualified', 'failed'].map(status => (
                    <label key={status} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={advancedFilters.status.includes(status)}
                        onChange={(e) => {
                          setAdvancedFilters(prev => ({
                            ...prev,
                            status: e.target.checked
                              ? [...prev.status, status]
                              : prev.status.filter(s => s !== status)
                          }))
                        }}
                        className="mr-2"
                      />
                      <span className="text-sm capitalize">{status}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Source Filter */}
              <div>
                <label className="block text-sm font-medium mb-2">Source</label>
                <div className="space-y-2">
                  {['website', 'referral', 'google_ads', 'social_media'].map(source => (
                    <label key={source} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={advancedFilters.source.includes(source)}
                        onChange={(e) => {
                          setAdvancedFilters(prev => ({
                            ...prev,
                            source: e.target.checked
                              ? [...prev.source, source]
                              : prev.source.filter(s => s !== source)
                          }))
                        }}
                        className="mr-2"
                      />
                      <span className="text-sm capitalize">{source.replace('_', ' ')}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-3 justify-end mt-6">
              <button
                onClick={() => {
                  setAdvancedFilters({
                    scoreRange: [0, 100],
                    dateRange: { start: '', end: '' },
                    status: [],
                    source: []
                  })
                }}
                className="px-4 py-2 text-sm border border-input rounded-md hover:bg-muted"
              >
                Clear All
              </button>
              <button
                onClick={() => {
                  toast.success('Advanced filters applied!')
                  setShowAdvancedFilter(false)
                }}
                className="px-4 py-2 text-sm bg-primary text-white rounded-md hover:bg-primary/90"
              >
                Apply Filters
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}

export default Dashboard 