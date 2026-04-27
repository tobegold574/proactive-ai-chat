import Image from "next/image"

export function BrandIcon({
  size,
  className = "",
  priority = false,
  alt = "Proactive AI",
}: {
  size: number
  className?: string
  priority?: boolean
  alt?: string
}) {
  return (
    <Image
      src="/sparkle.png"
      alt={alt}
      width={size}
      height={size}
      className={`object-contain ${className}`}
      priority={priority}
    />
  )
}
