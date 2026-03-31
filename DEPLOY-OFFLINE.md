# TeaUploader 离线安装指南

本文档假设你已将离线包 `teable-uploader.tar` 传输到服务器，且 `docker-compose.yml` 文件已放置在 `~` 目录下。

## 前提条件

- 服务器已安装 Docker
- 离线包 `teable-uploader.tar` 已上传到服务器
- `docker-compose.yml` 文件已存在于 `~` 目录

## 安装步骤

### 1. 进入主目录

```bash
cd ~
```

### 2. 导入 Docker 镜像

```bash
docker load -i teable-uploader.tar
```

### 3. 启动服务

```bash
docker-compose up -d
```

### 4. 验证运行

```bash
docker ps | grep teable-uploader
```

### 5. 访问应用

打开浏览器访问：`http://<服务器IP>:3001`

---

## 常用命令

```bash
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
# 或使用其他端口启动
```

**防火墙问题**：
```bash
# CentOS
firewall-cmd --add-port=3001/tcp --permanent
firewall-cmd --reload

# Ubuntu
ufw allow 3001/tcp
```
