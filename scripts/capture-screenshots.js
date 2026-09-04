const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const BASE_URL = 'http://localhost:3000';
const OUTPUT_DIR = path.join(__dirname, '..', 'dokumentasi-screenshots');

if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

const targets = [
  { name: '01_landing_page.png', path: '/' },
  { name: '02_beranda_dashboard.png', path: '/beranda' },
  { name: '03_laporan_saya.png', path: '/laporan-saya' },
  { name: '04_feed_publik.png', path: '/feed-publik' },
  { name: '05_form_lapor_pengaduan.png', path: '/lapor', tabText: 'Pengaduan' },
  { name: '06_form_lapor_aspirasi.png', path: '/lapor', tabText: 'Aspirasi' },
  { name: '07_form_lapor_informasi.png', path: '/lapor', tabText: 'Permohonan Informasi' },
  { name: '08_form_lapor_inspirasi.png', path: '/lapor', tabText: 'Inspirasi Publik' },
  { name: '09_detail_laporan_warga.png', path: '/laporan/demo-1' },
  { name: '10_tentang_platform.png', path: '/tentang' },
  { name: '11_halaman_login.png', path: '/login' },
  { name: '12_halaman_daftar.png', path: '/daftar' },
  { name: '13_admin_dashboard.png', path: '/admin' },
  { name: '14_admin_chat_warga.png', path: '/admin/chat' },
  { name: '15_admin_feed_publik.png', path: '/admin/feed-publik' },
  { name: '16_admin_detail_laporan.png', path: '/admin/laporan/demo-1' },
  { name: '17_hubungi_kami.png', path: '/hubungi-kami' },
];

async function captureAll() {
  console.log('🚀 Memulai pengambilan screenshot...');
  
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 2,
  });

  const page = await context.newPage();

  for (const item of targets) {
    const fullUrl = `${BASE_URL}${item.path}`;
    console.log(`📸 Capturing [${item.name}] from ${fullUrl}...`);

    try {
      await page.goto(fullUrl, { waitUntil: 'networkidle', timeout: 30000 });
      await page.waitForTimeout(2000);

      // Tab selection for form lapor
      if (item.tabText) {
        try {
          const tabBtn = page.locator(`button:has-text("${item.tabText}")`).first();
          if (await tabBtn.isVisible()) {
            await tabBtn.click();
            await page.waitForTimeout(800);
          }
        } catch (e) {
          console.warn(`Warning selecting tab "${item.tabText}":`, e.message);
        }
      }

      // Inject clean-up CSS to eliminate blue highlights, focus outlines, and dev overlays
      await page.addStyleTag({
        content: `
          *, *:focus, *:focus-visible, *:focus-within, input:focus, textarea:focus, select:focus, button:focus, a:focus {
            outline: none !important;
            box-shadow: none !important;
          }
          nextjs-portal, [data-nextjs-toast], [class*="nextjs-portal"], #nextjs-dev-overlay, button[aria-label*="Next.js"], [data-next-badge] {
            display: none !important;
            visibility: hidden !important;
            opacity: 0 !important;
          }
        `
      });

      // Remove focus from active elements
      await page.evaluate(() => {
        if (document.activeElement && typeof document.activeElement.blur === 'function') {
          document.activeElement.blur();
        }
      });

      await page.waitForTimeout(500);

      const outputPath = path.join(OUTPUT_DIR, item.name);
      await page.screenshot({
        path: outputPath,
        fullPage: true,
      });

      console.log(`✅ Berhasil menyimpan screenshot: ${item.name}`);
    } catch (err) {
      console.error(`❌ Gagal merender screenshot [${item.name}]:`, err.message);
    }
  }

  await browser.close();
  console.log('🎉 Seluruh 17 screenshot berhasil dibuat!');
}

captureAll().catch((err) => {
  console.error('Fatal Error:', err);
  process.exit(1);
});
