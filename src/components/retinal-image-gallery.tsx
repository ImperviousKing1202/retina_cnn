/**
 * Retinal Image Gallery Component
 * Displays sample retinal images for different eye conditions
 */

'use client';

import { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Eye,
  AlertTriangle,
  CheckCircle,
  Info,
  ZoomIn,
  Download,
} from 'lucide-react';
import { RetinaLogo } from '@/components/retina-logo';

interface RetinalImage {
  id: string;
  path: string;
  title: string;
  description: string;
  condition: 'normal' | 'glaucoma' | 'diabeticRetinopathy' | 'cataract';
  severity?: 'mild' | 'moderate' | 'severe';
}

const retinalImages: RetinalImage[] = [
  {
    id: 'normal-1',
    path: '/images/retinal-samples/normal/normal-eye-1.jpg',
    title: 'Normal Retina',
    description: 'Healthy retina with clear optic disc and normal blood vessels',
    condition: 'normal',
  },
  {
    id: 'glaucoma-1',
    path: '/images/retinal-samples/glaucoma/glaucoma-eye-1.jpg',
    title: 'Glaucoma',
    description: 'Optic nerve cupping with increased cup-to-disc ratio',
    condition: 'glaucoma',
    severity: 'moderate',
  },
  {
    id: 'diabetic-retinopathy-1',
    path: '/images/retinal-samples/diabetic-retinopathy/diabetic-retinopathy-eye-1.jpg',
    title: 'Diabetic Retinopathy',
    description: 'Microaneurysms, hemorrhages, and cotton wool spots',
    condition: 'diabeticRetinopathy',
    severity: 'moderate',
  },
  {
    id: 'cataract-1',
    path: '/images/retinal-samples/cataract/cataract-eye-1.jpg',
    title: 'Cataract',
    description: 'Cloudy lens opacity with reduced transparency',
    condition: 'cataract',
    severity: 'moderate',
  },
];

const conditionInfo = {
  normal: {
    label: 'Normal',
    color: 'bg-green-100 text-green-800 border-green-200',
    icon: CheckCircle,
    description: 'Healthy eye with no signs of disease',
  },
  glaucoma: {
    label: 'Glaucoma',
    color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    icon: AlertTriangle,
    description: 'Optic nerve damage causing vision loss',
  },
  diabeticRetinopathy: {
    label: 'Diabetic Retinopathy',
    color: 'bg-orange-100 text-orange-800 border-orange-200',
    icon: AlertTriangle,
    description: 'Diabetes-related retinal damage',
  },
  cataract: {
    label: 'Cataract',
    color: 'bg-blue-100 text-blue-800 border-blue-200',
    icon: AlertTriangle,
    description: 'Clouding of the eye lens',
  },
};

export function RetinalImageGallery() {
  const [selectedImage, setSelectedImage] = useState<RetinalImage | null>(null);
  const [activeTab, setActiveTab] = useState('all');

  const filteredImages =
    activeTab === 'all'
      ? retinalImages
      : retinalImages.filter((img) => img.condition === activeTab);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex justify-center mb-4">
          <RetinaLogo size="lg" showText={false} variant="light" />
        </div>
        <h2 className="text-3xl font-bold text-white">Retinal Image Samples</h2>
        <p className="text-white/80 max-w-2xl mx-auto">
          Sample retinal images for AI-powered disease detection including
          normal, glaucoma, diabetic retinopathy, and cataract conditions.
        </p>
      </div>

      {/* Condition Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5 bg-white/10 border-white/20">
          <TabsTrigger
            value="all"
            className="text-white data-[state=active]:bg-white/20"
          >
            All Images
          </TabsTrigger>
          <TabsTrigger
            value="normal"
            className="text-white data-[state=active]:bg-white/20"
          >
            <CheckCircle className="w-4 h-4 mr-2" /> Normal
          </TabsTrigger>
          <TabsTrigger
            value="glaucoma"
            className="text-white data-[state=active]:bg-white/20"
          >
            <AlertTriangle className="w-4 h-4 mr-2" /> Glaucoma
          </TabsTrigger>
          <TabsTrigger
            value="diabeticRetinopathy"
            className="text-white data-[state=active]:bg-white/20"
          >
            <AlertTriangle className="w-4 h-4 mr-2" /> Diabetic Retinopathy
          </TabsTrigger>
          <TabsTrigger
            value="cataract"
            className="text-white data-[state=active]:bg-white/20"
          >
            <AlertTriangle className="w-4 h-4 mr-2" /> Cataract
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          {/* Image Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredImages.map((image) => {
              const info = conditionInfo[image.condition];
              const Icon = info.icon;

              return (
                <Card
                  key={image.id}
                  className="backdrop-blur-md bg-white/10 border-white/20 text-white hover:bg-white/15 transition-all duration-300 cursor-pointer"
                  onClick={() => setSelectedImage(image)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm">{image.title}</CardTitle>
                      <Icon className="w-4 h-4 text-white/60" />
                    </div>
                    <Badge
                      variant="outline"
                      className={`text-xs ${info.color} border-current`}
                    >
                      {info.label}
                    </Badge>
                  </CardHeader>

                  <CardContent className="space-y-3">
                    <div className="relative aspect-square rounded-lg overflow-hidden bg-black/20">
                      <img
                        src={image.path}
                        alt={image.title}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                        <ZoomIn className="w-6 h-6 text-white" />
                      </div>
                    </div>

                    <p className="text-xs text-white/70 line-clamp-2">
                      {image.description}
                    </p>

                    {image.severity && (
                      <Badge variant="secondary" className="text-xs">
                        {image.severity}
                      </Badge>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>
      </Tabs>

      {/* Condition Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Object.entries(conditionInfo).map(([key, info]) => (
          <Card
            key={key}
            className="backdrop-blur-md bg-white/5 border-white/10 text-white"
          >
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <info.icon className="w-5 h-5" /> {info.label}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-white/70">{info.description}</p>
              <div className="flex items-center justify-between">
                <span className="text-xs text-white/50">
                  {
                    retinalImages.filter((img) => img.condition === key).length
                  }{' '}
                  sample
                  {retinalImages.filter((img) => img.condition === key).length !==
                  1
                    ? 's'
                    : ''}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-white/30 text-white/80 hover:bg-white/10"
                  onClick={() => setActiveTab(key)}
                >
                  View
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Selected Image Modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div
            className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-2xl font-bold text-white">
                  {selectedImage.title}
                </h3>
                <p className="text-white/70">{selectedImage.description}</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="text-white/80 hover:text-white hover:bg-white/10"
                onClick={() => setSelectedImage(null)}
              >
                ×
              </Button>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="relative aspect-square rounded-lg overflow-hidden bg-black/20">
                  <img
                    src={selectedImage.path}
                    alt={selectedImage.title}
                    className="w-full h-full object-contain"
                  />
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-white/30 text-white hover:bg-white/10"
                  >
                    <Download className="w-4 h-4 mr-2" /> Download
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-white/30 text-white hover:bg-white/10"
                  >
                    <Info className="w-4 h-4 mr-2" /> Details
                  </Button>
                </div>
              </div>

              <div className="space-y-4">
                <Card className="bg-white/5 border-white/10 text-white">
                  <CardHeader>
                    <CardTitle className="text-lg">Detection Analysis</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-white/70">Condition:</span>
                      <Badge
                        className={
                          selectedImage.condition === 'normal'
                            ? 'bg-green-100 text-green-800 border-green-200'
                            : selectedImage.condition === 'glaucoma'
                            ? 'bg-yellow-100 text-yellow-800 border-yellow-200'
                            : selectedImage.condition === 'diabeticRetinopathy'
                            ? 'bg-orange-100 text-orange-800 border-orange-200'
                            : 'bg-blue-100 text-blue-800 border-blue-200'
                        }
                      >
                        {selectedImage.condition === 'normal'
                          ? 'Normal'
                          : selectedImage.condition === 'glaucoma'
                          ? 'Glaucoma'
                          : selectedImage.condition === 'diabeticRetinopathy'
                          ? 'Diabetic Retinopathy'
                          : 'Cataract'}
                      </Badge>
                    </div>

                    {selectedImage.severity && (
                      <div className="flex justify-between">
                        <span className="text-white/70">Severity:</span>
                        <Badge variant="secondary">
                          {selectedImage.severity}
                        </Badge>
                      </div>
                    )}

                    <div className="flex justify-between">
                      <span className="text-white/70">AI Confidence:</span>
                      <span className="font-medium">94.2%</span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-white/70">Processing Time:</span>
                      <span className="font-medium">2.4s</span>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white/5 border-white/10 text-white">
                  <CardHeader>
                    <CardTitle className="text-lg">Clinical Notes</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-white/70">
                      This image demonstrates typical characteristics of{' '}
                      {selectedImage.condition.toLowerCase()}. The AI model has
                      identified key features consistent with this condition.
                      Clinical correlation recommended for definitive diagnosis.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default RetinalImageGallery;
