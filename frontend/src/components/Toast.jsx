import { AlertCircle, CheckCircle, AlertTriangle, Info, X } from 'lucide-react'
import { useEffect } from 'react'

export function Toast({ message, type = 'info', onClose, duration = 3000 }) {
  useEffect(() => {
    const timer = setTimeout(onClose, duration)
    return () => clearTimeout(timer)
  }, [onClose, duration])

  const bgColor = {
    success: 'bg-green-900 border-green-700',
    error: 'bg-red-900 border-red-700',
    warning: 'bg-yellow-900 border-yellow-700',
    info: 'bg-blue-900 border-blue-700',
  }[type]

  const textColor = {
    success: 'text-green-100',
    error: 'text-red-100',
    warning: 'text-yellow-100',
    info: 'text-blue-100',
  }[type]

  const Icon = {
    success: CheckCircle,
    error: AlertCircle,
    warning: AlertTriangle,
    info: Info,
  }[type]

  return (
    <div className={`fixed top-4 right-4 ${bgColor} border rounded-lg shadow-lg p-4 flex items-center gap-3 max-w-md`}>
      <Icon className={`w-5 h-5 ${textColor}`} />
      <span className={textColor}>{message}</span>
      <button
        onClick={onClose}
        className="ml-auto"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  )
}
