# Publicar KidVision en GitHub Pages

La app se publica sola con HTTPS cada vez que subes cambios a `main`
(archivo `.github/workflows/pages.yml`: corre las pruebas, compila y publica).

Dirección final: **https://castro-pinto-camila.github.io/kidvision/**

> **El repositorio tiene que ser público.** GitHub Pages en cuenta gratuita
> solo funciona con repositorios públicos. No hay datos de niños en el
> código (se guardan en cada celular), pero revisa que no haya nada que no
> quieras mostrar.

## En GitHub Desktop (subir los cambios)
1. Abre GitHub Desktop con el repositorio **kidvision**.
2. Arriba a la izquierda, «Current Branch» debe decir **main**.
3. Verás los commits nuevos pendientes («N commits to push»). No hay cambios sin commitear.
4. Pulsa el botón azul **Push origin** (arriba a la derecha).
5. Espera a que diga «Last fetched just now» y que el botón cambie a «Fetch origin».

## En GitHub (hacer el repositorio público y activar Pages)
1. Entra a https://github.com/castro-pinto-camila/kidvision con tu cuenta.
2. **Hacerlo público:** pestaña **Settings** → baja hasta el final, sección **Danger Zone** → **Change repository visibility** → **Change to public** → confirma escribiendo el nombre del repositorio.
   (Si ya aparece «Public» al lado del nombre arriba, salta este paso.)
3. **Activar Pages:** en Settings, menú de la izquierda → **Pages**. En **Build and deployment**, en «Source» elige **GitHub Actions**. No hay que guardar nada más.
4. **Ver la publicación:** pestaña **Actions**. Aparece «Publicar en GitHub Pages» con un círculo amarillo (en curso). Espera 1–3 minutos hasta que se ponga con ✓ verde.
   - Si no arrancó, entra a «Publicar en GitHub Pages» → botón **Run workflow** → **Run workflow**.
   - Si sale una ✗ roja, entra al intento, abre el paso que falló y mándame una captura.
5. Abre https://castro-pinto-camila.github.io/kidvision/ . También la ves en Settings → Pages («Your site is live at…»).

## En tu celular
1. Abre ese enlace una vez con internet y espera a que cargue del todo.
2. Instala la app (menú ⋮ → «Instalar app»).
3. Sigue `docs/lista-prueba-celular.md`.

## Cuando cambies algo
Haz commit y **Push origin**: en 1–3 minutos la versión nueva queda publicada. El celular la recoge la próxima vez que abras la app con internet (puede pedir cerrarla y abrirla una segunda vez).
