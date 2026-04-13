import Image from "next/image"

export function BrandIcon({
  size,
  className = "",
  priority = false,
}: {
  size: number
  className?: string
  priority?: boolean
}) {
  return (
    <Image
      src="/sparkle.png"
      alt="Proactive AI"
      width={size}
      height={size}
      className={`object-contain ${className}`}
      priority={priority}
    />
  )
}
