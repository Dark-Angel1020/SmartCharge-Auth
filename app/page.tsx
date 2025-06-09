"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { NetworkTopology } from "@/components/network-topology"
import { ProtocolVisualization } from "@/components/protocol-visualization"
import { PerformanceMetrics } from "@/components/performance-metrics"
import { MessageLog } from "@/components/message-log"
import { SimulationControls } from "@/components/simulation-controls"
import { RealTimeCharts } from "@/components/real-time-charts"
import { SimulationComparison } from "@/components/simulation-comparison"
import { Toaster } from "@/components/ui/toaster"
import { useToast } from "@/components/ui/use-toast"
import { Sparkles, Zap, Shield, Activity, Cpu, Network, Lock } from "lucide-react"

export interface NetworkNode {
  id: string
  type: "EV" | "USP" | "ChargingStation"
  position: { x: number; y: number }
  status: "idle" | "registering" | "authenticating" | "charging" | "authenticated"
  publicKey?: string
  privateKey?: string
  sharedKey?: string
  psidev?: string
  challenge?: string
  puffResponse?: string
  nonce?: string
  token?: string
}

export interface Message {
  id: string
  from: string
  to: string
  type: string
  content: any
  timestamp: number
  encrypted: boolean
  step: number
  phase: "registration" | "authentication"
}

export interface SimulationMetrics {
  throughput: number
  endToEndDelay: number
  successfulAuthentications: number
  failedAuthentications: number
  totalMessages: number
  averageProcessingTime: number
  networkUtilization: number
}

export interface SimulationResult {
  id: string
  name: string
  timestamp: number
  config: {
    numEVs: number
    numChargingStations: number
    simulationSpeed: number
  }
  finalMetrics: SimulationMetrics
  metricsHistory: Array<{
    timestamp: number
    throughput: number
    endToEndDelay: number
    networkUtilization: number
    successRate: number
  }>
}

export default function EVNetworkSimulation() {
  const [numEVs, setNumEVs] = useState(3)
  const [numChargingStations, setNumChargingStations] = useState(2)
  const [nodes, setNodes] = useState<NetworkNode[]>([])
  const [messages, setMessages] = useState<Message[]>([])
  const [metrics, setMetrics] = useState<SimulationMetrics>({
    throughput: 0,
    endToEndDelay: 0,
    successfulAuthentications: 0,
    failedAuthentications: 0,
    totalMessages: 0,
    averageProcessingTime: 0,
    networkUtilization: 0,
  })
  const [metricsHistory, setMetricsHistory] = useState<
    Array<{
      timestamp: number
      throughput: number
      endToEndDelay: number
      networkUtilization: number
      successRate: number
    }>
  >([])
  const [simulationResults, setSimulationResults] = useState<SimulationResult[]>([])
  const [isSimulating, setIsSimulating] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [simulationSpeed, setSimulationSpeed] = useState(1000)
  const { toast } = useToast()

  const initializeNetwork = useCallback(() => {
    const newNodes: NetworkNode[] = []

    // Add USP node (center)
    newNodes.push({
      id: "USP-1",
      type: "USP",
      position: { x: 400, y: 300 },
      status: "idle",
      publicKey: generateKey(),
      privateKey: generateKey(),
    })

    // Add EV nodes
    for (let i = 0; i < numEVs; i++) {
      const angle = (i / numEVs) * 2 * Math.PI
      const radius = 200
      newNodes.push({
        id: `EV-${i + 1}`,
        type: "EV",
        position: {
          x: 400 + Math.cos(angle) * radius,
          y: 300 + Math.sin(angle) * radius,
        },
        status: "idle",
        publicKey: generateKey(),
        privateKey: generateKey(),
        sharedKey: generateKey(),
      })
    }

    // Add Charging Station nodes
    for (let i = 0; i < numChargingStations; i++) {
      const angle = (i / numChargingStations) * 2 * Math.PI + Math.PI
      const radius = 150
      newNodes.push({
        id: `CS-${i + 1}`,
        type: "ChargingStation",
        position: {
          x: 400 + Math.cos(angle) * radius,
          y: 300 + Math.sin(angle) * radius,
        },
        status: "idle",
        publicKey: generateKey(),
        privateKey: generateKey(),
      })
    }

    setNodes(newNodes)
    setMessages([])
    setCurrentStep(0)
  }, [numEVs, numChargingStations])

  useEffect(() => {
    initializeNetwork()
  }, [initializeNetwork])

  const generateKey = () => {
    return Math.random().toString(36).substring(2, 15)
  }

  const generatePUFF = (challenge: string, seed?: string) => {
    // Simulate PUFF response based on challenge and optional seed
    const input = challenge + (seed || "")
    let hash = 0
    for (let i = 0; i < input.length; i++) {
      const char = input.charCodeAt(i)
      hash = (hash << 5) - hash + char
      hash = hash & hash
    }
    return Math.abs(hash).toString(16)
  }

  const generateHash = (...inputs: string[]) => {
    const combined = inputs.join("")
    let hash = 0
    for (let i = 0; i < combined.length; i++) {
      const char = combined.charCodeAt(i)
      hash = (hash << 5) - hash + char
      hash = hash & hash
    }
    return Math.abs(hash).toString(16)
  }

  const addMessage = (
    from: string,
    to: string,
    type: string,
    content: any,
    phase: "registration" | "authentication",
    step: number,
  ) => {
    const message: Message = {
      id: `msg-${Date.now()}-${Math.random()}`,
      from,
      to,
      type,
      content,
      timestamp: Date.now(),
      encrypted: true,
      step,
      phase,
    }
    setMessages((prev) => [...prev, message])

    // Update metrics
    setMetrics((prev) => ({
      ...prev,
      totalMessages: prev.totalMessages + 1,
      networkUtilization: Math.min(100, (prev.totalMessages + 1) * 2),
    }))
  }

  const updateMetricsHistory = useCallback(() => {
    const now = Date.now()
    const successRate =
      metrics.successfulAuthentications + metrics.failedAuthentications > 0
        ? (metrics.successfulAuthentications / (metrics.successfulAuthentications + metrics.failedAuthentications)) *
          100
        : 0

    setMetricsHistory((prev) => {
      const newEntry = {
        timestamp: now,
        throughput: metrics.throughput,
        endToEndDelay: metrics.endToEndDelay / 1000, // Convert to seconds
        networkUtilization: metrics.networkUtilization,
        successRate: successRate || 0,
      }

      // Keep only last 50 data points for performance
      const updated = [...prev, newEntry].slice(-50)
      return updated
    })
  }, [metrics])

  // Add useEffect to update metrics history when metrics change
  useEffect(() => {
    if (isSimulating) {
      updateMetricsHistory()
    }
  }, [metrics, isSimulating, updateMetricsHistory])

  const updateNodeStatus = (nodeId: string, status: NetworkNode["status"], updates?: Partial<NetworkNode>) => {
    setNodes((prev) => prev.map((node) => (node.id === nodeId ? { ...node, status, ...updates } : node)))
  }

  const simulateEVRegistration = async (evNode: NetworkNode) => {
    const uspNode = nodes.find((n) => n.type === "USP")
    if (!uspNode) return

    // Step 1: EV generates challenge and PUFF response
    const challenge = Math.random().toString(36).substring(2, 8)
    const puffResponse = generatePUFF(challenge)
    const psidev = generateHash(evNode.id, puffResponse)

    updateNodeStatus(evNode.id, "registering", {
      challenge,
      puffResponse,
      psidev,
    })

    // EV sends M1 to USP
    const m1Content = {
      psidev,
      challenge,
      response: puffResponse,
      publicKey: evNode.publicKey,
    }

    addMessage(evNode.id, uspNode.id, "M1_EV_Registration", m1Content, "registration", 1)

    await new Promise((resolve) => setTimeout(resolve, simulationSpeed))

    // Step 2: USP validates and responds
    const nonce = Math.random().toString(36).substring(2, 10)
    const aj = generateHash(evNode.id, challenge, uspNode.id, uspNode.publicKey!)

    const m2Content = {
      aj,
      uspId: uspNode.id,
      uspPublicKey: uspNode.publicKey,
      nonce,
    }

    addMessage(uspNode.id, evNode.id, "M2_USP_Response", m2Content, "registration", 2)

    await new Promise((resolve) => setTimeout(resolve, simulationSpeed))

    // Step 3: EV validates response
    updateNodeStatus(evNode.id, "idle")

    setMetrics((prev) => ({
      ...prev,
      successfulAuthentications: prev.successfulAuthentications + 1,
      endToEndDelay: prev.endToEndDelay + simulationSpeed * 2,
    }))
  }

  const simulateChargingStationRegistration = async (csNode: NetworkNode) => {
    const uspNode = nodes.find((n) => n.type === "USP")
    if (!uspNode) return

    updateNodeStatus(csNode.id, "registering")

    // Step 1: CS sends registration to USP
    const challenge = Math.random().toString(36).substring(2, 8)
    const puffResponse = generatePUFF(challenge)

    const m1Content = {
      chargingId: csNode.id,
      challenge,
      puffResponse,
      publicKey: csNode.publicKey,
    }

    addMessage(csNode.id, uspNode.id, "M1_CS_Registration", m1Content, "registration", 1)

    await new Promise((resolve) => setTimeout(resolve, simulationSpeed))

    // Step 2: USP responds with Aj
    const aj = generateHash(csNode.id, challenge, puffResponse, uspNode.id, uspNode.publicKey!, csNode.publicKey!)

    const m2Content = {
      aj,
      uspId: uspNode.id,
      timestamp: Date.now(),
    }

    addMessage(uspNode.id, csNode.id, "M2_USP_CS_Response", m2Content, "registration", 2)

    await new Promise((resolve) => setTimeout(resolve, simulationSpeed))

    updateNodeStatus(csNode.id, "idle")
  }

  const simulateAuthentication = async (evNode: NetworkNode, csNode: NetworkNode) => {
    // Step 1: EV sends M1 to Charging Station
    updateNodeStatus(evNode.id, "authenticating")
    updateNodeStatus(csNode.id, "authenticating")

    const n1 = Math.random().toString(36).substring(2, 10)

    const m1Content = {
      psidev: evNode.psidev,
      n1,
      publicKey: evNode.publicKey,
    }

    addMessage(evNode.id, csNode.id, "M1_Auth_Request", m1Content, "authentication", 1)

    await new Promise((resolve) => setTimeout(resolve, simulationSpeed))

    // Step 2: CS responds with challenge and seed
    const challenge = Math.random().toString(36).substring(2, 8)
    const seed = Math.random().toString(36).substring(2, 10)
    const kk = generatePUFF(seed)
    const n2 = Math.random().toString(36).substring(2, 10)

    const m2Content = {
      chargingId: csNode.id,
      challenge,
      n2,
      seed,
    }

    addMessage(csNode.id, evNode.id, "M2_Challenge_Response", m2Content, "authentication", 2)

    await new Promise((resolve) => setTimeout(resolve, simulationSpeed))

    // Step 3: EV responds with PUFF result
    const ki = generatePUFF(seed)
    const evChallenge = Math.random().toString(36).substring(2, 8)
    const puffResult = generatePUFF(evChallenge)

    const m3Content = {
      psidev: evNode.psidev,
      challenge: evChallenge,
      puffResult,
      ki,
    }

    addMessage(evNode.id, csNode.id, "M3_PUFF_Response", m3Content, "authentication", 3)

    await new Promise((resolve) => setTimeout(resolve, simulationSpeed))

    // Step 4: CS validates and sends token
    const token = generateHash(evNode.psidev!, Date.now().toString(), puffResult, csNode.id)
    const rsk = generatePUFF(puffResult)
    const encryptionKey = generateHash(rsk, token)

    const m4Content = {
      id: csNode.id,
      challenge: evChallenge,
      nonce: n2,
      puffResult,
      token,
      key: encryptionKey,
    }

    addMessage(csNode.id, evNode.id, "M4_Auth_Complete", m4Content, "authentication", 4)

    await new Promise((resolve) => setTimeout(resolve, simulationSpeed))

    // Authentication complete
    updateNodeStatus(evNode.id, "authenticated", { token })
    updateNodeStatus(csNode.id, "authenticated")

    setMetrics((prev) => ({
      ...prev,
      successfulAuthentications: prev.successfulAuthentications + 1,
      throughput: prev.throughput + 60000 / simulationSpeed, // authentications per minute
      endToEndDelay: prev.endToEndDelay + simulationSpeed * 4,
      averageProcessingTime: (prev.averageProcessingTime + simulationSpeed * 4) / 2,
    }))
  }

  const startSimulation = async () => {
    setIsSimulating(true)
    setCurrentStep(0)

    // Reset all nodes to idle
    setNodes((prev) => prev.map((node) => ({ ...node, status: "idle" })))
    setMessages([])

    // Reset metrics
    setMetrics({
      throughput: 0,
      endToEndDelay: 0,
      successfulAuthentications: 0,
      failedAuthentications: 0,
      totalMessages: 0,
      averageProcessingTime: 0,
      networkUtilization: 0,
    })

    toast({
      title: "🚀 Simulation Started",
      description: `Running with ${numEVs} EVs and ${numChargingStations} charging stations`,
    })

    // Phase 1: Register all EVs with USP
    const evNodes = nodes.filter((n) => n.type === "EV")
    for (const ev of evNodes) {
      await simulateEVRegistration(ev)
      setCurrentStep((prev) => prev + 1)
    }

    // Phase 2: Register all Charging Stations with USP
    const csNodes = nodes.filter((n) => n.type === "ChargingStation")
    for (const cs of csNodes) {
      await simulateChargingStationRegistration(cs)
      setCurrentStep((prev) => prev + 1)
    }

    // Phase 3: Authenticate EVs with Charging Stations
    for (let i = 0; i < Math.min(evNodes.length, csNodes.length); i++) {
      await simulateAuthentication(evNodes[i], csNodes[i % csNodes.length])
      setCurrentStep((prev) => prev + 1)
    }

    setIsSimulating(false)

    // Save simulation result
    const simulationResult: SimulationResult = {
      id: `sim-${Date.now()}`,
      name: `Simulation ${simulationResults.length + 1}`,
      timestamp: Date.now(),
      config: {
        numEVs,
        numChargingStations,
        simulationSpeed,
      },
      finalMetrics: metrics,
      metricsHistory: [...metricsHistory],
    }

    setSimulationResults((prev) => [...prev, simulationResult])

    toast({
      title: "✅ Simulation Complete",
      description: `Completed with ${metrics.successfulAuthentications} successful authentications`,
      variant: "success",
    })
  }

  const resetSimulation = () => {
    initializeNetwork()
    setMetrics({
      throughput: 0,
      endToEndDelay: 0,
      successfulAuthentications: 0,
      failedAuthentications: 0,
      totalMessages: 0,
      averageProcessingTime: 0,
      networkUtilization: 0,
    })
    setMetricsHistory([])

    toast({
      title: "🔄 Simulation Reset",
      description: "All metrics and network state have been reset",
    })
  }

  const clearSimulationHistory = () => {
    setSimulationResults([])
    toast({
      title: "🗑️ History Cleared",
      description: "All simulation results have been cleared",
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-600/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-cyan-400/20 to-blue-600/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-purple-400/10 to-pink-600/10 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      {/* Header */}
      <div className="relative bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 shadow-2xl">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative max-w-7xl mx-auto px-6 py-12">
          <div className="text-center space-y-6">
            <div className="flex items-center justify-center gap-4">
              <div className="p-4 bg-white/20 backdrop-blur-sm rounded-2xl shadow-lg">
                <Zap className="w-10 h-10 text-white" />
              </div>
              <h1 className="text-5xl font-bold text-white drop-shadow-lg">
                EV Charging Network
                <span className="block text-4xl bg-gradient-to-r from-cyan-200 to-blue-200 bg-clip-text text-transparent">
                  Simulation Platform
                </span>
              </h1>
              <div className="p-4 bg-white/20 backdrop-blur-sm rounded-2xl shadow-lg">
                <Shield className="w-10 h-10 text-white" />
              </div>
            </div>

            <div className="flex items-center justify-center gap-3">
              <Sparkles className="w-6 h-6 text-cyan-200 animate-pulse" />
              <p className="text-xl text-blue-100 font-medium">
                Advanced Cryptographic Protocol Analysis for EV-USP-Charging Station Communication
              </p>
              <Sparkles className="w-6 h-6 text-cyan-200 animate-pulse" />
            </div>

            <div className="flex items-center justify-center gap-8 text-sm">
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full">
                <Activity className="w-5 h-5 text-green-300" />
                <span className="text-white font-medium">Real-time Simulation</span>
              </div>
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full">
                <Lock className="w-5 h-5 text-purple-300" />
                <span className="text-white font-medium">PUFF Cryptography</span>
              </div>
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full">
                <Cpu className="w-5 h-5 text-blue-300" />
                <span className="text-white font-medium">Performance Analytics</span>
              </div>
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full">
                <Network className="w-5 h-5 text-cyan-300" />
                <span className="text-white font-medium">Multi-Simulation</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="relative max-w-7xl mx-auto p-6 space-y-8">
        <SimulationControls
          numEVs={numEVs}
          setNumEVs={setNumEVs}
          numChargingStations={numChargingStations}
          setNumChargingStations={setNumChargingStations}
          simulationSpeed={simulationSpeed}
          setSimulationSpeed={setSimulationSpeed}
          isSimulating={isSimulating}
          onStart={startSimulation}
          onReset={resetSimulation}
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <Card className="shadow-2xl border-0 bg-white/80 backdrop-blur-sm overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-500 text-white">
                <CardTitle className="text-2xl flex items-center gap-3">
                  <div className="p-2 bg-white/20 rounded-lg">
                    <Network className="w-6 h-6" />
                  </div>
                  Network Visualization & Protocol Analysis
                </CardTitle>
                <CardDescription className="text-blue-100">
                  Real-time visualization of network topology and cryptographic protocol execution
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <Tabs defaultValue="topology" className="w-full">
                  <TabsList className="w-full grid grid-cols-3 rounded-none bg-gradient-to-r from-blue-50 to-purple-50 border-b">
                    <TabsTrigger
                      value="topology"
                      className="data-[state=active]:bg-white data-[state=active]:shadow-lg data-[state=active]:text-blue-600 font-medium"
                    >
                      Network Topology
                    </TabsTrigger>
                    <TabsTrigger
                      value="protocol"
                      className="data-[state=active]:bg-white data-[state=active]:shadow-lg data-[state=active]:text-purple-600 font-medium"
                    >
                      Protocol Steps
                    </TabsTrigger>
                    <TabsTrigger
                      value="messages"
                      className="data-[state=active]:bg-white data-[state=active]:shadow-lg data-[state=active]:text-indigo-600 font-medium"
                    >
                      Message Log
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="topology" className="p-6 mt-0">
                    <NetworkTopology nodes={nodes} messages={messages} />
                  </TabsContent>

                  <TabsContent value="protocol" className="p-6 mt-0">
                    <ProtocolVisualization currentStep={currentStep} messages={messages} />
                  </TabsContent>

                  <TabsContent value="messages" className="p-6 mt-0">
                    <MessageLog messages={messages} />
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>

            <Card className="shadow-2xl border-0 bg-white/80 backdrop-blur-sm overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-500 text-white">
                <CardTitle className="text-2xl flex items-center gap-3">
                  <div className="p-2 bg-white/20 rounded-lg">
                    <Activity className="w-6 h-6" />
                  </div>
                  Performance Analytics Dashboard
                </CardTitle>
                <CardDescription className="text-cyan-100">
                  Real-time performance metrics and trend analysis
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <RealTimeCharts metricsHistory={metricsHistory} />
              </CardContent>
            </Card>

            {simulationResults.length > 0 && (
              <Card className="shadow-2xl border-0 bg-white/80 backdrop-blur-sm overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-purple-500 via-pink-500 to-indigo-500 text-white">
                  <CardTitle className="text-2xl flex items-center gap-3">
                    <div className="p-2 bg-white/20 rounded-lg">
                      <Cpu className="w-6 h-6" />
                    </div>
                    Multi-Simulation Comparison
                  </CardTitle>
                  <CardDescription className="text-purple-100">
                    Compare performance across different simulation runs
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  <SimulationComparison simulationResults={simulationResults} onClearHistory={clearSimulationHistory} />
                </CardContent>
              </Card>
            )}
          </div>

          <div className="space-y-8">
            <PerformanceMetrics metrics={metrics} />

            <Card className="shadow-2xl border-0 bg-white/80 backdrop-blur-sm overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 text-white">
                <CardTitle className="flex items-center gap-3">
                  <div className="p-2 bg-white/20 rounded-lg">
                    <Zap className="w-5 h-5" />
                  </div>
                  Simulation Status
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6 p-6">
                <div className="flex items-center justify-between">
                  <span className="text-gray-700 font-medium">Current Step:</span>
                  <Badge className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-3 py-1 shadow-lg">
                    {currentStep}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-700 font-medium">Status:</span>
                  <Badge
                    className={
                      isSimulating
                        ? "bg-gradient-to-r from-green-500 to-emerald-500 text-white animate-pulse shadow-lg"
                        : "bg-gradient-to-r from-gray-400 to-gray-500 text-white shadow-lg"
                    }
                  >
                    {isSimulating ? "🔄 Running" : "⏸️ Idle"}
                  </Badge>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm text-gray-700 font-medium">
                    <span>Network Utilization</span>
                    <span className="text-blue-600">{metrics.networkUtilization.toFixed(1)}%</span>
                  </div>
                  <div className="relative">
                    <Progress
                      value={metrics.networkUtilization}
                      className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full shadow-inner"
                    />
                    <div
                      className="absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-500 rounded-full opacity-80"
                      style={{ width: `${metrics.networkUtilization}%` }}
                    ></div>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-200">
                  <div className="text-xs text-gray-500 flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    Last updated: {new Date().toLocaleTimeString()}
                  </div>
                </div>

                {simulationResults.length > 0 && (
                  <div className="pt-4 border-t border-gray-200">
                    <div className="text-sm text-gray-700 mb-2 font-medium">Simulation History:</div>
                    <div className="flex items-center gap-2">
                      <div className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                        {simulationResults.length}
                      </div>
                      <div className="text-sm text-gray-600">runs completed</div>
                      <div className="ml-auto">
                        <div className="w-3 h-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full animate-bounce"></div>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      <Toaster />
    </div>
  )
}
