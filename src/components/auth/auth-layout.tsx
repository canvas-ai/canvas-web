import * as React from "react"
import { Card } from "@/components/ui/card"
import { Link } from "react-router-dom"
import { version } from "../../../package.json"

interface AuthLayoutProps {
  children: React.ReactNode
}

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="flex min-h-screen w-full items-center justify-center p-4 flex-col">
      <Card className="flex w-[95vw] h-[95vh] overflow-hidden">
        <div className="hidden md:block w-1/2 relative bg-black">
          <Link to="/">
            <a  className="absolute top-8 left-8 font-bold text-white flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" className="mr-2 h-6 w-6"><path d="M15 6v12a3 3 0 1 0 3-3H6a3 3 0 1 0 3 3V6a3 3 0 1 0-3 3h12a3 3 0 1 0-3-3"></path></svg>
              <span className="text-2xl font-bold text-white">Canvas</span>
            </a>
          </Link>
          <div className="absolute bottom-8 left-8 text-sm text-white max-w-[80%]">
            Web UI version: {version}
          </div>
        </div>
        <div className="flex w-full md:w-1/2 flex-col justify-center px-4 py-12 sm:px-6 lg:px-8">
          <div className="mx-auto w-full max-w-sm">
            {children}

            <div className="mt-8 border-t pt-6">
              <a href="https://github.com/canvas-ai" target="_blank" className="text-gray-600 hover:text-gray-900 justify-center flex items-center space-x-2" rel="noopener noreferrer">
                <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" className="w-6 h-6"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path></svg>
                <span>View on GitHub</span>
              </a>
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}
