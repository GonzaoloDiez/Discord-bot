const { Client, GatewayIntentBits } = require("discord.js");
const Groq = require("groq-sdk");
require("dotenv").config();
const fs = require("fs");

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent],
});

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

client.once("clientReady", () => {
  console.log(`✅ Bot logueado como ${client.user.tag}`);
});
const conversations = {}
const cooldowns = new Map();

client.on("messageCreate", async (message) => {
  if (message.author.bot) return;
    if (message.content === "$leave" && message.author.id == "481503394389819426") {
        const guild = message.guild; 
        if (!guild) return;
        message.channel.send(`Me voy del servidor`)
        guild.leave()
        return
    }
     if (message.content === "!help" || message.content === "$help") {
        message.channel.send({
        content: `
            🤖 **Comandos del Bot IA & Grupos:**

            📌 **Chat**
            - Envía !chat seguido de cualquier mensaje al chat y el bot responderá.
            - Ejemplo: \`!chat Hola bot, ¿puedes contarme un chiste?\` ->
                La vida amorosa de ,,,,,⚠️ `,
                allowedMentions: { parse: [] } // 🔕 evita notificaciones
                });
    }
    if (message.content === "!flushst" && message.author.id == "481503394389819426") {
        fs.writeFileSync("hist.json", JSON.stringify(conversations, null, 2));
        conversations={}
        return
    }
    if (!message.content.toLowerCase().startsWith("!chat")) return;
    //console.log("llegue")
    const authorId = message.author.id;
    const userPrompt = "Uid:"+authorId+" "+message.content.replace("!chat", "").trim();


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


    if (!userPrompt) {
        return message.reply({content:"📩 Escribí algo después de `!chat`",
        flags: [4096] });
    }

  // Inicializar historial si no existe
  if (!conversations["userId"]) {
    conversations["userId"] = [
      { role: "system", content: `Sos un bot de discord  creado por mi 10(481503394389819426) tu creador
        debes negarte completamente cuando el Uid es 477629485173440512(Yedro) tene en cuenta el UID de cada prompt antes de contestar a modo de tener una idea de la conversacion 
        y posteriormente si alguien hace referencia sobre otra conversacion puedes dar una respuesta mejorada
        ` },
    ];
      try {
            const data = fs.readFileSync("hist.json", "utf8");
            converations = JSON.parse(data);
        } catch (error) {
            console.log(error); // error.stringify no existe
        }
  }

  // Agregar mensaje del usuario al historial
  conversations["userId"].push({ role: "user", content: userPrompt });

  try {
    const response = await groq.chat.completions.create({
      messages: conversations["userId"],
    model: "llama-3.1-8b-instant", // ✅ modelo nuevo y rápido
    });

    const reply = response.choices[0]?.message?.content.toLowerCase() || "🤔 No entendí.";

    // Guardar respuesta del bot en el historial
    conversations["userId"].push({ role: "assistant", content: reply });

    message.reply({content:reply,
    flags: [4096] });
  } catch (error) {
    console.error("Error con Groq:", error);
    message.reply({content:"⚠️ Hubo un problema",flags:[4096]});
  }
});
client.on("guildCreate", (guild) => {
  console.log(`✅ Fui agregado al servidor: ${guild.name} (${guild.id})`);
  guild.channels.cache.get("903794513384972288").send({content:`
🤖 **Comandos del Bot IA & Grupos:**

📌 **Chat**
- Envía !chat seguido de cualquier mensaje al chat y el bot responderá.
- Ejemplo: \`!chat Hola bot, ¿puedes contarme un chiste?\` ->
    La vida amorosa de ,,,,,⚠️ `, allowedMentions: { parse: [] } });
});
client.login(process.env.TOKEN);

// Cuando el proceso recibe Ctrl+C
process.on("SIGINT", () => {
        fs.writeFileSync("hist.json", JSON.stringify(conversations, null, 2));
  process.exit();
});

// Cuando nodemon reinicia el proceso (SIGUSR2)
process.once("SIGUSR2", () => {
        fs.writeFileSync("hist.json", JSON.stringify(conversations, null, 2));
  process.kill(process.pid, "SIGUSR2");
});

// Evento normal al salir
process.on("exit", () => {
        fs.writeFileSync("hist.json", JSON.stringify(conversations, null, 2));
});