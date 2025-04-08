import React, { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import { X, Check } from 'lucide-react';

interface ImageCropperProps {
  imageUrl: string;
  aspectRatio: number;
  onCropComplete: (croppedArea: any, croppedAreaPixels: any) => void;
  onCancel: () => void;
}

// 创建图片对象
const createImage = (url: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener('load', () => resolve(image));
    image.addEventListener('error', error => reject(error));
    image.src = url;
  });

// 获取图片类型
const getImageType = (url: string): string => {
  if (url.toLowerCase().includes('.png') || url.toLowerCase().includes('image/png')) {
    return 'image/png';
  }
  return 'image/jpeg';
};

// 获取裁剪后的图片
async function getCroppedImg(
  imageSrc: string,
  pixelCrop: { x: number; y: number; width: number; height: number }
): Promise<string> {
  const image = await createImage(imageSrc);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d', { alpha: true });

  if (!ctx) {
    throw new Error('No 2d context');
  }

  // 设置画布尺寸
  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;

  // 清除画布并确保背景透明
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // 绘制裁剪的图片
  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height
  );

  // 获取图片类型
  const imageType = getImageType(imageSrc);
  
  // 返回 base64 格式的图片数据
  return canvas.toDataURL(imageType, 1.0);
}

export const ImageCropper: React.FC<ImageCropperProps> = ({
  imageUrl,
  aspectRatio,
  onCropComplete,
  onCancel
}) => {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);

  const handleCropComplete = useCallback(async (_: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleSave = useCallback(async () => {
    try {
      if (croppedAreaPixels) {
        const croppedImage = await getCroppedImg(imageUrl, croppedAreaPixels);
        onCropComplete(croppedImage, croppedAreaPixels);
      }
    } catch (e) {
      console.error('Error cropping image:', e);
    }
  }, [croppedAreaPixels, imageUrl, onCropComplete]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-4xl overflow-hidden flex flex-col">
        <div className="p-4 border-b flex justify-between items-center">
          <h2 className="text-xl font-semibold">裁剪照片</h2>
          <button 
            onClick={onCancel}
            className="p-1 rounded-full hover:bg-gray-100"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <div className="flex-grow relative h-[60vh]">
          <Cropper
            image={imageUrl}
            crop={crop}
            zoom={zoom}
            aspect={aspectRatio}
            onCropChange={setCrop}
            onCropComplete={handleCropComplete}
            onZoomChange={setZoom}
            objectFit="contain"
          />
        </div>
        
        <div className="p-4 border-t flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <label className="text-sm text-gray-600">缩放:</label>
            <input
              type="range"
              value={zoom}
              min={1}
              max={3}
              step={0.1}
              aria-labelledby="Zoom"
              onChange={(e) => setZoom(Number(e.target.value))}
              className="w-32"
            />
          </div>
          
          <div className="flex space-x-2">
            <button
              onClick={onCancel}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-800 font-medium transition-colors"
            >
              取消
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded-lg text-white font-medium transition-colors flex items-center"
            >
              <Check className="w-4 h-4 mr-2" />
              确认裁剪
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};