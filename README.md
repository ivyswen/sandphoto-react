# Sandphoto React

Sandphoto 是一个在线证件照排版工具，允许用户在一张照片上排版多张证件照片。本项目使用 React + TypeScript 技术栈开发，提供现代化的用户界面和高效的图像处理功能。

## 功能特点

- 🖼️ **多种证件照规格**：支持包括身份证、护照、签证等多种国内外证件照标准尺寸
- 📏 **智能排版算法**：自动计算最优排版方案，最大化利用打印纸张空间
- 🎨 **自定义分割线颜色**：可根据个人喜好调整照片间分割线的颜色
- 🔄 **相纸方向调整**：支持横向/纵向切换，适应不同打印需求
- ✂️ **智能裁剪功能**：当上传照片比例与证件照不匹配时，提供交互式裁剪工具
- 📱 **响应式设计**：完美支持桌面端和移动端设备
- 🚀 **纯浏览器端处理**：所有图像处理在客户端完成，无需服务器，保护隐私
- 💾 **高清照片导出**：支持导出高质量照片，文件名自动包含照片规格信息

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
