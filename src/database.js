const fs = require('fs-extra');
const path = require('path');

const USERS_PATH = path.join(__dirname, '../data/users.json');

function cargarUsuarios() {
    if (!fs.existsSync(USERS_PATH)) {
        fs.writeJsonSync(USERS_PATH, {});
    }
    return fs.readJsonSync(USERS_PATH);
}

function guardarUsuarios(data) {
    fs.writeJsonSync(USERS_PATH, data, { spaces: 2 });
}

function getUsuario(jid) {
    const db = cargarUsuarios();
    if (!db[jid]) {
        db[jid] = {
            nombre: jid.split('@')[0],
            monedas: 200,
            ultimoDiario: null,
            inventario: [],
            nivel: 1,
            experiencia: 0
        };
        guardarUsuarios(db);
    }
    return db[jid];
}

function guardarUsuario(jid, datos) {
    const db = cargarUsuarios();
    db[jid] = datos;
    guardarUsuarios(db);
}

function agregarMonedas(jid, cantidad) {
    const usuario = getUsuario(jid);
    usuario.monedas += cantidad;
    guardarUsuario(jid, usuario);
    return usuario.monedas;
}

function quitarMonedas(jid, cantidad) {
    const usuario = getUsuario(jid);
    if (usuario.monedas < cantidad) return false;
    usuario.monedas -= cantidad;
    guardarUsuario(jid, usuario);
    return true;
}

module.exports = { getUsuario, guardarUsuario, agregarMonedas, quitarMonedas, cargarUsuarios };
