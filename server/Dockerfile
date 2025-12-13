FROM node:20-slim

# PILLAR 2: DEPENDENCIES
# Install OpenSSL for Mongo/Prisma and tools for Tectonic
# SYSTEM DEPENDENCIES (Pillar 5)
# Added: libfontconfig1, libgraphite2-3, libharfbuzz0b, libicu-dev for Tectonic
RUN apt-get update && apt-get install -y \
    openssl \
    libssl-dev \
    ca-certificates \
    curl \
    libfontconfig1 \
    libgraphite2-3 \
    libharfbuzz0b \
    libicu-dev \
    zlib1g-dev \
    --no-install-recommends

# INSTALL TECTONIC (The PDF Engine)
RUN curl --proto '=https' --tlsv1.2 -fsSL https://drop-sh.fullyjustified.net | sh && \
    mv tectonic /usr/local/bin/

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 3001
CMD ["node", "index.js"]