#!/usr/bin/env node
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 4000;

/**
 * Función para leer la base de datos de forma segura
 * @returns {Object} El contenido del JSON
 */
function readDatabase() {
    const dbArg = process.argv[2] || 'db.json';
    
    const dbPath = path.resolve(process.cwd(), dbArg);

    try {
        if (!fs.existsSync(dbPath)) {
            console.error(`Error: El archivo ${dbArg} no existe en ${process.cwd()}`);
            process.exit(1);
        }

        const rawData = fs.readFileSync(dbPath, 'utf-8');
        return JSON.parse(rawData);
    } catch (error) {
        console.error('Error al leer o procesar la base de datos:');
        console.error(error.message);
        process.exit(1);
    }
}

/**
 * Función para guardar la base de datos
 */
function writeDatabase(data) {
    const dbArg = process.argv[2] || 'db.json';
    const dbPath = path.resolve(process.cwd(), dbArg);
    
    try {
        fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
    } catch (error) {
        console.error('Error al escribir en el archivo db.json:');
        console.error(error.message);
    }
}

const server = http.createServer((req, res) => {
    try {
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

        if (req.method === 'OPTIONS') {
            res.writeHead(204);
            res.end();
            return;
        }

        const db = readDatabase();

       
        
        else {
            res.writeHead(404);
            res.end(JSON.stringify({ error: 'Ruta no encontrada' }));
        }
});

server.listen(PORT, () => {
    console.log(`
    🚀 MINI-JSON-SERVER corriendo en http://localhost:${PORT}
    📂 Usando archivo: ${process.argv[2] || 'db.json'}
    💡 Presiona Ctrl+C para detener
    `);
});