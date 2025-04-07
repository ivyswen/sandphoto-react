import React, { useState, useRef } from 'react';
import ReactCrop, { Crop, PixelCrop, centerCrop, makeAspectCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { X, Check } from 'lucide-react';

interface ImageCropperProps {
  imageUrl: string;
  aspectRatio: number; // 宽度/高度
  onCropComplete: (croppedImageUrl: string) => void;
  onCancel: () => void;
}

export const ImageCropper: React.FC<ImageCropperProps> = ({
  imageUrl,
  aspectRatio,
  onCropComplete,
  onCancel
}) => {
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const imgRef = useRef<HTMLImageElement>(null);

  // 当图片加载完成时，设置初始裁剪区域
  const onImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const { width, height } = e.currentTarget;
    
    // 创建一个居中的裁剪区域，保持指定的宽高比
    const initialCrop = centerCrop(
      makeAspectCrop(
        {
          unit: '%',
          width: 90,
        },
        aspectRatio,
        width,
        height
      ),
      width,
      height
    );
    
    setCrop(initialCrop);
  };

  // 生成裁剪后的图片
  const handleCropComplete = () => {
    if (!imgRef.current || !completedCrop) return;

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const image = imgRef.current;
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;

    canvas.width = completedCrop.width * scaleX;
    canvas.height = completedCrop.height * scaleY;

    ctx.drawImage(
      image,
      completedCrop.x * scaleX,
      completedCrop.y * scaleY,
      completedCrop.width * scaleX,
      completedCrop.height * scaleY,
      0,
      0,
      completedCrop.width * scaleX,
      completedCrop.height * scaleY
    );

    const croppedImageUrl = canvas.toDataURL('image/jpeg', 1.0);
    onCropComplete(croppedImageUrl);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden">
        <div className="p-4 border-b flex justify-between items-center">
          <h2 className="text-xl font-semibold">裁剪照片</h2>
          <button 
            onClick={onCancel}
            className="p-1 rounded-full hover:bg-gray-100"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <div className="flex-grow overflow-auto p-4 flex items-center justify-center">
          <ReactCrop
            crop={crop}
            onChange={(c) => setCrop(c)}
            onComplete={(c) => setCompletedCrop(c)}
            aspect={aspectRatio}
            className="max-h-[70vh] max-w-full"
          >
            <img
              ref={imgRef}
              src={imageUrl}
              alt="裁剪图片"
              onLoad={onImageLoad}
              className="max-h-[70vh] max-w-full"
            />
          </ReactCrop>
        </div>
        
        <div className="p-4 border-t flex justify-end space-x-2">
          <button
            onClick={onCancel}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-800 font-medium transition-colors"
          >
            取消
          </button>
          <button
            onClick={handleCropComplete}
            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded-lg text-white font-medium transition-colors flex items-center"
          >
            <Check className="w-4 h-4 mr-2" />
            确认裁剪
          </button>
        </div>
      </div>
    </div>
  );
};