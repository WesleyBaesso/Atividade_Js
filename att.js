const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const app = express();
const port = 3000;

app.use(express.json());

const db = new sqlite3.Database('./itemsdb.sqlite', (err) => {
    if (err) {
        console.error('Não desceu');
    } else {
        console.log('Desceu');
    }
});

db.run(`CREATE TABLE IF NOT EXISTS items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    descricao TEXT,
    dataCriacao TEXT DEFAULT CURRENT_TIMESTAMP)`, (err) => {
    if (err) {
        console.error('Deu merda cria');
    }
});

app.post("/items", (req, res) => {
    const { name, descricao } = req.body;
    const query = `INSERT INTO items (name, descricao) VALUES (?, ?)`;

    db.run(query, [name, descricao], function (err) {
        if (err) {
            res.status(400).json({ message: err.message });
        } else {
            res.status(201).json({ id: this.lastID, name, descricao });
        }
    });
});

app.get('/items', (req, res) => {
    const query = `SELECT * FROM items`;

    db.all(query, [], (err, rows) => {
        if (err) {
            console.error({ message: err.message });
        } else {
            res.status(200).json(rows);
        }
    });
});

app.get('/items/:id', (req, res) => {
    const { id } = req.params;
    const query = `SELECT * FROM items WHERE id = ?`;

    db.get(query, [id], (err, row) => {
        if (err) {
            console.error({ message: err.message });
            res.status(400).json({ message: err.message });
        } else if (row) {
            res.status(200).json(row);
        } else {
            res.status(404).json({ message: 'Item sumiu cria' });
        }
    });
});

app.put('/items/:id', (req, res) => {
    const { id } = req.params;
    const { name, descricao } = req.body;
    const query = `UPDATE items SET name = ?, descricao = ? WHERE id = ?`;

    db.run(query, [name, descricao, id], function (err) {
        if (err) {
            res.status(400).json({ message: err.message });
        } else if (this.changes === 0) {
            res.status(404).json({ message: 'Item sumiu cria' });
        } else {
            res.status(200).json({ id, name, descricao });
        }
    });
});

app.patch('/items/:id', (req, res) => {
    const { id } = req.params;
    const { name, descricao } = req.body;
    const updates = [];
    const values = [];
    if (name) {
        updates.push('name = ?');
        values.push(name);
    }
    if (descricao) {
        updates.push('descricao = ?');
        values.push(descricao);
    }

    if (updates.length === 0) {
        return res.status(400).json({ message: 'Nada para fazer' });
    }

    values.push(id);

    const query = `UPDATE items SET ${updates.join(', ')} WHERE id = ?`;

    db.run(query, values, function (err) {
        if (err) {
            res.status(400).json({ message: err.message });
        } else if (this.changes === 0) {
            res.status(404).json({ message: 'Item sumiu cria' });
        } else {
            res.status(200).json({ id, name, descricao });
        }
    });
});

app.delete('/items/:id', (req, res) => {
    const { id } = req.params;
    const query = `DELETE FROM items WHERE id = ?`;

    db.run(query, [id], function (err) {
        if (err) {
            res.status(400).json({ message: err.message });
        } else if (this.changes === 0) {
            res.status(404).json({ message: 'Item sumiu cria' });
        } else {
            res.status(204).send(); 
        }
    });
});

app.listen(port, () => {
    console.log("Servidor rodando na porta http://localhost:3000");
});
