const express = require('express')
const bodyParser = require('body-parser')
const path = require('path')
const cors = require('cors')
const crawler = require('crawler')
const HTMLParser = require('node-html-parser')
const cron = require('node-cron')
const { Builder, By, Key, until } = require('selenium-webdriver')
const fs = require('fs')
const app = express()

app.use(cors())
app.use(express.static(path.join(__dirname, 'build')))
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())
app.use(bodyParser.raw())

app.get('/ping', function (req, res) {
  return res.send('pong')
})

app.get('/', function (req, res) {
  res.sendFile(path.join(__dirname, 'build', 'index.html'))
})

app.post('/test', async function (req, res) {
  let testData = req.body
  const repetitionNumber = testData.repetitionNumber
  // Start -----> Config Cron Job
  let cronJob = '* * * * *'
  if (testData.courseTime < 1) {
    // Every * Minutes
    cronJob = `*/${Math.floor(testData.courseTime * 60)} * * * *`
  } else if (testData.courseTime >= 1 && testData.courseTime <= 6) {
    // Every * Hours
    cronJob = `0 */${testData.courseTime} * * *`
  } else {
    // Every * Days
    const a = testData.courseTime / 24
    if (a === 1) {
      cronJob = `0 0 * * *`
    } else {
      cronJob = `0 0 */${a} * *`
    }
  }
  // End -----> Config Cron Job

  testData.results = []

  if (testData) {
    let rtn = 0
    let driver = await new Builder().forBrowser('chrome').build()

    const mainFunc = async () => {
      fs.readFile('results/' + testData.filename, (err, data) => {
        if (data) {
          testData = JSON.parse(data)
        }
      })

      let finalResult = {}
      finalResult.dateTime = Date.now()
      finalResult.foundElements = []

      let indexBox = []

      let foundResult = []
      await driver.get(testData.href)
      testData.elements.forEach(async (element, index) => {
        let foundElementByXPath = [],
          foundElementByCss = []
        await driver
          .findElement(By.xpath(element.relxpath))
          .then((eleByXPath) => {
            console.log(`The Element ${index + 1} Is Found By XPath!`)
            foundElementByXPath[index] = eleByXPath
          })
          .catch(() => {
            console.log(`The Element ${index + 1} Is Not Found By XPath!`)
          })

        await driver
          .findElement(By.css(element.cssSelector))
          .then((eleByCss) => {
            console.log(`The Element ${index + 1} Is Found By Css!`)
            foundElementByCss[index] = eleByCss
          })
          .catch(() => {
            console.log(`The Element ${index + 1} Is Not Found By Css!`)
          })

        foundResult[index] = {}
        foundResult[index].relxpath = element.relxpath
        foundResult[index].status = 'Not Found'

        if (foundElementByXPath[index]) {
          foundResult[index].status = 'Found'
          // Get Tag Name of Element
          await foundElementByXPath[index]
            .getTagName()
            .then(function (name) {
              foundResult[index].tagname = name
            })
            .catch(() => {
              console.log('Get Element Error ---------------> TagName By XPath')
            })

          // Get Id of Element
          // await foundElementByXPath[index].getId().then(function (id) {})

          // Get Id Attr of Element
          await foundElementByXPath[index]
            .getAttribute('id')
            .then(function (id) {
              foundResult[index].id = id
            })
            .catch(() => {
              console.log('Get Element Error ---------------> Id By XPath')
            })

          // Get Class of Element
          await foundElementByXPath[index]
            .getAttribute('class')
            .then(function (classes) {
              foundResult[index].classes = classes
            })
            .catch(() => {
              console.log('Get Element Error ---------------> Class By XPath')
            })

          // Get Style of Element
          await foundElementByXPath[index]
            .getAttribute('style')
            .then(function (style) {
              foundResult[index].style = style
            })
            .catch(() => {
              console.log('Get Element Error ---------------> Style By XPath')
            })

          // Get Alt of Element
          await foundElementByXPath[index]
            .getAttribute('alt')
            .then(function (alt) {
              foundResult[index].alt = alt
            })
            .catch(() => {
              console.log('Get Element Error ---------------> Alt By XPath')
            })

          // Get Text of Element
          await foundElementByXPath[index]
            .getText()
            .then(function (text) {
              foundResult[index].text = text
            })
            .catch(() => {
              console.log('Get Element Error ---------------> Text By XPath')
            })

          // Get Rect of Element
          await foundElementByXPath[index]
            .getRect()
            .then(function (rect) {
              foundResult[index].rect = rect
            })
            .catch(() => {
              console.log('Get Element Error ---------------> Rect By XPath')
            })

          // Get PNG of Element
          await foundElementByXPath[index]
            .takeScreenshot()
            .then(function (png) {
              foundResult[index].png = 'data:image/png;base64,' + png
            })
            .catch(() => {
              console.log('Get Element Error ---------------> PNG By XPath')
            })
        }

        foundResult[index].css = {}
        foundResult[index].css['cssSelector'] = element.cssSelector
        foundResult[index].css['status'] = 'Not Found'

        if (foundElementByCss[index]) {
          foundResult[index].css['status'] = 'Found'
          // Get Tag Name of Element
          await foundElementByCss[index]
            .getTagName()
            .then(function (name) {
              foundResult[index].css['tagname'] = name
            })
            .catch(() => {
              console.log('Get Element Error ---------------> TagName By Css')
            })

          // Get Id of Element
          // await foundElementByCss[index].getId().then(function (id) {})

          // Get Id Attr of Element
          await foundElementByCss[index]
            .getAttribute('id')
            .then(function (id) {
              foundResult[index].css['id'] = id
            })
            .catch(() => {
              console.log('Get Element Error ---------------> Id By Css')
            })

          // Get Class of Element
          await foundElementByCss[index]
            .getAttribute('class')
            .then(function (classes) {
              foundResult[index].css['classes'] = classes
            })
            .catch(() => {
              console.log('Get Element Error ---------------> Class By Css')
            })

          // Get Style of Element
          await foundElementByCss[index]
            .getAttribute('style')
            .then(function (style) {
              foundResult[index].css['style'] = style
            })
            .catch(() => {
              console.log('Get Element Error ---------------> Style By Css')
            })

          // Get Alt of Element
          await foundElementByCss[index]
            .getAttribute('alt')
            .then(function (alt) {
              foundResult[index].css['alt'] = alt
            })
            .catch(() => {
              console.log('Get Element Error ---------------> Alt By Css')
            })

          // Get Text of Element
          await foundElementByCss[index]
            .getText()
            .then(function (text) {
              foundResult[index].css['text'] = text
            })
            .catch(() => {
              console.log('Get Element Error ---------------> Text By Css')
            })

          // Get Rect of Element
          await foundElementByCss[index]
            .getRect()
            .then(function (rect) {
              foundResult[index].css['rect'] = rect
            })
            .catch(() => {
              console.log('Get Element Error ---------------> Rect By Css')
            })

          // Get PNG of Element
          await foundElementByCss[index]
            .takeScreenshot()
            .then(function (png) {
              foundResult[index].css['png'] = 'data:image/png;base64,' + png
            })
            .catch(() => {
              console.log('Get Element Error ---------------> PNG By Css')
            })
        }

        await finalResult.foundElements.push(foundResult[index])

        await indexBox.push(index)

        if (testData.elements.length === indexBox.length) {
          await testData.results.push(finalResult)
          await fs
            .writeFile(
              'results/' + testData.filename,
              JSON.stringify(testData),
              (err) => {
                if (err) {
                  throw err
                }
                console.log('Data has been written to file successfully.')
              }
            )
            .catch(() => {
              console.log('Error! Data has not been written to file.')
            })
        }
      })
    }

    const task = cron.schedule(
      cronJob,
      async () => {
        try {
          await mainFunc()
        } finally {
          rtn = rtn + 1
          if (rtn > repetitionNumber) {
            await setTimeout(async () => {
              await driver.quit()
            }, 25000)
            task.destroy()
          }
        }
      },
      {
        scheduled: false
      }
    )

    rtn = 1
    try {
      await mainFunc()
    } finally {
      rtn = rtn + 1
      if (rtn > repetitionNumber) {
        await setTimeout(async () => {
          await driver.quit()
        }, 25000)
        task.destroy()
      }
    }

    task.start()
    return res.send(true)
  }
})

app.get('/GetFileList', function (req, res) {
  fs.readdir('results/', (err, files) => {
    return res.send(files)
  })
})

app.get('/GetFile', function (req, res) {
  fs.readFile('results/' + req.query.filename, (err, data) => {
    if (data) {
      res.setHeader(
        'Content-Disposition',
        'attachment; filename=' + req.query.filename
      )
      res.setHeader('Content-Transfer-Encoding', 'binary')
      res.setHeader('Content-Type', 'application/octet-stream')

      return res.send(data)
    }
  })
})

app.listen(process.env.PORT || 3000)
