# Use an official Node.js runtime as a parent image
FROM node:18-alpine

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json from server directory
COPY server/package.json ./
COPY server/package-lock.json ./

# Install app dependencies
RUN npm install

# Copy the server source code
COPY server/ ./

# Make port 5050 available to the world outside this container
EXPOSE 5050

# Define the command to run your app
CMD ["node", "src/server.js"]