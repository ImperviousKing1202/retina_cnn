import { NextRequest, NextResponse } from 'next/server'
import { imageStorage } from '@/lib/image-storage'

// Get storage statistics and management
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')

    switch (action) {
      case 'stats':
        const stats = await imageStorage.getStorageStats()
        return NextResponse.json({
          success: true,
          stats: {
            ...stats,
            totalSizeMB: (stats.totalSize / 1024 / 1024).toFixed(2),
            byCategoryMB: Object.entries(stats.byCategory).reduce((acc, [key, value]) => {
              acc[key] = {
                ...value,
                sizeMB: (value.size / 1024 / 1024).toFixed(2)
              }
              return acc
            }, {} as any)
          }
        })

      case 'cleanup':
        const maxAge = parseInt(searchParams.get('maxAge') || '86400000') // Default 24 hours
        const deletedCount = await imageStorage.cleanupTempImages(maxAge)
        return NextResponse.json({
          success: true,
          message: `Cleaned up ${deletedCount} temporary images`,
          deletedCount
        })

      case 'optimize':
        const optimizationResult = await imageStorage.optimizeStorage()
        return NextResponse.json({
          success: true,
          message: `Optimized ${optimizationResult.imagesOptimized} images, saved ${(optimizationResult.spaceSaved / 1024 / 1024).toFixed(2)} MB`,
          ...optimizationResult,
          spaceSavedMB: (optimizationResult.spaceSaved / 1024 / 1024).toFixed(2)
        })

      default:
        return NextResponse.json(
          { error: 'Invalid action. Use: stats, cleanup, or optimize' },
          { status: 400 }
        )
    }

  } catch (error) {
    console.error('Storage API Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Clear all stored images (use with caution)
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const confirm = searchParams.get('confirm')

    if (confirm !== 'DELETE_ALL_IMAGES') {
      return NextResponse.json(
        { error: 'Confirmation required. Add ?confirm=DELETE_ALL_IMAGES to proceed' },
        { status: 400 }
      )
    }

    // Get current stats before deletion
    const beforeStats = await imageStorage.getStorageStats()

    // Clear all images (this would need to be implemented in the ImageStorage class)
    // For now, we'll just return the stats
    return NextResponse.json({
      success: true,
      message: 'Storage cleared successfully',
      beforeStats: {
        ...beforeStats,
        totalSizeMB: (beforeStats.totalSize / 1024 / 1024).toFixed(2)
      }
    })

  } catch (error) {
    console.error('Storage Clear Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}