const { Dropbox } = require('dropbox');

const dropboxClient = new Dropbox({
  accessToken: process.env.DROPBOX_ACCESS_TOKEN,
  fetch: require('isomorphic-fetch')
});

function generateFileName(heading) {
  const date = (new Date()).toISOString().slice(0, 10);
  return `${date}-${heading}.png`;
}

async function uploadDropbox(heading, data) {
  const filename = generateFileName(heading);
  console.log(`saving ${filename} to dropbox...`);
  await dropboxClient.filesUpload({
    path: `/${filename}`,
    contents: Buffer.from(data, 'base64'),
    mode: {
      '.tag': 'overwrite'
    }
  });
  const response = await dropboxClient.sharingCreateSharedLink({
    path: `/${filename}`
  });
  console.log(`${filename} uploaded. link: ${response.url}`);
  return response.url.replace('dl=0', 'dl=1');
}

module.exports = {
  uploadDropbox
};
