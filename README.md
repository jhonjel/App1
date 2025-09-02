
---

````markdown
# 📱 Proyecto Ionic + Angular

## 👥 Integrantes
- Jefer Cuero  
- Potosi Reyes  
- Jennifer Mondragón  
- Jhon Estupiñan  

---

## 📌 Descripción General
En esta sección del proyecto se definen las **herramientas necesarias** y los **comandos disponibles** para trabajar con la aplicación **Ionic/Angular**.  
Todo esto está centralizado en el archivo **`package.json`**, que funciona como el “manual de instrucciones” del proyecto.

---

## 📦 Dependencias
- Librerías y frameworks principales: **Angular, Ionic, RxJS, etc.**  
- Herramientas de desarrollo: **TypeScript, linters, utilidades de testing**.  
- Instalación de dependencias:

```bash
npm install
````

---
---
---
SEMANA 3
---
---

## 🛠 Tooling (herramientas de soporte)

Incluye el uso del **CLI de Ionic** y **CLI de Angular**.

Comandos más usados:

```bash
ionic serve     # Levanta el servidor de desarrollo
ionic build     # Compila la aplicación para producción
ionic generate  # Genera componentes, servicios, etc.
```

---

## ⚡ Scripts de Build

Scripts definidos en **`package.json`** para simplificar tareas frecuentes:

* `npm start` → arranca la app (`ionic serve`).
* `npm run build` → compila el proyecto.
* `npm test` → ejecuta pruebas.

---

## 🌍 Nodo y NPM

La mayoría de herramientas modernas de JavaScript se basan en **Node.js** y **npm** (Node Package Manager).

Verificar instalación:

```bash
node --version
npm --version
```

---

## 🚀 Pasos Iniciales

1. **Instalar la CLI de Ionic**

```bash
npm install -g @ionic/cli
```

2. **Crear una nueva aplicación**

```bash
ionic start <nombre>
```

---
---
---

SEMANA 4 
---
---



## 🚀 Componentes utilizados

### 1. **ion-accordion**
Permite organizar contenido en secciones desplegables.

```html
<ion-accordion-group>
  <ion-accordion value="first">
    <ion-item slot="header">
      <ion-label>Primera Sección</ion-label>
    </ion-item>
    <div class="ion-padding" slot="content">
      Contenido de la primera sección.
    </div>
  </ion-accordion>
</ion-accordion-group>
````

---

### 2. **ion-tabs**

Facilita la navegación entre diferentes secciones de la aplicación.

```html
<ion-tabs>
  <ion-tab-bar slot="bottom">
    <ion-tab-button tab="home">
      <ion-icon name="home"></ion-icon>
      <ion-label>Inicio</ion-label>
    </ion-tab-button>

    <ion-tab-button tab="settings">
      <ion-icon name="settings"></ion-icon>
      <ion-label>Configuración</ion-label>
    </ion-tab-button>
  </ion-tab-bar>
</ion-tabs>
```

---

### 3. **Modo oscuro (Dark Mode)**

Personaliza la interfaz de acuerdo a la preferencia del usuario.

```html
<ion-item>
  <ion-label>Modo oscuro</ion-label>
  <ion-toggle slot="end" (ionChange)="toggleDarkMode($event)"></ion-toggle>
</ion-item>
```

```ts
toggleDarkMode(event: any) {
  document.body.classList.toggle('dark', event.detail.checked);
}
```

---

### 4. **ion-menu (Drawer / Side Menu)**

Un menú lateral para acceder a diferentes secciones de la aplicación.

```html
<ion-menu contentId="main-content">
  <ion-header>
    <ion-toolbar color="primary">
      <ion-title>Menú</ion-title>
    </ion-toolbar>
  </ion-header>

  <ion-content>
    <ion-list>
      <ion-item routerLink="/home">Inicio</ion-item>
      <ion-item routerLink="/dark">Modo Oscuro</ion-item>
    </ion-list>
  </ion-content>
</ion-menu>

<div id="main-content">
  <ion-router-outlet></ion-router-outlet>
</div>
```

---

### 5. **ion-split-pane**

Permite que el menú lateral se muestre fijo en pantallas grandes y como drawer en pantallas pequeñas.

```html
<ion-split-pane contentId="main">
  <ion-menu contentId="main">
    <ion-header>
      <ion-toolbar>
        <ion-title>Opciones</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content>
      <ion-list>
        <ion-item routerLink="/tab1">Tab 1</ion-item>
        <ion-item routerLink="/tab2">Tab 2</ion-item>
      </ion-list>
    </ion-content>
  </ion-menu>

  <ion-router-outlet id="main"></ion-router-outlet>
</ion-split-pane>
```





