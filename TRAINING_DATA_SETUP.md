# Training Data Setup Guide

This guide will help you set up training images for your eye illness detection AI model after downloading the code.

## 📁 Folder Structure

Create the following folder structure in your project:

```
/public/training-data/
├── normal/
│   ├── healthy-001.jpg
│   ├── healthy-002.jpg
│   └── ...
├── illness/
│   ├── diabetic-retinopathy/
│   │   ├── mild-001.jpg
│   │   ├── moderate-001.jpg
│   │   ├── severe-001.jpg
│   │   └── ...
│   ├── glaucoma/
│   │   ├── early-001.jpg
│   │   ├── advanced-001.jpg
│   │   └── ...
│   ├── cataract/
│   │   ├── nuclear-001.jpg
│   │   ├── cortical-001.jpg
│   │   └── ...
│   └── amd/
│       ├── dry-001.jpg
│       ├── wet-001.jpg
│       └── ...
└── metadata/
    ├── annotations.json
    └── labels.csv
```

## 🖼️ Image Categories

### 1. Normal Eyes (`/normal/`)
- Healthy retinal images with no detectable conditions
- Clear optic disc, macula, and blood vessels
- No signs of disease or abnormalities

### 2. Diabetic Retinopathy (`/illness/diabetic-retinopathy/`)
- **Mild**: Microaneurysms, small hemorrhages
- **Moderate**: More numerous microaneurysms, cotton wool spots
- **Severe**: Extensive hemorrhages, neovascularization

### 3. Glaucoma (`/illness/glaucoma/`)
- **Early**: Slight cupping of optic disc
- **Moderate**: Noticeable cup-to-disc ratio increase
- **Advanced**: Severe cupping, visual field loss

### 4. Cataract (`/illness/cataract/`)
- **Nuclear**: Central lens opacity
- **Cortical**: Spoke-like opacities
- **Posterior Subcapsular**: Back of lens opacity

### 5. Age-Related Macular Degeneration (`/illness/amd/`)
- **Dry**: Drusen, geographic atrophy
- **Wet**: Choroidal neovascularization, hemorrhage

## ⚙️ Configuration Setup

### Step 1: Update Training Data Configuration

Edit `src/lib/training-data.ts` and add your image metadata:

```typescript
// Example for normal eyes
{
  id: "normal-001",
  filename: "healthy-001.jpg",
  category: "normal",
  label: "Healthy Retina",
  description: "Normal retinal image with no abnormalities",
  metadata: {
    age: 45,
    gender: "female",
    camera: "fundus-camera",
    resolution: "1920x1080"
  }
}

// Example for diabetic retinopathy
{
  id: "dr-mild-001",
  filename: "mild-001.jpg",
  category: "illness",
  subcategory: "diabetic-retinopathy",
  label: "Mild Diabetic Retinopathy",
  description: "Early stage diabetic retinopathy with microaneurysms",
  metadata: {
    age: 62,
    gender: "male",
    condition: "diabetic-retinopathy",
    severity: "mild",
    camera: "fundus-camera",
    resolution: "1920x1080"
  }
}
```

### Step 2: Update Image Counts

Update the `count` property for each category:

```typescript
{
  name: "Normal",
  count: 150, // Update with actual number of images
  // ... other properties
}
```

### Step 3: Update Total Count

Update the `totalImages` property:

```typescript
export const TRAINING_DATA_CONFIG: TrainingDataset = {
  // ... other properties
  totalImages: 500, // Sum of all category counts
  // ... other properties
};
```

## 📊 Recommended Dataset Size

For optimal model performance:

| Category | Minimum Images | Recommended Images |
|----------|----------------|-------------------|
| Normal | 100 | 500+ |
| Diabetic Retinopathy | 80 | 400+ |
| Glaucoma | 60 | 300+ |
| Cataract | 60 | 300+ |
| AMD | 40 | 200+ |
| **Total** | **340** | **1700+** |

## 🎯 Image Quality Requirements

### Technical Specifications
- **Format**: JPG, PNG, or DICOM
- **Resolution**: Minimum 1024x1024 pixels
- **Quality**: Clear, well-focused images
- **Size**: Under 5MB per image
- **Color**: True color (24-bit)

### Content Requirements
- Complete optic disc visible
- Macula region included
- Good contrast and brightness
- Minimal artifacts or reflections
- Proper field of view (45° or wider)

## 🏷️ Metadata Guidelines

### Required Fields
- `id`: Unique identifier
- `filename`: Image filename
- `category`: "normal" or "illness"
- `label`: Human-readable label

### Optional but Recommended
- `age`: Patient age
- `gender`: Patient gender
- `condition`: Specific condition name
- `severity`: Disease severity level
- `camera`: Camera type used
- `resolution`: Image resolution
- `description`: Brief description

## ✅ Validation

The training data manager includes automatic validation:

1. **Structure Validation**: Ensures all required fields are present
2. **Path Validation**: Checks if file paths are correctly formatted
3. **Consistency Validation**: Verifies data consistency across categories

Access the validation results in the Training Data Manager interface at `/training-data`.

## 🔄 Data Management

### Adding New Images
1. Place images in appropriate folders
2. Add metadata to configuration file
3. Update image counts
4. Run validation

### Updating Metadata
1. Edit `src/lib/training-data.ts`
2. Update relevant image entries
3. Save and refresh the interface

### Exporting Configuration
Use the Training Data Manager interface to export your configuration as JSON for backup or sharing.

## 🚀 Best Practices

### Data Collection
- Ensure diverse patient demographics
- Include various disease stages
- Maintain balance between categories
- Use consistent imaging protocols

### Quality Control
- Review all images for quality
- Remove blurry or corrupted images
- Verify correct categorization
- Document image sources

### Version Control
- Track dataset versions
- Document changes and additions
- Maintain backup copies
- Use consistent naming conventions

## 📞 Support

For questions or issues with training data setup:

1. Check the validation results in the interface
2. Review this documentation
3. Ensure all folder paths are correct
4. Verify image formats and quality

## 🔄 Next Steps

After setting up your training data:

1. Validate the dataset using the interface
2. Export the configuration for backup
3. Begin model training with your prepared dataset
4. Monitor model performance and iterate on data quality

---

**Note**: This training data setup is designed for local development and testing. For production use, ensure you have proper data privacy and security measures in place, especially when working with patient medical data.