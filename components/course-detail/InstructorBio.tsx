import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { User } from "lucide-react"
import Image from "next/image"

interface InstructorBioProps {
  instructor: {
    full_name: string
    avatar_url?: string
    email?: string
  }
}

export function InstructorBio({ instructor }: InstructorBioProps) {
  const initials = instructor.full_name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl text-[#190482]">Instructor</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col sm:flex-row gap-6 items-start">
          <Avatar className="w-20 h-20 border-2 border-[#C2D9FF]">
            {instructor.avatar_url ? (
              <AvatarImage src={instructor.avatar_url} alt={instructor.full_name} />
            ) : null}
            <AvatarFallback className="bg-[#C2D9FF] text-[#190482] text-xl font-semibold">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 space-y-2">
            <h3 className="text-xl font-semibold text-[#190482]">{instructor.full_name}</h3>
            {instructor.email && (
              <p className="text-sm text-muted-foreground">{instructor.email}</p>
            )}
            <p className="text-sm text-muted-foreground">
              Experienced instructor dedicated to helping students achieve their learning goals.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

