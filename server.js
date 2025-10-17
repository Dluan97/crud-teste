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
    const { titulo, descricao, imagem } = req.body;
    if (!titulo) return res.status(400).json({ error: "Campo 'titulo' é obrigatório. "});

    const sql = "INSERT INTO projetos (titulo, descricao, imagem) VALUES (?, ?, ?)";
    db.run(sql [titulo, descricao || "", imagem || ""], function (err) {
        if (err) return res.status(500).json({error: err.message });
        res.status(201).json({ id: this.lastID, titulo, descricao, imagem});
    });
});

// PUT /projetos/:id -> atualizar

app.put("/projetos/:id", (req, res) => {
    const { id } = req.params;
    const { titulo, descricao, imagem } = req.body;
    if (!titulo) return res.status(400).json({ error: "Campo 'titulo' é obrigatório."});

    const sql = "UPDATE projetos SET titulo = ?, descricao = ? imagem = ? WHERE id = ?";
    db.run(sql, [titulo, descricao || "", imagem || "", id], function (err) {
        if (err) return res.status(500).json({ error: err.message });
        if (this.changes === 0) return res.status(404).json({ error: "Projeto não encontrado"});
        res.json({ id, titulo, descricao, imagem});
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

// ROTA GET - Listar todos os projetos
app.get("/projetos", (req, res) => {
    const sql = "SELECT * FROM projetos";

    db.all(sql, [], (err, rows) => {
        if (err) {
            console.error(err);
            res.status(500).json({error: "Erro ao buscar projetos"});
        } else {
            res.json(rows);
        }
    });
});