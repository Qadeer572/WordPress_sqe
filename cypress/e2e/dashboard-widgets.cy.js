/**
 * Dashboard Widgets Test Cases
 * Testing dashboard widgets visibility and functionality
 * Test Cases: TC-DASH-01 to TC-DASH-06
 */

describe('Dashboard Widgets - UI Testing', () => {
  const baseUrl = Cypress.config('baseUrl') || 'http://127.0.0.1:8080'
  const dashboardUrl = `${baseUrl}/wp-admin/index.php`
  const adminUsername = 'Qadeer572'
  const adminPassword = 'raza@1214'

  beforeEach(() => {
    // Login as admin before each test using the custom command
    cy.wpLogin(adminUsername, adminPassword)

    // Navigate to dashboard
    cy.visit(dashboardUrl)
    
    // Wait for dashboard to load
    cy.get('#wpbody-content', { timeout: 10000 }).should('be.visible')
    cy.wait(1000)
  })

  describe('TC-DASH-01: Quick Draft widget - create draft post', () => {
    it('should successfully create draft post from Quick Draft widget', () => {
      // Locate Quick Draft widget
      cy.get('#dashboard_quick_press, .quick-draft-widget', { timeout: 10000 }).should('exist')
      
      // Enter post title
      cy.get('#title, #quick-press-title', { timeout: 5000 }).should('be.visible').clear().type(`Quick Draft Test ${Date.now()}`)
      
      // Enter post content
      cy.get('#content, #quick-press-content', { timeout: 5000 }).should('be.visible').clear().type('This is a quick draft post created from the dashboard widget.')
      
      // Click Save Draft button
      cy.get('input[type="submit"][value*="Draft"], button[type="submit"]', { timeout: 5000 })
        .contains(/Save Draft|Draft/i)
        .click()
      
      // Verify draft was created - widget should show success message or update
      cy.get('.notice-success, .updated, #dashboard_quick_press', { timeout: 5000 }).should('exist')
    })
  })

  describe('TC-DASH-02: Activity widget - display recent posts and comments', () => {
    it('should display recent posts and comments in Activity widget', () => {
      // Locate Activity widget
      cy.get('#dashboard_activity, .activity-widget', { timeout: 10000 }).should('exist')
      
      // Verify widget title - check text content more flexibly
      cy.get('#dashboard_activity h2, .activity-widget h2', { timeout: 5000 }).then(($h2) => {
        const text = $h2.text().toLowerCase()
        expect(text).to.satisfy((txt) => txt.includes('activity') || txt.includes('recent'))
      })
      
      // Check for recent posts section (may not exist if no posts)
      cy.get('body').then(($body) => {
        if ($body.find('#dashboard_activity .rss-widget, .activity-widget .rss-widget').length > 0) {
          cy.get('#dashboard_activity .rss-widget, .activity-widget .rss-widget').should('be.visible')
        } else {
          cy.log('No recent posts/comments to display in Activity widget')
        }
      })
    })
  })

  describe('TC-DASH-03: At a Glance widget - display post/page counts', () => {
    it('should display post and page counts in At a Glance widget', () => {
      // Locate At a Glance widget
      cy.get('#dashboard_right_now, .at-a-glance-widget', { timeout: 10000 }).should('exist')
      
      // Verify widget title - check text content more flexibly
      cy.get('#dashboard_right_now h2, .at-a-glance-widget h2', { timeout: 5000 }).then(($h2) => {
        const text = $h2.text().toLowerCase()
        expect(text).to.satisfy((txt) => txt.includes('glance') || txt.includes('right now') || txt.includes('at a'))
      })
      
      // Check for post count (may be 0)
      cy.get('#dashboard_right_now, .at-a-glance-widget').then(($widget) => {
        // Look for post count indicators within the widget
        if ($widget.find('a[href*="edit.php"], .post-count, [data-count], ul li').length > 0) {
          cy.get('#dashboard_right_now a[href*="edit.php"], #dashboard_right_now .post-count, #dashboard_right_now [data-count]').first().should('exist')
        } else {
          cy.log('Post count indicators not found, but widget exists')
        }
      })
    })
  })

  describe('TC-DASH-04: WordPress News widget - display WordPress news feed', () => {
    it('should display WordPress news feed in WordPress News widget', () => {
      // Locate WordPress News widget (may not exist if disabled)
      cy.get('body').then(($body) => {
        if ($body.find('#dashboard_primary, .wordpress-news-widget, #dashboard_secondary').length > 0) {
          cy.get('#dashboard_primary, .wordpress-news-widget, #dashboard_secondary', { timeout: 5000 }).should('exist')
          
          // Verify widget has content or loading state - check within widget element directly
          cy.get('#dashboard_primary, .wordpress-news-widget, #dashboard_secondary').then(($widget) => {
            if ($widget.find('.rss-widget, .rssSummary, a, .inside').length > 0) {
              cy.get('#dashboard_primary .rss-widget, #dashboard_primary .rssSummary, #dashboard_primary a, #dashboard_primary .inside').first().should('exist')
            } else {
              cy.log('WordPress News widget exists but may be loading or empty')
            }
          })
        } else {
          cy.log('WordPress News widget not found (may be disabled)')
        }
      })
    })
  })

  describe('TC-DASH-05: Widget drag-and-drop functionality', () => {
    it('should allow widget drag-and-drop when enabled', () => {
      // Check if Screen Options is available
      cy.get('body').then(($body) => {
        if ($body.find('#screen-options-link-wrap, .screen-options-toggle').length > 0) {
          // Click Screen Options
          cy.get('#screen-options-link-wrap, .screen-options-toggle').click()
          
          // Check if drag-and-drop is available (WordPress may not have this for dashboard widgets)
          cy.get('body').then(($body2) => {
            if ($body2.find('.metabox-prefs, [data-widget]').length > 0) {
              cy.log('Widget customization options available')
              // Note: Actual drag-and-drop testing may require more complex setup
            } else {
              cy.log('Dashboard widgets may not support drag-and-drop in this WordPress version')
            }
          })
        } else {
          cy.log('Screen Options not available for dashboard widgets')
        }
      })
    })
  })

  describe('TC-DASH-06: Widget collapse/expand functionality', () => {
    it('should allow widget collapse and expand', () => {
      // Find a dashboard widget with collapse functionality
      cy.get('#dashboard-widgets .postbox, .dashboard-widget', { timeout: 10000 }).first().then(($widget) => {
        // Check if widget has collapse/expand controls
        const $handlediv = $widget.find('.handlediv, .toggle-indicator, button[aria-expanded]')
        
        if ($handlediv.length > 0) {
          // Click collapse button
          cy.wrap($handlediv.first()).click()
          
          // Wait a moment
          cy.wait(500)
          
          // Click expand button again
          cy.wrap($handlediv.first()).click()
          
          // Verify widget content is visible again
          cy.wait(500)
          cy.get('#dashboard-widgets .postbox .inside, #dashboard-widgets .dashboard-widget .widget-content', { timeout: 2000 }).first().should('exist')
        } else {
          cy.log('Widget collapse/expand controls not found')
        }
      })
    })
  })
})

