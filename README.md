# Enciende

Tu espacio digital para conectar con la familia de la fe y crecer en tu caminata diaria con Dios.

PWA comunitaria con lectura bíblica interactiva (subrayado, notas y diccionario vía [Bolls.life](https://bolls.life)), planes de lectura con racha, devocionales, estudios, cronograma de actividades, transmisión en vivo por YouTube y librería institucional.

## Stack

React + Vite + TypeScript · CSS Modules · Firebase (Auth + Firestore + Hosting) · Bolls.life API

## Primeros pasos

```bash
npm install
cp .env.example .env.local
```

Completa `.env.local` con la configuración web de tu proyecto Firebase (`enciendewebapp`): consola → Configuración del proyecto → Tus apps → app web. Si aún no existe una app web registrada, créala ahí primero.

```bash
npm run dev      # http://localhost:5173
npm run build    # build de producción en dist/
```

## Firebase

```bash
npm install -g firebase-tools   # si no lo tienes
firebase login
firebase deploy --only firestore:rules,firestore:indexes
firebase deploy --only hosting
```

### Primer administrador

El primer usuario admin se promueve manualmente: registra tu cuenta desde `/register`, luego en la consola de Firestore edita el documento `users/{tu-uid}` y cambia `role` de `member` a `admin`. Desde ahí ya puedes gestionar contenido en `/admin`.

### Configurar la transmisión en vivo y redes sociales

Desde `/admin` → pestaña "En vivo" se configura el día/hora programado del culto (por defecto domingos 19:00, 2 horas de duración) y los links de redes sociales/contacto.

## Íconos PWA (instalar en el celular)

`public/icons/` tiene los íconos cuadrados (`icon-192.png`, `icon-512.png`, y las versiones `icon-maskable-*.png` con margen para el recorte circular/squircle de Android) generados desde `src/assets/logo/enciende-logo.png`. En Android, al entrar a la web con Chrome aparece la opción "Agregar a la pantalla de inicio" / "Instalar app" y queda como un ícono más, gracias al manifest (`vite-plugin-pwa`) y al service worker. En iPhone no hay instalación real de PWA vía Safari con el mismo nivel de integración, pero al menos el ícono de "Agregar a inicio" usa `apple-touch-icon.png`.

Para regenerar los íconos si cambia el logo: `npm install sharp` (no queda como dependencia permanente) y `node scripts/generate-icons.cjs`.

## Racha (fuego)

`StreakFlame` (`src/components/streak/StreakFlame.tsx`) dibuja la llama como SVG escalado según la racha, como placeholder. Cuando tengas las 5 ilustraciones definitivas, reemplaza el SVG por `<img>` apuntando a `src/assets/streak/fuego-{1..5}.png` según el tramo (`TIERS` en ese mismo archivo).

## Caché offline de la Biblia

`src/services/bibleCache.ts` descarga el volcado completo de una traducción (`NVI` o `RV1960`) a IndexedDB para lectura sin conexión, siguiendo la recomendación de Bolls.life de no repetir requests por capítulo. El lector ofrece el botón de descarga la primera vez que se abre una traducción no cacheada.

## Estructura

Ver detalle de arquitectura, esquema de Firestore y flujo del lector bíblico en el plan original del proyecto (arquitectura de `src/services`, `src/components`, `src/pages`).
