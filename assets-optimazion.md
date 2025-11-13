# Image Optimization Guide

## Übersicht

Diese Anleitung zeigt, wie du die Icons und Bilder der IQ Trainer App optimieren kannst, um WebP und AVIF Formate zu nutzen.

## Warum Bildoptimierung?

- **WebP:** 25-35% kleinere Dateien als PNG
- **AVIF:** 50% kleinere Dateien als PNG (neuester Standard)
- **Responsive Sizing:** Verschiedene Größen für verschiedene Displays
- **Browser Support:** Mit Fallback auf Original PNG/JPG

## Installation

### Option 1: Node.js Script (Empfohlen)

```bash
# 1. Installiere sharp (Image Processing Library)
npm install --save-dev sharp

# 2. Führe das Optimization Script aus
npm run optimize:images

# Oder direkt:
node scripts/optimize-images.js
```

### Option 2: Command Line Tools (Linux/macOS)

```bash
# Ubuntu
sudo apt-get install imagemagick webp libavif-tools

# macOS
brew install imagemagick webp libavif

# Dann das Shell Script ausführen:
bash scripts/optimize-images.sh
```

### Option 3: Online Tools (Windows/schnell)

- **TinyPNG:** https://tinypng.com/ (WebP)
- **CloudConvert:** https://cloudconvert.com/ (AVIF)
- **Squoosh:** https://squoosh.app/ (Google Tool)

## Verwendung

### Schritt 1: Icons vorbereiten
```bash
# Speichere all deine PNG/JPG Dateien in ./icons/
# z.B. icon-152x152.png, icon-192x192.png, etc.
```

### Schritt 2: Optimization ausführen
```bash
npm run optimize:images
```

**Output:**
```
🖼️  Starting Image Optimization...

📁 Source directory: ./icons
📁 Output directory: ./icons-optimized

Found 5 image(s) to optimize

📷 Processing: icon-152x152.png
   Dimensions: 152x152
   Original size: 8.5 KB
   ✅ WEBP: 2.3 KB (-73%)
   ✅ AVIF: 1.8 KB (-79%)
   ✅ 152x152 WEBP: 2.3 KB
   ✅ 152x152 AVIF: 1.8 KB

...

📊 Optimization Summary:
   Original total: 45.2 KB
   Optimized total: 12.8 KB
   Saved: 32.4 KB
   Reduction: 71.6%
```

### Schritt 3: Optimierte Dateien verwenden

```bash
# Kopiere optimierte Dateien zurück
cp icons-optimized/* icons/
```

## HTML Implementation

### Responsive Images mit Picture Element

```html
<!-- Modernes Markup mit Fallback -->
<picture>
  <!-- AVIF für modernste Browser -->
  <source srcset="icons/icon-152.avif" type="image/avif">
  <!-- WebP für moderne Browser -->
  <source srcset="icons/icon-152.webp" type="image/webp">
  <!-- PNG Fallback -->
  <img src="icons/icon-152.png" alt="App Icon" width="152" height="152">
</picture>
```

### Responsive Icons mit mehreren Größen

```html
<picture>
  <!-- AVIF Varianten -->
  <source 
    srcset="icons/icon-72.avif 72w,
            icons/icon-96.avif 96w,
            icons/icon-152.avif 152w"
    type="image/avif">
  
  <!-- WebP Varianten -->
  <source 
    srcset="icons/icon-72.webp 72w,
            icons/icon-96.webp 96w,
            icons/icon-152.webp 152w"
    type="image/webp">
  
  <!-- PNG Fallback -->
  <img 
    src="icons/icon-152.png" 
    alt="App Icon"
    sizes="(max-width: 96px) 96px, 152px">
</picture>
```

### Für Apple Touch Icons

```html
<!-- AVIF & WebP für Apple Devices -->
<link rel="apple-touch-icon" href="icons/icon-180.avif">
<link rel="apple-touch-icon" href="icons/icon-180.webp">
<link rel="apple-touch-icon" href="icons/icon-180.png">
```

## Service Worker Update

Die `sw.js` wurde bereits aktualisiert um WebP/AVIF zu cachen:

```javascript
function isImageRequest(url) {
  return /\.(jpg|jpeg|png|gif|webp|avif|svg)$/i.test(url.pathname);
}
```

Die neuen Formate werden automatisch mit "Stale While Revalidate" Strategie gecacht.

## Browser Kompatibilität

| Format | Chrome | Firefox | Safari | Edge |
|--------|--------|---------|--------|------|
| PNG    | ✅ All | ✅ All  | ✅ All | ✅ All |
| WebP   | ✅ 23+ | ✅ 65+  | ✅ 16+ | ✅ 18+ |
| AVIF   | ✅ 85+ | ✅ 113+ | ✅ 16+ | ✅ 85+ |

## Performance Gains

Beispiel: icon-152x152.png → Multiple Formate

```
Original:              8.5 KB (PNG)
├─ WebP:              2.3 KB (-73%)
└─ AVIF:              1.8 KB (-79%)

Mit Responsive Sizing:
├─ icon-72.webp:      0.8 KB
├─ icon-96.webp:      1.2 KB
├─ icon-152.webp:     2.3 KB
├─ icon-72.avif:      0.6 KB
├─ icon-96.avif:      0.9 KB
└─ icon-152.avif:     1.8 KB

Gesamt für alle Formate: ~11 KB statt 50+ KB
```

## CI/CD Integration

GitHub Actions führt automatisch aus:

```yaml
- name: Optimize Images
  run: npm run optimize:images
```

Danach werden optimierte Dateien in den Build aufgenommen.

## Troubleshooting

### Sharp Installation Fehler

```bash
# Windows: VC++ Build Tools erforderlich
npm install --build-from-source

# macOS/Linux: 
npm cache clean --force
npm install
```

### WebP/AVIF wird nicht unterstützt

Der Browser zeigt automatisch das PNG Fallback. Das ist OK, aber überprüfe:

```javascript
// Browser Check
const webpSupport = (() => {
  const canvas = document.createElement('canvas');
  return canvas.toDataURL('image/webp').includes('image/webp');
})();

const avifSupport = (() => {
  const image = new Image();
  image.onload = image.onerror = () => {
    console.log(avifSupport);
  };
  image.src = 'data:image/avif;base64,AAAAIGZ0eXBhdmlmAAAAAGF2aWZjbGlwAA==';
})();
```

## Best Practices

✅ **DO:**
- Nutze `picture` Element für moderne Browser
- Immer ein PNG/JPG Fallback haben
- Verschiedene Größen für responsive Design
- Regelmäßig Bilder neu optimieren

❌ **DON'T:**
- WebP/AVIF ohne Fallback
- Zu aggressive Qualitätsreduktion (< 75%)
- Große Originalauflösungen servieren
- Gleiche Bildgröße für alle Devices

## Weitere Ressourcen

- [MDN: Picture Element](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/picture)
- [Sharp Dokumentation](https://sharp.pixelplumbing.com/)
- [WebP Dokumentation](https://developers.google.com/speed/webp)
- [AVIF Specification](https://aomediacodec.org/av1-image/)
