import { test, expect, type Page } from '@playwright/test'

// Test configuration
const TEST_EVENT_DATA = {
  title: 'Test Event - Food Festival',
  description: 'A comprehensive test of the event creation system with all features enabled.',
  preOrderDate: '2025-12-31',
  preOrderTime: '10:00',
}

const TEST_MENU_ITEMS = [
  {
    name: 'BBQ Burger',
    description: 'Juicy beef burger with BBQ sauce',
    price: '12.99',
    category: 'main'
  },
  {
    name: 'Caesar Salad',
    description: 'Fresh romaine lettuce with caesar dressing',
    price: '8.50',
    category: 'appetizer'
  },
  {
    name: 'Chocolate Cake',
    description: 'Rich chocolate cake slice',
    price: '6.99',
    category: 'dessert'
  }
]

test.describe('Event Creation Flow', () => {
  let page: Page

  test.beforeEach(async ({ browser }) => {
    page = await browser.newPage()
    // Mock authentication
    await page.route('**/api/auth/**', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, token: 'mock-token' })
      })
    })
    
    await page.goto('http://localhost:3000/dashboard')
  })

  test('Complete event creation from info to publish', async () => {
    // Step 1: Navigate to create new event
    await page.click('[data-testid="create-event-button"]')
    await expect(page.locator('h2')).toContainText('New Event')

    // Step 2: Fill in event information (Info tab)
    await test.step('Fill event info', async () => {
      // Fill basic info
      await page.fill('#eventName', TEST_EVENT_DATA.title)
      await page.fill('#eventDescription', TEST_EVENT_DATA.description)
      await page.fill('#preOrdersOpen', TEST_EVENT_DATA.preOrderDate)
      await page.fill('input[type="time"]', TEST_EVENT_DATA.preOrderTime)

      // Configure order close settings
      await page.click('button:has-text("When last pickup window ends")')
      await page.click('button:has-text("Save")')

      // Enable walk-up ordering
      await page.click('input[type="checkbox"]:near(:text("Enable walk-up ordering"))')
      
      // Save and continue
      await page.click('button:has-text("Save & Continue")')
      await expect(page.locator('[data-testid="pickup-tab"]')).toBeVisible()
    })

    // Step 3: Configure pickup windows (Pickup tab)
    await test.step('Configure pickup windows', async () => {
      await page.click('button:has-text("Add Pickup Window")')
      
      // Add first pickup window
      await page.fill('input[type="date"]:first', TEST_EVENT_DATA.preOrderDate)
      await page.fill('input[type="time"]:nth(0)', '11:00')
      await page.fill('input[type="time"]:nth(1)', '12:00')
      await page.click('button:has-text("Save Window")')

      // Add second pickup window
      await page.click('button:has-text("Add Pickup Window")')
      await page.fill('input[type="date"]:last', TEST_EVENT_DATA.preOrderDate)
      await page.fill('input[type="time"]:nth(2)', '13:00')
      await page.fill('input[type="time"]:nth(3)', '14:00')
      await page.click('button:has-text("Save Window")')

      // Navigate to menu tab
      await page.click('[data-testid="menu-tab"]')
    })

    // Step 4: Add menu items (Menu tab)
    await test.step('Add menu items', async () => {
      for (const item of TEST_MENU_ITEMS) {
        await page.click('button:has-text("Add Item")')
        
        await page.fill('input[placeholder="Enter item name"]', item.name)
        await page.fill('textarea[placeholder="Describe the item"]', item.description)
        await page.fill('input[type="number"]', item.price)
        await page.selectOption('select', item.category)
        
        await page.click('button:has-text("Add Item")')
        await expect(page.locator(`text=${item.name}`)).toBeVisible()
      }

      // Navigate to publish tab
      await page.click('[data-testid="publish-tab"]')
    })

    // Step 5: Preview and publish (Publish tab)
    await test.step('Publish event', async () => {
      // Verify event preview
      await expect(page.locator('h2')).toContainText(TEST_EVENT_DATA.title)
      await expect(page.locator('p')).toContainText(TEST_EVENT_DATA.description)

      // Check publishing checklist
      const checklistItems = page.locator('[data-testid="publishing-checklist"] .text-green-700')
      await expect(checklistItems).toHaveCount(4) // All required items should be green

      // Publish the event
      await page.click('button:has-text("Publish Event")')
      await expect(page.locator('text=Event published successfully!')).toBeVisible()
      await expect(page.locator('span:has-text("Published")')).toBeVisible()
    })

    // Step 6: Verify published event features
    await test.step('Verify published features', async () => {
      // Check that share options are available
      await expect(page.locator('input[readonly]')).toBeVisible() // Event URL
      await expect(page.locator('button:has-text("Copy URL")')).toBeVisible()
      await expect(page.locator('button:has-text("Share Event")')).toBeVisible()

      // Test unpublish functionality
      await page.click('button:has-text("Unpublish")')
      await page.click('button:has-text("OK")') // Confirm dialog
      await expect(page.locator('text=Event unpublished successfully')).toBeVisible()
      await expect(page.locator('span:has-text("Draft")')).toBeVisible()
    })
  })

  test('Form validation and error handling', async () => {
    await page.click('[data-testid="create-event-button"]')

    // Test required field validation
    await page.click('button:has-text("Save & Continue")')
    
    await expect(page.locator('text=Event name is required')).toBeVisible()
    await expect(page.locator('text=Event description is required')).toBeVisible()
    await expect(page.locator('text=Pre-order date is required')).toBeVisible()

    // Test invalid date (past date)
    await page.fill('#eventName', 'Test Event')
    await page.fill('#eventDescription', 'Test Description')
    await page.fill('#preOrdersOpen', '2020-01-01')
    await page.click('button:has-text("Save & Continue")')
    
    await expect(page.locator('text=Pre-order date cannot be in the past')).toBeVisible()
  })

  test('Menu item validation', async () => {
    // First create a basic event to access menu tab
    await page.click('[data-testid="create-event-button"]')
    await page.fill('#eventName', 'Test Event')
    await page.fill('#eventDescription', 'Test Description')
    await page.fill('#preOrdersOpen', '2025-12-31')
    await page.fill('input[type="time"]', '10:00')
    await page.click('button:has-text("When last pickup window ends")')
    await page.click('button:has-text("Save")')
    await page.click('button:has-text("Save & Continue")')
    
    // Navigate to menu tab
    await page.click('[data-testid="menu-tab"]')
    
    // Test menu item validation
    await page.click('button:has-text("Add Item")')
    await page.click('button:has-text("Add Item")') // Try to save empty form
    
    await expect(page.locator('text=Item name is required')).toBeVisible()
    await expect(page.locator('text=Description is required')).toBeVisible()
    await expect(page.locator('text=Price must be a positive number')).toBeVisible()

    // Test invalid price
    await page.fill('input[placeholder="Enter item name"]', 'Test Item')
    await page.fill('textarea[placeholder="Describe the item"]', 'Test Description')
    await page.fill('input[type="number"]', '-5')
    await page.click('button:has-text("Add Item")')
    
    await expect(page.locator('text=Price must be a positive number')).toBeVisible()
  })

  test('Image upload functionality', async () => {
    await page.click('[data-testid="create-event-button"]')
    
    // Test image upload
    const fileInput = page.locator('input[type="file"]')
    await fileInput.setInputFiles('./test-assets/test-image.jpg')
    
    // Verify image preview
    await expect(page.locator('img[alt="Event preview"]')).toBeVisible()
    await expect(page.locator('button:has-text("View full image")')).toBeVisible()
    await expect(page.locator('button:has-text("Remove image")')).toBeVisible()

    // Test remove image
    await page.click('button:has-text("Remove image")')
    await expect(page.locator('img[alt="Event preview"]')).not.toBeVisible()
  })

  test('API error handling', async () => {
    // Mock API failure
    await page.route('**/api/events', route => {
      route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'Server error' })
      })
    })

    await page.click('[data-testid="create-event-button"]')
    await page.fill('#eventName', 'Test Event')
    await page.fill('#eventDescription', 'Test Description')
    await page.fill('#preOrdersOpen', '2025-12-31')
    await page.fill('input[type="time"]', '10:00')
    await page.click('button:has-text("Save & Continue")')

    // Verify error handling
    await expect(page.locator('text=Server error. Please try again later.')).toBeVisible()
  })

  test('Event editing flow', async () => {
    // Mock existing event data
    await page.route('**/api/events/*', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: {
            id: 1,
            title: 'Existing Event',
            description: 'Existing Description',
            pre_order_date: '2025-12-31',
            pre_order_time: '10:00',
            status: 'draft'
          }
        })
      })
    })

    await page.goto('http://localhost:3000/dashboard/events/1/edit')
    
    // Verify existing data is loaded
    await expect(page.locator('#eventName')).toHaveValue('Existing Event')
    await expect(page.locator('#eventDescription')).toHaveValue('Existing Description')
    
    // Update the event
    await page.fill('#eventName', 'Updated Event')
    await page.click('button:has-text("Save Changes")')
    
    await expect(page.locator('text=Event updated successfully!')).toBeVisible()
  })
})

// Mock API responses for testing
export const mockApiResponses = {
  createEvent: {
    success: true,
    data: { id: 1, title: 'Test Event', status: 'draft' }
  },
  updateEvent: {
    success: true,
    data: { id: 1, title: 'Updated Event', status: 'published' }
  },
  createMenuItem: {
    success: true,
    data: { id: 1, name: 'Test Item', price: 10.99 }
  },
  createPickupWindow: {
    success: true,
    data: { id: 1, start_time: '11:00', end_time: '12:00' }
  }
}
