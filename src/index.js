require("dotenv").config();
const {Client, IntentsBitField, time, Message} = require("discord.js")
const { guardarGrupos,cargarGrupos,showGrupos,gruposHas,desubscribirGrupo,
     getGrupos,idIsInGrupo,crearGrupoNuevo,subscribirGrupo } = require("./readJsonGroups");
const { cargarBloqueados,userIsBloqued,bloquearUser,desbloquearUser } = require("./readJsonGroups");


const bot = new Client({
    intents: [
        IntentsBitField.Flags.Guilds,
        IntentsBitField.Flags.GuildMembers,
        IntentsBitField.Flags.GuildMessages,
        IntentsBitField.Flags.MessageContent,
    ]
})

function helpMessage() {
    return `
📜 **Comandos del bot:**

- \`$<nombre_del_grupo>\` → Invoca al grupo y menciona a sus integrantes
- \`$showgroups\` → Muestra todos los grupos y sus integrantes
- \`$makegroup-<nombre_del_grupo>\` → Crea un nuevo grupo
- \`$sub/unsub-<nombre_del_grupo>\` → Te suscribe/desuscribe a un grupo existente
- los comandos pueden estar separados por ";"
- los comandos con cosas feas seran baneados 
Ejemplo:
\`$cs\` → Llama al grupo cs
\`$cs;$cs\` → Llama al grupo cs 2 veces
\`$sub-vengadores\` → Te suscribes al grupo Vengadores

`;
}
bot.on("clientReady",(c) => {
    console.log( `Client ready ${c.user.tag}: ` + new Date(Date.now()).toString())    
}); 

cargarGrupos()
cargarBloqueados()
// Mapa para guardar quién usó un comando y cuándo
const cooldowns = new Map();

bot.on("messageCreate", (mensaje) => {
    if (mensaje.author.bot) return;
    if (!mensaje.content.startsWith("$")) return;
    if (!mensaje.content === "$leave" && idAutor == "481503394389819426") {
        const guild = mensaje.guild; 
        if (!guild) return;
        mensaje.channel.send(`Me voy del servidor`)
        guild.leave()
        return
    }
    const contenidoDeMensaje = mensaje.content.toLowerCase();

    if (contenidoDeMensaje === "$help") return silentReply(mensaje, helpMessage());
    const author = {"id": mensaje.author.id, "name": mensaje.member.displayName};
    const authorId = mensaje.author.id;

    if(contenidoDeMensaje.startsWith("$#unblock678-")){
        console.log("entro "+contenidoDeMensaje.split("-")[1])
        desbloquearUser(contenidoDeMensaje.split("-")[1])
        return 
    }
    if (userIsBloqued(authorId)) return;
    
  
    const ahora = Date.now();
    const cooldown = 2000; 
    // Si ya usó un comando y no pasó el cooldown
    if (cooldowns.has(authorId)) {
        const ultimoUso = cooldowns.get(authorId);
        if (ahora - ultimoUso < cooldown) {
            return 
        }
    }
    // Guardar el tiempo actual como último uso
    cooldowns.set(authorId, ahora);


    contenidoDeMensaje.split(";").forEach((comando) => {
        atenderPedidos(mensaje, author, comando.trim());
    });
});


function silentReply(mensaje, contenido) {
  return mensaje.reply({
    content: contenido,
    flags: [4096] // SuppressNotifications
  });
}

function atenderPedidos(mensaje, author, contenidoDeMensaje) {
  const idAutor = author.id;
    const prohibidas = ["hentai", "furry", "sex", "porn","cul","dik","dic","ass","pito","pene"];
    if (prohibidas.some(p => contenidoDeMensaje.includes(p))) {
        mensaje.reply(`<@everyone> baneen al sucio de <@${author.id}> 
             no te voy a dar bola nunca mas`);
        bloquearUser(idAutor);
        return 
    }
  if (contenidoDeMensaje.startsWith("$sub-")) {
    const grupo = mensaje.content.split("-")[1].toLowerCase();
    if (!grupo) return silentReply(mensaje, "⚠️ Tenés que poner un grupo.");
    if (!gruposHas(grupo)) return silentReply(mensaje, `no existe tal grupo`);
    if (!idIsInGrupo(grupo, idAutor)) {
      subscribirGrupo(grupo, author);
      return silentReply(mensaje, `✅ Estas en el grupo **${grupo}**`);
    } else {
      return silentReply(mensaje, `Ya estabas en el grupo **${grupo}**`);
    }
  }

  if (contenidoDeMensaje.startsWith("$unsub-")) {
    const grupo = mensaje.content.split("-")[1].toLowerCase();
    if (!grupo) return silentReply(mensaje, "⚠️ Tenés que poner un grupo.");
    if (!gruposHas(grupo)) return silentReply(mensaje, `no existe tal grupo`);
    if (idIsInGrupo(grupo, idAutor)) {
      desubscribirGrupo(grupo, author);
      return silentReply(mensaje, `Saliste del grupo **${grupo}**`);
    }
  }

  if (contenidoDeMensaje.startsWith("$makegroup-") && 
  !(contenidoDeMensaje.split("-")[1].toLowerCase() == "leave" || contenidoDeMensaje.split("-")[1].toLowerCase() == "help" )) {
    const grupo = contenidoDeMensaje.split("-")[1].toLowerCase();
    if (!grupo) return silentReply(mensaje, "⚠️ Tenés que poner un grupo.");
    if (gruposHas(grupo)) return silentReply(mensaje, `Ya existe ${grupo}`);
    else {
      crearGrupoNuevo(grupo);
      return silentReply(mensaje, `Creado el grupo **${grupo}**`);
    }
  }

  if (contenidoDeMensaje.startsWith("$showgroups")) {
    return silentReply(mensaje, showGrupos());
  } else {
    if (contenidoDeMensaje.startsWith("$")) {
      const grupo = contenidoDeMensaje.slice(1);
      if (!gruposHas(grupo))
        return silentReply(mensaje, `no existe el grupo ${grupo} o no entendi el comando`);

      const grupos = getGrupos();
      const menciones = grupos[grupo].map(autor => `<@${autor.id}>`).join(" ");
      return mensaje.channel.send({
        content: `Sale ${grupo}? ${menciones}`
      });
    }
  }
}



bot.login(process.env.TOKEN)


process.on("exit", () => {
    console.log("💾 Guardando grupos antes de salir...");
    guardarGrupos();
});
