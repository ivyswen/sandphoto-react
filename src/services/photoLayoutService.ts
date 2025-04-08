import { PhotoType, ContainerType, BackgroundOption } from '../types/PhotoType';

export class PhotoLayoutService {
  // 定义常量
  private readonly CM_PER_INCH = 2.54;
  private readonly DPI = 300;
  
  // 计算 pxPerCm
  private readonly pxPerCm = Math.floor(this.DPI / this.CM_PER_INCH);
  
  // 存储裁剪后的图片数据
  private croppedImageData: ImageData | null = null;
  
  // 存储目标尺寸
  private targetSize: {
    width: number;
    height: number;
  } | null = null;

  private sourceImage: HTMLImageElement | null = null;

  // 获取源图片
  getSourceImage(): HTMLImageElement | null {
    return this.sourceImage;
  }

  // 初始化服务
  async init(imageUrl: string): Promise<void> {
    this.sourceImage = await this.createImage(imageUrl);
  }

  // 创建图片对象
  private createImage(url: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const image = new Image();
      image.addEventListener('load', () => resolve(image));
      image.addEventListener('error', error => reject(error));
      image.src = url;
    });
  }

  // 检查是否已初始化
  isInitialized(): boolean {
    return this.sourceImage !== null;
  }

  // 检查是否有裁剪后的图片
  hasCroppedImage(): boolean {
    return this.croppedImageData !== null;
  }

  // 当用户上传图片时调用，创建初始裁剪
  initializeWithImage(
    sourceImage: HTMLImageElement,
    targetType: PhotoType
  ): void {
    // 计算目标尺寸（像素）
    const targetWidthPx = targetType.widthCm * this.pxPerCm;
    const targetHeightPx = targetType.heightCm * this.pxPerCm;
    
    // 保存目标尺寸
    this.targetSize = {
      width: targetWidthPx,
      height: targetHeightPx
    };

    // 创建临时画布进行裁剪
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = targetWidthPx;
    tempCanvas.height = targetHeightPx;
    
    const tempCtx = tempCanvas.getContext('2d', { 
      willReadFrequently: true,
      alpha: true
    });
    
    if (!tempCtx) {
      throw new Error('Failed to get canvas context');
    }

    // 清空画布
    tempCtx.clearRect(0, 0, targetWidthPx, targetHeightPx);

    // 计算裁剪区域（居中裁剪）
    const sourceAspectRatio = sourceImage.width / sourceImage.height;
    const targetAspectRatio = targetWidthPx / targetHeightPx;
    
    let sx = 0, sy = 0, sWidth = sourceImage.width, sHeight = sourceImage.height;
    
    if (sourceAspectRatio > targetAspectRatio) {
      // 原图更宽，需要裁剪宽度
      sWidth = sourceImage.height * targetAspectRatio;
      sx = (sourceImage.width - sWidth) / 2;
    } else {
      // 原图更高，需要裁剪高度
      sHeight = sourceImage.width / targetAspectRatio;
      sy = (sourceImage.height - sHeight) / 2;
    }

    // 绘制裁剪后的图片
    tempCtx.drawImage(
      sourceImage,
      sx, sy, sWidth, sHeight,
      0, 0, targetWidthPx, targetHeightPx
    );

    // 保存裁剪后的图片数据
    this.croppedImageData = tempCtx.getImageData(0, 0, targetWidthPx, targetHeightPx);
    this.sourceImage = sourceImage;
  }

  // 更新裁剪区域
  updateCropArea(cropConfig: {
    sx: number;
    sy: number;
    sWidth: number;
    sHeight: number;
  }, sourceImage: HTMLImageElement): Promise<string> {
    if (!this.targetSize) {
      throw new Error('No target size set');
    }

    // 创建临时画布进行裁剪
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = this.targetSize.width;
    tempCanvas.height = this.targetSize.height;
    
    const tempCtx = tempCanvas.getContext('2d', { 
      willReadFrequently: true,
      alpha: true
    });
    
    if (!tempCtx) {
      throw new Error('Failed to get canvas context');
    }

    // 清空画布
    tempCtx.clearRect(0, 0, tempCanvas.width, tempCanvas.height);

    // 使用新的裁剪配置绘制图片
    tempCtx.drawImage(
      sourceImage,
      cropConfig.sx,
      cropConfig.sy,
      cropConfig.sWidth,
      cropConfig.sHeight,
      0,
      0,
      this.targetSize.width,
      this.targetSize.height
    );

    // 保存裁剪后的图片数据
    this.croppedImageData = tempCtx.getImageData(
      0, 0,
      this.targetSize.width,
      this.targetSize.height
    );

    // 创建白色背景的预览
    const defaultBackground: BackgroundOption = {
      id: 'default',
      name: '白色',
      color: '#FFFFFF',
      description: '默认白色背景'
    };
    return this.createPreview(defaultBackground);
  }

  // 创建预览图
  async createPreview(background: BackgroundOption): Promise<string> {
    if (!this.croppedImageData || !this.targetSize) {
      throw new Error('No source image or cropped data available');
    }

    const canvas = document.createElement('canvas');
    canvas.width = this.targetSize.width;
    canvas.height = this.targetSize.height;
    
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) {
      throw new Error('Failed to get canvas context');
    }

    // 清空画布并设置背景色
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = background.color;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 创建临时画布来处理透明度
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = this.targetSize.width;
    tempCanvas.height = this.targetSize.height;
    const tempCtx = tempCanvas.getContext('2d', { alpha: true });
    
    if (!tempCtx) {
      throw new Error('Failed to get temporary canvas context');
    }

    // 清空临时画布
    tempCtx.clearRect(0, 0, tempCanvas.width, tempCanvas.height);

    // 将裁剪后的图片数据绘制到临时画布
    tempCtx.putImageData(this.croppedImageData, 0, 0);

    // 设置合成模式为 source-over
    ctx.globalCompositeOperation = 'source-over';

    // 使用 drawImage 将临时画布的内容绘制到主画布
    ctx.drawImage(tempCanvas, 0, 0);

    // 返回 base64 格式的图片
    return canvas.toDataURL('image/png', 1.0);
  }

  // 检测透明背景
  async detectTransparentBackground(image: HTMLImageElement): Promise<boolean> {
    const canvas = document.createElement('canvas');
    canvas.width = image.width;
    canvas.height = image.height;
    
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) {
      throw new Error('Failed to get canvas context');
    }

    ctx.drawImage(image, 0, 0);
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    // 检查是否有透明像素
    for (let i = 3; i < data.length; i += 4) {
      if (data[i] < 255) {
        return true;
      }
    }

    return false;
  }

  // 计算最佳排版布局
  calculateOptimalLayout(
    containerType: ContainerType,
    lineColor: string,
    background?: BackgroundOption
  ): { canvas: HTMLCanvasElement; count: number } {
    if (!this.croppedImageData || !this.targetSize) {
      throw new Error('No cropped image data available');
    }

    const GAP = 10; // 照片间距 10px

    // 计算两种方向的照片数量
    const calculatePhotoCount = (width: number, height: number) => {
      const photosPerRow = Math.floor((width) / (this.targetSize!.width + GAP));
      const photosPerColumn = Math.floor((height) / (this.targetSize!.height + GAP));
      return photosPerRow * photosPerColumn;
    };

    // 计算常规方向的数量
    const normalCount = calculatePhotoCount(
      containerType.widthCm * this.pxPerCm,
      containerType.heightCm * this.pxPerCm
    );

    // 计算旋转后的数量
    const rotatedCount = calculatePhotoCount(
      containerType.heightCm * this.pxPerCm,
      containerType.widthCm * this.pxPerCm
    );

    // 选择照片数量更多的方向
    let containerWidthPx, containerHeightPx;
    if (rotatedCount > normalCount) {
      containerWidthPx = containerType.heightCm * this.pxPerCm;
      containerHeightPx = containerType.widthCm * this.pxPerCm;
    } else {
      containerWidthPx = containerType.widthCm * this.pxPerCm;
      containerHeightPx = containerType.heightCm * this.pxPerCm;
    }

    const photoWidthPx = this.targetSize.width;
    const photoHeightPx = this.targetSize.height;

    // 计算每行和每列可以放置的照片数量
    const photosPerRow = Math.floor(containerWidthPx / (photoWidthPx + GAP));
    const photosPerColumn = Math.floor(containerHeightPx / (photoHeightPx + GAP));

    // 创建输出画布（相纸）
    const canvas = document.createElement('canvas');
    canvas.width = containerWidthPx;
    canvas.height = containerHeightPx;

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) {
      throw new Error('Failed to get canvas context');
    }

    // 设置相纸背景色，使用提供的背景色或默认白色
    ctx.fillStyle = background ? background.color : '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 计算实际的间距，使照片在画布上均匀分布
    const totalPhotosWidth = photosPerRow * photoWidthPx;
    const totalPhotosHeight = photosPerColumn * photoHeightPx;
    const horizontalGap = (containerWidthPx - totalPhotosWidth) / (photosPerRow + 1);
    const verticalGap = (containerHeightPx - totalPhotosHeight) / (photosPerColumn + 1);

    // 创建临时画布来绘制单张照片（与 createPreview 保持一致的处理方式）
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = photoWidthPx;
    tempCanvas.height = photoHeightPx;
    const tempCtx = tempCanvas.getContext('2d', { alpha: true });
    if (!tempCtx) {
      throw new Error('Failed to get temporary canvas context');
    }

    // 1. 先设置背景色
    tempCtx.clearRect(0, 0, tempCanvas.width, tempCanvas.height);
    if (background) {
      tempCtx.fillStyle = background.color;
      tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
    }

    // 2. 创建另一个临时画布来处理裁剪数据
    const imageCanvas = document.createElement('canvas');
    imageCanvas.width = photoWidthPx;
    imageCanvas.height = photoHeightPx;
    const imageCtx = imageCanvas.getContext('2d', { alpha: true });
    
    if (!imageCtx) {
      throw new Error('Failed to get image canvas context');
    }
    
    // 3. 将裁剪数据绘制到图片画布
    imageCtx.putImageData(this.croppedImageData, 0, 0);

    // 4. 设置合成模式
    tempCtx.globalCompositeOperation = 'source-over';
    
    // 5. 将图片画布的内容绘制到带背景的临时画布上
    tempCtx.drawImage(imageCanvas, 0, 0);

    // 绘制照片
    let count = 0;
    for (let row = 0; row < photosPerColumn; row++) {
      for (let col = 0; col < photosPerRow; col++) {
        const x = horizontalGap + col * (photoWidthPx + horizontalGap);
        const y = verticalGap + row * (photoHeightPx + verticalGap);

        // 使用drawImage绘制照片，这样可以保持透明度
        ctx.drawImage(tempCanvas, x, y);

        // 绘制分割线
        if (lineColor && lineColor !== 'transparent') {
          ctx.strokeStyle = lineColor;
          ctx.lineWidth = 1;
          
          // 只在照片之间绘制分割线
          if (col < photosPerRow - 1) {
            ctx.beginPath();
            ctx.moveTo(x + photoWidthPx + horizontalGap / 2, y);
            ctx.lineTo(x + photoWidthPx + horizontalGap / 2, y + photoHeightPx);
            ctx.stroke();
          }
          
          if (row < photosPerColumn - 1) {
            ctx.beginPath();
            ctx.moveTo(x, y + photoHeightPx + verticalGap / 2);
            ctx.lineTo(x + photoWidthPx, y + photoHeightPx + verticalGap / 2);
            ctx.stroke();
          }
        }

        count++;
      }
    }

    return { canvas, count };
  }

  // 更新预览图的背景色
  async updatePreviewBackground(background: BackgroundOption): Promise<string> {
    if (!this.croppedImageData || !this.targetSize) {
      throw new Error('No cropped image data or target size available');
    }

    // 使用裁剪后的图片数据重新生成预览图
    return this.createPreview(background);
  }
}