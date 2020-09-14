const { Builder, By, Key, util } = require('selenium-webdriver')
const { DriverService } = require('selenium-webdriver/remote')
const { chrome } = require('selenium-webdriver/chrome')

let driver = new Builder().forBrowser('chrome').build()
driver.get('https://www.amazon.de/')
//await driver.findElement(By.id('twotabsearchtextbox')).sendKeys('javascript', Key.ENTER);
let element = driver.findElements(
  By.className('a-color-base headline truncate-1line')
).innerText
console.log(element)
driver.close()
