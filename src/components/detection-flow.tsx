'use client'

import { useState, useRef } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Camera, 
  Upload, 
  ArrowRight, 
  ArrowLeft, 
  CheckCircle, 
  AlertCircle, 
  Brain,
  Eye,
  Loader2,
  RefreshCw
} from 'lucide-react'

type DetectionStep = 'instructions' | 'capture' | 'analyzing' | 'results'
type DiseaseType = 'glaucoma' | 'retinopathy' | 'cataract'

interface DetectionFlowProps {
  diseaseType: DiseaseType
  onClose: () => void
}

interface DetectionResult {
  result: 'positive' | 'negative' | 'inconclusive'
  confidence: number
  details: string
  recommendations: string[]
}

const diseaseInstructions = {
  glaucoma: {
    title: 'Glaucoma Detection',
    description: 'Follow these steps for accurate glaucoma screening',
    steps: [
      'Ensure good lighting conditions',
      'Remove glasses or contact lenses if possible',
      'Focus on a distant point for 30 seconds before capture',
      'Keep your eyes open and steady during capture',
      'Take multiple images for best results'
    ]
  },
  retinopathy: {
    title: 'Diabetic Retinopathy Screening',
    description: 'Prepare for retinal analysis',
    steps: [
      'Darken the room slightly for better pupil dilation',
      'Look straight ahead at the camera',
      'Avoid blinking during the capture',
      'If you have diabetes, ensure your blood sugar is stable',
      'Take images of both eyes if possible'
    ]
  },
  cataract: {
    title: 'Cataract Analysis',
    description: 'Getting ready for cataract detection',
    steps: [
      'Face a bright light source for pupil constriction',
      'Remove any protective eyewear',
      'Keep your head steady and eyes focused',
      'Capture images from different angles if possible',
      'Ensure the lens area is clearly visible'
    ]
  }
}

export default function DetectionFlow({ diseaseType, onClose }: DetectionFlowProps) {
  const [currentStep, setCurrentStep] = useState<DetectionStep>('instructions')
  const [capturedImage, setCapturedImage] = useState<string | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisProgress, setAnalysisProgress] = useState(0)
  const [detectionResult, setDetectionResult] = useState<DetectionResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isUsingCamera, setIsUsingCamera] = useState(false)

  const instructions = diseaseInstructions[diseaseType]

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const imageBase64 = e.target?.result as string
        setCapturedImage(imageBase64)
        setCurrentStep('analyzing')
        analyzeImage(imageBase64)
      }
      reader.readAsDataURL(file)
    }
  }

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        setIsUsingCamera(true)
      }
    } catch (err) {
      setError('Camera access denied. Please use file upload instead.')
    }
  }

  const captureImage = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas')
      canvas.width = videoRef.current.videoWidth
      canvas.height = videoRef.current.videoHeight
      const ctx = canvas.getContext('2d')
      ctx?.drawImage(videoRef.current, 0, 0)
      const imageData = canvas.toDataURL('image/jpeg')
      setCapturedImage(imageData)
      stopCamera()
      setIsUsingCamera(false)
      setCurrentStep('analyzing')
      analyzeImage(imageData)
    }
  }

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream
      stream.getTracks().forEach(track => track.stop())
      videoRef.current.srcObject = null
    }
  }

  const analyzeImage = async (imageData: string) => {
    setIsAnalyzing(true)
    setError(null)
    setAnalysisProgress(0)

    // Simulate progress bar
    const progressInterval = setInterval(() => {
      setAnalysisProgress(prev => (prev >= 90 ? 90 : prev + 10))
    }, 250)

    try {
      const response = await fetch('http://127.0.0.1:8000/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: imageData, diseaseType })
      })

      if (!response.ok) throw new Error('Server error during analysis')

      const result = await response.json()
      setDetectionResult(result)
      setAnalysisProgress(100)
      setCurrentStep('results')
    } catch (err) {
      console.error(err)
      setError('Analysis failed. Please try again or check backend connection.')
      setCurrentStep('capture')
    } finally {
      clearInterval(progressInterval)
      setIsAnalyzing(false)
    }
  }

  const resetDetection = () => {
    setCurrentStep('instructions')
    setCapturedImage(null)
    setDetectionResult(null)
    setError(null)
    setAnalysisProgress(0)
  }

  const renderStep = () => {
    switch (currentStep) {
      case 'instructions':
        return (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <CardHeader className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-purple-500 to-teal-500 flex items-center justify-center">
                <Eye className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-2xl">{instructions.title}</CardTitle>
              <CardDescription>{instructions.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                {instructions.steps.map((step, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center text-sm">
                      {index + 1}
                    </div>
                    <p className="text-sm text-gray-600">{step}</p>
                  </div>
                ))}
              </div>

              <div className="flex gap-3">
                <Button onClick={() => fileInputRef.current?.click()} className="flex-1 bg-gradient-to-r from-purple-600 to-teal-600 hover:from-purple-700 hover:to-teal-700">
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Image
                </Button>
                <Button variant="outline" onClick={startCamera} className="flex-1">
                  <Camera className="w-4 h-4 mr-2" />
                  Use Camera
                </Button>
              </div>

              <Button variant="ghost" onClick={onClose} className="w-full">Cancel</Button>
            </CardContent>
          </motion.div>
        )

      case 'analyzing':
        return (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <CardHeader className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-purple-500 to-teal-500 flex items-center justify-center">
                <Brain className="w-8 h-8 text-white animate-pulse" />
              </div>
              <CardTitle>Analyzing Your Image</CardTitle>
              <CardDescription>Our AI is examining your retinal image for {diseaseType}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {capturedImage && <img src={capturedImage} alt="Captured" className="w-full h-48 object-cover rounded-lg" />}
              <Progress value={analysisProgress} className="h-2" />
              {isAnalyzing && (
                <div className="text-center text-sm text-gray-600 flex items-center justify-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Running AI model...</span>
                </div>
              )}
            </CardContent>
          </motion.div>
        )

      case 'results':
        return (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <CardHeader className="text-center">
              <div className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center ${
                detectionResult?.result === 'negative' ? 'bg-green-100' :
                detectionResult?.result === 'positive' ? 'bg-red-100' :
                'bg-yellow-100'
              }`}>
                {detectionResult?.result === 'negative' ? (
                  <CheckCircle className="w-8 h-8 text-green-600" />
                ) : (
                  <AlertCircle className={`w-8 h-8 ${detectionResult?.result === 'positive' ? 'text-red-600' : 'text-yellow-600'}`} />
                )}
              </div>
              <CardTitle className="text-2xl">
                {detectionResult?.result === 'negative' ? 'No Signs Detected' :
                 detectionResult?.result === 'positive' ? 'Signs Detected' :
                 'Inconclusive Results'}
              </CardTitle>
              <CardDescription>
                Confidence: {Math.round((detectionResult?.confidence || 0) * 100)}%
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {detectionResult && (
                <>
                  <Alert><AlertDescription>{detectionResult.details}</AlertDescription></Alert>
                  <div>
                    <h4 className="font-medium mb-2">Recommendations:</h4>
                    <ul className="list-disc list-inside text-sm text-gray-700">
                      {detectionResult.recommendations.map((rec, i) => <li key={i}>{rec}</li>)}
                    </ul>
                  </div>
                </>
              )}
              <div className="flex gap-3">
                <Button onClick={resetDetection} variant="outline" className="flex-1">
                  <RefreshCw className="w-4 h-4 mr-2" /> New Analysis
                </Button>
                <Button onClick={onClose} className="flex-1 bg-gradient-to-r from-purple-600 to-teal-600">
                  Done
                </Button>
              </div>
            </CardContent>
          </motion.div>
        )
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-6">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full max-w-md">
        <Card className="backdrop-blur-md bg-white/95 border-white/20">
          <AnimatePresence mode="wait">{renderStep()}</AnimatePresence>
        </Card>
      </motion.div>
      <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
      {error && (
        <Alert className="mt-4 max-w-md mx-auto bg-red-50 border-red-200">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-700">{error}</AlertDescription>
        </Alert>
      )}
    </div>
  )
}
