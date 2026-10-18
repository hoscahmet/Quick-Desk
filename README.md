# ⚡ QuickDesk (Modern Electron + React 19 + TypeScript + Tailwind CSS)

**QuickDesk**, geliştiriciler ve günlük bilgisayar kullanıcıları için özel olarak tasarlanmış; modern, ultra-hızlı ve tip-güvenli bir masaüstü yardımcı uygulamasıdır.

Bu proje, güncel endüstri standartları doğrultusunda **`electron-vite`**, **React 19**, **TypeScript** ve **Tailwind CSS v4** yığını ile inşa edilmiştir.

---

## 🛠️ Modern Teknoloji Yığını

- ⚡ **[electron-vite](https://electron-vite.org/)**: Vite tabanlı ultra hızlı derleyici ve HMR (Hot Module Replacement) desteği.
- ⚛️ **React 19 & TypeScript**: Tip güvenli bileşen mimarisi ve güvenli IPC haberleşmesi.
- 🎨 **Tailwind CSS v4**: `@tailwindcss/vite` eklentisiyle optimize edilmiş modern koyu tema ve şık UI.
- 🔣 **Lucide React**: Tutarlı ve hafif SVG ikon seti.
- 🔒 **Sıkı Güvenlik Mimarisi**: `contextIsolation: true`, `nodeIntegration: false`, `contextBridge` ile güvenli IPC iletişimi.

---

## 🌟 Temel Özellikler

1. **📌 Always on Top & Kompakt Mod**:
   - Pencereyi diğer tüm uygulamaların (IDE, tarayıcı vb.) üzerinde sabitleyebilme.
   - Tek tıkla minimalist yapışkan not moduna (`380x520`) küçültme.
2. **📝 Hızlı Notlar & Karalama Defteri (Quick Notes)**:
   - Çoklu not desteği, canlı karakter & kelime sayacı, tek tıkla panoya kopyalama ve silme.
   - Electron `userData` dizinine otomatik arkaplan kaydı (debounced auto-save).
3. **📋 Kod Parçacıkları & Pano Kasası (Snippet Vault)**:
   - Git, Docker, CSS, SQL vb. snippet'larını kategori ve başlıklarla saklama, anlık arama ve kopyalama.
4. **🛠️ Geliştirici & Metin Araç Kutusu (DevTools)**:
   - **JSON**: Beautify (girintileme), Minify (sıkıştırma) ve sözdizimi doğrulama.
   - **Base64 & URL**: UTF-8 destekli Base64 ve URL kodlama / çözme.
   - **Metin Dönüştürücü**: BÜYÜK, küçük, Başlık, camelCase, snake_case, kebab-case ve canlı istatistikler.
   - **Üreteçler (Generators)**: UUID v4, güçlü rastgele parola ve anlık Unix Timestamp.
5. **⏱️ Pomodoro Odak Sayacı & Görev Takibi**:
   - 25 dk çalışma / 5 dk mola sayacı (Web Audio API sentezli yumuşak zil uyarısı).
   - Tamamlanan işlerin üzerini çizebileceğiniz dinamik yapılacaklar listesi.
6. **🌐 Çift Dil Desteği (Türkçe & İngilizce)**:
   - Header üzerinde anlık geçiş yapılabilen `[ TR | EN ]` dil değiştirici düğmesi.
   - Tüm sekmeler, diyaloglar, araçlar ve toast bildirimlerinde eksiksiz yerelleştirme.
   - Kullanıcı dil tercihinin Electron veri dosyasına ve `localStorage`'a kalıcı olarak kaydedilmesi.
   - Metin dönüştürücüde ve zaman damgasında dile duyarlı yerel ayarlar (`tr-TR` ve `en-US`).

---

## ⌨️ Klavye Kısayolları

| Kısayol | İşlev |
| :--- | :--- |
| `Cmd/Ctrl + 1` | **Notlar** sekmesine geçiş |
| `Cmd/Ctrl + 2` | **Snippet'lar** sekmesine geçiş |
| `Cmd/Ctrl + 3` | **Araç Kutusu** sekmesine geçiş |
| `Cmd/Ctrl + 4` | **Odak & Görevler** sekmesine geçiş |
| `Cmd/Ctrl + N` | Yeni not oluştur |
| `Cmd/Ctrl + P` | Üstte Sabitle (Pin) modunu aç / kapat |

---

## 🚀 Komutlar

```bash
# Geliştirme modunda HMR ile çalıştırma
npm run dev

# Üretim (production) için derleme
npm run build

# Derlenmiş üretim sürümünü önizleme
npm run preview
```

---

## 🏗️ Proje Mimarisi

```
clever-hertz/
├── electron.vite.config.ts # Vite ve Electron yapılandırması
├── tsconfig.json           # TypeScript derleme ayarları
├── package.json            # Modern bağımlılıklar ve scriptler
├── .gitignore              # node_modules ve dist filtreleri
├── src/
│   ├── main/               # Electron Ana Süreci (Pencere, OS IPC, Veri Kaydı)
│   │   └── index.ts
│   ├── preload/            # Context Bridge Köprüsü (Tip tanımları ile birlikte)
│   │   ├── index.ts
│   │   └── index.d.ts
│   └── renderer/           # React 19 Frontend Arayüzü
│       ├── index.html
│       └── src/
│           ├── main.tsx
│           ├── App.tsx
│           ├── index.css   # Tailwind v4 stilleri
│           ├── types.ts    # Veri tipleri
│           ├── i18n/       # Çoklu dil (TR & EN) sözlük ve Context mimarisi
│           │   ├── translations.ts
│           │   └── LanguageContext.tsx
│           └── components/ # UI Bileşenleri (Header, Nav, Notes, Snippets, Tools, Focus, Toast)
```
