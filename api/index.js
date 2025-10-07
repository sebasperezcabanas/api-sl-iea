const express = require("express");
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.get("/", (req, res) => {
  res.json({ mensaje: "Bienvenido a API SL IEA" });
});

app.listen(PORT, () => {
  console.log(`Servidor API SL IEA corriendo en puerto ${PORT}`);
});
