describe('WordPress Basic Tests', () => {
  const baseUrl = Cypress.config('baseUrl') || 'http://127.0.0.1:8080'
  const adminUsername = Cypress.env('wpUser') || 'Qadeer572'
  const adminPassword = Cypress.env('wpPassword') || 'raza@1214'

  it('should load the homepage', () => {
    cy.visit(baseUrl)
    // Check that the page loads (title should contain WordPress or the site name)
    cy.title().should('exist')
    cy.get('body').should('be.visible')
  })

  it('should access the admin login page', () => {
    cy.visit(`${baseUrl}/wp-admin`)
    cy.get('#loginform').should('be.visible')
    cy.get('#user_login').should('be.visible')
    cy.get('#user_pass').should('be.visible')
  })

  it('should login to WordPress admin', () => {
    // Use the improved wpLogin command
    cy.wpLogin(adminUsername, adminPassword)
    
    // Verify we're logged in by checking for admin bar
    cy.get('#wpadminbar', { timeout: 10000 }).should('be.visible')
  })

  it('should navigate to posts page', () => {
    // Login first using the improved command
    cy.wpLogin(adminUsername, adminPassword)
    
    // Navigate to posts
    cy.visit(`${baseUrl}/wp-admin/edit.php`)
    
    // Wait for posts page to load and check for Posts heading
    cy.contains('Posts', { timeout: 10000 }).should('be.visible')
  })
})

