import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuthStore } from '../context/authStore'
import { Button, Input, Card } from '../components'
import { User, Mail, Lock, Briefcase } from 'lucide-react'

export function RegisterPage() {
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [professionalTitle, setProfessionalTitle] = useState('')
  const [password, setPassword] = useState('')
  const [passwordConfirmation, setPasswordConfirmation] = useState('')
  const [errors, setErrors] = useState({})
  const [isLoading, setIsLoading] = useState(false)
  const { register } = useAuthStore()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrors({})
    setIsLoading(true)

    if (password !== passwordConfirmation) {
      setErrors({ password: ['Las contraseñas no coinciden'] })
      setIsLoading(false)
      return
    }

    try {
      await register(name, email, password, passwordConfirmation, professionalTitle)
      navigate('/dashboard')
    } catch (error) {
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors)
      } else if (error.response?.data?.message) {
        setErrors({ general: error.response.data.message })
      } else {
        setErrors({ general: 'Error al registrarse' })
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-dark-900 flex items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-primary-500">Portfolio</h1>
            <p className="text-dark-400 mt-2">Crea tu cuenta</p>
          </div>

          {errors.general && (
            <div className="bg-red-900/30 border border-red-700 text-red-200 px-4 py-3 rounded">
              {errors.general}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Nombre Completo"
              type="text"
              placeholder="Tu nombre"
              value={name}
              onChange={(e) => setName(e.target.value)}
              error={errors.name?.[0]}
            />

            <Input
              label="Email"
              type="email"
              placeholder="usuario@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={errors.email?.[0]}
            />

            <Input
              label="Título Profesional (Opcional)"
              type="text"
              placeholder="ej: Desarrollador Full Stack"
              value={professionalTitle}
              onChange={(e) => setProfessionalTitle(e.target.value)}
              error={errors.professional_title?.[0]}
            />

            <Input
              label="Contraseña"
              type="password"
              placeholder="Mínimo 8 caracteres"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={errors.password?.[0]}
            />

            <Input
              label="Confirmar Contraseña"
              type="password"
              placeholder="Confirma tu contraseña"
              value={passwordConfirmation}
              onChange={(e) => setPasswordConfirmation(e.target.value)}
              error={errors.password_confirmation?.[0]}
            />

            <Button
              type="submit"
              variant="primary"
              size="lg"
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? 'Registrando...' : 'Crear Cuenta'}
            </Button>
          </form>

          <div className="text-center text-dark-400">
            ¿Ya tienes cuenta?{' '}
            <Link to="/login" className="text-primary-400 hover:text-primary-300">
              Inicia sesión
            </Link>
          </div>
        </div>
      </Card>
    </div>
  )
}
