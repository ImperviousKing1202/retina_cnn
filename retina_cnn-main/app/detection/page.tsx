'use client'

import { useEffect, useState } from 'react'
import { analyzeImage, fetchModelInfo } from '@/lib/retina-api'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

export default function DetectionPage() {
  const [file, setFile] = useState<File | null>(null)
  const [result, setResult] = useState<any>(null)
  const [modelInfo, setModelInfo] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // 🧠 Load model info from backend
  useEffect(() => {
    fetchModelInfo()
      .then(data => setModelInfo(data))
      .catch(() => setError('Failed to fetch model info'))
  }, [])

  // 🧩 Send selected image to backend
  async function handleAnalyze() {
    if (!file) return alert('Please select an image first!')
    setLoading(true)
    setError(null)
    try {
      const data = await analyzeImage(file)
      setResult(data)
    } catch (err: any) {
      console.error(err)
      setError(err.message || 'Error analyzing image')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto mt-8 text-center text-white space-y-6">
      <h1 className="text-3xl font-bold">🧠 AI Retinal Disease Detection</h1>

      {modelInfo && (
        <div className="text-sm text-white/70">
          <p><strong>Model:</strong> {modelInfo.model_name}</p>
          <p><strong>Accuracy:</strong> {(modelInfo.accuracy * 100).toFixed(2)}%</p>
          <p><strong>Classes:</strong> {modelInfo.classes?.join(', ')}</p>
          <p><strong>Device:</strong> {modelInfo.device}</p>
        </div>
      )}

      <Card className="bg-black/30 border border-white/10 backdrop-blur-md text-white">
        <CardContent className="p-6 space-y-4">
          <input
            type="file"
            accept="image/*"
            className="block w-full text-sm text-gray-300 bg-transparent border border-white/20 rounded-md p-2"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
          />

          <Button onClick={handleAnalyze} disabled={loading || !file}>
            {loading ? 'Analyzing...' : 'Analyze Image'}
          </Button>

          {error && (
            <p className="text-red-400 text-sm mt-2">{error}</p>
          )}

          {result && (
            <div className="mt-6 text-left bg-white/10 p-4 rounded-lg border border-white/10">
              <h3 className="text-lg font-semibold">Results</h3>
              <p><strong>Filename:</strong> {result.filename}</p>
              <p><strong>Prediction:</strong> {result.prediction}</p>
              <p><strong>Confidence:</strong> {(result.confidence * 100).toFixed(2)}%</p>

              {result.top_predictions && (
                <>
                  <p className="mt-3 font-semibold">Top Predictions:</p>
                  <ul className="text-sm text-white/80 list-disc list-inside">
                    {result.top_predictions.map((p: any, i: number) => (
                      <li key={i}>
                        {p.class} — {(p.confidence * 100).toFixed(2)}%
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
