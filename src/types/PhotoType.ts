export interface PhotoType {
  id: string;
  name: string;
  widthCm: number;
  heightCm: number;
  category?: string;
}

export interface ContainerType {
  id: string;
  name: string;
  widthCm: number;
  heightCm: number;
}

export interface AppState {
  selectedPhotoType: PhotoType | null;
  selectedContainerType: ContainerType | null;
  lineColor: string;
  uploadedImage: File | null;
  previewUrl: string | null;
  processedImageUrl: string | null;
  isProcessing: boolean;
  error: string | null;
}