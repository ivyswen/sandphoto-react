import React from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, ExternalLink } from 'lucide-react';

interface PhotoUploaderProps {
  onUpload: (files: File[]) => void;
}

export const PhotoUploader: React.FC<PhotoUploaderProps> = ({ onUpload }) => {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.bmp', '.tiff']
    },
    maxSize: 8 * 1024 * 1024,
    onDrop: onUpload
  });

  return (
    <div className="w-full space-y-4">
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
          ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}`}
      >
        <input {...getInputProps()} />
        <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
        {isDragActive ? (
          <p className="text-lg text-blue-500">拖放照片到这里 ...</p>
        ) : (
          <div>
            <p className="text-lg text-gray-600">拖放照片到这里，或点击选择照片</p>
            <p className="text-sm text-gray-400 mt-2">支持 JPG, PNG, BMP, TIFF 格式，最大 8MB</p>
            <p className="text-sm text-gray-400 mt-1">上传透明背景的PNG图片可以使用预设背景</p>
          </div>
        )}
      </div>
      <div className="flex items-center justify-center text-sm">
        <a 
          href="https://www.remove.bg/zh" 
          target="_blank" 
          rel="noopener noreferrer"
          className="flex items-center text-blue-500 hover:text-blue-700 transition-colors"
        >
          <ExternalLink className="w-4 h-4 mr-1" />
          去 Remove.bg 制作透明背景图片
        </a>
      </div>
    </div>
  );
};