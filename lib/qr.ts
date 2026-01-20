import QRCode from "qrcode";

export async function generateQRCodeDataURL(data: string): Promise<string> {
  return QRCode.toDataURL(data, {
    width: 300,
    margin: 2,
    color: {
      dark: "#000000",
      light: "#FFFFFF",
    },
    errorCorrectionLevel: "H",
  });
}

export async function generateQRCodeBuffer(data: string): Promise<Buffer> {
  return QRCode.toBuffer(data, {
    width: 300,
    margin: 2,
    color: {
      dark: "#000000",
      light: "#FFFFFF",
    },
    errorCorrectionLevel: "H",
  });
}

export function generateUniqueQRCode(): string {
  // Generate 5 random digits (00000-99999)
  const code = Math.floor(Math.random() * 100000).toString().padStart(5, "0");
  return `SV-${code}`;
}
