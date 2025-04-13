"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Calendar, Clock, Filter, Plus, Search, ArrowUpDown, Check, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useToast } from "@/components/ui/use-toast"

// Sample data
const maintenanceRecord = [
  {
    id: "maint-1",
    machineId: "machine-1",
    machineName: "CNC Milling Machine",
    type: "Routine",
    status: "completed",
    lastMaintenance: "2025-04-01",
    nextMaintenance: "2025-05-01",
    assignedTo: "John Smith",
    notes: "Performed calibration and lubrication",
  },
  
  {
    id: "maint-6",
    machineId: "machine-6",
    machineName: "Welding Robot",
    type: "Preventive",
    status: "scheduled",
    lastMaintenance: "2025-04-10",
    nextMaintenance: "2025-05-10",
    assignedTo: "David Miller",
    notes: "Calibration and software update",
  },
  // {
  //   id: "maint-2",
  //   machineId: "machine-2",
  //   machineName: "Assembly Robot",
  //   type: "Preventive",
  //   status: "scheduled",
  //   lastMaintenance: "2023-09-20",
  //   nextMaintenance: "2023-11-20",
  //   assignedTo: "Sarah Johnson",
  //   notes: "Check motor and replace worn parts",
  // },
  // {
  //   id: "maint-3",
  //   machineId: "machine-3",
  //   machineName: "Packaging System",
  //   type: "Emergency",
  //   status: "in-progress",
  //   lastMaintenance: "2023-11-05",
  //   nextMaintenance: "2024-01-05",
  //   assignedTo: "Mike Chen",
  //   notes: "Fixing conveyor belt issue",
  // },
  // {
  //   id: "maint-4",
  //   machineId: "machine-4",
  //   machineName: "Conveyor Belt A",
  //   type: "Routine",
  //   status: "overdue",
  //   lastMaintenance: "2023-10-10",
  //   nextMaintenance: "2023-11-10",
  //   assignedTo: "Unassigned",
  //   notes: "Regular inspection and belt tension check",
  // },
  // {
  //   id: "maint-5",
  //   machineId: "machine-5",
  //   machineName: "Injection Molding Machine",
  //   type: "Corrective",
  //   status: "completed",
  //   lastMaintenance: "2023-10-25",
  //   nextMaintenance: "2023-12-25",
  //   assignedTo: "Lisa Wong",
  //   notes: "Fixed hydraulic system leak",
  // },
]

export default function MaintenancePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const machineFilter = searchParams.get("machine")

  const [maintenanceRecords, setMaintenanceRecords] = useState([]);
  
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState(machineFilter ? "all" : "all")
  const [typeFilter, setTypeFilter] = useState("all")

  // const filteredRecords = maintenanceRecords.filter((record) => {
  //   const matchesSearch =
  //     record.machineName.toLowerCase().includes(searchTerm.toLowerCase()) ||
  //     record.machineId.toLowerCase().includes(searchTerm.toLowerCase()) ||
  //     record.assignedTo.toLowerCase().includes(searchTerm.toLowerCase())
  //   const matchesStatus = statusFilter === "all" || record.status === statusFilter
  //   const matchesType = typeFilter === "all" || record.type === typeFilter
  //   const matchesMachine = !machineFilter || record.machineId === machineFilter

  //   return matchesSearch && matchesStatus && matchesType && matchesMachine
  // })

  const getStatusBadge = (status) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-green-500">Completed</Badge>
      case "scheduled":
        return <Badge className="bg-blue-500">Scheduled</Badge>
      case "in-progress":
        return <Badge className="bg-yellow-500">In Progress</Badge>
      case "overdue":
        return <Badge className="bg-red-500">Overdue</Badge>
      default:
        return <Badge variant="outline">Unknown</Badge>
    }
  }

  useEffect(()=>{
    getMaintenanceSchedules()
  },[])
  const handleComplete = (id) => {
    toast({
      title: "Maintenance Completed",
      description: "The maintenance record has been marked as completed.",
    })
  }

  const handleCancel = (id) => {
    toast({
      title: "Maintenance Cancelled",
      description: "The maintenance record has been cancelled.",
    })
  }

  const getMaintenanceSchedules = async () => {
    try {
      const response = await fetch('http://localhost:5001/api/maintenance');
  
      if (!response.ok) {
        throw new Error('Failed to fetch maintenance schedules');
      }
  
      const data = await response.json();
      console.log('Fetched schedules:', data);
  
      setMaintenanceRecords(data)
  
    } catch (error) {
      console.error('Error fetching maintenance schedules:', error);
    }
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">Maintenance Schedule</h1>
        <Button onClick={() => router.push("/update")}>
          <Plus className="h-4 w-4 mr-2" />
          Schedule Maintenance
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by machine or technician..."
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
            <DropdownMenuItem onClick={() => setStatusFilter("all")}>All</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setStatusFilter("completed")}>Completed</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setStatusFilter("scheduled")}>Scheduled</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setStatusFilter("in-progress")}>In Progress</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setStatusFilter("overdue")}>Overdue</DropdownMenuItem>
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
            <DropdownMenuItem onClick={() => setTypeFilter("all")}>All Types</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTypeFilter("Routine")}>Routine</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTypeFilter("Preventive")}>Preventive</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTypeFilter("Corrective")}>Corrective</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTypeFilter("Emergency")}>Emergency</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <Card>
        <CardHeader className="pb-1 mb-3">
          <CardTitle>Maintenance Records</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Machine</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="hidden md:table-cell">Last Maintenance</TableHead>
                  <TableHead>Next Maintenance</TableHead>
                  {/* <TableHead className="hidden md:table-cell">Assigned To</TableHead> */}
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {maintenanceRecords?.map((record) => (
                  <TableRow
                    key={record.id}
                    className="cursor-pointer"
                    onClick={() => router.push(`/update?id=${record.id}`)}
                  >
                    <TableCell className="font-medium">{record.machineName}</TableCell>
                    <TableCell>{record.machineType}</TableCell>
                    <TableCell>{record.status}</TableCell>
                    <TableCell className="hidden md:table-cell">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                        {record.lastMaintenanceDate && new Date(record.lastMaintenanceDate).toLocaleDateString('en-GB')}

                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                        {record.nextMaintenanceDate && new Date(record.nextMaintenanceDate).toLocaleDateString('en-GB')}
                      </div>
                    </TableCell>
                    {/* <TableCell className="hidden md:table-cell">{record.assignedTo}</TableCell> */}
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        {(record.status === "scheduled" ||
                          record.status === "in-progress" ||
                          record.status === "overdue") && (
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleComplete(record.id)
                            }}
                          >
                            <Check className="h-4 w-4 text-green-500" />
                            <span className="sr-only">Complete</span>
                          </Button>
                        )}
                        {record.status === "scheduled" && (
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleCancel(record.id)
                            }}
                          >
                            <X className="h-4 w-4 text-red-500" />
                            <span className="sr-only">Cancel</span>
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8"
                          onClick={(e) => {
                            e.stopPropagation()
                            router.push(`/update?id=${record._id}`)
                          }}
                        >
                          Edit
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {maintenanceRecords.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center">
                      No maintenance records found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
