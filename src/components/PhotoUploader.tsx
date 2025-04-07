import React from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload } from 'lucide-react';

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
    <div className="w-full">
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
          </div>
        )}
      </div>
    </div>
  );
};