#!/usr/bin/env node
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 4000;
const DB_FILE = path.join(__dirname, 'db.json');

const server = http.createServer((req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.writeHead(204);
        res.end();
        return;
    }

    if (req.url === '/api/tasks' && req.method === 'GET') {
        const data = fs.readFileSync(DB_FILE, 'utf-8');
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(data);
    } 
    
    else if (req.url === '/api/tasks' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => { body += chunk.toString(); });
        req.on('end', () => {
            const newTask = JSON.parse(body);
            const db = JSON.parse(fs.readFileSync(DB_FILE, 'utf-8'));
            
            db.columns[0].tasks.push({ id: Date.now(), ...newTask });
            
            fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2));
            res.writeHead(201, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ message: 'Guardado correctamente' }));
        });
    } 
    
    else {
        res.writeHead(404);
        res.end(JSON.stringify({ error: 'Ruta no encontrada' }));
    }
});

server.listen(PORT, () => {
    console.log(`🚀 Mini-Server corriendo en http://localhost:${PORT}`);
});