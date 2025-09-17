const { subscribe } = require("diagnostics_channel");
const fs = require("fs");

let grupos = {}; // se carga vacío al inicio

// Cargar grupos desde archivo (si existe)
function cargarGrupos() {
  try {
    const data = fs.readFileSync("grupos.json", "utf8");
    grupos = JSON.parse(data);
  } catch (error) {
    grupos = {}; // si no existe, queda vacío
  }
}
function guardarGrupos() {
  fs.writeFileSync("grupos.json", JSON.stringify(grupos, null, 2));
}

let blockedUsers = new Set(); // inicializamos como Set

function cargarBloqueados() {
  try {
    const data = fs.readFileSync("blockeados.json", "utf8");
    const array = JSON.parse(data);
    blockedUsers = new Set(array);
  } catch (error) {
    console.log(error); // error.stringify no existe
  }
}

function guardarBloqueados() {
  // Guardamos como array porque JSON no sabe serializar Set
  fs.writeFileSync("blockeados.json", JSON.stringify([...blockedUsers], null, 2));
}

function userIsBloqued(id){
  return blockedUsers.has(id)
}
function   bloquearUser(id){
  blockedUsers.add(id)
  guardarBloqueados()
}
function desbloquearUser(id){
  blockedUsers.delete(id)
  guardarBloqueados()
}
// Obtener todos los grupos
function getGrupos() {
  return grupos;
}
function gruposHas(grup){
  return grupos[grup]
}
function idIsInGrupo(grupo,id){
  gaux=grupos[grupo]
  aux = false
  gaux.forEach(autor => {
    if (autor.id === id ) aux= true;
  });
  return aux;
}
function showGrupos(){
  let msg = "@silent Grupos:\n";
        for (const [grupo, usuarios] of Object.entries(grupos)) {
            const menciones = usuarios.map(autor => `<${autor.name}>`).join(" ");
            msg += `- ${grupo}: ${menciones}\n`;
        }
      return msg;
}
function subscribirGrupo(grupo,autor){
  grupos[grupo].push(autor);
  guardarGrupos()
}
function desubscribirGrupo(grupo,autor){
  grupos[grupo] =grupos[grupo].filter(a => a.id !== autor.id);;
  guardarGrupos()
}

function crearGrupoNuevo(grupo){
  grupos[grupo] =[]
  guardarGrupos()
}
module.exports = {
  crearGrupoNuevo,
  cargarGrupos,
  cargarBloqueados,
  guardarGrupos,
  guardarBloqueados,
  getGrupos,
  gruposHas,
  idIsInGrupo,
  subscribirGrupo,
  desubscribirGrupo,
  showGrupos,
  userIsBloqued,
  bloquearUser,
  desbloquearUser
};

