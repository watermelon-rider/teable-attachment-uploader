# TeaUploader - Teable Batch Upload Tool

A Teable batch attachment upload and Excel import tool built with Next.js + React + TypeScript + Tailwind CSS.

## Features

- 📎 **Batch Attachment Upload**
  - Upload to create records: Each file creates a new record
  - Upload to update records: Match by filename and append to existing records
  - Support selecting any table under a Base
- 📊 **Excel Import**
  - Automatically parse .xlsx files
  - Support extracting embedded images (DISPIMG formula)
  - Auto-detect image columns and convert to attachment fields

- 🔧 **Self-Hosted Support**
  - Support URLs with port (e.g., `http://192.168.1.10:3000`)
  - All dependencies are localized, no external CDN required

## Tech Stack

- Next.js 14
- React 18
- TypeScript
- Tailwind CSS
- XLSX (SheetJS)
- JSZip

## Deployment

### Option 1: Pull from GitHub Packages (Recommended)

Images are automatically built and pushed to GitHub Container Registry.

```bash
# Pull the latest image
docker pull ghcr.io/watermelon-rider/teable-attachment-uploader:latest

# Run
docker run -d \
  --name teable-uploader \
  -p 3001:3001 \
  --restart unless-stopped \
  ghcr.io/watermelon-rider/teable-attachment-uploader:latest

# Access http://server-ip:3001
```

### Option 2: Local Build

```bash
# Clone the repository
git clone https://github.com/watermelon-rider/teable-attachment-uploader.git
cd teable-attachment-uploader

# Build the image
docker build -t teable-uploader:latest .

# Run
docker run -d -p 3001:3001 --name teable-uploader teable-uploader:latest
```

### Option 3: Offline Deployment

Download the image tar file to the offline environment:

1. Download build artifacts from the [GitHub Actions](https://github.com/watermelon-rider/teable-attachment-uploader/actions) page
2. Or use `docker save` to export the image and transfer to the offline server

See [DEPLOY.md](./DEPLOY.md) for more details.

## Development

```bash
# Install dependencies
yarn install

# Development server
yarn dev

# Build
yarn build

# Start production server
yarn start
```

## Usage Instructions

1. Open the page and click the settings button in the top right corner
2. Configure Teable URL and API Token
3. Select the target table
4. Choose the upload mode and configure options
5. Upload files and start processing

## License

MIT
