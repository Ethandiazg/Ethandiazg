// Convierte un HTML en PDF (tamaño de página según su CSS @page) o en imagen.
// Uso: node render.cjs pdf <entrada.html> <salida.pdf>
//      node render.cjs jpg|png <entrada.html> <salida> <ancho_px> <alto_px>
const { chromium } = require('playwright');

(async () => {
  const [modo, entrada, salida, ancho, alto] = process.argv.slice(2);
  const browser = await chromium.launch();
  try {
    const viewport = modo === 'pdf' ? undefined : { width: Number(ancho), height: Number(alto) };
    const page = await browser.newPage(viewport ? { viewport, deviceScaleFactor: 1 } : {});
    await page.goto('file://' + entrada, { waitUntil: 'networkidle' });
    await page.evaluate(() => document.fonts.ready);
    if (modo === 'pdf') {
      await page.pdf({ path: salida, preferCSSPageSize: true, printBackground: true });
    } else {
      await page.screenshot({
        path: salida,
        type: modo === 'jpg' ? 'jpeg' : 'png',
        ...(modo === 'jpg' ? { quality: 92 } : {}),
      });
    }
  } finally {
    await browser.close();
  }
})().catch((err) => {
  console.error(err);
  process.exit(1);
});
