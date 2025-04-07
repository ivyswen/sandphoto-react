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
    
    // 计算目标照片尺寸
    const targetWidthPx = targetType.widthCm * this.pxPerCm;
    const targetHeightPx = targetType.heightCm * this.pxPerCm;
    
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
        
        // 绘制照片
        ctx.drawImage(sourceImage, x, y, targetWidthPx, targetHeightPx);
        
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