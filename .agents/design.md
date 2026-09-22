# 🎨 Panduan Sistem Desain (Design System) — Jurnal Vibes
> **Tujuan Dokumen:** Dokumentasi spesifikasi desain UI/UX, tokens, tipografi, komponen, dan pola interaksi dari **Jurnal Vibes** untuk diimplementasikan ke dalam aplikasi/website **Hallo Jurnal**.

---

## 1. Filosofi & Vibe Desain

Sistem desain ini memadukan estetika **Modern Editorial Media** dengan **Citizen Journalism Portal & Pelayanan Publik Modern**. 

- **Modern Editorial Aesthetic:** Menggunakan font Serif (*Literata*) pada judul dan headline untuk memberikan nuansa jurnalistik yang terpercaya, berwibawa, dan elegan.
- **Clean Digital Interface:** Menggunakan font Sans-Serif (*Inter*) pada elemen navigasi, formulir, teks isi, dan tombol untuk keterbacaan tinggi dan kenyamanan akses cepat.
- **Material 3 (MD3) Surface Elevation:** Menggunakan tonal surface bergradasi halus (`surface-container-lowest` hingga `surface-container-highest`) alih-alih shadow tebal yang kaku, menciptakan tampilan yang lapang, bersih, dan modern.
- **Aksen Tegas & Energik:** Merah editorial khas (`#c00015`) sebagai *Primary Action & Brand Identifier*, dipadukan dengan latar belakang *warm off-white* (`#fbf9f9`) yang ramah di mata.

---

## 2. Palet Warna & Design Tokens

### A. Core Palette (Tailwind CSS Theme)

| Token Name | Hex Code | Penggunaan / Deskripsi |
| :--- | :--- | :--- |
| `--color-primary` | `#c00015` | Warna utama (Brand, tombol CTA, link aktif, border aksen) |
| `--color-primary-dark` | `#a00012` | State hover tombol primary |
| `--color-primary-container` | `#c00015` | Container warna brand |
| `--color-primary-fixed` | `#ffdad6` | Badge aksen terang, highlight latar lembut |
| `--color-primary-fixed-dim` | `#ffb4ac` | State varian primary muda |
| `--color-on-primary` | `#ffffff` | Teks di atas warna primary |
| `--color-background` / `surface` | `#fbf9f9` | Latar belakang halaman utama (warm off-white) |
| `--color-on-surface` | `#1b1c1c` | Teks utama / headline (hitam pekat yang nyaman di mata) |
| `--color-on-surface-variant` | `#5d3f3c` | Teks sekunder, label, deskripsi ringkas |
| `--color-secondary` | `#5f5e5e` | Teks paragraf, caption netral |
| `--color-outline` | `#926e6b` | Garis batas elemen fokus / divider gelap |
| `--color-outline-variant` | `#e7bdb8` | Garis tepi card, pembatas nav bar, border lembut |
| `--color-surface-container-lowest` | `#ffffff` | Latar card bersih murni, dropdown |
| `--color-surface-container-low` | `#f5f3f3` | Card latar ringan |
| `--color-surface-container` | `#efeded` | Kontainer widget, sidebar widget |
| `--color-surface-container-high` | `#e9e8e7` | Chip tombol pill, badge abu-abu |
| `--color-surface-container-highest`| `#e3e2e2` | Hover state baris list |
| `--color-error` | `#ba1a1a` | Indikator error, status darurat/gagal |

### B. Konfigurasi `@theme` untuk Tailwind CSS (v4)
Salin blok berikut ke `globals.css` proyek Hallo Jurnal:

```css
@import "tailwindcss";

@custom-variant dark (&:where(.dark, .dark *));

@theme {
  /* Brand & Primary Colors */
  --color-primary: #c00015;
  --color-primary-dark: #a00012;
  --color-primary-container: #c00015;
  --color-primary-fixed: #ffdad6;
  --color-primary-fixed-dim: #ffb4ac;
  --color-on-primary: #ffffff;
  --color-on-primary-fixed: #410002;

  /* Surface & Backgrounds */
  --color-surface: #fbf9f9;
  --color-surface-bright: #fbf9f9;
  --color-surface-dim: #dbdad9;
  --color-surface-variant: #e3e2e2;
  --color-surface-container-lowest: #ffffff;
  --color-surface-container-low: #f5f3f3;
  --color-surface-container: #efeded;
  --color-surface-container-high: #e9e8e7;
  --color-surface-container-highest: #e3e2e2;

  /* Text & Typography Colors */
  --color-on-surface: #1b1c1c;
  --color-on-surface-variant: #5d3f3c;
  --color-secondary: #5f5e5e;
  --color-outline: #926e6b;
  --color-outline-variant: #e7bdb8;

  /* Spacing Grid */
  --spacing-container-max: 1280px;
  --spacing-margin-desktop: 40px;
  --spacing-margin-mobile: 16px;
  --spacing-gutter: 24px;
  --spacing-stack-sm: 8px;
  --spacing-stack-md: 16px;
  --spacing-stack-lg: 32px;

  /* Typography Font Families */
  --font-headline-xl: Literata, serif;
  --font-headline-lg: Literata, serif;
  --font-headline-md: Literata, serif;
  --font-body-lg: Inter, sans-serif;
  --font-body-md: Inter, sans-serif;
  --font-button: Inter, sans-serif;
  --font-label-caps: Inter, sans-serif;
}
```

---

## 3. Tipografi & Skala Hirarki

### A. Font Families
1. **Headlines / Judul:** `Literata` (Google Font, Serif)
   - Digunakan untuk: Judul berita utama, headline hero, judul section ("BERITA TERKINI", "ASPIRASI WARGA"), kutipan editorial.
2. **Body & Antarmuka UI:** `Inter` (Google Font, Sans-Serif)
   - Digunakan untuk: Teks bacaan/paragraf, navigasi, form input, tombol, badge status, info tanggal/penulis.

### B. Inisialisasi di Next.js (`app/layout.tsx`)
```tsx
import { Inter, Literata } from 'next/font/google';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const literata = Literata({
  subsets: ['latin'],
  variable: '--font-literata',
  display: 'swap',
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" className={`${inter.variable} ${literata.variable}`}>
      <body className="bg-surface text-on-surface min-h-screen flex flex-col font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
```

### C. Skala Hirarki Tipografi
- **Headline H1 / Hero:** `text-2xl sm:text-4xl md:text-5xl font-extrabold font-serif leading-tight tracking-tight`
- **Section Heading:** `text-base sm:text-lg font-bold uppercase tracking-wider text-on-surface` disertai garis aksen merah (`w-14 h-[2.5px] bg-primary mt-1`)
- **Card Title:** `text-base sm:text-lg font-bold leading-snug group-hover:text-primary transition-colors`
- **Meta Info / Kategori:** `text-xs font-bold uppercase tracking-wider text-primary`
- **Teks Paragraf / Excerpt:** `text-sm sm:text-base text-secondary leading-relaxed`
- **Caption / Timestamp:** `text-xs text-on-surface-variant/70`

---

## 4. Struktur Tata Letak (Layout Architecture)

### A. Dimensi Kontainer
- **Lebar Maksimal:** `max-w-[1280px]` (`max-w-container-max`) di tengah layar (`mx-auto`).
- **Padding:** Mobile `px-4` (`px-margin-mobile`), Desktop `px-6` (`px-gutter`).

### B. Grid 2-Kolom Desktop (Khas Portal Jurnal Vibes)
```text
+-------------------------------------------------------------------------+
|                              HEADER (Sticky)                            |
+-------------------------------------------------------------------------+
|  [Sidebar 25%]                  |  [Main Feed & Content 75%]            |
|  - Navigasi Cepat (For You dll) |  - Hero Carousel                      |
|  - Editor's Pick Widget         |  - Headline / Berita Terkini          |
|  - Widget Aspirasi Halo Jurnal  |  - Form Laporan / Card List           |
|                                 |  - Polling & Reels Section            |
+-------------------------------------------------------------------------+
|                              FOOTER LENGKAP                             |
+-------------------------------------------------------------------------+
| [Mobile Bottom Navigation (Khusus Tampilan Smartphone)]                 |
+-------------------------------------------------------------------------+
```

Implementasi Tailwind layout:
```tsx
<div className="flex-grow w-full max-w-container-max mx-auto px-4 md:px-6 pt-6 pb-24 md:pb-8 flex flex-col md:flex-row gap-6">
  {/* Left Sidebar (25% di desktop, disembunyikan di mobile) */}
  <aside className="hidden md:flex flex-col w-1/4 sticky top-28 self-start gap-6 h-[calc(100vh-7.25rem)] overflow-y-auto no-scrollbar">
    ...
  </aside>

  {/* Area Konten Utama (75% di desktop, 100% di mobile) */}
  <main className="w-full md:w-3/4 flex flex-col gap-8">
    ...
  </main>
</div>
```

---

## 5. Spesifikasi Komponen Kunci (Core Components)

### 1. Header & Navigation (`HeaderNav.tsx`)
- **Fitur:**
  - `sticky top-0 z-40 bg-surface/95 backdrop-blur-md border-b border-outline-variant/60`
  - Logo kiri (Brand visual image, responsive height: `h-10 sm:h-12 md:h-14`).
  - Menu navigasi tengah dengan indikator aktif: `text-primary font-bold border-b-2 border-primary`.
  - Dropdown eksplorasi menu dengan efek hover halus.
  - Sisi kanan: Widget cuaca ringkas / status, tombol pencarian modal (`SearchOverlay`), dan menu hamburger untuk mobile.
  - Sub-kategori chip horizontal di bawah header mobile (overflow-x scrolling).

### 2. Card Berita & Aduan (`NewsCard.tsx`)
Mendukung 2 mode varian:
- **Varian Row (List Vertikal):**
  - Cocok untuk feed berita, timeline laporan aduan masuk, atau artikel panjang.
  - Gambar 16:9 di sisi kiri (`w-full sm:w-52 aspect-video rounded-xl overflow-hidden`), teks judul dan kategori di kanan.
  - Pemisah border atas tipis `border-t border-outline-variant/60 pt-4`.
- **Varian Grid (Kotak 3-Kolom):**
  - Cocok untuk katalog arsip berita atau grid galeri kasus/laporan terselesaikan.
  - `bg-surface rounded-2xl border border-outline-variant/60 hover:border-primary/40 hover:shadow-lg transition-all duration-300 overflow-hidden`.
  - Efek hover zoom gambar: `group-hover:scale-105 transition-transform duration-500`.

### 3. Banner CTA Hallo Jurnal (`HalloJurnalBanner.tsx`)
- **Tujuan:** Menjadi jembatan visual pengaduan & komunikasi warga.
- **Karakteristik Visual:**
  - Card melengkung besar (`rounded-3xl bg-surface border border-outline-variant/70 shadow-xs`).
  - Aksen ambient glow di latar belakang (`bg-primary/5 blur-3xl`).
  - Visual 3D Presenter / Maskot di sebelah kiri (`hover:scale-105 transition-transform`).
  - Judul persuasif dengan kata kunci merah: `Salurkan Laporan & Aspirasimu di Hallo Jurnal`.
  - Tombol CTA kapsul merah mencolok: `bg-primary hover:bg-primary-dark text-white font-extrabold text-sm px-7 py-3 rounded-full shadow-md hover:shadow-lg active:scale-95`.

### 4. Interactive Polling Widget (`PollingWidget.tsx`)
- Latar `bg-surface-container rounded-2xl p-6 border border-outline-variant/40`.
- Opsi polling interaktif dengan bar persentase suara animasi `bg-primary/20` atau `bg-primary` saat dipilih.

### 5. Floating Chatbot / AI Assistant (`ChatbotButton.tsx`)
- Tombol lingkaran melayang di sudut kanan bawah (`fixed bottom-20 md:bottom-8 right-5 z-40`).
- Warna merah solid dengan ikon percakapan / spark AI.
- Membuka modal chat dengan quick action prompts (chip tombol kapsul).

### 6. Mobile Bottom Navigation (`BottomNav.tsx`)
- Terpasang permanen di layar smartphone (`md:hidden fixed bottom-0 left-0 right-0 z-30 bg-surface/95 backdrop-blur-md border-t border-outline-variant/50`).
- Menu: Beranda (`Home`), Pencarian (`Search`), Tersimpan (`Bookmark`), dan Lapor / Menu.

### 7. Footer Portal (`Footer.tsx`)
- Tonal gelap / netral berwibawa: `bg-surface border-t border-outline-variant/70`.
- Memuat profil singkat, tautan legal standar dewan pers (Pedoman Media Siber, Kebijakan Privasi, Hubungi Kami, Tentang Kami), serta tautan sosial media dan copyright.

---

## 6. Micro-Interactions & Efek Animasi

Tambahkan aturan CSS kustom berikut di `globals.css` untuk transisi yang memukau:

```css
/* Card Hover Elevation dengan Tint Warna Merah */
.card-hover {
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

.card-hover:hover {
  transform: translateY(-3px);
  box-shadow: 0 12px 28px -6px rgba(192, 0, 21, 0.16);
}

/* Sembunyikan scrollbar untuk kategori horizontal / reels */
.no-scrollbar::-webkit-scrollbar {
  display: none;
}
.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

/* Animasi Buka Tutup Drawer & Modal */
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideInRight {
  from { transform: translateX(100%); }
  to { transform: translateX(0); }
}
```

---

## 7. Rekomendasi Adaptasi Khusus untuk "Hallo Jurnal"

Ketika menerapkan sistem desain ini ke website **Hallo Jurnal** (portal pengaduan & aspirasi masyarakat), sesuaikan komponen berikut:

1. **Badge Status Pengaduan (Citizen Report Status Badges):**
   - **Menunggu Verifikasi:** `bg-amber-100 text-amber-800 border-amber-300`
   - **Sedang Diproses:** `bg-blue-100 text-blue-800 border-blue-300`
   - **Selesai / Ditindaklanjuti:** `bg-emerald-100 text-emerald-800 border-emerald-300`
   - **Ditolak / Tidak Valid:** `bg-zinc-100 text-zinc-600 border-zinc-300`

2. **Formulir Pengaduan (Citizen Form Input):**
   - Gunakan border styling seragam: `border border-outline-variant focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-xl bg-surface-container-lowest text-on-surface`.

3. **Tombol Aksi Utama (Action Button):**
   - Tombol pengiriman laporan menggunakan class:  
     `bg-primary hover:bg-primary-dark text-white font-bold px-6 py-3 rounded-full shadow-sm hover:shadow-md transition-all active:scale-95`

4. **Navigasi Tab Kategori Pengaduan:**
   - Gunakan gaya Chip filter pill (`FilterChips.tsx`): Kapsul horizontal scrollable yang aktif dengan `bg-primary text-white`, dan tidak aktif dengan `bg-surface-container-high text-on-surface hover:bg-surface-variant`.