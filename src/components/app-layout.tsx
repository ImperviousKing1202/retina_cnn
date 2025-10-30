'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { 
  Eye, 
  Brain, 
  History, 
  Settings, 
  Database,
  Users,
  FileText,
  Menu,
  X,
  Home
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import OfflineStatus from '@/components/offline-status'
import { RetinaLogo } from '@/components/retina-logo'

// ✅ Hydration-safe Retina Icon component
function RetinaIcon() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Render placeholder on SSR to prevent mismatch
  if (!mounted) {
    return <div className="w-10 h-10 bg-white/20 rounded-full" />
  }

  // After hydration, render the dynamic Eye icon
  return (
    <div className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center">
      <Eye className="w-5 h-5 text-white" />
    </div>
  )
}

interface NavigationItem {
  id: string
  label: string
  icon: any
  description: string
  color: string
}

const navigationItems: NavigationItem[] = [
  {
    id: 'home',
    label: 'Dashboard',
    icon: Home,
    description: 'Main dashboard',
    color: 'from-purple-500 to-purple-700'
  },
  {
    id: 'detection',
    label: 'Detection',
    icon: Eye,
    description: 'AI disease detection',
    color: 'from-teal-500 to-teal-700'
  },
  {
    id: 'training',
    label: 'Training',
    icon: Brain,
    description: 'Model training',
    color: 'from-green-500 to-green-700'
  },
  {
    id: 'storage',
    label: 'Storage',
    icon: Database,
    description: 'Image storage',
    color: 'from-blue-500 to-blue-700'
  },
  {
    id: 'patients',
    label: 'Patients',
    icon: Users,
    description: 'Patient management',
    color: 'from-orange-500 to-orange-700'
  },
  {
    id: 'history',
    label: 'History',
    icon: History,
    description: 'Detection history',
    color: 'from-pink-500 to-pink-700'
  },
  {
    id: 'reports',
    label: 'Reports',
    icon: FileText,
    description: 'Generate reports',
    color: 'from-indigo-500 to-indigo-700'
  },
  {
    id: 'settings',
    label: 'Settings',
    icon: Settings,
    description: 'App settings',
    color: 'from-gray-500 to-gray-700'
  }
]

interface AppLayoutProps {
  children: React.ReactNode
  currentView: string
  onViewChange: (view: string) => void
}

export default function AppLayout({ children, currentView, onViewChange }: AppLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const currentItem = navigationItems.find(item => item.id === currentView)

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-teal-800 to-green-900">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-teal-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-green-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-4000"></div>
      </div>

      {/* Header */}
      <header className="relative z-10 bg-black/20 backdrop-blur-md border-b border-white/10">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                className="lg:hidden text-white hover:bg-white/10"
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              >
                {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </Button>

              {/* ✅ Replace RetinaLogo with RetinaIcon for hydration safety */}
              <RetinaIcon />
              <RetinaLogo size="md" showText={true} variant="light" />
            </div>

            {currentItem && (
              <div className="hidden md:flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full bg-gradient-to-r ${currentItem.color} flex items-center justify-center`}>
                  <currentItem.icon className="w-4 h-4 text-white" />
                </div>
                <div className="text-right">
                  <h2 className="text-lg font-semibold text-white">{currentItem.label}</h2>
                  <p className="text-xs text-white/60">{currentItem.description}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="relative z-10 flex">
        {/* Sidebar */}
        <AnimatePresence>
          {isSidebarOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                onClick={() => setIsSidebarOpen(false)}
              />
              
              <motion.aside
                initial={{ x: -300 }}
                animate={{ x: 0 }}
                exit={{ x: -300 }}
                className="fixed left-0 top-0 h-full w-72 bg-black/20 backdrop-blur-md border-r border-white/10 z-50 lg:hidden"
              >
                <div className="p-6">
                  <div className="flex items-center justify-between mb-8">
                    <RetinaLogo size="sm" showText={true} variant="light" />
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-white hover:bg-white/10"
                      onClick={() => setIsSidebarOpen(false)}
                    >
                      <X className="w-5 h-5" />
                    </Button>
                  </div>
                  
                  <nav className="space-y-2">
                    {navigationItems.map((item) => {
                      const Icon = item.icon
                      return (
                        <Button
                          key={item.id}
                          variant={currentView === item.id ? "default" : "ghost"}
                          className={`w-full justify-start gap-3 ${
                            currentView === item.id 
                              ? 'bg-white/20 text-white border-white/30' 
                              : 'text-white/80 hover:bg-white/10 hover:text-white'
                          }`}
                          onClick={() => {
                            onViewChange(item.id)
                            setIsSidebarOpen(false)
                          }}
                        >
                          <div className={`w-4 h-4 rounded-full bg-gradient-to-r ${item.color} flex items-center justify-center`}>
                            <Icon className="w-2 h-2 text-white" />
                          </div>
                          {item.label}
                        </Button>
                      )
                    })}
                  </nav>
                </div>
              </motion.aside>
            </>
          )}
        </AnimatePresence>

        {/* Desktop sidebar */}
        <aside className="hidden lg:block w-72 bg-black/20 backdrop-blur-md border-r border-white/10">
          <div className="p-6">
            <nav className="space-y-2">
              {navigationItems.map((item) => {
                const Icon = item.icon
                return (
                  <motion.div
                    key={item.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Button
                      variant={currentView === item.id ? "default" : "ghost"}
                      className={`w-full justify-start gap-3 ${
                        currentView === item.id 
                          ? 'bg-white/20 text-white border-white/30' 
                          : 'text-white/80 hover:bg-white/10 hover:text-white'
                      }`}
                      onClick={() => onViewChange(item.id)}
                    >
                      <div className={`w-4 h-4 rounded-full bg-gradient-to-r ${item.color} flex items-center justify-center`}>
                        <Icon className="w-2 h-2 text-white" />
                      </div>
                      {item.label}
                    </Button>
                  </motion.div>
                )
              })}
            </nav>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 container mx-auto px-4 py-6 lg:px-6 lg:py-8">
          {children}
        </main>
      </div>

      {/* Offline Status */}
      <OfflineStatus />
    </div>
  )
}
