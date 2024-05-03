const fs = require('fs/promises')
const {Builder, By} = require('selenium-webdriver')
const chrome = require('selenium-webdriver/chrome')
const compareImages = require('resemblejs/compareImages')


const HOST = 'http://localhost:4567'

describe('Custom checkbox', function () {
  let driver
  const green = 'rgba(0, 128, 2, 1)'

  beforeAll(async () => {
    const options = new chrome.Options();
    if (options.headless) {
      options.addArguments("--headless");
    }
    driver = await new Builder().forBrowser('chrome').setChromeOptions(options).build()
  })

  beforeEach(async () => {
    await driver.get(HOST)
  })

  afterAll(() => {
    driver.quit()
  })

  describe('unchecked', () => {
    it('should have checkbox dimension of 20x20px', async () => {
      const checkbox = await driver.findElement(By.className('form-checkbox'))
      const height = await checkbox.getCssValue('height')
      const width = await checkbox.getCssValue('width')
      expect(width).toEqual('20px')
      expect(height).toEqual('20px')
    })

    it('should display all elements as it is shown on a template', async () => {
      await compareCheckboxWithTemplate(driver, 'unchecked')
    })
  })

  describe('checked', () => {
    beforeEach(async () => {
      const label = await driver.findElement(By.css('label'))
      await label.click()
    })

    it('should change label color to green', async () => {
      const label = await driver.findElement(By.css('label'))
      expect(await label.getCssValue('color')).toEqual(green)
    })

    it('should cross out the label', async () => {
      const label = await driver.findElement(By.css('label'))
      expect(await label.getCssValue('text-decoration')).toContain('line-through')
    })

    it('should display all elements as it is shown on a template', async () => {
      await compareCheckboxWithTemplate(driver, 'checked')
    })
  })
})

const compareCheckboxWithTemplate = async (driver, stateName) => {
  const container = await driver.findElement(By.className('screen'))
  const containerImage = await container.takeScreenshot()

  const containerImageBase64 = 'data:image/png;base64,' + containerImage
  const templateImageBase64 = await fs.readFile(`./test/fixtures/navigation-${stateName}.png`)

  const {misMatchPercentage, getBuffer} = await compareImages(containerImageBase64, templateImageBase64)
  await fs.writeFile(`diff-${stateName}.png`, getBuffer(), 'base64')

  expect(parseFloat(misMatchPercentage)).toBeLessThan(1)
}