'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { 
  Settings, 
  User,
  Brain,
  Database,
  Shield,
  Bell,
  Eye,
  Camera,
  Save,
  RotateCcw,
  Download,
  Upload
} from 'lucide-react'
import { RetinaLogo } from '@/components/retina-logo'

interface SettingSection {
  title: string
  icon: any
  description: string
  settings: {
    label: string
    type: 'toggle' | 'input' | 'select'
    value: any
    options?: string[]
  }[]
}

export default function SettingsView() {
  const [settings, setSettings] = useState({
    // AI Model Settings
    modelAccuracy: 'high',
    autoTraining: true,
    confidenceThreshold: 85,
    
    // Storage Settings
    autoOptimize: true,
    maxStorageSize: '10GB',
    compressionLevel: 'medium',
    
    // Notification Settings
    emailNotifications: true,
    alertNotifications: true,
    weeklyReports: false,
    
    // Privacy Settings
    dataRetention: '365',
    anonymizeData: true,
    encryptionEnabled: true,
    
    // Interface Settings
    darkMode: true,
    compactView: false,
    showTooltips: true
  })

  const settingSections: SettingSection[] = [
    {
      title: 'AI Model',
      icon: Brain,
      description: 'Configure AI detection parameters',
      settings: [
        { label: 'Auto Training', type: 'toggle', value: settings.autoTraining },
        { label: 'Confidence Threshold', type: 'input', value: settings.confidenceThreshold },
        { label: 'Model Accuracy', type: 'select', value: settings.modelAccuracy, options: ['low', 'medium', 'high'] }
      ]
    },
    {
      title: 'Storage',
      icon: Database,
      description: 'Manage storage preferences',
      settings: [
        { label: 'Auto Optimize', type: 'toggle', value: settings.autoOptimize },
        { label: 'Max Storage Size', type: 'select', value: settings.maxStorageSize, options: ['5GB', '10GB', '20GB', '50GB'] },
        { label: 'Compression Level', type: 'select', value: settings.compressionLevel, options: ['low', 'medium', 'high'] }
      ]
    },
    {
      title: 'Notifications',
      icon: Bell,
      description: 'Configure alert preferences',
      settings: [
        { label: 'Email Notifications', type: 'toggle', value: settings.emailNotifications },
        { label: 'Alert Notifications', type: 'toggle', value: settings.alertNotifications },
        { label: 'Weekly Reports', type: 'toggle', value: settings.weeklyReports }
      ]
    },
    {
      title: 'Privacy & Security',
      icon: Shield,
      description: 'Data protection settings',
      settings: [
        { label: 'Data Retention (days)', type: 'input', value: settings.dataRetention },
        { label: 'Anonymize Data', type: 'toggle', value: settings.anonymizeData },
        { label: 'Encryption Enabled', type: 'toggle', value: settings.encryptionEnabled }
      ]
    }
  ]

  const updateSetting = (key: string, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }))
  }

  const saveSettings = () => {
    // Simulate saving settings
    console.log('Settings saved:', settings)
  }

  const resetSettings = () => {
    // Reset to default values
    setSettings({
      modelAccuracy: 'high',
      autoTraining: true,
      confidenceThreshold: 85,
      autoOptimize: true,
      maxStorageSize: '10GB',
      compressionLevel: 'medium',
      emailNotifications: true,
      alertNotifications: true,
      weeklyReports: false,
      dataRetention: '365',
      anonymizeData: true,
      encryptionEnabled: true,
      darkMode: true,
      compactView: false,
      showTooltips: true
    })
  }

  const exportSettings = () => {
    const dataStr = JSON.stringify(settings, null, 2)
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr)
    
    const exportFileDefaultName = 'retina-settings.json'
    
    const linkElement = document.createElement('a')
    linkElement.setAttribute('href', dataUri)
    linkElement.setAttribute('download', exportFileDefaultName)
    linkElement.click()
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
          Settings & Configuration
        </h1>
        <p className="text-lg text-white/80 max-w-2xl mx-auto">
          Customize your RETINA application preferences and system configuration.
        </p>
      </motion.div>

      {/* Action Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="backdrop-blur-md bg-white/10 border-white/20 text-white">
          <CardContent className="p-6">
            <div className="flex flex-wrap gap-3">
              <Button 
                className="bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 text-white"
                onClick={saveSettings}
              >
                <Save className="w-4 h-4 mr-2" />
                Save Settings
              </Button>
              <Button 
                variant="outline" 
                className="border-white/30 text-white hover:bg-white/10"
                onClick={resetSettings}
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Reset to Default
              </Button>
              <Button 
                variant="outline" 
                className="border-white/30 text-white hover:bg-white/10"
                onClick={exportSettings}
              >
                <Download className="w-4 h-4 mr-2" />
                Export Settings
              </Button>
              <Button 
                variant="outline" 
                className="border-white/30 text-white hover:bg-white/10"
              >
                <Upload className="w-4 h-4 mr-2" />
                Import Settings
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Settings Sections */}
      <div className="grid lg:grid-cols-2 gap-8">
        {settingSections.map((section, index) => {
          const Icon = section.icon
          return (
            <motion.div
              key={section.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + index * 0.1 }}
            >
              <Card className="backdrop-blur-md bg-white/10 border-white/20 text-white">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Icon className="w-5 h-5" />
                    {section.title}
                  </CardTitle>
                  <CardDescription className="text-white/60">
                    {section.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {section.settings.map((setting, settingIndex) => (
                    <div key={setting.label} className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                      <label className="text-sm font-medium cursor-pointer">
                        {setting.label}
                      </label>
                      <div className="flex items-center gap-2">
                        {setting.type === 'toggle' && (
                          <Switch
                            checked={setting.value}
                            onCheckedChange={(checked) => {
                              const settingKey = Object.keys(settings).find(key => 
                                settings[key as keyof typeof settings] === setting.value
                              )
                              if (settingKey) {
                                updateSetting(settingKey, checked)
                              }
                            }}
                          />
                        )}
                        {setting.type === 'input' && (
                          <Input
                            type="number"
                            value={setting.value}
                            onChange={(e) => {
                              const settingKey = Object.keys(settings).find(key => 
                                settings[key as keyof typeof settings] === setting.value
                              )
                              if (settingKey) {
                                updateSetting(settingKey, parseInt(e.target.value))
                              }
                            }}
                            className="w-20 bg-white/10 border-white/20 text-white"
                          />
                        )}
                        {setting.type === 'select' && (
                          <select
                            value={setting.value}
                            onChange={(e) => {
                              const settingKey = Object.keys(settings).find(key => 
                                settings[key as keyof typeof settings] === setting.value
                              )
                              if (settingKey) {
                                updateSetting(settingKey, e.target.value)
                              }
                            }}
                            className="bg-white/10 border border-white/20 text-white rounded px-3 py-1 text-sm"
                          >
                            {setting.options?.map(option => (
                              <option key={option} value={option}>{option}</option>
                            ))}
                          </select>
                        )}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </motion.div>
          )
        })}
      </div>

      {/* System Information */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <Card className="backdrop-blur-md bg-white/10 border-white/20 text-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              System Information
            </CardTitle>
            <CardDescription className="text-white/60">
              Application and system details
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <h3 className="font-semibold mb-3">Application</h3>
                <div className="flex justify-between text-sm">
                  <span className="text-white/60">Version:</span>
                  <span>1.0.0</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-white/60">Build:</span>
                  <span>20240115</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-white/60">License:</span>
                  <span>Enterprise</span>
                </div>
              </div>
              
              <div className="space-y-3">
                <h3 className="font-semibold mb-3">System</h3>
                <div className="flex justify-between text-sm">
                  <span className="text-white/60">Platform:</span>
                  <span>Web</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-white/60">Storage:</span>
                  <span>Local</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-white/60">AI Engine:</span>
                  <span>Local v2.1</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}