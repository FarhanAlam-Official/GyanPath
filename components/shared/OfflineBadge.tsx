import { Badge } from "@/components/ui/badge"
import { Download } from "lucide-react"

export function OfflineBadge() {
  return (
    <Badge
      variant="outline"
      className="border-[#7752FE] text-[#7752FE] bg-[#C2D9FF]/20"
      aria-label="Available for offline download"
    >
      <Download className="w-3 h-3" />
      <span>Offline Available</span>
    </Badge>
  )
}

