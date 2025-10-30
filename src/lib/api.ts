// src/lib/retina-api.ts
const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000'

export async function analyzeImage(file: File) {
  const formData = new FormData()
  formData.append('file', file)

  const res = await fetch(`${API_URL}/predict`, {
    method: 'POST',
    body: formData,
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Backend error: ${text}`)
  }

  return await res.json()
}

export async function fetchModelInfo() {
  const res = await fetch(`${API_URL}/model-info`)
  if (!res.ok) throw new Error('Failed to fetch model info')
  return await res.json()
}
