'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { 
  Users, 
  Plus,
  Search,
  Eye,
  Calendar,
  Mail,
  Phone,
  Edit,
  Trash2,
  Filter
} from 'lucide-react'

interface Patient {
  id: string
  name: string
  email: string
  phone: string
  age: number
  gender: string
  lastVisit: string
  totalScans: number
  status: 'active' | 'inactive'
}

export default function PatientsView() {
  const [patients, setPatients] = useState<Patient[]>([
    {
      id: '1',
      name: 'John Smith',
      email: 'john.smith@email.com',
      phone: '+1 234-567-8900',
      age: 45,
      gender: 'Male',
      lastVisit: '2024-01-15',
      totalScans: 3,
      status: 'active'
    },
    {
      id: '2',
      name: 'Sarah Johnson',
      email: 'sarah.j@email.com',
      phone: '+1 234-567-8901',
      age: 62,
      gender: 'Female',
      lastVisit: '2024-01-10',
      totalScans: 7,
      status: 'active'
    },
    {
      id: '3',
      name: 'Michael Brown',
      email: 'm.brown@email.com',
      phone: '+1 234-567-8902',
      age: 38,
      gender: 'Male',
      lastVisit: '2023-12-20',
      totalScans: 2,
      status: 'inactive'
    }
  ])

  const [searchTerm, setSearchTerm] = useState('')
  const [showAddForm, setShowAddForm] = useState(false)

  const filteredPatients = patients.filter(patient =>
    patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <h1 className="text-4xl font-bold text-white mb-4">
          Patient Management
        </h1>
        <p className="text-lg text-white/80 max-w-2xl mx-auto">
          Manage patient records and track their screening history.
        </p>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid md:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="backdrop-blur-md bg-white/10 border-white/20 text-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white/80">
                Total Patients
              </CardTitle>
              <Users className="w-4 h-4 text-white/60" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{patients.length}</div>
              <p className="text-xs text-white/60 mt-1">
                Registered patients
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="backdrop-blur-md bg-white/10 border-white/20 text-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white/80">
                Active Patients
              </CardTitle>
              <Eye className="w-4 h-4 text-white/60" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {patients.filter(p => p.status === 'active').length}
              </div>
              <p className="text-xs text-white/60 mt-1">
                This month
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="backdrop-blur-md bg-white/10 border-white/20 text-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white/80">
                Total Scans
              </CardTitle>
              <Calendar className="w-4 h-4 text-white/60" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {patients.reduce((sum, p) => sum + p.totalScans, 0)}
              </div>
              <p className="text-xs text-white/60 mt-1">
                All time
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="backdrop-blur-md bg-white/10 border-white/20 text-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white/80">
                Avg Age
              </CardTitle>
              <Users className="w-4 h-4 text-white/60" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {Math.round(patients.reduce((sum, p) => sum + p.age, 0) / patients.length)}
              </div>
              <p className="text-xs text-white/60 mt-1">
                Years
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Search and Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <Card className="backdrop-blur-md bg-white/10 border-white/20 text-white">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/60" />
                <Input
                  placeholder="Search patients..."
                  className="pl-10 bg-white/10 border-white/20 text-white placeholder-white/40"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="flex gap-3">
                <Button 
                  variant="outline" 
                  className="border-white/30 text-white hover:bg-white/10"
                >
                  <Filter className="w-4 h-4 mr-2" />
                  Filter
                </Button>
                <Button 
                  className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white"
                  onClick={() => setShowAddForm(true)}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Patient
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Patients List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <Card className="backdrop-blur-md bg-white/10 border-white/20 text-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Patient Records ({filteredPatients.length})
            </CardTitle>
            <CardDescription className="text-white/60">
              Manage and view patient information
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredPatients.map((patient) => (
                <div key={patient.id} className="p-4 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                        <span className="text-lg font-bold">
                          {patient.name.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">{patient.name}</h3>
                        <div className="flex items-center gap-4 text-sm text-white/60">
                          <span className="flex items-center gap-1">
                            <Mail className="w-3 h-3" />
                            {patient.email}
                          </span>
                          <span className="flex items-center gap-1">
                            <Phone className="w-3 h-3" />
                            {patient.phone}
                          </span>
                          <span>Age: {patient.age}</span>
                          <span>Gender: {patient.gender}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-sm text-white/60">Last Visit</p>
                        <p className="font-medium">{new Date(patient.lastVisit).toLocaleDateString()}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-white/60">Total Scans</p>
                        <p className="font-medium">{patient.totalScans}</p>
                      </div>
                      <Badge className={
                        patient.status === 'active' 
                          ? 'bg-green-500/20 text-green-300 border-green-500/30'
                          : 'bg-gray-500/20 text-gray-300 border-gray-500/30'
                      }>
                        {patient.status}
                      </Badge>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm" className="text-white/60 hover:text-white hover:bg-white/10">
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm" className="text-red-400 hover:text-red-300 hover:bg-red-500/10">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}