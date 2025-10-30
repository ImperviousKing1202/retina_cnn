'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  FileText, 
  Download,
  Calendar,
  TrendingUp,
  Users,
  Brain,
  Eye,
  Filter,
  Search,
  BarChart3,
  PieChart
} from 'lucide-react'
import { RetinaLogo } from '@/components/retina-logo'

interface ReportData {
  totalDetections: number
  accuracyRate: number
  patientCount: number
  diseaseBreakdown: { [key: string]: number }
  monthlyTrends: { month: string; detections: number }[]
}

export default function ReportsView() {
  const [selectedPeriod, setSelectedPeriod] = useState('month')
  const [reportType, setReportType] = useState('comprehensive')

  const reportData: ReportData = {
    totalDetections: 1284,
    accuracyRate: 94.2,
    patientCount: 847,
    diseaseBreakdown: {
      'Glaucoma': 425,
      'Diabetic Retinopathy': 380,
      'Cataract': 289,
      'Normal': 190
    },
    monthlyTrends: [
      { month: 'Jan', detections: 98 },
      { month: 'Feb', detections: 124 },
      { month: 'Mar', detections: 156 },
      { month: 'Apr', detections: 189 },
      { month: 'May', detections: 234 },
      { month: 'Jun', detections: 287 }
    ]
  }

  const generateReport = () => {
    // Simulate report generation
    const reportContent = {
      title: 'RETINA Detection Report',
      period: selectedPeriod,
      generatedAt: new Date().toISOString(),
      data: reportData
    }
    
    const blob = new Blob([JSON.stringify(reportContent, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `retina-report-${selectedPeriod}-${Date.now()}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <div className="flex justify-center mb-4">
          <RetinaLogo size="lg" showText={false} variant="light" />
        </div>
        <h1 className="text-4xl font-bold text-white mb-4">
          Analytics & Reports
        </h1>
        <p className="text-lg text-white/80 max-w-2xl mx-auto">
          Generate comprehensive reports and analyze detection trends.
        </p>
      </motion.div>

      {/* Report Controls */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="backdrop-blur-md bg-white/10 border-white/20 text-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Report Configuration
            </CardTitle>
            <CardDescription className="text-white/60">
              Customize your report parameters
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-3">Report Period</label>
                <div className="flex gap-2">
                  {['week', 'month', 'quarter', 'year'].map((period) => (
                    <Button
                      key={period}
                      variant={selectedPeriod === period ? "default" : "outline"}
                      size="sm"
                      className={
                        selectedPeriod === period
                          ? 'bg-white/20 text-white border-white/30'
                          : 'border-white/30 text-white/80 hover:bg-white/10'
                      }
                      onClick={() => setSelectedPeriod(period)}
                    >
                      {period.charAt(0).toUpperCase() + period.slice(1)}
                    </Button>
                  ))}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-3">Report Type</label>
                <div className="flex gap-2">
                  {['comprehensive', 'summary', 'detailed'].map((type) => (
                    <Button
                      key={type}
                      variant={reportType === type ? "default" : "outline"}
                      size="sm"
                      className={
                        reportType === type
                          ? 'bg-white/20 text-white border-white/30'
                          : 'border-white/30 text-white/80 hover:bg-white/10'
                      }
                      onClick={() => setReportType(type)}
                    >
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </Button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <Button 
                className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white"
                onClick={generateReport}
              >
                <Download className="w-4 h-4 mr-2" />
                Generate Report
              </Button>
              <Button 
                variant="outline" 
                className="border-white/30 text-white hover:bg-white/10"
              >
                <BarChart3 className="w-4 h-4 mr-2" />
                View Charts
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Key Metrics */}
      <div className="grid md:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="backdrop-blur-md bg-white/10 border-white/20 text-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white/80">
                Total Detections
              </CardTitle>
              <Eye className="w-4 h-4 text-white/60" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{reportData.totalDetections}</div>
              <p className="text-xs text-white/60 mt-1">
                <TrendingUp className="w-3 h-3 inline mr-1 text-green-400" />
                +12% from last period
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
                Accuracy Rate
              </CardTitle>
              <Brain className="w-4 h-4 text-white/60" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{reportData.accuracyRate}%</div>
              <p className="text-xs text-white/60 mt-1">
                <TrendingUp className="w-3 h-3 inline mr-1 text-green-400" />
                +2.1% improvement
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
                Active Patients
              </CardTitle>
              <Users className="w-4 h-4 text-white/60" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{reportData.patientCount}</div>
              <p className="text-xs text-white/60 mt-1">
                <TrendingUp className="w-3 h-3 inline mr-1 text-green-400" />
                +5% new patients
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="backdrop-blur-md bg-white/10 border-white/20 text-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white/80">
                Avg Processing
              </CardTitle>
              <Calendar className="w-4 h-4 text-white/60" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">2.4s</div>
              <p className="text-xs text-white/60 mt-1">
                Per detection
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Charts Section */}
      <div className="grid lg:grid-cols-2 gap-8">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card className="backdrop-blur-md bg-white/10 border-white/20 text-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChart className="w-5 h-5" />
                Disease Distribution
              </CardTitle>
              <CardDescription className="text-white/60">
                Breakdown of detected conditions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(reportData.diseaseBreakdown).map(([disease, count]) => (
                  <div key={disease} className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full bg-gradient-to-r from-teal-500 to-green-500"></div>
                      <span className="font-medium">{disease}</span>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{count}</p>
                      <p className="text-xs text-white/60">
                        {((count / reportData.totalDetections) * 100).toFixed(1)}%
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.7 }}
        >
          <Card className="backdrop-blur-md bg-white/10 border-white/20 text-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Monthly Trends
              </CardTitle>
              <CardDescription className="text-white/60">
                Detection volume over time
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {reportData.monthlyTrends.map((trend, index) => (
                  <div key={trend.month} className="flex items-center gap-4">
                    <span className="w-12 text-sm font-medium">{trend.month}</span>
                    <div className="flex-1 bg-white/10 rounded-full h-6 relative overflow-hidden">
                      <div 
                        className="absolute left-0 top-0 h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-end pr-2"
                        style={{ width: `${(trend.detections / 300) * 100}%` }}
                      >
                        <span className="text-xs text-white font-medium">{trend.detections}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Recent Reports */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
      >
        <Card className="backdrop-blur-md bg-white/10 border-white/20 text-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Recent Reports
            </CardTitle>
            <CardDescription className="text-white/60">
              Previously generated reports
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { name: 'Monthly Report - January', date: '2024-01-31', size: '2.4 MB' },
                { name: 'Quarterly Analysis - Q4 2023', date: '2024-01-01', size: '5.1 MB' },
                { name: 'Annual Summary 2023', date: '2023-12-31', size: '8.7 MB' }
              ].map((report, index) => (
                <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
                  <div className="flex items-center gap-3">
                    <FileText className="w-5 h-5 text-white/60" />
                    <div>
                      <p className="font-medium">{report.name}</p>
                      <p className="text-sm text-white/60">{report.date} • {report.size}</p>
                    </div>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-white/60 hover:text-white hover:bg-white/10"
                  >
                    <Download className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}