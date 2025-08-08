import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Search, Filter, ChevronDown, Star, Clock, Snowflake, TrendingUp, Users, Target, Award } from 'lucide-react'
import { leads } from '../services/api'
import { toast } from 'react-hot-toast'

// Mock data for demonstration
const mockLeads = [
  {
    id: 1,
    name: 'John Smith',
    company: 'TechCorp',
    description: 'Looking for a custom CRM solution with AI integration.',
    score: 85,
    category: 'hot',
    createdAt: '2024-02-20T10:00:00Z',
  },
  {
    id: 2,
    name: 'Sarah Johnson',
    company: 'DesignHub',
    description: 'Need a website redesign with e-commerce functionality.',
    score: 65,
    category: 'warm',
    createdAt: '2024-02-19T15:30:00Z',
  },
  {
    id: 3,
    name: 'Mike Brown',
    company: 'StartupX',
    description: 'Exploring options for cloud migration.',
    score: 45,
    category: 'cold',
    createdAt: '2024-02-18T09:15:00Z',
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
  const [sortBy, setSortBy] = useState('score')
  const [leadsData, setLeadsData] = useState({ leads: [], total: 0, page: 1, per_page: 10, total_pages: 0 })
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)

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

  const displayLeads = leadsData.leads.length > 0 ? leadsData.leads : mockLeads

  if (loading && !displayLeads.length) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      {stats && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-lg border bg-card p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Leads</p>
                <p className="text-2xl font-bold">{stats.total_leads}</p>
              </div>
              <Users className="h-8 w-8 text-blue-500" />
            </div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="rounded-lg border bg-card p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Hot Leads</p>
                <p className="text-2xl font-bold text-red-500">{stats.hot_leads}</p>
              </div>
              <Star className="h-8 w-8 text-red-500" />
            </div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="rounded-lg border bg-card p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg Score</p>
                <p className="text-2xl font-bold text-green-500">{Math.round(stats.avg_score)}%</p>
              </div>
              <Target className="h-8 w-8 text-green-500" />
            </div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="rounded-lg border bg-card p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Qualified</p>
                <p className="text-2xl font-bold text-purple-500">{stats.qualified_leads}</p>
              </div>
              <Award className="h-8 w-8 text-purple-500" />
            </div>
          </motion.div>
        </div>
      )}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Leads Dashboard</h1>
        <div className="flex items-center gap-2">
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
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {displayLeads.map((lead) => {
          const category = lead.category || 'cold'
          const CategoryIcon = categoryIcons[category]
          const score = lead.ai_score || lead.score || 0
          
          return (
            <motion.div
              key={lead.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="group relative rounded-lg border bg-card p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold">{lead.name}</h3>
                  <p className="text-sm text-muted-foreground">{lead.company || 'No company'}</p>
                </div>
                <div
                  className={`flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium text-white ${
                    categoryColors[category] || categoryColors.cold
                  }`}
                >
                  <CategoryIcon className="h-3 w-3" />
                  {category}
                </div>
              </div>
              <p className="mt-4 text-sm text-muted-foreground line-clamp-2">
                {lead.message || lead.description || 'No description available'}
              </p>
              <div className="mt-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="text-sm font-medium">Score:</div>
                  <div className="text-sm font-semibold text-primary">
                    {score}%
                  </div>
                </div>
                <div className="text-xs text-muted-foreground">
                  {new Date(lead.created_at || lead.createdAt).toLocaleDateString()}
                </div>
              </div>
              
              {/* Status indicator */}
              {lead.status && (
                <div className="mt-2">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    lead.status === 'qualified' ? 'bg-green-100 text-green-800' :
                    lead.status === 'processing' ? 'bg-yellow-100 text-yellow-800' :
                    lead.status === 'failed' ? 'bg-red-100 text-red-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {lead.status}
                  </span>
                </div>
              )}
              
              <div className="absolute inset-0 rounded-lg ring-1 ring-inset ring-black/10 opacity-0 group-hover:opacity-100 transition-opacity" />
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
    </div>
  )
}

export default Dashboard 