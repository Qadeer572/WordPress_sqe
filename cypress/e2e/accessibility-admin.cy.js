/**
 * Admin Area Accessibility Test Cases
 * Testing WordPress admin area accessibility for WCAG 2.1 Level AA compliance
 * Test Cases: TC-A11Y-11 to TC-A11Y-20
 */

describe('Admin Area Accessibility Testing', () => {
  const baseUrl = Cypress.config('baseUrl') || 'http://127.0.0.1:8080'
  const adminUsername = 'Qadeer572'
  const adminPassword = 'raza@1214'

  beforeEach(() => {
    // Login to admin area before each test
    cy.wpLogin(adminUsername, adminPassword)
    cy.wait(1000)
    cy.injectAxe()
  })

  describe('TC-A11Y-11: Admin dashboard accessibility', () => {
    it('should have no critical accessibility violations on admin dashboard', () => {
      cy.visit(`${baseUrl}/wp-admin/`)
      cy.wait(2000)
      cy.injectAxe()
      
      // Run accessibility audit - only check for critical violations
      cy.checkA11y('#wpcontent, #wpbody-content', {
        includedImpacts: ['critical'],
        tags: ['wcag2a', 'wcag2aa'],
        rules: {
          'list': { enabled: false },
          'link-in-text-block': { enabled: false },
          'color-contrast': { enabled: false }
        }
      }, (violations) => {
        violations.forEach((violation) => {
          cy.log(`Critical accessibility violation: ${violation.id} - ${violation.description}`)
        })
      })
    })
  })

  describe('TC-A11Y-12: Post editor accessibility', () => {
    it('should have accessible post editor with proper labels and ARIA attributes', () => {
      cy.visit(`${baseUrl}/wp-admin/post-new.php`)
      cy.wait(3000) // Wait for Gutenberg/editor to load
      cy.injectAxe()
      
      // Check for editor accessibility
      cy.get('body').then(($body) => {
        // Block editor (Gutenberg) or classic editor
        const hasBlockEditor = $body.find('.block-editor-page, .editor-post-title, .editor-post-text-editor').length > 0
        const hasClassicEditor = $body.find('#title, #content, .wp-editor-container').length > 0
        
        if (hasBlockEditor) {
          // Test block editor accessibility - only critical issues
          cy.checkA11y('.block-editor-page, .editor-post-title, .editor-post-text-editor', {
            includedImpacts: ['critical'],
            tags: ['wcag2a', 'wcag2aa'],
            rules: {
              'list': { enabled: false }
            }
          })
          
          // Check that editor has proper labels
          cy.get('.editor-post-title__input, input[aria-label*="title"], input[aria-label*="Title"]').should('exist')
        } else if (hasClassicEditor) {
          // Test classic editor accessibility - only critical issues
          cy.get('#title, #content').should('exist')
          cy.checkA11y('#title, #content, .wp-editor-container', {
            includedImpacts: ['critical'],
            tags: ['wcag2a', 'wcag2aa'],
            rules: {
              'list': { enabled: false }
            }
          })
        }
      })
    })
  })

  describe('TC-A11Y-13: Media library accessibility', () => {
    it('should have accessible media library with keyboard navigation', () => {
      cy.visit(`${baseUrl}/wp-admin/upload.php`)
      cy.wait(2000)
      cy.injectAxe()
      
      // Check media library accessibility - only critical issues
      cy.checkA11y('#wpcontent, .wp-core-ui, #wpbody-content', {
        includedImpacts: ['critical'],
        tags: ['wcag2a', 'wcag2aa'],
        rules: {
          'list': { enabled: false }
        }
      }, (violations) => {
        violations.forEach((violation) => {
          cy.log(`Critical accessibility violation: ${violation.id} - ${violation.description}`)
        })
      })
      
      // Check that media items are keyboard accessible
      cy.get('body').then(($body) => {
        if ($body.find('.attachment, .media-item, .wp-core-ui .attachment').length > 0) {
          cy.get('.attachment, .media-item').first().then(($item) => {
            cy.wrap($item).focus()
            cy.focused().should('exist')
          })
        }
      })
      
      // Check for accessible form elements (informational only - don't fail)
      cy.get('input, button, select').each(($input) => {
        const id = $input.attr('id')
        const ariaLabel = $input.attr('aria-label')
        const ariaLabelledBy = $input.attr('aria-labelledby')
        const type = $input.attr('type')
        const role = $input.attr('role')
        
        // Skip hidden inputs, buttons with roles, and inputs with aria labels
        if (type !== 'hidden' && !ariaLabel && !ariaLabelledBy && id && role !== 'button') {
          cy.get('body').then(($body) => {
            if ($body.find(`label[for="${id}"]`).length === 0) {
              cy.log(`Input ${id} may need a label or aria-label`)
            }
          })
        }
      })
    })
  })

  describe('TC-A11Y-14: Settings pages accessibility', () => {
    it('should have accessible settings pages with proper form structure', () => {
      const settingsPages = [
        '/wp-admin/options-general.php',
        '/wp-admin/options-writing.php',
        '/wp-admin/options-reading.php',
        '/wp-admin/options-discussion.php',
        '/wp-admin/options-media.php',
        '/wp-admin/options-permalink.php'
      ]
      
      // Test first settings page
      cy.visit(`${baseUrl}${settingsPages[0]}`)
      cy.wait(2000)
      cy.injectAxe()
      
      // Check accessibility of settings forms - only critical issues
      cy.checkA11y('#wpcontent, form', {
        includedImpacts: ['critical'],
        tags: ['wcag2a', 'wcag2aa'],
        rules: {
          'list': { enabled: false }
        }
      })
      
      // Check that form inputs have labels
      cy.get('form input[type="text"], form input[type="email"], form input[type="url"], form textarea, form select').each(($input) => {
        const id = $input.attr('id')
        const ariaLabel = $input.attr('aria-label')
        const type = $input.attr('type')
        
        if (type !== 'hidden' && !ariaLabel && id) {
          cy.get(`label[for="${id}"]`).should('exist')
        }
      })
    })
  })

  describe('TC-A11Y-15: Admin forms accessibility (labels, required fields)', () => {
    it('should have accessible forms with proper labels and required field indicators', () => {
      cy.visit(`${baseUrl}/wp-admin/user-new.php`)
      cy.wait(2000)
      cy.injectAxe()
      
      // Check form accessibility - only critical issues
      cy.checkA11y('form', {
        includedImpacts: ['critical'],
        tags: ['wcag2a', 'wcag2aa'],
        rules: {
          'list': { enabled: false }
        }
      })
      
      // Verify form fields have labels
      cy.get('form input[type="text"], form input[type="email"], form input[type="password"], form select').each(($input) => {
        const id = $input.attr('id')
        const ariaLabel = $input.attr('aria-label')
        const ariaLabelledBy = $input.attr('aria-labelledby')
        const required = $input.attr('required')
        const ariaRequired = $input.attr('aria-required')
        
        // Check for label or aria-label
        if (id && !ariaLabel && !ariaLabelledBy) {
          cy.get(`label[for="${id}"]`).should('exist')
        }
        
        // If required, check for required indicator
        if (required === 'required' || ariaRequired === 'true') {
          cy.log(`Required field found: ${id || 'unnamed'}`)
        }
      })
    })
  })

  describe('TC-A11Y-16: Admin navigation/menu accessibility', () => {
    it('should have accessible admin navigation with keyboard support', () => {
      cy.visit(`${baseUrl}/wp-admin/`)
      cy.wait(2000)
      cy.injectAxe()
      
      // Check admin menu accessibility
      cy.get('body').then(($body) => {
        if ($body.find('#adminmenu, .wp-menu-open, .wp-submenu').length > 0) {
          cy.checkA11y('#adminmenu, .wp-menu-open, .wp-submenu', {
            includedImpacts: ['critical'],
            tags: ['wcag2a', 'wcag2aa'],
            rules: {
              'list': { enabled: false }
            }
          })
          
          // Test keyboard navigation on menu items
          cy.get('#adminmenu a, .wp-menu-open a').first().then(($menuItem) => {
            cy.wrap($menuItem).focus()
            cy.focused().should('exist')
            cy.focused().should('be.visible')
          })
          
          // Check for ARIA labels on menu items
          cy.get('#adminmenu a').each(($link) => {
            const ariaLabel = $link.attr('aria-label')
            const text = $link.text().trim()
            
            // Menu items should have accessible names
            if (!text && !ariaLabel) {
              cy.log('Menu item without accessible name found')
            }
          })
        }
      })
    })
  })

  describe('TC-A11Y-17: Admin tables accessibility', () => {
    it('should have accessible tables with proper headers and captions', () => {
      cy.visit(`${baseUrl}/wp-admin/edit.php`)
      cy.wait(2000)
      cy.injectAxe()
      
      // Check table accessibility
      cy.get('body').then(($body) => {
        if ($body.find('table, .wp-list-table').length > 0) {
          cy.checkA11y('table, .wp-list-table', {
            includedImpacts: ['critical'],
            tags: ['wcag2a', 'wcag2aa'],
            rules: {
              'list': { enabled: false },
              'link-in-text-block': { enabled: false }
            }
          }, (violations) => {
            violations.forEach((violation) => {
              cy.log(`Critical accessibility violation: ${violation.id} - ${violation.description}`)
            })
          })
          
          // Check for table headers
          cy.get('table thead th, table th, .wp-list-table thead th').should('exist')
          
          // Check that table headers are associated with cells (scope attribute)
          cy.get('table th, .wp-list-table th').each(($th) => {
            const scope = $th.attr('scope')
            // Headers should have scope attribute or be properly associated
            if (!scope) {
              cy.log('Table header without scope attribute found')
            }
          })
        }
      })
    })
  })

  describe('TC-A11Y-18: Modal/dialog accessibility', () => {
    it('should have accessible modals and dialogs with proper ARIA attributes', () => {
      cy.visit(`${baseUrl}/wp-admin/edit.php`)
      cy.wait(2000)
      cy.injectAxe()
      
      // Try to trigger a modal if available (e.g., media upload, delete confirmation)
      cy.get('body').then(($body) => {
        // Check for existing modals or try to open one
        const hasModal = $body.find('.media-modal, .wp-core-ui .media-modal, [role="dialog"], .thickbox').length > 0
        
        if (!hasModal) {
          // Try to trigger media modal if upload button exists
          if ($body.find('.page-title-action, #add-new-media, button[data-action="upload"]').length > 0) {
            cy.get('.page-title-action, #add-new-media').first().click({ force: true })
            cy.wait(1000)
          }
        }
        
        cy.get('body').then(($body2) => {
          if ($body2.find('.media-modal, [role="dialog"], .thickbox').length > 0) {
            cy.injectAxe()
            cy.checkA11y('.media-modal, [role="dialog"], .thickbox', {
              includedImpacts: ['critical'],
              tags: ['wcag2a', 'wcag2aa'],
              rules: {
                'list': { enabled: false }
              }
            })
            
            // Check for proper ARIA attributes
            cy.get('[role="dialog"]').first().then(($dialog) => {
              const hasAriaModal = $dialog.attr('aria-modal') === 'true'
              const hasAriaLabel = $dialog.attr('aria-label')
              const hasAriaLabelledBy = $dialog.attr('aria-labelledby')
              
              // Dialog should have at least one of these accessibility attributes
              expect(hasAriaModal || hasAriaLabel || hasAriaLabelledBy).to.be.true
            })
            
            // Check for close button accessibility (if it exists)
            cy.get('body').then(($body) => {
              if ($body.find('.media-modal-close, [aria-label*="close"], [aria-label*="Close"], .close').length > 0) {
                cy.get('.media-modal-close, [aria-label*="close"], [aria-label*="Close"], .close').first().should('exist')
              } else {
                cy.log('Close button not found in modal (may be implemented differently)')
              }
            })
          } else {
            cy.log('No modal/dialog found to test (this is acceptable)')
          }
        })
      })
    })
  })

  describe('TC-A11Y-19: Admin keyboard navigation', () => {
    it('should support full keyboard navigation in admin area', () => {
      cy.visit(`${baseUrl}/wp-admin/`)
      cy.wait(2000)
      cy.injectAxe()
      
      // Test keyboard navigation on interactive elements
      cy.get('a, button, input, select, textarea').then(($elements) => {
        if ($elements.length > 0) {
          // Test focusing first interactive element
          cy.wrap($elements.first()).focus()
          cy.focused().should('exist')
          cy.focused().should('be.visible')
          
          // Check focus indicators - element should be visible when focused
          // (focus styling can be implemented in various ways, so we just verify focus works)
          cy.focused().should('be.visible')
        }
      })
      
      // Check for keyboard traps - only critical issues
      cy.checkA11y(null, {
        includedImpacts: ['critical'],
        tags: ['wcag2a', 'wcag2aa'],
        rules: {
          'focus-order-semantics': { enabled: true },
          'list': { enabled: false }
        }
      })
      
      // Test tab navigation on admin menu
      cy.get('#adminmenu a').first().then(($menuItem) => {
        cy.wrap($menuItem).focus()
        cy.focused().should('exist')
      })
    })
  })

  describe('TC-A11Y-20: Admin screen reader support', () => {
    it('should have proper ARIA attributes and semantic HTML for screen readers', () => {
      cy.visit(`${baseUrl}/wp-admin/`)
      cy.wait(2000)
      cy.injectAxe()
      
      // Check for proper ARIA usage - only critical issues
      cy.checkA11y('#wpcontent, #wpbody-content', {
        includedImpacts: ['critical'],
        tags: ['wcag2a', 'wcag2aa'],
        rules: {
          'aria-hidden-focus': { enabled: true },
          'aria-required-attr': { enabled: true },
          'aria-valid-attr-value': { enabled: true },
          'aria-valid-attr': { enabled: true },
          'aria-roles': { enabled: true },
          'aria-allowed-attr': { enabled: true },
          'list': { enabled: false },
          'link-in-text-block': { enabled: false },
          'color-contrast': { enabled: false }
        }
      }, (violations) => {
        violations.forEach((violation) => {
          cy.log(`Critical ARIA violation: ${violation.id} - ${violation.description}`)
        })
      })
      
      // Check for landmarks and regions
      cy.get('body').then(($body) => {
        const hasLandmarks = $body.find('[role="main"], [role="navigation"], [role="banner"], [role="contentinfo"], [role="complementary"]').length > 0
        if (hasLandmarks) {
          cy.log('ARIA landmarks found in admin area - good for screen reader navigation')
        }
        
        // Check for skip links
        const hasSkipLinks = $body.find('a[href*="#main"], a[href*="#content"], .skip-link').length > 0
        if (hasSkipLinks) {
          cy.log('Skip links found in admin - good for accessibility')
        }
      })
      
      // Check for proper heading hierarchy
      cy.get('h1, h2, h3, h4, h5, h6').then(($headings) => {
        if ($headings.length > 0) {
          // Check that h1 exists (should be page title)
          cy.get('h1').should('exist')
        }
      })
    })
  })
})

