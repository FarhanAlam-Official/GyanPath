import { Badge } from "@/components/ui/badge"
import { Globe } from "lucide-react"

interface LanguageBadgeProps {
  languages: string[]
}

export function LanguageBadge({ languages }: LanguageBadgeProps) {
  if (!languages || languages.length === 0) return null

  return (
    <div className="flex flex-wrap gap-2">
      {languages.map((lang) => (
        <Badge
          key={lang}
          variant="outline"
          className="border-[#8E8FFA] text-[#190482] bg-[#C2D9FF]/30"
          aria-label={`Available in ${lang}`}
        >
          <Globe className="w-3 h-3" />
          <span>{lang}</span>
        </Badge>
      ))}
    </div>
  )
}

