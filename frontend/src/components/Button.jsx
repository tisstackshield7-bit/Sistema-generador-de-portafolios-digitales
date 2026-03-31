export function Button({
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  ...props
}) {
  const baseClasses = 'font-medium rounded-lg transition-colors'

  const variants = {
    primary: 'bg-primary-600 hover:bg-primary-700 text-white disabled:bg-primary-400',
    secondary: 'bg-dark-700 hover:bg-dark-600 text-dark-100 disabled:bg-dark-800',
    outline: 'border border-primary-500 text-primary-500 hover:bg-primary-500/10 disabled:opacity-50',
    danger: 'bg-red-600 hover:bg-red-700 text-white disabled:bg-red-400',
  }

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  }

  return (
    <button
      className={`${baseClasses} ${variants[variant]} ${sizes[size]} disabled:cursor-not-allowed`}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  )
}
