import { useEffect, useRef } from "react"
import type { NetworkNode, Message } from "@/app/page"

interface NetworkTopologyProps {
  nodes: NetworkNode[]
  messages: Message[]
}

export function NetworkTopology({ nodes, messages }: NetworkTopologyProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return


    const dpr = window.devicePixelRatio || 1
    const rect = canvas.getBoundingClientRect()
    canvas.width = rect.width * dpr
    canvas.height = rect.height * dpr
    ctx.scale(dpr, dpr)

    ctx.clearRect(0, 0, rect.width, rect.height)


    drawGrid(ctx, rect.width, rect.height)


    const scaleFactor = Math.min(rect.width / 800, rect.height / 600)
    const offsetX = (rect.width - 800 * scaleFactor) / 2
    const offsetY = (rect.height - 600 * scaleFactor) / 2

    const uspNode = nodes.find((n) => n.type === "USP")
    if (uspNode) {
      nodes.forEach((node) => {
        if (node.type !== "USP") {
          ctx.beginPath()
          ctx.moveTo(uspNode.position.x * scaleFactor + offsetX, uspNode.position.y * scaleFactor + offsetY)
          ctx.lineTo(node.position.x * scaleFactor + offsetX, node.position.y * scaleFactor + offsetY)
          ctx.strokeStyle = "rgba(100, 116, 139, 0.3)"
          ctx.lineWidth = 1
          ctx.stroke()
        }
      })
    }


    nodes.forEach((node) => {
      const x = node.position.x * scaleFactor + offsetX
      const y = node.position.y * scaleFactor + offsetY

      const glowRadius = node.status === "authenticating" || node.status === "registering" ? 50 : 35
      const glow = ctx.createRadialGradient(x, y, 0, x, y, glowRadius)

      let glowColor1 = "rgba(59, 130, 246, 0.15)"
      let glowColor2 = "rgba(59, 130, 246, 0)"

      if (node.type === "USP") {
        glowColor1 = "rgba(139, 92, 246, 0.2)"
        glowColor2 = "rgba(139, 92, 246, 0)"
      } else if (node.type === "ChargingStation") {
        glowColor1 = "rgba(16, 185, 129, 0.15)"
        glowColor2 = "rgba(16, 185, 129, 0)"
      }

      if (node.status === "authenticating" || node.status === "registering") {
        glowColor1 = "rgba(245, 158, 11, 0.3)"
        glowColor2 = "rgba(245, 158, 11, 0)"
      } else if (node.status === "authenticated") {
        glowColor1 = "rgba(16, 185, 129, 0.25)"
        glowColor2 = "rgba(16, 185, 129, 0)"
      }

      glow.addColorStop(0, glowColor1)
      glow.addColorStop(1, glowColor2)

      ctx.beginPath()
      ctx.arc(x, y, glowRadius, 0, 2 * Math.PI)
      ctx.fillStyle = glow
      ctx.fill()


      ctx.save()

      if (node.type === "EV") {

        drawCarIcon(ctx, x, y, node.status)
      } else if (node.type === "USP") {

        drawUSPIcon(ctx, x, y, node.status)
      } else if (node.type === "ChargingStation") {

        drawChargingStationIcon(ctx, x, y, node.status)
      }

      ctx.restore()


      const labelY = y + 45
      const labelWidth = ctx.measureText(node.id).width + 16

      const labelGradient = ctx.createLinearGradient(x - labelWidth / 2, labelY - 10, x + labelWidth / 2, labelY + 10)
      labelGradient.addColorStop(0, "rgba(15, 23, 42, 0.9)")
      labelGradient.addColorStop(1, "rgba(30, 41, 59, 0.9)")

      ctx.fillStyle = labelGradient
      ctx.beginPath()
      ctx.roundRect(x - labelWidth / 2, labelY - 10, labelWidth, 20, 10)
      ctx.fill()

    
      ctx.strokeStyle = "rgba(59, 130, 246, 0.5)"
      ctx.lineWidth = 1
      ctx.stroke()

  
      ctx.fillStyle = "#f8fafc"
      ctx.font = "bold 12px 'Inter', sans-serif"
      ctx.textAlign = "center"
      ctx.fillText(node.id, x, labelY + 4)

      if (node.status !== "idle") {
        const statusX = x + 25
        const statusY = y - 25

        const statusGlow = ctx.createRadialGradient(statusX, statusY, 0, statusX, statusY, 12)
        const statusColor =
          node.status === "registering"
            ? "#f59e0b"
            : node.status === "authenticating"
              ? "#3b82f6"
              : node.status === "authenticated"
                ? "#10b981"
                : "#ef4444"

        statusGlow.addColorStop(0, statusColor + "80")
        statusGlow.addColorStop(1, statusColor + "00")

        ctx.beginPath()
        ctx.arc(statusX, statusY, 12, 0, 2 * Math.PI)
        ctx.fillStyle = statusGlow
        ctx.fill()

        // Status indicator
        ctx.beginPath()
        ctx.arc(statusX, statusY, 8, 0, 2 * Math.PI)
        ctx.fillStyle = statusColor
        ctx.fill()
        ctx.strokeStyle = "#ffffff"
        ctx.lineWidth = 2
        ctx.stroke()

      
        if (node.status === "authenticating" || node.status === "registering") {
          const pulseRadius = 8 + Math.sin(Date.now() * 0.005) * 3
          ctx.beginPath()
          ctx.arc(statusX, statusY, pulseRadius, 0, 2 * Math.PI)
          ctx.strokeStyle = statusColor + "60"
          ctx.lineWidth = 2
          ctx.stroke()
        }
      }
    })


    function drawCarIcon(ctx: CanvasRenderingContext2D, x: number, y: number, status: string) {
      const colors = {
        idle: { body: "#1e40af", accent: "#3b82f6", wheel: "#1f2937" },
        registering: { body: "#d97706", accent: "#f59e0b", wheel: "#1f2937" },
        authenticating: { body: "#dc2626", accent: "#ef4444", wheel: "#1f2937" },
        authenticated: { body: "#059669", accent: "#10b981", wheel: "#1f2937" },
        charging: { body: "#7c3aed", accent: "#8b5cf6", wheel: "#1f2937" },
      }

      const color = colors[status as keyof typeof colors] || colors.idle

      ctx.shadowColor = "rgba(0, 0, 0, 0.3)"
      ctx.shadowBlur = 8
      ctx.shadowOffsetY = 4

    
      ctx.fillStyle = color.body
      ctx.beginPath()
      ctx.roundRect(x - 20, y - 12, 40, 24, 8)
      ctx.fill()

     
      ctx.fillStyle = color.accent
      ctx.beginPath()
      ctx.roundRect(x - 15, y - 18, 30, 12, 6)
      ctx.fill()

    
      ctx.shadowColor = "transparent"

    
      ctx.fillStyle = color.wheel
      ctx.beginPath()
      ctx.arc(x - 12, y + 8, 6, 0, 2 * Math.PI)
      ctx.fill()
      ctx.beginPath()
      ctx.arc(x + 12, y + 8, 6, 0, 2 * Math.PI)
      ctx.fill()

    
      ctx.fillStyle = "#6b7280"
      ctx.beginPath()
      ctx.arc(x - 12, y + 8, 3, 0, 2 * Math.PI)
      ctx.fill()
      ctx.beginPath()
      ctx.arc(x + 12, y + 8, 3, 0, 2 * Math.PI)
      ctx.fill()

      
      ctx.fillStyle = "rgba(59, 130, 246, 0.3)"
      ctx.beginPath()
      ctx.roundRect(x - 12, y - 16, 24, 8, 4)
      ctx.fill()

      
      ctx.fillStyle = "#fbbf24"
      ctx.beginPath()
      ctx.arc(x + 18, y - 4, 3, 0, 2 * Math.PI)
      ctx.fill()
      ctx.beginPath()
      ctx.arc(x + 18, y + 4, 3, 0, 2 * Math.PI)
      ctx.fill()
    }

    function drawUSPIcon(ctx: CanvasRenderingContext2D, x: number, y: number, status: string) {
      const colors = {
        idle: { body: "#6d28d9", accent: "#8b5cf6", light: "#a78bfa" },
        registering: { body: "#d97706", accent: "#f59e0b", light: "#fbbf24" },
        authenticating: { body: "#dc2626", accent: "#ef4444", light: "#f87171" },
        authenticated: { body: "#059669", accent: "#10b981", light: "#34d399" },
      }

      const color = colors[status as keyof typeof colors] || colors.idle

      ctx.shadowColor = "rgba(0, 0, 0, 0.4)"
      ctx.shadowBlur = 10
      ctx.shadowOffsetY = 5

     
      ctx.fillStyle = color.body
      ctx.beginPath()
      ctx.roundRect(x - 18, y - 25, 36, 50, 6)
      ctx.fill()

  
      ctx.shadowColor = "transparent"

   
      for (let i = 0; i < 3; i++) {
        const panelY = y - 18 + i * 14
        ctx.fillStyle = color.accent
        ctx.beginPath()
        ctx.roundRect(x - 14, panelY, 28, 10, 3)
        ctx.fill()

    
        for (let j = 0; j < 3; j++) {
          ctx.fillStyle = color.light
          ctx.beginPath()
          ctx.arc(x - 8 + j * 8, panelY + 5, 2, 0, 2 * Math.PI)
          ctx.fill()
        }
      }

    
      ctx.strokeStyle = color.accent
      ctx.lineWidth = 3
      ctx.beginPath()
      ctx.moveTo(x, y - 25)
      ctx.lineTo(x, y - 35)
      ctx.stroke()

      
      ctx.fillStyle = color.light
      ctx.beginPath()
      ctx.arc(x, y - 35, 3, 0, 2 * Math.PI)
      ctx.fill()

     
      if (status === "authenticating" || status === "registering") {
        ctx.strokeStyle = color.light + "60"
        ctx.lineWidth = 2
        for (let i = 1; i <= 3; i++) {
          ctx.beginPath()
          ctx.arc(x, y - 35, i * 8, 0, 2 * Math.PI)
          ctx.stroke()
        }
      }
    }

    
    function drawChargingStationIcon(ctx: CanvasRenderingContext2D, x: number, y: number, status: string) {
      const colors = {
        idle: { body: "#047857", accent: "#10b981", cable: "#374151", plug: "#6b7280" },
        registering: { body: "#d97706", accent: "#f59e0b", cable: "#374151", plug: "#6b7280" },
        authenticating: { body: "#dc2626", accent: "#ef4444", cable: "#374151", plug: "#6b7280" },
        authenticated: { body: "#059669", accent: "#10b981", cable: "#374151", plug: "#6b7280" },
        charging: { body: "#7c3aed", accent: "#8b5cf6", cable: "#374151", plug: "#fbbf24" },
      }

      const color = colors[status as keyof typeof colors] || colors.idle

   
      ctx.shadowColor = "rgba(0, 0, 0, 0.3)"
      ctx.shadowBlur = 8
      ctx.shadowOffsetY = 4

    
      ctx.fillStyle = color.body
      ctx.beginPath()
      ctx.roundRect(x - 15, y - 20, 30, 40, 8)
      ctx.fill()


      ctx.shadowColor = "transparent"

    
      ctx.fillStyle = "#1f2937"
      ctx.beginPath()
      ctx.roundRect(x - 10, y - 15, 20, 15, 4)
      ctx.fill()

   
      ctx.fillStyle = color.accent
      ctx.font = "bold 8px sans-serif"
      ctx.textAlign = "center"
      ctx.fillText("⚡", x, y - 6)


      ctx.fillStyle = "#374151"
      ctx.beginPath()
      ctx.roundRect(x - 8, y + 5, 16, 8, 4)
      ctx.fill()

    
      ctx.strokeStyle = color.cable
      ctx.lineWidth = 4
      ctx.lineCap = "round"
      ctx.beginPath()
      ctx.moveTo(x, y + 13)
      ctx.quadraticCurveTo(x + 15, y + 20, x + 10, y + 30)
      ctx.stroke()

   
      ctx.fillStyle = color.plug
      ctx.beginPath()
      ctx.roundRect(x + 8, y + 28, 8, 6, 3)
      ctx.fill()

     
      ctx.fillStyle = status === "charging" ? "#10b981" : status === "authenticated" ? "#3b82f6" : "#6b7280"
      ctx.beginPath()
      ctx.arc(x + 8, y - 12, 3, 0, 2 * Math.PI)
      ctx.fill()

      if (status === "charging") {
        const time = Date.now() * 0.01
        for (let i = 0; i < 3; i++) {
          const alpha = Math.sin(time + i * 0.5) * 0.5 + 0.5
          ctx.fillStyle = `rgba(16, 185, 129, ${alpha})`
          ctx.beginPath()
          ctx.arc(x - 5 + i * 5, y - 5, 2, 0, 2 * Math.PI)
          ctx.fill()
        }
      }
    }


    const recentMessages = messages.slice(-5)
    recentMessages.forEach((message, index) => {
      const fromNode = nodes.find((n) => n.id === message.from)
      const toNode = nodes.find((n) => n.id === message.to)

      if (fromNode && toNode) {
        const opacity = 1 - index * 0.15
        const fromX = fromNode.position.x * scaleFactor + offsetX
        const fromY = fromNode.position.y * scaleFactor + offsetY
        const toX = toNode.position.x * scaleFactor + offsetX
        const toY = toNode.position.y * scaleFactor + offsetY

   
        const messageAge = Date.now() - message.timestamp
        const animationDuration = 1000 // 1 second animation
        const progress = Math.min(1, messageAge / animationDuration)

     
        const gradient = ctx.createLinearGradient(fromX, fromY, toX, toY)
        gradient.addColorStop(0, `rgba(59, 130, 246, ${opacity * 0.2})`)
        gradient.addColorStop(1, `rgba(59, 130, 246, ${opacity * 0.8})`)

        ctx.beginPath()
        ctx.moveTo(fromX, fromY)
        ctx.lineTo(toX, toY)
        ctx.strokeStyle = gradient
        ctx.lineWidth = 2
        ctx.stroke()

 
        if (progress < 1) {
          const packetX = fromX + (toX - fromX) * progress
          const packetY = fromY + (toY - fromY) * progress

  
          const packetGlow = ctx.createRadialGradient(packetX, packetY, 0, packetX, packetY, 15)
          packetGlow.addColorStop(0, "rgba(59, 130, 246, 0.8)")
          packetGlow.addColorStop(1, "rgba(59, 130, 246, 0)")

          ctx.beginPath()
          ctx.arc(packetX, packetY, 15, 0, 2 * Math.PI)
          ctx.fillStyle = packetGlow
          ctx.fill()

    
          ctx.beginPath()
          ctx.arc(packetX, packetY, 5, 0, 2 * Math.PI)
          ctx.fillStyle = "#3b82f6"
          ctx.fill()
          ctx.strokeStyle = "#bfdbfe"
          ctx.lineWidth = 1
          ctx.stroke()
        }

    
        const angle = Math.atan2(toY - fromY, toX - fromX)
        const arrowLength = 10

        ctx.beginPath()
        ctx.moveTo(toX - 25 * Math.cos(angle) * scaleFactor, toY - 25 * Math.sin(angle) * scaleFactor)
        ctx.lineTo(
          toX - 25 * Math.cos(angle) * scaleFactor - arrowLength * Math.cos(angle - Math.PI / 6),
          toY - 25 * Math.sin(angle) * scaleFactor - arrowLength * Math.sin(angle - Math.PI / 6),
        )
        ctx.moveTo(toX - 25 * Math.cos(angle) * scaleFactor, toY - 25 * Math.sin(angle) * scaleFactor)
        ctx.lineTo(
          toX - 25 * Math.cos(angle) * scaleFactor - arrowLength * Math.cos(angle + Math.PI / 6),
          toY - 25 * Math.sin(angle) * scaleFactor - arrowLength * Math.sin(angle + Math.PI / 6),
        )
        ctx.strokeStyle = `rgba(59, 130, 246, ${opacity})`
        ctx.lineWidth = 2
        ctx.stroke()
      }
    })

    
    if (messages.length > 0) {
      requestAnimationFrame(() => {
   
        const canvas = canvasRef.current
        if (canvas) {

        }
      })
    }
  }, [nodes, messages])


  const drawGrid = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    const gridSize = 30
    ctx.strokeStyle = "rgba(59, 130, 246, 0.1)"
    ctx.lineWidth = 0.5

    
    for (let x = 0; x <= width; x += gridSize) {
      ctx.beginPath()
      ctx.moveTo(x, 0)
      ctx.lineTo(x, height)
      ctx.stroke()
    }

    
    for (let y = 0; y <= height; y += gridSize) {
      ctx.beginPath()
      ctx.moveTo(0, y)
      ctx.lineTo(width, y)
      ctx.stroke()
    }
  }

  return (
    <div className="relative">
      <canvas ref={canvasRef} className="w-full h-[600px] rounded-lg bg-white border-2 border-blue-200 shadow-lg" />
      <div className="absolute top-4 right-4 space-y-2 text-xs bg-white/95 p-4 rounded-xl border border-blue-200 shadow-xl backdrop-blur-sm">
        <div className="text-blue-800 font-bold mb-3 text-sm">Network Legend</div>
        <div className="flex items-center gap-3">
          <div className="w-6 h-4 bg-gradient-to-r from-blue-600 to-blue-700 rounded border border-blue-500"></div>
          <span className="text-blue-700 font-medium">Electric Vehicle</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-6 h-4 bg-gradient-to-r from-purple-600 to-purple-700 rounded border border-purple-500"></div>
          <span className="text-purple-700 font-medium">USP Server</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-6 h-4 bg-gradient-to-r from-green-600 to-green-700 rounded border border-green-500"></div>
          <span className="text-green-700 font-medium">Charging Station</span>
        </div>
        <div className="pt-3 mt-3 border-t border-blue-200">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-3 h-3 rounded-full bg-amber-500 animate-pulse"></div>
            <span className="text-amber-700 font-medium">Processing</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <span className="text-green-700 font-medium">Authenticated</span>
          </div>
        </div>
      </div>
    </div>
  )
}
