# Proyecto Panaderia - Frontend

Aplicacion React + Vite para las funcionalidades de autenticacion y panel de control de la panaderia.

## Requisitos

- Node.js 18+
- npm 9+

## Instalacion

```bash
npm install
```

## Variables de entorno

Crea un archivo `.env` en la raiz del proyecto o usa `.env.local` segun tu preferencia.

```bash
VITE_API_URL=http://127.0.0.1:8000/api/ping/
VITE_API_BASE=http://127.0.0.1:8000/api/
```

- `VITE_API_URL` se utiliza para el boton **Probar conexion**.
- `VITE_API_BASE` se emplea en todos los servicios nuevos (ej. registro). Si la variable no esta definida, el codigo utiliza por defecto `http://127.0.0.1:8000/api/`.

## Scripts disponibles

```bash
npm run dev     # Ambiente de desarrollo (http://localhost:5173)
npm run build   # Build de produccion
npm run preview # Vista previa del build
```

## Probar el registro (HU-01)

1. Inicia el servidor de desarrollo:
   ```bash
   npm run dev
   ```
2. Abre `http://localhost:5173` en el navegador.
3. Usa el menu superior para elegir **Registrar usuario**.
4. Completa nombre, correo y contrasena. La UI valida:
   - Nombre obligatorio (minimo 2 caracteres).
   - Email con formato valido.
   - Contrasena con 8 caracteres, al menos una letra, un numero y un caracter especial.
5. El boton **Registrarme** realiza `POST /api/v1/auth/register/`.
6. Si el backend responde `400`, los mensajes de error del servidor aparecen debajo del campo correspondiente o como alerta general (ej. "Ya existe una cuenta con ese email").
7. Si la peticion es exitosa se muestra **Registro exitoso** junto con un boton para ir a iniciar sesion.

## Probar la conexion con el backend

1. Selecciona **Probar conexion** en el menu.
2. Pulsa el boton para llamar a `VITE_API_URL` (por defecto `http://127.0.0.1:8000/api/ping/`).
3. El resultado de la peticion se muestra en el panel.

## Notas

- Los servicios HTTP viven en `src/services/api.js` y comparten el helper `fetchJson`.
- La feature de registro se organiza en `src/features/auth/` con API, validadores y `Register.jsx`.
- Los estilos principales para formularios estan en `src/App.css`.
