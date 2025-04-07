import React, { useState, useEffect } from 'react';
import { PhotoUploader } from './components/PhotoUploader';
import { SizeSelector } from './components/SizeSelector';
import { LineColorSelector } from './components/LineColorSelector';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { PhotoType, ContainerType, AppState } from './types/PhotoType';
import { Image as ImageIcon, Download, Loader2, RotateCw } from 'lucide-react';
import { PhotoLayoutService } from './services/photoLayoutService';

// 添加相纸方向示意图组件
const PaperOrientationIcon: React.FC<{ isRotated: boolean; width: number; height: number }> = ({ isRotated, width, height }) => {
  // 设置矩形的基础尺寸，让横竖差异更明显
  const baseWidth = width * 0.8;
  const baseHeight = height * 0.5;
  
  // 根据旋转状态决定实际显示的宽高
  const paperWidth = isRotated ? baseHeight : baseWidth;
  const paperHeight = isRotated ? baseWidth : baseHeight;
  
  return (
    <svg 
      width={width} 
      height={height} 
      viewBox={`0 0 ${width} ${height}`} 
      className="inline-block ml-2"
      style={{ transition: 'transform 0.3s ease' }}
    >
      <g transform={`translate(${(width - paperWidth) / 2}, ${(height - paperHeight) / 2})`}>
        {/* 相纸外框 */}
        <rect
          width={paperWidth}
          height={paperHeight}
          stroke="currentColor"
          strokeWidth="1.5"
          fill="white"
        />
        {/* 内部纹理线条 */}
        <line
          x1={paperWidth * 0.2}
          y1={paperHeight * 0.3}
          x2={paperWidth * 0.8}
          y2={paperHeight * 0.3}
          stroke="currentColor"
          strokeWidth="1"
          opacity="0.3"
        />
        <line
          x1={paperWidth * 0.2}
          y1={paperHeight * 0.7}
          x2={paperWidth * 0.8}
          y2={paperHeight * 0.7}
          stroke="currentColor"
          strokeWidth="1"
          opacity="0.3"
        />
      </g>
    </svg>
  );
};

function App() {
  const [state, setState] = useState<AppState>({
    selectedPhotoType: null,
    selectedContainerType: null,
    lineColor: '#000000',
    uploadedImage: null,
    previewUrl: null,
    processedImageUrl: null,
    isProcessing: false,
    error: null,
    isContainerRotated: false
  });

  const [photoTypes, setPhotoTypes] = useState<PhotoType[]>([]);
  const [containerTypes, setContainerTypes] = useState<ContainerType[]>([]);
  const [photoCount, setPhotoCount] = useState<number>(0);

  const photoLayoutService = new PhotoLayoutService();

  useEffect(() => {
    const loadPhotoTypes = async () => {
      try {
        const response = await fetch('/phototype.json');
        const data = await response.json();
        setPhotoTypes(data.photoTypes);
        setContainerTypes(data.containerTypes);
      } catch (error) {
        console.error('Failed to load photo types:', error);
        setState(prev => ({ ...prev, error: '加载照片类型失败' }));
      }
    };

    loadPhotoTypes();
  }, []);

  const handleImageUpload = (files: File[]) => {
    if (files && files[0]) {
      const file = files[0];
      setState(prev => ({
        ...prev,
        uploadedImage: file,
        previewUrl: URL.createObjectURL(file),
        processedImageUrl: null,
        error: null
      }));
    }
  };

  const handlePhotoTypeChange = (typeId: string) => {
    const selectedType = photoTypes.find(type => type.id === typeId);
    setState(prev => ({
      ...prev,
      selectedPhotoType: selectedType || null,
      processedImageUrl: null
    }));
  };

  const handleContainerTypeChange = (typeId: string) => {
    const selectedType = containerTypes.find(type => type.id === typeId);
    setState(prev => ({
      ...prev,
      selectedContainerType: selectedType || null,
      processedImageUrl: null
    }));
  };

  const handleRotateContainer = async () => {
    if (!state.selectedContainerType) return;
    
    setState(prev => ({
      ...prev,
      isContainerRotated: !prev.isContainerRotated,
      processedImageUrl: null
    }));
  };

  const getCurrentContainerType = (): ContainerType | null => {
    if (!state.selectedContainerType) return null;
    
    if (state.isContainerRotated) {
      return {
        ...state.selectedContainerType,
        widthCm: state.selectedContainerType.heightCm,
        heightCm: state.selectedContainerType.widthCm
      };
    }
    
    return state.selectedContainerType;
  };

  const handleGenerateLayout = async () => {
    const { selectedPhotoType, lineColor, uploadedImage, previewUrl } = state;
    const selectedContainerType = getCurrentContainerType();
    
    if (!selectedPhotoType || !selectedContainerType || !uploadedImage || !previewUrl) {
      setState(prev => ({
        ...prev,
        error: '请选择照片类型、打印尺寸并上传照片'
      }));
      return;
    }
    
    setState(prev => ({ ...prev, isProcessing: true, error: null }));
    
    try {
      const loadImage = () => new Promise<HTMLImageElement>((resolve, reject) => {
        const img = document.createElement('img');
        img.onload = () => resolve(img);
        img.onerror = () => reject(new Error('图片加载失败'));
        img.src = previewUrl;
      });

      // 等待图片加载完成
      const image = await loadImage();
      
      try {
        // 计算最佳布局
        const { canvas, count } = photoLayoutService.calculateOptimalLayout(
          image,
          selectedPhotoType,
          selectedContainerType,
          lineColor
        );
        
        const processedImageUrl = canvas.toDataURL('image/jpeg', 0.96);
        setPhotoCount(count);
        
        setState(prev => ({
          ...prev,
          processedImageUrl,
          isProcessing: false,
          error: null
        }));
      } catch (error) {
        console.error('Layout calculation error:', error);
        setState(prev => ({
          ...prev,
          error: '排版计算失败，请检查照片尺寸是否合适',
          isProcessing: false
        }));
      }
    } catch (error) {
      console.error('Image processing error:', error);
      setState(prev => ({
        ...prev,
        error: '图片处理失败，请确保上传了有效的图片文件',
        isProcessing: false
      }));
    }
  };

  const handleDownload = () => {
    if (state.processedImageUrl && state.selectedPhotoType && state.selectedContainerType) {
      const link = document.createElement('a');
      link.href = state.processedImageUrl;
      // 生成文件名：数量x_照片类型_打印尺寸.jpg
      const fileName = `${photoCount}x_${state.selectedPhotoType.name}_${state.selectedContainerType.name}.jpg`;
      link.download = fileName.replace(/\s+/g, '_'); // 替换空格为下划线
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      
      <main className="flex-grow py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="grid gap-6">
              <div className="grid md:grid-cols-2 gap-4">
                <SizeSelector
                  label="选择证件照尺寸"
                  options={photoTypes}
                  value={state.selectedPhotoType?.id}
                  onChange={handlePhotoTypeChange}
                />
                <div className="space-y-2">
                  <SizeSelector
                    label="选择打印照片尺寸"
                    options={containerTypes}
                    value={state.selectedContainerType?.id}
                    onChange={handleContainerTypeChange}
                  />
                  {state.selectedContainerType && (
                    <div className="flex items-center">
                      <button
                        onClick={handleRotateContainer}
                        className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                      >
                        <RotateCw className="w-4 h-4 mr-2" />
                        {state.isContainerRotated ? '恢复相纸方向' : '旋转相纸方向'}
                      </button>
                      <PaperOrientationIcon
                        isRotated={state.isContainerRotated}
                        width={24}
                        height={24}
                      />
                    </div>
                  )}
                </div>
              </div>

              <LineColorSelector
                value={state.lineColor}
                onChange={(color) => setState(prev => ({ ...prev, lineColor: color }))}
              />

              <PhotoUploader onUpload={handleImageUpload} />

              {state.error && (
                <div className="bg-red-50 text-red-600 p-3 rounded-md">
                  {state.error}
                </div>
              )}

              {!state.previewUrl && !state.processedImageUrl && (
                <div className="text-center py-12">
                  <ImageIcon className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-500">上传照片后预览将显示在这里</p>
                </div>
              )}

              {state.previewUrl && !state.processedImageUrl && (
                <div className="space-y-4">
                  <div className="border rounded-lg p-4">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">原始照片</h3>
                    <div className="flex justify-center items-center">
                      <img
                        src={state.previewUrl}
                        alt="原始照片"
                        className="max-w-full h-auto rounded-md"
                      />
                    </div>
                  </div>
                  
                  <button
                    onClick={handleGenerateLayout}
                    disabled={state.isProcessing || !state.selectedPhotoType || !state.selectedContainerType}
                    className={`w-full py-3 px-4 rounded-lg font-medium transition-colors
                      ${state.isProcessing || !state.selectedPhotoType || !state.selectedContainerType
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-blue-500 text-white hover:bg-blue-600'}`}
                  >
                    {state.isProcessing ? (
                      <span className="flex items-center justify-center">
                        <Loader2 className="w-5 h-5 animate-spin mr-2" />
                        处理中...
                      </span>
                    ) : '生成排版'}
                  </button>
                </div>
              )}

              {state.processedImageUrl && (
                <div className="space-y-4">
                  <div className="border rounded-lg p-4">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-medium text-gray-900">排版结果 ({photoCount} 张证件照)</h3>
                      <button
                        onClick={handleDownload}
                        className="flex items-center px-4 py-2 text-sm font-medium text-white bg-green-500 rounded-lg hover:bg-green-600 transition-colors"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        下载
                      </button>
                    </div>
                    <div className="flex justify-center items-center">
                      <img
                        src={state.processedImageUrl}
                        alt="排版结果"
                        className="max-w-full h-auto rounded-md"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default App;