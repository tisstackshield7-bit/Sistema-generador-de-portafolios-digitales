import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuthStore } from '../context/authStore'
import { Button, Input, Card } from '../components'
import { Mail, Lock } from 'lucide-react'

export function LoginPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState({})
  const [isLoading, setIsLoading] = useState(false)
  const { login } = useAuthStore()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrors({})
    setIsLoading(true)

    try {
      await login(email, password)
      navigate('/dashboard')
    } catch (error) {
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors)
      } else {
        setErrors({ general: 'Error al iniciar sesión' })
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
            <p className="text-dark-400 mt-2">Inicia sesión en tu cuenta</p>
          </div>

          {errors.general && (
            <div className="bg-red-900/30 border border-red-700 text-red-200 px-4 py-3 rounded">
              {errors.general}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email"
              type="email"
              placeholder="usuario@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={errors.email?.[0]}
              icon={Mail}
            />

            <Input
              label="Contraseña"
              type="password"
              placeholder="Tu contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={errors.password?.[0]}
              icon={Lock}
            />

            <Button
              type="submit"
              variant="primary"
              size="lg"
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
            </Button>
          </form>

          <div className="text-center text-dark-400">
            ¿No tienes cuenta?{' '}
            <Link to="/register" className="text-primary-400 hover:text-primary-300">
              Regístrate aquí
            </Link>
          </div>
        </div>
      </Card>
    </div>
  )
}
