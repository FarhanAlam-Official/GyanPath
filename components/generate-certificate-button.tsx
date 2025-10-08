"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Award, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { toast } from "@/hooks/use-toast"

interface GenerateCertificateButtonProps {
  courseId: string
  isCompleted: boolean
}

export function GenerateCertificateButton({ courseId, isCompleted }: GenerateCertificateButtonProps) {
  const [isGenerating, setIsGenerating] = useState(false)
  const router = useRouter()

  const handleGenerate = async () => {
    if (!isCompleted) {
      toast({
        title: "Course not completed",
        description: "Complete all lessons and pass all quizzes to earn your certificate.",
        variant: "destructive",
      })
      return
    }

    setIsGenerating(true)
    try {
      const response = await fetch("/api/certificates/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseId }),
      })

      const data = await response.json()

      if (!response.ok) {
        if (data.certificate) {
          // Certificate already exists, redirect to it
          router.push(`/learner/certificates/${data.certificate.id}`)
          return
        }
        throw new Error(data.error || "Failed to generate certificate")
      }

      toast({
        title: "Certificate generated!",
        description: "Your certificate is ready to download.",
      })

      router.push(`/learner/certificates/${data.certificate.id}`)
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to generate certificate",
        variant: "destructive",
      })
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <Button
      onClick={handleGenerate}
      disabled={!isCompleted || isGenerating}
      className="bg-[#7752FE] hover:bg-[#190482]"
    >
      {isGenerating ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Generating...
        </>
      ) : (
        <>
          <Award className="mr-2 h-4 w-4" />
          {isCompleted ? "Get Certificate" : "Complete Course First"}
        </>
      )}
    </Button>
  )
}
