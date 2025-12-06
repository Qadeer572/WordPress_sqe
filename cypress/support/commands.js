// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })

// Custom command to login to WordPress with robust error handling
Cypress.Commands.add('wpLogin', (username, password, rememberMe = false) => {
  // Visit login page
  cy.visit('/wp-login.php', { timeout: 10000 })
  
  // Wait for login form to be fully loaded
  cy.get('#user_login', { timeout: 10000 }).should('be.visible')
  cy.get('#user_pass', { timeout: 10000 }).should('be.visible')
  cy.get('#wp-submit', { timeout: 10000 }).should('be.visible')
  
  // Clear and type credentials
  cy.get('#user_login').clear().type(username, { delay: 0 })
  cy.get('#user_pass').clear().type(password, { delay: 0 })
  
  if (rememberMe) {
    cy.get('#rememberme').check()
  } else {
    cy.get('#rememberme').uncheck()
  }
  
  // Submit login form
  cy.get('#wp-submit').click()
  
  // Wait for redirect away from login page (with longer timeout)
  cy.url({ timeout: 20000 }).should('not.include', '/wp-login.php')
  
  // Verify we're in admin area
  cy.url({ timeout: 5000 }).should('include', '/wp-admin')
  
  // Wait a moment for admin to fully load
  cy.wait(1000)
})

// Custom command to check for error messages
Cypress.Commands.add('checkLoginError', (expectedError) => {
  cy.get('#login_error, .login-error, .error').should('be.visible')
  if (expectedError) {
    cy.get('#login_error, .login-error, .error').should('contain', expectedError)
  }
})

// Custom command to check successful login
Cypress.Commands.add('checkLoginSuccess', () => {
  cy.url().should('not.include', '/wp-login.php')
  cy.url().should('include', '/wp-admin')
})

