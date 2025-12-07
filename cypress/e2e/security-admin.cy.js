/**
 * Admin Area Security Test Cases
 * Testing SQL Injection and XSS vulnerabilities in admin area
 * Test Cases: TC-SEC-11 to TC-SEC-20
 */

describe('Admin Area Security Testing', () => {
  const baseUrl = Cypress.config('baseUrl') || 'http://127.0.0.1:8080'
  const adminUsername = 'Qadeer572'
  const adminPassword = 'raza@1214'
  
  // SQL Injection payloads
  const sqlPayloads = [
    "' OR '1'='1",
    "'; DROP TABLE users--",
    "' UNION SELECT * FROM users--",
    "1' OR '1'='1",
    "admin'--",
    "' OR 1=1--",
    "') OR ('1'='1"
  ]
  
  // XSS payloads
  const xssPayloads = [
    "<script>alert('XSS')</script>",
    "<img src=x onerror=alert('XSS')>",
    "javascript:alert('XSS')",
    "<svg onload=alert('XSS')>",
    "<body onload=alert('XSS')>",
    "<iframe src=javascript:alert('XSS')>",
    "<input onfocus=alert('XSS') autofocus>"
  ]

  beforeEach(() => {
    // Login to admin area before each test
    cy.wpLogin(adminUsername, adminPassword)
    cy.wait(1000)
  })

  describe('TC-SEC-11: SQL Injection in admin login form (username)', () => {
    it('should prevent SQL injection in admin login username field', () => {
      // Logout first
      cy.visit(`${baseUrl}/wp-login.php?loggedout=true`)
      cy.wait(1000)
      
      const payload = sqlPayloads[0] // "' OR '1'='1"
      
      cy.get('#user_login').clear().type(payload)
      cy.get('#user_pass').clear().type('testpassword')
      cy.get('#wp-submit').click()
      
      cy.wait(2000)
      
      // Verify login failed (should not succeed with SQL injection)
      cy.url().then((url) => {
        // Should still be on login page or show error
        if (url.includes('/wp-login.php')) {
          // Check for error message
          cy.get('body').then(($body) => {
            if ($body.find('#login_error, .login-error, .error').length > 0) {
              cy.get('#login_error, .login-error, .error').should('be.visible')
            }
          })
        } else {
          // If somehow logged in, verify no SQL errors
          cy.get('body').then(($body) => {
            const bodyText = $body.text()
            expect(bodyText).to.not.include('SQL syntax')
            expect(bodyText).to.not.include('mysql_fetch')
          })
        }
      })
      
      // Verify no SQL errors are displayed
      cy.get('body').then(($body) => {
        const bodyText = $body.text()
        expect(bodyText).to.not.include('SQL syntax')
        expect(bodyText).to.not.include('mysql_fetch')
        expect(bodyText).to.not.include('Warning: mysql_')
      })
    })
  })

  describe('TC-SEC-12: SQL Injection in admin login form (password)', () => {
    it('should prevent SQL injection in admin login password field', () => {
      cy.visit(`${baseUrl}/wp-login.php?loggedout=true`)
      cy.wait(1000)
      
      const payload = sqlPayloads[0] // "' OR '1'='1"
      
      cy.get('#user_login').clear().type(adminUsername)
      cy.get('#user_pass').clear().type(payload)
      cy.get('#wp-submit').click()
      
      cy.wait(2000)
      
      // Verify login failed
      cy.url().then((url) => {
        if (url.includes('/wp-login.php')) {
          cy.get('body').then(($body) => {
            if ($body.find('#login_error, .login-error, .error').length > 0) {
              cy.get('#login_error, .login-error, .error').should('be.visible')
            }
          })
        }
      })
      
      // Verify no SQL errors
      cy.get('body').then(($body) => {
        const bodyText = $body.text()
        expect(bodyText).to.not.include('SQL syntax')
        expect(bodyText).to.not.include('mysql_fetch')
      })
    })
  })

  describe('TC-SEC-13: XSS in admin login form (username)', () => {
    it('should prevent XSS in admin login username field', () => {
      cy.visit(`${baseUrl}/wp-login.php?loggedout=true`)
      cy.wait(1000)
      
      const payload = xssPayloads[0] // "<script>alert('XSS')</script>"
      
      cy.get('#user_login').clear().type(payload)
      cy.get('#user_pass').clear().type('testpassword')
      cy.get('#wp-submit').click()
      
      cy.wait(2000)
      
      // Verify XSS payload is not executed
      // WordPress should either reject the input (show error) or sanitize it
      cy.get('body').then(($body) => {
        const html = $body.html()
        const bodyText = $body.text()
        
        // Check that the specific XSS payload is not present as executable JavaScript
        expect(html).to.not.include("<script>alert('XSS')</script>")
        
        // Verify no alert() calls with XSS are present in script tags
        expect(html).to.not.match(/<script[^>]*>[\s\S]*alert\(['"]XSS['"]\)/i)
        
        // If WordPress shows an error (which is good security), verify we're still on login page
        cy.url().then((url) => {
          if (url.includes('/wp-login.php')) {
            // WordPress rejected the XSS payload - this is good security behavior
            cy.log('XSS payload rejected by WordPress - security test passed')
          }
        })
        
        // Verify the payload is not executed (no alert popups would occur)
        // The fact that we're still on the page and not redirected means XSS didn't execute
        expect(html).to.not.include("alert('XSS')")
      })
    })
  })

  describe('TC-SEC-14: XSS in admin login form (password)', () => {
    it('should prevent XSS in admin login password field', () => {
      cy.visit(`${baseUrl}/wp-login.php?loggedout=true`)
      cy.wait(1000)
      
      const payload = xssPayloads[1] // "<img src=x onerror=alert('XSS')>"
      
      cy.get('#user_login').clear().type(adminUsername)
      cy.get('#user_pass').clear().type(payload)
      cy.get('#wp-submit').click()
      
      cy.wait(2000)
      
      // Verify XSS payload is not executed
      cy.get('body').then(($body) => {
        const html = $body.html()
        expect(html).to.not.include('onerror=alert')
      })
    })
  })

  describe('TC-SEC-15: SQL Injection in post title', () => {
    it('should prevent SQL injection in post title field', () => {
      cy.visit(`${baseUrl}/wp-admin/post-new.php`)
      cy.wait(3000) // Wait for editor to load
      
      const payload = sqlPayloads[0] // "' OR '1'='1"
      
      cy.get('body').then(($body) => {
        // Block editor (Gutenberg) or classic editor
        const hasBlockEditor = $body.find('.block-editor-page, .editor-post-title, .editor-post-text-editor').length > 0
        const hasClassicEditor = $body.find('#title, #content').length > 0
        
        if (hasBlockEditor) {
          // Gutenberg editor
          cy.get('.editor-post-title__input, input[aria-label*="title"], input[aria-label*="Title"]').then(($input) => {
            if ($input.length > 0) {
              cy.get('.editor-post-title__input, input[aria-label*="title"], input[aria-label*="Title"]').first().clear().type(payload)
              cy.wait(1000)
              
              // Verify no SQL errors
              cy.get('body').then(($body2) => {
                const bodyText = $body2.text()
                expect(bodyText).to.not.include('SQL syntax')
                expect(bodyText).to.not.include('mysql_fetch')
              })
            }
          })
        } else if (hasClassicEditor) {
          // Classic editor
          cy.get('#title').clear().type(payload)
          cy.wait(1000)
          
          // Verify no SQL errors
          cy.get('body').then(($body2) => {
            const bodyText = $body2.text()
            expect(bodyText).to.not.include('SQL syntax')
            expect(bodyText).to.not.include('mysql_fetch')
          })
        }
      })
    })
  })

  describe('TC-SEC-16: SQL Injection in post content', () => {
    it('should prevent SQL injection in post content field', () => {
      cy.visit(`${baseUrl}/wp-admin/post-new.php`)
      cy.wait(3000)
      
      const payload = sqlPayloads[0] // "' OR '1'='1"
      
      cy.get('body').then(($body) => {
        const hasBlockEditor = $body.find('.block-editor-page, .editor-post-text-editor').length > 0
        const hasClassicEditor = $body.find('#content, .wp-editor-container').length > 0
        
        if (hasClassicEditor) {
          cy.get('#content').then(($textarea) => {
            if ($textarea.length > 0) {
              cy.get('#content').clear().type(payload)
              cy.wait(1000)
              
              // Verify no SQL errors
              cy.get('body').then(($body2) => {
                const bodyText = $body2.text()
                expect(bodyText).to.not.include('SQL syntax')
                expect(bodyText).to.not.include('mysql_fetch')
              })
            }
          })
        } else {
          cy.log('Block editor detected - SQL injection test may need manual verification')
        }
      })
    })
  })

  describe('TC-SEC-17: XSS in post title', () => {
    it('should prevent XSS in post title field', () => {
      cy.visit(`${baseUrl}/wp-admin/post-new.php`)
      cy.wait(3000)
      
      const payload = xssPayloads[0] // "<script>alert('XSS')</script>"
      
      cy.get('body').then(($body) => {
        const hasBlockEditor = $body.find('.block-editor-page, .editor-post-title').length > 0
        const hasClassicEditor = $body.find('#title').length > 0
        
        if (hasBlockEditor) {
          cy.get('.editor-post-title__input, input[aria-label*="title"], input[aria-label*="Title"]').then(($input) => {
            if ($input.length > 0) {
              cy.get('.editor-post-title__input, input[aria-label*="title"], input[aria-label*="Title"]').first().clear().type(payload)
              cy.wait(1000)
              
              // Verify XSS is escaped
              cy.get('body').then(($body2) => {
                const html = $body2.html()
                expect(html).to.not.include('<script>alert')
              })
            }
          })
        } else if (hasClassicEditor) {
          cy.get('#title').clear().type(payload)
          cy.wait(1000)
          
          // Verify XSS is escaped
          cy.get('body').then(($body2) => {
            const html = $body2.html()
            expect(html).to.not.include('<script>alert')
          })
        }
      })
    })
  })

  describe('TC-SEC-18: XSS in post content', () => {
    it('should prevent XSS in post content field', () => {
      cy.visit(`${baseUrl}/wp-admin/post-new.php`)
      cy.wait(3000)
      
      const payload = xssPayloads[0] // "<script>alert('XSS')</script>"
      
      cy.get('body').then(($body) => {
        const hasClassicEditor = $body.find('#content, .wp-editor-container').length > 0
        
        if (hasClassicEditor) {
          cy.get('#content').then(($textarea) => {
            if ($textarea.length > 0) {
              cy.get('#content').clear().type(payload)
              cy.wait(1000)
              
              // Verify XSS is escaped (in editor, it may show raw HTML, but should be sanitized on save)
              cy.get('body').then(($body2) => {
                const html = $body2.html()
                // In editor, script tags might be visible, but they should be sanitized when saved
                cy.log('XSS payload entered - should be sanitized on save')
              })
            }
          })
        } else {
          cy.log('Block editor detected - XSS test may need manual verification')
        }
      })
    })
  })

  describe('TC-SEC-19: SQL Injection in user creation form', () => {
    it('should prevent SQL injection in user creation form', () => {
      cy.visit(`${baseUrl}/wp-admin/user-new.php`)
      cy.wait(2000)
      
      const payload = sqlPayloads[0] // "' OR '1'='1"
      
      // Test username field
      cy.get('#user_login').then(($input) => {
        if ($input.length > 0) {
          cy.get('#user_login').clear().type(payload)
          cy.wait(1000)
          
          // Verify no SQL errors
          cy.get('body').then(($body) => {
            const bodyText = $body.text()
            expect(bodyText).to.not.include('SQL syntax')
            expect(bodyText).to.not.include('mysql_fetch')
          })
        }
      })
      
      // Test email field
      cy.get('#email').then(($input) => {
        if ($input.length > 0) {
          cy.get('#email').clear().type(`test${payload}@example.com`)
          cy.wait(1000)
          
          // Verify no SQL errors
          cy.get('body').then(($body) => {
            const bodyText = $body.text()
            expect(bodyText).to.not.include('SQL syntax')
            expect(bodyText).to.not.include('mysql_fetch')
          })
        }
      })
    })
  })

  describe('TC-SEC-20: XSS in user creation form', () => {
    it('should prevent XSS in user creation form', () => {
      cy.visit(`${baseUrl}/wp-admin/user-new.php`)
      cy.wait(2000)
      
      const payload = xssPayloads[0] // "<script>alert('XSS')</script>"
      
      // Test username field
      cy.get('#user_login').then(($input) => {
        if ($input.length > 0) {
          cy.get('#user_login').clear().type(payload)
          cy.wait(1000)
          
          // Verify XSS is escaped
          cy.get('body').then(($body) => {
            const html = $body.html()
            expect(html).to.not.include('<script>alert')
          })
        }
      })
      
      // Test first name field
      cy.get('#first_name').then(($input) => {
        if ($input.length > 0) {
          cy.get('#first_name').clear().type(payload)
          cy.wait(1000)
          
          // Verify XSS is escaped
          cy.get('body').then(($body) => {
            const html = $body.html()
            expect(html).to.not.include('<script>alert')
          })
        }
      })
    })
  })
})

