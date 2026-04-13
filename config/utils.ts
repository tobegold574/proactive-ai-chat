export function generateId() {
  return Math.random().toString(36).substring(2, 15)
}

export function formatCountdown(seconds: number) {
  if (seconds < 60) return `${seconds}秒后`
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return `${minutes}分${remainingSeconds}秒后`
}