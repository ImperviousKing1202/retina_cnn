'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Eye,
  Camera,
  Brain,
  Upload,
  AlertCircle,
  CheckCircle,
  Clock,
  Download,
  Share2,
  Cpu,
  Image,
} from 'lucide-react'
import CNNDetectionInterface from '@/components/cnn-detection-interface'
import { PredictionResult } from '@/lib/cnn-model'
import { RetinalImageGallery } from '@/components/retinal-image-gallery'

/* ---------- DISEASE DEFINITIONS ---------- */
const diseases = [
  {
    id: 'glaucoma',
    title: 'Glaucoma Detection',
    description:
      'CNN-based early detection of glaucoma through retinal image analysis.',
    icon: Eye,
    color: 'from-purple-500 to-purple-700',
    risk: 'High risk if untreated',
    duration: '2–3 seconds',
    accuracy: '94.2%',
  },
  {
    id: 'retinopathy',
    title: 'Diabetic Retinopathy',
    description: 'CNN-powered screening for diabetic retinal damage.',
    icon: Brain,
    color: 'from-teal-500 to-teal-700',
    risk: 'Common in diabetes',
    duration: '3–5 seconds',
    accuracy: '92.8%',
  },
  {
    id: 'cataract',
    title: 'Cataract Analysis',
    description:
      'CNN-based advanced detection of lens opacity and clouding.',
    icon: Camera,
    color: 'from-green-500 to-green-700',
    risk: 'Age-related condition',
    duration: '1–2 seconds',
    accuracy: '95.1%',
  },
]

export default function DetectionView() {
  const [selectedDisease, setSelectedDisease] = useState<string | null>(null)
  const [cnnResult, setCnnResult] = useState<PredictionResult | null>(null)
  const [activeTab, setActiveTab] = useState('detect')

  const handleCNNResult = (result: PredictionResult) => setCnnResult(result)
  const resetDetection = () => {
    setSelectedDisease(null)
    setCnnResult(null)
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
          CNN Disease Detection
        </h1>
        <p className="text-lg text-white/80 max-w-2xl mx-auto">
          Advanced Convolutional Neural Network analysis for retinal disease
          detection.
        </p>
      </motion.div>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 bg-white/10 border-white/20">
          <TabsTrigger
            value="detect"
            className="text-white data-[state=active]:bg-white/20"
          >
            <Brain className="w-4 h-4 mr-2" /> Disease Detection
          </TabsTrigger>
          <TabsTrigger
            value="samples"
            className="text-white data-[state=active]:bg-white/20"
          >
            <Image className="w-4 h-4 mr-2" /> Sample Images
          </TabsTrigger>
        </TabsList>

        {/* ---------- DETECTION TAB ---------- */}
        <TabsContent value="detect" className="mt-6">
          {/* Disease Selection */}
          {!selectedDisease && (
            <div>
              <h2 className="text-2xl font-bold text-white mb-6">
                Select Detection Type
              </h2>
              <div className="grid md:grid-cols-3 gap-6">
                {diseases.map((disease, index) => {
                  const Icon = disease.icon
                  return (
                    <motion.div
                      key={disease.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: index * 0.1 }}
                      whileHover={{ scale: 1.02 }}
                      className="h-full"
                    >
                      <Card
                        className="h-full backdrop-blur-md bg-transparent border-white/20 text-white hover:bg-transparent/10 transition-all duration-300 cursor-pointer group"
                        onClick={() => setSelectedDisease(disease.id)}
                      >
                        <CardHeader className="text-center">
                          <div
                            className={`w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r ${disease.color} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}
                          >
                            <Icon className="w-8 h-8 text-white" />
                          </div>
                          <CardTitle className="text-xl font-semibold">
                            {disease.title}
                          </CardTitle>
                          <CardDescription className="text-white/70 text-sm">
                            {disease.description}
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="text-center space-y-3">
                          <div className="flex items-center justify-center gap-4 text-xs text-white/60">
                            <div className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              <span>{disease.duration}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Cpu className="w-3 h-3" />
                              <span>{disease.accuracy}</span>
                            </div>
                          </div>
                          <div className="text-xs text-white/60">
                            {disease.risk}
                          </div>
                          <Button
                            className="w-full bg-transparent/20 hover:bg-transparent/30 border border-white/30 text-white"
                            onClick={(e) => {
                              e.stopPropagation()
                              setSelectedDisease(disease.id)
                            }}
                          >
                            Select
                          </Button>
                        </CardContent>
                      </Card>
                    </motion.div>
                  )
                })}
              </div>
            </div>
          )}

          {/* CNN Detection Interface */}
          {selectedDisease && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-12 h-12 rounded-full bg-gradient-to-r ${
                      diseases.find((d) => d.id === selectedDisease)?.color
                    } flex items-center justify-center`}
                  >
                    {React.createElement(
                      diseases.find((d) => d.id === selectedDisease)!.icon,
                      { className: 'w-6 h-6 text-white' }
                    )}
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">
                      {
                        diseases.find((d) => d.id === selectedDisease)
                          ?.title
                      }
                    </h2>
                    <p className="text-white/60">CNN-powered analysis</p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  className="border-white/30 text-white hover:bg-transparent/10"
                  onClick={resetDetection}
                >
                  Back to Selection
                </Button>
              </div>

              <CNNDetectionInterface
                diseaseType={
                  selectedDisease as 'glaucoma' | 'retinopathy' | 'cataract'
                }
                onResult={handleCNNResult}
              />
            </motion.div>
          )}

          {/* CNN Results Display */}
          {cnnResult && selectedDisease && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mt-8"
            >
              <Card className="backdrop-blur-md bg-transparent border-white/20 text-white">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Brain className="w-5 h-5 text-green-400" />
                    CNN Analysis Complete
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h3 className="font-semibold">Detection Summary</h3>
                      <div className="p-4 rounded-lg bg-transparent border border-white/10">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-white/60">Result:</span>
                          <span className="font-semibold text-lg">
                            {cnnResult.className}
                          </span>
                        </div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-white/60">Confidence:</span>
                          <span
                            className={`font-semibold ${
                              cnnResult.confidence >= 0.9
                                ? 'text-green-400'
                                : cnnResult.confidence >= 0.7
                                ? 'text-yellow-400'
                                : 'text-red-400'
                            }`}
                          >
                            {(cnnResult.confidence * 100).toFixed(1)}%
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-white/60">Processing Time:</span>
                          <span className="font-semibold">
                            {cnnResult.processingTime.toFixed(0)}ms
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h3 className="font-semibold">Actions</h3>
                      <div className="flex gap-3 flex-wrap">
                        <Button
                          variant="outline"
                          className="border-white/30 text-white hover:bg-transparent/10"
                        >
                          <Download className="w-4 h-4 mr-2" /> Download Report
                        </Button>
                        <Button
                          variant="outline"
                          className="border-white/30 text-white hover:bg-transparent/10"
                        >
                          <Share2 className="w-4 h-4 mr-2" /> Share Results
                        </Button>
                        <Button
                          className="bg-gradient-to-r from-teal-500 to-green-500 hover:from-teal-600 hover:to-green-600 text-white"
                          onClick={resetDetection}
                        >
                          New Analysis
                        </Button>
                      </div>
                    </div>
                  </div>

                  <Alert className="mt-6">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      This analysis was performed using a deep learning
                      Convolutional Neural Network (CNN) specifically trained
                      for{' '}
                      {diseases
                        .find((d) => d.id === selectedDisease)
                        ?.title.toLowerCase()}
                      . The confidence score indicates the model’s certainty in
                      its prediction. Always consult a qualified healthcare
                      professional for medical diagnosis and treatment.
                    </AlertDescription>
                  </Alert>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </TabsContent>

        {/* ---------- SAMPLE IMAGES TAB ---------- */}
<TabsContent value="samples" className="mt-10">
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
    className="text-center space-y-6"
  >
    {/* Header */}
    <div className="flex flex-col items-center space-y-4">
      <img
        src="/images/retina-logo.png"
        alt="Retina AI Logo"
        className="w-20 h-20 rounded-full border border-white/20 shadow-lg"
      />
      <h2 className="text-3xl font-bold text-white">Retinal Image Samples</h2>
      <p className="text-white/70 max-w-2xl mx-auto text-base leading-relaxed">
        Sample retinal images for AI-powered disease detection including
        <span className="text-white font-semibold"> Normal</span>,
        <span className="text-white font-semibold"> Glaucoma</span>,
        <span className="text-white font-semibold"> Diabetic Retinopathy</span>, and
        <span className="text-white font-semibold"> Cataract</span> conditions.
      </p>
    </div>

    {/* Divider line */}
    <div className="w-24 h-[2px] mx-auto bg-gradient-to-r from-teal-400 to-green-400 rounded-full opacity-70" />

    {/* Static Grid of Images */}
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-10 px-4">
      {[
        {
          title: 'Normal Retina',
          label: 'Normal',
          img: '/static/retina-normal.jpg',
          color: 'bg-green-200 text-green-900',
        },
        {
          title: 'Glaucoma',
          label: 'Glaucoma',
          img: '/static/retina-glaucoma.jpg',
          color: 'bg-yellow-200 text-yellow-900',
        },
        {
          title: 'Diabetic Retinopathy',
          label: 'Retinopathy',
          img: '/static/retina-retinopathy.jpg',
          color: 'bg-orange-200 text-orange-900',
        },
        {
          title: 'Cataract',
          label: 'Cataract',
          img: '/static/retina-cataract.jpg',
          color: 'bg-blue-200 text-blue-900',
        },
      ].map((item, i) => (
        <Card
          key={i}
          className="backdrop-blur-md bg-white/10 border-white/20 text-white hover:bg-white/15 transition-all duration-300"
        >
          <CardHeader>
            <CardTitle className="text-lg font-semibold">{item.title}</CardTitle>
            <Badge variant="outline" className={`${item.color} border-none`}>
              {item.label}
            </Badge>
          </CardHeader>
          <CardContent>
            <div className="aspect-square rounded-lg overflow-hidden bg-black/20 mb-3">
              <img
                src={item.img}
                alt={item.title}
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
              />
            </div>
            <p className="text-sm text-white/70">
              Example of {item.title.toLowerCase()} condition for CNN-based retinal analysis.
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  </motion.div>
</TabsContent>

      </Tabs>
    </div>
  )
}
