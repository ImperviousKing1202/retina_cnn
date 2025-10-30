# RETINA - Local Image Storage System

## Overview

The RETINA app now includes a comprehensive local image storage system that automatically saves all uploaded images to the filesystem. This ensures that your retinal images and training data are preserved locally and can be accessed even when offline.

## 📁 Storage Structure

Images are organized in the following directory structure:

```
uploads/
└── images/
    ├── detection/     # Images from disease detection
    ├── training/      # Training images with labels
    └── temp/          # Temporary files (auto-cleaned)
```

## 🚀 Features

### Automatic Image Processing
- **Compression**: Images are automatically compressed to save space
- **Resizing**: Large images are resized to optimal dimensions (max 1920x1080)
- **Format Optimization**: Images are converted to optimal formats (JPEG/PNG)
- **Metadata Extraction**: Image dimensions and format information is stored

### Storage Management
- **Database Integration**: Image metadata is stored in the database with file references
- **Unique Naming**: Each image gets a unique filename with timestamp and UUID
- **Category Organization**: Images are automatically categorized by purpose
- **Size Tracking**: Storage usage is monitored and reported

### Storage Optimization
- **Automatic Cleanup**: Temporary files are cleaned up after 24 hours
- **Manual Optimization**: Compress existing images to save space
- **Storage Statistics**: View detailed storage usage by category
- **Bulk Operations**: Manage multiple images at once

## 📊 Storage Management Interface

### Accessing Storage Manager
1. Go to **Training Mode** from the main page
2. Click on **Manage Storage** button
3. View storage statistics and perform optimization

### Storage Statistics
- **Total Images**: Count of all stored images
- **Storage Used**: Total disk space used
- **By Category**: Breakdown by detection, training, and temp images
- **Average Size**: Average file size per image

### Available Actions
1. **Optimize Images**: Compress and resize existing images
2. **Cleanup Temporary Files**: Remove old temporary files
3. **Refresh Statistics**: Update storage usage information
4. **Delete Individual Images**: Remove specific training images

## 🔧 API Endpoints

### Image Storage
- `POST /api/analyze` - Saves detection images locally
- `POST /api/train` - Saves training images locally
- `GET /api/images?category=detection&filename=xxx.jpg` - Serve stored images
- `DELETE /api/train?id=xxx` - Delete training images

### Storage Management
- `GET /api/storage?action=stats` - Get storage statistics
- `GET /api/storage?action=cleanup` - Cleanup temporary files
- `GET /api/storage?action=optimize` - Optimize storage
- `DELETE /api/storage?confirm=DELETE_ALL_IMAGES` - Clear all storage

## 💾 Database Schema

### Detection Results
```sql
- imageId: Links to stored image file
- imageUrl: Relative path for serving images
- Local file storage in uploads/images/detection/
```

### Training Images
```sql
- imageId: Links to stored image file
- imageUrl: Relative path for serving images
- originalName: Original filename
- fileSize: File size in bytes
- mimeType: Original MIME type
- Local file storage in uploads/images/training/
```

## 🛠️ Configuration

### Image Storage Settings
```typescript
maxFileSize: 10MB              // Maximum file size allowed
allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp']
compressionQuality: 80%         // JPEG compression quality
maxDimensions: 1920x1080        // Maximum image dimensions
```

### Automatic Features
- **File Validation**: Only allowed image types are accepted
- **Size Limits**: Files larger than 10MB are rejected
- **Format Conversion**: Images are optimized for web use
- **Metadata Preservation**: Image metadata is extracted and stored

## 🔍 How It Works

### Detection Flow
1. User uploads or captures retinal image
2. Image is processed (compressed, resized)
3. Processed image is saved to `uploads/images/detection/`
4. Image metadata is stored in database
5. AI analysis is performed on the saved image
6. Results are linked to the stored image

### Training Flow
1. User uploads training image with label
2. Image is processed and saved to `uploads/images/training/`
3. Training metadata is stored in database
4. Image appears in training interface
5. Can be used for AI model training

### Storage Optimization
1. System analyzes existing images
2. Recompresses images with better compression
3. Updates file references in database
4. Reports space saved

## 📱 Offline Support

- **Local Storage**: All images are stored locally
- **Offline Access**: Images can be accessed without internet
- **Sync Capability**: Images can be synced when online
- **Cache Management**: Intelligent caching for performance

## 🔒 Security Features

- **File Type Validation**: Only image files are accepted
- **Size Restrictions**: Large files are automatically rejected
- **Path Sanitization**: Filenames are sanitized to prevent path traversal
- **Access Control**: Images are served through controlled endpoints

## 🚨 Important Notes

- **Backup**: Regularly backup the `uploads/` directory
- **Storage Limits**: Monitor storage usage to avoid running out of space
- **Cleanup**: Regular cleanup of temporary files is recommended
- **Optimization**: Periodic optimization can significantly reduce storage usage

## 📈 Performance Benefits

- **Faster Loading**: Local images load faster than external sources
- **Reduced Bandwidth**: No need to re-download images
- **Better Caching**: Browser can cache local images effectively
- **Offline Capability**: Full functionality without internet connection

This storage system ensures that all your medical images are safely stored locally while maintaining optimal performance and user experience.