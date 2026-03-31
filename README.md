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

## 部署

### 方式一：从 GitHub Packages 拉取（推荐）

镜像自动构建并推送到 GitHub Container Registry。

```bash
# 拉取最新镜像
docker pull ghcr.io/watermelon-rider/teable-attachment-uploader:latest

# 运行
docker run -d \
  --name teable-uploader \
  -p 3001:3001 \
  --restart unless-stopped \
  ghcr.io/watermelon-rider/teable-attachment-uploader:latest

# 访问 http://服务器IP:3001
```

### 方式二：本地构建

```bash
# 克隆仓库
git clone https://github.com/watermelon-rider/teable-attachment-uploader.git
cd teable-attachment-uploader

# 构建镜像
docker build -t teable-uploader:latest .

# 运行
docker run -d -p 3001:3001 --name teable-uploader teable-uploader:latest
```

### 方式三：离线部署

下载镜像 tar 文件到离线环境：

1. 在 [GitHub Actions](https://github.com/watermelon-rider/teable-attachment-uploader/actions) 页面下载构建产物
2. 或使用 `docker save` 导出镜像传输到离线服务器

详见 [DEPLOY.md](./DEPLOY.md)

## 开发

```bash
# 安装依赖
yarn install

# 开发服务器
yarn dev

# 构建
yarn build

# 启动生产服务器
yarn start
```

## 使用说明

1. 打开页面后，点击右上角的设置按钮
2. 配置 Teable URL 和 API Token
3. 选择目标表
4. 选择上传模式并配置选项
5. 上传文件并开始处理

## License

MIT
