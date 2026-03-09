# Personal Utility - Astro + Svelte Edition

This is a web-based utility tool suite built with Astro, Svelte, and Bun. It provides a set of tools for developers, including a text converter, a data formatter, and a diff comparator.

## ✨ Features

- **Text Format Converter**: Real-time conversion for Base64, URL encoding, Unicode, and more.
- **JSON / XML Formatter**: Pretty-print and minify JSON or XML data. *(Implementation pending)*
- **Robust Comparator (Diff Tool)**: A side-by-side diff view to compare text and data structures, powered by CodeMirror's merge view.
- **Modern Tech Stack**: Built with Astro, Svelte, and TypeScript, running on Bun.
- **Static & Fast**: Deployed as a static site for maximum performance.

## 🚀 Project Setup

### Prerequisites

- [Bun](https://bun.sh/)

### Installation

1.  Clone the repository:
    ```bash
    git clone https://github.com/Naretss/personal-utility.git
    cd personal-utility
    ```

2.  Install dependencies using Bun:
    ```bash
    bun install
    ```

### Development

Run the development server:

```bash
bun run dev
```

This will start a local development server at `http://localhost:4321`.

### Build

To create a production build of the site, run:

```bash
bun run build
```

This will generate the static site in the `dist/` directory. You can preview the production build locally with `bun run preview`.

## 🏛️ Architecture

This project uses the Astro framework for its "islands architecture," which is ideal for content-rich static sites that need interactive components.

-   **Astro (`.astro` files):** Used for creating pages (`src/pages`) and layouts (`src/layouts`). Astro handles the overall structure, routing, and static site generation.
-   **Svelte (`.svelte` files):** Used for all interactive UI components (the "islands"). The code editors, buttons, and logic for the converter, formatter, and comparator are built with Svelte.
-   **Bun:** The all-in-one toolkit for the project. It's the package manager, runtime, and bundler.
-   **CodeMirror:** Integrated as a Svelte component (`src/editors/CodeEditor.svelte`) to provide a powerful and extensible editing experience.

The project is structured as follows:

```
/src
  /components      # Reusable Svelte UI components
  /editors         # CodeMirror wrapper component
  /features        # Logic and components for each tool
  /layouts         # Astro layout files
  /pages           # Astro pages for routing
  /styles          # Global styles
  /utils           # Utility functions
```

## 🚀 Deployment to GitHub Pages

The `astro.config.mjs` is pre-configured for deployment to GitHub Pages.

1.  **Set Repository URL**: In `astro.config.mjs`, update the `site` and `base` properties to match your GitHub repository.

    ```javascript
    export default defineConfig({
      site: 'https://<YOUR_GITHUB_USERNAME>.github.io',
      base: '/<YOUR_REPOSITORY_NAME>',
      // ...
    });
    ```

2.  **Build the site**:
    ```bash
    bun run build
    ```

3.  **Deploy**: The easiest way to deploy is to push the contents of the `dist` folder to a `gh-pages` branch. You can use a GitHub Action or a manual process.