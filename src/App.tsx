import React, { useState, useEffect } from 'react';
import { PhotoUploader } from './components/PhotoUploader';
import { SizeSelector } from './components/SizeSelector';
import { LineColorSelector } from './components/LineColorSelector';
import { BackgroundSelector } from './components/BackgroundSelector';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { ImageCropper } from './components/ImageCropper';
import { PhotoType, ContainerType, AppState, BackgroundOption } from './types/PhotoType';
import { Image as ImageIcon, Download, Loader2, RotateCw } from 'lucide-react';
import { PhotoLayoutService } from './services/photoLayoutService';
import { Toaster, toast } from 'react-hot-toast';

// 添加相纸方向示意图组件
const PaperOrientationIcon: React.FC<{ 
  isRotated: boolean; 
  width: number; 
  height: number;
  containerType: ContainerType | null;
}> = ({ isRotated, width, height, containerType }) => {
  if (!containerType) return null;

  // 判断相纸是否默认为横向（宽度大于高度）
  const isDefaultLandscape = containerType.widthCm > containerType.heightCm;
  
  // 计算最终的方向：
  // 如果默认是横向，且旋转了，则变为纵向
  // 如果默认是纵向，且旋转了，则变为横向
  const isCurrentLandscape = isRotated ? !isDefaultLandscape : isDefaultLandscape;

  // 设置矩形的基础尺寸，保持和实际相纸的比例
  const maxDimension = Math.max(containerType.widthCm, containerType.heightCm);
  const scale = width * 0.8 / maxDimension;
  const paperWidth = isCurrentLandscape 
    ? Math.max(containerType.widthCm, containerType.heightCm) * scale
    : Math.min(containerType.widthCm, containerType.heightCm) * scale;
  const paperHeight = isCurrentLandscape
    ? Math.min(containerType.widthCm, containerType.heightCm) * scale
    : Math.max(containerType.widthCm, containerType.heightCm) * scale;
  
  return (
    <svg 
      width={width} 
      height={height} 
      viewBox={`0 0 ${width} ${height}`} 
      className="inline-block ml-2"
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

// 预设背景选项
const backgroundOptions: BackgroundOption[] = [
  { id: 'white', name: '标准白色', color: '#FFFFFF', description: '身份证、护照、签证等证件照' },
  { id: 'deep-blue', name: '深蓝色', color: '#438EDB', description: '毕业证、工作证、人事档案' },
  { id: 'light-blue', name: '浅蓝色', color: '#00BFF3', description: '学历证书、社保照片' },
  { id: 'red', name: '正红色', color: '#FF0000', description: '结婚证、保险单、医保卡' }
];

function App() {
  // 添加 Google Fonts
  useEffect(() => {
    const googleFontsUrl = 'https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@400;500;700&display=swap';
    const link = document.createElement('link');
    link.href = googleFontsUrl;
    link.rel = 'stylesheet';
    document.head.appendChild(link);
    
    return () => {
      document.head.removeChild(link);
    };
  }, []);

  const [state, setState] = useState<AppState>({
    selectedPhotoType: null,
    selectedContainerType: null,
    lineColor: '#000000',
    uploadedImage: null,
    previewUrl: null,
    processedImageUrl: null,
    isProcessing: false,
    error: null,
    isContainerRotated: false,
    showCropper: false,
    originalImageUrl: null,
    croppedImageUrl: null,
    hasTransparentBackground: false,
    selectedBackground: backgroundOptions[0]
  });

  const [photoTypes, setPhotoTypes] = useState<PhotoType[]>([]);
  const [containerTypes, setContainerTypes] = useState<ContainerType[]>([]);
  const [photoCount, setPhotoCount] = useState<number>(0);

  const [photoLayoutService] = useState(() => new PhotoLayoutService());

  const [shouldRegenerate, setShouldRegenerate] = useState(false);

  // 添加一个 useEffect 来处理重新生成排版
  useEffect(() => {
    if (shouldRegenerate) {
      handleGenerateLayout();
      setShouldRegenerate(false);
    }
  }, [shouldRegenerate]);

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
      const previewUrl = URL.createObjectURL(file);
      
      setState(prev => ({
        ...prev,
        uploadedImage: file,
        previewUrl,
        originalImageUrl: previewUrl,
        processedImageUrl: null,
        error: null,
        hasTransparentBackground: false,
        showCropper: false // Reset cropper state
      }));
      
      // 检查图片是否有透明背景（仅PNG格式）
      if (file.type === 'image/png') {
        const img = new Image();
        img.onload = async () => {
          try {
            const hasTransparent = await photoLayoutService.detectTransparentBackground(img);
            setState(prev => ({
              ...prev,
              hasTransparentBackground: hasTransparent
            }));
            
            if (hasTransparent) {
              toast.success('检测到透明背景，您可以选择预设背景颜色');
            }

            // 如果已选择了照片类型，初始化 PhotoLayoutService
            if (state.selectedPhotoType) {
              photoLayoutService.initializeWithImage(img, state.selectedPhotoType);
              // 检查是否需要显示裁剪器
              checkImageAspectRatio(previewUrl, state.selectedPhotoType);
            }
          } catch (error) {
            console.error('检测透明背景失败:', error);
            toast.error('检测透明背景失败');
          }
        };
        img.src = previewUrl;
      } else {
        // 如果不是PNG，加载图片并初始化 PhotoLayoutService
        const img = new Image();
        img.onload = () => {
          if (state.selectedPhotoType) {
            photoLayoutService.initializeWithImage(img, state.selectedPhotoType);
            // 检查是否需要显示裁剪器
            checkImageAspectRatio(previewUrl, state.selectedPhotoType);
          }
        };
        img.src = previewUrl;
      }
    }
  };
  
  // 检查图片比例是否与所选证件照比例匹配
  const checkImageAspectRatio = (imageUrl: string | null, photoType: PhotoType) => {
    if (!imageUrl) return;
    
    const img = new Image();
    img.onload = () => {
      const sourceAspectRatio = img.width / img.height;
      const targetAspectRatio = photoType.widthCm / photoType.heightCm;
      
      // 如果比例差异超过阈值，显示裁剪界面
      if (Math.abs(sourceAspectRatio - targetAspectRatio) > 0.01) {
        setState(prev => ({
          ...prev,
          showCropper: true
        }));
        toast('照片比例与证件照不匹配，请裁剪照片');
      }
    };
    img.src = imageUrl;
  };

  const handlePhotoTypeChange = (typeId: string) => {
    const selectedType = photoTypes.find(type => type.id === typeId);
    setState(prev => ({
      ...prev,
      selectedPhotoType: selectedType || null,
      processedImageUrl: null,
      showCropper: false // Reset cropper state when type changes
    }));
    
    // 如果已上传图片，重新初始化 PhotoLayoutService 并检查是否需要裁剪
    if (state.originalImageUrl && selectedType) {
      const img = new Image();
      img.onload = () => {
        photoLayoutService.initializeWithImage(img, selectedType);
        checkImageAspectRatio(state.originalImageUrl, selectedType);
      };
      img.src = state.originalImageUrl;
    }
  };
  
  // 处理裁剪完成
  const handleCropComplete = async (croppedArea: any, croppedAreaPixels: any) => {
    if (!state.selectedPhotoType || !state.originalImageUrl) {
      toast.error('请先选择照片类型并上传照片');
      return;
    }

    setState(prev => ({
      ...prev,
      showCropper: false,
      isProcessing: true
    }));

    try {
      // 将裁剪参数转换为 PhotoLayoutService 需要的格式
      const cropConfig = {
        sx: croppedAreaPixels.x,
        sy: croppedAreaPixels.y,
        sWidth: croppedAreaPixels.width,
        sHeight: croppedAreaPixels.height
      };

      const sourceImage = photoLayoutService.getSourceImage();
      if (!sourceImage) {
        throw new Error('源图片不存在');
      }

      // 更新裁剪区域并获取预览图
      const previewUrl = await photoLayoutService.updateCropArea(
        cropConfig,
        sourceImage
      );

      setState(prev => ({
        ...prev,
        previewUrl,
        selectedBackground: backgroundOptions[0], // 重置为白色背景
        processedImageUrl: null,
        isProcessing: false
      }));

      toast.success('照片裁剪完成');
    } catch (error) {
      console.error('裁剪照片失败:', error);
      toast.error('裁剪照片失败');
      setState(prev => ({
        ...prev,
        isProcessing: false
      }));
    }
  };
  
  // 取消裁剪
  const handleCancelCrop = () => {
    setState(prev => ({
      ...prev,
      showCropper: false
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


  const handleRotateContainer = () => {
    if (!state.selectedContainerType) return;
    
    setState(prev => {
      const newRotated = !prev.isContainerRotated;
      
      // 显示旋转通知
      toast.success(newRotated ? '相纸方向已旋转' : '相纸方向已恢复');
      
      return {
        ...prev,
        isContainerRotated: newRotated,
        isProcessing: true
      };
    });

    // 如果有已生成的排版，设置标志以触发重新生成
    if (state.processedImageUrl) {
      setShouldRegenerate(true);
    }
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

  const handleColorChange = (color: string) => {
    // 如果颜色没有变化，不做任何处理
    if (color === state.lineColor) return;

    // 仅更新颜色和处理状态，不清空 processedImageUrl
    setState(prev => ({
      ...prev,
      lineColor: color,
      isProcessing: !!prev.processedImageUrl // 仅当有排版结果时才设置 isProcessing
    }));

    // 如果有排版结果，则重新生成
    if (state.processedImageUrl) {
      // 使用 requestAnimationFrame 确保状态更新后再重新生成
      requestAnimationFrame(() => {
        handleGenerateLayout({ newLineColor: color });
      });
    } else {
      toast.success('分割线颜色已选择');
    }
  };

  // 处理背景色变化
  const handleBackgroundChange = async (backgroundId: string) => {
    const background = backgroundOptions.find(bg => bg.id === backgroundId);
    if (!background) return;

    try {
      // 检查是否有裁剪后的图片
      if (!photoLayoutService.hasCroppedImage()) {
        toast.error('请先上传并裁剪照片');
        return;
      }

      setState(prev => ({ ...prev, isProcessing: true }));

      // 更新预览图的背景色
      const previewUrl = await photoLayoutService.updatePreviewBackground(background);

      setState(prev => ({
        ...prev,
        previewUrl,
        selectedBackground: background,
        isProcessing: false,
        processedImageUrl: null
      }));

      toast.success('背景颜色已更新');
    } catch (error) {
      console.error('切换背景失败:', error);
      toast.error('切换背景失败，请确保已正确裁剪照片');
      setState(prev => ({ ...prev, isProcessing: false }));
    }
  };

  const handleGenerateLayout = async (options?: { newLineColor?: string }) => {
    // 优先使用传入的颜色，否则使用 state 中的颜色
    const colorToUse = options?.newLineColor ?? state.lineColor;
    const { selectedPhotoType, hasTransparentBackground, selectedBackground } = state; // 保留这里的 background 读取，以备将来可能需要
    const selectedContainerType = getCurrentContainerType();

    if (!selectedPhotoType || !selectedContainerType) {
      toast.error('请选择照片类型和打印尺寸');
      return;
    }

    // 检查是否有裁剪后的图片
    if (!photoLayoutService.hasCroppedImage()) {
      toast.error('请先上传并裁剪照片');
      return;
    }

    // 如果不是由颜色改变触发的（即 options 为空或没有 newLineColor），且状态不是 isProcessing，则设置
    // 如果是由颜色改变触发的，isProcessing 已经在 handleColorChange 中设置了
    if (!options?.newLineColor && !state.isProcessing) {
      setState(prev => ({ ...prev, isProcessing: true, error: null }));
    }
    
    const loadingToast = toast.loading('正在生成排版...');

    try {
      // 生成排版 - 使用 colorToUse
      const { canvas, count } = photoLayoutService.calculateOptimalLayout(
        selectedContainerType,
        colorToUse, // 使用正确的颜色
        // 传递选中的背景给 layout service，让 service 决定如何处理照片背景
        hasTransparentBackground && selectedBackground ? selectedBackground : undefined 
      );

      const processedImageUrl = canvas.toDataURL('image/jpeg', 1.0);
      setPhotoCount(count);

      setState(prev => ({
        ...prev,
        processedImageUrl,
        isProcessing: false,
        error: null
      }));

      toast.success(`排版完成，共 ${count} 张照片`, {
        id: loadingToast
      });
    } catch (error) {
      console.error('Layout calculation error:', error);
      setState(prev => ({
        ...prev,
        error: '排版计算失败，请检查照片尺寸是否合适',
        isProcessing: false
      }));
      toast.error('排版计算失败，请检查照片尺寸是否合适', {
        id: loadingToast
      });
    }
  };

  const handleDownload = () => {
    if (state.processedImageUrl && state.selectedPhotoType && state.selectedContainerType) {
      const link = document.createElement('a');
      link.href = state.processedImageUrl;
      const fileName = `${photoCount}x_${state.selectedPhotoType.name}_${state.selectedContainerType.name}.jpg`;
      link.download = fileName.replace(/\s+/g, '_');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success('照片已开始下载');
    }
  };

  // 这个函数是专门给按钮点击用的，它不接受参数
  const handleGenerateButtonClick = () => {
    handleGenerateLayout(); // 调用时不传递参数
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 2000,
          style: {
            background: '#363636',
            color: '#fff',
          },
          success: {
            iconTheme: {
              primary: '#4ade80',
              secondary: '#fff',
            },
          },
          error: {
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
          },
        }}
      />
      
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
                        containerType={state.selectedContainerType}
                      />
                    </div>
                  )}
                </div>
              </div>

              <LineColorSelector
                value={state.lineColor}
                onChange={handleColorChange}
              />
              
              {state.hasTransparentBackground && (
                <BackgroundSelector
                  options={backgroundOptions}
                  value={state.selectedBackground?.id || null}
                  onChange={handleBackgroundChange}
                  disabled={state.isProcessing}
                />
              )}

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
                    onClick={handleGenerateButtonClick}
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
      
      {/* 图片裁剪组件 */}
      {state.showCropper && state.originalImageUrl && state.selectedPhotoType && (
        <ImageCropper
          imageUrl={state.originalImageUrl}
          aspectRatio={state.selectedPhotoType.widthCm / state.selectedPhotoType.heightCm}
          onCropComplete={handleCropComplete}
          onCancel={handleCancelCrop}
        />
      )}
    </div>
  );
}

export default App;