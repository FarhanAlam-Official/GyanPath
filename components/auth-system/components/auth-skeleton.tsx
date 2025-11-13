export function AuthSkeleton() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 via-white to-cyan-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-700 p-4">
      <div className="w-full max-w-lg shadow-2xl border-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-2xl p-6">
        <div className="space-y-1 pb-6">
          <div className="h-8 w-3/4 mx-auto bg-gray-300 dark:bg-gray-700 animate-pulse rounded"></div>
          <div className="h-4 w-1/2 mx-auto bg-gray-300 dark:bg-gray-700 animate-pulse rounded mt-2"></div>
        </div>
        <div className="pt-0">
          <div className="space-y-6">
            {/* Email Field */}
            <div className="space-y-2">
              <div className="h-4 w-1/4 bg-gray-300 dark:bg-gray-700 animate-pulse rounded"></div>
              <div className="h-10 w-full bg-gray-300 dark:bg-gray-700 animate-pulse rounded"></div>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="h-4 w-1/4 bg-gray-300 dark:bg-gray-700 animate-pulse rounded"></div>
                <div className="h-4 w-1/4 bg-gray-300 dark:bg-gray-700 animate-pulse rounded"></div>
              </div>
              <div className="h-10 w-full bg-gray-300 dark:bg-gray-700 animate-pulse rounded"></div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center space-x-2">
              <div className="h-4 w-4 bg-gray-300 dark:bg-gray-700 animate-pulse rounded"></div>
              <div className="h-4 w-1/4 bg-gray-300 dark:bg-gray-700 animate-pulse rounded"></div>
            </div>

            {/* Submit Button */}
            <div className="h-11 w-full bg-gray-300 dark:bg-gray-700 animate-pulse rounded"></div>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full h-px bg-gray-300 dark:bg-gray-700"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <div className="h-4 w-1/4 bg-white dark:bg-slate-900 px-2 bg-gray-300 dark:bg-gray-700 animate-pulse rounded"></div>
              </div>
            </div>

            {/* Social Login Buttons */}
            <div className="grid grid-cols-2 gap-3">
              <div className="h-11 w-full bg-gray-300 dark:bg-gray-700 animate-pulse rounded"></div>
              <div className="h-11 w-full bg-gray-300 dark:bg-gray-700 animate-pulse rounded"></div>
            </div>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full h-px bg-gray-300 dark:bg-gray-700"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <div className="h-4 w-1/4 bg-white dark:bg-slate-900 px-2 bg-gray-300 dark:bg-gray-700 animate-pulse rounded"></div>
              </div>
            </div>

            {/* Sign Up Link */}
            <div className="text-center">
              <div className="h-4 w-1/2 mx-auto bg-gray-300 dark:bg-gray-700 animate-pulse rounded"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}