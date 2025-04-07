import { PhotoType, ContainerType } from '../types/PhotoType';

export class PhotoLayoutService {
  private pxPerCm = 118.11; // 300dpi = 118.11px/cm

  calculateOptimalLayout(
    sourceImage: HTMLImageElement,
    targetType: PhotoType,
    containerType: ContainerType,
    lineColor: string
  ): { canvas: HTMLCanvasElement; count: number } {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      throw new Error('Failed to get canvas context');
    }
    
    // 设置画布尺寸
    canvas.width = containerType.widthCm * this.pxPerCm;
    canvas.height = containerType.heightCm * this.pxPerCm;
    
    // 计算原始照片的宽高比
    const sourceAspectRatio = sourceImage.width / sourceImage.height;
    
    // 计算目标照片的理想尺寸（以厘米为单位）
    const targetWidthCm = targetType.widthCm;
    const targetHeightCm = targetType.heightCm;
    const targetAspectRatio = targetWidthCm / targetHeightCm;
    
    // 根据原始照片的宽高比调整目标尺寸
    let adjustedWidthCm = targetWidthCm;
    let adjustedHeightCm = targetHeightCm;
    
    if (Math.abs(sourceAspectRatio - targetAspectRatio) > 0.01) {
      // 如果原始照片比目标更宽，以高度为基准
      if (sourceAspectRatio > targetAspectRatio) {
        adjustedWidthCm = targetHeightCm * sourceAspectRatio;
      } else {
        // 如果原始照片比目标更高，以宽度为基准
        adjustedHeightCm = targetWidthCm / sourceAspectRatio;
      }
    }
    
    // 转换为像素尺寸
    const targetWidthPx = adjustedWidthCm * this.pxPerCm;
    const targetHeightPx = adjustedHeightCm * this.pxPerCm;
    
    // 计算每行/列可以放置的照片数量
    const photosPerRow = Math.floor(canvas.width / targetWidthPx);
    const photosPerCol = Math.floor(canvas.height / targetHeightPx);
    
    // 计算总照片数和起始位置（居中布局）
    const totalPhotos = photosPerRow * photosPerCol;
    const startX = (canvas.width - (photosPerRow * targetWidthPx)) / 2;
    const startY = (canvas.height - (photosPerCol * targetHeightPx)) / 2;
    
    // 绘制白色背景
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // 绘制每张照片和分隔线
    let count = 0;
    for (let row = 0; row < photosPerCol; row++) {
      for (let col = 0; col < photosPerRow; col++) {
        const x = startX + (col * targetWidthPx);
        const y = startY + (row * targetHeightPx);
        
        // 创建临时画布用于裁剪和缩放照片
        const tempCanvas = document.createElement('canvas');
        const tempCtx = tempCanvas.getContext('2d');
        if (!tempCtx) {
          throw new Error('Failed to get temporary canvas context');
        }
        
        // 设置临时画布尺寸
        tempCanvas.width = targetWidthPx;
        tempCanvas.height = targetHeightPx;
        
        // 在临时画布上绘制并缩放照片
        tempCtx.fillStyle = 'white';
        tempCtx.fillRect(0, 0, targetWidthPx, targetHeightPx);
        
        // 计算源图像的裁剪区域，保持宽高比
        let sourceX = 0;
        let sourceY = 0;
        let sourceWidth = sourceImage.width;
        let sourceHeight = sourceImage.height;
        
        // 绘制照片到临时画布
        tempCtx.drawImage(
          sourceImage,
          sourceX, sourceY, sourceWidth, sourceHeight,
          0, 0, targetWidthPx, targetHeightPx
        );
        
        // 将临时画布的内容绘制到主画布
        ctx.drawImage(tempCanvas, x, y);
        
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
}