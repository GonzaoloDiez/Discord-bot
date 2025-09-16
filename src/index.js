require("dotenv").config();
const {Client, IntentsBitField, time, Message} = require("discord.js")
const { cargarGrupos,showGrupos,gruposHas,desubscribirGrupo, getGrupos,idIsInGrupo,crearGrupoNuevo,subscribirGrupo  } = require("./readJsonGroups");


const bot = new Client({
    intents: [
        IntentsBitField.Flags.Guilds,
        IntentsBitField.Flags.GuildMembers,
        IntentsBitField.Flags.GuildMessages,
        IntentsBitField.Flags.MessageContent,
    ]
})

function helpMessage() {
    return `@silent
📜 **Comandos del bot:**

- \`$<nombre_del_grupo>\` → Invoca al grupo y menciona a sus integrantes
- \`$showgroups\` → Muestra todos los grupos y sus integrantes
- \`$makegroup-<nombre_del_grupo>\` → Crea un nuevo grupo
- \`$sub/unsub-<nombre_del_grupo>\` → Te suscribe/desuscribe a un grupo existente
Ejemplo:
\`$cs\` → Llama al grupo cs
\`$sub-vengadores\` → Te suscribes al grupo Vengadores
`;
}
bot.on("clientReady",(c) => {
    console.log( `Client ready ${c.user.tag}: ` + new Date(Date.now()).toString())    
}); 

cargarGrupos()

bot.on("messageCreate", (mensaje)=>{
    if (mensaje.content.bot|| !mensaje.content.startsWith("$") ){
        return;
    }
    const contenidoDeMensaje = mensaje.content.toLowerCase()
    const author= {"id":mensaje.author.id,"name":mensaje.author.displayName};
    contenidoDeMensaje.split(";").forEach((commando)=>{atenderPedidos(mensaje,author,commando)})
})

function atenderPedidos(mensaje,author,contenidoDeMensaje){
    const idAutor = author.id;
    if (contenidoDeMensaje === "$help") return mensaje.reply(helpMessage());
    if (contenidoDeMensaje.startsWith("$sub-")) {
        const grupo = mensaje.content.split("-")[1].toLowerCase();
        if (!grupo) return mensaje.reply("@silent ⚠️ Tenés que poner un grupo.");
        if (!gruposHas(grupo))  return mensaje.reply(`no existe tal crupo`);
        if (!idIsInGrupo(grupo,idAutor)) {
            subscribirGrupo(grupo,author);
           return  mensaje.reply(`@silent ✅ Estas en el grupo **${grupo}**`);
        } 
        else {
            return mensaje.reply(`@silent Ya estabas en el grupo **${grupo}**`);
        }
    }
    if (contenidoDeMensaje.startsWith("$unsub-")) {
        const grupo = mensaje.content.split("-")[1].toLowerCase();
        if (!grupo) return mensaje.reply("@silent ⚠️ Tenés que poner un grupo.");
        if (!gruposHas(grupo))  return mensaje.reply(`@silent no existe tal grupo`);
        if (idIsInGrupo(grupo,idAutor)) {
            desubscribirGrupo(grupo,author);
           return  mensaje.reply(`@silent Saliste del grupo **${grupo}**`);
        }
    }
    if (contenidoDeMensaje.startsWith("$makegroup-")) {
        const grupo = contenidoDeMensaje.split("-")[1].toLowerCase();
        if (!grupo) return mensaje.reply("@silent ⚠️ Tenés que poner un grupo.");
        if (gruposHas(grupo)) return  mensaje.reply(`@silent Ya existe ${grupo}`);
        else {
            crearGrupoNuevo(grupo)
           return  mensaje.reply(`@silent Creado el grupo **${grupo}**`);
        }
    }
    if (contenidoDeMensaje.startsWith("$showgroups")) {
        return mensaje.reply(showGrupos());
    }
    else { 
        if (contenidoDeMensaje.startsWith("$")){
            const grupo = contenidoDeMensaje.slice(1)
            if (!gruposHas(grupo)) return mensaje.reply(`@silent no existe el grupo ${grupo} o no entendi el comando`);
            const grupos = getGrupos() 
            const menciones = grupos[grupo].map(autor => `<@${autor.id}>`).join(" ");
            return mensaje.channel.send(`Sale ${grupo}? ${menciones}`);
        }
    }
}


bot.login(process.env.TOKEN)


process.on("exit", () => {
    console.log("💾 Guardando grupos antes de salir...");
    guardarGrupos();
});
