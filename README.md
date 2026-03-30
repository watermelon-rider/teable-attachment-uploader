# TeaUploader - Teable 批量上传工具

基于 Next.js + React + TypeScript + Tailwind CSS 的 Teable 批量附件上传和 Excel 导入工具。

## 功能特性

- 📎 **批量附件上传**
  - 上传创建记录：每个文件创建一条新记录
  - 上传更新记录：按文件名匹配并追加到现有记录
  - 支持选择 Base 下的任意目标表
- 📊 **Excel 导入**
  - 自动解析 .xlsx 文件
  - 支持提取内嵌图片（DISPIMG 公式）
  - 自动识别图片列并转为附件字段

- 🔧 **私有化支持**
  - 支持带端口的 URL（如 `http://192.168.1.10:3000`）
  - 所有依赖已本地化，无需外网 CDN

## 技术栈

- Next.js 14
- React 18
- TypeScript
- Tailwind CSS
- XLSX (SheetJS)
- JSZip

## 开发

```bash
# 安装依赖
npm install

# 开发服务器
npm run dev

# 构建
npm run build

# 启动生产服务器
npm start
```

## Docker 部署

```bash
# 构建镜像
docker build -t teable-uploader:latest .

# 运行
docker run -d -p 3001:3001 --name teable-uploader teable-uploader:latest
```

## 使用说明

1. 打开页面后，点击右上角的设置按钮
2. 配置 Teable URL 和 API Token
3. 选择目标表
4. 选择上传模式并配置选项
5. 上传文件并开始处理
