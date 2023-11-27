# Use an official Node.js runtime as a parent image
FROM node:18.17.0

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install the Node.js application dependencies
RUN npm install

# Install the Node.js application dependencies

# Copy the rest of your application's source code to the container
COPY . .

RUN npm run build

# Expose a port (e.g., 3000) that your Node.js application will listen on
EXPOSE 8081

# Define the command to run your Node.js application
CMD [ "node", "dist/index.js" ]
