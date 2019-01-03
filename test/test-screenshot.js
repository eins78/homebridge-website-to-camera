const fs = require('fs')
const path = require('path')
const assert = require('assert')
const ScreenshotHelper = require("../ScreenshotHelper");
const log = msg => { console.log(`[LOG] ${msg}`) }
const errorHandler = reason => { log(`[ERROR] ${reason}`) }

assert(process.argv[2], 'path to config must be given as first argument')
const CONFIG_FILE = process.argv[2]
const config = require(path.resolve(CONFIG_FILE));
validateConfig(config);

// NOTE: runs each in sequence, like the plugin itself.
config.cameras.forEach(async (conf, i, a) => {
  const screenshotHelper = new ScreenshotHelper(log, conf.url, conf.chromiumPath);

  // NOTE: this part should match usage in `./CameraSource.js`
  await screenshotHelper.getScreenshot(conf)
    .then(img => { saveImage(img, conf) }, errorHandler)
    .catch(errorHandler);

  // exit if this was the last camera
  if (i + 1 == a.length) process.exit(0)
})

// functions

function saveImage(buffer, config) {
  const confFileName = path.basename(CONFIG_FILE)
  const confName = confFileName.slice(0, confFileName.lastIndexOf('.'))
  const outDir = path.resolve(
    path.dirname(__filename), 'outputs', confName);

  fs.existsSync(outDir) || fs.mkdirSync(outDir, { recursive: true });
  const ext = 'jpg'
  const filepath = path.join(outDir, `${config.name}.${ext}`)
  fs.writeFileSync(filepath, buffer)
  console.log(`[TEST] saved screenshot to '${filepath}'`)
}

function validateConfig(config) {
  assert(config, 'config must be present')
  assert.equal(config.cameras.constructor, Array, 'config.cameras must be an array')
  config.cameras.forEach(async conf => {
    assert.equal(typeof conf, 'object', 'config must be present')
    assert(conf.name, `config must have 'name'`)
    assert(conf.url, `config must have 'url'`)
    assert.equal(conf.name.indexOf('.'), -1, `config 'name' can NOT contain a dot/period ('.')`)
  })
  const allNames = config.cameras.map(c => c.name)
  assert.equal(allNames.length, [...new Set(allNames)].length, 'names must be unique')
}
