# 1) Partimos de la imagen oficial de Node.js
FROM node:18-slim

# 2) Directorio de trabajo
WORKDIR /usr/src/app

# 3) Copiamos solo package.json y package-lock.json de tus funciones
COPY functions/package.json functions/package-lock.json ./

# 4) Instalamos dependencias productivas
RUN npm ci --only=production

# 5) Copiamos el código de tu función
COPY functions/index.js ./

# 6) Puerto que escuchará
ENV PORT=8080
EXPOSE 8080

# 7) Comando por defecto
CMD ["node", "index.js"]
