#!/bin/bash

# TeaUploader 离线打包脚本
# 输出：Docker 镜像 + 简单启动脚本

set -e

echo "========================================"
echo "   TeaUploader 离线打包"
echo "========================================"
echo ""

# 检查 Docker
if ! command -v docker &> /dev/null; then
    echo "错误：未检测到 Docker"
    exit 1
fi

# 构建镜像
echo "构建 Docker 镜像..."
docker build -t teable-uploader:latest .

# 导出镜像
echo "导出镜像..."
docker save -o teable-uploader.tar teable-uploader:latest

# 创建部署目录
mkdir -p teable-uploader-offline
cp teable-uploader.tar teable-uploader-offline/

# 创建启动脚本
cat > teable-uploader-offline/start.sh << 'EOF'
#!/bin/bash
# 启动 TeaUploader（端口默认 3001，可通过参数修改）

PORT="${1:-3001}"

echo "启动 TeaUploader..."
echo "端口: $PORT"

# 导入镜像
docker load -i teable-uploader.tar

# 停止旧容器（如果存在）
docker stop teable-uploader 2>/dev/null || true
docker rm teable-uploader 2>/dev/null || true

# 启动
docker run -d \
  --name teable-uploader \
  -p "$PORT":3001 \
  --restart unless-stopped \
  teable-uploader:latest

echo "启动完成"
echo "访问: http://$(hostname -I | awk '{print $1}'):$PORT"
EOF

chmod +x teable-uploader-offline/start.sh

echo ""
echo "========================================"
echo "   打包完成"
echo "========================================"
echo ""
echo "输出目录: teable-uploader-offline/"
echo ""
ls -lh teable-uploader-offline/
