# GitHub Pages Deployment Guide

## Kurulum Adımları

Bu Next.js uygulaması GitHub Pages için statik export olarak yapılandırılmıştır.

### 1. GitHub Repository Ayarları

1. GitHub repository'nize gidin
2. **Settings** > **Pages** bölümüne gidin
3. **Source** kısmında **GitHub Actions** seçin

### 2. Otomatik Deployment

Her `main` branch'e push yapıldığında:
- GitHub Actions workflow otomatik olarak çalışır
- Uygulama build edilir (`npm run build`)
- Statik dosyalar GitHub Pages'e deploy edilir

### 3. Manuel Deployment

Gerekirse manuel olarak deploy etmek için:
1. Repository'de **Actions** sekmesine gidin
2. **Deploy to GitHub Pages** workflow'unu seçin
3. **Run workflow** butonuna tıklayın

## Build Süreci

```bash
# Dependencies yükle
npm install

# Static export oluştur
npm run build

# Build çıktısı /out dizininde oluşturulur
```

## Önemli Notlar

- Uygulama `/Car-Dealer` basePath ile yapılandırılmıştır
- Görseller optimize edilmemiştir (GitHub Pages gereksinimi)
- `.nojekyll` dosyası Jekyll işlemesini engeller
- Dynamic routes `generateStaticParams` ile statik olarak oluşturulur

## Site URL

Deployment tamamlandıktan sonra site şu adreste yayınlanır:
```
https://AigennA.github.io/Car-Dealer/
```

## Sorun Giderme

### Sayfa bulunamıyor (404)
- GitHub Pages ayarlarının doğru yapılandırıldığından emin olun
- Workflow'un başarıyla tamamlandığını kontrol edin

### CSS/JS dosyaları yüklenmiyor
- `basePath` yapılandırmasının doğru olduğundan emin olun
- Browser console'da hataları kontrol edin

### Build hatası
- `npm run build` komutunu lokal olarak çalıştırın
- TypeScript hatalarını kontrol edin
