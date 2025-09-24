 🔹 Sprint 1 – Ubicación inicial
**Branch:** `feature/sprint-1-ubicacion-inicial`  
**Tag esperado:** `v1.0.0`  

**Objetivo:**  
Implementar el mapa base, obtener la geolocalización en tiempo real y registrar vehículos (mock o real según backend).

**Historias de usuario:**
- Como usuario, quiero ver un mapa base en la aplicación para ubicar los vehículos.  
- Como conductor, quiero registrar un vehículo en la aplicación para asociarlo al sistema.  
- Como usuario, quiero ver mi ubicación en tiempo real en el mapa.  

**Tareas técnicas:**
- [ ] Integrar mapa base en `pages/mapa/mapa.page.ts`.  
- [ ] Configurar servicio de geolocalización.  
- [ ] Crear formulario básico para registro de vehículo (mock).  
- [ ] Mostrar vehículo registrado sobre el mapa.  

**Criterios de aceptación:**
- El mapa se muestra al abrir la aplicación.  
- La ubicación en tiempo real se actualiza en el mapa.  
- Se puede registrar un vehículo y visualizarlo en el mapa.  

---

## 🔹 Sprint 2 – Trazando la ruta
**Branch:** `feature/sprint-2-rutas`  
**Tag esperado:** `v2.0.0`  

**Objetivo:**  
Permitir la representación de rutas planificadas en el mapa con polilíneas y mostrar el detalle de la ruta.  

**Historias de usuario:**
- Como usuario, quiero ver la ruta planificada de un vehículo sobre el mapa.  
- Como conductor, quiero visualizar detalles de mi ruta (distancia, puntos de paso, destino).  

**Tareas técnicas:**
- [ ] Integrar polilíneas en el mapa.  
- [ ] Crear componente `components/map/map.component.ts` para manejo de rutas.  
- [ ] Implementar servicio para calcular/mostrar detalles de la ruta.  
- [ ] Añadir detalle de la ruta en un panel lateral o modal.  

**Criterios de aceptación:**
- El mapa muestra correctamente una ruta con polilíneas.  
- Se puede visualizar información adicional de la ruta (distancia, tiempo estimado, puntos clave).  

---

## 🔹 Sprint 3 – Publicación continua
**Branch:** `feature/sprint-3-publicacion-continua`  
**Tag esperado:** `v3.0.0`  

**Objetivo:**  
Actualizar casi en tiempo real la ubicación de los vehículos (mediante polling o WebSocket).  

**Historias de usuario:**
- Como usuario, quiero ver en tiempo real el movimiento del vehículo en el mapa.  
- Como administrador, quiero asegurar que los datos de ubicación se actualicen automáticamente sin refrescar la app.  

**Tareas técnicas:**
- [ ] Implementar servicio con **polling** o **WebSocket** para actualización de ubicación.  
- [ ] Sincronizar posición de vehículos en el mapa con datos recibidos.  
- [ ] Optimizar rendimiento para múltiples vehículos.  

**Criterios de aceptación:**
- La ubicación de los vehículos se actualiza automáticamente en el mapa.  
- La app soporta múltiples vehículos en tiempo real sin retrasos importantes.  

---

## 🔹 Sprint 4 – Ajustes de la ruta
**Branch:** `feature/sprint-4-ajustes-ruta`  
**Tag esperado:** `v4.0.0`  

**Objetivo:**  
Refinar funcionalidades existentes, manejar errores y optimizar rendimiento.  

**Historias de usuario:**
- Como usuario, quiero que el mapa funcione de manera fluida sin errores.  
- Como administrador, quiero detectar y manejar errores de conexión o ubicación.  

**Tareas técnicas:**
- [ ] Mejorar el rendimiento del mapa (renderizado y actualizaciones).  
- [ ] Implementar manejo de errores en geolocalización y rutas.  
- [ ] Optimizar carga de vehículos en tiempo real.  
- [ ] Refinar interfaz para mejor experiencia de usuario.  

**Criterios de aceptación:**
- El sistema maneja errores de ubicación sin fallar.  
- El mapa responde de manera fluida con múltiples rutas y vehículos.  

---

## 🔹 Sprint 5 – Listo para producción
**Branch:** `release/sprint-5-produccion`  
**Tag esperado:** `v5.0.0`  

**Objetivo:**  
Preparar la aplicación para producción con revisión técnica, build instalable y demo lista.  

**Historias de usuario:**
- Como administrador, quiero una versión estable lista para pruebas finales.  
- Como cliente, quiero acceder a una demo instalable de la app.  

**Tareas técnicas:**
- [ ] Revisión técnica final del código.  
- [ ] Generar build instalable (APK/IPA según plataforma).  
- [ ] Preparar documentación de instalación y despliegue.  
- [ ] Hacer demo para stakeholders.  

**Criterios de aceptación:**
- Se genera un build funcional listo para instalación.  
- La demo muestra todas las funcionalidades planeadas.  

---
