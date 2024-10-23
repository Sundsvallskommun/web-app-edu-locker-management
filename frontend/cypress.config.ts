import { defineConfig } from "cypress";

export default defineConfig({
  env: {
    userEmail: "karin.andersson@example.com",
    userPassword: "password",
    apiUrl: "http://localhost:3001",
  },

  e2e: {
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
  },
});
