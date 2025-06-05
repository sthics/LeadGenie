import { useState } from 'react'
import { motion } from 'framer-motion'
import { Search, Filter, ChevronDown, Star, Clock, Snowflake } from 'lucide-react'

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

  const filteredLeads = mockLeads
    .filter((lead) => {
      const matchesSearch =
        lead.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lead.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lead.description.toLowerCase().includes(searchQuery.toLowerCase())

      const matchesCategory =
        selectedCategory === 'all' || lead.category === selectedCategory

      return matchesSearch && matchesCategory
    })
    .sort((a, b) => {
      if (sortBy === 'score') {
        return b.score - a.score
      }
      if (sortBy === 'date') {
        return new Date(b.createdAt) - new Date(a.createdAt)
      }
      return 0
    })

  return (
    <div className="space-y-6">
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
        {filteredLeads.map((lead) => {
          const CategoryIcon = categoryIcons[lead.category]
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
                  <p className="text-sm text-muted-foreground">{lead.company}</p>
                </div>
                <div
                  className={`flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium text-white ${
                    categoryColors[lead.category]
                  }`}
                >
                  <CategoryIcon className="h-3 w-3" />
                  {lead.category}
                </div>
              </div>
              <p className="mt-4 text-sm text-muted-foreground line-clamp-2">
                {lead.description}
              </p>
              <div className="mt-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="text-sm font-medium">Score:</div>
                  <div className="text-sm font-semibold text-primary">
                    {lead.score}%
                  </div>
                </div>
                <div className="text-xs text-muted-foreground">
                  {new Date(lead.createdAt).toLocaleDateString()}
                </div>
              </div>
              <div className="absolute inset-0 rounded-lg ring-1 ring-inset ring-black/10 opacity-0 group-hover:opacity-100 transition-opacity" />
            </motion.div>
          )
        })}
      </div>

      {filteredLeads.length === 0 && (
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