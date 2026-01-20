"use client"

import { useLoading } from "@/lib/loading-context"
import { useEffect, useState } from "react"

export function LoadingBar() {
  const { isLoading } = useLoading()
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (isLoading) {
      setVisible(true)
    } else {
      const timer = setTimeout(() => setVisible(false), 300)
      return () => clearTimeout(timer)
    }
  }, [isLoading])

  if (!visible) return null

  return (
    <div className="fixed top-0 left-0 right-0 z-50 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 animate-pulse">
      <div
        className={`h-full bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 transition-all duration-500 ${
          isLoading ? "w-3/4" : "w-full"
        }`}
        style={{
          animation: isLoading
            ? "loading-bar 1.5s ease-in-out infinite"
            : "loading-complete 0.3s ease-out forwards",
        }}
      />
      <style>{`
        @keyframes loading-bar {
          0% { transform: translateX(-100%); }
          50% { transform: translateX(0); }
          100% { transform: translateX(100%); }
        }
        @keyframes loading-complete {
          0% { width: 100%; }
          100% { width: 100%; opacity: 0; }
        }
      `}</style>
    </div>
  )
}

export function LoadingSpinner() {
  const { isLoading } = useLoading()

  if (!isLoading) return null

  return (
    <div className="fixed inset-0 z-40 bg-black/20 flex items-center justify-center backdrop-blur-sm">
      <div className="bg-white rounded-lg shadow-lg p-8 flex flex-col items-center gap-4">
        <div className="relative w-12 h-12">
          <div
            className="absolute inset-0 rounded-full border-4 border-gray-200"
            style={{
              borderTopColor: "#3b82f6",
              animation: "spin 1s linear infinite",
            }}
          />
        </div>
        <p className="text-gray-600 font-medium">Loading...</p>
        <style>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    </div>
  )
}

export function GlobalLoadingIndicator() {
  return (
    <>
      <LoadingBar />
      <LoadingSpinner />
    </>
  )
}
