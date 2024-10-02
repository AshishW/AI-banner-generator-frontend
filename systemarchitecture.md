
![ArtVisionX Architecture](./src/assets/ArtVisionX_Architecture.png)

This React app implements a single-page application (SPA) for generating and editing banner images using an AI backend. Here's a detailed breakdown of its system design:


**1. Frontend (React):**

* **Component Structure:** The core functionality resides within the `AIBannerGenerator` component.  This component manages user input, communicates with the backend, renders the banner preview, and handles the advanced editor modal.
* **State Management:**  The component utilizes React's `useState` hook to manage various aspects of the application's state:
    * `promotion`:  The promotional text for the banner.
    * `theme`: The theme for the banner generation.
    * `resolution`: The selected banner resolution.
    * `customWidth`, `customHeight`: Custom width and height values.
    * `colorPalette`:  An array of colors for the banner.
    * `images`: Uploaded image files.
    * `bannerPreview`: The data URL of the generated banner.
    * `isLoading`: A boolean indicating whether a banner generation request is in progress.
    * `errorMessage`:  An error message to display to the user.
    * `showThemeInput`: A boolean controlling the visibility of the theme input field.
    * `showModal`: A boolean controlling the visibility of the advanced editor modal.
    * `modalCanvas`: The Fabric.js canvas instance for the modal.
    * `selectedObject`: The currently selected object on the modal canvas.
    * `renderedBannerTextData`: Stores the text data rendered on the banner.
    * `canvasDataState`: Stores the canvas data as a JSON string.
    * `CanvasResolutionState`: Stores the canvas resolution.
    * `isExploding`: Boolean for confetti animation.
* **User Input:**  The component collects user input through various form elements: text inputs, color pickers, file uploads, and a dropdown for resolution selection.
* **Backend Communication:** The `generateBanner` function handles communication with the backend. It sends a POST request to `/generate_banner` with the user-provided data (promotion, theme, resolution, color palette, and image data URLs).  It then processes the response, renders the banner, or displays an error message.
* **Banner Rendering:** The `renderBanner` function uses Fabric.js to render the banner on a canvas element. It processes the JSON data received from the backend, creates Fabric.js objects (images and text), and adds them to the canvas.
* **Advanced Editor:** The `openAdvancedEditor` function opens a modal containing another Fabric.js canvas. This allows users to further edit the generated banner.  The `closeModal` function saves the changes made in the modal back to the main canvas.
* **Confetti Effect:** The `ConfettiExplosion` component is used to display a confetti effect after successful banner generation.
* **Local Storage:** The app uses local storage to temporarily store the canvas data (`canvasData`) and resolution (`canvasResolution`) when the advanced editor is opened and closed. This preserves the user's edits across sessions.
* **Error Handling:** The app includes basic error handling to catch issues during banner generation and display informative error messages to the user.
* **UI/UX:** The component uses various UI elements like buttons, inputs, and a modal to provide a user-friendly interface.

**2. Backend (Implied):**

* **API Endpoint:** The backend exposes a `/generate_banner` endpoint that accepts POST requests.
* **AI Model:** The backend likely utilizes an AI model (not detailed in the provided code) to generate the banner based on the user's input.  This model probably handles tasks like image processing, layout generation, and text placement.
* **Response Format:** The backend returns a JSON object containing the generated banner data. This data includes the banner dimensions and an array of objects (images and text) with their respective properties (position, size, color, font, etc.).

**3. Data Flow:**

1. The user provides input through the form elements.
2. The frontend sends a request to the backend with the user input.
3. The backend's AI system generates the banner.
4. The backend sends the generated banner data back to the frontend.
5. The frontend renders the banner using Fabric.js.
6. The user can further edit the banner in the advanced editor modal.
7. The user can download the final banner.

**4. Technologies Used:**

* **React:**  Frontend JavaScript library.
* **Fabric.js:**  JavaScript library for working with HTML5 canvas elements.
* **react-confetti-explosion:** Library for confetti effects.
* **react-icons:** Library for icons.
* **react-tooltip:** Library for tooltips.


This detailed description provides a comprehensive overview of the system design of the provided React app.  It covers the frontend architecture, backend interaction, data flow, and technologies used.
