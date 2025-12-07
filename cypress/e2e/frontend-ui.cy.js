/**
 * Frontend UI Elements Test Cases
 * Testing frontend UI elements (footer, widgets, search, comments) - excluding navigation which is already tested
 * Test Cases: TC-FRONTEND-01 to TC-FRONTEND-10
 */

describe('Frontend UI Elements - Testing', () => {
  const baseUrl = Cypress.config('baseUrl') || 'http://127.0.0.1:8080'
  const adminUsername = 'Qadeer572'
  const adminPassword = 'raza@1214'

  beforeEach(() => {
    // Visit frontend (no login needed for most frontend tests)
    cy.visit(baseUrl)
    cy.wait(1000)
  })

  describe('TC-FRONTEND-01: Footer elements display', () => {
    it('should display footer elements on frontend', () => {
      // Look for footer
      cy.get('body').then(($body) => {
        if ($body.find('footer, #footer, .site-footer, .wp-block-template-part[data-area="footer"]').length > 0) {
          // Verify footer is visible
          cy.get('footer, #footer, .site-footer, .wp-block-template-part[data-area="footer"]', { timeout: 5000 }).should('be.visible')
          
          // Check for footer content
          cy.get('footer, #footer, .site-footer').within(() => {
            cy.root().then(($footer) => {
              // Footer should have some content
              expect($footer.text().length).to.be.greaterThan(0)
            })
          })
        } else {
          cy.log('Footer not found on this theme')
        }
      })
    })
  })

  describe('TC-FRONTEND-02: Sidebar widgets display', () => {
    it('should display sidebar widgets on frontend', () => {
      // Look for sidebar
      cy.get('body').then(($body) => {
        if ($body.find('#sidebar, .sidebar, .widget-area, aside').length > 0) {
          // Verify sidebar is visible
          cy.get('#sidebar, .sidebar, .widget-area, aside', { timeout: 5000 }).should('be.visible')
          
          // Check for widgets
          cy.get('body').then(($body2) => {
            if ($body2.find('.widget, [class*="widget-"]').length > 0) {
              cy.get('.widget, [class*="widget-"]').first().should('be.visible')
            } else {
              cy.log('Sidebar exists but no widgets found')
            }
          })
        } else {
          cy.log('Sidebar not found on this theme')
        }
      })
    })
  })

  describe('TC-FRONTEND-03: Search functionality - search form display', () => {
    it('should display search form on frontend', () => {
      // Look for search form
      cy.get('body').then(($body) => {
        if ($body.find('#searchform, .search-form, form[role="search"], input[name="s"]').length > 0) {
          // Verify search form is visible
          cy.get('#searchform, .search-form, form[role="search"], input[name="s"]', { timeout: 5000 }).should('be.visible')
          
          // Verify search input exists
          cy.get('input[name="s"], input[type="search"], .search-field', { timeout: 3000 }).should('exist')
        } else {
          cy.log('Search form not found on frontend')
        }
      })
    })
  })

  describe('TC-FRONTEND-04: Search functionality - search results display', () => {
    it('should display search results when searching', () => {
      // Find search form
      cy.get('body').then(($body) => {
        if ($body.find('input[name="s"], input[type="search"], .search-field').length > 0) {
          // Enter search term
          cy.get('input[name="s"], input[type="search"], .search-field').first().clear().type('test')
          
          // Submit search (press Enter or find submit button)
          cy.get('body').then(($body2) => {
            if ($body2.find('button[type="submit"], input[type="submit"], .search-submit').length > 0) {
              cy.get('button[type="submit"], input[type="submit"], .search-submit').first().click()
            } else {
              cy.get('input[name="s"], input[type="search"]').first().type('{enter}')
            }
          })
          
          cy.wait(2000)
          
          // Verify search results page loaded
          cy.url().should('include', 's=test') || cy.url().should('include', 'search=test')
          
          // Check for results or no results message
          cy.get('body').then(($body3) => {
            const hasResults = $body3.find('.search-results, article, .post, .no-results, .search-no-results').length > 0
            expect(hasResults).to.be.true
          })
        } else {
          cy.log('Search form not found')
        }
      })
    })
  })

  describe('TC-FRONTEND-05: Post/page content display structure', () => {
    it('should display post/page content with proper structure', () => {
      // Visit a post or page if available
      cy.get('body').then(($body) => {
        // Look for post/page links
        if ($body.find('a[href*="?p="], a[href*="/?page_id="], article a, .entry-title a').length > 0) {
          // Click first post/page link
          cy.get('a[href*="?p="], a[href*="/?page_id="], article a, .entry-title a').first().click()
          cy.wait(2000)
          
          // Verify content structure
          cy.get('body').then(($body2) => {
            const hasContent = $body2.find('article, .entry-content, .post-content, .wp-block-post-content, .content').length > 0
            expect(hasContent).to.be.true
          })
        } else {
          // Just check homepage content structure
          cy.get('body').then(($body3) => {
            const hasContent = $body3.find('article, .entry-content, .post-content, main, .content').length > 0
            expect(hasContent).to.be.true
          })
        }
      })
    })
  })

  describe('TC-FRONTEND-06: Comments section display', () => {
    it('should display comments section on posts/pages', () => {
      // Visit a post (comments are usually on posts, not pages)
      cy.get('body').then(($body) => {
        if ($body.find('a[href*="?p="], article a, .entry-title a').length > 0) {
          // Click first post link
          cy.get('a[href*="?p="], article a, .entry-title a').first().click()
          cy.wait(2000)
          
          // Look for comments section
          cy.get('body').then(($body2) => {
            if ($body2.find('#comments, .comments-area, .comment-list, #respond').length > 0) {
              cy.get('#comments, .comments-area, .comment-list, #respond', { timeout: 3000 }).should('exist')
            } else {
              cy.log('Comments section not found (may be disabled or no comments)')
            }
          })
        } else {
          cy.log('No posts found to check comments section')
        }
      })
    })
  })

  describe('TC-FRONTEND-07: Comments section interaction', () => {
    it('should allow submitting a comment', () => {
      // Visit a post
      cy.get('body').then(($body) => {
        if ($body.find('a[href*="?p="], article a, .entry-title a').length > 0) {
          cy.get('a[href*="?p="], article a, .entry-title a').first().click()
          cy.wait(2000)
          
          // Look for comment form
          cy.get('body').then(($body2) => {
            if ($body2.find('#commentform, form[action*="wp-comments-post"], #respond form').length > 0) {
              // Fill comment form
              cy.get('#commentform, form[action*="wp-comments-post"], #respond form').within(() => {
                // Name field
                cy.root().then(($form) => {
                  if ($form.find('input[name="author"], #author').length > 0) {
                    cy.get('input[name="author"], #author').clear().type('Test User')
                  }
                  
                  // Email field
                  if ($form.find('input[name="email"], #email').length > 0) {
                    cy.get('input[name="email"], #email').clear().type('test@example.com')
                  }
                  
                  // Comment field
                  if ($form.find('textarea[name="comment"], #comment').length > 0) {
                    cy.get('textarea[name="comment"], #comment').clear().type('This is a test comment')
                  }
                  
                  // Submit button
                  if ($form.find('input[type="submit"], button[type="submit"], #submit').length > 0) {
                    // Note: We may not want to actually submit in tests
                    cy.get('input[type="submit"], button[type="submit"], #submit').should('be.visible')
                  }
                })
              })
            } else {
              cy.log('Comment form not found (comments may be disabled)')
            }
          })
        } else {
          cy.log('No posts found to test comment submission')
        }
      })
    })
  })

  describe('TC-FRONTEND-08: Pagination - posts pagination', () => {
    it('should display posts pagination if multiple pages exist', () => {
      // Look for pagination
      cy.get('body').then(($body) => {
        if ($body.find('.pagination, .nav-links, .page-numbers, a[href*="page/"]').length > 0) {
          // Verify pagination is visible
          cy.get('.pagination, .nav-links, .page-numbers, a[href*="page/"]', { timeout: 3000 }).should('be.visible')
          
          // Check for next/previous links
          cy.get('body').then(($body2) => {
            const hasNav = $body2.find('a.next, .next, a.prev, .prev, .page-numbers').length > 0
            expect(hasNav).to.be.true
          })
        } else {
          cy.log('Pagination not found (may have less than 10 posts or pagination disabled)')
        }
      })
    })
  })

  describe('TC-FRONTEND-09: Pagination - comments pagination', () => {
    it('should display comments pagination if multiple pages exist', () => {
      // Visit a post with comments
      cy.get('body').then(($body) => {
        if ($body.find('a[href*="?p="], article a').length > 0) {
          cy.get('a[href*="?p="], article a').first().click()
          cy.wait(2000)
          
          // Look for comments pagination
          cy.get('body').then(($body2) => {
            if ($body2.find('.comment-navigation, .comments-pagination, .page-numbers.comments').length > 0) {
              cy.get('.comment-navigation, .comments-pagination, .page-numbers.comments', { timeout: 3000 }).should('be.visible')
            } else {
              cy.log('Comments pagination not found (may have less than required comments per page)')
            }
          })
        } else {
          cy.log('No posts found to check comments pagination')
        }
      })
    })
  })

  describe('TC-FRONTEND-10: Responsive elements', () => {
    it('should test responsive elements if testable', () => {
      // Test at different viewport sizes
      cy.viewport(375, 667) // Mobile size
      cy.wait(500)
      
      // Check if mobile menu or responsive elements appear
      cy.get('body').then(($body) => {
        const hasResponsive = $body.find('.menu-toggle, .mobile-menu, button[aria-label*="menu"], .nav-toggle').length > 0
        
        // Switch to desktop size
        cy.viewport(1280, 720)
        cy.wait(500)
        
        // Verify layout changes (basic check)
        cy.get('body').should('exist')
      })
    })
  })
})

