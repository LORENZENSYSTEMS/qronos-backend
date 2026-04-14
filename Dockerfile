FROM node:22-slim
RUN apt-get update -y && apt-get install -y openssl
WORKDIR /app

# Copiamos archivos de configuración
COPY package*.json ./
COPY prisma ./prisma/

# Instalamos y generamos Prisma
RUN npm install
RUN npx prisma generate

# Copiamos todo el resto (incluyendo tu main.js y la carpeta src)
COPY . .

EXPOSE 3000

# CAMBIO AQUÍ: Ejecutamos main.js que está en la raíz del proyecto
CMD ["node", "main.js"]