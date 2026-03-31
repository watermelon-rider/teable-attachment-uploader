# TeaUploader 部署指南

## 方式一：从 GitHub Packages 拉取（推荐，需联网）

镜像自动构建并推送到 GitHub Container Registry。

```bash
# 拉取镜像
docker pull ghcr.io/watermelon-rider/teable-attachment-uploader:latest

# 运行
docker run -d \
  --name teable-uploader \
  -p 3001:3001 \
  --restart unless-stopped \
  ghcr.io/watermelon-rider/teable-attachment-uploader:latest

# 访问 http://<服务器IP>:3001
```

### 使用 Docker Compose

```bash
# 下载 compose 文件
curl -O https://raw.githubusercontent.com/watermelon-rider/teable-attachment-uploader/main/docker-compose.yml

# 启动（默认端口 3001）
docker-compose up -d

# 或使用自定义端口
UPLOADER_PORT=8080 docker-compose up -d
```

---

## 方式二：离线部署（无网络环境）

### 下载镜像包

1. 访问 [GitHub Actions](https://github.com/watermelon-rider/teable-attachment-uploader/actions) 页面
2. 点击最新的成功构建（绿色 ✅）
3. 页面底部 **Artifacts** 区域
4. 下载 `teable-uploader-image.zip`，解压得到 `teable-uploader.tar`

### 部署

将 `teable-uploader.tar` 传到离线服务器：

```bash
# 导入镜像
docker load -i teable-uploader.tar

# 运行
docker run -d \
  --name teable-uploader \
  -p 3001:3001 \
  --restart unless-stopped \
  teable-uploader:latest
```

或使用脚本启动：

```bash
# 使用项目自带的脚本（可选）
./start.sh        # 默认 3001 端口
./start.sh 8080   # 自定义端口
```

---

## 方式三：本地构建

```bash
# 克隆仓库
git clone https://github.com/watermelon-rider/teable-attachment-uploader.git
cd teable-attachment-uploader

# 构建镜像
docker build -t teable-uploader:latest .

# 运行
docker run -d -p 3001:3001 --name teable-uploader teable-uploader:latest
```

---

## 常用命令

```bash
# 查看日志
docker logs -f teable-uploader

# 重启
docker restart teable-uploader

# 停止并删除
docker stop teable-uploader && docker rm teable-uploader

# 查看状态
docker ps | grep teable-uploader
```

---

## 故障排查

**端口被占用**：
```bash
# 换端口启动
docker run -d -p 8080:3001 --name teable-uploader ghcr.io/watermelon-rider/teable-attachment-uploader:latest
```

**防火墙问题**：
```bash
# CentOS
firewall-cmd --add-port=3001/tcp --permanent
firewall-cmd --reload

# Ubuntu
ufw allow 3001/tcp
```

**镜像拉取失败**：
```bash
# 检查网络连接
# 公开镜像不需要登录，可直接拉取
```
