import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { imageStorage } from '@/lib/image-storage'
import ZAI from 'z-ai-web-dev-sdk'

export async function POST(request: NextRequest) {
  try {
    const { image, diseaseType } = await request.json()

    if (!image || !diseaseType) {
      return NextResponse.json(
        { error: 'Image and disease type are required' },
        { status: 400 }
      )
    }

    // Create detection session
    const session = await db.detectionSession.create({
      data: {
        diseaseType,
        status: 'analyzing'
      }
    })

    let savedImagePath: string | null = null
    let imageId: string | null = null

    try {
      // Save image to local storage
      const storedImage = await imageStorage.saveBase64Image(
        image,
        `detection_${diseaseType}_${Date.now()}.jpg`,
        'detection'
      )
      
      savedImagePath = storedImage.path
      imageId = storedImage.id

      // Initialize ZAI SDK
      const zai = await ZAI.create()

      // Prepare the analysis prompt based on disease type
      const systemPrompt = `You are an expert ophthalmologist AI assistant specializing in retinal image analysis. 
      Analyze the provided retinal image for signs of ${diseaseType}. 
      Provide a detailed assessment including:
      1. Detection result (positive/negative/inconclusive)
      2. Confidence level (0-1)
      3. Detailed findings
      4. Recommendations
      
      Respond in JSON format with the following structure:
      {
        "result": "positive|negative|inconclusive",
        "confidence": 0.95,
        "details": "Detailed analysis of the retinal image...",
        "recommendations": ["recommendation1", "recommendation2"]
      }`

      const userPrompt = `Please analyze this retinal image for signs of ${diseaseType}. The image is provided as a base64 encoded data URL.`

      // Call ZAI for image analysis
      const completion = await zai.chat.completions.create({
        messages: [
          {
            role: 'system',
            content: systemPrompt
          },
          {
            role: 'user',
            content: userPrompt
          }
        ],
        temperature: 0.1, // Lower temperature for more consistent medical analysis
        max_tokens: 1000
      })

      // Parse the AI response
      const aiResponse = completion.choices[0]?.message?.content
      
      if (!aiResponse) {
        throw new Error('No response from AI analysis')
      }

      let analysisResult
      try {
        // Try to parse as JSON
        analysisResult = JSON.parse(aiResponse)
      } catch (parseError) {
        // If parsing fails, create a structured response from the text
        analysisResult = {
          result: 'inconclusive',
          confidence: 0.5,
          details: aiResponse,
          recommendations: ['Please consult with an ophthalmologist for a comprehensive examination']
        }
      }

      // Validate and sanitize the result
      const validResults = ['positive', 'negative', 'inconclusive']
      if (!validResults.includes(analysisResult.result)) {
        analysisResult.result = 'inconclusive'
      }

      if (typeof analysisResult.confidence !== 'number' || analysisResult.confidence < 0 || analysisResult.confidence > 1) {
        analysisResult.confidence = 0.5
      }

      if (!Array.isArray(analysisResult.recommendations)) {
        analysisResult.recommendations = ['Please consult with an ophthalmologist for a comprehensive examination']
      }

      // Save detection result to database with local image path
      const result = await db.detectionResult.create({
        data: {
          diseaseType,
          imageUrl: `/uploads/images/detection/${storedImage.filename}`, // Relative path for serving
          confidence: analysisResult.confidence,
          result: analysisResult.result,
          details: JSON.stringify(analysisResult),
          sessionId: session.id,
          imageId: storedImage.id // Store the image storage ID
        }
      })

      // Update session with image path
      await db.detectionSession.update({
        where: { id: session.id },
        data: {
          status: 'completed',
          resultId: result.id,
          imageUrl: `/uploads/images/detection/${storedImage.filename}`
        }
      })

      return NextResponse.json(analysisResult)

    } catch (aiError) {
      console.error('AI Analysis Error:', aiError)
      
      // Update session with failed status
      await db.detectionSession.update({
        where: { id: session.id },
        data: { status: 'failed' }
      })

      // Return a fallback response
      const fallbackResult = {
        result: 'inconclusive' as const,
        confidence: 0.3,
        details: 'AI analysis is currently unavailable. Please try again later or consult with an ophthalmologist.',
        recommendations: [
          'Try capturing the image again in better lighting',
          'Ensure the eye is properly positioned',
          'Consult with an ophthalmologist for a comprehensive examination'
        ]
      }

      // Still save the fallback result if we have an image
      if (savedImagePath && imageId) {
        const result = await db.detectionResult.create({
          data: {
            diseaseType,
            imageUrl: `/uploads/images/detection/${savedImagePath.split('/').pop()}`,
            confidence: fallbackResult.confidence,
            result: fallbackResult.result,
            details: JSON.stringify(fallbackResult),
            sessionId: session.id,
            imageId
          }
        })

        await db.detectionSession.update({
          where: { id: session.id },
          data: {
            status: 'completed',
            resultId: result.id,
            imageUrl: `/uploads/images/detection/${savedImagePath.split('/').pop()}`
          }
        })
      }

      return NextResponse.json(fallbackResult)
    }

  } catch (error) {
    console.error('Analysis API Error:', error)
    return NextResponse.json(
      { error: 'Internal server error during analysis' },
      { status: 500 }
    )
  }
}