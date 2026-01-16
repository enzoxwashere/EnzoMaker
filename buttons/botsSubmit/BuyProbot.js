const { Client, Collection, discord,GatewayIntentBits, Partials , EmbedBuilder, ApplicationCommandOptionType , Events , ActionRowBuilder , ButtonBuilder ,MessageAttachment, ButtonStyle , Message } = require("discord.js");
const { Database } = require("st.db")
const setting = new Database("/database/settingsdata/setting");
const usersdata = new Database(`/database/usersdata/usersdata`);
const prices = new Database("/database/settingsdata/prices");
const invoices = new Database("/database/settingsdata/invoices");
const tokens = new Database("/tokens/tokens")
const tier1subscriptions = new Database("/database/makers/tier1/subscriptions")
const probotDB = new Database("/Json-db/Bots/probotDB.json")
let Broadcast = tokens.get(`probot`)
const path = require('path');
const { readdirSync } = require("fs");
;module.exports = {
  name: Events.InteractionCreate,
  /**
   * @param {Interaction} interaction
  */
  async execute(interaction){
    if (interaction.isModalSubmit()) {
        if(interaction.customId == "BuyProbot_Modal") {
            await interaction.deferReply({ephemeral:true})
            let userbalance = parseInt(usersdata.get(`balance_${interaction.user.id}_${interaction.guild.id}`))
            const Bot_token = interaction.fields.getTextInputValue(`Bot_token`)
            const Bot_prefix = interaction.fields.getTextInputValue(`Bot_prefix`)
            
            const client9 = new Client({intents: [GatewayIntentBits.Guilds,GatewayIntentBits.GuildMessageReactions, GatewayIntentBits.GuildMessages, GatewayIntentBits.GuildMessageTyping, GatewayIntentBits.MessageContent], shards: "auto", partials: [Partials.Message, Partials.Channel, Partials.GuildMember,]});
            
            try{
              const owner = interaction.user.id
                let price1 = prices.get(`probot_price_${interaction.guild.id}`) || 40;
                price1 = parseInt(price1)
                
                function generateRandomCode() {
                    const characters = 'AprobotDEFGHIJKLMNOPQRSTUVWXYZaprobotdefghijklmnopqrstuvwxyz0123456789';
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
                        name:`**نوع البوت**`,value:`**\`بروبوت بريميوم وهمي\`**`,inline:false
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
                    type:`بروبوت بريميوم وهمي`,
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
                const newbalance = parseInt(userbalance) - parseInt(price1)
                client9.on('clientReady' , async() => {
                  const newbalance = parseInt(userbalance) - parseInt(price1)
                  await usersdata.set(`balance_${interaction.user.id}_${interaction.guild.id}` , newbalance)
                  const thebut = new ButtonBuilder().setLabel(`دعوة البوت`).setStyle(ButtonStyle.Link).setURL(`https://discord.com/api/oauth2/authorize?client_id=${client9.user.id}&permissions=8&scope=bot%20applications.commands`);const rowss = new ActionRowBuilder().addComponents(thebut);
                 await interaction.user.send({embeds:[doneembeduser] , components:[rowss]})
                })
                let doneembedprove = new EmbedBuilder()
                .setColor('Aqua')
                .setDescription(`**تم شراء بوت \`بروبوت بريميوم وهمي\` بواسطة : ${interaction.user}**`)
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
                                                  {name : `نوع البوت` , value : `\`\`\`بروبوت\`\`\`` , inline : true},
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
                await usersdata.set(`balance_${interaction.user.id}_${interaction.guild.id}` , newbalance)
                client9.commands = new Collection();
            client9.events = new Collection();
            require("../../Bots/probot/handlers/events")(client9)
            require("../../events/requireBots/probot-Commands")(client9);
            const folderPath = path.resolve(__dirname, '../../Bots/probot/slashcommand9');
            const prefix = Bot_prefix
            client9.probotSlashCommands = new Collection();
  const probotSlashCommands = [];
  const ascii = require("ascii-table");
  const table = new ascii("probot commands").setJustify();
  for (let folder of readdirSync(folderPath).filter(
    (folder) => !folder.includes(".")
    )) {
      for (let file of readdirSync(`${folderPath}/` + folder).filter((f) =>
      f.endsWith(".js")
      )) {
        let command = require(`${folderPath}/${folder}/${file}`);
        if (command) {
          probotSlashCommands.push(command.data.toJSON());
          client9.probotSlashCommands.set(command.data.name, command);
          if (command.data.name) {
            table.addRow(`/${command.data.name}`, "🟢 Working");
          } else {
            table.addRow(`/${command.data.name}`, "🔴 Not Working");
          }
        }
  }
}

const folderPath3 = path.resolve(__dirname, '../../Bots/probot/handlers');
for (let file of readdirSync(folderPath3).filter(f => f.endsWith('.js'))) {
    const event = require(path.join(folderPath3, file))(client9);
}
require('../../Bots/probot/probot-Bots')
client9.on('clientReady' , async() => {
  setInterval(async() => {
    let BroadcastTokenss = tokens.get(`probot`)
    let thiss = BroadcastTokenss.find(br => br.token == Bot_token)
    if(thiss) {
      if(thiss.timeleft <= 0) {
        console.log(`${client9.user.id} Ended`)
        await client9.destroy();
      }
    }
  }, 1000);
})
            client9.on("ready" , async() => {

                try {
                  await rest.put(
                    Routes.applicationCommands(client9.user.id),
                    { body: probotSlashCommands },
                    );
                    
                  } catch (error) {
                    console.error(error)
                  }
          
              });
              const folderPath2 = path.resolve(__dirname, '../../Bots/probot/events');

            for (let file of readdirSync(folderPath2).filter(f => f.endsWith('.js'))) {
                const event = require(path.join(folderPath2, file));
            }
                client9.on("interactionCreate" , async(interaction) => {
                    if (interaction.isChatInputCommand()) {
                        if(interaction.user.bot) return;
                      
                      const command = client9.probotSlashCommands.get(interaction.commandName);
                        
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
                  client9.on('messageCreate', async (message) => {
                    if (message.content.includes('type these numbers to confirm')) return;
              
                    if (message.author.id === '282859044593598464') {
                        try {
                          // رسالة الدايلي
                          if (message.content.includes('You are eligible to receive your daily for the bot!')) {
                            const buttonComponent = message.components.find(component => component.type === 'ACTION_ROW')?.components.find(component => component.type === 'BUTTON');
                            await message.delete();
                            const row = new ActionRowBuilder()
                              .addComponents(buttonComponent);
                            return message.channel.send({
                              content: `${message.content}`,
                              components: [row]
                            });
                          }else if (message.content.includes('You can get up to 2600 credits if you vote for ProBot!')) {
                            const buttonComponent = message.components.find(component => component.type === 'ACTION_ROW')?.components.find(component => component.type === 'BUTTON');
                            await message.delete();
                            const row = new ActionRowBuilder()
                              .addComponents(buttonComponent);
                            return message.channel.send({
                              content: `${message.content}`,
                              components: [row]
                            });
                          }else if (message.author.bot && message.embeds.length > 0) {
                            if(message.embeds[0].description && message.embeds[0].description.includes('This command moved')){
                              await message.delete();
                              const embed = new EmbedBuilder(message.embeds[0]);
                              const btn = new ActionRowBuilder().addComponents(new ButtonBuilder().setLabel('More Info').setStyle(ButtonStyle.Link).setURL('https://discord.com/blog/welcome-to-the-new-era-of-discord-apps?ref=probot'))
                              return message.channel.send({embeds : [embed] , components : [btn] , allowedMentions : {repliedUser : false}}) 
                            }else{
                              await message.delete();
                              const embed = new EmbedBuilder(message.embeds[0]);
                              return message.channel.send({ embeds: [embed] });
                            }
                            }else if (message.content && message.attachments.size > 0) {
                                const attach = message.attachments.first();
                                await message.channel.send({ content: `${message}`, files: [{ name: `'pic.png'`, attachment: attach.url }] });
                                return await message.delete();
                            }else if (message.attachments.size > 0) {
                                const attach = message.attachments.first();
                                await message.channel.send({ files: [{ name: 'pic.png', attachment: attach.url }] });
                                return await message.delete();
                
                            }else{
                                await message.delete().catch(err => { })
                                const sentMessage = await message.channel.send({ content: `${message}` });
                                if (sentMessage.content.includes('Cool down')) {
                                  setTimeout(() => {
                                    sentMessage.delete();
                                  }, 3000);
                                }
                                if (sentMessage.content.includes(`Deleting messages`)) {
                                  setTimeout(() => {
                                    sentMessage.delete();
                                  }, 3000);
                                }
                          }
                        } catch (error) {
                          console.log(error)
                        }
                    }
                });
              
                client9.on("messageCreate", async (message) => {
                  try {
                      const args = message.content.split(" ");
                      let id = message.content.split(" ")[1];
                      const member = message.mentions.members?.first() || message.guild.members.cache.get(id);
                      if (message.author.id === "282859044593598464") {
                        if (message.content.includes(`type these numbers to confirm`)) {
                          user = message.mentions.repliedUser?.id;
                          username = message.mentions.repliedUser.username;
              
                          await message.channel.send({ files: [{ name: `pic.png`, attachment: `${message.attachments.first().url}` }], content: `${message}` }).then(async (msg) => {
              
                            message.delete();
              
                            const filter = (m) => m.author.id === user;
                            const collector = message.channel.createMessageCollector({ filter, max: 1, time: 20000, errors: ["time"] });
              
                            collector.on("collect", async (response) => {
                              if(msg){
                                msg.delete();
                              }
                            });
              
                            collector.on("end", (collected) => {
                              if (collected.size === 0) {
                                if (msg) {
                                  msg.delete()
                                }
                              }
                            });
                          })
                        }
                      }
                  } catch (error) {
                    
                  }
                });
                
await client9.login(Bot_token).catch(async() => {
  return interaction.editReply({content:`**فشل التحقق , الرجاء تفعيل اخر ثلاث خيارات في قائمة البوت**`})
})
                  if(!Broadcast) {
                      await tokens.set(`probot` , [{token:Bot_token,prefix:Bot_prefix,clientId:client9.user.id,owner:interaction.user.id,timeleft:2629744}])
                  }else {
                      await tokens.push(`probot` , {token:Bot_token,prefix:Bot_prefix,clientId:client9.user.id,owner:interaction.user.id,timeleft:2629744})
                  }
        
            
            }catch(error){
                console.error(error)
                return interaction.editReply({content:`**قم بتفعيل الخيارات الثلاثة او التاكد من توكن البوت ثم اعد المحاولة**`})
            }
        }
    }
  }
}