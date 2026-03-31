import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../context/authStore'
import { Menu, X, LogOut, User } from 'lucide-react'
import { useState } from 'react'

export function Navbar() {
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()
  const [isOpen, setIsOpen] = useState(false)

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  return (
    <nav className="bg-dark-800 border-b border-dark-700 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-3">
            <div className="text-2xl font-bold text-primary-500">Portfolio</div>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-6">
            {user && (
              <>
                <button
                  onClick={() => navigate('/dashboard')}
                  className="text-dark-200 hover:text-primary-400"
                >
                  Dashboard
                </button>
                <button
                  onClick={() => navigate('/profile')}
                  className="text-dark-200 hover:text-primary-400"
                >
                  Perfil
                </button>
                <div className="flex items-center gap-3 pl-6 border-l border-dark-700">
                  <User className="w-5 h-5 text-dark-400" />
                  <span className="text-dark-300">{user.name}</span>
                  <button
                    onClick={handleLogout}
                    className="text-red-400 hover:text-red-300 flex items-center gap-2"
                  >
                    <LogOut className="w-5 h-5" />
                    Salir
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {isOpen && user && (
          <div className="md:hidden pb-4 space-y-3">
            <button
              onClick={() => {
                navigate('/dashboard')
                setIsOpen(false)
              }}
              className="block w-full text-left px-4 py-2 hover:bg-dark-700 rounded"
            >
              Dashboard
            </button>
            <button
              onClick={() => {
                navigate('/profile')
                setIsOpen(false)
              }}
              className="block w-full text-left px-4 py-2 hover:bg-dark-700 rounded"
            >
              Perfil
            </button>
            <button
              onClick={handleLogout}
              className="block w-full text-left px-4 py-2 text-red-400 hover:bg-dark-700 rounded"
            >
              Salir
            </button>
          </div>
        )}
      </div>
    </nav>
  )
}
