# Sistema de Seguimiento de Vehículos (Ionic/Angular)

Aplicación móvil/web construida con Ionic y Angular para gestionar vehículos, usuarios y recorridos, realizando seguimiento GPS en tiempo real y visualización de rutas y posiciones sobre mapas basados en Leaflet y OpenStreetMap. 

---

## Características principales

- Autenticación de usuarios con manejo de tokens y roles, incluyendo un rol de **visitante** con funcionalidades limitadas. 
- Gestión y selección de vehículos asociados a un perfil. 
- Administración y visualización de rutas obtenidas desde una API externa. 
- Inicio, seguimiento y finalización de recorridos con registro periódico de posiciones GPS del vehículo. 
- Mapas interactivos con Leaflet:
  - Mapa de seguimiento individual de un vehículo en tiempo real. 
  - Mapa de vehículos activos mostrando su última posición y trayectoria reciente. 
- Manejo de errores y experiencia de usuario mediante toasts, alerts y redirecciones controladas. 

---

## Tecnologías utilizadas

- **Ionic Framework** con componentes standalone de `@ionic/angular/standalone`. 
- **Angular** (componentes, servicios, routing y guards). 
- **Leaflet 1.9.x** para mapas interactivos (carga dinámica vía CDN). 
- **OpenStreetMap** como proveedor de tiles de mapa. 
- **navigator.geolocation** para obtener y monitorear la ubicación GPS del dispositivo. 
- **API REST externa** para:
  - Autenticación y usuarios. 
  - Vehículos, rutas y recorridos, identificados por un `perfil_id` (`environment.tokenSecret`). 

---

## Estructura general de la aplicación

### Componente raíz y navegación

- **`app.component.ts`**  
  Componente raíz (`AppComponent`) que define la estructura general de la aplicación (menú lateral, router outlet) y controla la visibilidad del menú según el rol del usuario autenticado.  
  Se suscribe al observable de usuario en `AuthService` para determinar si es visitante (`esVisitante`) y habilitar o deshabilitar opciones de menú. 

- **Routing y Tabs**
  - `app.routes.ts`: define las rutas principales de la app (login, registro, tabs, etc.). 
  - `tabs.routes.ts`: configura las rutas internas de las pestañas (`tab1`, `tab2`, `tab3`) y otras páginas asociadas. 
  - `tabs.page.ts`: componente contenedor de las tabs de Ionic. 
  - `app.component.html`: plantilla base con `<ion-app>`, `<ion-menu>`, `<ion-router-outlet>` y estructura del menú lateral. 

- **Guards**
  - `auth-guard.ts`: protege rutas que requieren usuario autenticado. 
  - `visitante-guard.ts`: controla acceso según rol visitante/no visitante, restringiendo ciertas funcionalidades. 
  - `interceptor-guard.ts`: actúa como interceptor para añadir tokens a peticiones HTTP y manejar respuestas no autorizadas. 

---

## Páginas principales

### Autenticación y registro

- **`login.page.ts`**  
  Página de inicio de sesión.  
  - Invoca `AuthService` para autenticar al usuario.  
  - Maneja errores de credenciales y muestra mensajes con `ToastController`.  
  - Redirige a las tabs principales tras login exitoso. 

- **`registro.page.ts`**  
  Página de registro de nuevos usuarios.  
  - Envía datos a la API mediante `AuthService` o servicio correspondiente.  
  - Muestra validaciones y estados de carga. 

### Gestión de vehículos y recorridos (Tabs)

- **`tab1.page.ts`** – Selección y gestión de vehículos  
  - Lista los vehículos disponibles usando `VehiculosService`.  
  - Permite seleccionar un vehículo y lo guarda en `VehiculoSeleccionadoService` para el resto de la app.  
  - Puede incluir creación/edición básica según la API. 

- **`tab2.page.ts`** – Seguimiento GPS y recorrido activo  
  Página clave para el **seguimiento en tiempo real de un vehículo**. 
  Funcionalidades principales:
  - Obtiene el vehículo seleccionado desde `VehiculoSeleccionadoService`. 
  - Carga rutas disponibles desde `RutasService` usando `perfil_id` (`environment.tokenSecret`). 
  - Carga Leaflet dinámicamente (CSS + JS) y crea un mapa centrado inicialmente en coordenadas por defecto (ej. Buenaventura). 
  - Obtiene la ubicación actual usando `navigator.geolocation.getCurrentPosition`, actualiza el marcador en el mapa y guarda posición inicial. 
  - Inicia un recorrido llamando a `RecorridosService.iniciarRecorrido`, obteniendo un `recorridoActualId`. 
  - Activa `navigator.geolocation.watchPosition` para registrar posiciones periódicas, filtrando por:
    - Precisión (p.ej. ignora posiciones con baja precisión).  
    - Distancia mínima recorrida (ej. > 5 metros). 
  - Envía cada posición válida a la API mediante `RecorridosService.registrarPosicion`, almacenando también un pequeño historial local. 
  - Dibuja la trayectoria en el mapa (polyline) y muestra la ruta seleccionada (shape GeoJSON parseado de `ruta.shape`). 
  - Finaliza el recorrido con `RecorridosService.finalizarRecorrido`, deteniendo `watchPosition` e intervalos y limpiando marcadores iniciales. 
  - Usa `ToastController` para informar estados (inicio correcto, errores de GPS/API, etc.). 

- **`tab3.page.ts`**  
  Pestaña adicional para funcionalidades complementarias (por ejemplo, listado de recorridos, configuraciones o estadísticas), según la implementación concreta. 

### Rutas y mapa de vehículos

- **`rutas.page.ts`**  
  Página para **administrar y visualizar rutas**:  
  - Consume `RutasService` para listar rutas del perfil actual.  
  - Muestra información de cada ruta, incluyendo su forma (shape) y nombre.  
  - Puede interactuar con el mapa para mostrar rutas específicas o realizar filtros. 

- **`mapa-vehiculos.ts`** – Mapa de vehículos activos  
  Página que muestra un **mapa global con vehículos que tienen recorridos activos**. 
  Funcionalidad:
  - Carga Leaflet y crea un mapa inicial similar a `tab2`. 
  - Usa `VehiculosService` para obtener todos los vehículos. 
  - Usa `RecorridosService.obtenerRecorridosPorPerfil(perfilId)` para recuperar recorridos del perfil, filtrando aquellos con inicio (`ts_inicio`) pero sin fin (`ts_fin`). 
  - Para cada recorrido activo:
    - Obtiene posiciones con `RecorridosService.obtenerPosiciones(recorrido.id, perfilId)`. 
    - Normaliza las coordenadas con `normalizarPosicion`, soportando múltiples estructuras (`geom` GeoJSON, `coordinates`, `geometry`, `lat/lon`, etc.). 
    - Filtra posiciones inválidas (valores nulos, `NaN`, cero, etc.). 
    - Determina la última posición válida del vehículo y la usa para crear un marcador en el mapa. 
    - Dibuja la trayectoria reciente mediante polyline cuando hay suficientes puntos. 
  - Inicia un intervalo de actualización periódica para refrescar la información de vehículos y recorridos activos. 
  - Aplica restricciones adicionales si el usuario es visitante (`esVisitante`). 

---

## Servicios

### Autenticación y perfil

- **`auth.service.ts` (AuthService)**  
  Gestión centralizada de autenticación:  
  - Login/logout y almacenamiento de tokens.  
  - Exposición de un observable de usuario y métodos para verificar si está autenticado.  
  - Obtención del rol del usuario (`getRole`) y comprobación de rol visitante (`isVisitante`).  
  - Integración con guards e interceptores para proteger rutas y peticiones HTTP. 

### Vehículos y selección

- **`vehiculos.ts` (VehiculosService)**  
  - Interactúa con la API de vehículos para listar y, potencialmente, crear/actualizar registros.  
  - Es usado por `tab1.page.ts` y `mapa-vehiculos.ts` para mostrar vehículos al usuario. 

- **`vehiculo-seleccionado.ts` (VehiculoSeleccionadoService)**  
  - Mantiene el vehículo actualmente seleccionado en memoria y como observable.  
  - Permite que páginas como `Tab1Page`, `Tab2Page` y otras accedan al vehículo activo sin tener que recargarlo de la API cada vez. 

- **`vehiculo.model.ts`**  
  - Define la estructura de datos de un vehículo (por ejemplo, `id`, `placa`, `marca`, `modelo`, etc.).  
  - Se utiliza en servicios y componentes que trabajan con vehículos. 

### Rutas y calles

- **`rutas.ts` (RutasService)**  
  - Obtiene desde la API las rutas disponibles para el perfil (`perfil_id`).  
  - Devuelve objetos que incluyen un campo `shape`, que puede venir como string JSON y se parsea a GeoJSON para dibujar en Leaflet. 
  - Es usado principalmente por `Tab2Page` y `rutas.page.ts`. 

- **`calles.ts`**  
  - Servicio para manejar datos de calles o capas adicionales (por ejemplo, geometrías de vías) que pueden emplearse para enriquecer mapas o búsquedas.  
  - Su uso concreto depende de la lógica de la aplicación y del backend. 
### Recorridos y posiciones

- **`recorridos.ts` (RecorridosService)**  
  Servicio crítico para la lógica de seguimiento: 
  - `iniciarRecorrido`: crea un nuevo recorrido asociado a una ruta, vehículo y perfil, devolviendo un ID de recorrido. 
  - `registrarPosicion`: registra posiciones GPS (lat, lon, perfil) asociadas a un recorrido existente. 
  - `finalizarRecorrido`: marca un recorrido como finalizado. 
  - `obtenerRecorridosPorPerfil`: lista recorridos para un perfil, permitiendo encontrar los que están activos (con inicio pero sin fin). 
  - `obtenerPosiciones`: devuelve las posiciones registradas de un recorrido determinado. 
  - Es utilizado tanto por `Tab2Page` (seguimiento en tiempo real) como por `MapaVehiculosPage` (visualización de recorridos activos). 

### Carga de datos

- **`loaddata.ts` (LoadDataService)**  
  - Servicio de utilidad para cargar datos iniciales o ejecutar procesos de sincronización/carga masiva desde la API según la configuración del proyecto. 

---

## Flujo típico de uso

1. **Login**  
   El usuario accede a `login.page.ts`, ingresa sus credenciales y, si son válidas, `AuthService` guarda el token y rol, redirigiendo a la vista de tabs. 

2. **Selección de vehículo**  
   En `tab1.page.ts`, el usuario selecciona un vehículo de la lista proporcionada por `VehiculosService`.  
   El vehículo seleccionado se almacena en `VehiculoSeleccionadoService`. 

3. **Selección de ruta y seguimiento**  
   En `tab2.page.ts`, el usuario:
   - Visualiza rutas disponibles (cargadas por `RutasService`).  
   - Selecciona una ruta y, tras obtener la ubicación actual, inicia un recorrido. 
   - El sistema registra y envía posiciones GPS periódicamente a través de `RecorridosService`. 

4. **Visualización global de vehículos activos**  
   En `mapa-vehiculos.ts`, el usuario ve todos los vehículos con recorridos activos, sus últimas posiciones y trayectorias, consultados mediante `VehiculosService` y `RecorridosService`. 
5. **Finalización de recorrido y cierre de sesión**  
   El usuario finaliza el recorrido desde `Tab2Page` y luego puede cerrar sesión; `AuthService.logout()` limpia la sesión y redirige al login. 

---

## Requisitos y ejecución (adaptar a tu proyecto real)

- Node.js y npm instalados.
- Ionic CLI instalado globalmente.
- Archivo `environment` configurado con las URLs de la API y `tokenSecret` para el perfil. 


---

````markdown
# 📱 Proyecto Ionic + Angular

## 👥 Integrantes
- Jefer Cuero  
- Potosi Reyes  
- Jennifer Mondragón  
- Jhon Estupiñan  

---




