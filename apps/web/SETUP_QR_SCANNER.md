# QR Code Scanner Setup

## Dependency Required

Untuk menggunakan QR code scanner component, install dependency berikut:

```bash
cd apps/web
npm install html5-qrcode
```

## Usage

QR Code Scanner component sudah diimplementasikan di:
- `src/features/checkin/components/QRCodeScanner.tsx`

Component ini sudah digunakan di:
- `app/[locale]/(admin)/scanner/page.tsx`

## Features

1. **Camera-based QR Scanning**: Menggunakan web camera API untuk scan QR code
2. **Manual QR Input**: Fallback input manual jika camera tidak tersedia
3. **Real-time Validation**: Validasi QR code sebelum check-in
4. **Check-in Processing**: Automatic check-in setelah QR code divalidasi
5. **Feedback**: Visual feedback, vibration (jika tersedia), dan sound (jika tersedia)
6. **Error Handling**: Comprehensive error handling untuk berbagai skenario

## Camera Permission

Component akan:
- Request camera permission secara otomatis
- Menampilkan UI untuk request permission jika ditolak
- Menyediakan manual input sebagai fallback

## Mobile Optimization

Component sudah dioptimasi untuk:
- Mobile-friendly UI
- Touch-friendly controls
- Responsive layout
- Fullscreen scanner mode

