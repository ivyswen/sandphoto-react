# Sandphoto React 实现设计方案

根据提供的 Sandphoto 项目功能总结报告，我为您设计一个使用 React 重新实现 Sandphoto 功能的方案。Sandphoto 是一个在线证件照排版工具，允许用户在一张 6 英寸照片上排版多张证件照片。

## 1. 项目架构

### 1.1 技术栈选择
- **前端框架**：React + TypeScript
- **状态管理**：React Context API 或 Redux
- **UI 组件库**：Ant Design 或 Material-UI
- **图像处理**：Canvas API 和 react-konva
- **文件上传**：react-dropzone
- **后端选项**：
  - 无服务器方案：完全在浏览器中处理图像
  - 服务器方案：Node.js + Express API

### 1.2 项目结构
```
sandphoto-react/
├── public/
│   ├── index.html
│   ├── phototype.json       # 转换自原 phototype.txt
│   └── assets/
├── src/
│   ├── components/
│   │   ├── Header.tsx
│   │   ├── Footer.tsx
│   │   ├── PhotoUploader.tsx
│   │   ├── SizeSelector.tsx
│   │   ├── LineColorSelector.tsx
│   │   ├── PhotoPreview.tsx
│   │   ├── PhotoLayoutCanvas.tsx
│   │   └── DownloadButton.tsx
│   ├── services/
│   │   ├── photoTypeParser.ts
│   │   ├── photoLayoutService.ts
│   │   └── imageProcessor.ts
│   ├── hooks/
│   │   ├── usePhotoLayout.ts
│   │   └── useImageProcessor.ts
│   ├── types/
│   │   ├── PhotoType.ts
│   │   └── ContainerType.ts
│   ├── utils/
│   │   ├── imageUtils.ts
│   │   └── layoutCalculator.ts
│   ├── pages/
│   │   ├── Home.tsx
│   │   └── About.tsx
│   ├── App.tsx
│   └── index.tsx
└── package.json
```

## 2. 核心功能模块设计

### 2.1 数据模型

```typescript
// 证件照尺寸类型
interface PhotoType {
  id: string;
  name: string;
  widthCm: number;
  heightCm: number;
  category?: string;
}

// 容器/打印尺寸类型
interface ContainerType {
  id: string;
  name: string;
  widthCm: number;
  heightCm: number;
}

// 应用状态
interface AppState {
  selectedPhotoType: PhotoType | null;
  selectedContainerType: ContainerType | null;
  lineColor: string;
  uploadedImage: File | null;
  previewUrl: string | null;
  processedImageUrl: string | null;
  isProcessing: boolean;
  error: string | null;
}
```

### 2.2 核心服务模块

#### PhotoTypeParser 服务

```typescript
// 从配置文件中解析照片类型和容器类型
class PhotoTypeParser {
  private photoTypes: PhotoType[] = [];
  private containerTypes: ContainerType[] = [];

  constructor() {
    this.loadPhotoTypes();
  }

  async loadPhotoTypes() {
    try {
      const response = await fetch('/phototype.json');
      const data = await response.json();
      this.photoTypes = data.photoTypes;
      this.containerTypes = data.containerTypes;
    } catch (error) {
      console.error('Failed to load photo types:', error);
    }
  }

  getPhotoType(id: string): PhotoType | undefined {
    return this.photoTypes.find(type => type.id === id);
  }

  getContainerType(id: string): ContainerType | undefined {
    return this.containerTypes.find(type => type.id === id);
  }

  getAllPhotoTypes(): PhotoType[] {
    return this.photoTypes;
  }

  getAllContainerTypes(): ContainerType[] {
    return this.containerTypes;
  }
}
```

#### 照片布局服务

```typescript
// 核心照片排版逻辑
class PhotoLayoutService {
  calculateOptimalLayout(
    sourceImage: HTMLImageElement,
    targetType: PhotoType,
    containerType: ContainerType,
    lineColor: string
  ): { canvas: HTMLCanvasElement; count: number } {
    // 创建画布
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    // 设置画布尺寸 (将厘米转换为像素，假设300dpi)
    const pxPerCm = 118.11; // 300dpi = 118.11px/cm
    canvas.width = containerType.widthCm * pxPerCm;
    canvas.height = containerType.heightCm * pxPerCm;
    
    // 计算每个目标照片的像素尺寸
    const targetWidthPx = targetType.widthCm * pxPerCm;
    const targetHeightPx = targetType.heightCm * pxPerCm;
    
    // 计算每行/列可以放置的照片数量
    const photosPerRow = Math.floor(canvas.width / targetWidthPx);
    const photosPerCol = Math.floor(canvas.height / targetHeightPx);
    
    // 计算总照片数和起始位置（居中布局）
    const totalPhotos = photosPerRow * photosPerCol;
    const startX = (canvas.width - (photosPerRow * targetWidthPx)) / 2;
    const startY = (canvas.height - (photosPerCol * targetHeightPx)) / 2;
    
    // 绘制背景
    if (ctx) {
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // 绘制每张照片和分隔线
      let count = 0;
      for (let row = 0; row < photosPerCol; row++) {
        for (let col = 0; col < photosPerRow; col++) {
          const x = startX + (col * targetWidthPx);
          const y = startY + (row * targetHeightPx);
          
          // 绘制照片
          ctx.drawImage(
            sourceImage,
            x, y,
            targetWidthPx, targetHeightPx
          );
          
          // 绘制分隔线
          if (lineColor !== 'transparent') {
            ctx.strokeStyle = lineColor;
            ctx.lineWidth = 1;
            ctx.strokeRect(x, y, targetWidthPx, targetHeightPx);
          }
          
          count++;
        }
      }
      
      return { canvas, count };
    }
    
    throw new Error('Failed to get canvas context');
  }
}
```

### 2.3 UI 组件设计

#### 主页面组件

```jsx
const Home = () => {
  const [state, setState] = useState({
    selectedPhotoType: null,
    selectedContainerType: null,
    lineColor: '#000000',
    uploadedImage: null,
    previewUrl: null,
    processedImageUrl: null,
    isProcessing: false,
    error: null
  });
  
  const photoTypeParser = new PhotoTypeParser();
  const photoLayoutService = new PhotoLayoutService();
  
  useEffect(() => {
    const loadData = async () => {
      await photoTypeParser.loadPhotoTypes();
      setState(prev => ({
        ...prev,
        photoTypes: photoTypeParser.getAllPhotoTypes(),
        containerTypes: photoTypeParser.getAllContainerTypes()
      }));
    };
    
    loadData();
  }, []);
  
  const handleImageUpload = (files) => {
    if (files && files[0]) {
      const file = files[0];
      setState(prev => ({
        ...prev,
        uploadedImage: file,
        previewUrl: URL.createObjectURL(file),
        processedImageUrl: null
      }));
    }
  };
  
  const handlePhotoTypeChange = (typeId) => {
    setState(prev => ({
      ...prev,
      selectedPhotoType: photoTypeParser.getPhotoType(typeId),
      processedImageUrl: null
    }));
  };
  
  const handleContainerTypeChange = (typeId) => {
    setState(prev => ({
      ...prev,
      selectedContainerType: photoTypeParser.getContainerType(typeId),
      processedImageUrl: null
    }));
  };
  
  const handleLineColorChange = (color) => {
    setState(prev => ({
      ...prev,
      lineColor: color,
      processedImageUrl: null
    }));
  };
  
  const handleGenerateLayout = async () => {
    const { selectedPhotoType, selectedContainerType, lineColor, uploadedImage } = state;
    
    if (!selectedPhotoType || !selectedContainerType || !uploadedImage) {
      setState(prev => ({
        ...prev,
        error: '请选择照片类型、打印尺寸并上传照片'
      }));
      return;
    }
    
    setState(prev => ({ ...prev, isProcessing: true, error: null }));
    
    try {
      // 创建图像对象
      const image = new Image();
      image.src = state.previewUrl;
      
      // 图像加载完成后处理
      image.onload = () => {
        try {
          // 计算布局
          const { canvas, count } = photoLayoutService.calculateOptimalLayout(
            image,
            selectedPhotoType,
            selectedContainerType,
            lineColor
          );
          
          // 生成下载链接
          const processedImageUrl = canvas.toDataURL('image/jpeg');
          
          setState(prev => ({
            ...prev,
            processedImageUrl,
            photoCount: count,
            isProcessing: false
          }));
        } catch (error) {
          setState(prev => ({
            ...prev,
            error: '图像处理失败',
            isProcessing: false
          }));
        }
      };
      
      image.onerror = () => {
        setState(prev => ({
          ...prev,
          error: '图像加载失败',
          isProcessing: false
        }));
      };
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: '处理过程中发生错误',
        isProcessing: false
      }));
    }
  };
  
  const handleDownload = () => {
    if (state.processedImageUrl) {
      const { selectedPhotoType, selectedContainerType, photoCount } = state;
      
      // 创建下载链接
      const link = document.createElement('a');
      link.href = state.processedImageUrl;
      link.download = `${photoCount}x_${selectedPhotoType.name}_${selectedContainerType.name}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };
  
  return (
    <div className="home-container">
      <h1>证件照排版在线生成器</h1>
      <p>在一张6寸的照片上排版多张证件照</p>
      
      <div className="control-panel">
        <SizeSelector
          label="选择证件照尺寸"
          options={state.photoTypes}
          value={state.selectedPhotoType?.id}
          onChange={handlePhotoTypeChange}
        />
        
        <SizeSelector
          label="选择打印照片尺寸"
          options={state.containerTypes}
          value={state.selectedContainerType?.id}
          onChange={handleContainerTypeChange}
        />
        
        <LineColorSelector
          value={state.lineColor}
          onChange={handleLineColorChange}
        />
        
        <PhotoUploader onUpload={handleImageUpload} />
        
        {state.error && <div className="error-message">{state.error}</div>}
        
        <button 
          onClick={handleGenerateLayout}
          disabled={!state.uploadedImage || !state.selectedPhotoType || !state.selectedContainerType || state.isProcessing}
        >
          {state.isProcessing ? '处理中...' : '生成排版'}
        </button>
      </div>
      
      <div className="preview-panel">
        {state.previewUrl && !state.processedImageUrl && (
          <div className="original-preview">
            <h3>原始照片</h3>
            <img src={state.previewUrl} alt="原始照片" />
          </div>
        )}
        
        {state.processedImageUrl && (
          <div className="processed-preview">
            <h3>排版结果 ({state.photoCount} 张证件照)</h3>
            <img src={state.processedImageUrl} alt="排版结果" />
            <button onClick={handleDownload}>下载排版照片</button>
          </div>
        )}
      </div>
    </div>
  );
};
```

## 3. 核心组件详细设计

### 3.1 照片上传组件

```jsx
const PhotoUploader = ({ onUpload }) => {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.bmp', '.tiff']
    },
    maxSize: 8 * 1024 * 1024, // 8MB 限制
    onDrop: onUpload
  });

  return (
    <div className="photo-uploader">
      <div 
        {...getRootProps()} 
        className={`dropzone ${isDragActive ? 'active' : ''}`}
      >
        <input {...getInputProps()} />
        {
          isDragActive ?
            <p>拖放照片到这里 ...</p> :
            <p>拖放照片到这里，或点击选择照片<br/><small>支持 JPG, PNG, BMP, TIFF 格式，最大 8MB</small></p>
        }
      </div>
    </div>
  );
};
```

### 3.2 尺寸选择器组件

```jsx
const SizeSelector = ({ label, options, value, onChange }) => {
  return (
    <div className="size-selector">
      <label>{label}</label>
      <select value={value || ''} onChange={(e) => onChange(e.target.value)}>
        <option value="">-- 请选择 --</option>
        {options && options.map(option => (
          <option key={option.id} value={option.id}>
            {option.name} ({option.widthCm}×{option.heightCm}厘米)
          </option>
        ))}
      </select>
    </div>
  );
};
```

### 3.3 分割线颜色选择器

```jsx
const LineColorSelector = ({ value, onChange }) => {
  const colorOptions = [
    { id: 'transparent', name: '无分割线', value: 'transparent' },
    { id: 'black', name: '黑色', value: '#000000' },
    { id: 'red', name: '红色', value: '#FF0000' },
    { id: 'blue', name: '蓝色', value: '#0000FF' },
  ];

  return (
    <div className="line-color-selector">
      <label>分割线颜色</label>
      <div className="color-options">
        {colorOptions.map(color => (
          <div
            key={color.id}
            className={`color-option ${value === color.value ? 'selected' : ''}`}
            onClick={() => onChange(color.value)}
          >
            <div 
              className="color-preview" 
              style={{ 
                backgroundColor: color.value === 'transparent' ? 'white' : color.value,
                border: color.value === 'transparent' ? '1px dashed #ccc' : 'none'
              }}
            />
            <span>{color.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
```

## 4. 配置文件转换

将原始的 `phototype.txt` 文件转换为更易于在 React 应用中使用的 JSON 格式：

```json
{
  "photoTypes": [
    {
      "id": "passport_china",
      "name": "中国护照照片",
      "widthCm": 3.3,
      "heightCm": 4.8,
      "category": "护照"
    },
    {
      "id": "id_2inch",
      "name": "2英寸证件照",
      "widthCm": 5.08,
      "heightCm": 5.08,
      "category": "证件照"
    },
    // ... 其他照片类型
  ],
  "containerTypes": [
    {
      "id": "6inch",
      "name": "6英寸照片纸",
      "widthCm": 15.24,
      "heightCm": 10.16
    },
    {
      "id": "4R",
      "name": "4R照片纸",
      "widthCm": 12.7,
      "heightCm": 8.9
    },
    // ... 其他容器类型
  ]
}
```

## 5. 部署方案

### 5.1 无服务器部署（纯静态）
1. 构建 React 应用：`npm run build`
2. 将构建后的文件部署到静态文件服务器或 CDN（如 Netlify、Vercel、GitHub Pages）
3. 所有图像处理都在客户端浏览器中完成，无需后端服务器

### 5.2 带后端的部署
如果需要更强大的图像处理功能或支持大文件：
1. 前端：部署 React 应用到静态文件服务器
2. 后端：部署 Node.js + Express API 到云服务（如 AWS、Heroku、DigitalOcean）
3. 配置 CORS 允许前端访问后端 API

## 6. 性能优化建议

1. **懒加载组件**：使用 React.lazy() 和 Suspense 分割代码
2. **图像压缩**：在上传前使用 browser-image-compression 库压缩大图片
3. **WebWorkers 处理**：将图像处理逻辑移至 WebWorker 防止 UI 阻塞
4. **缓存处理结果**：使用 localStorage 或 IndexedDB 缓存用户最近的照片处理结果
5. **预加载常用尺寸**：预加载最常用的证件照和打印尺寸配置

## 7. 未来功能扩展

1. **照片裁剪编辑**：添加裁剪、旋转、调整亮度/对比度功能
2. **照片模板**：提供不同国家和用途的证件照要求模板
3. **历史记录**：保存用户的历史照片和排版结果
4. **批量处理**：支持一次上传多张照片进行批量排版
5. **AI 辅助**：使用 ML 模型自动调整照片符合证件照要求（背景、表情、光线等）

---

此设计方案提供了使用 React 实现 Sandphoto 功能的完整架构和实现思路。方案保留了原始应用的核心功能，同时利用了现代前端技术提高了用户体验和性能。实现过程中可以根据具体需求调整细节部分。