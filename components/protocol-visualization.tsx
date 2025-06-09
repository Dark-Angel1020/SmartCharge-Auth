import { Badge } from "@/components/ui/badge"
import { CheckCircle, Clock, ArrowRight } from "lucide-react"
import type { Message } from "@/app/page"

interface ProtocolVisualizationProps {
  currentStep: number
  messages: Message[]
}

const protocolSteps = [
  {
    phase: "EV Registration",
    steps: [
      {
        id: 1,
        title: "EV → USP: M1 (PSIDEV, CH, RS, PUBi)",
        description: "EV sends registration request with PUFF challenge response",
      },
      {
        id: 2,
        title: "USP → EV: M2 (Aj, ID_USP, PUB_USP)",
        description: "USP validates and responds with authentication token",
      },
    ],
  },
  {
    phase: "Charging Station Registration",
    steps: [
      {
        id: 3,
        title: "CS → USP: M1 (ID_Charging, CH, PUFF_Response, PUB_Charging)",
        description: "Charging station registers with USP",
      },
      {
        id: 4,
        title: "USP → CS: M2 (Aj, ID_USP, Timestamp)",
        description: "USP confirms charging station registration",
      },
    ],
  },
  {
    phase: "Authentication Process",
    steps: [
      {
        id: 5,
        title: "EV → CS: M1 (PSIDEV, N1, PUB_EV)",
        description: "EV initiates authentication with charging station",
      },
      {
        id: 6,
        title: "CS → EV: M2 (ID_Charging, CH, N2, Seed)",
        description: "Charging station responds with challenge and seed",
      },
      {
        id: 7,
        title: "EV → CS: M3 (PSIDEV, CH, PUFF_Result, Ki)",
        description: "EV provides PUFF response for verification",
      },
      {
        id: 8,
        title: "CS → EV: M4 (ID, CH, N, PUFF_Result, Token, Key)",
        description: "Charging station completes authentication with token",
      },
    ],
  },
]

export function ProtocolVisualization({ currentStep, messages }: ProtocolVisualizationProps) {
  const getStepStatus = (stepId: number) => {
    if (stepId < currentStep) return "completed"
    if (stepId === currentStep) return "active"
    return "pending"
  }

  const getRecentMessage = (stepId: number) => {
    return messages.find((m) => m.step === stepId)
  }

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-blue-900 border-b pb-2">Protocol Execution Steps</h3>
      </div>
      <div className="space-y-6">
        {protocolSteps.map((phase, phaseIndex) => (
          <div key={phaseIndex} className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">{phase.phase}</h3>
            <div className="space-y-3">
              {phase.steps.map((step) => {
                const status = getStepStatus(step.id)
                const message = getRecentMessage(step.id)

                return (
                  <div
                    key={step.id}
                    className={`flex items-start gap-4 p-4 rounded-lg border transition-all ${
                      status === "completed"
                        ? "bg-green-50 border-green-300"
                        : status === "active"
                          ? "bg-blue-50 border-blue-400 shadow-lg"
                          : "bg-gray-50 border-gray-300"
                    }`}
                  >
                    <div className="flex-shrink-0 mt-1">
                      {status === "completed" ? (
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      ) : status === "active" ? (
                        <Clock className="w-5 h-5 text-blue-600 animate-pulse" />
                      ) : (
                        <div className="w-5 h-5 rounded-full border-2 border-gray-300" />
                      )}
                    </div>

                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          Step {step.id}
                        </Badge>
                        <ArrowRight className="w-4 h-4 text-gray-400" />
                        <span className="font-medium text-sm text-gray-800">{step.title}</span>
                      </div>

                      <p className="text-sm text-gray-600">{step.description}</p>

                      {message && (
                        <div className="mt-2 p-2 bg-gray-100 border border-gray-200 rounded text-xs">
                          <div className="flex justify-between items-center mb-1">
                            <span className="font-medium text-gray-800">
                              {message.from} → {message.to}
                            </span>
                            <span className="text-gray-500">{new Date(message.timestamp).toLocaleTimeString()}</span>
                          </div>
                          <div className="text-gray-600">
                            Type: {message.type} | Encrypted: {message.encrypted ? "Yes" : "No"}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
