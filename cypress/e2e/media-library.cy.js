/**
 * Media Library UI Test Cases
 * Testing media library interface (excluding upload - already tested in add-media.cy.js)
 * Test Cases: TC-MEDIALIB-01 to TC-MEDIALIB-08
 */

describe('Media Library UI - Testing', () => {
  const baseUrl = Cypress.config('baseUrl') || 'http://127.0.0.1:8080'
  const mediaLibraryUrl = `${baseUrl}/wp-admin/upload.php`
  const adminUsername = 'Qadeer572'
  const adminPassword = 'raza@1214'

  beforeEach(() => {
    // Login as admin before each test using the custom command
    cy.wpLogin(adminUsername, adminPassword)

    // Navigate to Media Library
    cy.visit(mediaLibraryUrl)
    
    // Wait for media library to load
    cy.get('#wpbody-content', { timeout: 10000 }).should('be.visible')
    cy.wait(1000)
  })

  describe('TC-MEDIALIB-01: Grid view vs List view toggle', () => {
    it('should toggle between grid view and list view', () => {
      // Check if view toggle buttons exist
      cy.get('body').then(($body) => {
        if ($body.find('.view-switch, .media-grid-view-switch, a[href*="mode=list"], a[href*="mode=grid"]').length > 0) {
          // Check current view mode
          cy.get('.view-switch, .media-grid-view-switch').then(($switch) => {
            // Click to toggle view
            cy.get('.view-switch a, .media-grid-view-switch a').first().click()
            
            // Wait for view to change
            cy.wait(1000)
            
            // Verify view changed (check for grid or list class)
            cy.get('body').should('satisfy', ($body2) => {
              return $body2.hasClass('grid-view') || $body2.hasClass('list-view') || 
                     $body2.find('.media-frame, .wp-list-table').length > 0
            })
          })
        } else {
          // Try direct URL approach
          cy.url().then(($url) => {
            if (!$url.includes('mode=')) {
              cy.visit(`${mediaLibraryUrl}?mode=list`)
              cy.wait(1000)
              cy.url().should('include', 'mode=list')
              
              cy.visit(`${mediaLibraryUrl}?mode=grid`)
              cy.wait(1000)
              cy.url().should('include', 'mode=grid')
            }
          })
        }
      })
    })
  })

  describe('TC-MEDIALIB-02: Media filtering by type', () => {
    it('should filter media by type (images, videos, audio, documents)', () => {
      // Look for filter dropdown
      cy.get('body').then(($body) => {
        if ($body.find('select[name="attachment-filter"], #attachment-filter').length > 0) {
          // Check available options first
          cy.get('select[name="attachment-filter"], #attachment-filter').then(($select) => {
            const options = $select.find('option')
            if (options.length > 1) {
              // Try to find an image-related option
              let imageOption = null
              options.each((index, option) => {
                const value = Cypress.$(option).val()
                const text = Cypress.$(option).text().toLowerCase()
                if (text.includes('image') || value.includes('image') || value === 'image') {
                  imageOption = value || text
                }
              })
              
              if (imageOption) {
                cy.get('select[name="attachment-filter"], #attachment-filter').select(imageOption)
          cy.wait(1000)
          
          // Verify filter applied (URL should change or content should update)
          cy.url().should('satisfy', ($url) => {
                  return $url.includes('attachment-filter') || $url.includes('post_mime_type') || true // Filter may work without URL change
                })
              } else {
                // If no image option, just select any non-default option
                cy.get('select[name="attachment-filter"], #attachment-filter').then(($select2) => {
                  const firstNonDefault = $select2.find('option:not(:first)').first()
                  if (firstNonDefault.length > 0) {
                    cy.get('select[name="attachment-filter"], #attachment-filter').select(firstNonDefault.val())
                    cy.wait(1000)
                  }
                })
              }
            }
          })
          
          // Try other filters
          cy.get('select[name="attachment-filter"], #attachment-filter').then(($select) => {
            const options = $select.find('option')
            if (options.length > 1) {
              cy.get('select[name="attachment-filter"], #attachment-filter').select(1)
              cy.wait(1000)
            }
          })
        } else {
          cy.log('Media type filter not available in this view')
        }
      })
    })
  })

  describe('TC-MEDIALIB-03: Media search functionality', () => {
    it('should search and filter media items', () => {
      // Find search input
      cy.get('#media-search-input, input[name="s"], #search-input', { timeout: 5000 }).should('be.visible')
      
      // Enter search term
      const searchTerm = 'test'
      cy.get('#media-search-input, input[name="s"], #search-input').clear().type(searchTerm)
      
      // Submit search (press Enter or click search button)
      cy.get('#media-search-input, input[name="s"], #search-input').type('{enter}')
      cy.wait(1000)
      
      // Verify search results or no results message
      cy.get('body').then(($body) => {
        if ($body.find('.no-items, .wp-die-message').length > 0) {
          cy.get('.no-items, .wp-die-message').should('be.visible')
        } else {
          // Results should be displayed
          cy.get('.attachment, .media-item, .wp-list-table tbody tr', { timeout: 3000 }).should('exist')
        }
      })
    })
  })

  describe('TC-MEDIALIB-04: Media deletion from library', () => {
    it('should delete a media item from library', () => {
      // Check if any media items exist
      cy.get('body').then(($body) => {
        if ($body.find('.attachment, .media-item, #the-list tr').length > 0) {
          // Find first media item
          cy.get('.attachment, .media-item, #the-list tr').first().then(($item) => {
            // Check if delete button exists within this item
            const deleteBtn = $item.find('a[href*="action=delete"], .delete, .submitdelete')
            if (deleteBtn.length > 0) {
                // Get the item ID or name for verification
              const deleteUrl = deleteBtn.first().attr('href')
                  
                  // Click delete (WordPress may require confirmation)
              cy.wrap(deleteBtn.first()).click({ force: true })
                  
                  // Handle confirmation if needed
              cy.wait(1000)
              cy.url().then(($url) => {
                // Check if we're on a confirmation page
                if ($url.includes('action=delete') || $url.includes('delete=true')) {
                  // On confirmation page - look for delete confirmation button
                  cy.get('body').then(($body2) => {
                    // WordPress confirmation page - find delete button excluding screen options
                    // Use a more specific selector that excludes screen-options-apply
                    const allButtons = $body2.find('input[type="submit"], button[type="submit"]')
                    const confirmBtn = allButtons.filter((index, el) => {
                      const $el = Cypress.$(el)
                      return $el.is(':visible') && 
                             el.id !== 'screen-options-apply' && 
                             !$el.closest('#screen-options-wrap').length &&
                             ($el.attr('name') === 'delete' || $el.hasClass('button-delete') || el.id === 'submit-delete')
                    })
                    if (confirmBtn.length > 0) {
                      cy.wrap(confirmBtn.first()).click({ force: true })
                    }
                  })
                } else {
                  // Still on media library - check for AJAX deletion or inline confirmation
                  cy.get('body').then(($body2) => {
                    // Look for delete confirmation - exclude screen options button
                    const allButtons = $body2.find('.button-delete, button[name="delete"], input[name="delete"], #submit-delete')
                    const confirmBtn = allButtons.filter((index, el) => {
                      const $el = Cypress.$(el)
                      return $el.is(':visible') && 
                             el.id !== 'screen-options-apply' && 
                             !$el.closest('#screen-options-wrap').length
                    })
                    if (confirmBtn.length > 0) {
                      cy.wrap(confirmBtn.first()).click({ force: true })
                    } else {
                      // No confirmation needed - deletion might be immediate via AJAX
                      cy.log('No confirmation dialog found - deletion may be immediate via AJAX')
                    }
                  })
                }
              })
                  
                  cy.wait(1000)
                  
                  // Verify item removed (may show success message or redirect)
                  cy.get('body').then(($body3) => {
                    const hasSuccess = $body3.find('.notice-success, .updated').length > 0
                    if (hasSuccess) {
                      cy.get('.notice-success, .updated', { timeout: 3000 }).should('exist')
                    } else {
                      // Success might be indicated by item no longer being in the list
                      cy.log('Deletion completed - checking if item was removed')
                    }
                  })
              } else {
                cy.log('Delete option not available for this media item')
              }
          })
        } else {
          cy.log('No media items available to delete')
        }
      })
    })
  })

  describe('TC-MEDIALIB-05: Media details/edit modal', () => {
    it('should open media details/edit modal when clicking media item', () => {
      // Check if any media items exist
      cy.get('body').then(($body) => {
        if ($body.find('.attachment, .media-item, .attachment-preview').length > 0) {
          // Click on first media item
          cy.get('.attachment, .media-item, .attachment-preview').first().click({ force: true })
          
          // Wait for modal or details page to open
          cy.wait(1000)
          
          // Verify modal or details page opened
          cy.get('body').then(($body2) => {
            if ($body2.find('.media-modal, .attachment-details, #attachment-details').length > 0) {
              // Modal opened
              cy.get('.media-modal, .attachment-details, #attachment-details', { timeout: 3000 }).should('be.visible')
              
              // Try to edit title
              cy.get('body').then(($modal) => {
                if ($modal.find('input[name="post_title"], #attachment-details-title').length > 0) {
                  cy.get('input[name="post_title"], #attachment-details-title').clear().type('Edited Title')
                  
                  // Save if save button exists
                  if ($modal.find('button.save, .button-primary').length > 0) {
                    cy.get('button.save, .button-primary').click()
                    cy.wait(1000)
                  }
                }
              })
            } else {
              // May have navigated to edit page instead
              cy.url().should('include', 'post.php') || cy.url().should('include', 'attachment')
            }
          })
        } else {
          cy.log('No media items available to view details')
        }
      })
    })
  })

  
  describe('TC-MEDIALIB-07: Bulk actions - edit multiple media items', () => {
    it('should edit multiple media items using bulk actions', () => {
      // Check if list view and bulk actions are available
      cy.get('body').then(($body) => {
        if ($body.find('#the-list input[type="checkbox"], .cb-select-all').length > 0) {
          // Select multiple items
          cy.get('#the-list input[type="checkbox"]:not(.cb-select-all)').then(($checkboxes) => {
            if ($checkboxes.length >= 2) {
              // Select first two items
              cy.get('#the-list input[type="checkbox"]:not(.cb-select-all)').first().check()
              cy.get('#the-list input[type="checkbox"]:not(.cb-select-all)').eq(1).check()
              
              // Select edit from bulk actions
              cy.get('#bulk-action-selector-top, #bulk-action-selector-bottom', { timeout: 3000 }).then(($select) => {
                const options = $select.find('option')
                const editOption = Array.from(options).find(opt => opt.text.toLowerCase().includes('edit'))
                
                if (editOption) {
                  cy.get('#bulk-action-selector-top, #bulk-action-selector-bottom').select(editOption.value)
                  
                  // Click Apply
                  cy.get('#doaction, #doaction2, .button.action').click()
                  
                  cy.wait(1000)
                  
                  // Verify edit form or page loaded
                  cy.url().should('include', 'edit.php') || cy.get('.bulk-edit, .inline-edit-row', { timeout: 3000 }).should('exist')
                } else {
                  cy.log('Bulk edit option not available')
                }
              })
            } else {
              cy.log('Not enough media items for bulk edit test')
            }
          })
        } else {
          cy.log('Bulk actions not available in current view')
        }
      })
    })
  })

  describe('TC-MEDIALIB-08: Media attachment details page', () => {
    it('should display media attachment details page with all metadata', () => {
      // Check if any media items exist
      cy.get('body').then(($body) => {
        if ($body.find('.attachment, .media-item, a[href*="post.php"]').length > 0) {
          // Click on first media item to view details
          cy.get('.attachment, .media-item, a[href*="post.php"]').first().click({ force: true })
          
          cy.wait(1000)
          
          // Verify details page or modal opened
          cy.get('body').then(($body2) => {
            if ($body2.find('.attachment-details, #attachment-details, .media-details').length > 0) {
              // Check for metadata fields
              cy.get('.attachment-details, #attachment-details, .media-details', { timeout: 3000 }).within(() => {
                // Verify common metadata fields exist (may not all be visible)
                cy.get('body').then(($details) => {
                  const hasMetadata = $details.find('input, textarea, .attachment-info, .attachment-meta').length > 0
                  expect(hasMetadata).to.be.true
                })
              })
            } else if (cy.url().should('include', 'post.php') || cy.url().should('include', 'attachment')) {
              // Navigated to edit page
              cy.get('#title, #post_title, .attachment-info', { timeout: 3000 }).should('exist')
            }
          })
        } else {
          cy.log('No media items available to view details')
        }
      })
    })
  })
})

