import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Play, RotateCcw, Settings, Zap, Users, Building2, Timer } from "lucide-react"

interface SimulationControlsProps {
  numEVs: number
  setNumEVs: (value: number) => void
  numChargingStations: number
  setNumChargingStations: (value: number) => void
  simulationSpeed: number
  setSimulationSpeed: (value: number) => void
  isSimulating: boolean
  onStart: () => void
  onReset: () => void
}

export function SimulationControls({
  numEVs,
  setNumEVs,
  numChargingStations,
  setNumChargingStations,
  simulationSpeed,
  setSimulationSpeed,
  isSimulating,
  onStart,
  onReset,
}: SimulationControlsProps) {
  return (
    <Card className="shadow-2xl border-0 bg-white/80 backdrop-blur-sm overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 text-white">
        <CardTitle className="flex items-center gap-3 text-xl">
          <div className="p-2 bg-white/20 rounded-lg">
            <Settings className="w-6 h-6" />
          </div>
          Simulation Control Center
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-3">
                <Users className="w-5 h-5 text-blue-600" />
                <Label htmlFor="num-evs" className="text-gray-700 font-semibold">
                  Electric Vehicles
                </Label>
              </div>
              <div className="relative">
                <Input
                  id="num-evs"
                  type="number"
                  min="1"
                  max="10"
                  value={numEVs}
                  onChange={(e) => setNumEVs(Number.parseInt(e.target.value) || 1)}
                  disabled={isSimulating}
                  className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-300 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 rounded-xl h-12 text-center text-lg font-semibold"
                />
                <div className="absolute -bottom-6 left-0 right-0 text-xs text-gray-500 text-center">1-10 vehicles</div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-3">
                <Building2 className="w-5 h-5 text-green-600" />
                <Label htmlFor="num-cs" className="text-gray-700 font-semibold">
                  Charging Stations
                </Label>
              </div>
              <div className="relative">
                <Input
                  id="num-cs"
                  type="number"
                  min="1"
                  max="5"
                  value={numChargingStations}
                  onChange={(e) => setNumChargingStations(Number.parseInt(e.target.value) || 1)}
                  disabled={isSimulating}
                  className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300 text-gray-900 focus:border-green-500 focus:ring-2 focus:ring-green-200 rounded-xl h-12 text-center text-lg font-semibold"
                />
                <div className="absolute -bottom-6 left-0 right-0 text-xs text-gray-500 text-center">1-5 stations</div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-3">
                <Timer className="w-5 h-5 text-purple-600" />
                <Label className="text-gray-700 font-semibold">Simulation Speed</Label>
              </div>
              <div className="space-y-4">
                <div className="px-4 py-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border-2 border-purple-200">
                  <Slider
                    value={[simulationSpeed]}
                    onValueChange={(value) => setSimulationSpeed(value[0])}
                    min={500}
                    max={3000}
                    step={250}
                    disabled={isSimulating}
                    className="[&_[role=slider]]:bg-gradient-to-r [&_[role=slider]]:from-purple-500 [&_[role=slider]]:to-pink-500 [&_[role=slider]]:border-0 [&_[role=slider]]:w-6 [&_[role=slider]]:h-6 [&_[role=slider]]:shadow-lg"
                  />
                  <div className="text-center mt-2">
                    <span className="text-lg font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                      {simulationSpeed}ms
                    </span>
                    <div className="text-xs text-gray-500">per step</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-3">
                <Zap className="w-5 h-5 text-orange-600" />
                <Label className="text-gray-700 font-semibold">Network Configuration</Label>
              </div>
              <div className="bg-gradient-to-br from-orange-50 to-yellow-50 p-4 rounded-xl border-2 border-orange-200 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Total Nodes:</span>
                  <span className="font-bold text-orange-600">{numEVs + numChargingStations + 1}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Max Connections:</span>
                  <span className="font-bold text-orange-600">{(numEVs + numChargingStations) * 2}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Protocol Steps:</span>
                  <span className="font-bold text-orange-600">
                    {numEVs * 2 + numChargingStations * 2 + Math.min(numEVs, numChargingStations) * 4}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="space-y-4">
              <Label className="text-gray-700 font-semibold flex items-center gap-2">
                <Play className="w-5 h-5 text-green-600" />
                Actions
              </Label>
              <div className="flex flex-col gap-4">
                <Button
                  onClick={onStart}
                  disabled={isSimulating}
                  className="flex items-center gap-3 bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 text-white hover:from-green-600 hover:via-emerald-600 hover:to-teal-600 shadow-xl rounded-xl h-14 text-lg font-semibold transition-all transform hover:scale-105 disabled:opacity-50 disabled:transform-none"
                >
                  <Play className="w-5 h-5" />
                  {isSimulating ? "Running..." : "Start Simulation"}
                </Button>

                <Button
                  onClick={onReset}
                  variant="outline"
                  disabled={isSimulating}
                  className="flex items-center gap-3 bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 hover:from-gray-200 hover:to-gray-300 border-2 border-gray-300 hover:border-gray-400 shadow-lg rounded-xl h-12 font-semibold transition-all transform hover:scale-105 disabled:opacity-50 disabled:transform-none"
                >
                  <RotateCcw className="w-4 h-4" />
                  Reset
                </Button>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
