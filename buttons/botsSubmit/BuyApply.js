const { Client, Collection, discord,GatewayIntentBits, Partials , EmbedBuilder, ApplicationCommandOptionType , Events , ActionRowBuilder , ButtonBuilder ,MessageAttachment, ButtonStyle , Message } = require("discord.js");
const { Database } = require("st.db")
const setting = new Database("/database/settingsdata/setting");
const usersdata = new Database(`/database/usersdata/usersdata`);
const prices = new Database("/database/settingsdata/prices");
const invoices = new Database("/database/settingsdata/invoices");
const tokens = new Database("/tokens/tokens")
const tier1subscriptions = new Database("/database/makers/tier1/subscriptions")
const applyDB = new Database("/Json-db/Bots/applyDB.json")
let apply = tokens.get(`apply`)
const path = require('path');
const { readdirSync } = require("fs");
const mainBot = require('../../index')
;module.exports = {
  name: Events.InteractionCreate,
  /**
   * @param {Interaction} interaction
  */
  async execute(interaction){
    if (interaction.isModalSubmit()) {
        if(interaction.customId == "BuyApply_Modal") {
            await interaction.deferReply({ephemeral:true})
            let userbalance = parseInt(usersdata.get(`balance_${interaction.user.id}_${interaction.guild.id}`))
            const Bot_token = interaction.fields.getTextInputValue(`Bot_token`)
            const Bot_prefix = interaction.fields.getTextInputValue(`Bot_prefix`)
            const client13 = new Client({intents: 131071, shards: "auto", partials: [Partials.Message, Partials.Channel, Partials.GuildMember,]});
            
            try{
                const owner = interaction.user.id
                let price1 = prices.get(`apply_price_${interaction.guild.id}`) || 40;
                price1 = parseInt(price1)
                function generateRandomCode() {
                    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
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
                const { REST } = require('@discordjs/rest');
const rest = new REST({ version: '10' }).setToken(Bot_token);
const { Routes } = require('discord-api-types/v10');
               client13.on("ready" , async() => {
                let doneembeduser = new EmbedBuilder()
                .setTitle(`**تم انشاء بوتك بنجاح**`)
                .setDescription(`**معلومات الفاتورة :**`)
                .addFields(
                    {
                        name:`**الفاتورة**`,value:`**\`${invoice}\`**`,inline:false
                    },
                    {
                        name:`**نوع البوت**`,value:`**\`تقديمات\`**`,inline:false
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
                        type:`تقديمات`,
                        token:`${Bot_token}`,
                        prefix:`${Bot_prefix}`,
                        userid:`${interaction.user.id}`,
                        guildid:`${interaction.guild.id}`,
                        serverid:`عام`,
                    price:price1
                })
                const newbalance = parseInt(userbalance) - parseInt(price1)
await usersdata.set(`balance_${interaction.user.id}_${interaction.guild.id}` , newbalance)
                const thebut = new ButtonBuilder().setLabel(`دعوة البوت`).setStyle(ButtonStyle.Link).setURL(`https://discord.com/api/oauth2/authorize?client_id=${client13.user.id}&permissions=8&scope=bot%20applications.commands`);const rowss = new ActionRowBuilder().addComponents(thebut);
                await interaction.user.send({embeds:[doneembeduser] , components:[rowss]})
            })
                // انشاء ايمبد الشراء و جلب معلومات روم اللوج و ارسال الايمبد بها
                let doneembedprove = new EmbedBuilder() // ايمبد الشراء
                .setColor('Random')
                .setDescription(`**تم شراء بوت \`تقديمات\` بواسطة : ${interaction.user}**`)
                .setTimestamp();
                let logroom =  setting.get(`log_room_${interaction.guild.id}`) // معلومات روم اللوج
                let theroom = interaction.guild.channels.cache.find(ch => ch.id == logroom) // روم اللوج في السيرفر
                await theroom.send({embeds:[doneembedprove]}) // ارسال الايمبد في الروم
                  // انشاء ايمبد لوج لعملية الشراء و جلب معلومات روم اللوج في السيرفر الرسمي و ارسال الايمبد هناك
                  const { WebhookClient } = require('discord.js')
                  const { purchaseWebhookUrl } = require('../../config.json');
                  const webhookClient = new WebhookClient({ url : purchaseWebhookUrl });
                    const theEmbed = new EmbedBuilder()
                                                .setColor('Green')
                                                .setTitle('تمت عملية شراء جديدة')
                                                .addFields(
                                                    {name : `نوع البوت` , value : `\`\`\`تقديمات\`\`\`` , inline : true},
                                                    {name : `سعر البوت` , value : `\`\`\`${price1}\`\`\`` , inline : true},
                                                    {name : `المشتري` , value : `\`\`\`${interaction.user.username} , [${interaction.user.id}]\`\`\`` , inline : true},
                                                    {name : `السيرفر` , value : `\`\`\`${interaction.guild.name} [${interaction.guild.id}]\`\`\`` , inline : true},
                                                    {name : `صاحب السيرفر` , value : `\`\`\`${interaction.guild.ownerId}\`\`\`` , inline : true},
                                                    {name : `الفاتورة` , value : `\`\`\`${invoice}\`\`\`` , inline : false},
                                                )
                await webhookClient.send({embeds : [theEmbed]})
                // اضافة 1 الى عدد البوتات التي اشتراها العضو
                let userbots = usersdata.get(`bots_${interaction.user.id}_${interaction.guild.id}`);
                if(!userbots) {
                    await usersdata.set(`bots_${interaction.user.id}_${interaction.guild.id}` , 1)
                }else {
                    userbots = userbots + 1
                    await usersdata.set(`bots_${interaction.user.id}_${interaction.guild.id}` , userbots) 
                }
                await interaction.editReply({content:`**تم انشاء بوتك بنجاح وتم خصم \`${price1}\` من رصيدك**`})
                /**
                 * @desc : اكواد بوت التقديمات هنااااا
                 */
                client13.commands = new Collection();
                client13.events = new Collection();
                require("../../Bots/apply/handlers/events")(client13)
                require("../../events/requireBots/apply-commands")(client13);
                const folderPath = path.resolve(__dirname, '../../Bots/apply/slashcommand13');
                const prefix = Bot_prefix
                client13.applySlashCommands = new Collection();
  const applySlashCommands = [];
  const ascii = require("ascii-table");
  const table = new ascii("apply commands").setJustify();
  for (let folder of readdirSync(folderPath).filter(
      (folder) => !folder.includes(".")
      )) {
      for (let file of readdirSync(`${folderPath}/` + folder).filter((f) =>
      f.endsWith(".js")
      )) {
          let command = require(`${folderPath}/${folder}/${file}`);
          if (command) {
              applySlashCommands.push(command.data.toJSON());
              client13.applySlashCommands.set(command.data.name, command);
              if (command.data.name) {
                  table.addRow(`/${command.data.name}`, "🟢 Working");
                } else {
            table.addRow(`/${command.data.name}`, "🔴 Not Working");
          }
        }
    }
}


const folderPath3 = path.resolve(__dirname, '../../Bots/apply/handlers');
for (let file of readdirSync(folderPath3).filter(f => f.endsWith('.js'))) {
    const event = require(path.join(folderPath3, file))(client13);
}
client13.on('clientReady' , async() => {
    setInterval(async() => {
      let BroadcastTokenss = tokens.get(`apply`)
      let thiss = BroadcastTokenss.find(br => br.token == Bot_token)
      if(thiss) {
        if(thiss.timeleft <= 0) {
            console.log(`${client13.user.id} Ended`)
          await client13.destroy();
        }
      }
    }, 1000);
  })
client13.on("ready" , async() => {
    
    try {
        await rest.put(
            Routes.applicationCommands(client13.user.id),
            { body: applySlashCommands },
            );
            
        } catch (error) {
            console.error(error)
        }
        
    });
    const folderPath2 = path.resolve(__dirname, '../../Bots/apply/events');
    
    for (let file of readdirSync(folderPath2).filter(f => f.endsWith('.js'))) {
        const event = require(path.join(folderPath2, file));
    }
    client13.on("interactionCreate" , async(interaction) => {
        if (interaction.isChatInputCommand()) {
            if(interaction.user.bot) return;
            
            const command = client13.applySlashCommands.get(interaction.commandName);
            
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

    client13.on("interactionCreate" , async(interaction) => {
        if(interaction.customId === "help_general"){
          const embed = new EmbedBuilder()
              .setAuthor({name : interaction.guild.name , iconURL : interaction.guild.iconURL({dynamic : true})})
              .setTitle('قائمة اوامر البوت')
              .setDescription('**لا توجد اوامر في هذا القسم حاليا**')
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
            {name : `\`/setup-apply\`` , value : `لتسطيب نظام التقديم`},
            {name : `\`/new-apply\`` , value : `لانشاء تقديم جديد`},
            {name : `\`/dm-mode\`` , value : `لارسال رسالة لخاص المتقدم عند الرفض او القبول`},
            {name : `\`/close-apply\`` , value : `لانهاء التقديم المفتوح`},
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


    //-- تسجيل الدخول باالتوكن للبوت
    await client13.login(Bot_token).catch(async() => {
        return interaction.editReply({content:`**فشل التحقق , الرجاء تفعيل اخر ثلاث خيارات في قائمة البوت**`})
      })
                  
                  if(!apply) {
                      await tokens.set(`apply` , [{token:Bot_token,prefix:Bot_prefix,clientId:client13.user.id,owner:interaction.user.id,timeleft:2629744}])
                  }else {
                      await tokens.push(`apply` , {token:Bot_token,prefix:Bot_prefix,clientId:client13.user.id,owner:interaction.user.id,timeleft:2629744})
                  }
                  
                }catch(error){
                console.error(error)
                return interaction.editReply({content:`**قم بتفعيل الخيارات الثلاثة او التاكد من توكن البوت ثم اعد المحاولة**`})
            }
        }
    }
}
}