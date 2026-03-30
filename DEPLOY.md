# TeaUploader 离线部署指南

## 打包（联网环境）

```bash
./build-offline.sh
```

输出到 `teable-uploader-offline/` 目录。

## 部署（离线环境）

```bash
cd teable-uploader-offline

# 导入镜像
docker load -i teable-uploader.tar

# 启动（默认端口 3001）
./start.sh

# 或使用自定义端口
./start.sh 8080
```

访问：`http://<服务器IP>:3001`

## 常用命令

```bash
# 查看日志
docker logs -f teable-uploader

# 重启
docker restart teable-uploader

# 停止并删除
docker stop teable-uploader && docker rm teable-uploader
```

## 故障排查

**端口被占用**：
```bash
# 换端口启动
./start.sh 8080
```

**防火墙问题**：
```bash
# CentOS
firewall-cmd --add-port=3001/tcp --permanent
firewall-cmd --reload

# Ubuntu
ufw allow 3001/tcp
```
