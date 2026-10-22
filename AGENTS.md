# Enciende – guía para agentes (Codex, Claude, etc.)

PWA comunitaria en **React 18 + Vite + TypeScript + CSS Modules + Firebase** (Auth, Firestore, Storage, Hosting). Proyecto Firebase: `enciendewebapp`. Sin backend propio ni Cloud Functions. El dueño escribe en español (Argentina, voseo): textos de UI y respuestas en español.

## Reglas de oro

- **No hay emulador: incluso `npm run dev` (localhost) usa Firestore, Auth y Storage de producción.** No crear cuentas ni datos de prueba sin preguntar. Un agente no tiene login de admin: los flujos autenticados no se pueden probar solos; decirlo explícitamente.
- **Reglas de seguridad** (`firestore.rules`, `storage.rules`) cambian producción al instante. Validar con `npx firebase-tools deploy --only firestore:rules --dry-run` (o `--only storage`) y **pedir confirmación antes del deploy real**.
- **Confirmar antes de desplegar a producción** y antes de cambios destructivos (borrar datos, tocar roles/IAM). Cambios grandes: rama + canal preview primero; arreglos chicos: directo a `main` si el dueño lo pide.
- Respetar el estilo del código vecino (comentarios escasos, nombres en inglés en código, textos en español). No reformatear archivos enteros (no hay Prettier configurado; los archivos usan CRLF en Windows, no cambiar los finales de línea).
- Imports con alias `@/` → `src/`.

## Comandos

```bash
npm run dev        # http://localhost:5173 (usa datos REALES)
npm run build      # tsc + vite build (correrlo siempre antes de dar algo por terminado)
npm run publicar   # build + deploy de hosting
```

Deploy manual: `npm run build` → `npx firebase-tools deploy --only hosting` → `git push origin main`.
Preview temporal: `npx firebase-tools hosting:channel:deploy <nombre> --expires 7d` (comparte los datos de producción).
Reglas: `npx firebase-tools deploy --only firestore:rules` / `--only storage`.

## Mapa del proyecto

```
src/
  router.tsx                 Todas las rutas (react-router). Rutas protegidas: ProtectedRoute / AdminRoute (roles)
  context/AuthContext.tsx    Usuario + perfil (role: member | admin | bibliotecario)
  context/BibleContext.tsx   Estado de lectura bíblica
  firebase/config.ts         Init de Firebase (variables VITE_FIREBASE_* en .env.local)
  services/*.service.ts      TODO el acceso a Firestore/Storage vive acá (un archivo por dominio)
  types/*.ts                 Tipos y helpers de dominio (p. ej. isMembershipActive en types/library.ts)
  pages/                     Una carpeta por sección: Home, bible, plans, devotionals, studies, schedule,
                             library (librería/tienda), communityLibrary (biblioteca de préstamos),
                             signups (inscripciones a eventos), profile, auth, admin
  pages/admin/               Panel de administración (AdminDashboard + paneles por módulo)
  components/ui/             Button, Modal, Spinner, ListCard, SafeImage (img con fallback), etc.
  components/admin/          AdminCrudPage (CRUD genérico por config de campos), BarcodeScanner, CopyQrModal
  components/layout/         AppShell, TopNav, BottomNav, banners
  components/events/         HomeEventBanner (banner chico + popup diario de eventos)
  hooks/ utils/              Hooks y utilidades sueltas
public/banners/              Imágenes estáticas servibles como /banners/x.jpg
scripts/generate-icons.cjs   Generación de íconos PWA
```

## Módulos y dónde tocar

| Módulo | Páginas | Servicio | Notas |
|---|---|---|---|
| Biblia | `pages/bible`, `components/bible` | `services/bolls`, `bibleCache.ts`, `highlights.service.ts` | Texto desde Bolls.life. Default RVR60; NVI marcada como no disponible |
| Planes / racha | `pages/plans`, `components/streak` | `plans.service.ts`, `streak.service.ts` | |
| Devocionales / Estudios | `pages/devotionals`, `pages/studies` | `content.service.ts`, `studyHighlights.service.ts` | |
| Librería (tienda) | `pages/library`, `hooks/useCart.ts` | `products.service.ts` | Productos con `imageURL`, estado Preventa/En stock |
| Biblioteca comunitaria | `pages/communityLibrary`, `pages/admin/{LibraryAdminPanel,LoansManager,NewLoanForm,CopiesEditor,ReservationsManager,MemberMembershipManager,MembershipPlanEditor}` | `library.service.ts`, `users.service.ts` | Ver abajo |
| Inscripciones a eventos | `pages/signups`, `pages/admin/SignupEventsPanel`, `RegistrationsList`, `registrationsPdf.ts` | `signups.service.ts` | Borrar un evento borra sus inscripciones |
| En vivo / redes | `components/layout/LiveBanner`, `pages/admin/LiveSettingsEditor` | `live.service.ts` | Doc `settings/live` y `settings/social` |
| Instalar app (PWA) | `components/profile/InstallApp`, `utils/installPrompt.ts`, `utils/appUpdate.ts` | | |

### Biblioteca comunitaria (lo más reciente)

- Colecciones: `libraryTitles`, `libraryCopies` (ejemplares, con QR), `libraryLoans`, `libraryReservations`, `libraryFines`, `libraryMembershipPlans` (id fijo `DEFAULT_MEMBERSHIP_PLAN_ID`).
- **Membresía**: `users/{uid}.libraryMembership = { planId, status, renewalDate }`. `renewalDate: null` = **sin vencimiento** (el alta es manual, "Dar de alta"/"Dar de baja" en el panel; no vence sola). `isMembershipActive()` es la fuente de verdad.
- **Solicitar libro / ser miembro**: botones de WhatsApp (`wa.me`) usando `libraryMembershipPlans/*.whatsappNumber` (se carga en Admin → Biblioteca → Membresías → Configurar membresía). Sin número cargado, los botones no se muestran. Precio mostrado: $2.500 (`MembershipRequestButton.tsx`, `LibraryIntroModal.tsx`).
- El botón de reserva dentro de la app ("Pedir este libro") fue **quitado de la UI**; `requestReservation` y el manejo de reservas siguen en `library.service.ts` y en la pestaña Reservas por si se reactivan.
- Aviso de bienvenida diario (`LibraryIntroModal`, localStorage `enciende.libraryIntro`), oculto para miembros activos.
- Un ejemplar sin disponibilidad se muestra como "Prestado".

## Roles

`member` (default) · `admin` · `bibliotecario`. Se asignan **a mano** en la consola de Firestore: `users/{uid}.role`. Bibliotecario: gestiona la Biblioteca y ve el resto del admin en solo lectura. Las reglas de Firestore refuerzan esto (`isAdmin()`, `isBibliotecario()`, `isLibraryStaff()`).

## Imágenes y Firebase Storage

- En los formularios del admin, los campos `type: 'image'` (ver `AdminField` en `AdminCrudPage.tsx`) permiten pegar URL **o subir archivo**. La subida (`services/storage.service.ts`) achica a máx. 1600 px, convierte a JPEG y guarda en `uploads/<uuid>.jpg`.
- `storage.rules`: lectura pública; escritura solo admin/bibliotecario (se consulta el rol en Firestore), máx. 3 MB y solo imágenes. **Depende de un permiso IAM**: la cuenta `service-784397018751@gcp-sa-firebasestorage.iam.gserviceaccount.com` tiene el rol *Firebase Rules Firestore Service Agent*. No quitarlo.
- Para mostrar imágenes del usuario usar `SafeImage` (`components/ui/SafeImage.tsx`): si la URL está rota muestra un placeholder "Imagen no disponible".
- Las imágenes de `public/banners/` no se precachean en la PWA.

## Cuidados al editar

- Antes de cambiar la forma de un documento de Firestore, revisar `firestore.rules` y los tipos en `src/types`.
- `AdminCrudPage` es genérico: los módulos le pasan `fields`, `defaults` y un `service` con list/create/update/remove.
- Los `*.module.css` son locales por componente; los colores/espacios vienen de variables CSS (`--color-*`, `--space-*`, `--radius-*`) definidas en `src/styles`.
- Es una PWA con service worker (vite-plugin-pwa): tras un deploy, los usuarios pueden necesitar cerrar y reabrir la app para ver la versión nueva.
- Archivos de `enciende info/` son material de diseño/referencia del dueño, no parte de la app.
