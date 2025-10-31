'use client'

import { useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Upload, Loader2, CheckCircle, AlertCircle, Camera } from 'lucide-react'
import { analyzeImage } from '@/lib/retina-api'
import type { PredictionResult } from '@/lib/cnn-model'

interface Props {
  diseaseType: 'glaucoma' | 'retinopathy' | 'cataract'
  onResult: (result: PredictionResult) => void
}

export default function CNNDetectionInterface({ diseaseType, onResult }: Props) {
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [progress, setProgress] = useState(0)
  const [result, setResult] = useState<PredictionResult | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleUpload = async () => {
    if (!file) {
      setError('Please select an image before analyzing.')
      return
    }

    setError(null)
    setLoading(true)
    setProgress(10)

    try {
      const start = performance.now()
      const response = await analyzeImage(file)
      const end = performance.now()

      setProgress(90)

      const prediction: PredictionResult = {
        className: response.prediction,
        confidence: response.confidence || 0.0,
        processingTime: end - start,
      }

      setResult(prediction)
      onResult(prediction)
      setProgress(100)
    } catch (err: any) {
      setError(err.message || 'Error analyzing image')
    } finally {
      setLoading(false)
    }
  }

  const reset = () => {
    setFile(null)
    setResult(null)
    setProgress(0)
    setError(null)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 border border-white/20 rounded-lg backdrop-blur-md bg-transparent text-white"
    >
      <h3 className="text-xl font-semibold mb-4">Upload Retinal Image</h3>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={(e) => setFile(e.target.files?.[0] || null)}
        className="block w-full text-sm mb-4"
      />

      {!loading && (
        <Button
          className="bg-gradient-to-r from-teal-500 to-green-500 hover:from-teal-600 hover:to-green-600"
          onClick={handleUpload}
          disabled={!file}
        >
          <Upload className="w-4 h-4 mr-2" /> Analyze Image
        </Button>
      )}

      {loading && (
        <div className="space-y-3">
          <Progress value={progress} className="h-2 bg-white/20" />
          <div className="flex items-center gap-2 text-white/70">
            <Loader2 className="animate-spin w-4 h-4" />
            Analyzing image on server...
          </div>
        </div>
      )}

      {error && (
        <Alert variant="destructive" className="mt-4 bg-red-500/20 border-red-500/30">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {result && (
        <div className="mt-6 border-t border-white/20 pt-4">
          <h4 className="font-semibold mb-2 flex items-center gap-2">
            <CheckCircle className="text-green-400 w-5 h-5" />
            Result
          </h4>
          <p>Prediction: <strong>{result.className}</strong></p>
          <p>Confidence: {(result.confidence * 100).toFixed(1)}%</p>
          <p>Processing Time: {result.processingTime.toFixed(0)}ms</p>
          <Button onClick={reset} className="mt-4 bg-white/10 hover:bg-white/20">
            Analyze Another Image
          </Button>
        </div>
      )}
    </motion.div>
  )
}
