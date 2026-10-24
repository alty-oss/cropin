<div align="center">

<p align="center">
    <picture>
        <source media="(prefers-color-scheme: light)" srcset="https://crop.marcuscoelho.com/favicon.ico">
        <img src="https://crop.marcuscoelho.com/favicon.ico" alt="Cropin" width="50">
    </picture>
</p>

# Cropin

Ferramenta simples e open-source para recortar imagens e GIFs animados.

Recorte com preview em tempo real, preservando animações de GIF.

<p>
  <img
    src="https://img.shields.io/github/stars/coelhomarcus/cropin?style=flat-square"
    alt="GitHub Stars"
  />
  <img
    src="https://img.shields.io/github/last-commit/coelhomarcus/cropin?style=flat-square"
    alt="Last commit"
  />
  <img
    src="https://img.shields.io/github/issues/coelhomarcus/cropin?style=flat-square"
    alt="Open issues"
  />
</p>

</div>

---

## Features

- Recorte de imagens (PNG, JPG, WebP) direto no browser
- Recorte de **GIFs** animados preservando a animação
- Preview em tempo real
- Download do resultado
- Uploads de imagens de até 50 MB

## Tech Stack

| Category   | Technology                |
| ---------- | ------------------------- |
| Frontend   | React + Vite + TypeScript |
| Styling    | Tailwind CSS              |
| Processing | Canvas + ImageMagick WASM |
| Runtime    | Node.js 22 (build only)   |
| Container  | Docker + Nginx            |

## Quick Start

```bash
git clone https://github.com/coelhomarcus/cropin
cd cropin

npm install
npm run dev
```

## Deploy (Docker)

```bash
docker build -t cropin .
docker run -p 3002:3002 cropin
```

O Nginx serve o frontend estático na porta `3002` e redireciona as rotas do
`BrowserRouter` para `index.html`, permitindo recarregar a tela de edição.
