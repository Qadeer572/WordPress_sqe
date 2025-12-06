const { defineConfig } = require('cypress')

module.exports = defineConfig({
  e2e: {
    // Use environment variable if set, otherwise fallback to local development
    baseUrl: process.env.CYPRESS_baseUrl || process.env.BASE_URL || 'http://127.0.0.1:8080',
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },

    // Make the AUT frame closer to your real browser and
    // avoid Gutenberg scripts breaking inside Cypress.
    chromeWebSecurity: false,
    modifyObstructiveCode: false,

    viewportWidth: 1280,
    viewportHeight: 720,
    video: true,
    screenshotOnRunFailure: true,
    defaultCommandTimeout: 10000,
    pageLoadTimeout: 60000,
    requestTimeout: 10000,
    responseTimeout: 10000,
  },
})

