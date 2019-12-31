const Chrome = require('chrome-remote-interface');
const Dropbox = require('./lib/dropbox');
const Notify = require('./lib/notify');

const DP_URL = process.env.PAGE_URL;

async function sleep(millis = 0) {
  return new Promise(resolve => setTimeout(resolve, millis));
}

async function screenshotWorkout() {
  const browser = await Chrome({ host: '127.0.0.1' });

  const {
    Network, Page, Runtime, Emulation
  } = browser;

  Page.loadEventFired(async () => {
    const title = await Runtime.evaluate({ expression: 'document.title' });
    console.log(`Loaded -> ${title.result.value}`);
  });

  try {
    await Promise.all([Network.enable(), Page.enable()]);

    await Network.setUserAgentOverride({
      userAgent:
        'Mozilla/5.0 (iPhone; CPU iPhone OS 10_0_1 like Mac OS X) AppleWebKit/602.1.50 (KHTML, like Gecko) Version/10.0 Mobile/14A403 Safari/602.1'
    });

    await Emulation.setDeviceMetricsOverride({
      mobile: true,
      deviceScaleFactor: 0,
      scale: 1,
      width: 375,
      height: 0
    });

    // initial hit (and login prompt)
    await Page.navigate({ url: DP_URL });
    await Page.loadEventFired();

    console.log('initial page hit, waiting...');
    await sleep(5000);

    // fill out login and submit
    // ALERT: fragile code ahead!
    console.log('logging in...');
    await Runtime.evaluate({
      expression: `
        $('#Sentry_email').val('${process.env.PAGE_LOGIN}');
        Sentry_onfocus('Sentry_password');
        $('#Sentry_password').val('${process.env.PAGE_PASSWORD}');
        sentryLogin();
      `
    });

    // assume login happens
    await sleep(5000);

    // hit page
    await Page.navigate({ url: DP_URL });
    await Page.loadEventFired();

    // grab the h1
    const h1 = await Runtime.evaluate({
      expression: "$('.main-content h1:first').html()",
      returnByValue: true
    });

    const heading = h1.result.value.toUpperCase()
      .replace(/(<([^>]+)>)/ig, '-')
      .replace(/[\s,/]/g, '-');

    // wait for imagery
    await sleep(3000);

    await Emulation.setDeviceMetricsOverride({
      mobile: true,
      deviceScaleFactor: 0,
      scale: 1,
      width: 375,
      height: 800
    });

    // scroll to content
    await Runtime.evaluate({
      expression: "$('.main-content h1').get(0).scrollIntoView()"
    });

    // take screenshot
    console.log(`capturing page ${heading}...`);
    const screenshot = await Page.captureScreenshot({ format: 'png' });
    return { heading, screenshot: screenshot.data };
  } finally {
    await browser.close();
  }
}

module.exports.screenshot = async () => {
  const { heading, screenshot } = await screenshotWorkout();
  const savedUrl = await Dropbox.uploadDropbox(heading, screenshot);
  return Notify.push(heading, savedUrl, screenshot);
};
