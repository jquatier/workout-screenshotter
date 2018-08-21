const https = require('https');

function generatePostBody(heading, url, imageAttachment, boundary) {
  /* eslint-disable prefer-template */
  const data = Buffer.from('--' + boundary + '\r\n'
    + 'Content-Disposition: form-data; name="user"\r\n\r\n'
    + process.env.PUSHOVER_USER_KEY + '\r\n'
    + '--' + boundary + '\r\n'
    + 'Content-Disposition: form-data; name="token"\r\n\r\n'
    + process.env.PUSHOVER_TOKEN + '\r\n'
    + '--' + boundary + '\r\n'
    + 'Content-Disposition: form-data; name="url"\r\n\r\n'
    + url + '\r\n'
    + '--' + boundary + '\r\n'
    + 'Content-Disposition: form-data; name="url_title"\r\n\r\n'
    + 'View Workout\r\n'
    + '--' + boundary + '\r\n'
    + 'Content-Disposition: form-data; name="message"\r\n\r\n'
    + `${heading} Workout Posted!\r\n`);

  const end = Buffer.from('\r\n--' + boundary + '--');

  const imageData = Buffer.from('--' + boundary + '\r\n'
    + 'Content-Disposition: form-data; name="attachment"; filename="workout.png"\r\n'
    + 'Content-Type: image/png\r\n\r\n');

  const imageEnd = Buffer.from('\r\n--' + boundary + '--');
  const image = Buffer.concat([imageData, Buffer.from(imageAttachment, 'base64'), imageEnd]);
  /* eslint-enable prefer-template */
  return Buffer.concat([data, image, end]);
}

async function push(heading, url, data) {
  console.log('sending notification');
  const boundary = Math.random().toString(16);
  const postBody = generatePostBody(heading, url, data, boundary);
  return new Promise((resolve, reject) => {
    const request = https.request({
      host: 'api.pushover.net',
      port: 443,
      path: '/1/messages.json',
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Accept-Charset': 'utf-8',
        'Content-Type': `multipart/form-data; boundary=${boundary}`,
        'Content-Length': Buffer.byteLength(postBody)
      }
    }, (response) => {
      response.setEncoding('utf8');
      response.once('data', () => resolve());
    });

    request.once('error', error => reject(error));
    request.end(postBody);
  });
}

module.exports = {
  push
};
