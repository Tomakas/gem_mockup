// main.js
import '@mdi/font/css/materialdesignicons.css'; // Úplně první import
import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import "vuetify/styles"; // Import základních stylů Vuetify
import { createVuetify } from "vuetify";
import * as components from "vuetify/components";
import * as directives from "vuetify/directives";

// --- Globální styl pro zalamování chipů ---
const customGlobalStyles = `
  .chip-group-wrap .v-chip-group__container {
    flex-wrap: wrap;
    gap: 8px;
  }
`;

const styleElement = document.createElement("style");
styleElement.type = "text/css";
styleElement.appendChild(document.createTextNode(customGlobalStyles));
document.head.appendChild(styleElement);
// --- KONEC ZMĚNY ---

const vuetify = createVuetify({
  components,
  directives,
  theme: {
    defaultTheme: "dark",
    themes: {
      light: {
        colors: {
          primary: "#1867C0",
          secondary: "#424242",
          accent: "#82B1FF",
          error: "#FF5252",
          info: "#2196F3",
          success: "#4CAF50",
          warning: "#FB8C00",
        },
      },
      dark: {
        colors: {
          primary: "#90CAF9",
          secondary: "#424242",
          accent: "#BB86FC",
          error: "#CF6679",
          info: "#2196F3",
          success: "#4CAF50",
          warning: "#FB8C00",
        },
      },
    },
  },
  defaults: {
    VCard: {
      elevation: 4,
      class: "pa-0 pa-sm-2 pa-md-4",
    },
    VContainer: {
      fluid: true,
      class: "pa-0 pa-sm-1 pa-md-4",
    },
   VTextField: {
      variant: "outlined",
      density: "compact",
      hideDetails: true,
    },
    VSelect: {
      variant: "outlined",
      density: "compact",
      hideDetails: true,
    },
    VDialog: {
      maxWidth: "800px",
      class: "rounded-lg",
    },
    VDataTable: {
      class: "elevation-0 mt-4",
      itemsPerPage: 10,
    },
    VList: {
      dense: true,
    },
  },
});

createApp(App).use(router).use(vuetify).mount("#app");