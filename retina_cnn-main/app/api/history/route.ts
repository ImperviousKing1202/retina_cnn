import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const diseaseType = searchParams.get('diseaseType')
    const limit = parseInt(searchParams.get('limit') || '10')
    const offset = parseInt(searchParams.get('offset') || '0')

    // Build where clause
    const where: any = {}
    
    if (diseaseType) {
      where.diseaseType = diseaseType
    }

    // Fetch detection results with related session data
    const results = await db.detectionResult.findMany({
      where,
      include: {
        session: {
          select: {
            id: true,
            createdAt: true,
            status: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset
    })

    // Get total count for pagination
    const total = await db.detectionResult.count({ where })

    // Parse details JSON for each result
    const formattedResults = results.map(result => ({
      id: result.id,
      diseaseType: result.diseaseType,
      imageUrl: result.imageUrl,
      confidence: result.confidence,
      result: result.result,
      details: result.details ? JSON.parse(result.details) : null,
      createdAt: result.createdAt,
      session: result.session
    }))

    return NextResponse.json({
      success: true,
      results: formattedResults,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total
      }
    })

  } catch (error) {
    console.error('History Fetch Error:', error)
    return NextResponse.json(
      { error: 'Internal server error while fetching history' },
      { status: 500 }
    )
  }
}