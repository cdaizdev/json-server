#!/usr/bin/env node
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 4000;

function readDatabase() {
    const dbArg = process.argv[2] || 'db.json';
    const dbPath = path.resolve(process.cwd(), dbArg);
    try {
        const rawData = fs.readFileSync(dbPath, 'utf-8');
        return JSON.parse(rawData);
    } catch (error) {
        console.error('❌ Error en la base de datos:', error.message);
        process.exit(1);
    }
}

function writeDatabase(data) {
    const dbArg = process.argv[2] || 'db.json';
    const dbPath = path.resolve(process.cwd(), dbArg);
    fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
}

const server = http.createServer((req, res) => {
    // 1. Configuración de CORS y Headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Content-Type', 'application/json');

    if (req.method === 'OPTIONS') {
        res.writeHead(204);
        res.end();
        return;
    }

    const db = readDatabase();
    const urlParts = req.url.split('/').filter(p => p); // Ejemplo: "/users/1" -> ["users", "1"]
    const resource = urlParts[0];
    const id = urlParts[1];

    // 2. Manejo de GET (Leer)
    if (req.method === 'GET') {
        if (!resource) {
            res.writeHead(200);
            return res.end(JSON.stringify({ message: "Welcome to Mini JSON Server", resources: Object.keys(db) }));
        }

        if (!db[resource]) {
            res.writeHead(404);
            return res.end(JSON.stringify({ error: "Not Found" }));
        }

        let data = db[resource];
        if (id) {
            data = data.find(item => item.id == id);
            if (!data) {
                res.writeHead(404);
                return res.end(JSON.stringify({ error: "Item Not Found" }));
            }
        }

        res.writeHead(200);
        return res.end(JSON.stringify(data));
    }

    // 3. Manejo de POST (Crear)
    if (req.method === 'POST' && resource && db[resource]) {
        let body = '';
        req.on('data', chunk => { body += chunk.toString(); });
        req.on('end', () => {
            try {
                const newItem = JSON.parse(body);
                // Autoincrementar ID si es una lista
                if (Array.isArray(db[resource])) {
                    newItem.id = Date.now(); // ID simple basado en tiempo
                    db[resource].push(newItem);
                    writeDatabase(db);
                    res.writeHead(201);
                    res.end(JSON.stringify(newItem));
                } else {
                    res.writeHead(400);
                    res.end(JSON.stringify({ error: "Resource is not an array" }));
                }
            } catch (e) {
                res.writeHead(400);
                res.end(JSON.stringify({ error: "Invalid JSON body" }));
            }
        });
        return;
    }

    // Ruta no soportada
    res.writeHead(404);
    res.end(JSON.stringify({ error: "Route not supported" }));
});

server.listen(PORT, () => {
    console.log(`
    🚀 MINI-JSON-SERVER corriendo en http://localhost:${PORT}
    📂 Usando archivo: ${process.argv[2] || 'db.json'}
    💡 Rutas detectadas: ${Object.keys(readDatabase()).map(r => `/${r}`).join(', ')}
    `);
});