# Use Bullseye slim to get apt-get
FROM node:18-bullseye-slim

# Install R, Python, and Java (Required for PySpark)
RUN apt-get update && apt-get install -y \
    r-base \
    python3 \
    python3-pip \
    default-jre

# Install PySpark and Pandas
RUN pip3 install pyspark pandas

# Set the working directory
WORKDIR /app

# Copy package.json and install Node dependencies
COPY package*.json ./
RUN npm install

# Copy all files
COPY . .

# Expose the API port
EXPOSE 5000

# Start the server
CMD ["npm", "start"]