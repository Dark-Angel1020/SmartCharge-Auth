"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Clock, Shield, Activity, Zap, Lock, TrendingUp, CheckCircle, AlertTriangle } from "lucide-react"
import type { SimulationMetrics } from "@/app/page"

interface PerformanceMetricsProps {
  metrics: SimulationMetrics
}

export function PerformanceMetrics({ metrics }: PerformanceMetricsProps) {
  const formatDelay = (delay: number) => {
    return `${(delay / 1000).toFixed(2)}s`
  }

  const formatThroughput = (throughput: number) => {
    return `${(throughput * 60).toFixed(1)} auth/min`
  }

  return (
    <div className="space-y-6">
      <Card className="shadow-2xl border-0 bg-white/80 backdrop-blur-sm overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 text-white">
          <CardTitle className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-lg">
              <Activity className="w-6 h-6" />
            </div>
            Performance Metrics
          </CardTitle>
          <CardDescription className="text-blue-100">Key performance indicators for the network</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 p-6">
          <div className="grid grid-cols-1 gap-6">
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-2xl border-2 border-blue-200 shadow-lg">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl shadow-lg">
                  <Zap className="w-6 h-6 text-white" />
                </div>
                <div>
                  <span className="text-lg font-bold text-blue-700">Throughput</span>
                  <div className="text-sm text-blue-600">Authentications per minute</div>
                </div>
              </div>
              <div className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">
                {formatThroughput(metrics.throughput)}
              </div>
              <Progress
                value={Math.min(100, (metrics.throughput * 60) / 10)}
                className="h-3 bg-blue-200 rounded-full"
                indicatorClassName="bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full"
              />
            </div>

            <div className="bg-gradient-to-br from-orange-50 to-red-50 p-6 rounded-2xl border-2 border-orange-200 shadow-lg">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl shadow-lg">
                  <Clock className="w-6 h-6 text-white" />
                </div>
                <div>
                  <span className="text-lg font-bold text-orange-700">End-to-End Delay</span>
                  <div className="text-sm text-orange-600">Protocol execution time</div>
                </div>
              </div>
              <div className="text-4xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent mb-2">
                {formatDelay(metrics.endToEndDelay)}
              </div>
              <Progress
                value={Math.min(100, metrics.endToEndDelay / 100)}
                className="h-3 bg-orange-200 rounded-full"
                indicatorClassName="bg-gradient-to-r from-orange-500 to-red-500 rounded-full"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-4 rounded-xl border border-green-200 shadow-md">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="text-sm font-medium text-green-700">Successful</span>
                </div>
                <span className="text-2xl font-bold text-green-600">{metrics.successfulAuthentications}</span>
              </div>
            </div>

            <div className="bg-gradient-to-br from-red-50 to-pink-50 p-4 rounded-xl border border-red-200 shadow-md">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                  <span className="text-sm font-medium text-red-700">Failed</span>
                </div>
                <span className="text-2xl font-bold text-red-600">{metrics.failedAuthentications}</span>
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-indigo-50 p-4 rounded-xl border border-purple-200 shadow-md">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-purple-600" />
                  <span className="text-sm font-medium text-purple-700">Total Messages</span>
                </div>
                <span className="text-2xl font-bold text-purple-600">{metrics.totalMessages}</span>
              </div>
            </div>

            <div className="bg-gradient-to-br from-cyan-50 to-blue-50 p-4 rounded-xl border border-cyan-200 shadow-md">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-cyan-600" />
                  <span className="text-sm font-medium text-cyan-700">Avg Processing</span>
                </div>
                <span className="text-lg font-bold text-cyan-600">{formatDelay(metrics.averageProcessingTime)}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-2xl border-0 bg-white/80 backdrop-blur-sm overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 text-white">
          <CardTitle className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-lg">
              <Shield className="w-6 h-6" />
            </div>
            Security Metrics
          </CardTitle>
          <CardDescription className="text-emerald-100">Cryptographic protocol security indicators</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 p-6">
          <div className="space-y-6">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-700 font-medium flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-green-600" />
                  Authentication Success Rate
                </span>
                <span className="text-lg font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                  {metrics.totalMessages > 0
                    ? (
                        (metrics.successfulAuthentications /
                          (metrics.successfulAuthentications + metrics.failedAuthentications)) *
                        100
                      ).toFixed(1)
                    : 0}
                  %
                </span>
              </div>
              <div className="relative">
                <Progress
                  value={
                    metrics.totalMessages > 0
                      ? (metrics.successfulAuthentications /
                          (metrics.successfulAuthentications + metrics.failedAuthentications)) *
                        100
                      : 0
                  }
                  className="h-4 bg-gray-200 rounded-full"
                />
                <div
                  className="absolute inset-0 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full transition-all duration-500"
                  style={{
                    width: `${
                      metrics.totalMessages > 0
                        ? (
                            metrics.successfulAuthentications /
                              (metrics.successfulAuthentications + metrics.failedAuthentications)
                          ) * 100
                        : 0
                    }%`,
                  }}
                ></div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-700 font-medium flex items-center gap-2">
                  <Lock className="w-4 h-4 text-blue-600" />
                  Message Encryption Rate
                </span>
                <span className="text-lg font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  100%
                </span>
              </div>
              <div className="relative">
                <Progress value={100} className="h-4 bg-gray-200 rounded-full" />
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full"></div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-700 font-medium flex items-center gap-2">
                  <Shield className="w-4 h-4 text-purple-600" />
                  PUFF Challenge Success
                </span>
                <span className="text-lg font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  {metrics.successfulAuthentications > 0 ? "100%" : "0%"}
                </span>
              </div>
              <div className="relative">
                <Progress
                  value={metrics.successfulAuthentications > 0 ? 100 : 0}
                  className="h-4 bg-gray-200 rounded-full"
                />
                <div
                  className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-500"
                  style={{ width: `${metrics.successfulAuthentications > 0 ? 100 : 0}%` }}
                ></div>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-gray-200">
            <div className="grid grid-cols-2 gap-6 text-sm">
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-xl border border-blue-200">
                <div className="font-semibold text-blue-700 mb-1">Protocol Version</div>
                <div className="text-blue-600">EV-USP-CS v1.0</div>
              </div>
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-4 rounded-xl border border-purple-200">
                <div className="font-semibold text-purple-700 mb-1">Encryption</div>
                <div className="text-purple-600">AES-256 + PUFF</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
