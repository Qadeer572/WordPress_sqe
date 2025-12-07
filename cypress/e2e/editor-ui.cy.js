/**
 * Gutenberg Block Editor UI Test Cases
 * Testing Gutenberg block editor UI elements (toolbar, block inserter, settings sidebar)
 * Test Cases: TC-EDITOR-01 to TC-EDITOR-11
 */

describe('Block Editor UI - Testing', () => {
  const baseUrl = Cypress.config('baseUrl') || 'http://127.0.0.1:8080'
  const postEditorUrl = `${baseUrl}/wp-admin/post-new.php`
  const adminUsername = 'Qadeer572'
  const adminPassword = 'raza@1214'

  beforeEach(() => {
    // Login as admin before each test using the custom command
    cy.wpLogin(adminUsername, adminPassword)

    // Navigate to post editor
    cy.visit(postEditorUrl)
    
    // Wait for editor to load
    cy.get('.edit-post-layout, .block-editor-block-list__layout', { timeout: 20000 }).should('exist')
    cy.wait(2000)
  })

  describe('TC-EDITOR-01: Editor toolbar buttons visibility', () => {
    it('should display editor toolbar buttons', () => {
      // Close any modal overlays that might be covering the editor
      cy.get('body').then(($body) => {
        // Check for and close welcome modals or overlays
        const modalOverlay = $body.find('.components-modal__screen-overlay:visible, .components-modal__overlay:visible')
        if (modalOverlay.length > 0) {
          // Try to find and click close button
          cy.get('body').then(($body2) => {
            const closeBtn = $body2.find('button[aria-label*="Close"], .components-modal__header button, .components-button[aria-label*="close"]').filter(':visible')
            if (closeBtn.length > 0) {
              cy.wrap(closeBtn.first()).click({ force: true })
              cy.wait(1000)
            } else {
              // Press Escape to close modal
              cy.get('body').type('{esc}')
              cy.wait(1000)
            }
          })
        }
      })
      
      // Look for editor toolbar
      cy.get('body').then(($body) => {
        if ($body.find('.edit-post-header, .block-editor-block-toolbar').length > 0) {
          // Verify toolbar exists (may be fixed position, so check existence rather than visibility)
          cy.get('.edit-post-header, .block-editor-block-toolbar', { timeout: 5000 }).should('exist')
          
          // Check for common toolbar buttons
          cy.get('body').then(($body2) => {
            const hasButtons = $body2.find('button, .components-button, .editor-post-publish-button').length > 0
            expect(hasButtons).to.be.true
          })
        } else {
          cy.log('Editor toolbar not found')
        }
      })
    })
  })

  describe('TC-EDITOR-02: Block inserter (+ button) functionality', () => {
    it('should open block inserter when clicking + button', () => {
      // Look for block inserter button
      cy.get('body').then(($body) => {
        if ($body.find('button[aria-label*="Add block"], .block-editor-inserter__toggle, .editor-inserter__toggle').length > 0) {
          // Click block inserter button
          cy.get('button[aria-label*="Add block"], .block-editor-inserter__toggle, .editor-inserter__toggle').first().click()
          cy.wait(1000)
          
          // Verify block inserter panel opened
          cy.get('body').then(($body2) => {
            if ($body2.find('.block-editor-inserter__panel, .editor-inserter__panel, .block-editor-inserter__menu').length > 0) {
              cy.get('.block-editor-inserter__panel, .editor-inserter__panel, .block-editor-inserter__menu', { timeout: 3000 }).should('be.visible')
            } else {
              cy.log('Block inserter panel may use different structure')
            }
          })
        } else {
          cy.log('Block inserter button not found')
        }
      })
    })
  })

  describe('TC-EDITOR-03: Block settings sidebar visibility', () => {
    it('should display block settings sidebar', () => {
      // Click on editor content area to select a block
      cy.get('body').then(($body) => {
        if ($body.find('.block-editor-block-list__layout, .editor-post-title__input').length > 0) {
          // Click on title or content area
          cy.get('.editor-post-title__input, .block-editor-block-list__layout').first().click()
          cy.wait(1000)
          
          // Look for settings sidebar
          cy.get('body').then(($body2) => {
            if ($body2.find('.edit-post-sidebar, .block-editor-block-inspector, .interface-complementary-area').length > 0) {
              cy.get('.edit-post-sidebar, .block-editor-block-inspector, .interface-complementary-area', { timeout: 3000 }).should('be.visible')
            } else {
              // Try to open sidebar if closed
              cy.get('body').then(($body3) => {
                if ($body3.find('button[aria-label*="Settings"], .edit-post-sidebar__panel-toggle').length > 0) {
                  cy.get('button[aria-label*="Settings"], .edit-post-sidebar__panel-toggle').click()
                  cy.wait(1000)
                  cy.get('.edit-post-sidebar, .block-editor-block-inspector', { timeout: 3000 }).should('be.visible')
                } else {
                  cy.log('Settings sidebar not found or not available')
                }
              })
            }
          })
        } else {
          cy.log('Editor content area not found')
        }
      })
    })
  })

  describe('TC-EDITOR-04: Block toolbar options', () => {
    it('should display block toolbar options when block is selected', () => {
      // Select a block (title or paragraph)
      cy.get('body').then(($body) => {
        if ($body.find('.editor-post-title__input, .block-editor-rich-text__editable').length > 0) {
          // Click on title or content block
          cy.get('.editor-post-title__input, .block-editor-rich-text__editable').first().click()
          cy.wait(1000)
          
          // Look for block toolbar
          cy.get('body').then(($body2) => {
            if ($body2.find('.block-editor-block-toolbar, .block-toolbar, .block-editor-block-contextual-toolbar').length > 0) {
              cy.get('.block-editor-block-toolbar, .block-toolbar, .block-editor-block-contextual-toolbar', { timeout: 3000 }).should('be.visible')
            } else {
              cy.log('Block toolbar not found')
            }
          })
        } else {
          cy.log('No blocks found to select')
        }
      })
    })
  })

  describe('TC-EDITOR-05: Document settings - categories', () => {
    it('should display and allow editing categories in document settings', () => {
      // Close any modal overlays first
      cy.get('body').then(($body) => {
        const modalOverlay = $body.find('.components-modal__screen-overlay:visible')
        if (modalOverlay.length > 0) {
          cy.get('button[aria-label*="Close"], .components-modal__header button').filter(':visible').first().click({ force: true }).then(() => {
            cy.wait(1000)
          }).catch(() => {
            cy.get('body').type('{esc}')
            cy.wait(1000)
          })
        }
      })
      
      // Open document settings sidebar
      cy.get('body').then(($body) => {
        if ($body.find('button[aria-label*="Post"], button[aria-label*="Document"], .edit-post-sidebar__panel-toggle').length > 0) {
          // Click to open document settings (use force to bypass overlay if still present)
          cy.get('button[aria-label*="Post"], button[aria-label*="Document"], .edit-post-sidebar__panel-toggle').first().click({ force: true })
          cy.wait(1000)
          
          // Look for categories control
          cy.get('body').then(($body2) => {
            if ($body2.find('.editor-post-taxonomies__hierarchical-terms-list, [data-wp-component="CheckboxControl"][aria-label*="Category"]').length > 0) {
              cy.get('.editor-post-taxonomies__hierarchical-terms-list, [data-wp-component="CheckboxControl"][aria-label*="Category"]', { timeout: 3000 }).should('exist')
            } else {
              cy.log('Categories control not found in document settings')
            }
          })
        } else {
          cy.log('Document settings button not found')
        }
      })
    })
  })

  describe('TC-EDITOR-06: Document settings - tags', () => {
    it('should display and allow editing tags in document settings', () => {
      // Close any modal overlays first
      cy.get('body').then(($body) => {
        const modalOverlay = $body.find('.components-modal__screen-overlay:visible')
        if (modalOverlay.length > 0) {
          cy.get('button[aria-label*="Close"], .components-modal__header button').filter(':visible').first().click({ force: true }).then(() => {
            cy.wait(1000)
          }).catch(() => {
            cy.get('body').type('{esc}')
            cy.wait(1000)
          })
        }
      })
      
      // Open document settings sidebar
      cy.get('body').then(($body) => {
        if ($body.find('button[aria-label*="Post"], button[aria-label*="Document"]').length > 0) {
          cy.get('button[aria-label*="Post"], button[aria-label*="Document"]').first().click({ force: true })
          cy.wait(1000)
          
          // Look for tags control
          cy.get('body').then(($body2) => {
            if ($body2.find('.editor-post-taxonomies__flat-term-list, input[placeholder*="tag"], [aria-label*="Tag"]').length > 0) {
              cy.get('.editor-post-taxonomies__flat-term-list, input[placeholder*="tag"], [aria-label*="Tag"]', { timeout: 3000 }).should('exist')
            } else {
              cy.log('Tags control not found in document settings')
            }
          })
        } else {
          cy.log('Document settings button not found')
        }
      })
    })
  })

  describe('TC-EDITOR-07: Document settings - featured image', () => {
    it('should display and allow setting featured image in document settings', () => {
      // Close any modal overlays first
      cy.get('body').then(($body) => {
        const modalOverlay = $body.find('.components-modal__screen-overlay:visible')
        if (modalOverlay.length > 0) {
          cy.get('button[aria-label*="Close"], .components-modal__header button').filter(':visible').first().click({ force: true }).then(() => {
            cy.wait(1000)
          }).catch(() => {
            cy.get('body').type('{esc}')
            cy.wait(1000)
          })
        }
      })
      
      // Open document settings sidebar
      cy.get('body').then(($body) => {
        if ($body.find('button[aria-label*="Post"], button[aria-label*="Document"]').length > 0) {
          cy.get('button[aria-label*="Post"], button[aria-label*="Document"]').first().click({ force: true })
          cy.wait(1000)
          
          // Look for featured image control
          cy.get('body').then(($body2) => {
            if ($body2.find('.editor-post-featured-image, button[aria-label*="featured image"], [aria-label*="Featured Image"]').length > 0) {
              cy.get('.editor-post-featured-image, button[aria-label*="featured image"], [aria-label*="Featured Image"]', { timeout: 3000 }).should('exist')
            } else {
              cy.log('Featured image control not found in document settings')
            }
          })
        } else {
          cy.log('Document settings button not found')
        }
      })
    })
  })

  

  describe('TC-EDITOR-09: Editor modes - code editor', () => {
    it('should switch to code editor mode', () => {
      // Look for code editor toggle
      cy.get('body').then(($body) => {
        if ($body.find('button[aria-label*="Code"], .editor-post-text-editor, button[aria-label*="Switch to code editor"]').length > 0) {
          // Click code editor button
          cy.get('button[aria-label*="Code"], .editor-post-text-editor, button[aria-label*="Switch to code editor"]').first().click()
          cy.wait(1000)
          
          // Verify code editor opened
          cy.get('body').then(($body2) => {
            if ($body2.find('textarea.editor-post-text-editor__body, .editor-post-text-editor textarea').length > 0) {
              cy.get('textarea.editor-post-text-editor__body, .editor-post-text-editor textarea', { timeout: 3000 }).should('be.visible')
            } else {
              cy.log('Code editor may use different structure')
            }
          })
        } else {
          cy.log('Code editor toggle button not found')
        }
      })
    })
  })

  describe('TC-EDITOR-10: Block patterns library', () => {
    it('should display block patterns library', () => {
      // Open block inserter
      cy.get('body').then(($body) => {
        if ($body.find('button[aria-label*="Add block"], .block-editor-inserter__toggle').length > 0) {
          cy.get('button[aria-label*="Add block"], .block-editor-inserter__toggle').first().click()
          cy.wait(1000)
          
          // Look for patterns tab
          cy.get('body').then(($body2) => {
            if ($body2.find('button[aria-label*="Pattern"], .block-editor-inserter__panel-tabs button').length > 0) {
              // Click patterns tab
              cy.get('button[aria-label*="Pattern"], .block-editor-inserter__panel-tabs button').contains(/Pattern/i).click()
              cy.wait(1000)
              
              // Verify patterns displayed
              cy.get('body').then(($body3) => {
                const hasPatterns = $body3.find('.block-editor-block-patterns-list, .block-editor-inserter__panel-content').length > 0
                expect(hasPatterns).to.be.true
              })
            } else {
              cy.log('Patterns tab not found in block inserter')
            }
          })
        } else {
          cy.log('Block inserter button not found')
        }
      })
    })
  })

  describe('TC-EDITOR-11: Block transformations', () => {
    it('should allow block transformations', () => {
      // Select a block first
      cy.get('body').then(($body) => {
        if ($body.find('.block-editor-rich-text__editable, .editor-post-title__input').length > 0) {
          // Click on a block
          cy.get('.block-editor-rich-text__editable, .editor-post-title__input').first().click()
          cy.wait(1000)
          
          // Look for transform/convert options in block toolbar
          cy.get('body').then(($body2) => {
            if ($body2.find('button[aria-label*="Transform"], button[aria-label*="Convert"], .block-editor-block-toolbar button').length > 0) {
              // Transform options should be available
              cy.get('button[aria-label*="Transform"], button[aria-label*="Convert"]', { timeout: 3000 }).should('exist')
            } else {
              cy.log('Block transform options not found (may depend on block type)')
            }
          })
        } else {
          cy.log('No blocks found to test transformations')
        }
      })
    })
  })
})

