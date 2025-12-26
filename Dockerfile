# Use an official Node.js runtime as a parent image
FROM node:18-alpine

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install app dependencies
# Use npm ci for deterministic, faster, and safer builds in production
RUN npm ci --only=production

# Copy the rest of the application's source code
COPY . .

# The node image comes with a non-root 'node' user.
# Let's use it for better security.
USER node

# Make port 5050 available to the world outside this container
EXPOSE 5050

# Define the command to run your app
CMD ["node", "src/server.js"]