FROM node:14-alpine

# Set the working directory in the container
WORKDIR /usr/src/chaincode

# Copy package.json to the working directory
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code to the working directory
COPY . .

