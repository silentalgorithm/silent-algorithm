# The Silent Algorithm — Sitio Web

Sitio web corporativo construido con **Eleventy JS** (SSG) + **Nunjucks** como motor de plantillas.

## Stack Técnico

| Capa | Tecnología |
|------|------------|
| SSG | Eleventy 3.x |
| Plantillas | Nunjucks |
| Blog/CMS | Markdown + Frontmatter YAML |
| CSS | Vanilla CSS (5 archivos modulares) |
| JS | Vanilla JS (ES2020+, sin frameworks) |
| Fuentes | Google Fonts (Cormorant Garamond, DM Mono, Instrument Sans) |
| Deploy | Netlify / Vercel / cualquier host estático |

## Estructura del proyecto

```
tsa/
├── .eleventy.js          # Configuración principal de Eleventy
├── src/
│   ├── _data/            # Datos globales JSON (site, proyectos, testimonios, faq)
│   ├── _includes/
│   │   ├── layouts/      # Plantillas base (base, home, post, servicio)
│   │   └── partials/     # Componentes reutilizables (nav, footer, form, icons)
│   ├── assets/
│   │   ├── css/          # Sistema de diseño modular (tokens → base → layout → components → animations)
│   │   └── js/           # JavaScript vanilla (utils, cursor, nav, animations, forms)
│   ├── blog/             # Artículos en Markdown con frontmatter
│   ├── servicios/        # Páginas de servicio en Markdown con paquetes en YAML
│   ├── index.njk         # Página de inicio
│   └── 404.njk           # Página de error
└── _site/                # Output generado (no versionar)
```

## Comandos

```bash
# Instalar dependencias
npm install

# Servidor de desarrollo con live reload
npm run dev

# Build de producción
npm run build

# Limpiar output
npm run clean
```

## Agregar un artículo al blog

Crear un archivo `.md` en `src/blog/` con el siguiente frontmatter:

```yaml
---
title: "Título del artículo"
resumen: "Descripción corta para previews y SEO (máx 160 caracteres)"
categoria: Arquitectura          # Aparece como etiqueta/filtro
etiquetas: [tag1, tag2, tag3]    # Para SEO article:tag
destacado: true                  # true = aparece en home
colorBg: "background: linear-gradient(135deg, #0d1b2a 0%, #1a2d44 100%)"
date: 2025-06-01
autor: "Nombre Apellido"          # Opcional, default: The Silent Algorithm
---

Contenido en Markdown...
```

## Agregar un servicio

Crear un archivo `.md` en `src/servicios/` con frontmatter YAML incluyendo el array `paquetes`. Ver archivos existentes como referencia.

## Deploy en Netlify

1. Conectar repositorio a Netlify
2. Build command: `npm run build`
3. Publish directory: `_site`
4. Para formularios de contacto: agregar `data-netlify="true"` al `<form>` en `contact-form.njk`

## Variables de entorno para producción

Actualizar `src/_data/site.json` con:
- `siteUrl`: URL final del sitio
- `siteEmail`: Email de contacto real
- `siteWhatsapp`: Número real de WhatsApp
