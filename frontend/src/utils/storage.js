export const useLocalStorage = (key, initialValue) => {
  const stored = localStorage.getItem(key)
  return stored ? JSON.parse(stored) : initialValue
}

export const setLocalStorage = (key, value) => {
  localStorage.setItem(key, JSON.stringify(value))
}

export const removeLocalStorage = (key) => {
  localStorage.removeItem(key)
}
