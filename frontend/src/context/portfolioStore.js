import { create } from 'zustand'
import {
  portfolioService,
  projectService,
  experienceService,
  skillService,
  educationService,
  socialLinkService,
} from '../services'

export const usePortfolioStore = create((set, get) => ({
  portfolios: [],
  projects: [],
  experiences: [],
  skills: [],
  education: [],
  socialLinks: [],
  technologies: [],
  loading: false,
  error: null,

  // Portfolios
  fetchPortfolios: async () => {
    set({ loading: true, error: null })
    try {
      const { data } = await portfolioService.getAll()
      set({ portfolios: data, loading: false })
    } catch (error) {
      set({ error: error.message, loading: false })
    }
  },

  createPortfolio: async (portfolioData) => {
    try {
      const { data } = await portfolioService.create(portfolioData)
      set((state) => ({ portfolios: [...state.portfolios, data.portfolio] }))
      return data
    } catch (error) {
      set({ error: error.message })
      throw error
    }
  },

  updatePortfolio: async (id, portfolioData) => {
    try {
      const { data } = await portfolioService.update(id, portfolioData)
      set((state) => ({
        portfolios: state.portfolios.map((p) => (p.id === id ? data.portfolio : p)),
      }))
      return data
    } catch (error) {
      set({ error: error.message })
      throw error
    }
  },

  deletePortfolio: async (id) => {
    try {
      await portfolioService.delete(id)
      set((state) => ({ portfolios: state.portfolios.filter((p) => p.id !== id) }))
    } catch (error) {
      set({ error: error.message })
      throw error
    }
  },

  // Projects
  fetchProjects: async () => {
    set({ loading: true, error: null })
    try {
      const { data } = await projectService.getAll()
      set({ projects: data, loading: false })
    } catch (error) {
      set({ error: error.message, loading: false })
    }
  },

  createProject: async (projectData) => {
    try {
      const { data } = await projectService.create(projectData)
      set((state) => ({ projects: [...state.projects, data.project] }))
      return data
    } catch (error) {
      set({ error: error.message })
      throw error
    }
  },

  updateProject: async (id, projectData) => {
    try {
      const { data } = await projectService.update(id, projectData)
      set((state) => ({
        projects: state.projects.map((p) => (p.id === id ? data.project : p)),
      }))
      return data
    } catch (error) {
      set({ error: error.message })
      throw error
    }
  },

  deleteProject: async (id) => {
    try {
      await projectService.delete(id)
      set((state) => ({ projects: state.projects.filter((p) => p.id !== id) }))
    } catch (error) {
      set({ error: error.message })
      throw error
    }
  },

  // Experiences
  fetchExperiences: async () => {
    set({ loading: true, error: null })
    try {
      const { data } = await experienceService.getAll()
      set({ experiences: data, loading: false })
    } catch (error) {
      set({ error: error.message, loading: false })
    }
  },

  createExperience: async (experienceData) => {
    try {
      const { data } = await experienceService.create(experienceData)
      set((state) => ({ experiences: [...state.experiences, data.experience] }))
      return data
    } catch (error) {
      set({ error: error.message })
      throw error
    }
  },

  updateExperience: async (id, experienceData) => {
    try {
      const { data } = await experienceService.update(id, experienceData)
      set((state) => ({
        experiences: state.experiences.map((e) => (e.id === id ? data.experience : e)),
      }))
      return data
    } catch (error) {
      set({ error: error.message })
      throw error
    }
  },

  deleteExperience: async (id) => {
    try {
      await experienceService.delete(id)
      set((state) => ({ experiences: state.experiences.filter((e) => e.id !== id) }))
    } catch (error) {
      set({ error: error.message })
      throw error
    }
  },

  // Skills
  fetchSkills: async () => {
    set({ loading: true, error: null })
    try {
      const { data } = await skillService.getAll()
      set({ skills: data, loading: false })
    } catch (error) {
      set({ error: error.message, loading: false })
    }
  },

  createSkill: async (skillData) => {
    try {
      const { data } = await skillService.create(skillData)
      set((state) => ({ skills: [...state.skills, data.skill] }))
      return data
    } catch (error) {
      set({ error: error.message })
      throw error
    }
  },

  updateSkill: async (id, skillData) => {
    try {
      const { data } = await skillService.update(id, skillData)
      set((state) => ({
        skills: state.skills.map((s) => (s.id === id ? data.skill : s)),
      }))
      return data
    } catch (error) {
      set({ error: error.message })
      throw error
    }
  },

  deleteSkill: async (id) => {
    try {
      await skillService.delete(id)
      set((state) => ({ skills: state.skills.filter((s) => s.id !== id) }))
    } catch (error) {
      set({ error: error.message })
      throw error
    }
  },

  // Education
  fetchEducation: async () => {
    set({ loading: true, error: null })
    try {
      const { data } = await educationService.getAll()
      set({ education: data, loading: false })
    } catch (error) {
      set({ error: error.message, loading: false })
    }
  },

  createEducation: async (educationData) => {
    try {
      const { data } = await educationService.create(educationData)
      set((state) => ({ education: [...state.education, data.education] }))
      return data
    } catch (error) {
      set({ error: error.message })
      throw error
    }
  },

  updateEducation: async (id, educationData) => {
    try {
      const { data } = await educationService.update(id, educationData)
      set((state) => ({
        education: state.education.map((e) => (e.id === id ? data.education : e)),
      }))
      return data
    } catch (error) {
      set({ error: error.message })
      throw error
    }
  },

  deleteEducation: async (id) => {
    try {
      await educationService.delete(id)
      set((state) => ({ education: state.education.filter((e) => e.id !== id) }))
    } catch (error) {
      set({ error: error.message })
      throw error
    }
  },

  // Social Links
  fetchSocialLinks: async () => {
    set({ loading: true, error: null })
    try {
      const { data } = await socialLinkService.getAll()
      set({ socialLinks: data, loading: false })
    } catch (error) {
      set({ error: error.message, loading: false })
    }
  },

  createSocialLink: async (socialLinkData) => {
    try {
      const { data } = await socialLinkService.create(socialLinkData)
      set((state) => ({ socialLinks: [...state.socialLinks, data.social_link] }))
      return data
    } catch (error) {
      set({ error: error.message })
      throw error
    }
  },

  updateSocialLink: async (id, socialLinkData) => {
    try {
      const { data } = await socialLinkService.update(id, socialLinkData)
      set((state) => ({
        socialLinks: state.socialLinks.map((s) => (s.id === id ? data.social_link : s)),
      }))
      return data
    } catch (error) {
      set({ error: error.message })
      throw error
    }
  },

  deleteSocialLink: async (id) => {
    try {
      await socialLinkService.delete(id)
      set((state) => ({ socialLinks: state.socialLinks.filter((s) => s.id !== id) }))
    } catch (error) {
      set({ error: error.message })
      throw error
    }
  },

  // Technologies
  fetchTechnologies: async () => {
    try {
      const { data } = await projectService.getTechnologies()
      set({ technologies: data })
    } catch (error) {
      set({ error: error.message })
    }
  },
}))
