# Dockerfile to dockerize an API Proxy that redirects requests to OpenAI endpoint

# Base image
FROM node:16

# Set the working directory
WORKDIR /app

# Copy the package.json and package-lock.json files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Expose the application port
EXPOSE 3000

# Command to start the server
CMD [ "npm", "start" ]
