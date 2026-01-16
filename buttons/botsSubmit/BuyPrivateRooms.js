const { Client, Collection, discord,GatewayIntentBits, Partials , EmbedBuilder, ApplicationCommandOptionType , Events , ActionRowBuilder , ButtonBuilder ,MessageAttachment, ButtonStyle , Message } = require("discord.js");
const { Database } = require("st.db")
const setting = new Database("/database/settingsdata/setting");
const usersdata = new Database(`/database/usersdata/usersdata`);
const prices = new Database("/database/settingsdata/prices");
const invoices = new Database("/database/settingsdata/invoices");
const tokens = new Database("/tokens/tokens")
const tier1subscriptions = new Database("/database/makers/tier1/subscriptions")
const privateRoomsDB = new Database("/Json-db/Bots/privateRoomsDB.json")
const rooms = new Database("/Json-db/Bots/privateRoomsDB.json")

let privateRooms = tokens.get(`privateRooms`)
const path = require('path');
const { readdirSync } = require("fs");
;module.exports = {
  name: Events.InteractionCreate,
  /**
   * @param {Interaction} interaction
  */
  async execute(interaction){
    if (interaction.isModalSubmit()) {
        if(interaction.customId == "BuyprivateRooms_Modal") {
            await interaction.deferReply({ephemeral:true})
            let userbalance = parseInt(usersdata.get(`balance_${interaction.user.id}_${interaction.guild.id}`))
            const Bot_token = interaction.fields.getTextInputValue(`Bot_token`)
            const Bot_prefix = interaction.fields.getTextInputValue(`Bot_prefix`)
            
            const client22 =new Client({intents: [GatewayIntentBits.Guilds,GatewayIntentBits.GuildMessageReactions, GatewayIntentBits.GuildMessages, GatewayIntentBits.GuildMessageTyping, GatewayIntentBits.MessageContent], shards: "auto", partials: [Partials.Message, Partials.Channel, Partials.GuildMember,]});
            
            try{
              const owner = interaction.user.id
                let price1 = prices.get(`privateRooms_price_${interaction.guild.id}`) || 70;
                price1 = parseInt(price1)
                
                function generateRandomCode() {
                    const characters = 'AprivateRoomsDEFGHIJKLMNOPQRSTUVWXYZaprivateRoomsdefghijklmnopqrstuvwxyz0123456789';
                    let code = '';
                    for (let i = 0; i < 12; i++) {
                      if (i > 0 && i % 4 === 0) {
                        code += '-';
                      }
                      const randomIndex = Math.floor(Math.random() * characters.length);
                      code += characters.charAt(randomIndex);
                    }
                    return code;
                  }
                  const invoice = generateRandomCode();
                let doneembeduser = new EmbedBuilder()
                .setTitle(`**تم انشاء بوتك بنجاح**`)
                .setDescription(`**معلومات الفاتورة :**`)
                .addFields(
                    {
                        name:`**الفاتورة**`,value:`**\`${invoice}\`**`,inline:false
                    },
                    {
                        name:`**نوع البوت**`,value:`**\`رومات خاصة\`**`,inline:false
                    },
                    {
                        name:`**توكن البوت**`,value:`**\`${Bot_token}\`**`,inline:false
                    },
                    {
                        name:`**البريفكس**`,value:`**\`${Bot_prefix}\`**`,inline:false
                    }
                )
                await invoices.set(`${invoice}_${interaction.guild.id}` , 
                {
                    type:`رومات خاصة`,
                    token:`${Bot_token}`,
                    prefix:`${Bot_prefix}`,
                    userid:`${interaction.user.id}`,
                    guildid:`${interaction.guild.id}`,
                    serverid:`عام`,
                    price:price1
                })
                const { REST } = require('@discordjs/rest');
                const rest = new REST({ version: '10' }).setToken(Bot_token);
                const { Routes } = require('discord-api-types/v10');
                client22.on('clientReady' , async() => {
                  const newbalance = parseInt(userbalance) - parseInt(price1)
                  await usersdata.set(`balance_${interaction.user.id}_${interaction.guild.id}` , newbalance)
                  const thebut = new ButtonBuilder().setLabel(`دعوة البوت`).setStyle(ButtonStyle.Link).setURL(`https://discord.com/api/oauth2/authorize?client_id=${client22.user.id}&permissions=8&scope=bot%20applications.commands`);const rowss = new ActionRowBuilder().addComponents(thebut);
                 await interaction.user.send({embeds:[doneembeduser] , components:[rowss]})
                })
                let doneembedprove = new EmbedBuilder()
                .setColor('Aqua')
                .setDescription(`**تم شراء بوت \`رومات خاصة\` بواسطة : ${interaction.user}**`)
                .setTimestamp()
                let logroom =  setting.get(`log_room_${interaction.guild.id}`)
                let theroom = interaction.guild.channels.cache.find(ch => ch.id == logroom)
               await theroom.send({embeds:[doneembedprove]})
                  // انشاء ايمبد لوج لعملية الشراء و جلب معلومات روم اللوج في السيرفر الرسمي و ارسال الايمبد هناك
                  const { WebhookClient } = require('discord.js')
                  const { purchaseWebhookUrl } = require('../../config.json');
                  const webhookClient = new WebhookClient({ url : purchaseWebhookUrl });
                  const theEmbed = new EmbedBuilder()
                                              .setColor('Green')
                                              .setTitle('تمت عملية شراء جديدة')
                                              .addFields(
                                                  {name : `نوع البوت` , value : `\`\`\`رومات خاصة\`\`\`` , inline : true},
                                                  {name : `سعر البوت` , value : `\`\`\`${price1}\`\`\`` , inline : true},
                                                  {name : `المشتري` , value : `\`\`\`${interaction.user.username} , [${interaction.user.id}]\`\`\`` , inline : true},
                                                  {name : `السيرفر` , value : `\`\`\`${interaction.guild.name} [${interaction.guild.id}]\`\`\`` , inline : true},
                                                  {name : `صاحب السيرفر` , value : `\`\`\`${interaction.guild.ownerId}\`\`\`` , inline : true},
                                                  {name : `الفاتورة` , value : `\`\`\`${invoice}\`\`\`` , inline : false},
                                              )
                  await webhookClient.send({embeds : [theEmbed]})

               let userbots = usersdata.get(`bots_${interaction.user.id}_${interaction.guild.id}`);
               if(!userbots) {
                await usersdata.set(`bots_${interaction.user.id}_${interaction.guild.id}` , 1)
               }else {
                userbots = userbots + 1
                await usersdata.set(`bots_${interaction.user.id}_${interaction.guild.id}` , userbots) 
               }
                await interaction.editReply({content:`**تم انشاء بوتك بنجاح وتم خصم \`${price1}\` من رصيدك**`})
                client22.commands = new Collection();
            client22.events = new Collection();
            const folderPath = path.resolve(__dirname, '../../Bots/privateRooms/slashcommand22');
            const prefix = Bot_prefix
            client22.privateRoomsSlashCommands = new Collection();
  const privateRoomsSlashCommands = [];
  const ascii = require("ascii-table");
  const table = new ascii("privateRooms commands").setJustify();
  for (let folder of readdirSync(folderPath).filter(
    (folder) => !folder.includes(".")
    )) {
      for (let file of readdirSync(`${folderPath}/` + folder).filter((f) =>
      f.endsWith(".js")
      )) {
        let command = require(`${folderPath}/${folder}/${file}`);
        if (command) {
          privateRoomsSlashCommands.push(command.data.toJSON());
          client22.privateRoomsSlashCommands.set(command.data.name, command);
          if (command.data.name) {
            table.addRow(`/${command.data.name}`, "🟢 Working");
          } else {
            table.addRow(`/${command.data.name}`, "🔴 Not Working");
          }
        }
  }
}
let commandsDir2 = path.join(__dirname);
commandsDir2 = commandsDir2.replaceAll(`buttons`, `Bots`);
commandsDir2 = commandsDir2.replaceAll(`botsSubmit`, "privateRooms/commands22");
client22.commands1 = new Collection()
const commands = [];
const table2 = new ascii('Prefix Commands').setJustify();
for (let folder of readdirSync(commandsDir2).filter(f => f.endsWith(`.js`))) {
	  let command = require(commandsDir2 + `/${folder}`);
	  if(command) {
		commands.push(command);
  client22.commands.set(command.name, command);
		  if(command.name) {
			  table2.addRow(`${prefix}${command.name}` , '🟢 Working')
		  }
		  if(!command.name) {
			  table2.addRow(`${prefix}${command.name}` , '🔴 Not Working')
		  }
	  }
}


const folderPath3 = path.resolve(__dirname, '../../Bots/privateRooms/handlers');
for (let file of readdirSync(folderPath3).filter(f => f.endsWith('.js'))) {
    const event = require(path.join(folderPath3, file))(client22);
}
            client22.on("ready" , async() => {

                try {
                  await rest.put(
                    Routes.applicationCommands(client22.user.id),
                    { body: privateRoomsSlashCommands },
                    );
                    
                  } catch (error) {
                    console.error(error)
                  }
          
              });
              const folderPath2 = path.resolve(__dirname, '../../Bots/privateRooms/events');

            for (let file of readdirSync(folderPath2).filter(f => f.endsWith('.js'))) {
                const event = require(path.join(folderPath2, file));
            }
                client22.on("interactionCreate" , async(interaction) => {
                    if (interaction.isChatInputCommand()) {
                        if(interaction.user.bot) return;
                      
                      const command = client22.privateRoomsSlashCommands.get(interaction.commandName);
                        
                      if (!command) {
                        console.error(`No command matching ${interaction.commandName} was found.`);
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
                            console.error(`Error executing ${interaction.commandName}`);
                            console.error(error);
                        }
                    }
                  } )

                  client22.on("ready" , async() => {
                    let guild = client22.guilds.cache.first()
                    if(!guild) return
                    setInterval(async() => {
                      let theRooms = await rooms.get(`rooms_${guild.id}`)
                      if(!theRooms) return;
                      if(theRooms.length <= 0) return;
                      theRooms.forEach(async(room) => {
                        let {roomowner , timeleft ,guildid, roomname , roomid} = room;
                        timeleft = timeleft - 1
                        room.timeleft = timeleft
                        await rooms.set(`rooms_${guild.id}` , theRooms)
                        if(timeleft == 86400) {
                          let theGuild = client22.guilds.cache.find(gu => gu.id == guildid);
                          let theRoom = theGuild.channels.cache.find(ch => ch.id == roomid);
                          let embed1 = new EmbedBuilder()
                          .setTimestamp(Date.now() + ms(`1d`))
                          .setTitle(`**متبقي يوم واحد فقط على انتهاء الروم**`)
                          .setDescription(`**الرجاء فتح تكت والتجديد والا سيتم حذف الروم بعد يوم واحد فقط**`)
                          await theRoom.send({embeds:[embed1]})
                        }
                        if(timeleft <= 0) {
                          let roleid = await db.get(`role_${guild.id}`)
                          let theOwner = client22.users.fetch(roomowner);
                          let theGuild = client22.guilds.cache.find(gu => gu.id == guildid);
                          let theUser = theGuild.members.cache.find(us => us.id == roomowner)
                          let theRoom = theGuild.channels.cache.find(ch => ch.id == roomid);
                          let theRole = theGuild.roles.cache.find(ro => ro.id == roleid)
                          await theRoom.delete();
                          await theUser.roles.remove(theRole).catch(() => {return;})
                          let filtered = await theRooms.filter(ro => ro.roomowner != roomowner)
                          await rooms.set(`rooms_${guild.id}` , filtered);
                          let embed2 = new EmbedBuilder()
                          .setTimestamp(Date.now())
                          .setTitle(`**انتهى الروم الخاص بك**`)
                          .setDescription(`**تم حذف رومك بسبب عدم التجديد في الوقت المناسب**`)
                          await theUser.send({embeds:[embed2]})
                        }
                      })
                    }, 1000);
                    
                   })
                
                   client22.on("messageCreate" , async(message) => {
                    if (message.author.bot) return;
                    if (message.channel.type === 'dm') return;
                    if(!message.content.startsWith(prefix)) return;
                    const args = message.content.slice(prefix.length).trim().split(/ +/g); 
                    const cmd = args.shift().toLowerCase();
                    if(cmd.length == 0 ) return;
                        if(!client22.commands.has(cmd)) return;
                    let command = client22.commands.get(cmd)
                    if(!command) command = client22.commands.get(client22.commandaliases.get(cmd));
                  
                    if(command) {
                      if(command.cooldown) {
                          
                        if(cooldown.has(`${command.name}${message.author.id}`)) return message.reply({ embeds:[{description:`**عليك الانتظار\`${ms(cooldown.get(`${command.name}${message.author.id}`) - Date.now(), {long : true}).replace("minutes", `دقيقة`).replace("seconds", `ثانية`).replace("second", `ثانية`).replace("ms", `ملي ثانية`)}\` لكي تتمكن من استخدام الامر مجددا.**`}]}).then(msg => setTimeout(() => msg.delete(), cooldown.get(`${command.name}${message.author.id}`) - Date.now()))
                        command.run(client22, message, args)
                        cooldown.set(`${command.name}${message.author.id}`, Date.now() + command.cooldown)
                        setTimeout(() => {
                          cooldown.delete(`${command.name}${message.author.id}`)
                        }, command.cooldown);
                    } else {
                      command.run(client22, message, args)
                    }
                  }})

                  client22.on("interactionCreate" , async(interaction) => {
                    if(interaction.customId === "help_general"){
                      const embed = new EmbedBuilder()
                          .setAuthor({name : interaction.guild.name , iconURL : interaction.guild.iconURL({dynamic : true})})
                          .setTitle('قائمة اوامر البوت')
                          .addFields(
                            {name : `\`${prefix}buy-room\`` , value : `لشراء روم خاصة`},
                            {name : `\`${prefix}renew-room\`` , value : `لتجديد روم خاصة`},
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
                        {name : `\`/setup\`` , value : `لتسطيب نظام الرومات الخاصة`},
                        {name : `\`/create-room\`` , value : `لانشاء روم لشخص`},
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



                  await client22.login(Bot_token).catch(async() => {
                    return interaction.editReply({content:`**فشل التحقق , الرجاء تفعيل اخر ثلاث خيارات في قائمة البوت**`})
                  })
                  if(!privateRooms) {
                      await tokens.set(`privateRooms` , [{token:Bot_token,prefix:Bot_prefix,clientId:client22.user.id,owner:interaction.user.id,timeleft:2629744}])
                  }else {
                      await tokens.push(`privateRooms` , {token:Bot_token,prefix:Bot_prefix,clientId:client22.user.id,owner:interaction.user.id,timeleft:2629744})
                  }
        
            
            }catch(error){
                console.error(error)
                return interaction.editReply({content:`**قم بتفعيل الخيارات الثلاثة او التاكد من توكن البوت ثم اعد المحاولة**`})
            }
        }
    }
  }
}