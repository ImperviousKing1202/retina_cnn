# Retinal Image Samples

This folder contains sample retinal images for the RETINA AI-powered disease detection system.

## Folder Structure

```
retinal-samples/
├── normal/                    # Healthy retinal images
│   └── normal-eye-1.jpg      # Normal fundus photograph
├── glaucoma/                 # Glaucoma detection samples
│   └── glaucoma-eye-1.jpg    # Glaucoma with optic nerve cupping
├── diabetic-retinopathy/     # Diabetic retinopathy samples
│   └── diabetic-retinopathy-eye-1.jpg  # DR with hemorrhages
└── cataract/                 # Cataract detection samples
    └── cataract-eye-1.jpg    # Cataract with cloudy lens
```

## Image Categories

### Normal
- Healthy retina with clear optic disc
- Normal blood vessel patterns
- No signs of disease

### Glaucoma
- Optic nerve cupping
- Increased cup-to-disc ratio
- Glaucomatous damage patterns

### Diabetic Retinopathy
- Microaneurysms
- Hemorrhages
- Cotton wool spots
- Exudates

### Cataract
- Cloudy lens opacity
- Reduced transparency
- Lens opacity patterns

## Usage

These images are used for:
- AI model training and validation
- Detection interface demonstrations
- Educational purposes
- System testing

## Image Specifications

- **Format**: JPEG
- **Resolution**: 1024x1024 pixels
- **Quality**: Medical-grade professional images
- **Purpose**: AI training and demonstration

## Adding New Images

To add new images:
1. Place them in the appropriate condition folder
2. Use consistent naming: `{condition}-eye-{number}.jpg`
3. Ensure images are high-quality medical photographs
4. Update any relevant components that reference these images

## Security Note

These are sample images for demonstration purposes. In production, ensure all patient images are properly anonymized and handled according to HIPAA guidelines.