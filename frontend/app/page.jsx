"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  Calendar,
  Clock,
  Settings,
  PenToolIcon as Tool,
  Wrench,
  CheckCircle2,
  AlertCircle,
  BarChart3,
  Plus,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  ResponsiveContainer,
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
} from "recharts"

// Sample data
const overviewData = {
  totalMachines: 6,
  operational: 3,
  warning: 1,
  critical: 1,
  maintenance: 1,
  offline: 1,
  upcomingMaintenance: 2,
  overdueMaintenance: 1,
  alerts: 3,
}

const machineHealthData = [
  { name: "CNC Milling Machine", value: 92 },
  { name: "Assembly Robot", value: 78 },
  // { name: "Packaging System", value: 65 },
  // { name: "Conveyor Belt A", value: 88 },
  // { name: "Injection Molding Machine", value: 45 },
  // { name: "Welding Robot", value: 0 },
]

const statusDistributionData = [
  { name: "Operational", value: 3, color: "#10b981" },
  { name: "Warning", value: 1, color: "#f59e0b" },
  { name: "Critical", value: 1, color: "#ef4444" },
  { name: "Maintenance", value: 1, color: "#3b82f6" },
  { name: "Offline", value: 1, color: "#6b7280" },
]

const weeklyAlertsData = [
  { day: "Mon", count: 2 },
  { day: "Tue", count: 1 },
  { day: "Wed", count: 3 },
  { day: "Thu", count: 0 },

  { day: "Fri", count: 2 },
  { day: "Sat", count: 1 },
  { day: "Sun", count: 0 },
]

const monthlyUptimeData = [
  { month: "Jan", uptime: 98.2 },
  { month: "Feb", uptime: 97.8 },
  { month: "Mar", uptime: 99.1 },
  { month: "Apr", uptime: 98.6 },
  { month: "May", uptime: 97.2 },
  { month: "Jun", uptime: 98.9 },
  { month: "Jul", uptime: 99.3 },
  { month: "Aug", uptime: 98.7 },
  { month: "Sep", uptime: 96.5 },
  { month: "Oct", uptime: 97.8 },
  { month: "Nov", uptime: 98.4 },
]

const recentAlerts = [
  {
    id: 1,
    machine: "Assembly Robot",
    message: "Motor temperature above normal",
    timestamp: "2023-11-09 14:45",
    severity: "warning",
  },
  {
    id: 2,
    machine: "Injection Molding Machine",
    message: "Pressure drop detected",
    timestamp: "2023-11-09 10:23",
    severity: "critical",
  },
  {
    id: 3,
    machine: "Assembly Robot",
    message: "Calibration recommended",
    timestamp: "2023-11-08 09:30",
    severity: "warning",
  },
]

const upcomingMaintenance = [
  { id: 1, machine: "Assembly Robot", date: "2023-11-20", type: "Preventive" },
  { id: 2, machine: "Welding Robot", date: "2023-11-25", type: "Preventive" },
]

export default function HomePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simulate data loading
    const timer = setTimeout(() => {
      setLoading(false)
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

  if (loading) {
    return (
      <div className="container mx-auto py-6 flex items-center justify-center min-h-[50vh]">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => router.push("/machines")}>
            <Settings className="h-4 w-4 mr-2" />
            Manage Machines
          </Button>
          <Button onClick={() => router.push("/maintenance")}>
            <Tool className="h-4 w-4 mr-2" />
            View Maintenance
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Machines</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overviewData.totalMachines}</div>
            <div className="flex items-center gap-2 mt-1">
              <div className="h-2.5 w-2.5 rounded-full bg-green-500"></div>
              <span className="text-xs text-muted-foreground">{overviewData.operational} Operational</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Alerts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overviewData.alerts}</div>
            <div className="flex items-center gap-2 mt-1">
              <AlertTriangle className="h-3.5 w-3.5 text-yellow-500" />
              <span className="text-xs text-muted-foreground">
                {overviewData.alerts > 0 ? `${overviewData.alerts} active alerts` : "No active alerts"}
              </span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Upcoming Maintenance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overviewData.upcomingMaintenance}</div>
            <div className="flex items-center gap-2 mt-1">
              <Calendar className="h-3.5 w-3.5 text-blue-500" />
              <span className="text-xs text-muted-foreground">
                Next: {upcomingMaintenance[0]?.date || "None scheduled"}
              </span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Overdue Maintenance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overviewData.overdueMaintenance}</div>
            <div className="flex items-center gap-2 mt-1">
              <Clock className="h-3.5 w-3.5 text-red-500" />
              <span className="text-xs text-muted-foreground">
                {overviewData.overdueMaintenance > 0
                  ? `${overviewData.overdueMaintenance} overdue tasks`
                  : "No overdue tasks"}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="alerts">Alerts & Maintenance</TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Machine Health Overview</CardTitle>
                <CardDescription>Health status of all machines</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {machineHealthData.map((machine) => (
                    <div key={machine.name} className="space-y-1">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Wrench className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm font-medium">{machine.name}</span>
                        </div>
                        <span className="text-sm font-medium">{machine.value}%</span>
                      </div>
                      <Progress
                        value={machine.value}
                        className={`h-2 ${
                          machine.value > 80
                            ? "bg-green-500"
                            : machine.value > 60
                              ? "bg-yellow-500"
                              : machine.value > 40
                                ? "bg-orange-500"
                                : "bg-red-500"
                        }`}
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            {/* <Card>
              <CardHeader>
                <CardTitle>Status Distribution</CardTitle>
                <CardDescription>Machine status breakdown</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[250px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsPieChart>
                      <Pie
                        data={statusDistributionData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {statusDistributionData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </div>
                <div className="grid grid-cols-2 gap-2 mt-4">
                  {statusDistributionData.map((item, index) => (
                    <div key={index} className="flex items-center gap-1.5">
                      <div className="h-3 w-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                      <span className="text-xs">
                        {item.name}: {item.value}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card> */}
          </div>
        </TabsContent>
        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Weekly Alerts</CardTitle>
                <CardDescription>Number of alerts in the past week</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsLineChart data={weeklyAlertsData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="day" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="count" stroke="#ef4444" strokeWidth={2} />
                    </RechartsLineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Monthly Uptime</CardTitle>
                <CardDescription>Average uptime percentage by month</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsLineChart data={monthlyUptimeData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis domain={[95, 100]} />
                      <Tooltip />
                      <Line type="monotone" dataKey="uptime" stroke="#10b981" strokeWidth={2} />
                    </RechartsLineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        <TabsContent value="alerts" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Recent Alerts</CardTitle>
                <CardDescription>Latest system alerts</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentAlerts.map((alert) => (
                    <div key={alert.id} className="flex items-start gap-4 border-b pb-4 last:border-0 last:pb-0">
                      <div
                        className={`p-2 rounded-full ${
                          alert.severity === "critical"
                            ? "bg-red-100 dark:bg-red-900"
                            : "bg-yellow-100 dark:bg-yellow-900"
                        }`}
                      >
                        <AlertTriangle
                          className={`h-5 w-5 ${
                            alert.severity === "critical"
                              ? "text-red-600 dark:text-red-300"
                              : "text-yellow-600 dark:text-yellow-300"
                          }`}
                        />
                      </div>
                      <div>
                        <h4 className="font-medium">{alert.machine}</h4>
                        <p className="text-sm text-muted-foreground">{alert.message}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">{alert.timestamp}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <Button variant="outline" className="w-full mt-4" onClick={() => router.push("/machines")}>
                  View All Alerts
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Upcoming Maintenance</CardTitle>
                <CardDescription>Scheduled maintenance tasks</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {upcomingMaintenance.map((maintenance) => (
                    <div key={maintenance.id} className="flex items-start gap-4 border-b pb-4 last:border-0 last:pb-0">
                      <div className="bg-blue-100 dark:bg-blue-900 p-2 rounded-full">
                        <Tool className="h-5 w-5 text-blue-600 dark:text-blue-300" />
                      </div>
                      <div>
                        <h4 className="font-medium">{maintenance.machine}</h4>
                        <p className="text-sm text-muted-foreground">{maintenance.type} Maintenance</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">{maintenance.date}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                  {upcomingMaintenance.length === 0 && (
                    <div className="text-center py-6">
                      <CheckCircle2 className="h-12 w-12 mx-auto text-green-500 mb-2" />
                      <h3 className="text-lg font-medium">No Upcoming Maintenance</h3>
                      <p className="text-sm text-muted-foreground">All machines are up to date.</p>
                    </div>
                  )}
                </div>
                <Button variant="outline" className="w-full mt-4" onClick={() => router.push("/maintenance")}>
                  View Maintenance Schedule
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
{/* 
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks and shortcuts</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Button variant="outline" className="h-auto py-4 justify-start" onClick={() => router.push("/machines")}>
                <div className="flex flex-col items-start text-left px-2">
                  <div className="flex items-center">
                    <Settings className="h-5 w-5 mr-2" />
                    <span className="font-medium">Manage Machines</span>
                  </div>
                  <span className="text-xs text-muted-foreground mt-1">View and manage all machines</span>
                </div>
              </Button>
              <Button
                variant="outline"
                className="h-auto py-4 justify-start"
                onClick={() => router.push("/add-machine")}
              >
                <div className="flex flex-col items-start text-left px-2">
                  <div className="flex items-center">
                    <Plus className="h-5 w-5 mr-2" />
                    <span className="font-medium">Add New Machine</span>
                  </div>
                  <span className="text-xs text-muted-foreground mt-1">Register a new machine</span>
                </div>
              </Button>
              <Button
                variant="outline"
                className="h-auto py-4 justify-start"
                onClick={() => router.push("/maintenance")}
              >
                <div className="flex flex-col items-start text-left px-2">
                  <div className="flex items-center">
                    <Tool className="h-5 w-5 mr-2" />
                    <span className="font-medium">Maintenance Schedule</span>
                  </div>
                  <span className="text-xs text-muted-foreground mt-1">View and manage maintenance tasks</span>
                </div>
              </Button>
              <Button variant="outline" className="h-auto py-4 justify-start" onClick={() => router.push("/update")}>
                <div className="flex flex-col items-start text-left px-2">
                  <div className="flex items-center">
                    <Calendar className="h-5 w-5 mr-2" />
                    <span className="font-medium">Schedule Maintenance</span>
                  </div>
                  <span className="text-xs text-muted-foreground mt-1">Create a new maintenance task</span>
                </div>
              </Button>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>System Status</CardTitle>
            <CardDescription>Overall system health</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">System Uptime</span>
                  <Badge className="bg-green-500">99.8%</Badge>
                </div>
                <Progress value={99.8} className="h-2 bg-green-500" />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Data Collection</span>
                  <Badge className="bg-green-500">Active</Badge>
                </div>
                <div className="flex items-center gap-2">
                  <Activity className="h-4 w-4 text-green-500" />
                  <span className="text-xs text-muted-foreground">Last update: 2 minutes ago</span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Anomaly Detection</span>
                  <Badge className="bg-green-500">Active</Badge>
                </div>
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-green-500" />
                  <span className="text-xs text-muted-foreground">Monitoring all systems</span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Predictive Models</span>
                  <Badge className="bg-green-500">Active</Badge>
                </div>
                <div className="flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-green-500" />
                  <span className="text-xs text-muted-foreground">Last trained: 3 days ago</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div> */}
    </div>
  )
}
