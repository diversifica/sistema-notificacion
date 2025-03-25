FROM node:20-alpine

WORKDIR /app

RUN npm init -y && npm install express

RUN echo 'const express = require("express"); const app = express(); app.get("/", (req, res) => res.send("<h1>Sistema de Notificación de Altas y Bajas</h1><p>Implementación básica completada con éxito</p>")); app.listen(3000, () => console.log("Servidor iniciado en puerto 3000"));' > index.js

EXPOSE 3000

CMD ["node", "index.js"]
