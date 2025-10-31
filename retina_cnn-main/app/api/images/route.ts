import { NextRequest, NextResponse } from 'next/server'
import { imageStorage } from '@/lib/image-storage'
import { readFile } from 'fs/promises'

// Serve images from local storage
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category') as 'detection' | 'training' | 'temp'
    const filename = searchParams.get('filename')

    if (!category || !filename) {
      return NextResponse.json(
        { error: 'Category and filename are required' },
        { status: 400 }
      )
    }

    try {
      const directory = await imageStorage.getDirectory(category)
      const imagePath = `${directory}/${filename}`
      
      // Read the image file
      const imageBuffer = await readFile(imagePath)
      
      // Determine content type
      const ext = filename.split('.').pop()?.toLowerCase()
      let contentType = 'image/jpeg'
      
      switch (ext) {
        case 'png':
          contentType = 'image/png'
          break
        case 'webp':
          contentType = 'image/webp'
          break
        case 'jpg':
        case 'jpeg':
          contentType = 'image/jpeg'
          break
      }

      // Return the image with proper headers
      return new NextResponse(imageBuffer, {
        headers: {
          'Content-Type': contentType,
          'Cache-Control': 'public, max-age=31536000', // Cache for 1 year
          'Access-Control-Allow-Origin': '*'
        }
      })

    } catch (fileError) {
      console.error('Error reading image file:', fileError)
      return NextResponse.json(
        { error: 'Image not found' },
        { status: 404 }
      )
    }

  } catch (error) {
    console.error('Image serve error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}