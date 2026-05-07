# Julimes Bar Website

## Estructura del Proyecto

```
julimes-bar/
├── index.html          # Página principal
├── admin.html          # Panel de administración
├── styles.css          # Estilos principales
├── admin.css           # Estilos del admin
├── script.js           # JavaScript principal
├── admin.js            # JavaScript del admin
├── assets/             # Imágenes y recursos
│   ├── logo.jpg
│   ├── interior.jpg
│   ├── bar-area.jpg
│   ├── bottles.jpg
│   ├── food.jpg
│   ├── cocktail.jpg
│   ├── karaoke.jpg
│   ├── menu.jpg
│   ├── promo.jpg
│   └── screenshot.png
└── README.md
```

## Características

### Pública
- ✅ Diseño responsivo (móvil, tablet, desktop)
- ✅ Navegación suave con scroll
- ✅ Secciones: Inicio, Nosotros, Menú, Eventos, Reseñas, Contacto
- ✅ Formulario de reseñas con calificación por estrellas
- ✅ Mapa de Google Maps integrado
- ✅ Información sobre Julimes, Chihuahua

### Administración
- ✅ Login protegido por contraseña
- ✅ Aprobación de reseñas (pendientes → aprobadas)
- ✅ Gestión de eventos (CRUD)
- ✅ Gestión de menú (CRUD)
- ✅ Configuración de contacto
- ✅ Estadísticas en tiempo real

## Tecnologías
- HTML5 semántico
- CSS3 con variables y Grid/Flexbox
- JavaScript vanilla (sin frameworks)
- LocalStorage para persistencia de datos
- Diseño mobile-first

## Información del Negocio

### Julimes Bar
- **Dirección:** Calle Hidalgo S/N, Julimes, Chihuahua, México, C.P. 32950
- **Teléfono / WhatsApp:** 639 167 9514
- **Horario:** Jueves a Lunes: 5:00 PM - 12:00 AM (Martes y Miércoles cerrado)
- **Promoción:** Sábados - Cuartito XX a $10 pesitos

### Menú
- **Cervezas:** Cuartito XX ($10), Nacional ($25), Importada ($35)
- **Cócteles:** Margarita ($60), Paloma ($55), Michelada ($45)
- **Destilados:** Don Julio 70 ($120), 1800 Reposado ($100), Johnnie Walker Black Label ($150), Hennessy VS ($140), Hornitos Reposado ($90)
- **Botanas:** Pozole ($80), Tacos de Birria ($70), Alitas BBQ ($90), Papas a la Francesa ($50)

### Eventos
- **Karaoke:** Sábados de cada semana, 8:00 PM - 12:00 AM
- **Promo Sábado:** Cuartito XX a $10 pesitos

## Instrucciones de Uso

### Para el Cliente (Público)
1. Abrir `index.html` en navegador
2. Navegar por las secciones
3. Dejar reseña en la sección correspondiente
4. Ver menú y eventos

### Para el Administrador
1. Ir a `admin.html`
2. Ingresar contraseña: `julimes2024`
3. Gestionar reseñas pendientes
4. Agregar/eliminar eventos
5. Actualizar menú
6. Configurar información de contacto

## Próximos Pasos
1. Publicar en hosting (GitHub Pages, Netlify, etc.)
2. Cambiar contraseña de admin antes de publicar
3. Agregar más fotos del bar

## Notas de Seguridad
- La contraseña actual es temporal (`julimes2024`)
- Cambiar antes de publicar
- Los datos se almacenan en LocalStorage (navegador)
- Para producción considerar backend real (Firebase, Supabase, etc.)

---
Hecho con ❤️ para la familia Herrera Nunez