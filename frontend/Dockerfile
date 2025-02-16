FROM node:18-bullseye

WORKDIR /app

COPY my-kyc-appp/package.json my-kyc-appp/package-lock.json ./
RUN npm install

COPY my-kyc-appp ./

# Fix for Vite: Force Node.js to enable OpenSSL Crypto API
ENV NODE_OPTIONS=--openssl-legacy-provider

CMD ["npm", "run", "dev"]
