/**
 * Frontend Security Test Cases
 * Testing SQL Injection and XSS vulnerabilities on frontend
 * Test Cases: TC-SEC-01 to TC-SEC-10
 */

describe('Frontend Security Testing', () => {
  const baseUrl = Cypress.config('baseUrl') || 'http://127.0.0.1:8080'
  
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
    cy.visit(baseUrl)
    cy.wait(1000)
  })

  describe('TC-SEC-01: SQL Injection in search form', () => {
    it('should prevent SQL injection in search form', () => {
      cy.get('body').then(($body) => {
        if ($body.find('input[name="s"], input[type="search"], .search-field').length > 0) {
          const payload = sqlPayloads[0] // "' OR '1'='1"
          
          cy.get('input[name="s"], input[type="search"], .search-field').first().clear().type(payload)
          
          // Submit search
          cy.get('body').then(($body2) => {
            if ($body2.find('button[type="submit"], input[type="submit"], .search-submit').length > 0) {
              cy.get('button[type="submit"], input[type="submit"], .search-submit').first().click()
            } else {
              cy.get('input[name="s"], input[type="search"]').first().type('{enter}')
            }
          })
          
          cy.wait(2000)
          
          // Verify no SQL errors are displayed
          cy.get('body').then(($body3) => {
            const bodyText = $body3.text()
            // Check that SQL error messages are not present
            expect(bodyText).to.not.include('SQL syntax')
            expect(bodyText).to.not.include('mysql_fetch')
            expect(bodyText).to.not.include('Warning: mysql_')
            expect(bodyText).to.not.include('You have an error in your SQL syntax')
          })
          
          // Verify page still loads (not crashed)
          cy.url().should('include', baseUrl)
        } else {
          cy.log('Search form not found - skipping SQL injection test')
        }
      })
    })
  })

  describe('TC-SEC-02: SQL Injection in comment form (name field)', () => {
    it('should prevent SQL injection in comment name field', () => {
      // Visit a post/page with comments enabled
      cy.get('body').then(($body) => {
        if ($body.find('a[href*="?p="], article a, .entry-title a').length > 0) {
          cy.get('a[href*="?p="], article a, .entry-title a').first().click()
          cy.wait(2000)
          
          // Look for comment form
          cy.get('body').then(($body2) => {
            if ($body2.find('#commentform, form[action*="wp-comments-post"], #respond form').length > 0) {
              const payload = sqlPayloads[0] // "' OR '1'='1"
              
              cy.get('#commentform, form[action*="wp-comments-post"], #respond form').within(() => {
                cy.get('input[name="author"], #author').then(($input) => {
                  if ($input.length > 0) {
                    cy.get('input[name="author"], #author').clear().type(payload)
                  } else {
                    cy.log('Comment name field not found')
                  }
                })
              })
              
              // Exit .within() scope before accessing body
              cy.get('body').then(($body3) => {
                if ($body3.find('#commentform input[type="submit"], #commentform button[type="submit"], #commentform #submit, form[action*="wp-comments-post"] input[type="submit"], #respond input[type="submit"]').length > 0) {
                  cy.get('#commentform input[type="submit"], #commentform button[type="submit"], #commentform #submit, form[action*="wp-comments-post"] input[type="submit"], #respond input[type="submit"]').first().click({ force: true })
                  cy.wait(2000)
                  
                  // Verify no SQL errors
                  cy.get('body').then(($body4) => {
                    const bodyText = $body4.text()
                    expect(bodyText).to.not.include('SQL syntax')
                    expect(bodyText).to.not.include('mysql_fetch')
                  })
                }
              })
            } else {
              cy.log('Comment form not found - skipping SQL injection test')
            }
          })
        } else {
          cy.log('No posts found to test comment form')
        }
      })
    })
  })

  describe('TC-SEC-03: SQL Injection in comment form (email field)', () => {
    it('should prevent SQL injection in comment email field', () => {
      cy.get('body').then(($body) => {
        if ($body.find('a[href*="?p="], article a, .entry-title a').length > 0) {
          cy.get('a[href*="?p="], article a, .entry-title a').first().click()
          cy.wait(2000)
          
          cy.get('body').then(($body2) => {
            if ($body2.find('#commentform, form[action*="wp-comments-post"], #respond form').length > 0) {
              const payload = sqlPayloads[0] // "' OR '1'='1"
              
              cy.get('#commentform, form[action*="wp-comments-post"], #respond form').within(() => {
                cy.get('input[name="email"], #email').then(($input) => {
                  if ($input.length > 0) {
                    cy.get('input[name="email"], #email').clear().type(payload)
                  } else {
                    cy.log('Comment email field not found')
                  }
                })
              })
              
              // Exit .within() scope before accessing body
              cy.get('body').then(($body3) => {
                if ($body3.find('#commentform input[type="submit"], #commentform button[type="submit"], #commentform #submit, form[action*="wp-comments-post"] input[type="submit"], #respond input[type="submit"]').length > 0) {
                  cy.get('#commentform input[type="submit"], #commentform button[type="submit"], #commentform #submit, form[action*="wp-comments-post"] input[type="submit"], #respond input[type="submit"]').first().click({ force: true })
                  cy.wait(2000)
                  
                  // Verify no SQL errors
                  cy.get('body').then(($body4) => {
                    const bodyText = $body4.text()
                    expect(bodyText).to.not.include('SQL syntax')
                    expect(bodyText).to.not.include('mysql_fetch')
                  })
                }
              })
            } else {
              cy.log('Comment form not found')
            }
          })
        } else {
          cy.log('No posts found')
        }
      })
    })
  })

  describe('TC-SEC-04: SQL Injection in comment form (comment field)', () => {
    it('should prevent SQL injection in comment text field', () => {
      cy.get('body').then(($body) => {
        if ($body.find('a[href*="?p="], article a, .entry-title a').length > 0) {
          cy.get('a[href*="?p="], article a, .entry-title a').first().click()
          cy.wait(2000)
          
          cy.get('body').then(($body2) => {
            if ($body2.find('#commentform, form[action*="wp-comments-post"], #respond form').length > 0) {
              const payload = sqlPayloads[0] // "' OR '1'='1"
              
              cy.get('#commentform, form[action*="wp-comments-post"], #respond form').within(() => {
                cy.get('textarea[name="comment"], #comment').then(($textarea) => {
                  if ($textarea.length > 0) {
                    cy.get('textarea[name="comment"], #comment').clear().type(payload)
                  } else {
                    cy.log('Comment textarea not found')
                  }
                })
              })
              
              // Exit .within() scope before accessing body
              cy.get('body').then(($body3) => {
                if ($body3.find('#commentform input[type="submit"], #commentform button[type="submit"], #commentform #submit, form[action*="wp-comments-post"] input[type="submit"], #respond input[type="submit"]').length > 0) {
                  cy.get('#commentform input[type="submit"], #commentform button[type="submit"], #commentform #submit, form[action*="wp-comments-post"] input[type="submit"], #respond input[type="submit"]').first().click({ force: true })
                  cy.wait(2000)
                  
                  // Verify no SQL errors
                  cy.get('body').then(($body4) => {
                    const bodyText = $body4.text()
                    expect(bodyText).to.not.include('SQL syntax')
                    expect(bodyText).to.not.include('mysql_fetch')
                  })
                }
              })
            } else {
              cy.log('Comment form not found')
            }
          })
        } else {
          cy.log('No posts found')
        }
      })
    })
  })

  describe('TC-SEC-05: XSS in search form', () => {
    it('should prevent XSS in search form', () => {
      cy.get('body').then(($body) => {
        if ($body.find('input[name="s"], input[type="search"], .search-field').length > 0) {
          const payload = xssPayloads[0] // "<script>alert('XSS')</script>"
          
          cy.get('input[name="s"], input[type="search"], .search-field').first().clear().type(payload)
          
          cy.get('body').then(($body2) => {
            if ($body2.find('button[type="submit"], input[type="submit"], .search-submit').length > 0) {
              cy.get('button[type="submit"], input[type="submit"], .search-submit').first().click()
            } else {
              cy.get('input[name="s"], input[type="search"]').first().type('{enter}')
            }
          })
          
          cy.wait(2000)
          
          // Verify XSS payload is escaped/not executed
          cy.get('body').then(($body3) => {
            const html = $body3.html()
            // Check that script tags are escaped or removed
            expect(html).to.not.include('<script>alert')
            // Check that the payload appears escaped if displayed
            if (html.includes('script')) {
              expect(html).to.include('&lt;script') // HTML entity encoded
            }
          })
        } else {
          cy.log('Search form not found - skipping XSS test')
        }
      })
    })
  })

  describe('TC-SEC-06: XSS in comment form (name field)', () => {
    it('should prevent XSS in comment name field', () => {
      cy.get('body').then(($body) => {
        if ($body.find('a[href*="?p="], article a, .entry-title a').length > 0) {
          cy.get('a[href*="?p="], article a, .entry-title a').first().click()
          cy.wait(2000)
          
          cy.get('body').then(($body2) => {
            if ($body2.find('#commentform, form[action*="wp-comments-post"], #respond form').length > 0) {
              const payload = xssPayloads[0] // "<script>alert('XSS')</script>"
              
              cy.get('#commentform, form[action*="wp-comments-post"], #respond form').within(() => {
                cy.get('input[name="author"], #author').then(($input) => {
                  if ($input.length > 0) {
                    cy.get('input[name="author"], #author').clear().type(payload)
                  } else {
                    cy.log('Comment name field not found')
                  }
                })
              })
              
              // Exit .within() scope before accessing body
              cy.get('body').then(($body3) => {
                if ($body3.find('#commentform input[type="submit"], #commentform button[type="submit"], #commentform #submit, form[action*="wp-comments-post"] input[type="submit"], #respond input[type="submit"]').length > 0) {
                  cy.get('#commentform input[type="submit"], #commentform button[type="submit"], #commentform #submit, form[action*="wp-comments-post"] input[type="submit"], #respond input[type="submit"]').first().click({ force: true })
                  cy.wait(2000)
                  
                  // Verify XSS is escaped
                  cy.get('body').then(($body4) => {
                    const html = $body4.html()
                    expect(html).to.not.include("<script>alert('XSS')</script>")
                    expect(html).to.not.match(/<script[^>]*>[\s\S]*alert\(['"]XSS['"]\)/i)
                  })
                }
              })
            } else {
              cy.log('Comment form not found')
            }
          })
        } else {
          cy.log('No posts found')
        }
      })
    })
  })

  describe('TC-SEC-07: XSS in comment form (email field)', () => {
    it('should prevent XSS in comment email field', () => {
      cy.get('body').then(($body) => {
        if ($body.find('a[href*="?p="], article a, .entry-title a').length > 0) {
          cy.get('a[href*="?p="], article a, .entry-title a').first().click()
          cy.wait(2000)
          
          cy.get('body').then(($body2) => {
            if ($body2.find('#commentform, form[action*="wp-comments-post"], #respond form').length > 0) {
              const payload = xssPayloads[1] // "<img src=x onerror=alert('XSS')>"
              
              cy.get('#commentform, form[action*="wp-comments-post"], #respond form').within(() => {
                cy.get('input[name="email"], #email').then(($input) => {
                  if ($input.length > 0) {
                    cy.get('input[name="email"], #email').clear().type(payload)
                  } else {
                    cy.log('Comment email field not found')
                  }
                })
              })
              
              // Exit .within() scope before accessing body
              cy.get('body').then(($body3) => {
                if ($body3.find('#commentform input[type="submit"], #commentform button[type="submit"], #commentform #submit, form[action*="wp-comments-post"] input[type="submit"], #respond input[type="submit"]').length > 0) {
                  cy.get('#commentform input[type="submit"], #commentform button[type="submit"], #commentform #submit, form[action*="wp-comments-post"] input[type="submit"], #respond input[type="submit"]').first().click({ force: true })
                  cy.wait(2000)
                  
                  // Verify XSS is escaped
                  cy.get('body').then(($body4) => {
                    const html = $body4.html()
                    expect(html).to.not.include('onerror=alert')
                    expect(html).to.not.include("<img src=x onerror=alert('XSS')>")
                  })
                }
              })
            } else {
              cy.log('Comment form not found')
            }
          })
        } else {
          cy.log('No posts found')
        }
      })
    })
  })

  describe('TC-SEC-08: XSS in comment form (comment field)', () => {
    it('should prevent XSS in comment text field', () => {
      cy.get('body').then(($body) => {
        if ($body.find('a[href*="?p="], article a, .entry-title a').length > 0) {
          cy.get('a[href*="?p="], article a, .entry-title a').first().click()
          cy.wait(2000)
          
          cy.get('body').then(($body2) => {
            if ($body2.find('#commentform, form[action*="wp-comments-post"], #respond form').length > 0) {
              const payload = xssPayloads[0] // "<script>alert('XSS')</script>"
              
              cy.get('#commentform, form[action*="wp-comments-post"], #respond form').within(() => {
                cy.get('textarea[name="comment"], #comment').then(($textarea) => {
                  if ($textarea.length > 0) {
                    cy.get('textarea[name="comment"], #comment').clear().type(payload)
                  } else {
                    cy.log('Comment textarea not found')
                  }
                })
              })
              
              // Exit .within() scope before accessing body
              cy.get('body').then(($body3) => {
                if ($body3.find('#commentform input[type="submit"], #commentform button[type="submit"], #commentform #submit, form[action*="wp-comments-post"] input[type="submit"], #respond input[type="submit"]').length > 0) {
                  cy.get('#commentform input[type="submit"], #commentform button[type="submit"], #commentform #submit, form[action*="wp-comments-post"] input[type="submit"], #respond input[type="submit"]').first().click({ force: true })
                  cy.wait(2000)
                  
                  // Verify XSS is escaped
                  cy.get('body').then(($body4) => {
                    const html = $body4.html()
                    expect(html).to.not.include("<script>alert('XSS')</script>")
                    expect(html).to.not.match(/<script[^>]*>[\s\S]*alert\(['"]XSS['"]\)/i)
                  })
                }
              })
            } else {
              cy.log('Comment form not found')
            }
          })
        } else {
          cy.log('No posts found')
        }
      })
    })
  })

  describe('TC-SEC-09: XSS in URL parameters', () => {
    it('should prevent XSS in URL parameters', () => {
      const payload = encodeURIComponent(xssPayloads[0]) // "<script>alert('XSS')</script>"
      const testUrl = `${baseUrl}/?test=${payload}`
      
      cy.visit(testUrl)
      cy.wait(2000)
      
      // Verify XSS payload is not executed
      cy.get('body').then(($body) => {
        const html = $body.html()
        const bodyText = $body.text()
        
        // Check that the specific XSS payload is not present as executable code
        expect(html).to.not.include("<script>alert('XSS')</script>")
        
        // Verify no alert() calls with XSS are present in script tags
        expect(html).to.not.match(/<script[^>]*>[\s\S]*alert\(['"]XSS['"]\)/i)
        
        // Verify the payload is not in plain text (should be sanitized/removed)
        expect(bodyText).to.not.include("alert('XSS')")
        
        // If WordPress shows the parameter value, it should be escaped
        // But WordPress typically doesn't display URL parameters directly, so this is just a safety check
      })
    })
  })

  describe('TC-SEC-10: SQL Injection in URL parameters', () => {
    it('should prevent SQL injection in URL parameters', () => {
      const payload = encodeURIComponent(sqlPayloads[0]) // "' OR '1'='1"
      const testUrl = `${baseUrl}/?id=${payload}`
      
      cy.visit(testUrl)
      cy.wait(2000)
      
      // Verify no SQL errors are displayed
      cy.get('body').then(($body) => {
        const bodyText = $body.text()
        expect(bodyText).to.not.include('SQL syntax')
        expect(bodyText).to.not.include('mysql_fetch')
        expect(bodyText).to.not.include('Warning: mysql_')
        expect(bodyText).to.not.include('You have an error in your SQL syntax')
      })
      
      // Verify page still loads
      cy.url().should('include', baseUrl)
    })
  })
})

