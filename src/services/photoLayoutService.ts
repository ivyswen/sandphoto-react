import { PhotoType, ContainerType, BackgroundOption } from '../types/PhotoType';

export class PhotoLayoutService {
  private pxPerCm = 118.11; // 300dpi = 118.11px/cm

  // 检测图像是否有透明背景
  detectTransparentBackground(image: HTMLImageElement): Promise<boolean> {
    return new Promise((resolve) => {
      // 创建临时Canvas来分析图像
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        resolve(false);
        return;
      }
      
      canvas.width = image.width;
      canvas.height = image.height;
      
      // 绘制图像到Canvas
      ctx.drawImage(image, 0, 0);
      
      // 获取图像数据
      try {
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        
        // 检查是否有透明像素
        // 只需要检查图像边缘和一些随机点，不需要检查所有像素
        const checkPoints = [
          // 检查四个角落
          {x: 0, y: 0},
          {x: canvas.width - 1, y: 0},
          {x: 0, y: canvas.height - 1},
          {x: canvas.width - 1, y: canvas.height - 1},
          // 检查中心区域
          {x: Math.floor(canvas.width / 2), y: Math.floor(canvas.height / 2)},
        ];
        
        // 检查边缘
        const edgePoints = 20; // 检查边缘上的点数
        for (let i = 1; i < edgePoints; i++) {
          checkPoints.push({x: Math.floor(canvas.width * i / edgePoints), y: 0}); // 上边缘
          checkPoints.push({x: Math.floor(canvas.width * i / edgePoints), y: canvas.height - 1}); // 下边缘
          checkPoints.push({x: 0, y: Math.floor(canvas.height * i / edgePoints)}); // 左边缘
          checkPoints.push({x: canvas.width - 1, y: Math.floor(canvas.height * i / edgePoints)}); // 右边缘
        }
        
        // 检查所有点
        for (const point of checkPoints) {
          const index = (point.y * canvas.width + point.x) * 4;
          const alpha = data[index + 3];
          
          // 如果找到透明或半透明像素
          if (alpha < 250) {
            resolve(true);
            return;
          }
        }
        
        resolve(false);
      } catch (error) {
        console.error('检测透明背景时出错:', error);
        resolve(false);
      }
    });
  }

  calculateOptimalLayout(
    sourceImage: HTMLImageElement,
    targetType: PhotoType,
    containerType: ContainerType,
    lineColor: string,
    background?: BackgroundOption
  ): { canvas: HTMLCanvasElement; count: number } {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    
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
    const startX = (canvas.width - (photosPerRow * targetWidthPx)) / 2;
    const startY = (canvas.height - (photosPerCol * targetHeightPx)) / 2;
    
    // 绘制相纸背景（始终为白色）
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
        const tempCtx = tempCanvas.getContext('2d', { willReadFrequently: true });
        if (!tempCtx) {
          throw new Error('Failed to get temporary canvas context');
        }
        
        // 设置临时画布尺寸
        tempCanvas.width = targetWidthPx;
        tempCanvas.height = targetHeightPx;
        
        // 清除临时画布
        tempCtx.clearRect(0, 0, targetWidthPx, targetHeightPx);
        
        // 如果指定了背景颜色，先填充背景
        if (background) {
          tempCtx.fillStyle = background.color;
          tempCtx.fillRect(0, 0, targetWidthPx, targetHeightPx);
          
          // 设置混合模式，确保透明部分显示背景色
          tempCtx.globalCompositeOperation = 'source-atop';
        }
        
        // 计算源图像的裁剪区域，保持宽高比
        const sourceX = 0;
        const sourceY = 0;
        const sourceWidth = sourceImage.width;
        const sourceHeight = sourceImage.height;
        
        // 绘制照片
        tempCtx.drawImage(
          sourceImage,
          sourceX, sourceY, sourceWidth, sourceHeight,
          0, 0, targetWidthPx, targetHeightPx
        );
        
        // 重置混合模式
        tempCtx.globalCompositeOperation = 'source-over';
        
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