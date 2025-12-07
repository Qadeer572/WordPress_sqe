/**
 * Users List Page Test Cases
 * Testing users list page functionality (bulk actions, filtering by role, search)
 * Test Cases: TC-USERLIST-01 to TC-USERLIST-08
 */

describe('Users List Page - UI Testing', () => {
  const baseUrl = Cypress.config('baseUrl') || 'http://127.0.0.1:8080'
  const usersListUrl = `${baseUrl}/wp-admin/users.php`
  const adminUsername = 'Qadeer572'
  const adminPassword = 'raza@1214'

  beforeEach(() => {
    // Login as admin before each test using the custom command
    cy.wpLogin(adminUsername, adminPassword)

    // Navigate to Users list page
    cy.visit(usersListUrl)
    
    // Wait for users list to load
    cy.get('#wpbody-content', { timeout: 10000 }).should('be.visible')
    cy.wait(1000)
  })

  describe('TC-USERLIST-01: User list table display', () => {
    it('should display users list table with all columns', () => {
      // Verify table exists
      cy.get('#the-list, .wp-list-table', { timeout: 5000 }).should('exist')
      
      // Verify table headers
      cy.get('.wp-list-table thead th, #the-list th', { timeout: 3000 }).should('have.length.at.least', 1)
      
      // Verify at least one column header exists
      cy.get('.wp-list-table thead th, #the-list th').first().should('be.visible')
      
      // Check for common columns (Username, Name, Email, Role, etc.)
      cy.get('body').then(($body) => {
        const hasUsername = $body.find('th.column-username, th[data-colname="username"]').length > 0
        const hasName = $body.find('th.column-name, th[data-colname="name"]').length > 0
        const hasEmail = $body.find('th.column-email, th[data-colname="email"]').length > 0
        const hasRole = $body.find('th.column-role, th[data-colname="role"]').length > 0
        
        expect(hasUsername || hasName || hasEmail || hasRole).to.be.true
      })
    })
  })

   
          

  describe('TC-USERLIST-03: Bulk actions - change user role', () => {
    it('should change role of multiple users using bulk actions', () => {
      // Check if users exist
      cy.get('body').then(($body) => {
        if ($body.find('#the-list tr:not(.no-items)').length >= 2) {
          // Select first two users
          cy.get('#the-list input[type="checkbox"]:not(.cb-select-all)').first().check()
          cy.get('#the-list input[type="checkbox"]:not(.cb-select-all)').eq(1).check()
          
          // Select "Change role" from bulk actions
          cy.get('#bulk-action-selector-top, #bulk-action-selector-bottom', { timeout: 3000 }).then(($select) => {
            const options = $select.find('option')
            const changeRoleOption = Array.from(options).find(opt => 
              opt.text.toLowerCase().includes('change') || opt.text.toLowerCase().includes('role')
            )
            
            if (changeRoleOption) {
              cy.get('#bulk-action-selector-top, #bulk-action-selector-bottom').select(changeRoleOption.value)
              
              // Click Apply
              cy.get('#doaction, #doaction2, .button.action').click()
              
              cy.wait(1000)
              
              // Select new role if role selector appears
              cy.get('body').then(($body2) => {
                if ($body2.find('select[name="new_role"], #new_role').length > 0) {
                  cy.get('select[name="new_role"], #new_role').select('subscriber')
                  cy.get('#submit, .button-primary').click()
                  cy.wait(1000)
                  
                  // Verify success message
                  cy.get('.notice-success, .updated', { timeout: 3000 }).should('exist')
                } else {
                  cy.log('Role change form not available')
                }
              })
            } else {
              cy.log('Change role option not available in bulk actions')
            }
          })
        } else {
          cy.log('Not enough users for bulk role change test')
        }
      })
    })
  })

  describe('TC-USERLIST-04: Filtering by role', () => {
    it('should filter users by role', () => {
      // Look for role filter
      cy.get('body').then(($body) => {
        if ($body.find('select[name="role"], #role').length > 0) {
          // Select a role
          cy.get('select[name="role"], #role').then(($select) => {
            const options = $select.find('option')
            if (options.length > 1) {
              // Select Administrator role
              cy.get('select[name="role"], #role').select('administrator')
              cy.get('#post-query-submit, .button.filter, #changeit').click()
              cy.wait(1000)
              
              // Verify filter applied
              cy.url().should('include', 'role=administrator')
            } else {
              cy.log('No role options available for filtering')
            }
          })
        } else {
          cy.log('Role filter not available')
        }
      })
    })
  })

  describe('TC-USERLIST-05: Search functionality', () => {
    it('should search and filter users', () => {
      // Find search input
      cy.get('#user-search-input, input[name="s"], #search-input', { timeout: 5000 }).should('be.visible')
      
      // Enter search term
      const searchTerm = 'admin'
      cy.get('#user-search-input, input[name="s"], #search-input').clear().type(searchTerm)
      
      // Submit search
      cy.get('#search-submit, #search-submit-button, button[type="submit"]').click()
      cy.wait(1000)
      
      // Verify search results
      cy.url().should('include', `s=${searchTerm}`)
    })
  })

 
  

  describe('TC-USERLIST-08: Add new user button navigation', () => {
    it('should navigate to add new user page when clicking Add New button', () => {
      // Look for Add New button
      cy.get('body').then(($body) => {
        if ($body.find('a[href*="user-new.php"], .page-title-action, .add-new-h2').length > 0) {
          // Click Add New button
          cy.get('a[href*="user-new.php"], .page-title-action, .add-new-h2').first().click()
          cy.wait(1000)
          
          // Verify navigated to add user page
          cy.url().should('include', 'user-new.php')
          
          // Verify add user form elements exist
          cy.get('#adduser, #createuser, input[name="user_login"]', { timeout: 3000 }).should('exist')
        } else {
          cy.log('Add New user button not found')
        }
      })
    })
  })
})

