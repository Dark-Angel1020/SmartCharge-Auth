"use client"

import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Lock, Unlock, ArrowRight } from "lucide-react"
import type { Message } from "@/app/page"

interface MessageLogProps {
  messages: Message[]
}

export function MessageLog({ messages }: MessageLogProps) {
  const getPhaseColor = (phase: string) => {
    switch (phase) {
      case "registration":
        return "bg-blue-100 text-blue-800"
      case "authentication":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString()
  }

  const truncateContent = (content: any) => {
    const str = JSON.stringify(content, null, 2)
    return str.length > 100 ? str.substring(0, 100) + "..." : str
  }

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 py-2 border-b border-blue-200">
        <h2 className="text-lg font-semibold text-blue-900">Message Exchange Log</h2>
      </div>
      <ScrollArea className="h-full bg-gray-50">
        <div className="space-y-3 p-4">
          {messages.length === 0 ? (
            <div className="text-center text-slate-400 py-8">
              No messages yet. Start the simulation to see message exchanges.
            </div>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className="rounded-lg p-4 space-y-3 bg-white border border-blue-200 hover:bg-blue-50 shadow-sm transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs text-gray-600 border-blue-300">
                      Step {message.step}
                    </Badge>
                    <Badge className={`text-xs ${getPhaseColor(message.phase)}`}>{message.phase}</Badge>
                  </div>
                  <span className="text-xs text-gray-600">{formatTimestamp(message.timestamp)}</span>
                </div>

                <div className="flex items-center gap-2 text-sm text-gray-800">
                  <span className="font-medium text-blue-400">{message.from}</span>
                  <ArrowRight className="w-4 h-4 text-slate-500" />
                  <span className="font-medium text-green-400">{message.to}</span>
                  <div className="flex items-center gap-1 ml-auto">
                    {message.encrypted ? (
                      <Lock className="w-4 h-4 text-red-500" />
                    ) : (
                      <Unlock className="w-4 h-4 text-slate-400" />
                    )}
                    <span className="text-xs text-slate-400">{message.encrypted ? "Encrypted" : "Plain"}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="text-sm font-medium text-gray-800">{message.type}</div>
                  <div className="bg-gray-100 border border-gray-200 rounded p-2 text-xs font-mono text-slate-300">
                    <pre className="whitespace-pre-wrap">{truncateContent(message.content)}</pre>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  )
}
