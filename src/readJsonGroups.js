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

// Guardar grupos en archivo
function guardarGrupos() {
  fs.writeFileSync("grupos.json", JSON.stringify(grupos, null, 2));
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
  guardarGrupos,
  getGrupos,
  gruposHas,
  idIsInGrupo,
  subscribirGrupo,
  desubscribirGrupo,
  showGrupos
};

