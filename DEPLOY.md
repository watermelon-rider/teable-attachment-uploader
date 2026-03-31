# TeaUploader Deployment Guide

## Option 1: Pull from GitHub Packages (Recommended, Network Required)

Images are automatically built and pushed to GitHub Container Registry.

```bash
# Pull the image
docker pull ghcr.io/watermelon-rider/teable-attachment-uploader:latest

# Run
docker run -d \
  --name teable-uploader \
  -p 3001:3001 \
  --restart unless-stopped \
  ghcr.io/watermelon-rider/teable-attachment-uploader:latest

# Access http://<server-ip>:3001
```

### Using Docker Compose

```bash
# Download compose file
curl -O https://raw.githubusercontent.com/watermelon-rider/teable-attachment-uploader/main/docker-compose.yml

# Start (default port 3001)
docker-compose up -d

# Or use custom port
UPLOADER_PORT=8080 docker-compose up -d
```

---

## Option 2: Offline Deployment (No Network Environment)

### Download Image Package

1. Visit the [GitHub Actions](https://github.com/watermelon-rider/teable-attachment-uploader/actions) page
2. Click the latest successful build (green ✅)
3. Go to the **Artifacts** section at the bottom of the page
4. Download `teable-uploader-image.zip`, extract to get `teable-uploader.tar`

### Deployment

Transfer `teable-uploader.tar` to the offline server:

```bash
# Import image
docker load -i teable-uploader.tar

# Run
docker run -d \
  --name teable-uploader \
  -p 3001:3001 \
  --restart unless-stopped \
  teable-uploader:latest
```

Or start using the script:

```bash
# Use the project's built-in script (optional)
./start.sh        # Default port 3001
./start.sh 8080   # Custom port
```

---

## Option 3: Local Build

```bash
# Clone the repository
git clone https://github.com/watermelon-rider/teable-attachment-uploader.git
cd teable-attachment-uploader

# Build the image
docker build -t teable-uploader:latest .

# Run
docker run -d -p 3001:3001 --name teable-uploader teable-uploader:latest
```

---

## Common Commands

```bash
# View logs
docker logs -f teable-uploader

# Restart
docker restart teable-uploader

# Stop and remove
docker stop teable-uploader && docker rm teable-uploader

# Check status
docker ps | grep teable-uploader
```

---

## Troubleshooting

**Port already in use**:
```bash
# Use a different port
docker run -d -p 8080:3001 --name teable-uploader ghcr.io/watermelon-rider/teable-attachment-uploader:latest
```

**Firewall issues**:
```bash
# CentOS
firewall-cmd --add-port=3001/tcp --permanent
firewall-cmd --reload

# Ubuntu
ufw allow 3001/tcp
```

**Image pull failed**:
```bash
# Check network connection
# Public images do not require login, can be pulled directly
```
