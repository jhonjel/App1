
---

````markdown
# 📱 Proyecto Ionic + Angular

## 👥 Integrantes
- Jefer Cuero  
- Potosi Reyes  
- Jennifer Mondragón  
- Jhon Estupiñan  

Perfecto 👍
Aquí tienes la **versión en formato README.md**, lista para colocar directamente en tu repositorio GitHub (`App1/semana5`).
Incluye descripción, estructura, dependencias y explicación técnica de tus clases y servicios.

---

```markdown
# 🚀 App1 - Semana 5 (Ionic + Angular + Capacitor)

Este proyecto es una aplicación móvil desarrollada con **Ionic**, **Angular** y **Capacitor**, que se conecta a un **backend REST API** para gestionar rutas y vehículos.  
Está organizada por pestañas (Tabs) y utiliza servicios para realizar solicitudes HTTP a la API definida en `environment.ts`.

---

## 📁 Estructura principal del proyecto

```

src/
├── app/
│   ├── tab2/
│   │   └── tab2.page.ts
│   ├── tab3/
│   │   └── tab3.page.ts
│   └── services/
│       └── loaddata.service.ts
├── environments/
│   └── environment.ts
├── main.ts
└── ...

````

---

## ⚙️ Configuración del entorno

El archivo `environment.ts` contiene las variables de entorno globales usadas por la aplicación.

```typescript
export const environment = {
  apiUrl: 'http://apirecoleccion.gonzaloandreslucio.com/api',
  production: false,
  tokenSecret: 'febeed33-ed10-4126-b4c7-73756db1f368'
};
````

* **apiUrl:** URL base de la API.
* **production:** indica el entorno de ejecución.
* **tokenSecret:** identificador del perfil del usuario (temporal para desarrollo).

---

## 📦 Dependencias principales instaladas

Durante el desarrollo, se instalaron las siguientes dependencias clave:

```bash
npm install @ionic/angular
npm install @capacitor/core @capacitor/http
npm install leaflet leaflet-defaulticon-compatibility
npm install rxjs
```

**Importaciones requeridas para Leaflet:**

```typescript
import 'leaflet-defaulticon-compatibility';
import 'leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css';
```

---

## 🧩 Componentes principales

### 🗺️ `Tab3Page`

Página destinada a la **gestión y envío de rutas** al servidor.
Define un objeto `info` con la información de una ruta específica.

```typescript
export class Tab3Page {
  public info: any = {
    "nombre_ruta": "ruta jefer",
    "calles": ["813c43d9-5306-4ece-a1a6-2514024d7559"],
    "perfil_id": "febeed33-ed10-4126-b4c7-73756db1f368"
  };
}
```

**Propiedades:**

* `nombre_ruta`: nombre descriptivo de la ruta.
* `calles`: lista de identificadores únicos de calles.
* `perfil_id`: perfil asociado (se usa el token del `environment`).

📤 *Este objeto puede enviarse al servidor usando el servicio `Loaddata`*:

```typescript
this.myservice.guardarDatos('rutas', this.info);
```

---

### 🚗 `Tab2Page`

Página que **consulta los vehículos asociados a un perfil** mediante el servicio `Loaddata`.

```typescript
export class Tab2Page {
  myservice = inject(Loaddata);

  constructor() {
    this.cargarData();
  }

  public async cargarData() {
    let data = await this.myservice.cargarDatos('vehiculos?perfil_id=' + environment.tokenSecret);
    console.log("vehiculos", data);
  }
}
```

**Flujo:**

1. Al abrir `Tab2`, se ejecuta automáticamente `cargarData()`.
2. Se construye la URL completa con `perfil_id`.
3. Se realiza una solicitud GET a la API.
4. Se muestran los resultados en consola.

---

### 🔧 `Loaddata` (Servicio)

Servicio inyectable que **centraliza la comunicación con la API** utilizando `CapacitorHttp`.

```typescript
import { Injectable } from '@angular/core';
import { CapacitorHttp, HttpResponse } from '@capacitor/core';
import { environment } from 'src/environments/environment';

@Injectable({ providedIn: 'root' })
export class Loaddata {
  private base = environment.apiUrl.replace(/\/$/, '');

  async cargarDatos(path: string) {
    try {
      const url = `${this.base}/${path.replace(/^\//, '')}`;
      console.log('GET URL:', url);

      const options: any = {
        url,
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
      };

      const res: HttpResponse = await CapacitorHttp.get(options);
      return res.data;
    } catch (error) {
      console.error('Error cargando datos:', error);
      throw error;
    }
  }

  async guardarDatos(path: string, data: any, token?: string) {
    try {
      const url = `${this.base}/${path.replace(/^\//, '')}`;
      console.log('POST URL:', url);
      console.log('POST Data:', data);

      const headers: any = {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      };

      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const options: any = {
        url,
        data,
        headers,
      };

      const res: HttpResponse = await CapacitorHttp.post(options);
      return res.data;
    } catch (error) {
      console.error('Error guardando datos:', error);
      throw error;
    }
  }
}
```

**Métodos:**

* `cargarDatos(path: string)` → realiza solicitudes **GET**.
* `guardarDatos(path: string, data: any, token?: string)` → realiza solicitudes **POST**.

📘 *Ejemplo:*

```typescript
await this.myservice.guardarDatos('rutas', this.info, environment.tokenSecret);
```

---

## 🔄 Flujo general

1. **`Tab2Page`** consulta vehículos desde la API (`GET`).
2. **`Tab3Page`** prepara una nueva ruta (`info`).
3. **`Loaddata`** ejecuta las peticiones HTTP (`CapacitorHttp.get/post`).
4. **`environment`** centraliza la URL base y el token del perfil.

---

## 🧠 Buenas prácticas recomendadas

* Usar **interfaces TypeScript** (`Ruta`, `Vehiculo`) en lugar de `any`.
* Implementar manejo de errores visual (no solo en consola).
* Centralizar los endpoints en una constante global.
* En producción, ocultar `tokenSecret` y usar autenticación real (JWT).

---

## 🧩 Créditos y contribuciones

Proyecto desarrollado por **[@jhonjel](https://github.com/jhonjel)**
📦 Repositorio: [App1 - Semana5](https://github.com/jhonjel/App1/tree/semana5)

---

## 📸 Ejemplo visual

Si utilizas **Leaflet**, recuerda importar los íconos de compatibilidad para evitar errores en Android/iOS:

```typescript
import 'leaflet-defaulticon-compatibility';
import 'leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css';
```

---

## 🧱 Licencia

Este proyecto se distribuye bajo la licencia **MIT**.

```

---

¿Deseas que te genere este README como archivo descargable (`README.md`) para agregarlo directamente a tu repositorio GitHub (`App1/semana5`)?
```


---





