# TeaUploader 离线安装指南

本文档假设你已将离线包 `teable-uploader.tar` 传输到服务器。

## 前提条件

- 服务器已安装 Docker
- 离线包 `teable-uploader.tar` 已上传到服务器任意位置

## 安装步骤

### 1. 进入主目录并创建项目文件夹

```bash
cd ~
mkdir teable-uploader
cd teable-uploader
```

### 2. 将离线包移动到项目文件夹

```bash
mv /path/to/teable-uploader.tar ./
```

### 3. 创建 docker-compose.yml 文件

```bash
cat > docker-compose.yml << 'EOF'
services:
  teable-uploader:
    image: teable-uploader:latest
    container_name: teable-uploader
    ports:
      - "3001:3001"
    restart: unless-stopped
EOF
```

### 4. 导入 Docker 镜像

```bash
docker load -i teable-uploader.tar
```

### 5. 启动服务

```bash
docker-compose up -d
```

### 6. 验证运行

```bash
docker ps | grep teable-uploader
```

### 7. 访问应用

打开浏览器访问：`http://<服务器IP>:3001`

---

## 常用命令

```bash
# 进入项目目录
cd ~/teable-uploader

# 查看日志
docker logs -f teable-uploader

# 停止服务
docker-compose down

# 重启服务
docker-compose restart

# 查看状态
docker ps | grep teable-uploader
```

---

## 自定义端口

如需修改端口，编辑 `docker-compose.yml`：

```bash
cd ~/teable-uploader
vi docker-compose.yml
```

修改端口映射：

```yaml
ports:
  - "8080:3001"  # 将 3001 改为 8080
```

然后重启：

```bash
docker-compose down
docker-compose up -d
```

---

## 故障排查

**端口被占用**：
```bash
# 修改 docker-compose.yml 中的端口映射
vi ~/teable-uploader/docker-compose.yml
```

**防火墙问题**：
```bash
# CentOS
sudo firewall-cmd --add-port=3001/tcp --permanent
sudo firewall-cmd --reload

# Ubuntu
sudo ufw allow 3001/tcp
```
