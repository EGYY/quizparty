import * as QRCode from 'qrcode';

export type QrMatrix = {
  size: number;
  data: boolean[];
};

export function createQrMatrix(value: string): QrMatrix {
  const qr = QRCode.create(value, { errorCorrectionLevel: 'M' });

  return {
    size: qr.modules.size,
    data: Array.from(qr.modules.data, Boolean),
  };
}

export function buildQrSvgPath(qrMatrix: QrMatrix): string {
  const size = qrMatrix.size;
  let path = '';

  for (let i = 0; i < qrMatrix.data.length; i++) {
    if (qrMatrix.data[i]) {
      const col = i % size;
      const row = Math.floor(i / size);
      path += `M${col},${row}h1v1h-1Z`;
    }
  }

  return path;
}

export function getJoinUrlLabel(joinUrl: string): string {
  return joinUrl.replace(/^https?:\/\//, '')?.split('/')?.[0] ?? joinUrl;
}

