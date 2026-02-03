# ============================
# Base image (ringan & stabil)
# ============================
FROM node:18-slim

# ============================
# Install system dependencies
# ============================
RUN apt-get update && apt-get install -y \
    poppler-utils \
    tesseract-ocr \
    libtesseract-dev \
    ghostscript \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# ============================
# Set working directory
# ============================
WORKDIR /app

# ============================
# Copy package files
# ============================
COPY package*.json ./

# ============================
# Install dependencies
# ============================
RUN npm install --production

# ============================
# Copy source code
# ============================
COPY . .

# ============================
# Expose port (samakan dgn server.js)
# ============================
EXPOSE 3000

# ============================
# Start app
# ============================
CMD ["npm", "start"]