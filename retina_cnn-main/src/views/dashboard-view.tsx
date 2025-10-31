'use client'

import { motion } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  Eye, 
  Camera, 
  Brain, 
  Database, 
  Users, 
  History,
  TrendingUp,
  AlertCircle,
  CheckCircle
} from 'lucide-react'
import { RetinaLogo } from '@/components/retina-logo'

interface DashboardViewProps {
  onViewChange: (view: string) => void
}

const statsCards = [
  {
    title: "Total Detections",
    value: "1,284",
    change: "+12%",
    icon: Eye,
    color: "from-purple-500 to-purple-700",
    description: "AI analyses performed"
  },
  {
    title: "Patients",
    value: "847",
    change: "+5%",
    icon: Users,
    color: "from-blue-500 to-blue-700",
    description: "Registered patients"
  },
  {
    title: "Storage Used",
    value: "2.4 GB",
    change: "+0.8 GB",
    icon: Database,
    color: "from-green-500 to-green-700",
    description: "Local image storage"
  },
  {
    title: "Accuracy Rate",
    value: "94.2%",
    change: "+2.1%",
    icon: TrendingUp,
    color: "from-teal-500 to-teal-700",
    description: "Model performance"
  }
]

const recentActivity = [
  {
    id: 1,
    patient: "John Smith",
    type: "Glaucoma Detection",
    result: "Normal",
    time: "2 hours ago",
    status: "success"
  },
  {
    id: 2,
    patient: "Sarah Johnson",
    type: "Diabetic Retinopathy",
    result: "Mild changes detected",
    time: "4 hours ago",
    status: "warning"
  },
  {
    id: 3,
    patient: "Michael Brown",
    type: "Cataract Analysis",
    result: "Early cataract",
    time: "6 hours ago",
    status: "alert"
  },
  {
    id: 4,
    patient: "Emily Davis",
    type: "Glaucoma Detection",
    result: "Normal",
    time: "8 hours ago",
    status: "success"
  }
]

const quickActions = [
  {
    title: "New Detection",
    description: "Analyze retinal image",
    icon: Camera,
    color: "from-purple-500 to-purple-700",
    action: "detection"
  },
  {
    title: "Add Patient",
    description: "Register new patient",
    icon: Users,
    color: "from-blue-500 to-blue-700",
    action: "patients"
  },
  {
    title: "Training Mode",
    description: "Improve AI model",
    icon: Brain,
    color: "from-green-500 to-green-700",
    action: "training"
  },
  {
    title: "View Reports",
    description: "Generate analytics",
    icon: History,
    color: "from-teal-500 to-teal-700",
    action: "reports"
  }
]

export default function DashboardView({ onViewChange }: DashboardViewProps) {
  return (
    <div className="space-y-6">
      {/* Quick Actions - Now at Very Top */}
      <div>
        <h2 className="text-xl font-bold text-white mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {quickActions.map((action, index) => {
            const Icon = action.icon
            return (
              <motion.div
                key={action.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Card 
                  className="backdrop-blur-md bg-transparent border-white/20 text-white hover:bg-transparent/10 transition-all duration-300 cursor-pointer"
                  onClick={() => onViewChange(action.action)}
                >
                  <CardContent className="p-4 text-center">
                    <div className={`w-10 h-10 mx-auto mb-3 rounded-full bg-gradient-to-r ${action.color} flex items-center justify-center`}>
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="font-semibold text-sm mb-1">{action.title}</h3>
                    <p className="text-xs text-white/60">{action.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            )
          })}
        </div>
      </div>

      {/* Statistics Overview - Below Quick Actions */}
      <div>
        <h2 className="text-xl font-bold text-white mb-4">Statistics Overview</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {statsCards.map((stat, index) => {
            const Icon = stat.icon
            return (
              <motion.div
                key={stat.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Card className="backdrop-blur-md bg-white/5 border-white/10 text-white hover:bg-white/10 transition-all duration-300">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className={`w-6 h-6 rounded-full bg-gradient-to-r ${stat.color} flex items-center justify-center`}>
                        <Icon className="w-3 h-3 text-white" />
                      </div>
                      <div className="flex items-center gap-1">
                        <TrendingUp className="w-3 h-3 text-green-400" />
                        <span className="text-xs text-green-400 font-medium">{stat.change}</span>
                      </div>
                    </div>
                    <div className="text-xl font-bold">{stat.value}</div>
                    <p className="text-xs text-white/70 font-medium">{stat.title}</p>
                    <p className="text-xs text-white/50 mt-1">{stat.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            )
          })}
        </div>
      </div>

      {/* Welcome Section - Moved Down */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <div className="flex justify-center mb-4">
          <RetinaLogo size="lg" showText={false} variant="light" />
        </div>
        <h1 className="text-3xl lg:text-4xl font-bold text-white mb-3">
          Welcome to RETINA Dashboard
        </h1>
        <p className="text-base lg:text-lg text-white/80 max-w-2xl mx-auto">
          Monitor your AI-powered eye disease detection system and manage patient care efficiently.
        </p>
      </motion.div>

      {/* Recent Activity & System Status - More Compact */}
      <div className="grid lg:grid-cols-2 gap-4">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <Card className="backdrop-blur-md bg-transparent border-white/20 text-white">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <History className="w-4 h-4" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {recentActivity.slice(0, 3).map((activity) => (
                <div key={activity.id} className="flex items-center justify-between p-2 rounded-lg bg-transparent border border-white/10">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${
                      activity.status === 'success' ? 'bg-green-400' :
                      activity.status === 'warning' ? 'bg-yellow-400' : 'bg-red-400'
                    }`} />
                    <div>
                      <p className="text-sm font-medium text-white">{activity.patient}</p>
                      <p className="text-xs text-white/60">{activity.type}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-white/80">{activity.result}</p>
                    <p className="text-xs text-white/50">{activity.time}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          <Card className="backdrop-blur-md bg-transparent border-white/20 text-white">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <AlertCircle className="w-4 h-4" />
                System Status
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between p-2 rounded-lg bg-transparent border border-white/10">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  <span className="text-sm text-white">AI Model</span>
                </div>
                <span className="text-xs text-green-400">Operational</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-transparent border border-white/10">
                <div className="flex items-center gap-2">
                  <Database className="w-4 h-4 text-green-400" />
                  <span className="text-sm text-white">Storage</span>
                </div>
                <span className="text-xs text-green-400">Healthy</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-transparent border border-white/10">
                <div className="flex items-center gap-2">
                  <Eye className="w-4 h-4 text-yellow-400" />
                  <span className="text-sm text-white">Camera</span>
                </div>
                <span className="text-xs text-yellow-400">Not Connected</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-transparent border border-white/10">
                <div className="flex items-center gap-2">
                  <Brain className="w-4 h-4 text-green-400" />
                  <span className="text-sm text-white">Training</span>
                </div>
                <span className="text-xs text-green-400">Ready</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}