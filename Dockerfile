FROM node:20

# Set the working directory
WORKDIR /app

# Copy root package files
COPY package*.json ./

# Copy the entire project
COPY . .

# Install dependencies for the whole workspace
RUN npm install --legacy-peer-deps

# Build the frontend
RUN npm run build --workspace=frontend

# Expose the port the app runs on
EXPOSE 5000

# Start the application
CMD ["npm", "start"]
