import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { WifiOff } from "lucide-react"

export default function OfflinePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#190482] via-[#7752FE] to-[#8E8FFA] flex items-center justify-center p-6">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="w-20 h-20 bg-[#C2D9FF] rounded-full flex items-center justify-center mx-auto mb-4">
            <WifiOff className="w-10 h-10 text-[#190482]" />
          </div>
          <CardTitle className="text-2xl text-[#190482]">You&apos;re Offline</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-muted-foreground">
            It looks like you&apos;ve lost your internet connection. Don&apos;t worry, you can still access downloaded
            content.
          </p>
          <p className="text-sm text-muted-foreground">
            Your progress will be saved and synced automatically when you&apos;re back online.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
