"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Calendar, Clock, Settings, PenToolIcon as Tool, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts"

// Sample data
const temperatureData = [
  { time: "00:00", value: 72 },
  { time: "04:00", value: 70 },
  { time: "08:00", value: 75 },
  { time: "12:00", value: 82 },
  { time: "16:00", value: 85 },
  { time: "20:00", value: 78 },
  { time: "24:00", value: 74 },
]

const vibrationData = [
  { time: "00:00", value: 0.5 },
  { time: "04:00", value: 0.6 },
  { time: "08:00", value: 1.2 },
  { time: "12:00", value: 0.8 },
  { time: "16:00", value: 0.7 },
  { time: "20:00", value: 1.5 },
  { time: "24:00", value: 0.9 },
]

const maintenanceData = [
  { name: "Completed", value: 8, color: "#10b981" },
  { name: "Scheduled", value: 3, color: "#3b82f6" },
  { name: "Overdue", value: 1, color: "#ef4444" },
]

const COLORS = ["#10b981", "#3b82f6", "#ef4444"]

const machines = {
  "machine-1": {
    id: "machine-1",
    name: "CNC Milling Machine",
    type: "CNC",
    status: "operational",
    health: 92,
    lastMaintenance: "2023-10-15",
    nextMaintenance: "2023-12-15",
    alerts: [{ id: 1, type: "warning", message: "Vibration levels increasing", timestamp: "2023-11-10 08:23" }],
  },
  "machine-2": {
    id: "machine-2",
    name: "Assembly Robot",
    type: "Robot",
    status: "warning",
    health: 78,
    lastMaintenance: "2023-09-20",
    nextMaintenance: "2023-11-20",
    alerts: [
      { id: 1, type: "warning", message: "Motor temperature above normal", timestamp: "2023-11-09 14:45" },
      { id: 2, type: "warning", message: "Calibration recommended", timestamp: "2023-11-08 09:30" },
    ],
  },
}

export default function MachinePage({ params }) {
  const router = useRouter()
  const [machine, setMachine] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simulate API fetch
    setTimeout(() => {
      const machineData = machines[params.id]
      if (machineData) {
        setMachine(machineData)
      }
      setLoading(false)
    }, 500)
  }, [params.id])

  if (loading) {
    return (
      <div className="container mx-auto py-6 flex items-center justify-center min-h-[50vh]">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    )
  }

  if (!machine) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex items-center gap-2 mb-6">
          <Button variant="outline" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold">Machine Not Found</h1>
        </div>
        <Card>
          <CardContent className="py-10 text-center">
            <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-yellow-500" />
            <h2 className="text-xl font-semibold mb-2">Machine not found</h2>
            <p className="text-muted-foreground mb-4">
              The machine you're looking for doesn't exist or has been removed.
            </p>
            <Button onClick={() => router.push("/machines")}>View All Machines</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const getStatusColor = (status) => {
    switch (status) {
      case "operational":
        return "bg-green-500"
      case "warning":
        return "bg-yellow-500"
      case "critical":
        return "bg-red-500"
      case "maintenance":
        return "bg-blue-500"
      case "offline":
        return "bg-gray-500"
      default:
        return "bg-gray-500"
    }
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case "operational":
        return <Badge className="bg-green-500">Operational</Badge>
      case "warning":
        return <Badge className="bg-yellow-500">Warning</Badge>
      case "critical":
        return <Badge className="bg-red-500">Critical</Badge>
      case "maintenance":
        return <Badge className="bg-blue-500">Maintenance</Badge>
      case "offline":
        return <Badge variant="outline">Offline</Badge>
      default:
        return <Badge variant="outline">Unknown</Badge>
    }
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => router.push("/machines")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{machine.name}</h1>
            <div className="flex items-center gap-2 mt-1">
              <div className={`h-2.5 w-2.5 rounded-full ${getStatusColor(machine.status)}`}></div>
              <span className="text-sm text-muted-foreground">{machine.id}</span>
              {getStatusBadge(machine.status)}
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => router.push(`/update?id=${machine.id}`)}>
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
          <Button onClick={() => router.push(`/maintenance?machine=${machine.id}`)}>
            <Tool className="h-4 w-4 mr-2" />
            Schedule Maintenance
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Machine Health</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{machine.health}%</div>
            <Progress value={machine.health} className="h-2 mt-2" />
            <p className="text-xs text-muted-foreground mt-1">
              {machine.health > 90
                ? "Excellent condition"
                : machine.health > 75
                  ? "Good condition"
                  : machine.health > 50
                    ? "Needs attention"
                    : "Critical condition"}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Last Maintenance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
              <div className="text-lg font-medium">{machine.lastMaintenance}</div>
            </div>
            <p className="text-xs text-muted-foreground mt-1">Performed routine maintenance and calibration</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Next Scheduled Maintenance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
              <div className="text-lg font-medium">{machine.nextMaintenance}</div>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {new Date(machine.nextMaintenance) < new Date()
                ? "Maintenance overdue"
                : `${Math.ceil((new Date(machine.nextMaintenance) - new Date()) / (1000 * 60 * 60 * 24))} days remaining`}
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="performance">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="maintenance">Maintenance History</TabsTrigger>
          <TabsTrigger value="alerts">Alerts</TabsTrigger>
        </TabsList>
        <TabsContent value="performance" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Temperature (°F)</CardTitle>
                <CardDescription>24-hour temperature readings</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={temperatureData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="time" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Vibration (mm/s)</CardTitle>
                <CardDescription>24-hour vibration readings</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={vibrationData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="time" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="value" stroke="#10b981" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        <TabsContent value="maintenance">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Maintenance History</CardTitle>
                <CardDescription>Recent maintenance activities</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start gap-4 border-b pb-4">
                    <div className="bg-blue-100 dark:bg-blue-900 p-2 rounded-full">
                      <Tool className="h-5 w-5 text-blue-600 dark:text-blue-300" />
                    </div>
                    <div>
                      <h4 className="font-medium">Routine Maintenance</h4>
                      <p className="text-sm text-muted-foreground">Performed calibration and lubrication</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">{machine.lastMaintenance}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-start gap-4 border-b pb-4">
                    <div className="bg-green-100 dark:bg-green-900 p-2 rounded-full">
                      <Settings className="h-5 w-5 text-green-600 dark:text-green-300" />
                    </div>
                    <div>
                      <h4 className="font-medium">Part Replacement</h4>
                      <p className="text-sm text-muted-foreground">Replaced worn bearings and drive belt</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">2023-08-10</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="bg-yellow-100 dark:bg-yellow-900 p-2 rounded-full">
                      <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-300" />
                    </div>
                    <div>
                      <h4 className="font-medium">Emergency Repair</h4>
                      <p className="text-sm text-muted-foreground">Fixed motor overheating issue</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">2023-07-05</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Maintenance Overview</CardTitle>
                <CardDescription>Last 12 months</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[250px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={maintenanceData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {maintenanceData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="grid grid-cols-3 gap-2 mt-4">
                  {maintenanceData.map((item, index) => (
                    <div key={index} className="flex flex-col items-center">
                      <div className="flex items-center gap-1.5">
                        <div className="h-3 w-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                        <span className="text-xs font-medium">{item.name}</span>
                      </div>
                      <span className="text-lg font-bold">{item.value}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        <TabsContent value="alerts">
          <Card>
            <CardHeader>
              <CardTitle>Recent Alerts</CardTitle>
              <CardDescription>System alerts and warnings</CardDescription>
            </CardHeader>
            <CardContent>
              {machine.alerts && machine.alerts.length > 0 ? (
                <div className="space-y-4">
                  {machine.alerts.map((alert) => (
                    <div key={alert.id} className="flex items-start gap-4 border-b pb-4 last:border-0">
                      <div
                        className={`p-2 rounded-full ${alert.type === "warning" ? "bg-yellow-100 dark:bg-yellow-900" : "bg-red-100 dark:bg-red-900"}`}
                      >
                        <AlertTriangle
                          className={`h-5 w-5 ${alert.type === "warning" ? "text-yellow-600 dark:text-yellow-300" : "text-red-600 dark:text-red-300"}`}
                        />
                      </div>
                      <div>
                        <h4 className="font-medium">{alert.message}</h4>
                        <div className="flex items-center gap-2 mt-1">
                          <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">{alert.timestamp}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6">
                  <div className="mx-auto w-12 h-12 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center mb-4">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6 text-green-600 dark:text-green-300"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium mb-1">No Alerts</h3>
                  <p className="text-sm text-muted-foreground">
                    This machine is operating normally with no active alerts.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
