'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { 
  History, 
  Search,
  Filter,
  Download,
  Eye,
  Calendar,
  User,
  Brain,
  AlertCircle,
  CheckCircle,
  FileText
} from 'lucide-react'

interface DetectionRecord {
  id: string
  patientName: string
  diseaseType: string
  result: string
  confidence: number
  date: string
  duration: string
  status: 'normal' | 'warning' | 'alert'
  imageUrl?: string
}

export default function HistoryView() {
  const [records, setRecords] = useState<DetectionRecord[]>([
    {
      id: '1',
      patientName: 'John Smith',
      diseaseType: 'Glaucoma Detection',
      result: 'No signs of glaucoma detected',
      confidence: 96.8,
      date: '2024-01-15T10:30:00',
      duration: '2.3s',
      status: 'normal'
    },
    {
      id: '2',
      patientName: 'Sarah Johnson',
      diseaseType: 'Diabetic Retinopathy',
      result: 'Mild retinal changes detected',
      confidence: 87.2,
      date: '2024-01-15T09:15:00',
      duration: '3.1s',
      status: 'warning'
    },
    {
      id: '3',
      patientName: 'Michael Brown',
      diseaseType: 'Cataract Analysis',
      result: 'Early stage cataract detected',
      confidence: 92.5,
      date: '2024-01-14T16:45:00',
      duration: '1.8s',
      status: 'alert'
    },
    {
      id: '4',
      patientName: 'Emily Davis',
      diseaseType: 'Glaucoma Detection',
      result: 'Normal retinal structure',
      confidence: 94.1,
      date: '2024-01-14T14:20:00',
      duration: '2.7s',
      status: 'normal'
    }
  ])

  const [searchTerm, setSearchTerm] = useState('')
  const [selectedFilter, setSelectedFilter] = useState('all')

  const filteredRecords = records.filter(record => {
    const matchesSearch = record.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         record.diseaseType.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesFilter = selectedFilter === 'all' || record.status === selectedFilter
    
    return matchesSearch && matchesFilter
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'normal':
        return 'bg-green-500/20 text-green-300 border-green-500/30'
      case 'warning':
        return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30'
      case 'alert':
        return 'bg-red-500/20 text-red-300 border-red-500/30'
      default:
        return 'bg-gray-500/20 text-gray-300 border-gray-500/30'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'normal':
        return <CheckCircle className="w-4 h-4" />
      case 'warning':
        return <AlertCircle className="w-4 h-4" />
      case 'alert':
        return <AlertCircle className="w-4 h-4" />
      default:
        return <FileText className="w-4 h-4" />
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <h1 className="text-4xl font-bold text-white mb-4">
          Detection History
        </h1>
        <p className="text-lg text-white/80 max-w-2xl mx-auto">
          View and analyze past detection results and patient screening history.
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
                Total Scans
              </CardTitle>
              <History className="w-4 h-4 text-white/60" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{records.length}</div>
              <p className="text-xs text-white/60 mt-1">
                All time
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
                Normal Results
              </CardTitle>
              <CheckCircle className="w-4 h-4 text-white/60" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {records.filter(r => r.status === 'normal').length}
              </div>
              <p className="text-xs text-white/60 mt-1">
                {((records.filter(r => r.status === 'normal').length / records.length) * 100).toFixed(1)}%
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
                Warnings
              </CardTitle>
              <AlertCircle className="w-4 h-4 text-white/60" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {records.filter(r => r.status === 'warning').length}
              </div>
              <p className="text-xs text-white/60 mt-1">
                Need attention
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
                Avg Confidence
              </CardTitle>
              <Brain className="w-4 h-4 text-white/60" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {(records.reduce((sum, r) => sum + r.confidence, 0) / records.length).toFixed(1)}%
              </div>
              <p className="text-xs text-white/60 mt-1">
                AI accuracy
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Search and Filters */}
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
                  placeholder="Search by patient name or disease type..."
                  className="pl-10 bg-white/10 border-white/20 text-white placeholder-white/40"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="flex gap-3">
                <div className="flex gap-2">
                  {['all', 'normal', 'warning', 'alert'].map((filter) => (
                    <Button
                      key={filter}
                      variant={selectedFilter === filter ? "default" : "outline"}
                      size="sm"
                      className={
                        selectedFilter === filter
                          ? 'bg-white/20 text-white border-white/30'
                          : 'border-white/30 text-white/80 hover:bg-white/10'
                      }
                      onClick={() => setSelectedFilter(filter)}
                    >
                      {filter.charAt(0).toUpperCase() + filter.slice(1)}
                    </Button>
                  ))}
                </div>
                <Button 
                  variant="outline" 
                  className="border-white/30 text-white hover:bg-white/10"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Records List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <Card className="backdrop-blur-md bg-white/10 border-white/20 text-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <History className="w-5 h-5" />
              Detection Records ({filteredRecords.length})
            </CardTitle>
            <CardDescription className="text-white/60">
              Historical detection results and analysis
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredRecords.map((record) => (
                <div key={record.id} className="p-4 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${getStatusColor(record.status)}`}>
                        {getStatusIcon(record.status)}
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">{record.patientName}</h3>
                        <p className="text-sm text-white/60">{record.diseaseType}</p>
                        <p className="text-sm text-white/80 mt-1">{record.result}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-center">
                        <p className="text-sm text-white/60">Confidence</p>
                        <p className="font-semibold">{record.confidence}%</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-white/60">Duration</p>
                        <p className="font-semibold">{record.duration}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-white/60">Date</p>
                        <p className="font-semibold">{new Date(record.date).toLocaleDateString()}</p>
                      </div>
                      <Badge className={getStatusColor(record.status)}>
                        {record.status}
                      </Badge>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm" className="text-white/60 hover:text-white hover:bg-white/10">
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm" className="text-white/60 hover:text-white hover:bg-white/10">
                          <Download className="w-4 h-4" />
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