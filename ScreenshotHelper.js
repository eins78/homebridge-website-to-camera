const puppeteer = require('puppeteer-core');

module.exports = ScreenshotHelper;

const defaultConfig = {
}

function ScreenshotHelper(log, url, chromiumPath = "/usr/bin/chromium-browser") {
    this.log = log;
    this.url = url;
    this.chromiumPath = chromiumPath;
    this.log("Initialized ScreenshotHelper");
}

ScreenshotHelper.prototype.getScreenshot = async function (config) {
    config = Object.assign({}, defaultConfig, config);
    
    const viewport = { width: config.width, height: config.height };

    if (!this.browser) {
        this.log("Starting new instance of Chromium: " + this.chromiumPath);
        this.browser = await puppeteer.launch(
            {
                executablePath: this.chromiumPath,
                headless: true,
                args: ['--no-sandbox'] // required if homebridge is started as root-user
            }
        );
        this.log("Chromium started");
    }
    this.log("Opening new page");
    const page = await this.browser.newPage();
    this.log("Setting Viewport to " + viewport.width + "x" + viewport.height);
    await page.setViewport(viewport);
    this.log("Going to page: " + this.url);
    await page.goto(this.url, {waitUntil: 'networkidle0', timeout: 10000});
    const screenshot = await page.screenshot({type: "jpeg"});
    this.log("Created screenshot");
    page.close();
    return screenshot;
};
