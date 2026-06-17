# Requirement Engineering Prototype

A React + Vite prototype for a requirement engineering tool or demonstration application.

## Project overview

- Uses Vite as the build tool.
- Built with React and React DOM.
- Entry point is `src/main.jsx`, which renders the `Prototype.jsx` component.
- Designed as a small prototype app in a single-page layout.

## Getting started

1. Install dependencies:

```bash
npm install
```

2. Start the development server:

```bash
npm run dev
```

3. Open the app in your browser at the URL shown in the terminal (usually `http://localhost:5173`).

## Build

To build the production bundle:

```bash
npm run build
```

To preview the production build locally:

```bash
npm run preview
```

## Project structure

- `index.html` - HTML shell for the Vite app.
- `src/main.jsx` - React application entry point.
- `src/Prototype.jsx` - Main React component for the prototype.
- `package.json` - Project metadata and scripts.
- `vite.config.js` - Vite configuration.

## Dependencies

- `react`
- `react-dom`
- `vite`
- `@vitejs/plugin-react`

## Notes

- The project is configured as an ES module package (`type: module`).
- This README is meant to help developers run and build the prototype locally.
