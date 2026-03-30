export function formatSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
}

export function getFileIcon(ext: string): string {
  const map: Record<string, string> = {
    pdf: 'file',
    doc: 'file',
    docx: 'file',
    txt: 'file',
    jpg: 'image',
    jpeg: 'image',
    png: 'image',
    gif: 'image',
    mp4: 'video',
    mp3: 'audio',
    zip: 'archive',
    xlsx: 'excel',
    xls: 'excel',
  };
  return map[ext.toLowerCase()] || 'attachment';
}

export function getFileExtension(filename: string): string {
  return filename.split('.').pop() || '';
}

export function removeExtension(filename: string): string {
  return filename.replace(/\.[^/.]+$/, '');
}
