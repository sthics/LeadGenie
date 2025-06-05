import { create } from 'zustand'
import { leads as leadsApi } from '@/services/api'

const useLeadsStore = create((set, get) => ({
  leads: [],
  selectedLead: null,
  isLoading: false,
  error: null,
  filters: {
    category: 'all',
    search: '',
    sortBy: 'score',
  },

  setFilters: (filters) => set({ filters: { ...get().filters, ...filters } }),

  fetchLeads: async () => {
    set({ isLoading: true, error: null })
    try {
      const { filters } = get()
      const response = await leadsApi.getAll(filters)
      set({ leads: response, isLoading: false })
    } catch (error) {
      set({
        error: error.response?.data?.message || 'Failed to fetch leads',
        isLoading: false,
      })
    }
  },

  fetchLeadById: async (id) => {
    set({ isLoading: true, error: null })
    try {
      const response = await leadsApi.getById(id)
      set({ selectedLead: response, isLoading: false })
      return response
    } catch (error) {
      set({
        error: error.response?.data?.message || 'Failed to fetch lead',
        isLoading: false,
      })
    }
  },

  createLead: async (data) => {
    set({ isLoading: true, error: null })
    try {
      const response = await leadsApi.create(data)
      set((state) => ({
        leads: [response, ...state.leads],
        isLoading: false,
      }))
      return response
    } catch (error) {
      set({
        error: error.response?.data?.message || 'Failed to create lead',
        isLoading: false,
      })
    }
  },

  updateLead: async (id, data) => {
    set({ isLoading: true, error: null })
    try {
      const response = await leadsApi.update(id, data)
      set((state) => ({
        leads: state.leads.map((lead) =>
          lead.id === id ? response : lead
        ),
        selectedLead: response,
        isLoading: false,
      }))
      return response
    } catch (error) {
      set({
        error: error.response?.data?.message || 'Failed to update lead',
        isLoading: false,
      })
    }
  },

  deleteLead: async (id) => {
    set({ isLoading: true, error: null })
    try {
      await leadsApi.delete(id)
      set((state) => ({
        leads: state.leads.filter((lead) => lead.id !== id),
        selectedLead: state.selectedLead?.id === id ? null : state.selectedLead,
        isLoading: false,
      }))
    } catch (error) {
      set({
        error: error.response?.data?.message || 'Failed to delete lead',
        isLoading: false,
      })
    }
  },

  clearError: () => set({ error: null }),
  clearSelectedLead: () => set({ selectedLead: null }),
}))

export default useLeadsStore 