/**
 * Dataset Management Component for RETINA CNN System
 * Comprehensive dataset management with advanced labeling and organization
 */

'use client';

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Database, 
  Upload, 
  Download, 
  Search, 
  Filter,
  Grid3X3,
  List,
  Tag,
  FolderOpen,
  FolderPlus,
  Edit,
  Trash2,
  Save,
  Copy,
  Share2,
  Eye,
  EyeOff,
  CheckCircle,
  AlertCircle,
  Clock,
  Calendar,
  User,
  Hospital,
  Stethoscope,
  FileImage,
  BarChart3,
  Settings,
  RefreshCw,
  Plus,
  X,
  ChevronDown,
  ChevronRight,
  Archive,
  Star,
  Flag,
  MessageSquare,
  Layers,
  Move,
  Lock,
  Unlock
} from 'lucide-react';

interface DatasetImage {
  id: string;
  filename: string;
  originalName: string;
  image: HTMLImageElement;
  category: 'normal' | 'glaucoma' | 'retinopathy' | 'cataract' | 'other';
  subcategory?: string;
  severity?: 'mild' | 'moderate' | 'severe' | 'proliferative';
  labels: string[];
  metadata: {
    uploadDate: string;
    fileSize: number;
    dimensions: { width: number; height: number };
    quality: 'excellent' | 'good' | 'fair' | 'poor';
    verified: boolean;
    notes?: string;
    patientInfo?: {
      age?: number;
      gender?: string;
      medicalHistory?: string;
    };
    source?: string;
    photographer?: string;
    equipment?: string;
  };
  annotations?: {
    boundingBoxes: Array<{
      x: number;
      y: number;
      width: number;
      height: number;
      label: string;
      confidence: number;
    }>;
    points: Array<{
      x: number;
      y: number;
      label: string;
    }>;
    regions: Array<{
      name: string;
      points: Array<{ x: number; y: number }>;
      label: string;
    }>;
  };
}

interface DatasetCollection {
  id: string;
  name: string;
  description: string;
  images: DatasetImage[];
  labels: string[];
  categories: string[];
  created: string;
  modified: string;
  size: number;
  isPublic: boolean;
  owner: string;
  collaborators: string[];
  version: number;
  tags: string[];
}

interface LabelingTask {
  id: string;
  name: string;
  description: string;
  type: 'classification' | 'detection' | 'segmentation';
  status: 'pending' | 'in_progress' | 'completed';
  assignedTo?: string;
  progress: number;
  totalImages: number;
  completedImages: number;
  dueDate?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  instructions?: string;
}

export default function DatasetManagementSystem() {
  // State Management
  const [collections, setCollections] = useState<DatasetCollection[]>([]);
  const [selectedCollection, setSelectedCollection] = useState<DatasetCollection | null>(null);
  const [images, setImages] = useState<DatasetImage[]>([]);
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterLabels, setFilterLabels] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<string>('date');
  const [activeTab, setActiveTab] = useState('collections');

  // Labeling State
  const [labelingMode, setLabelingMode] = useState(false);
  const [currentLabelingTask, setCurrentLabelingTask] = useState<LabelingTask | null>(null);
  const [labelingTasks, setLabelingTasks] = useState<LabelingTask[]>([]);
  const [customLabels, setCustomLabels] = useState<string[]>([]);
  const [newLabel, setNewLabel] = useState('');

  // Collection Management
  const [showNewCollectionDialog, setShowNewCollectionDialog] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState('');
  const [newCollectionDescription, setNewCollectionDescription] = useState('');
  const [editingImage, setEditingImage] = useState<DatasetImage | null>(null);

  // Refs
  const fileInputRef = useRef<HTMLInputElement>(null);
  const bulkUploadInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = () => {
    // Load sample collections
    const sampleCollections: DatasetCollection[] = [
      {
        id: 'collection_1',
        name: 'Glaucoma Dataset v1.0',
        description: 'Comprehensive glaucoma detection dataset with normal and abnormal cases',
        images: [],
        labels: ['normal', 'glaucoma', 'early-glaucoma', 'advanced-glaucoma'],
        categories: ['normal', 'glaucoma'],
        created: new Date().toISOString(),
        modified: new Date().toISOString(),
        size: 0,
        isPublic: false,
        owner: 'Dr. Smith',
        collaborators: ['Dr. Johnson'],
        version: 1,
        tags: ['glaucoma', 'ophthalmology', 'retina']
      },
      {
        id: 'collection_2',
        name: 'Diabetic Retinopathy Collection',
        description: 'DR dataset with all severity levels',
        images: [],
        labels: ['no-dr', 'mild', 'moderate', 'severe', 'proliferative'],
        categories: ['normal', 'retinopathy'],
        created: new Date().toISOString(),
        modified: new Date().toISOString(),
        size: 0,
        isPublic: true,
        owner: 'Hospital Research',
        collaborators: [],
        version: 2,
        tags: ['diabetic-retinopathy', 'diabetes', 'multi-class']
      }
    ];

    setCollections(sampleCollections);
    setCustomLabels(['normal', 'abnormal', 'glaucoma', 'retinopathy', 'cataract', 'mild', 'moderate', 'severe']);
  };

  const handleBulkUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || !selectedCollection) return;

    try {
      const newImages: DatasetImage[] = [];
      
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const image = await loadImageFile(file);
        
        const datasetImage: DatasetImage = {
          id: `img_${Date.now()}_${i}`,
          filename: file.name,
          originalName: file.name,
          image,
          category: inferCategoryFromFilename(file.name),
          labels: [],
          metadata: {
            uploadDate: new Date().toISOString(),
            fileSize: file.size,
            dimensions: { width: image.width, height: image.height },
            quality: 'good',
            verified: false
          }
        };
        
        newImages.push(datasetImage);
      }
      
      setImages(prev => [...prev, ...newImages]);
      
      // Update collection
      const updatedCollection = {
        ...selectedCollection,
        images: [...selectedCollection.images, ...newImages],
        size: selectedCollection.size + newImages.length,
        modified: new Date().toISOString()
      };
      
      setSelectedCollection(updatedCollection);
      setCollections(prev => prev.map(c => c.id === updatedCollection.id ? updatedCollection : c));
      
    } catch (error) {
      console.error('Failed to upload images:', error);
    }
  };

  const loadImageFile = (file: File): Promise<HTMLImageElement> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = e.target?.result as string;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const inferCategoryFromFilename = (filename: string): DatasetImage['category'] => {
    const lower = filename.toLowerCase();
    if (lower.includes('glaucoma')) return 'glaucoma';
    if (lower.includes('retinopathy') || lower.includes('dr')) return 'retinopathy';
    if (lower.includes('cataract')) return 'cataract';
    if (lower.includes('normal') || lower.includes('healthy')) return 'normal';
    return 'other';
  };

  const createNewCollection = () => {
    if (!newCollectionName.trim()) return;

    const newCollection: DatasetCollection = {
      id: `collection_${Date.now()}`,
      name: newCollectionName,
      description: newCollectionDescription,
      images: [],
      labels: [],
      categories: [],
      created: new Date().toISOString(),
      modified: new Date().toISOString(),
      size: 0,
      isPublic: false,
      owner: 'Current User',
      collaborators: [],
      version: 1,
      tags: []
    };

    setCollections(prev => [...prev, newCollection]);
    setSelectedCollection(newCollection);
    setNewCollectionName('');
    setNewCollectionDescription('');
    setShowNewCollectionDialog(false);
  };

  const addCustomLabel = () => {
    if (newLabel.trim() && !customLabels.includes(newLabel.trim())) {
      setCustomLabels(prev => [...prev, newLabel.trim()]);
      setNewLabel('');
    }
  };

  const removeCustomLabel = (label: string) => {
    setCustomLabels(prev => prev.filter(l => l !== label));
  };

  const updateImageLabels = (imageId: string, labels: string[]) => {
    setImages(prev => prev.map(img => 
      img.id === imageId ? { ...img, labels } : img
    ));
  };

  const updateImageCategory = (imageId: string, category: DatasetImage['category']) => {
    setImages(prev => prev.map(img => 
      img.id === imageId ? { ...img, category } : img
    ));
  };

  const updateImageMetadata = (imageId: string, metadata: Partial<DatasetImage['metadata']>) => {
    setImages(prev => prev.map(img => 
      img.id === imageId ? { ...img, metadata: { ...img.metadata, ...metadata } } : img
    ));
  };

  const deleteSelectedImages = () => {
    setImages(prev => prev.filter(img => !selectedImages.includes(img.id)));
    setSelectedImages([]);
  };

  const exportDataset = () => {
    const dataset = {
      collection: selectedCollection,
      images: images.map(img => ({
        id: img.id,
        filename: img.filename,
        category: img.category,
        labels: img.labels,
        metadata: img.metadata
      })),
      exportDate: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(dataset, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selectedCollection?.name || 'dataset'}_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const createLabelingTask = () => {
    if (!selectedCollection) return;

    const task: LabelingTask = {
      id: `task_${Date.now()}`,
      name: `Label ${selectedCollection.name}`,
      description: 'Classify images and add appropriate labels',
      type: 'classification',
      status: 'pending',
      progress: 0,
      totalImages: images.filter(img => img.labels.length === 0).length,
      completedImages: 0,
      priority: 'medium',
      instructions: 'Review each image and assign appropriate labels based on the observed conditions.'
    };

    setLabelingTasks(prev => [...prev, task]);
    setCurrentLabelingTask(task);
    setLabelingMode(true);
  };

  const filteredImages = images.filter(img => {
    const matchesSearch = img.filename.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = filterCategory === 'all' || img.category === filterCategory;
    const matchesLabels = filterLabels.length === 0 || filterLabels.some(label => img.labels.includes(label));
    return matchesSearch && matchesCategory && matchesLabels;
  });

  const sortedImages = [...filteredImages].sort((a, b) => {
    switch (sortBy) {
      case 'date':
        return new Date(b.metadata.uploadDate).getTime() - new Date(a.metadata.uploadDate).getTime();
      case 'name':
        return a.filename.localeCompare(b.filename);
      case 'category':
        return a.category.localeCompare(b.category);
      case 'quality':
        const qualityOrder = { 'excellent': 4, 'good': 3, 'fair': 2, 'poor': 1 };
        return qualityOrder[b.metadata.quality] - qualityOrder[a.metadata.quality];
      default:
        return 0;
    }
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="backdrop-blur-md bg-white/10 border-white/20 text-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="w-6 h-6" />
            Dataset Management System
          </CardTitle>
          <CardDescription className="text-white/60">
            Comprehensive dataset management with advanced labeling and organization
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Database className="w-4 h-4 text-blue-400" />
                <span className="text-sm">{collections.length} collections</span>
              </div>
              <div className="flex items-center gap-2">
                <FileImage className="w-4 h-4 text-green-400" />
                <span className="text-sm">{images.length} images</span>
              </div>
              <div className="flex items-center gap-2">
                <Tag className="w-4 h-4 text-purple-400" />
                <span className="text-sm">{customLabels.length} labels</span>
              </div>
            </div>
            <Button
              onClick={() => setShowNewCollectionDialog(true)}
              className="bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 text-blue-300"
            >
              <FolderPlus className="w-4 h-4 mr-2" />
              New Collection
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Main Interface */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4 bg-transparent border-white/20">
          <TabsTrigger value="collections" className="text-white data-[state=active]:bg-white/10">
            <FolderOpen className="w-4 h-4 mr-2" />
            Collections
          </TabsTrigger>
          <TabsTrigger value="images" className="text-white data-[state=active]:bg-white/10">
            <FileImage className="w-4 h-4 mr-2" />
            Images
          </TabsTrigger>
          <TabsTrigger value="labeling" className="text-white data-[state=active]:bg-white/10">
            <Tag className="w-4 h-4 mr-2" />
            Labeling
          </TabsTrigger>
          <TabsTrigger value="analytics" className="text-white data-[state=active]:bg-white/10">
            <BarChart3 className="w-4 h-4 mr-2" />
            Analytics
          </TabsTrigger>
        </TabsList>

        {/* Collections Tab */}
        <TabsContent value="collections" className="space-y-6">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {collections.map((collection) => (
              <Card
                key={collection.id}
                className={`backdrop-blur-md bg-white/10 border-white/20 text-white cursor-pointer transition-all hover:bg-white/15 ${
                  selectedCollection?.id === collection.id ? 'ring-2 ring-blue-400' : ''
                }`}
                onClick={() => setSelectedCollection(collection)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{collection.name}</CardTitle>
                      <CardDescription className="text-white/60 text-sm">
                        {collection.description}
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-1">
                      {collection.isPublic ? (
                        <Unlock className="w-4 h-4 text-green-400" />
                      ) : (
                        <Lock className="w-4 h-4 text-yellow-400" />
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-white/60">Images:</span>
                      <span className="ml-2 font-semibold">{collection.size}</span>
                    </div>
                    <div>
                      <span className="text-white/60">Labels:</span>
                      <span className="ml-2 font-semibold">{collection.labels.length}</span>
                    </div>
                    <div>
                      <span className="text-white/60">Version:</span>
                      <span className="ml-2 font-semibold">v{collection.version}</span>
                    </div>
                    <div>
                      <span className="text-white/60">Owner:</span>
                      <span className="ml-2 font-semibold">{collection.owner}</span>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-1">
                    {collection.tags.slice(0, 3).map((tag) => (
                      <Badge key={tag} className="bg-blue-500/20 text-blue-300 border-blue-500/30 text-xs">
                        {tag}
                      </Badge>
                    ))}
                    {collection.tags.length > 3 && (
                      <Badge className="bg-gray-500/20 text-gray-300 border-gray-500/30 text-xs">
                        +{collection.tags.length - 3}
                      </Badge>
                    )}
                  </div>

                  <div className="flex items-center justify-between text-xs text-white/60">
                    <span>Modified {new Date(collection.modified).toLocaleDateString()}</span>
                    <div className="flex items-center gap-2">
                      {collection.collaborators.length > 0 && (
                        <span>{collection.collaborators.length} collaborators</span>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Images Tab */}
        <TabsContent value="images" className="space-y-6">
          {!selectedCollection ? (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Please select a collection to manage its images.
              </AlertDescription>
            </Alert>
          ) : (
            <>
              {/* Upload and Controls */}
              <Card className="backdrop-blur-md bg-white/10 border-white/20 text-white">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <FileImage className="w-5 h-5" />
                      {selectedCollection.name} - Images
                    </span>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-2 bg-white/10 rounded-lg p-1">
                        <Button
                          size="sm"
                          variant={viewMode === 'grid' ? 'default' : 'ghost'}
                          onClick={() => setViewMode('grid')}
                          className="h-8 w-8 p-0"
                        >
                          <Grid3X3 className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant={viewMode === 'list' ? 'default' : 'ghost'}
                          onClick={() => setViewMode('list')}
                          className="h-8 w-8 p-0"
                        >
                          <List className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-wrap items-center gap-4">
                    <input
                      ref={bulkUploadInputRef}
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleBulkUpload}
                      className="hidden"
                    />
                    <Button
                      onClick={() => bulkUploadInputRef.current?.click()}
                      className="bg-green-500/20 hover:bg-green-500/30 border border-green-500/30 text-green-300"
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      Bulk Upload
                    </Button>
                    
                    <div className="flex items-center gap-2">
                      <Search className="w-4 h-4 text-white/60" />
                      <Input
                        placeholder="Search images..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="bg-white/10 border-white/20 text-white placeholder-white/60"
                      />
                    </div>

                    <Select value={filterCategory} onValueChange={setFilterCategory}>
                      <SelectTrigger className="w-40 bg-white/10 border-white/20">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Categories</SelectItem>
                        <SelectItem value="normal">Normal</SelectItem>
                        <SelectItem value="glaucoma">Glaucoma</SelectItem>
                        <SelectItem value="retinopathy">Retinopathy</SelectItem>
                        <SelectItem value="cataract">Cataract</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>

                    <Select value={sortBy} onValueChange={setSortBy}>
                      <SelectTrigger className="w-32 bg-white/10 border-white/20">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="date">Date</SelectItem>
                        <SelectItem value="name">Name</SelectItem>
                        <SelectItem value="category">Category</SelectItem>
                        <SelectItem value="quality">Quality</SelectItem>
                      </SelectContent>
                    </Select>

                    {selectedImages.length > 0 && (
                      <div className="flex items-center gap-2 ml-auto">
                        <span className="text-sm text-white/60">
                          {selectedImages.length} selected
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={deleteSelectedImages}
                          className="border-red-500/30 text-red-400 hover:bg-red-500/10"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={exportDataset}
                          className="border-white/30 text-white hover:bg-white/10"
                        >
                          <Download className="w-4 h-4 mr-2" />
                          Export
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Images Grid/List */}
              {sortedImages.length === 0 ? (
                <Card className="backdrop-blur-md bg-white/10 border-white/20 text-white">
                  <CardContent className="text-center py-12">
                    <FolderOpen className="w-16 h-16 mx-auto mb-4 text-white/20" />
                    <p className="text-white/60">No images in this collection yet</p>
                    <Button
                      onClick={() => bulkUploadInputRef.current?.click()}
                      className="mt-4 bg-green-500/20 hover:bg-green-500/30 border border-green-500/30 text-green-300"
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      Upload Images
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className={viewMode === 'grid' ? 'grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4' : 'space-y-2'}>
                  {sortedImages.map((image) => (
                    <div
                      key={image.id}
                      className={`relative group cursor-pointer rounded-lg overflow-hidden border-2 ${
                        selectedImages.includes(image.id)
                          ? 'border-blue-400 bg-blue-400/10'
                          : 'border-white/20 bg-white/5 hover:bg-white/10'
                      }`}
                      onClick={() => {
                        setSelectedImages(prev =>
                          prev.includes(image.id)
                            ? prev.filter(id => id !== image.id)
                            : [...prev, image.id]
                        );
                      }}
                    >
                      <img
                        src={image.image.src}
                        alt={image.filename}
                        className="w-full h-32 object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="absolute bottom-1 left-1 right-1">
                          <p className="text-xs text-white truncate">{image.filename}</p>
                          <div className="flex items-center justify-between">
                            <Badge className={`text-xs ${
                              image.category === 'normal' ? 'bg-green-500/20 text-green-300' :
                              image.category === 'glaucoma' ? 'bg-purple-500/20 text-purple-300' :
                              image.category === 'retinopathy' ? 'bg-blue-500/20 text-blue-300' :
                              image.category === 'cataract' ? 'bg-yellow-500/20 text-yellow-300' :
                              'bg-gray-500/20 text-gray-300'
                            }`}>
                              {image.category}
                            </Badge>
                            {image.metadata.verified && (
                              <CheckCircle className="w-3 h-3 text-green-400" />
                            )}
                          </div>
                          {image.labels.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-1">
                              {image.labels.slice(0, 2).map((label) => (
                                <Badge key={label} className="bg-blue-500/20 text-blue-300 text-xs">
                                  {label}
                                </Badge>
                              ))}
                              {image.labels.length > 2 && (
                                <Badge className="bg-gray-500/20 text-gray-300 text-xs">
                                  +{image.labels.length - 2}
                                </Badge>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                      {selectedImages.includes(image.id) && (
                        <div className="absolute top-2 right-2">
                          <CheckCircle className="w-4 h-4 text-blue-400" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </TabsContent>

        {/* Labeling Tab */}
        <TabsContent value="labeling" className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Label Management */}
            <Card className="backdrop-blur-md bg-white/10 border-white/20 text-white">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Tag className="w-5 h-5" />
                  Label Management
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="Add new label..."
                    value={newLabel}
                    onChange={(e) => setNewLabel(e.target.value)}
                    className="bg-white/10 border-white/20 text-white placeholder-white/60"
                    onKeyPress={(e) => e.key === 'Enter' && addCustomLabel()}
                  />
                  <Button
                    onClick={addCustomLabel}
                    className="bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 text-blue-300"
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                
                <div className="space-y-2">
                  <h4 className="font-semibold">Available Labels</h4>
                  <div className="flex flex-wrap gap-2">
                    {customLabels.map((label) => (
                      <Badge
                        key={label}
                        className="bg-purple-500/20 text-purple-300 border-purple-500/30 cursor-pointer hover:bg-purple-500/30"
                      >
                        {label}
                        <X
                          className="w-3 h-3 ml-1 cursor-pointer"
                          onClick={() => removeCustomLabel(label)}
                        />
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="font-semibold">Labeling Tasks</h4>
                  <div className="space-y-2">
                    {labelingTasks.length === 0 ? (
                      <p className="text-sm text-white/60">No labeling tasks created</p>
                    ) : (
                      labelingTasks.map((task) => (
                        <div
                          key={task.id}
                          className="p-3 bg-white/5 rounded-lg border border-white/10"
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <h5 className="font-medium">{task.name}</h5>
                              <p className="text-sm text-white/60">{task.description}</p>
                            </div>
                            <Badge className={
                              task.status === 'completed' ? 'bg-green-500/20 text-green-300' :
                              task.status === 'in_progress' ? 'bg-blue-500/20 text-blue-300' :
                              'bg-gray-500/20 text-gray-300'
                            }>
                              {task.status}
                            </Badge>
                          </div>
                          <div className="mt-2">
                            <Progress value={task.progress} className="h-2" />
                            <p className="text-xs text-white/60 mt-1">
                              {task.completedImages}/{task.totalImages} images
                            </p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                <Button
                  onClick={createLabelingTask}
                  disabled={!selectedCollection || images.length === 0}
                  className="w-full bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/30 text-purple-300"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create Labeling Task
                </Button>
              </CardContent>
            </Card>

            {/* Quick Labeling */}
            <Card className="backdrop-blur-md bg-white/10 border-white/20 text-white">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Edit className="w-5 h-5" />
                  Quick Labeling
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {selectedImages.length === 0 ? (
                  <p className="text-sm text-white/60">Select images to apply labels</p>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <Label className="text-sm">Category</Label>
                      <Select onValueChange={(value) => {
                        selectedImages.forEach(id => updateImageCategory(id, value as any));
                      }}>
                        <SelectTrigger className="bg-white/10 border-white/20">
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="normal">Normal</SelectItem>
                          <SelectItem value="glaucoma">Glaucoma</SelectItem>
                          <SelectItem value="retinopathy">Retinopathy</SelectItem>
                          <SelectItem value="cataract">Cataract</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label className="text-sm">Labels</Label>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {customLabels.map((label) => (
                          <Badge
                            key={label}
                            className="bg-blue-500/20 text-blue-300 border-blue-500/30 cursor-pointer hover:bg-blue-500/30"
                            onClick={() => {
                              selectedImages.forEach(id => {
                                const image = images.find(img => img.id === id);
                                if (image && !image.labels.includes(label)) {
                                  updateImageLabels(id, [...image.labels, label]);
                                }
                              });
                            }}
                          >
                            {label}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div>
                      <Label className="text-sm">Verification Status</Label>
                      <div className="flex gap-2 mt-2">
                        <Button
                          size="sm"
                          onClick={() => {
                            selectedImages.forEach(id => updateImageMetadata(id, { verified: true }));
                          }}
                          className="bg-green-500/20 hover:bg-green-500/30 border border-green-500/30 text-green-300"
                        >
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Verify
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            selectedImages.forEach(id => updateImageMetadata(id, { verified: false }));
                          }}
                          className="border-white/30 text-white hover:bg-white/10"
                        >
                          <X className="w-4 h-4 mr-2" />
                          Unverify
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <Card className="backdrop-blur-md bg-white/10 border-white/20 text-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Dataset Analytics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <BarChart3 className="w-16 h-16 mx-auto mb-4 text-white/20" />
                <p className="text-white/60">Analytics features coming soon</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* New Collection Dialog */}
      {showNewCollectionDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="bg-gray-900 border-white/20 text-white w-full max-w-md">
            <CardHeader>
              <CardTitle>Create New Collection</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="collectionName">Collection Name</Label>
                <Input
                  id="collectionName"
                  value={newCollectionName}
                  onChange={(e) => setNewCollectionName(e.target.value)}
                  className="bg-white/10 border-white/20 text-white placeholder-white/60"
                  placeholder="Enter collection name"
                />
              </div>
              <div>
                <Label htmlFor="collectionDescription">Description</Label>
                <Textarea
                  id="collectionDescription"
                  value={newCollectionDescription}
                  onChange={(e) => setNewCollectionDescription(e.target.value)}
                  className="bg-white/10 border-white/20 text-white placeholder-white/60"
                  placeholder="Enter collection description"
                  rows={3}
                />
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={createNewCollection}
                  className="bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 text-blue-300"
                >
                  Create
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowNewCollectionDialog(false)}
                  className="border-white/30 text-white hover:bg-white/10"
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}