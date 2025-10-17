const express = require("express");
const cors = require("cors");
const db = require("./db/connection.js");


const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true}));

// --- ROTAS CRUD ---

// GET /projetos -> lista todos

app.get("/projetos", (req, res) => {
    db.all("SELECT * FROM projetos ORDER BY id DESC", (err, rows) => {
        if (err) return res.status(500).json({ error: err.message});
        res.json(rows);
    });
});

// GET /projetos/:id -> pega 1

app.get("/projetos/:id", (req, res) => {
    const { id } = req.params;
    db.get("SELECT * FROM projetos WHERE id = ?", [id], (err, row) => {
        if (err) return res.status(500).json({ error: err.message});
        if (!row) return res.status(404).json({ error: "Projeto não encontrado"});
        res.json(row);
    });
});

// POST /projetos -> cria novo

app.post("/projetos", (req, res) => {
  try {
    const { titulo, descricao, link } = req.body;

    // Validação simples
    if (!titulo) {
      console.warn("⚠️ Campo 'titulo' ausente no corpo da requisição.");
      return res.status(400).json({ error: "Campo 'titulo' é obrigatório." });
    }

    const sql = "INSERT INTO projetos (titulo, descricao, link) VALUES (?, ?, ?)";
    console.log("🟡 Executando INSERT:", sql);

    db.run(sql, [titulo, descricao, link], function (err) {
      console.log("📘 Callback executado do db.run");

      if (err) {
        console.error("❌ Erro no INSERT:", err.message);
        return res.status(500).json({ error: err.message });
      }

      console.log("✅ Projeto inserido com sucesso. ID:", this.lastID);

      res.status(201).json({
        id: this.lastID,
        titulo,
        descricao,
        link,
      });
    });
  } catch (err) {
    console.error("💥 Erro inesperado na rota POST /projetos:", err);
    res.status(500).json({ error: "Erro inesperado no servidor." });
  }
});

// PUT /projetos/:id -> atualizar

app.put("/projetos/:id", (req, res) => {
    const { id } = req.params;
    const { titulo, descricao, link } = req.body;
    if (!titulo) return res.status(400).json({ error: "Campo 'titulo' é obrigatório."});

    const sql = "UPDATE projetos SET titulo = ?, descricao = ?, link = ? WHERE id = ?";
    db.run(sql, [titulo, descricao, link, id], function (err) {
        if (err) return res.status(500).json({ error: err});
        if (this.changes === 0) return res.status(404).json({ error: "Projeto não encontrado"});
        res.json({ id, titulo, descricao, link});
    })
});

//DELETE /projetos/:id -> apaga

app.delete("/projetos/:id", (req, res) => {
    const { id } = req.params;
    db.run("DELETE FROM projetos WHERE id = ?", [id], function (err) {
        if (err) return res.status(500).json({ error: err.message});
        if (this.changes === 0) return res.status(404).json({ error: "Projeto não encontrado." });
        res.json({ deletedId: id });
    });
});

// Iniciar servidor

app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});

