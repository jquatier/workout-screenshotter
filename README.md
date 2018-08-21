workout-screenshotter
=====================

This is Serverless project for screenshotting my favorite fitness page for the daily workout. It runs headless Chrome in Lambda, logs into the site, takes a screenshot, archives it, and sends me a push notification.

Uses
------------------
- Headless Chrome via [serverless-chrome](https://github.com/adieuadieu/serverless-chrome)
- Workout Archiving via [Dropbox](https://www.dropbox.com/)
- Push Notifications via [Pushover](https://pushover.net/)

Requirements
------------
- Node 8
- `environment.yml` file containing keys/secrets for APIs (see `environment-sample.yml`)

Running Locally
---------------

        npm install chrome-launcher
        sls invoke local --function screenshot