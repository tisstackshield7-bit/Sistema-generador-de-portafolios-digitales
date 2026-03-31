import apiClient from './api'

export const authService = {
  register: (data) => apiClient.post('/auth/register', data),
  login: (data) => apiClient.post('/auth/login', data),
  logout: () => apiClient.post('/auth/logout'),
  getCurrentUser: () => apiClient.get('/auth/user'),
}

export const userService = {
  getProfile: () => apiClient.get('/user'),
  updateProfile: (data) => apiClient.put('/user', data),
  changePassword: (data) => apiClient.put('/user/password', data),
  getPublicProfile: (id) => apiClient.get(`/users/${id}`),
}

export const portfolioService = {
  getAll: () => apiClient.get('/portfolios'),
  create: (data) => apiClient.post('/portfolios', data),
  get: (id) => apiClient.get(`/portfolios/${id}`),
  update: (id, data) => apiClient.put(`/portfolios/${id}`, data),
  delete: (id) => apiClient.delete(`/portfolios/${id}`),
  getPublic: (slug) => apiClient.get(`/portfolios/${slug}`),
}

export const experienceService = {
  getAll: () => apiClient.get('/experiences'),
  create: (data) => apiClient.post('/experiences', data),
  get: (id) => apiClient.get(`/experiences/${id}`),
  update: (id, data) => apiClient.put(`/experiences/${id}`, data),
  delete: (id) => apiClient.delete(`/experiences/${id}`),
}

export const projectService = {
  getAll: () => apiClient.get('/projects'),
  create: (data) => apiClient.post('/projects', data),
  get: (id) => apiClient.get(`/projects/${id}`),
  update: (id, data) => apiClient.put(`/projects/${id}`, data),
  delete: (id) => apiClient.delete(`/projects/${id}`),
  getTechnologies: () => apiClient.get('/projects-technologies'),
  getPublic: (userId) => apiClient.get(`/users/${userId}/projects`),
}

export const skillService = {
  getAll: () => apiClient.get('/skills'),
  create: (data) => apiClient.post('/skills', data),
  get: (id) => apiClient.get(`/skills/${id}`),
  update: (id, data) => apiClient.put(`/skills/${id}`, data),
  delete: (id) => apiClient.delete(`/skills/${id}`),
  getByCategory: () => apiClient.get('/skills/by-category'),
}

export const educationService = {
  getAll: () => apiClient.get('/education'),
  create: (data) => apiClient.post('/education', data),
  get: (id) => apiClient.get(`/education/${id}`),
  update: (id, data) => apiClient.put(`/education/${id}`, data),
  delete: (id) => apiClient.delete(`/education/${id}`),
}

export const socialLinkService = {
  getAll: () => apiClient.get('/social-links'),
  create: (data) => apiClient.post('/social-links', data),
  get: (id) => apiClient.get(`/social-links/${id}`),
  update: (id, data) => apiClient.put(`/social-links/${id}`, data),
  delete: (id) => apiClient.delete(`/social-links/${id}`),
  getPlatforms: () => apiClient.get('/social-links/platforms'),
}
