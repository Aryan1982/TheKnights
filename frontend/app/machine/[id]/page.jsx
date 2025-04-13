"use client"

import { useState, useEffect,useRef } from "react"
import { useRouter,useParams } from "next/navigation"
import { ArrowLeft, Calendar, Clock, Settings, PenToolIcon as Tool, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import * as constants from "@/constants"
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
  Scatter,
} from "recharts"

export default function MachinePage() {
  const router = useRouter()
  const params = useParams()
  const { id } = params
  const [Healthdata, sethealthData] =useState()
  const [machine, setMachine] = useState(null)
  const [loading, setLoading] = useState(true)
  const [temperatureData, setTemperatureData] = useState([])
  const { torqueData, rotationalSpeedData } = useRealtimeSensorData();
  const [torqueData2, setTorqueData] = useState([])
  const [rotationalSpeedData2, setRotationalSpeedData] = useState([])
  useEffect(() => {
    // Simulate API fetch
    setTimeout(() => {
      if(id){
        getMachine();
      }
      setLoading(false)
    }, 500)
  }, [id])

  useEffect(() => {
    console.log(machine, 'machine state updated');
  }, [machine]);

  const getMachine = () => {
    fetch(`http://localhost:5001/api/machines/${id}`)
      .then((res) => res.json())
      .then((data) => {
        console.log(data, 'machine');
        setMachine(data);
        getMaintenance(data); // 👈 Pass machine data directly
      })
      .catch((err) => console.error(err));
  };
  
  const getMaintenance = (machineData) => {
    fetch(`http://localhost:5001/api/maintenance/`)
      .then((res) => res.json())
      .then((data) => {
        console.log(data);
        const maintenance = data.find(
          (item) =>
            item.machineId == id
        );
        const updatedMachine = { ...machineData, maintenance };
        setMachine(updatedMachine);
        console.log(machine, 'maintenance');
      })
      .catch((err) => console.error(err));
  };
    const getRealtimeMachineData = () => {
    const socket = new WebSocket('ws://localhost:8080');
  
    socket.onopen = () => {
      console.log('✅ WebSocket connection established');
    };
  
   socket.onmessage = (event) => {
  console.log('📨 Data received:', event.data);

  // Parse the received data into an array
  const dataArray = JSON.parse(event.data);

  // Iterate over each item in the array and extract the necessary value
  setTemperatureData([])
  setTorqueData([])
  setRotationalSpeedData([])
  dataArray.forEach(item => {
    setTemperatureData(prev => [
      ...prev, 
      { 
        time: new Date().toLocaleTimeString(), 
        value: item.air_temperature 
      }
    ]);
    setTorqueData(prev => [
      ...prev, 
      { 
        time: new Date().toLocaleTimeString(), 
        value: item.torque 
      }
    ]);
    setRotationalSpeedData(prev => [
      ...prev, 
      { 
        time: new Date().toLocaleTimeString(), 
        value: item.rotational_speed 
      }
    ]);
  });

  console.log(dataArray, "temperature data"); // Debug log to see all data
};

    socket.onerror = (error) => {
      console.error('❌ WebSocket error:', error);
    };
    
    socket.onclose = () => {
      console.log('🔌 WebSocket connection closed');
    };
  }
  
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
            <h1 className="text-2xl font-bold">{machine.machineName}</h1>
            <div className="flex items-center gap-2 mt-1">
              <div className={`h-2.5 w-2.5 rounded-full ${getStatusColor(machine.status)}`}></div>
              <span className="text-sm text-muted-foreground">{machine.machineId}</span>
              {getStatusBadge(machine.status)}
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => router.push(`/update?id=${machine._id}`)}>
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
          <Button onClick={() => router.push(`/maintenance?machine=${machine._id}`)}>
            <Tool className="h-4 w-4 mr-2" />
            Schedule Maintenance
          </Button>
        </div>
      </div>

    
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="col-span-3">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Machine Health</CardTitle>
          </CardHeader>
          <CardContent>
                      <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={Healthdata.filter((data)=>data.machineId == machine._id)}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="time" />
                            <YAxis domain={[280, 310]} />
                            <Tooltip />
                            {/* Actual Temperature */}
                            {/* <Line
                              type="monotone"
                              dataKey="value"
                              stroke="#3b82f6"
                              strokeWidth={2}
                              name="Actual Health"
                            /> */}
                            {/* Predicted Temperature */}
                            <Line
                              // type="monotone"
                              // dataKey="predicted"
                              // stroke="#10b981"
                              // strokeDasharray="5 5"
                              // strokeWidth={2}
                              name="Predicted Health"
                              dataKey="value"
                              stroke="#3b82f6"
                              strokeWidth={2}
                            />
                            {/* Anomalies */}
                            <Scatter
                              data={Healthdata.filter((d) => d.isAnomaly)}
                              fill="#ef4444"
                              shape="triangle"
                              name="Anomaly"
                            />
                            {/* Crash Prediction */}
                            <Scatter
                              data={Healthdata.filter((d) => d.willCrash)}
                              fill="#f59e0b"
                              shape="star"
                              name="Potential Crash"
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
        </Card>
        {machine.maintenance && (
          <>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Last Maintenance</CardTitle>
            </CardHeader>
            <CardContent>
            <div className="flex items-center">
              <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
              <div className="text-lg font-medium">{machine.maintenance.lastMaintenanceDate && new Date(machine.maintenance.lastMaintenanceDate).toLocaleString()}</div>
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
              <div className="text-lg font-medium">{machine.maintenance?.nextMaintenanceDate &&
    new Date(machine.maintenance.nextMaintenanceDate).toLocaleString()}</div>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {new Date(machine.maintenance.nextMaintenanceDate) < new Date()
                ? "Maintenance overdue"
                : `${Math.ceil((new Date(machine.maintenance.nextMaintenanceDate) - new Date()) / (1000 * 60 * 60 * 24))} days remaining`}
            </p>
          </CardContent>
        </Card>
        </>
        )}
      </div>

      <Tabs defaultValue="performance">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="maintenance">Maintenance History</TabsTrigger>
          <TabsTrigger value="alerts">Alerts</TabsTrigger>
        </TabsList>
        <TabsContent value="performance" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* <Card>
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
                      <YAxis domain={[280, 310]} />
                      <Tooltip />
                      <Line type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card> */}
            <Card>
              <CardHeader>
                <CardTitle>Torque (Nm)</CardTitle>
                <CardDescription>24-hour torque readings</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={torqueData}>
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
            <Card>
              <CardHeader>
                <CardTitle>Rotational Speed (rpm)</CardTitle>
                <CardDescription>24-hour rotational speed readings</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={rotationalSpeedData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="time" />
                      <YAxis domain={[1200, 2000]} />
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
            {/* <Card>
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
            </Card> */}
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
