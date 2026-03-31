import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../context/authStore'
import { usePortfolioStore } from '../context/portfolioStore'
import { Navbar, Card, Button, LoadingSpinner, Input } from '../components'
import { Plus, FileText, Briefcase, Award, GraduationCap, Share2 } from 'lucide-react'

export function DashboardPage() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const {
    portfolios,
    projects,
    experiences,
    skills,
    education,
    loading,
    fetchPortfolios,
    fetchProjects,
    fetchExperiences,
    fetchSkills,
    fetchEducation,
    createPortfolio,
  } = usePortfolioStore()

  const [showNewPortfolio, setShowNewPortfolio] = useState(false)
  const [portfolioTitle, setPortfolioTitle] = useState('')
  const [isCreating, setIsCreating] = useState(false)

  useEffect(() => {
    if (user) {
      fetchPortfolios()
      fetchProjects()
      fetchExperiences()
      fetchSkills()
      fetchEducation()
    }
  }, [user])

  const handleCreatePortfolio = async (e) => {
    e.preventDefault()
    if (!portfolioTitle.trim()) return

    setIsCreating(true)
    try {
      await createPortfolio({
        title: portfolioTitle,
        description: 'Mi nuevo portafolio',
      })
      setPortfolioTitle('')
      setShowNewPortfolio(false)
    } catch (error) {
      console.error('Error creating portfolio:', error)
    } finally {
      setIsCreating(false)
    }
  }

  if (loading) return <LoadingSpinner />

  const stats = [
    { label: 'Portafolios', value: portfolios.length, icon: FileText },
    { label: 'Proyectos', value: projects.length, icon: Briefcase },
    { label: 'Experiencias', value: experiences.length, icon: Award },
    { label: 'Habilidades', value: skills.length, icon: Award },
    { label: 'Educación', value: education.length, icon: GraduationCap },
  ]

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-dark-900 p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-white mb-2">
              Bienvenido, {user?.name}!
            </h1>
            <p className="text-dark-400">Gestiona tu portafolio digital aquí</p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
            {stats.map((stat, index) => {
              const Icon = stat.icon
              return (
                <Card key={index} className="text-center">
                  <Icon className="w-8 h-8 text-primary-500 mx-auto mb-3" />
                  <div className="text-3xl font-bold text-white">{stat.value}</div>
                  <div className="text-dark-400 text-sm">{stat.label}</div>
                </Card>
              )
            })}
          </div>

          {/* Portafolios Section */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-white">Mis Portafolios</h2>
              <Button
                variant="primary"
                onClick={() => setShowNewPortfolio(true)}
                className="flex items-center gap-2"
              >
                <Plus className="w-5 h-5" />
                Nuevo Portafolio
              </Button>
            </div>

            {showNewPortfolio && (
              <Card className="mb-6">
                <form onSubmit={handleCreatePortfolio} className="space-y-4">
                  <Input
                    label="Título del Portafolio"
                    placeholder="Mi primer portafolio"
                    value={portfolioTitle}
                    onChange={(e) => setPortfolioTitle(e.target.value)}
                  />
                  <div className="flex gap-3">
                    <Button
                      type="submit"
                      variant="primary"
                      disabled={isCreating}
                    >
                      {isCreating ? 'Creando...' : 'Crear'}
                    </Button>
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => setShowNewPortfolio(false)}
                    >
                      Cancelar
                    </Button>
                  </div>
                </form>
              </Card>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {portfolios.map((portfolio) => (
                <Card
                  key={portfolio.id}
                  className="cursor-pointer hover:bg-dark-700 transition-colors"
                  onClick={() => navigate(`/portfolio/${portfolio.id}`)}
                >
                  <h3 className="text-lg font-semibold text-white mb-2">
                    {portfolio.title}
                  </h3>
                  <p className="text-dark-400 text-sm mb-4">
                    {portfolio.description || 'Sin descripción'}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className={`text-xs px-2 py-1 rounded ${
                      portfolio.is_published
                        ? 'bg-green-900/30 text-green-300'
                        : 'bg-yellow-900/30 text-yellow-300'
                    }`}>
                      {portfolio.is_published ? 'Publicado' : 'Borrador'}
                    </span>
                    <Button variant="outline" size="sm">
                      <Share2 className="w-4 h-4" />
                    </Button>
                  </div>
                </Card>
              ))}
            </div>

            {portfolios.length === 0 && !showNewPortfolio && (
              <Card className="text-center py-12">
                <p className="text-dark-400 mb-4">No tienes portafolios aún</p>
                <Button
                  variant="primary"
                  onClick={() => setShowNewPortfolio(true)}
                >
                  Crear tu primer portafolio
                </Button>
              </Card>
            )}
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <h3 className="text-lg font-semibold text-white mb-3">Acciones Rápidas</h3>
              <div className="space-y-2">
                <Button
                  variant="secondary"
                  className="w-full text-left justify-start"
                  onClick={() => navigate('/profile')}
                >
                  Editar Perfil
                </Button>
                <Button
                  variant="secondary"
                  className="w-full text-left justify-start"
                  onClick={() => navigate('/projects')}
                >
                  Gestionar Proyectos
                </Button>
                <Button
                  variant="secondary"
                  className="w-full text-left justify-start"
                  onClick={() => navigate('/experiences')}
                >
                  Gestionar Experiencias
                </Button>
              </div>
            </Card>

            <Card>
              <h3 className="text-lg font-semibold text-white mb-3">Información</h3>
              <p className="text-dark-400 text-sm">
                Aquí puedes crear y gestionar tus portafolios digitales, agregar proyectos,
                experiencias, habilidades y educación.
              </p>
            </Card>
          </div>
        </div>
      </div>
    </>
  )
}
