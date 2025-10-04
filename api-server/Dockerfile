FROM node:20-alpine
WORKDIR /app
COPY package.json package-lock.json* ./
# Install production deps but ignore an out-of-date package-lock so new deps from package.json are installed
RUN npm install --production --no-package-lock --no-audit --no-fund
COPY . .
EXPOSE 4000
# Use server.js which starts the HTTP listener (index.js exports the app for tests)
CMD ["node", "src/server.js"]
