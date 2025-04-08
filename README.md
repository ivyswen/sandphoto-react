# 证件照排版工具

一个简单易用的在线证件照排版工具，帮助用户快速生成符合标准的证件照。

## 主要功能

### 1. 照片处理
- 支持上传各种格式的照片（JPG、PNG等）
- 智能检测照片透明背景
- 自动裁剪功能，确保照片符合证件照比例要求
- 支持照片旋转调整

### 2. 专业背景色选择
- **标准白色背景**
  - 适用于：身份证、护照、签证等证件照
  - 符合国际通用规范
  
- **深蓝色背景** (RGB: 67, 142, 219)
  - 适用于：毕业证、工作证、人事档案
  - 专业正式的色调
  
- **浅蓝色背景** (RGB: 0, 191, 243)
  - 适用于：学历证书、社保照片
  - 清新亮丽的色调
  
- **正红色背景** (RGB: 255, 0, 0)
  - 适用于：结婚证、保险单、医保卡
  - 喜庆典雅的色调

### 3. 排版功能
- 智能计算最佳排版方案
- 支持自定义相纸尺寸
- 支持横竖排版切换
- 自定义分割线颜色
- 显示可打印照片数量

### 4. 用户体验优化
- 使用 Google Noto Sans SC 字体，提供清晰美观的中文显示
- 实时预览背景色效果
- 简洁直观的操作界面
- 响应式设计，支持各种设备

## 使用说明

1. **上传照片**
   - 点击上传区域或拖拽照片
   - 支持 JPG、PNG 等常见格式
   - 自动检测透明背景

2. **选择证件照类型**
   - 选择所需的证件照尺寸
   - 如需要会自动进入裁剪界面

3. **选择背景颜色**
   - 根据证件类型选择对应的标准背景色
   - 可实时预览效果

4. **选择打印尺寸**
   - 选择相纸尺寸
   - 可切换横竖排版方向

5. **生成和下载**
   - 点击生成按钮预览效果
   - 确认无误后点击下载

## 技术特点

- 使用 React + TypeScript 开发
- TailwindCSS 响应式设计
- Google Fonts 优化字体显示
- Canvas 技术处理图片
- 支持 PNG 透明背景处理

## 注意事项

- 建议上传清晰的证件照片
- PNG格式可以保持透明背景
- 请根据实际证件要求选择正确的背景颜色
- 下载的图片为 JPG 格式，保证打印质量

## 更新日志

### 2024.03.xx
- 新增专业证件照背景色选择
- 优化字体显示，使用 Google Noto Sans SC
- 改进透明背景检测和处理
- 优化用户界面和交互体验

## 开发计划

- [ ] 添加更多证件照类型和尺寸
- [ ] 支持批量处理功能
- [ ] 添加照片美化功能
- [ ] 支持自定义背景颜色
- [ ] 添加证件照规格说明

## 技术栈

- **前端框架**：React 18 + TypeScript
- **状态管理**：React Hooks + Context API
- **UI 设计**：Tailwind CSS
- **图像处理**：Canvas API
- **文件上传**：react-dropzone
- **图像裁剪**：react-image-crop
- **图标库**：lucide-react
- **通知组件**：react-hot-toast
- **构建工具**：Vite

## 快速开始

### 环境要求

- Node.js >= 16
- npm >= 8 或 yarn >= 1.22 或 pnpm

### 安装步骤

1. 克隆项目
```bash
git clone https://github.com/ivyswen/sandphoto-react.git
cd sandphoto-react
```

2. 安装依赖
```bash
npm install
# 或
yarn install
# 或
pnpm install
```

3. 启动开发服务器
```bash
npm run dev
# 或
yarn dev
# 或
pnpm dev
```

4. 打开浏览器访问 http://localhost:5173

### 构建部署

```bash
npm run build
# 或
yarn build
# 或
pnpm build
```

构建后的文件将生成在 `dist` 目录中，可以部署到任何静态文件服务器。

## 项目结构

```
sandphoto-react/
├── public/
│   ├── phototype.json       # 证件照和打印尺寸数据
├── src/
│   ├── components/          # UI组件
│   │   ├── Footer.tsx
│   │   ├── Header.tsx
│   │   ├── ImageCropper.tsx # 图像裁剪组件
│   │   ├── LineColorSelector.tsx
│   │   ├── PhotoUploader.tsx
│   │   └── SizeSelector.tsx
│   ├── services/
│   │   └── photoLayoutService.ts  # 照片排版核心逻辑
│   ├── types/
│   │   └── PhotoType.ts     # 类型定义
│   ├── App.tsx              # 主应用组件
│   └── main.tsx             # 应用入口
└── package.json
```

## 核心功能实现

- **照片上传**：使用 react-dropzone 实现拖放上传功能
- **智能裁剪**：当照片比例与证件照不匹配时，自动提示并启用裁剪功能
- **排版算法**：基于 Canvas API 实现的排版算法，自动计算最佳布局
- **相纸旋转**：支持旋转相纸方向，重新计算排版
- **分割线颜色**：支持自定义分割线颜色，实时预览效果

## 开发文档

详细的开发文档请参考：

- [开发计划](docs/development-plan.md)
- [设计方案](docs/plan.md)
- [照片类型规格](docs/photoTypes.md)

## 贡献指南

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交改动 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 提交 Pull Request

## 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情

## 联系我们

如有问题或建议，欢迎提交 Issue 或 Pull Request。
