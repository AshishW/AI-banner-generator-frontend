# ArtVisionX AI

![ArtVisionX Banner Generator](./assets/ui_image.png)


[System Design Documentation](systemarchitecture.md)

This application allows users to generate custom banner images using Gemini AI.  Users input text, select themes, choose resolutions, and optionally upload images. The AI backend processes this information to create an advertisement banner, which is then displayed and can be further edited and downloaded.


This project provides a React application built with Vite, enabling efficient development with Hot Module Replacement (HMR) and ESLint for code quality.  It's designed to generate AI-powered banners.

## Setting Up the Application Locally

1. **Clone the repository:**
   ```bash
   git clone <repository_url>
   ```

2. **Navigate to the project directory:**
   ```bash
   cd <project_directory>
   ```

3. **Install dependencies:**
   ```bash
   npm install
   ```
   or
   ```bash
   yarn install
   ```

4. **Start the development server:**
   ```bash
   npm run dev
   ```
   or
   ```bash
   yarn dev
   ```

This will start the development server and open the application in your browser.  You can then interact with the banner generation features.

## Available Plugins

This project utilizes Vite plugins for enhanced development experience:

- **`@vitejs/plugin-react`:** Uses Babel for Fast Refresh, providing quick feedback during development.
- **`@vitejs/plugin-react-swc`:** Uses SWC for Fast Refresh, offering another high-performance option.  (Choose one; they are mutually exclusive).

## Building for Production

To build the application for production, run:

```bash
npm run build
```
or
```bash
yarn build
```

This will create an optimized build in the `dist` directory.


