"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Plus, Search, Filter, ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
} from "recharts";

const Healthdata = [
  // Machine 1: 67fb5966858e726dd728b1e4
  { time: "01:00", machineId: "67fb5966858e726dd728b1e4", value: 298, predicted: 299, isAnomaly: false, willCrash: false },
  { time: "02:00", machineId: "67fb5966858e726dd728b1e4", value: 300, predicted: 298, isAnomaly: false, willCrash: false },
  { time: "03:00", machineId: "67fb5966858e726dd728b1e4", value: 310, predicted: 305, isAnomaly: true, willCrash: false },
  { time: "04:00", machineId: "67fb5966858e726dd728b1e4", value: 290, predicted: 295, isAnomaly: false, willCrash: false },
  { time: "05:00", machineId: "67fb5966858e726dd728b1e4", value: 320, predicted: 310, isAnomaly: true, willCrash: true },
  { time: "06:00", machineId: "67fb5966858e726dd728b1e4", value: 295, predicted: 297, isAnomaly: false, willCrash: false },
  { time: "07:00", machineId: "67fb5966858e726dd728b1e4", value: 305, predicted: 306, isAnomaly: false, willCrash: false },
  { time: "08:00", machineId: "67fb5966858e726dd728b1e4", value: 299, predicted: 299, isAnomaly: false, willCrash: false },
  { time: "09:00", machineId: "67fb5966858e726dd728b1e4", value: 312, predicted: 310, isAnomaly: false, willCrash: false },
  { time: "10:00", machineId: "67fb5966858e726dd728b1e4", value: 330, predicted: 315, isAnomaly: true, willCrash: true },

  // Machine 2: 67fb5998858e726dd728b219
  { time: "01:00", machineId: "67fb5998858e726dd728b219", value: 305, predicted: 301, isAnomaly: true, willCrash: true },
  { time: "02:00", machineId: "67fb5998858e726dd728b219", value: 308, predicted: 300, isAnomaly: true, willCrash: true },
  { time: "03:00", machineId: "67fb5998858e726dd728b219", value: 290, predicted: 295, isAnomaly: false, willCrash: false },
  { time: "04:00", machineId: "67fb5998858e726dd728b219", value: 295, predicted: 294, isAnomaly: false, willCrash: false },
  { time: "05:00", machineId: "67fb5998858e726dd728b219", value: 320, predicted: 310, isAnomaly: true, willCrash: false },
  { time: "06:00", machineId: "67fb5998858e726dd728b219", value: 300, predicted: 300, isAnomaly: false, willCrash: false },
  { time: "07:00", machineId: "67fb5998858e726dd728b219", value: 310, predicted: 309, isAnomaly: false, willCrash: false },
  { time: "08:00", machineId: "67fb5998858e726dd728b219", value: 330, predicted: 315, isAnomaly: true, willCrash: true },
  { time: "09:00", machineId: "67fb5998858e726dd728b219", value: 285, predicted: 290, isAnomaly: false, willCrash: false },
  { time: "10:00", machineId: "67fb5998858e726dd728b219", value: 345, predicted: 325, isAnomaly: true, willCrash: true },

  // Machine 3: 67fb59f5858e726dd728b277
  { time: "01:00", machineId: "67fb59f5858e726dd728b277", value: 302, predicted: 303, isAnomaly: false, willCrash: false },
  { time: "02:00", machineId: "67fb59f5858e726dd728b277", value: 305, predicted: 301, isAnomaly: true, willCrash: true },
  { time: "03:00", machineId: "67fb59f5858e726dd728b277", value: 290, predicted: 295, isAnomaly: false, willCrash: false },
  { time: "04:00", machineId: "67fb59f5858e726dd728b277", value: 275, predicted: 280, isAnomaly: false, willCrash: false },
  { time: "05:00", machineId: "67fb59f5858e726dd728b277", value: 315, predicted: 310, isAnomaly: false, willCrash: false },
  { time: "06:00", machineId: "67fb59f5858e726dd728b277", value: 330, predicted: 315, isAnomaly: true, willCrash: true },
  { time: "07:00", machineId: "67fb59f5858e726dd728b277", value: 300, predicted: 298, isAnomaly: false, willCrash: false },
  { time: "08:00", machineId: "67fb59f5858e726dd728b277", value: 310, predicted: 305, isAnomaly: false, willCrash: false },
  { time: "09:00", machineId: "67fb59f5858e726dd728b277", value: 320, predicted: 310, isAnomaly: true, willCrash: false },
  { time: "10:00", machineId: "67fb59f5858e726dd728b277", value: 340, predicted: 320, isAnomaly: true, willCrash: true },
];


// Sample data
// const machines = [
//   {
//     id: "machine-1",
//     name: "CNC Milling Machine",
//     type: "CNC",
//     status: "operational",
//     health: 92,
//     lastMaintenance: "2023-10-15",
//     nextMaintenance: "2023-12-15",
//   },
//   {
//     id: "machine-2",
//     name: "Assembly Robot",
//     type: "Robot",
//     status: "warning",
//     health: 78,
//     lastMaintenance: "2023-09-20",
//     nextMaintenance: "2023-11-20",
//   },
// {
//   id: "machine-3",
//   name: "Packaging System",
//   type: "Packaging",
//   status: "maintenance",
//   health: 65,
//   lastMaintenance: "2023-11-05",
//   nextMaintenance: "2024-01-05",
// },
// {
//   id: "machine-4",
//   name: "Conveyor Belt A",
//   type: "Conveyor",
//   status: "operational",
//   health: 88,
//   lastMaintenance: "2023-10-10",
//   nextMaintenance: "2023-12-10",
// },
// {
//   id: "machine-5",
//   name: "Injection Molding Machine",
//   type: "Molding",
//   status: "critical",
//   health: 45,
//   lastMaintenance: "2023-08-15",
//   nextMaintenance: "2023-10-15",
// },
// {
//   id: "machine-6",
//   name: "Welding Robot",
//   type: "Robot",
//   status: "offline",
//   health: 0,
//   lastMaintenance: "2023-09-01",
//   nextMaintenance: "2023-11-01",
// },
// ]

export default function MachinesPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [machines, setMachines] = useState([]);

  useEffect(() => {
    fetch("http://localhost:5001/api/machines")
      .then((res) => res.json())
      .then((data) => {
        setMachines(data);
        console.log(data);
      })
      .catch((err) => console.error(err));
  }, []);

  const filteredMachines = machines.filter((machine) => {
    const matchesSearch =
      machine.machineName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      machine.machineId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || machine.status === statusFilter;
    const matchesType = typeFilter === "all" || machine.type === typeFilter;

    return matchesSearch && matchesStatus && matchesType;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case "operational":
        return "bg-green-500";
      case "warning":
        return "bg-yellow-500";
      case "critical":
        return "bg-red-500";
      case "maintenance":
        return "bg-blue-500";
      case "offline":
        return "bg-gray-500";
      default:
        return "bg-gray-500";
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "operational":
        return <Badge className="bg-green-500">Operational</Badge>;
      case "warning":
        return <Badge className="bg-yellow-500">Warning</Badge>;
      case "critical":
        return <Badge className="bg-red-500">Critical</Badge>;
      case "maintenance":
        return <Badge className="bg-blue-500">Maintenance</Badge>;
      case "offline":
        return <Badge variant="outline">Offline</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const getHealthColor = (health) => {
    if (health > 80) return "bg-green-500";
    if (health > 60) return "bg-yellow-500";
    if (health > 40) return "bg-orange-500";
    return "bg-red-500";
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">Machines</h1>
        <Button onClick={() => router.push("/add-machine")}>
          <Plus className="h-4 w-4 mr-2" />
          Add Machine
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search machines..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="w-full sm:w-auto">
              <Filter className="h-4 w-4 mr-2" />
              Status
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Filter by Status</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => setStatusFilter("all")}>
              All
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setStatusFilter("operational")}>
              Operational
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setStatusFilter("warning")}>
              Warning
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setStatusFilter("critical")}>
              Critical
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setStatusFilter("maintenance")}>
              Maintenance
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setStatusFilter("offline")}>
              Offline
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="w-full sm:w-auto">
              <ArrowUpDown className="h-4 w-4 mr-2" />
              Type
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Filter by Type</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => setTypeFilter("all")}>
              All Types
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTypeFilter("CNC")}>
              CNC
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTypeFilter("Robot")}>
              Robot
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTypeFilter("Packaging")}>
              Packaging
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTypeFilter("Conveyor")}>
              Conveyor
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTypeFilter("Molding")}>
              Molding
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredMachines.map((machine) => (
          <Card
            key={machine.id}
            className="cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => router.push(`/machine/${machine.id}`)}
          >
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className={`h-2.5 w-2.5 rounded-full ${getStatusColor(
                      machine.status
                    )}`}
                  ></div>
                  <CardTitle>{machine.machineName}</CardTitle>
                </div>
                {getStatusBadge(machine.status)}
              </div>
              <CardDescription>{machine.machineType}</CardDescription>
            </CardHeader>
            <Card>
              <CardHeader>
                <CardTitle>Health</CardTitle>
                <CardDescription>
                  24-hour machine health monitoring with anomaly detection and
                  maintenance risk prediction.
                </CardDescription>
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

            <CardContent className="pb-2">
              <div className="space-y-4">
                {/* <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium">Health</span>
                    <span className="text-sm font-medium">
                      {machine.health}%
                    </span>
                  </div>
                  <Progress
                    value={machine.health}
                    className={`h-2 ${getHealthColor(machine.health)}`}
                  />
                </div> */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Last Maintenance
                    </p>
                    <p className="font-medium">{machine.lastMaintenance}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Next Maintenance
                    </p>
                    <p className="font-medium">{machine.nextMaintenance}</p>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button
                variant="ghost"
                className="w-full"
                onClick={(e) => {
                  e.stopPropagation();
                  router.push(`/machine/${machine._id}`);
                }}
              >
                View Details
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      {filteredMachines.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-10">
            <div className="rounded-full bg-muted p-3 mb-4">
              <Search className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium mb-1">No machines found</h3>
            <p className="text-sm text-muted-foreground text-center mb-4">
              No machines match your current search and filter criteria.
            </p>
            <Button
              variant="outline"
              onClick={() => {
                setSearchTerm("");
                setStatusFilter("all");
                setTypeFilter("all");
              }}
            >
              Clear Filters
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
