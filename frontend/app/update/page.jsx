"use client"

import { useState, useEffect } from "react"
import { useRouter,useSearchParams } from "next/navigation"
import { ArrowLeft, Save } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { DatePicker } from "@/components/date-picker"
import { useToast } from "@/components/ui/use-toast"

export default function UpdatePage() {
  const router = useRouter()
  const { toast } = useToast()
  const searchParams = useSearchParams()
  const id = searchParams.get('id')

  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    machineName: "",
    machineId: "",
    machineType: "",
    lastMaintenanceDate: new Date(),
    nextMaintenanceDate: new Date(),
    notes: "",
    status: "operational",
  })
  const [machines, setMachines] = useState([])

  useEffect(() => {
    console.log(id)
    fetchMachines()
    if(id){
      getMaintenanceData()
    }
  }, [])

  const fetchMachines = async () => {
    try {
      const response = await fetch('http://localhost:5001/api/machines')
      const data = await response.json()
      setMachines(data)
    } catch (error) {
      console.error('Error fetching machines:', error)
      toast({
        title: "Error",
        description: "Failed to fetch machine list",
        variant: "destructive"
      })
    }
  }
  const getMaintenanceData = async () => {
    if (!id) return

    setIsLoading(true)
    try {
      const res = await fetch(`http://localhost:5001/api/maintenance/${id}`)
      if (!res.ok) throw new Error('Failed to fetch maintenance data')
      
      const data = await res.json()
      console.log(data)
      handleSelectMachine(data.machineId)
      setFormData({
        machineName: data.machineName || '',
        machineId: data.machineId || '',
        machineType: data.machineType || '',
        lastMaintenanceDate: data.lastMaintenanceDate ? new Date(data.lastMaintenanceDate) : new Date(),
        nextMaintenanceDate: data.nextMaintenanceDate ? new Date(data.nextMaintenanceDate) : new Date(),
        notes: data.notes || '',
        status: data.status || 'operational',
      })
     
    } catch (error) {
      console.error('Error fetching maintenance data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    getMaintenanceData()
  }, [id])

  const handleSelectMachine = (machineId) => {
    const selectedMachine = machines.find(machine => machine._id === machineId)
    console.log(selectedMachine,machines, 'sm')
    if (selectedMachine) {
      setFormData(prev => ({
        ...prev,
        machineId: selectedMachine._id,
        machineName: selectedMachine.machineName,
        machineType: selectedMachine.machineType
      }))
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSelectChange = (name, value) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleDateChange = (name, date) => {
    setFormData((prev) => ({
      ...prev,
      [name]: date,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    if(id){
      try {
        const response = await fetch(`http://localhost:5001/api/maintenance/${id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
        });
      } catch (error) {
        console.error('Error submitting form:', error);
      }
      router.push('/maintenance')
      setIsLoading(false);
      return;
    }
    try {
      const response = await fetch('http://localhost:5001/api/maintenance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
  
      const data = await response.json();
      console.log('Response:', data);
      
      if (response.ok) {
        router.push('/maintenance')
        // Handle success (e.g., show success message, clear form, etc.)
      } else {
        // Handle errors (e.g., show error message)
      }
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold">Update Maintenance Record</h1>
        </div>
      </div>

      <Card>
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle>Machine Information</CardTitle>
            <CardDescription>Update the maintenance details for this machine.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* <div className="space-y-2">
                <Label htmlFor="machineName">Machine Name</Label>
                <Input
                  id="machineName"
                  name="machineName"
                  value={formData.machineName}
                  onChange={handleChange}
                  placeholder="Enter machine name"
                  required
                />
              </div> */}
              <div className="space-y-2">
                <Label htmlFor="machineId">Select Machine</Label>
                <Select onValueChange={handleSelectMachine}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a machine" />
                  </SelectTrigger>
                  <SelectContent>
                    {machines.map(machine => (
                      <SelectItem key={machine._id} value={machine._id}>
                        {machine.machineName} ({machine._id})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {/* <div className="space-y-2">
                <Label htmlFor="machineType">Machine Type</Label>
                <Select
                  value={formData.machineType}
                  onValueChange={(value) => handleSelectChange("machineType", value)}
                >
                  <SelectTrigger id="machineType">
                    <SelectValue placeholder="Select machine type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cnc">CNC Machine</SelectItem>
                    <SelectItem value="assembly">Assembly Line</SelectItem>
                    <SelectItem value="packaging">Packaging Machine</SelectItem>
                    <SelectItem value="robot">Robotic Arm</SelectItem>
                    <SelectItem value="conveyor">Conveyor System</SelectItem>
                  </SelectContent>
                </Select>
              </div> */}
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select value={formData.status} onValueChange={(value) => handleSelectChange("status", value)}>
                  <SelectTrigger id="status">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="operational">Operational</SelectItem>
                    <SelectItem value="maintenance">Under Maintenance</SelectItem>
                    <SelectItem value="warning">Warning</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                    <SelectItem value="offline">Offline</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Last Maintenance Date</Label>
                <DatePicker
                  date={formData.lastMaintenanceDate}
                  setDate={(date) => handleDateChange("lastMaintenanceDate", date)}
                />
              </div>
              <div className="space-y-2">
                <Label>Next Maintenance Date</Label>
                <DatePicker
                  date={formData.nextMaintenanceDate}
                  setDate={(date) => handleDateChange("nextMaintenanceDate", date)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">Maintenance Notes</Label>
              <Textarea
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                placeholder="Enter any notes about the maintenance requirements"
                rows={4}
              />
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" type="button" onClick={() => router.back()}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <span className="flex items-center gap-1">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  Saving...
                </span>
              ) : (
                <span className="flex items-center gap-1">
                  <Save className="h-4 w-4" />
                  Save Changes
                </span>
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
