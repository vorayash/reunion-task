# First stage: build the Node.js application
FROM node:14 AS build

# Set the working directory to /app
WORKDIR /app

# Copy the current directory contents into the container at /app
COPY . /app

# Install any needed packages
RUN npm install

# Second stage: include MongoDB in the image
FROM mongo:latest AS mongo

# Set the working directory to /data/db
WORKDIR /data/db

# Third stage: create the final image
FROM node:14

# Set the working directory to /app
WORKDIR /app

# Copy the Node.js application files from the build stage
COPY --from=build /app /app

# Copy the MongoDB data files from the mongo stage
COPY --from=mongo /data/db /data/db

# Expose port 3000 for the Node.js app and 27017 for MongoDB
EXPOSE 8000 27017

# Start the Node.js server
CMD ["npm", "start"]