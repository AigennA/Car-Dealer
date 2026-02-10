# GitHub Pages Kurulum Talimatları

## Sorun
GitHub Pages şu anda yalnızca README dosyasını gösteriyor, ancak gerçek Car Dealer web sitesini göstermesi gerekiyor.

## Çözüm
GitHub Pages'in kaynak olarak **GitHub Actions** kullanacak şekilde yapılandırılması gerekiyor.

## Adım Adım Kurulum

### 1. Repository Ayarlarına Git
1. GitHub'da repository sayfasına git: `https://github.com/AigennA/Car-Dealer`
2. **Settings** (Ayarlar) sekmesine tıkla
3. Sol menüden **Pages** seçeneğine tıkla

### 2. Kaynağı Değiştir
GitHub Pages ayarlarında:
1. **Source** (Kaynak) bölümünü bul
2. Eğer şu anda "Deploy from a branch" seçiliyse, bunu değiştir
3. **GitHub Actions** seçeneğini seç

### 3. Deployment'ı Tetikle
Deploy workflow'unu çalıştırmak için:
1. Repository'nin **Actions** sekmesine git
2. Sol taraftan "Deploy to GitHub Pages" workflow'unu seç
3. **Run workflow** butonuna tıkla
4. `main` branch'ini seç ve çalıştır

### 4. Bekle ve Kontrol Et
1. Workflow'un tamamlanmasını bekle (yaklaşık 2-3 dakika)
2. Yeşil onay işareti gördüğünde deployment başarılı demektir
3. Web sitesini kontrol et: `https://AigennA.github.io/Car-Dealer/`

## Doğrulama
Web sitesi şunları göstermelidir:
- ✅ "HITTA DIN NÄSTA BIL" başlıklı ana sayfa
- ✅ Arama çubuğu (marka, model, yer seçimi)
- ✅ Öne çıkan arabalar
- ✅ Servis bilgileri
- ❌ README dosyası (bu görünmemeli)

## Teknik Detaylar
- Next.js static export kullanılıyor (`output: 'export'`)
- Build çıktısı `./out` klasöründe oluşturuluyor
- Deployment workflow: `.github/workflows/deploy.yml`
- Base path: `/Car-Dealer` (next.config.ts'de ayarlanmış)

## Eğer Sorun Devam Ederse
1. Actions sekmesinde workflow loglarını kontrol et
2. Workflow'da hata var mı diye bak
3. Pages ayarlarının "GitHub Actions" olduğunu tekrar doğrula

---

## English Version

### Problem
GitHub Pages is currently only showing the README file, but it should be showing the actual Car Dealer website.

### Solution
GitHub Pages needs to be configured to use **GitHub Actions** as the source.

### Step-by-Step Setup

#### 1. Go to Repository Settings
1. Navigate to: `https://github.com/AigennA/Car-Dealer`
2. Click the **Settings** tab
3. Click **Pages** in the left menu

#### 2. Change the Source
In GitHub Pages settings:
1. Find the **Source** section
2. If "Deploy from a branch" is currently selected, change it
3. Select **GitHub Actions**

#### 3. Trigger Deployment
To run the deploy workflow:
1. Go to the **Actions** tab
2. Select "Deploy to GitHub Pages" workflow from the left
3. Click **Run workflow**
4. Select the `main` branch and run

#### 4. Wait and Verify
1. Wait for the workflow to complete (~2-3 minutes)
2. When you see the green checkmark, deployment succeeded
3. Check the website: `https://AigennA.github.io/Car-Dealer/`

### Verification
The website should show:
- ✅ Homepage with "HITTA DIN NÄSTA BIL" heading
- ✅ Search bar (brand, model, location)
- ✅ Featured cars
- ✅ Service information
- ❌ README file (should NOT be visible)
