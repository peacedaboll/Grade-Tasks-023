export function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} Б`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} КБ`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} МБ`;
}

export function extOf(fileName: string): string {
  const m = /\.([^.]+)$/.exec(fileName);
  return m ? m[1].toLowerCase() : '';
}

const EXT_LABELS: Record<string, string> = {
  pdf: 'PDF',
  doc: 'DOC',
  docx: 'DOCX',
  xls: 'XLS',
  xlsx: 'XLSX',
  ppt: 'PPT',
  pptx: 'PPTX',
  txt: 'TXT',
  md: 'MD',
  zip: 'ZIP',
  rar: 'RAR',
  '7z': '7Z',
  jpg: 'JPG',
  jpeg: 'JPEG',
  png: 'PNG',
  gif: 'GIF',
  webp: 'WEBP',
  svg: 'SVG',
  mp4: 'MP4',
  mov: 'MOV',
  avi: 'AVI',
  mkv: 'MKV',
  mp3: 'MP3',
  wav: 'WAV'
};

export function extLabel(fileName: string): string {
  const ext = extOf(fileName);
  return EXT_LABELS[ext] ?? (ext ? ext.toUpperCase() : 'FILE');
}

const PREVIEWABLE = new Set([
  'pdf',
  'png',
  'jpg',
  'jpeg',
  'gif',
  'webp',
  'svg',
  'txt',
  'md'
]);

export function canPreview(fileName: string): boolean {
  return PREVIEWABLE.has(extOf(fileName));
}

export function downloadBlob(blob: Blob, fileName: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    URL.revokeObjectURL(url);
    a.remove();
  }, 3000);
}

export function openBlob(blob: Blob): void {
  const url = URL.createObjectURL(blob);
  const w = window.open(url, '_blank');
  if (w) {
    w.addEventListener('load', () => URL.revokeObjectURL(url));
  } else {
    URL.revokeObjectURL(url);
  }
}