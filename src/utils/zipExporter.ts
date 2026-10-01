import JSZip from 'jszip';

export async function generateAndDownloadProjectZip(): Promise<void> {
  const zip = new JSZip();

  // Root project files
  zip.file('package.json', JSON.stringify({
    name: "nfc-asistencia-control-presencia",
    private: true,
    version: "1.0.0",
    type: "module",
    scripts: {
      "dev": "vite --port=3000 --host=0.0.0.0",
      "build": "vite build",
      "preview": "vite preview"
    },
    dependencies: {
      "@tailwindcss/vite": "^4.3.3",
      "@vitejs/plugin-react": "^6.1.1",
      "canvas-confetti": "^1.9.4",
      "jszip": "^3.10.1",
      "lucide-react": "^0.546.0",
      "motion": "^12.23.24",
      "react": "^19.0.1",
      "react-dom": "^19.0.1",
      "tailwindcss": "^4.3.3",
      "vite": "^8.3.0"
    },
    devDependencies: {
      "@types/canvas-confetti": "^1.9.0",
      "@types/jszip": "^3.4.1",
      "@types/node": "^22.14.0",
      "@types/react": "^19.3.0",
      "@types/react-dom": "^19.3.0",
      "typescript": "^5.7.0"
    }
  }, null, 2));

  zip.file('tsconfig.json', JSON.stringify({
    compilerOptions: {
      target: "ES2022",
      experimentalDecorators: true,
      useDefineForClassFields: false,
      module: "ESNext",
      types: ["vite/client"],
      lib: ["ES2022", "DOM", "DOM.Iterable"],
      skipLibCheck: true,
      moduleResolution: "bundler",
      isolatedModules: true,
      moduleDetection: "force",
      allowJs: true,
      jsx: "react-jsx",
      paths: { "@/*": ["./*"] }
    }
  }, null, 2));

  zip.file('vite.config.ts', `import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    },
  },
  server: {
    port: 3000,
    host: '0.0.0.0'
  }
});
`);

  zip.file('index.html', `<!doctype html>
<html lang="es">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>NFC Asistencia - Control de Presencia</title>
    <meta name="description" content="Sistema moderno de control de asistencia mediante tarjetas y pegatinas NFC con modo quiosco, gestión de personas, horarios y estadísticas." />
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet">
  </head>
  <body class="bg-slate-50 text-slate-900 antialiased selection:bg-indigo-500 selection:text-white">
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
`);

  zip.file('.gitignore', `node_modules
dist
dist-ssr
*.local
.env
.DS_Store
`);

  zip.file('LEEME_DESPLIEGUE.md', `# Guía de Despliegue en tu Dominio Propio

¡Felicidades! Aquí tienes el código completo de la aplicación **Control de Asistencia NFC**.

---

## Opción 1: Subir directamente a tu Hosting / Dominio (cPanel, Apache, Nginx, Hostinger, Plesk)

1. En tu ordenador con Node.js instalado, descomprime este ZIP y abre la terminal en esa carpeta.
2. Instala las dependencias y genera la carpeta de producción:
   \`\`\`bash
   npm install
   npm run build
   \`\`\`
3. Se generará una carpeta llamada **/dist** con los archivos HTML, CSS y JavaScript minificados.
4. Sube el contenido de esa carpeta **/dist** al directorio **public_html** (o raíz de tu dominio) mediante FTP o el Administrador de Archivos de tu hosting.
5. **MUY IMPORTANTE (HTTPS):** La tecnología Web NFC del navegador requiere obligatoriamente que tu dominio tenga **certificado SSL/HTTPS activo** (ej: https://tudominio.com). Los lectores USB por cuña de teclado funcionan en cualquier entorno.

---

## Opción 2: Despliegue en 2 minutos en Vercel o Netlify (Gratis con tu dominio)

1. Sube este proyecto a tu repositorio de GitHub o arrastra la carpeta en [vercel.com](https://vercel.com) o [netlify.com](https://netlify.com).
2. Configuración de Build automática:
   - **Build Command:** \`npm run build\`
   - **Output Directory:** \`dist\`
3. Asigna tu dominio propio desde el panel de Vercel/Netlify ("Domains -> Add Custom Domain"). ¡Generará el certificado SSL gratis automáticamente!

---

## Opción 3: Ejecutar en Local o en una Tableta / Servidor local

\`\`\`bash
npm install
npm run dev
\`\`\`
Accede desde la tableta a \`http://IP-DE-TU-ORDENADOR:3000\`.
`);

  // We fetch our actual source files to guarantee 100% exact copy
  const filesToFetch = [
    'src/index.css',
    'src/main.tsx',
    'src/App.tsx',
    'src/types/index.ts',
    'src/services/nfcService.ts',
    'src/services/storageService.ts',
    'src/utils/dateUtils.ts',
    'src/components/Navbar.tsx',
    'src/components/StatCounters.tsx',
    'src/components/NFCScannerCard.tsx',
    'src/components/NFCSimulatorDrawer.tsx',
    'src/components/TodayAttendanceTable.tsx',
    'src/components/PersonsView.tsx',
    'src/components/PersonProfileModal.tsx',
    'src/components/HistoryView.tsx',
    'src/components/CalendarView.tsx',
    'src/components/SettingsView.tsx',
    'src/components/KioskModeView.tsx',
  ];

  for (const filePath of filesToFetch) {
    try {
      const response = await fetch(`/${filePath}`);
      if (response.ok) {
        const content = await response.text();
        zip.file(filePath, content);
      }
    } catch (e) {
      console.warn(`Could not load ${filePath} for zip:`, e);
    }
  }

  // Generate ZIP file and trigger download
  const blob = await zip.generateAsync({ type: 'blob' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `nfc-asistencia-proyecto-completo.zip`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
