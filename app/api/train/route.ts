import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { imageStorage } from '@/lib/image-storage'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const image = formData.get('image') as File
    const diseaseType = formData.get('diseaseType') as string
    const label = formData.get('label') as string // 'positive' or 'negative'

    if (!image || !diseaseType || !label) {
      return NextResponse.json(
        { error: 'Image, disease type, and label are required' },
        { status: 400 }
      )
    }

    // Validate inputs
    const validDiseaseTypes = ['glaucoma', 'retinopathy', 'cataract']
    const validLabels = ['positive', 'negative']

    if (!validDiseaseTypes.includes(diseaseType)) {
      return NextResponse.json(
        { error: 'Invalid disease type' },
        { status: 400 }
      )
    }

    if (!validLabels.includes(label)) {
      return NextResponse.json(
        { error: 'Invalid label. Must be positive or negative' },
        { status: 400 }
      )
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png']
    if (!allowedTypes.includes(image.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Only JPEG and PNG images are allowed' },
        { status: 400 }
      )
    }

    try {
      // Save image to local storage using the new image storage system
      const arrayBuffer = await image.arrayBuffer()
      const storedImage = await imageStorage.saveImage(
        arrayBuffer,
        image.name,
        image.type,
        'training'
      )

      // Save to database with local image path
      const trainingImage = await db.trainingImage.create({
        data: {
          diseaseType,
          imageUrl: `/uploads/images/training/${storedImage.filename}`, // Relative path for serving
          label,
          isVerified: false, // Requires manual verification
          imageId: storedImage.id, // Store the image storage ID
          originalName: image.name,
          fileSize: storedImage.size,
          mimeType: image.type
        }
      })

      return NextResponse.json({
        success: true,
        message: 'Training image uploaded and saved locally',
        image: {
          id: trainingImage.id,
          diseaseType: trainingImage.diseaseType,
          label: trainingImage.label,
          isVerified: trainingImage.isVerified,
          createdAt: trainingImage.createdAt,
          imageUrl: trainingImage.imageUrl,
          localPath: storedImage.path,
          fileSize: storedImage.size,
          metadata: storedImage.metadata
        }
      })

    } catch (storageError) {
      console.error('Image storage error:', storageError)
      return NextResponse.json(
        { error: 'Failed to save image locally' },
        { status: 500 }
      )
    }

  } catch (error) {
    console.error('Training Upload Error:', error)
    return NextResponse.json(
      { error: 'Internal server error during upload' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const diseaseType = searchParams.get('diseaseType')
    const label = searchParams.get('label')
    const verified = searchParams.get('verified')

    // Build where clause
    const where: any = {}
    
    if (diseaseType) {
      where.diseaseType = diseaseType
    }
    
    if (label) {
      where.label = label
    }
    
    if (verified !== null) {
      where.isVerified = verified === 'true'
    }

    // Fetch training images
    const trainingImages = await db.trainingImage.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 100 // Limit to 100 most recent images
    })

    // Get storage statistics
    const storageStats = await imageStorage.getStorageStats()

    return NextResponse.json({
      success: true,
      images: trainingImages,
      total: trainingImages.length,
      storageStats: {
        totalImages: storageStats.totalImages,
        totalSize: storageStats.totalSize,
        trainingImages: storageStats.byCategory.training || { count: 0, size: 0 }
      }
    })

  } catch (error) {
    console.error('Training Fetch Error:', error)
    return NextResponse.json(
      { error: 'Internal server error while fetching training data' },
      { status: 500 }
    )
  }
}

// New endpoint to delete training images
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const imageId = searchParams.get('id')

    if (!imageId) {
      return NextResponse.json(
        { error: 'Image ID is required' },
        { status: 400 }
      )
    }

    // Get the training image from database
    const trainingImage = await db.trainingImage.findUnique({
      where: { id: imageId }
    })

    if (!trainingImage) {
      return NextResponse.json(
        { error: 'Training image not found' },
        { status: 404 }
      )
    }

    // Delete from local storage if we have the imageId
    if (trainingImage.imageId) {
      try {
        await imageStorage.deleteImage(trainingImage.imageId, 'training')
      } catch (storageError) {
        console.error('Failed to delete image from storage:', storageError)
        // Continue with database deletion even if file deletion fails
      }
    }

    // Delete from database
    await db.trainingImage.delete({
      where: { id: imageId }
    })

    return NextResponse.json({
      success: true,
      message: 'Training image deleted successfully'
    })

  } catch (error) {
    console.error('Training Delete Error:', error)
    return NextResponse.json(
      { error: 'Internal server error while deleting training image' },
      { status: 500 }
    )
  }
}