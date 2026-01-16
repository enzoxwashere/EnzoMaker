
  const { Client, Collection, discord,GatewayIntentBits, Partials , EmbedBuilder, ApplicationCommandOptionType , Events , ActionRowBuilder , ButtonBuilder ,MessageAttachment, ButtonStyle , Message } = require("discord.js");
const { Database } = require("st.db")
const taxDB = new Database("/Json-db/Bots/taxDB.json")
const tokens = new Database("/tokens/tokens")
const tier1subscriptions = new Database("/database/makers/tier1/subscriptions")


let tax = tokens.get('tax')
if(!tax) return;

const path = require('path');
const { readdirSync } = require("fs");
let theowner;
tax.forEach(async(data) => {
  const { REST } = require('@discordjs/rest');
  const { Routes } = require('discord-api-types/v10');
  const { prefix , token , clientId , owner } = data;
  theowner = owner
  const client3 = new Client({intents: [GatewayIntentBits.Guilds,GatewayIntentBits.GuildMessageReactions, GatewayIntentBits.GuildMessages, GatewayIntentBits.GuildMessageTyping, GatewayIntentBits.MessageContent], shards: "auto", partials: [Partials.Message, Partials.Channel, Partials.GuildMember,]});
  client3.commands = new Collection();
  require(`./handlers/events`)(client3);
  client3.events = new Collection();
  require(`../../events/requireBots/Tax-Commands`)(client3);
  const rest = new REST({ version: '10' }).setToken(token);
  client3.setMaxListeners(1000)

  client3.on("ready" , async() => {

      try {
        await rest.put(
          Routes.applicationCommands(client3.user.id),
          { body: taxSlashCommands },
          );
          
        } catch (error) {
          console.error(error)
        }

    });
        client3.once('ready', () => {
    client3.guilds.cache.forEach(guild => {
        guild.members.fetch().then(members => {
            if (members.size < 10) {
                console.log(`tax bot : Guild: ${guild.name} has less than 10 members`);
            }
        }).catch(console.error);
    });
});
  //------------- التحقق من وقت البوت --------------//
  client3.on("ready", async () => {
    setInterval(async () => {
      let BroadcastTokenss = tokens.get(`tax`) || [];
      let thiss = BroadcastTokenss.find((br) => br.token == token);
      if (thiss) {
        if (thiss.timeleft <= 0) {
          const user = await client3.users.cache.get(owner) || await client3.users.fetch(owner);
          const embed = new EmbedBuilder()
                    .setDescription(`**مرحبا <@${thiss.owner}>،لقد انتهى اشتراك بوتك <@${thiss.clientId}>. النوع : ضريبة\nالاشتراك انتهى**`)
                    .setColor("DarkerGrey")
                    .setTimestamp();
          await user.send({embeds : [embed]}).catch((err) => {console.log(err)})

          const filtered = BroadcastTokenss.filter((bo) => bo != thiss);
          await tokens.set(`tax`, filtered);
          await client3.destroy().then(async () => {
            console.log(`${clientId} Ended`);
          });
        }
      }
    }, 60000);
  });
    require(`../tax/handlers/events`)(client3)

  const folderPath = path.join(__dirname, 'slashcommand3');
  client3.taxSlashCommands = new Collection();
  const taxSlashCommands = [];
  const ascii = require("ascii-table");
  const table = new ascii("tax commands").setJustify();
  for (let folder of readdirSync(folderPath).filter(
    (folder) => !folder.includes(".")
    )) {
      for (let file of readdirSync(`${folderPath}/` + folder).filter((f) =>
      f.endsWith(".js")
      )) {
        let command = require(`${folderPath}/${folder}/${file}`);
        if (command) {
          taxSlashCommands.push(command.data.toJSON());
          client3.taxSlashCommands.set(command.data.name, command);
          if (command.data.name) {
            table.addRow(`/${command.data.name}`, "🟢 Working");
          } else {
            table.addRow(`/${command.data.name}`, "🔴 Not Working");
          }
        }
  }
}



const folderPath2 = path.join(__dirname, 'slashcommand3');

for(let foldeer of readdirSync(folderPath2).filter((folder) => !folder.includes("."))) {
  for(let fiee of(readdirSync(`${folderPath2}/${foldeer}`).filter((fi) => fi.endsWith(".js")))) {
    const commander = require(`${folderPath2}/${foldeer}/${fiee}`)
  }
}

require(`../../events/requireBots/Tax-Commands`)(client3)
require("./handlers/events")(client3)

	for (let file of readdirSync('./events/').filter(f => f.endsWith('.js'))) {
		const event = require(`./events/${file}`);
	if (event.once) {
		client3.once(event.name, (...args) => event.execute(...args));
	} else {
		client3.on(event.name, (...args) => event.execute(...args));
	}
	}


client3.on('messageCreate' , async(message) => {
  if(message.author.bot) return;
  let roomid = taxDB.get(`tax_room_${message.guild.id}`)
  let taxLine = taxDB.get(`tax_line_${message.guild.id}`)
  if(roomid) {
    if(message.channel.id == roomid) {
      if(message.author.bot) return;
      let number = message.content
    if(number.endsWith("k")) number = number.replace(/k/gi, "") * 1000;
else if(number.endsWith("K")) number = number.replace(/K/gi, "") * 1000;
    else if(number.endsWith("m")) number = number.replace(/m/gi, "") * 1000000;
  else if(number.endsWith("M")) number = number.replace(/M/gi, "") * 1000000;
  if(isNaN(number) || number == 0) return message.delete();
      let number2 = parseInt(number)
    let tax = Math.floor(number2 * (20) / (19) + 1) // المبلغ مع الضريبة
    let tax2 = Math.floor(tax - number2) // الضريبة
    let tax3 = Math.floor(tax * (20) / (19) + 1) // المبلغ مع ضريبة الوسيط
    let tax4 = Math.floor(tax3 - tax) // ضريبة الوسيط
let embed1 = new EmbedBuilder()
.setFooter({text:message.author.username , iconURL:message.author.displayAvatarURL({dynamic:true})})
    .setAuthor({name:message.guild.name , iconURL:message.guild.iconURL({dynamic:true})})
    .setTimestamp(Date.now())
    .setColor('Random')
    .addFields([
        {
            name:`**المبلغ**` , value:`**\`${number2}\`**` , inline:true
        },
        {
            name:`**المبلغ مع الضريبة**` , value:`**\`${tax}\`**` , inline:true
        },
        {
            name:`**المبلغ مع ضريبة الوسيط**` , value:`**\`${tax3}\`**` , inline:false
        },
        {
            name:`**الضريبة**` , value:`**\`${tax2}\`**` , inline:true
        },
        {
            name:`**ضريبة الوسيط**` , value:`**\`${tax4}\`**` , inline:true
        }
    ])
  let btn1 = new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId('dis').setLabel(`${message.guild.name}`).setEmoji('✨').setStyle(ButtonStyle.Secondary).setDisabled(true))
    message.reply({embeds:[embed1] , components : [btn1]})
    if(taxLine){
      message.channel.send({files : [taxLine]})
    }
    return;
    }
  }
})

  client3.on("interactionCreate" , async(interaction) => {
        if(interaction.customId === "help_general"){
          const embed = new EmbedBuilder()
              .setAuthor({name : interaction.guild.name , iconURL : interaction.guild.iconURL({dynamic : true})})
              .setTitle('قائمة اوامر البوت')
              .addFields(
                {name : `\`/tax\`` , value : `لحساب ضريبة بروبوت اي مبلغ تريده`}
              )
              .setTimestamp()
              .setFooter({text : `Requested By ${interaction.user.username}` , iconURL : interaction.user.displayAvatarURL({dynamic : true})})
              .setColor('DarkButNotBlack');
          const btns = new ActionRowBuilder().addComponents(
              new ButtonBuilder().setCustomId('help_general').setLabel('عامة').setStyle(ButtonStyle.Success).setEmoji('🌐').setDisabled(true),
              new ButtonBuilder().setCustomId('help_owner').setLabel('اونر').setStyle(ButtonStyle.Primary).setEmoji('👑'),
          )

          await interaction.update({embeds : [embed] , components : [btns]})
        }else if(interaction.customId === "help_owner"){
          const embed = new EmbedBuilder()
          .setAuthor({name : interaction.guild.name , iconURL : interaction.guild.iconURL({dynamic : true})})
          .setTitle('قائمة اوامر البوت')
          .addFields(
            {name : `\`/set-tax-room\`` , value : `لتحديد روم الضريبة التلقائية`},
            {name : `\`/set-line\`` , value : `لتحديد الخط`},
          )
          .setTimestamp()
          .setFooter({text : `Requested By ${interaction.user.username}` , iconURL : interaction.user.displayAvatarURL({dynamic : true})})
          .setColor('DarkButNotBlack');
      const btns = new ActionRowBuilder().addComponents(
          new ButtonBuilder().setCustomId('help_general').setLabel('عامة').setStyle(ButtonStyle.Success).setEmoji('🌐'),
          new ButtonBuilder().setCustomId('help_owner').setLabel('اونر').setStyle(ButtonStyle.Primary).setEmoji('👑').setDisabled(true),
      )

      await interaction.update({embeds : [embed] , components : [btns]})
        }
  })

  client3.on("interactionCreate" , async(interaction) => {
    if (interaction.isChatInputCommand()) {
      
	    if(interaction.user.bot) return;

      
      const command = client3.taxSlashCommands.get(interaction.commandName);
	    
      if (!command) {
        return;
      }
      if (command.ownersOnly === true) {
        if (owner != interaction.user.id) {
          return interaction.reply({content: `❗ ***لا تستطيع استخدام هذا الامر***`, ephemeral: true});
        }
      }
      try {

        await command.execute(interaction);
      } catch (error) {
			return console.log("🔴 | error in tax bot" , error)
		}
    }
  } )





   client3.login(token)
   .catch(async(err) => {
    const filtered = tax.filter(bo => bo != data)
			await tokens.set(`tax` , filtered)
      console.log(`${clientId} Not working and removed `)
   });


})
