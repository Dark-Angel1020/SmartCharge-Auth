import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ChartContainer } from "@/components/ui/chart"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  AreaChart,
  Area,
  Tooltip,
  Legend,
} from "recharts"
import { TrendingUp, Clock, Activity, Wifi, Download, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"

interface MetricsHistoryPoint {
  timestamp: number
  throughput: number
  endToEndDelay: number
  networkUtilization: number
  successRate: number
}

interface RealTimeChartsProps {
  metricsHistory: MetricsHistoryPoint[]
}

export function RealTimeCharts({ metricsHistory }: RealTimeChartsProps) {
  const [activeTab, setActiveTab] = useState("throughput")
  const { toast } = useToast()

  // Format timestamp for display
  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp)
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })
  }

  // Prepare data for charts
  const chartData = metricsHistory.map((point, index) => ({
    time: formatTime(point.timestamp),
    timeIndex: index,
    throughput: Number.parseFloat(point.throughput.toFixed(2)),
    delay: Number.parseFloat(point.endToEndDelay.toFixed(2)),
    utilization: Number.parseFloat(point.networkUtilization.toFixed(1)),
    successRate: Number.parseFloat(point.successRate.toFixed(1)),
  }))

  // Export chart data as CSV
  const exportCSV = () => {
    if (chartData.length === 0) {
      toast({
        title: "No data to export",
        description: "Run the simulation first to generate data",
        variant: "destructive",
      })
      return
    }

    // Create CSV content
    const headers = ["Time", "Throughput (auth/min)", "Delay (s)", "Network Utilization (%)", "Success Rate (%)"]
    const csvContent = [
      headers.join(","),
      ...chartData.map((d) => [d.time, d.throughput, d.delay, d.utilization, d.successRate].join(",")),
    ].join("\n")

    // Create and download file
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.setAttribute("href", url)
    link.setAttribute("download", `ev-network-metrics-${new Date().toISOString().slice(0, 10)}.csv`)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    toast({
      title: "📊 Data exported successfully",
      description: "CSV file downloaded to your device",
      variant: "success",
    })
  }

  if (chartData.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl border-2 border-dashed border-blue-300">
        <div className="text-center space-y-4">
          <div className="relative">
            <TrendingUp className="w-16 h-16 mx-auto text-blue-400 opacity-60" />
            <Sparkles className="w-6 h-6 absolute -top-2 -right-2 text-purple-400 animate-pulse" />
          </div>
          <div className="space-y-2">
            <p className="text-lg font-semibold text-gray-700">Ready for Analytics</p>
            <p className="text-gray-500">Start the simulation to see beautiful real-time performance trends</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="space-y-2">
          <h3 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Real-Time Performance Trends
          </h3>
          <p className="text-gray-600">Monitoring key metrics during protocol execution</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white border-0 hover:from-blue-600 hover:to-purple-600 shadow-lg"
          onClick={exportCSV}
        >
          <Download className="w-4 h-4" />
          Export Data
        </Button>
      </div>

      <Tabs defaultValue="throughput" className="space-y-6" onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3 bg-gradient-to-r from-blue-100 to-purple-100 p-1 rounded-xl shadow-lg">
          <TabsTrigger
            value="throughput"
            className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-lg data-[state=active]:text-blue-600 rounded-lg font-medium transition-all"
          >
            <Activity className="w-4 h-4" />
            Throughput
          </TabsTrigger>
          <TabsTrigger
            value="delay"
            className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-lg data-[state=active]:text-orange-600 rounded-lg font-medium transition-all"
          >
            <Clock className="w-4 h-4" />
            Delay
          </TabsTrigger>
          <TabsTrigger
            value="utilization"
            className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-lg data-[state=active]:text-purple-600 rounded-lg font-medium transition-all"
          >
            <Wifi className="w-4 h-4" />
            Network Metrics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="throughput" className="space-y-4 mt-0">
          <Card className="border-0 shadow-xl bg-gradient-to-br from-blue-50 to-indigo-50 overflow-hidden">
            <CardContent className="p-6">
              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-500 rounded-lg">
                    <Activity className="w-5 h-5 text-white" />
                  </div>
                  <h4 className="text-lg font-bold text-gray-800">Authentication Throughput Over Time</h4>
                </div>
                <p className="text-gray-600">Number of successful authentications per minute</p>
              </div>
              <ChartContainer config={{}} className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="throughputGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                        <stop offset="50%" stopColor="#6366f1" stopOpacity={0.6} />
                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.1} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis
                      dataKey="time"
                      tick={{ fontSize: 12, fill: "#64748b" }}
                      interval="preserveStartEnd"
                      stroke="#64748b"
                    />
                    <YAxis tick={{ fontSize: 12, fill: "#64748b" }} stroke="#64748b" domain={[0, "auto"]} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "white",
                        borderColor: "#e2e8f0",
                        borderRadius: "12px",
                        boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
                      }}
                      itemStyle={{ color: "#3b82f6", fontWeight: "600" }}
                    />
                    <Legend />
                    <Area
                      type="monotone"
                      dataKey="throughput"
                      name="Throughput (auth/min)"
                      stroke="#3b82f6"
                      fill="url(#throughputGradient)"
                      strokeWidth={3}
                      activeDot={{ r: 8, stroke: "#3b82f6", strokeWidth: 3, fill: "#bfdbfe" }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="delay" className="space-y-4 mt-0">
          <Card className="border-0 shadow-xl bg-gradient-to-br from-orange-50 to-red-50 overflow-hidden">
            <CardContent className="p-6">
              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-orange-500 rounded-lg">
                    <Clock className="w-5 h-5 text-white" />
                  </div>
                  <h4 className="text-lg font-bold text-gray-800">End-to-End Delay Trends</h4>
                </div>
                <p className="text-gray-600">Average time for complete protocol execution</p>
              </div>
              <ChartContainer config={{}} className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis
                      dataKey="time"
                      tick={{ fontSize: 12, fill: "#64748b" }}
                      interval="preserveStartEnd"
                      stroke="#64748b"
                    />
                    <YAxis tick={{ fontSize: 12, fill: "#64748b" }} stroke="#64748b" domain={[0, "auto"]} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "white",
                        borderColor: "#e2e8f0",
                        borderRadius: "12px",
                        boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
                      }}
                      itemStyle={{ color: "#f59e0b", fontWeight: "600" }}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="delay"
                      name="End-to-End Delay (s)"
                      stroke="#f59e0b"
                      strokeWidth={4}
                      dot={{ fill: "#f59e0b", strokeWidth: 3, r: 5 }}
                      activeDot={{ r: 8, stroke: "#f59e0b", strokeWidth: 3, fill: "#fed7aa" }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="utilization" className="space-y-4 mt-0">
          <Card className="border-0 shadow-xl bg-gradient-to-br from-purple-50 to-pink-50 overflow-hidden">
            <CardContent className="p-6">
              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-500 rounded-lg">
                    <Wifi className="w-5 h-5 text-white" />
                  </div>
                  <h4 className="text-lg font-bold text-gray-800">Network Utilization & Success Rate</h4>
                </div>
                <p className="text-gray-600">Network load and authentication success percentage</p>
              </div>
              <ChartContainer config={{}} className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis
                      dataKey="time"
                      tick={{ fontSize: 12, fill: "#64748b" }}
                      interval="preserveStartEnd"
                      stroke="#64748b"
                    />
                    <YAxis tick={{ fontSize: 12, fill: "#64748b" }} domain={[0, 100]} stroke="#64748b" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "white",
                        borderColor: "#e2e8f0",
                        borderRadius: "12px",
                        boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
                      }}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="utilization"
                      stroke="#8b5cf6"
                      strokeWidth={3}
                      dot={{ fill: "#8b5cf6", strokeWidth: 2, r: 4 }}
                      name="Network Utilization (%)"
                    />
                    <Line
                      type="monotone"
                      dataKey="successRate"
                      stroke="#10b981"
                      strokeWidth={3}
                      dot={{ fill: "#10b981", strokeWidth: 2, r: 4 }}
                      name="Success Rate (%)"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Card className="border-0 shadow-xl bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50 overflow-hidden">
        <CardContent className="p-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-xl shadow-lg border border-blue-200">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg">
                  <Activity className="w-4 h-4 text-white" />
                </div>
                <div className="font-semibold text-blue-700">Throughput</div>
              </div>
              <div className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent">
                {chartData[chartData.length - 1]?.throughput.toFixed(1)}
              </div>
              <div className="text-sm text-blue-500">auth/min</div>
            </div>

            <div className="bg-white p-4 rounded-xl shadow-lg border border-orange-200">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg">
                  <Clock className="w-4 h-4 text-white" />
                </div>
                <div className="font-semibold text-orange-700">Delay</div>
              </div>
              <div className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-orange-700 bg-clip-text text-transparent">
                {chartData[chartData.length - 1]?.delay.toFixed(2)}
              </div>
              <div className="text-sm text-orange-500">seconds</div>
            </div>

            <div className="bg-white p-4 rounded-xl shadow-lg border border-purple-200">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg">
                  <Wifi className="w-4 h-4 text-white" />
                </div>
                <div className="font-semibold text-purple-700">Network Load</div>
              </div>
              <div className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-purple-700 bg-clip-text text-transparent">
                {chartData[chartData.length - 1]?.utilization.toFixed(1)}
              </div>
              <div className="text-sm text-purple-500">percent</div>
            </div>

            <div className="bg-white p-4 rounded-xl shadow-lg border border-green-200">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-gradient-to-r from-green-500 to-green-600 rounded-lg">
                  <TrendingUp className="w-4 h-4 text-white" />
                </div>
                <div className="font-semibold text-green-700">Success Rate</div>
              </div>
              <div className="text-2xl font-bold bg-gradient-to-r from-green-600 to-green-700 bg-clip-text text-transparent">
                {chartData[chartData.length - 1]?.successRate.toFixed(1)}
              </div>
              <div className="text-sm text-green-500">percent</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
