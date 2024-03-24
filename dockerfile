FROM node:20-alpine

WORKDIR /usr/src/app

COPY . .

RUN npm install

RUN apk --no-cache add \
    udev \
    ttf-freefont \
    chromium \
    harfbuzz \
    nss

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD true

ENV PUPPETEER_EXECUTABLE_PATH '/usr/bin/chromium-browser'

CMD ["node", "main.js"]
