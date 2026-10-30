# Sabores del Litoral — App móvil

INTEGRANTES: IGNACIO ALBRECHT, MAXIMO STEBLER, IGNACIO WASINGER, SEBASTIAN ZURSCHMITTER

Frontend en **React Native + Expo Router** que consume la API Spring Boot de este repositorio.

- Expo SDK 58, React Native 0.88, React 19.3 y TypeScript estricto.
- Expo Router como única navegación (carpeta `app/`).
- Sesión JWT guardada con `expo-secure-store`.
- Todos los importes, descuentos, envíos, totales y permisos los define el backend.

---

## 1. Requisitos

- Backend corriendo en `http://localhost:8080` (ver el README de la raíz).
- **Node.js 24** (`^22.13.0`, `^24.3.0`, `^26.0.0` o `>=27.0.0`). Node 20 no es compatible con Expo SDK 58.
  En este equipo: `C:\Users\Nacho\AppData\Local\Programs\nodejs-24`.
- Expo Go en el celular o un emulador Android / simulador iOS.

---

## 2. Arrancar la app

Desde esta carpeta:

```bat
dev.cmd
```

`dev.cmd` antepone Node 24 al `PATH` y ejecuta `expo start`. Acepta los parámetros de Expo:

```bat
dev.cmd --android
dev.cmd --web
dev.cmd --clear
```

Si Node 24 está en otra ruta:

```bat
set "SABORES_NODE=C:\ruta\a\node24"
dev.cmd
```

### Manual (sin `dev.cmd`)

```bat
npm install
set "PATH=C:\Users\Nacho\AppData\Local\Programs\nodejs-24;%PATH%"
npx.cmd expo start
```

En PowerShell usá `npm.cmd` y `npx.cmd`: los shims `.ps1` pueden estar bloqueados por la política de ejecución.

### Desde IntelliJ IDEA

1. *Settings → Languages & Frameworks → Node.js* → intérprete:
   `C:\Users\Nacho\AppData\Local\Programs\nodejs-24\node.exe`.
2. Configuración **npm**: `package.json` = `mobile/package.json`, comando `start`.
3. O simplemente abrí la terminal de IntelliJ, `cd mobile` y ejecutá `dev.cmd`.

---

## 3. URL del backend

La app lee `EXPO_PUBLIC_API_URL`. Si falta, usa `http://10.0.2.2:8080`.

| Dónde corre la app | Valor |
|---|---|
| Emulador Android | `http://10.0.2.2:8080` |
| Simulador iOS / web | `http://localhost:8080` |
| Celular físico con Expo Go | `http://IP_DE_TU_PC:8080` (misma red Wi-Fi) |

El archivo `.env` de esta carpeta ya trae el valor del emulador Android. `.env.example` documenta las opciones. Después de cambiarlo:

```bat
dev.cmd --clear
```

Expo reemplaza `process.env.EXPO_PUBLIC_*` al compilar; no se leen en tiempo de ejecución.

---

## 4. Estructura

```
mobile/
├── app/                        # Rutas de Expo Router
│   ├── _layout.tsx             # Providers (Auth, Carrito) y Stack raíz
│   ├── index.tsx               # Catálogo de locales
│   ├── local/[id].tsx          # Carta del local
│   ├── carrito.tsx             # Carrito
│   ├── confirmar.tsx           # Datos del cliente y creación del pedido
│   ├── resultado.tsx           # Código de seguimiento y totales
│   ├── seguimiento.tsx         # Consulta pública por código
│   ├── login.tsx               # Acceso del personal
│   └── panel/                  # Operación y administración
│       ├── _layout.tsx         # Exige sesión
│       ├── index.tsx
│       ├── pedidos.tsx
│       ├── pedido/[id].tsx
│       ├── en-calle.tsx
│       └── admin/              # Exige rol ADMIN
│           ├── usuarios.tsx / usuario-form.tsx
│           ├── locales.tsx / local-form.tsx
│           ├── productos.tsx / producto-form.tsx
│           └── ventas.tsx
└── src/
    ├── api/                    # Cliente HTTP y llamadas por dominio
    ├── components/             # Componentes reutilizables
    ├── config/env.ts           # URL y timeout
    ├── context/                # AuthContext y CarritoContext
    ├── hooks/                  # useCargar, useRecargarAlVolver
    ├── types/api.ts            # Espejo de los DTO del backend
    ├── utils/                  # Formatos, JWT y diálogos
    ├── navegacion.ts           # Opciones de header compartidas
    └── theme.ts                # Colores y espaciados
```

Los imports son relativos. Los componentes se exportan por defecto, salvo los helpers de `Estados.tsx` y `Fila.tsx`.

---

## 5. Comportamiento relevante

- **Sesión:** el JWT se guarda en `expo-secure-store`. Al iniciar se descarta si venció; un temporizador y el evento `AppState` cierran la sesión al expirar (8 horas en el backend). Un `401` autenticado también cierra la sesión.
- **Rutas protegidas:** `/panel/**` requiere sesión y `/panel/admin/**` requiere rol `ADMIN`. La autorización real sigue en Spring Security.
- **Carrito:** solo admite productos de un local. Antes de confirmar se sincroniza con la carta vigente para ajustar stock y precios. El subtotal es orientativo.
- **Totales:** se muestran tal como los devuelve el servidor (`subtotal`, `descuento`, `costoEnvio`, `total`).
- **Operación:** los estados avanzan con `POST /api/pedidos/{id}/avanzar`; el repartidor se envía al pasar a `EN_CAMINO`.
- **Formularios:** la UI valida lo básico; el backend vuelve a validar y sus mensajes (`ApiError.message` y `detalles`) se muestran al usuario.
- **Diálogos:** `src/utils/dialogos.ts` usa `Alert` en Android/iOS y `window.confirm` / `window.alert` en web, porque react-native-web no implementa `Alert`.

### Contratos usados

| Acción | Endpoint |
|---|---|
| Login | `POST /api/auth/login` |
| Locales / carta / categorías | `GET /api/locales`, `/api/locales/{id}/carta`, `/api/categorias` |
| Crear pedido | `POST /api/pedidos` |
| Seguimiento público | `GET /api/pedidos/seguimiento/{codigo}` |
| Pedidos del personal | `GET /api/pedidos`, `/api/pedidos/{id}`, `/api/pedidos/en-calle` |
| Avanzar / cancelar | `POST /api/pedidos/{id}/avanzar`, `/api/pedidos/{id}/cancelar` |
| Usuarios | `GET/POST/PUT /api/admin/usuarios` |
| Locales | `GET/POST/PUT /api/admin/locales` |
| Productos | `GET/POST/PUT /api/admin/productos` |
| Ventas | `GET /api/admin/ventas?desde=AAAA-MM-DD&hasta=AAAA-MM-DD` |

---

## 6. Verificación

```bat
set "PATH=C:\Users\Nacho\AppData\Local\Programs\nodejs-24;%PATH%"
npx.cmd tsc --noEmit
npx.cmd expo export --platform android --output-dir dist-check --clear
npx.cmd expo export --platform web --output-dir dist-check --clear
npx.cmd expo-doctor
```

`dist-check/` es solo una carpeta temporal de verificación; se puede borrar.

### Versión web

`dev.cmd --web` sirve para probar la UI en el navegador. Limitaciones esperadas:

- `expo-secure-store` no existe en web: la sesión queda en memoria y se pierde al refrescar.
- El almacenamiento de la sesión y los diálogos se resuelven con las alternativas web descritas arriba.

---

## 7. Problemas frecuentes

| Síntoma | Causa / solución |
|---|---|
| `TypeError` o error de versión al arrancar Expo | Se está usando Node 20. Ejecutá `dev.cmd` o anteponé Node 24 al `PATH`. |
| `No se pudo conectar con el servidor` | El backend no está corriendo o `EXPO_PUBLIC_API_URL` no corresponde al dispositivo. |
| El celular no conecta | Usá la IP de la PC (no `localhost`) y permití el puerto 8080 en el firewall. |
| `Database may be already in use` | Hay otra instancia del backend con la base H2 abierta. Detené la anterior. |
| Cambios en `.env` sin efecto | Reiniciá Expo con `dev.cmd --clear`. |
| El código de seguimiento no se encuentra | Son 8 caracteres alfanuméricos en mayúscula, sin espacios. |
