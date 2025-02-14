FROM node:16

WORKDIR /app

# Copy package.json and install dependencies
COPY package.json .
RUN npm install

# Copy the rest of the project
COPY . .

# Start the application
CMD ["npm", "start"]
