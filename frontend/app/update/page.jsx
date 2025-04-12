"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
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

  const handleSubmit = (e) => {
    e.preventDefault()
    setIsLoading(true)

    // Simulate API call
    setTimeout(() => {
      setIsLoading(false)
      toast({
        title: "Maintenance record updated",
        description: `Updated maintenance schedule for ${formData.machineName}`,
      })
      router.push("/maintenance")
    }, 1500)
  }

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
              <div className="space-y-2">
                <Label htmlFor="machineName">Machine Name</Label>
                <Input
                  id="machineName"
                  name="machineName"
                  value={formData.machineName}
                  onChange={handleChange}
                  placeholder="Enter machine name"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="machineId">Machine ID</Label>
                <Input
                  id="machineId"
                  name="machineId"
                  value={formData.machineId}
                  onChange={handleChange}
                  placeholder="Enter machine ID"
                  required
                />
              </div>
              <div className="space-y-2">
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
              </div>
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
