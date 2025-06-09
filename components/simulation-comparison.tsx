import { useState, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ChartContainer } from "@/components/ui/chart"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  BarChart,
  Bar,
  Tooltip,
  Legend,
} from "recharts"
import { Trash2, Download, TrendingUp, BarChart3, Activity, Wifi, Clock, X, Camera } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import type { SimulationResult } from "@/app/page"

interface SimulationComparisonProps {
  simulationResults: SimulationResult[]
  onClearHistory: () => void
}

export function SimulationComparison({ simulationResults, onClearHistory }: SimulationComparisonProps) {
  const [selectedSimulations, setSelectedSimulations] = useState<string[]>([])
  const [maxSelections, setMaxSelections] = useState(4)
  const [showComparisonModal, setShowComparisonModal] = useState(false)
  const chartRefs = useRef<{ [key: string]: HTMLDivElement | null }>({})
  const { toast } = useToast()

  const toggleSimulationSelection = (id: string) => {
    setSelectedSimulations((prev) => {
      if (prev.includes(id)) {
        return prev.filter((simId) => simId !== id)
      } else {
        if (prev.length >= maxSelections) {
          return [...prev.slice(1), id] 
        }
        return [...prev, id]
      }
    })
  }

  const getSelectedSimulations = () => {
    return simulationResults.filter((sim) => selectedSimulations.includes(sim.id))
  }

  const exportComparisonData = () => {
    const selected = getSelectedSimulations()
    if (selected.length < 2) {
      toast({
        title: "Insufficient selections",
        description: "Please select at least 2 simulations to export comparison data",
        variant: "destructive",
      })
      return
    }

    
    const headers = [
      "Simulation",
      "EVs",
      "Charging Stations",
      "Speed (ms)",
      "Throughput (auth/min)",
      "End-to-End Delay (s)",
      "Success Rate (%)",
      "Total Messages",
      "Network Utilization (%)",
    ]

    const csvContent = [
      headers.join(","),
      ...selected.map((sim) => [
        sim.name,
        sim.config.numEVs,
        sim.config.numChargingStations,
        sim.config.simulationSpeed,
        (sim.finalMetrics.throughput * 60).toFixed(1),
        (sim.finalMetrics.endToEndDelay / 1000).toFixed(2),
        (
          (sim.finalMetrics.successfulAuthentications /
            (sim.finalMetrics.successfulAuthentications + sim.finalMetrics.failedAuthentications)) *
          100
        ).toFixed(1),
        sim.finalMetrics.totalMessages,
        sim.finalMetrics.networkUtilization.toFixed(1),
      ]),
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.setAttribute("href", url)
    link.setAttribute("download", `simulation-comparison-${new Date().toISOString().slice(0, 10)}.csv`)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    toast({
      title: "Comparison data exported",
      description: "CSV file downloaded successfully",
      variant: "success",
    })
  }

  const downloadChartImage = async (chartId: string, chartName: string) => {
    const chartElement = chartRefs.current[chartId]
    if (!chartElement) {
      toast({
        title: "Chart not found",
        description: "Unable to capture the chart image",
        variant: "destructive",
      })
      return
    }

    try {
     
      const html2canvas = (await import("html2canvas")).default
      const canvas = await html2canvas(chartElement, {
        backgroundColor: "#ffffff",
        scale: 2, 
        useCORS: true,
      })

    
      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob)
          const link = document.createElement("a")
          link.href = url
          link.download = `${chartName}-${new Date().toISOString().slice(0, 10)}.png`
          link.click()
          URL.revokeObjectURL(url)

          toast({
            title: "Chart image downloaded",
            description: `${chartName} saved successfully`,
            variant: "success",
          })
        }
      }, "image/png")
    } catch (error) {
      toast({
        title: "Download failed",
        description: "Unable to download chart image",
        variant: "destructive",
      })
    }
  }

  const openComparisonModal = () => {
    if (selectedSimulations.length < 2) {
      toast({
        title: "Insufficient selections",
        description: "Please select at least 2 simulations to compare",
        variant: "destructive",
      })
      return
    }
    setShowComparisonModal(true)
  }

  
  const comparisonData = getSelectedSimulations().map((sim, index) => ({
    name: sim.name,
    throughput: Number.parseFloat((sim.finalMetrics.throughput * 60).toFixed(1)),
    delay: Number.parseFloat((sim.finalMetrics.endToEndDelay / 1000).toFixed(2)),
    successRate: Number.parseFloat(
      (
        (sim.finalMetrics.successfulAuthentications /
          (sim.finalMetrics.successfulAuthentications + sim.finalMetrics.failedAuthentications)) *
        100
      ).toFixed(1),
    ),
    utilization: Number.parseFloat(sim.finalMetrics.networkUtilization.toFixed(1)),
    totalMessages: sim.finalMetrics.totalMessages,
    avgProcessingTime: Number.parseFloat((sim.finalMetrics.averageProcessingTime / 1000).toFixed(2)),
    color: `hsl(${(index * 60) % 360}, 70%, 50%)`,
  }))

 
  const maxLength = Math.max(...getSelectedSimulations().map((sim) => sim.metricsHistory.length))
  const trendData = Array.from({ length: maxLength }, (_, i) => {
    const dataPoint: any = { time: i }
    getSelectedSimulations().forEach((sim) => {
      const point = sim.metricsHistory[i]
      if (point) {
        dataPoint[`${sim.name}_throughput`] = point.throughput
        dataPoint[`${sim.name}_delay`] = point.endToEndDelay
        dataPoint[`${sim.name}_utilization`] = point.networkUtilization
        dataPoint[`${sim.name}_successRate`] = point.successRate
      }
    })
    return dataPoint
  })

 
  const ComparisonModal = () => {
    if (!showComparisonModal) return null

    return (
      <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-7xl max-h-[95vh] overflow-hidden">
          <div className="flex justify-between items-center p-6 border-b bg-gradient-to-r from-blue-600 to-purple-600 text-white">
            <div>
              <h2 className="text-2xl font-bold">Simulation Comparison Analysis</h2>
              <p className="text-blue-100 mt-1">
                Comparing {selectedSimulations.length} simulation{selectedSimulations.length > 1 ? "s" : ""} •{" "}
                {getSelectedSimulations()
                  .map((sim) => sim.name)
                  .join(", ")}
              </p>
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={exportComparisonData}
                className="bg-white/10 border-white/20 text-white hover:bg-white/20"
              >
                <Download className="w-4 h-4 mr-2" />
                Export Data
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowComparisonModal(false)}
                className="bg-white/10 border-white/20 text-white hover:bg-white/20"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div className="overflow-auto max-h-[calc(95vh-80px)]">
            <div className="p-6">
              <Tabs defaultValue="overview" className="space-y-6">
                <TabsList className="w-full p-1 bg-gradient-to-r from-blue-100 to-purple-100 rounded-xl shadow-lg">
                  <TabsTrigger
                    value="overview"
                    className="flex-1 flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-lg data-[state=active]:text-blue-600 rounded-lg font-medium transition-all"
                  >
                    <BarChart3 className="w-4 h-4" />
                    Overview
                  </TabsTrigger>
                  <TabsTrigger
                    value="performance"
                    className="flex-1 flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-lg data-[state=active]:text-green-600 rounded-lg font-medium transition-all"
                  >
                    <Activity className="w-4 h-4" />
                    Performance
                  </TabsTrigger>
                  <TabsTrigger
                    value="network"
                    className="flex-1 flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-lg data-[state=active]:text-purple-600 rounded-lg font-medium transition-all"
                  >
                    <Wifi className="w-4 h-4" />
                    Network
                  </TabsTrigger>
                  <TabsTrigger
                    value="trends"
                    className="flex-1 flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-lg data-[state=active]:text-orange-600 rounded-lg font-medium transition-all"
                  >
                    <TrendingUp className="w-4 h-4" />
                    Trends
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-6 mt-0">
                  <div className="space-y-6">
                    <Card className="border-0 shadow-xl bg-gradient-to-br from-blue-50 to-indigo-50 overflow-hidden">
                      <CardHeader className="pb-4">
                        <div className="flex justify-between items-center">
                          <CardTitle className="text-lg flex items-center gap-3">
                            <div className="p-2 bg-blue-500 rounded-lg">
                              <Activity className="w-5 h-5 text-white" />
                            </div>
                            Throughput vs Delay Analysis
                          </CardTitle>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => downloadChartImage("throughput-delay-chart", "Throughput-vs-Delay")}
                            className="flex items-center gap-2"
                          >
                            <Camera className="w-4 h-4" />
                            Download
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent className="p-6">
                        <div
                          ref={(el) => (chartRefs.current["throughput-delay-chart"] = el)}
                          className="w-full h-[500px] bg-white rounded-lg p-4"
                        >
                          <ChartContainer config={{}} className="h-full w-full">
                            <ResponsiveContainer width="100%" height="100%">
                              <BarChart data={comparisonData} margin={{ top: 20, right: 30, left: 20, bottom: 80 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                <XAxis
                                  dataKey="name"
                                  tick={{ fontSize: 12 }}
                                  height={80}
                                  tickMargin={15}
                                  angle={-45}
                                  textAnchor="end"
                                />
                                <YAxis tick={{ fontSize: 12 }} width={60} />
                                <Tooltip
                                  contentStyle={{
                                    backgroundColor: "white",
                                    borderColor: "#e2e8f0",
                                    borderRadius: "8px",
                                    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                                    padding: "12px",
                                  }}
                                />
                                <Legend />
                                <Bar
                                  dataKey="throughput"
                                  name="Throughput (auth/min)"
                                  fill="#3b82f6"
                                  radius={[4, 4, 0, 0]}
                                />
                                <Bar dataKey="delay" name="Delay (s)" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                              </BarChart>
                            </ResponsiveContainer>
                          </ChartContainer>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="border-0 shadow-xl bg-gradient-to-br from-purple-50 to-pink-50 overflow-hidden">
                      <CardHeader className="pb-4">
                        <div className="flex justify-between items-center">
                          <CardTitle className="text-lg flex items-center gap-3">
                            <div className="p-2 bg-purple-500 rounded-lg">
                              <Wifi className="w-5 h-5 text-white" />
                            </div>
                            Success Rate & Network Utilization
                          </CardTitle>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => downloadChartImage("success-utilization-chart", "Success-Rate-Utilization")}
                            className="flex items-center gap-2"
                          >
                            <Camera className="w-4 h-4" />
                            Download
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent className="p-6">
                        <div
                          ref={(el) => (chartRefs.current["success-utilization-chart"] = el)}
                          className="w-full h-[500px] bg-white rounded-lg p-4"
                        >
                          <ChartContainer config={{}} className="h-full w-full">
                            <ResponsiveContainer width="100%" height="100%">
                              <BarChart data={comparisonData} margin={{ top: 20, right: 30, left: 20, bottom: 80 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                <XAxis
                                  dataKey="name"
                                  tick={{ fontSize: 12 }}
                                  height={80}
                                  tickMargin={15}
                                  angle={-45}
                                  textAnchor="end"
                                />
                                <YAxis tick={{ fontSize: 12 }} domain={[0, 100]} width={60} />
                                <Tooltip
                                  contentStyle={{
                                    backgroundColor: "white",
                                    borderColor: "#e2e8f0",
                                    borderRadius: "8px",
                                    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                                    padding: "12px",
                                  }}
                                />
                                <Legend />
                                <Bar
                                  dataKey="successRate"
                                  name="Success Rate (%)"
                                  fill="#10b981"
                                  radius={[4, 4, 0, 0]}
                                />
                                <Bar
                                  dataKey="utilization"
                                  name="Network Utilization (%)"
                                  fill="#8b5cf6"
                                  radius={[4, 4, 0, 0]}
                                />
                              </BarChart>
                            </ResponsiveContainer>
                          </ChartContainer>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                <TabsContent value="performance" className="space-y-6 mt-0">
                  <div className="space-y-6">
                    <Card className="border-0 shadow-xl bg-gradient-to-br from-emerald-50 to-teal-50 overflow-hidden">
                      <CardHeader className="pb-4">
                        <div className="flex justify-between items-center">
                          <CardTitle className="text-lg flex items-center gap-3">
                            <div className="p-2 bg-emerald-500 rounded-lg">
                              <Activity className="w-5 h-5 text-white" />
                            </div>
                            Message Volume Analysis
                          </CardTitle>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => downloadChartImage("message-volume-chart", "Message-Volume")}
                            className="flex items-center gap-2"
                          >
                            <Camera className="w-4 h-4" />
                            Download
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent className="p-6">
                        <div
                          ref={(el) => (chartRefs.current["message-volume-chart"] = el)}
                          className="w-full h-[500px] bg-white rounded-lg p-4"
                        >
                          <ChartContainer config={{}} className="h-full w-full">
                            <ResponsiveContainer width="100%" height="100%">
                              <BarChart data={comparisonData} margin={{ top: 20, right: 30, left: 20, bottom: 80 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                <XAxis
                                  dataKey="name"
                                  tick={{ fontSize: 12 }}
                                  height={80}
                                  tickMargin={15}
                                  angle={-45}
                                  textAnchor="end"
                                />
                                <YAxis tick={{ fontSize: 12 }} width={60} />
                                <Tooltip
                                  contentStyle={{
                                    backgroundColor: "white",
                                    borderColor: "#e2e8f0",
                                    borderRadius: "8px",
                                    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                                    padding: "12px",
                                  }}
                                />
                                <Legend />
                                <Bar
                                  dataKey="totalMessages"
                                  name="Total Messages"
                                  fill="#059669"
                                  radius={[4, 4, 0, 0]}
                                />
                              </BarChart>
                            </ResponsiveContainer>
                          </ChartContainer>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="border-0 shadow-xl bg-gradient-to-br from-amber-50 to-orange-50 overflow-hidden">
                      <CardHeader className="pb-4">
                        <div className="flex justify-between items-center">
                          <CardTitle className="text-lg flex items-center gap-3">
                            <div className="p-2 bg-amber-500 rounded-lg">
                              <Clock className="w-5 h-5 text-white" />
                            </div>
                            Processing Time Comparison
                          </CardTitle>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => downloadChartImage("processing-time-chart", "Processing-Time")}
                            className="flex items-center gap-2"
                          >
                            <Camera className="w-4 h-4" />
                            Download
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent className="p-6">
                        <div
                          ref={(el) => (chartRefs.current["processing-time-chart"] = el)}
                          className="w-full h-[500px] bg-white rounded-lg p-4"
                        >
                          <ChartContainer config={{}} className="h-full w-full">
                            <ResponsiveContainer width="100%" height="100%">
                              <BarChart data={comparisonData} margin={{ top: 20, right: 30, left: 20, bottom: 80 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                <XAxis
                                  dataKey="name"
                                  tick={{ fontSize: 12 }}
                                  height={80}
                                  tickMargin={15}
                                  angle={-45}
                                  textAnchor="end"
                                />
                                <YAxis tick={{ fontSize: 12 }} width={60} />
                                <Tooltip
                                  contentStyle={{
                                    backgroundColor: "white",
                                    borderColor: "#e2e8f0",
                                    borderRadius: "8px",
                                    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                                    padding: "12px",
                                  }}
                                />
                                <Legend />
                                <Bar
                                  dataKey="avgProcessingTime"
                                  name="Avg Processing Time (s)"
                                  fill="#f59e0b"
                                  radius={[4, 4, 0, 0]}
                                />
                              </BarChart>
                            </ResponsiveContainer>
                          </ChartContainer>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                <TabsContent value="network" className="space-y-6 mt-0">
                  <Card className="border-0 shadow-xl bg-gradient-to-br from-indigo-50 to-purple-50 overflow-hidden">
                    <CardHeader className="pb-4">
                      <div className="flex justify-between items-center">
                        <CardTitle className="text-lg flex items-center gap-3">
                          <div className="p-2 bg-indigo-500 rounded-lg">
                            <Wifi className="w-5 h-5 text-white" />
                          </div>
                          Network Utilization Over Time
                        </CardTitle>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => downloadChartImage("network-utilization-chart", "Network-Utilization")}
                          className="flex items-center gap-2"
                        >
                          <Camera className="w-4 h-4" />
                          Download
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="p-6">
                      <div
                        ref={(el) => (chartRefs.current["network-utilization-chart"] = el)}
                        className="w-full h-[600px] bg-white rounded-lg p-4"
                      >
                        <ChartContainer config={{}} className="h-full w-full">
                          <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={trendData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                              <XAxis
                                dataKey="time"
                                tick={{ fontSize: 12 }}
                                height={40}
                                tickMargin={10}
                                tickFormatter={(value) => (value % 5 === 0 ? value : "")}
                              />
                              <YAxis tick={{ fontSize: 12 }} domain={[0, 100]} width={60} />
                              <Tooltip
                                contentStyle={{
                                  backgroundColor: "white",
                                  borderColor: "#e2e8f0",
                                  borderRadius: "8px",
                                  boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                                  padding: "12px",
                                }}
                              />
                              <Legend />
                              {getSelectedSimulations().map((sim, index) => (
                                <Line
                                  key={sim.id}
                                  type="monotone"
                                  dataKey={`${sim.name}_utilization`}
                                  stroke={`hsl(${(index * 60) % 360}, 70%, 50%)`}
                                  strokeWidth={3}
                                  dot={false}
                                  name={`${sim.name} - Utilization`}
                                  activeDot={{ r: 6, strokeWidth: 2 }}
                                />
                              ))}
                            </LineChart>
                          </ResponsiveContainer>
                        </ChartContainer>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="trends" className="space-y-6 mt-0">
                  <div className="space-y-6">
                    <Card className="border-0 shadow-xl bg-gradient-to-br from-cyan-50 to-blue-50 overflow-hidden">
                      <CardHeader className="pb-4">
                        <div className="flex justify-between items-center">
                          <CardTitle className="text-lg flex items-center gap-3">
                            <div className="p-2 bg-cyan-500 rounded-lg">
                              <TrendingUp className="w-5 h-5 text-white" />
                            </div>
                            Throughput Trends Over Time
                          </CardTitle>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => downloadChartImage("throughput-trends-chart", "Throughput-Trends")}
                            className="flex items-center gap-2"
                          >
                            <Camera className="w-4 h-4" />
                            Download
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent className="p-6">
                        <div
                          ref={(el) => (chartRefs.current["throughput-trends-chart"] = el)}
                          className="w-full h-[600px] bg-white rounded-lg p-4"
                        >
                          <ChartContainer config={{}} className="h-full w-full">
                            <ResponsiveContainer width="100%" height="100%">
                              <LineChart data={trendData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                <XAxis
                                  dataKey="time"
                                  tick={{ fontSize: 12 }}
                                  height={40}
                                  tickMargin={10}
                                  tickFormatter={(value) => (value % 5 === 0 ? value : "")}
                                />
                                <YAxis tick={{ fontSize: 12 }} width={60} />
                                <Tooltip
                                  contentStyle={{
                                    backgroundColor: "white",
                                    borderColor: "#e2e8f0",
                                    borderRadius: "8px",
                                    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                                    padding: "12px",
                                  }}
                                />
                                <Legend />
                                {getSelectedSimulations().map((sim, index) => (
                                  <Line
                                    key={sim.id}
                                    type="monotone"
                                    dataKey={`${sim.name}_throughput`}
                                    stroke={`hsl(${(index * 60) % 360}, 70%, 50%)`}
                                    strokeWidth={3}
                                    dot={false}
                                    name={sim.name}
                                    activeDot={{ r: 6, strokeWidth: 2 }}
                                  />
                                ))}
                              </LineChart>
                            </ResponsiveContainer>
                          </ChartContainer>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="border-0 shadow-xl bg-gradient-to-br from-orange-50 to-amber-50 overflow-hidden">
                      <CardHeader className="pb-4">
                        <div className="flex justify-between items-center">
                          <CardTitle className="text-lg flex items-center gap-3">
                            <div className="p-2 bg-orange-500 rounded-lg">
                              <Clock className="w-5 h-5 text-white" />
                            </div>
                            Delay Trends Over Time
                          </CardTitle>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => downloadChartImage("delay-trends-chart", "Delay-Trends")}
                            className="flex items-center gap-2"
                          >
                            <Camera className="w-4 h-4" />
                            Download
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent className="p-6">
                        <div
                          ref={(el) => (chartRefs.current["delay-trends-chart"] = el)}
                          className="w-full h-[600px] bg-white rounded-lg p-4"
                        >
                          <ChartContainer config={{}} className="h-full w-full">
                            <ResponsiveContainer width="100%" height="100%">
                              <LineChart data={trendData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                <XAxis
                                  dataKey="time"
                                  tick={{ fontSize: 12 }}
                                  height={40}
                                  tickMargin={10}
                                  tickFormatter={(value) => (value % 5 === 0 ? value : "")}
                                />
                                <YAxis tick={{ fontSize: 12 }} width={60} />
                                <Tooltip
                                  contentStyle={{
                                    backgroundColor: "white",
                                    borderColor: "#e2e8f0",
                                    borderRadius: "8px",
                                    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                                    padding: "12px",
                                  }}
                                />
                                <Legend />
                                {getSelectedSimulations().map((sim, index) => (
                                  <Line
                                    key={sim.id}
                                    type="monotone"
                                    dataKey={`${sim.name}_delay`}
                                    stroke={`hsl(${(index * 60 + 30) % 360}, 70%, 50%)`}
                                    strokeWidth={3}
                                    dot={false}
                                    name={sim.name}
                                    activeDot={{ r: 6, strokeWidth: 2 }}
                                  />
                                ))}
                              </LineChart>
                            </ResponsiveContainer>
                          </ChartContainer>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </div>
    )
  }


  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Simulation Comparison Center
          </h3>
          <p className="text-gray-600 mt-1">
            Select at least 2 simulations to start comparison • Currently selected: {selectedSimulations.length}
          </p>
          {selectedSimulations.length >= 2 && (
            <div className="flex items-center gap-4 mt-2">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-green-600 font-medium">Ready to compare</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">Max selections:</span>
                <select
                  value={maxSelections}
                  onChange={(e) => setMaxSelections(Number(e.target.value))}
                  className="text-sm border border-gray-300 rounded px-2 py-1"
                >
                  <option value={2}>2</option>
                  <option value={3}>3</option>
                  <option value={4}>4</option>
                  <option value={6}>6</option>
                </select>
              </div>
            </div>
          )}
        </div>
        <div className="flex gap-2">
          <Button
            onClick={openComparisonModal}
            disabled={selectedSimulations.length < 2}
            className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:from-blue-600 hover:to-purple-600"
          >
            <BarChart3 className="w-4 h-4" />
            Compare Simulations
          </Button>
          <Button variant="outline" size="sm" onClick={onClearHistory} className="flex items-center gap-1">
            <Trash2 className="w-4 h-4" />
            Clear All
          </Button>
        </div>
      </div>

      {/* Simulation List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {simulationResults.map((sim, index) => {
          const isSelected = selectedSimulations.includes(sim.id)
          const selectionIndex = selectedSimulations.indexOf(sim.id)
          const canSelect = !isSelected && selectedSimulations.length < maxSelections

          return (
            <Card
              key={sim.id}
              className={`cursor-pointer transition-all border-2 relative ${
                isSelected
                  ? "border-blue-500 bg-gradient-to-br from-blue-50 to-indigo-50 shadow-lg"
                  : canSelect
                    ? "border-gray-200 hover:border-blue-300 hover:shadow-md"
                    : "border-gray-200 opacity-50 cursor-not-allowed"
              }`}
              onClick={() => (canSelect || isSelected ? toggleSimulationSelection(sim.id) : null)}
            >
              {isSelected && (
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold shadow-lg">
                  {selectionIndex + 1}
                </div>
              )}
              <CardHeader className="pb-3">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-base flex items-center gap-2">
                    {sim.name}
                    {isSelected && <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>}
                  </CardTitle>
                  <Badge variant="outline" className="text-xs">
                    {new Date(sim.timestamp).toLocaleString()}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="text-gray-600 font-medium">Configuration</div>
                    <div>EVs: {sim.config.numEVs}</div>
                    <div>CS: {sim.config.numChargingStations}</div>
                    <div>Speed: {sim.config.simulationSpeed}ms</div>
                  </div>
                  <div>
                    <div className="text-gray-600 font-medium">Results</div>
                    <div>Throughput: {(sim.finalMetrics.throughput * 60).toFixed(1)}</div>
                    <div>Delay: {(sim.finalMetrics.endToEndDelay / 1000).toFixed(2)}s</div>
                    <div>
                      Success:{" "}
                      {(
                        (sim.finalMetrics.successfulAuthentications /
                          (sim.finalMetrics.successfulAuthentications + sim.finalMetrics.failedAuthentications)) *
                        100
                      ).toFixed(1)}
                      %
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Selection prompts */}
      {selectedSimulations.length === 1 ? (
        <div className="text-center py-12 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border-2 border-dashed border-blue-300">
          <div className="space-y-4">
            <div className="relative">
              <BarChart3 className="w-16 h-16 mx-auto text-blue-400 opacity-60" />
              <div className="absolute -top-2 -right-2 w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                1
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-lg font-semibold text-gray-700">Select One More Simulation</p>
              <p className="text-gray-500">Choose at least one more simulation to start comparison analysis</p>
            </div>
          </div>
        </div>
      ) : simulationResults.length > 0 ? (
        <div className="text-center py-12 bg-gradient-to-br from-gray-50 to-blue-50 rounded-xl border-2 border-dashed border-gray-300">
          <div className="space-y-4">
            <TrendingUp className="w-16 h-16 mx-auto text-gray-400 opacity-60" />
            <div className="space-y-2">
              <p className="text-lg font-semibold text-gray-700">Ready for Comparison</p>
              <p className="text-gray-500">Select at least 2 simulations above to see detailed comparison charts</p>
            </div>
          </div>
        </div>
      ) : null}

      <ComparisonModal />
    </div>
  )
}
