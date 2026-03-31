export function Input({
  label,
  error,
  type = 'text',
  ...props
}) {
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label className="text-sm font-medium text-dark-200">
          {label}
        </label>
      )}
      <input
        type={type}
        className={`px-4 py-2 bg-dark-800 border rounded-lg text-dark-100 placeholder-dark-500 focus:outline-none transition-colors ${
          error
            ? 'border-red-500 focus:border-red-600'
            : 'border-dark-700 focus:border-primary-500'
        }`}
        {...props}
      />
      {error && (
        <span className="text-sm text-red-400">{error}</span>
      )}
    </div>
  )
}
