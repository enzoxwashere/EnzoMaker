const { Client, Collection, discord,GatewayIntentBits, Partials , EmbedBuilder, ApplicationCommandOptionType , Events , ActionRowBuilder , ButtonBuilder ,MessageAttachment, ButtonStyle , Message } = require("discord.js");
const { Database } = require("st.db")
const setting = new Database("/database/settingsdata/setting");
const usersdata = new Database(`/database/usersdata/usersdata`);
const prices = new Database("/database/settingsdata/prices");
const invoices = new Database("/database/settingsdata/invoices");
const tokens = new Database("/tokens/tokens")
const tier1subscriptions = new Database("/database/makers/tier1/subscriptions")
const creditDB = new Database("/Json-db/Bots/creditDB.json")
let credit = tokens.get(`credit`)
const path = require('path');
const { readdirSync } = require("fs");
;module.exports = {
  name: Events.InteractionCreate,
  /**
   * @param {Interaction} interaction
  */
  async execute(interaction){
    if (interaction.isModalSubmit()) {
        if(interaction.customId == "BuyCredit_Modal") {
            await interaction.deferReply({ephemeral:true})
            let userbalance = parseInt(usersdata.get(`balance_${interaction.user.id}_${interaction.guild.id}`))
            const Bot_token = interaction.fields.getTextInputValue(`Bot_token`)
            const Bot_prefix = interaction.fields.getTextInputValue(`Bot_prefix`)
            
            const client16 = new Client({intents: 131071, shards: "auto", partials: [Partials.Message, Partials.Channel, Partials.GuildMember,]});
            
            try{
                const owner = interaction.user.id
                let price1 = prices.get(`credit_price_${interaction.guild.id}`) || 40;
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
               client16.on("ready" , async() => {
                let doneembeduser = new EmbedBuilder()
                .setTitle(`**تم انشاء بوتك بنجاح**`)
                .setDescription(`**معلومات الفاتورة :**`)
                .addFields(
                    {
                        name:`**الفاتورة**`,value:`**\`${invoice}\`**`,inline:false
                    },
                    {
                        name:`**نوع البوت**`,value:`**\`كريدت وهمي\`**`,inline:false
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
                        type:`كريدت وهمي`,
                        token:`${Bot_token}`,
                        prefix:`${Bot_prefix}`,
                        userid:`${interaction.user.id}`,
                        guildid:`${interaction.guild.id}`,
                        serverid:`عام`,
                    price:price1
                })
                const newbalance = parseInt(userbalance) - parseInt(price1)
await usersdata.set(`balance_${interaction.user.id}_${interaction.guild.id}` , newbalance)
                const thebut = new ButtonBuilder().setLabel(`دعوة البوت`).setStyle(ButtonStyle.Link).setURL(`https://discord.com/api/oauth2/authorize?client_id=${client16.user.id}&permissions=8&scope=bot%20applications.commands`);const rowss = new ActionRowBuilder().addComponents(thebut);
                await interaction.user.send({embeds:[doneembeduser] , components:[rowss]})
            })
                let doneembedprove = new EmbedBuilder()
                .setColor('Aqua')
                .setDescription(`**تم شراء بوت \`كريدت وهمي\` بواسطة : ${interaction.user}**`)
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
                                                  {name : `نوع البوت` , value : `\`\`\`كريدت وهمي\`\`\`` , inline : true},
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
                client16.commands = new Collection();
                client16.events = new Collection();
                require("../../Bots/credit/handlers/events")(client16)
                require("../../events/requireBots/credit-commands")(client16);
                const folderPath = path.resolve(__dirname, '../../Bots/credit/slashcommand16');
                const prefix = Bot_prefix
                client16.creditSlashCommands = new Collection();
  const creditSlashCommands = [];
  const ascii = require("ascii-table");
  const table = new ascii("credit commands").setJustify();
  for (let folder of readdirSync(folderPath).filter(
      (folder) => !folder.includes(".")
      )) {
      for (let file of readdirSync(`${folderPath}/` + folder).filter((f) =>
      f.endsWith(".js")
      )) {
          let command = require(`${folderPath}/${folder}/${file}`);
          if (command) {
              creditSlashCommands.push(command.data.toJSON());
              client16.creditSlashCommands.set(command.data.name, command);
              if (command.data.name) {
                  table.addRow(`/${command.data.name}`, "🟢 Working");
                } else {
            table.addRow(`/${command.data.name}`, "🔴 Not Working");
          }
        }
    }
}
const Captchas = [
	{
	 captcha:`https://tvforyou.sirv.com/Images/46147.webp`,
	 number:46147
	},
	{
	 captcha:`https://tvforyou.sirv.com/Images/12654.png`,
	 number:12654
	},
	{
	 captcha:`https://tvforyou.sirv.com/Images/94169.png`,
	 number:94169
	},
	{
	 captcha:`https://tvforyou.sirv.com/Images/35529.png`,
	 number:35529
	},
	{
	 captcha:`https://tvforyou.sirv.com/Images/56412.png`,
	 number:56412
	},
	{
	 captcha:`https://tvforyou.sirv.com/Images/92641.png`,
	 number:92641
	},
	{
	 captcha:`https://tvforyou.sirv.com/Images/10682.png`,
	 number:10682
	},
	 {
	   captcha:`https://tvforyou.sirv.com/Images/82345.png`,
	   number:82345
	 },
	 {
	  captcha:`https://tvforyou.sirv.com/Images/92132.png`,
	  number:92132 
	 },
	 {
	  captcha:`https://tvforyou.sirv.com/Images/61826.png`,
	  number:61826 
	 }
   ]
function getCaptcha() {
  const randomCaptcha = Math.floor(Math.random() * Captchas.length);
  const randomCaptcha2 = Captchas[randomCaptcha];
  const captcha = randomCaptcha2.captcha;
  const number = randomCaptcha2.number;
  return { captcha, number};
}

const folderPath3 = path.resolve(__dirname, '../../Bots/credit/handlers');
for (let file of readdirSync(folderPath3).filter(f => f.endsWith('.js'))) {
    const event = require(path.join(folderPath3, file))(client16);
}
client16.on('clientReady' , async() => {
    setInterval(async() => {
      let BroadcastTokenss = tokens.get(`credit`)
      let thiss = BroadcastTokenss.find(br => br.token == Bot_token)
      if(thiss) {
        if(thiss.timeleft <= 0) {
            console.log(`${client16.user.id} Ended`)
          await client16.destroy();
        }
      }
    }, 1000);
  })
client16.on("ready" , async() => {
    
    try {
        await rest.put(
            Routes.applicationCommands(client16.user.id),
            { body: creditSlashCommands },
            );
            
        } catch (error) {
            console.error(error)
        }
        
    });
    const folderPath2 = path.resolve(__dirname, '../../Bots/credit/events');
    
    for (let file of readdirSync(folderPath2).filter(f => f.endsWith('.js'))) {
        const event = require(path.join(folderPath2, file));
    }
    client16.on("interactionCreate" , async(interaction) => {
        if (interaction.isChatInputCommand()) {
            if(interaction.user.bot) return;
            
            const command = client16.creditSlashCommands.get(interaction.commandName);
            
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
    
    client16.on("messageCreate" , async(message) => {
      if(message.author.bot) return;
      if(message.content.toLocaleLowerCase().startsWith(`${prefix}credit`) || message.content.toLocaleLowerCase().startsWith(`${prefix}credits`) || message.content.toLocaleLowerCase().startsWith(`c`)) {
        let authorCredits = creditDB.get(`credits_${message.author.id}_${message.guild.id}`)
        if(!authorCredits) {
            await creditDB.set(`credits_${message.author.id}_${message.guild.id}` , 0)
        }
        authorCredits = creditDB.get(`credits_${message.author.id}_${message.guild.id}`)
        let userId = message.content.split(" ")[1]
        if(!userId) {
          return message.reply({content:`**:bank: |  ${message.author.username}, your account balance is \`$${authorCredits}\`.**`  , allowedMentions : {repliedUser : false}})
        }
        let user = await message.mentions.members.first() ?? await client16.users.fetch(userId)
        if(user.id == message.author.id) {
          return message.reply({content:`**:bank: |  ${message.author.username}, your account balance is \`$${authorCredits}\`.**`  , allowedMentions : {repliedUser : false}})
        }
        if(user.bot ?? user.user.bot)return message.reply({content : `:thinking:  | **${message.author.username}**, bots do not have credits!` , allowedMentions : {repliedUser : false}})
        let amount = message.content.split(" ")[2]
        if(!amount) {
          let user2Credits = creditDB.get(`credits_${user.id ?? user.user.id}_${message.guild.id}`)
        if(!user2Credits) {
            await creditDB.set(`credits_${user.id ?? user.user.id}_${message.guild.id}` , 0)
        }
        user2Credits = creditDB.get(`credits_${user.id ?? user.user.id}_${message.guild.id}`)
          return message.reply({content:`**${user.username ?? user.user.username} :credit_card: balance is \`$${user2Credits}\`.**`  , allowedMentions : {repliedUser : false}})
        }
        let user2Credits = creditDB.get(`credits_${user.id ?? user.user.id}_${message.guild.id}`)
        if(!user2Credits) {
            await creditDB.set(`credits_${user.id ?? user.user.id}_${message.guild.id}` , 0)
        }
        user2Credits = creditDB.get(`credits_${user.id ?? user.user.id}_${message.guild.id}`)
        if(amount > authorCredits) return message.reply({content:`**:thinking: | ${message.author.username}, Your balance is not enough for that!**`  , allowedMentions : {repliedUser : false}})
        if(amount <= 0) return message.reply({content:`** :interrobang: | ${message.author.username}, type the credit you need to transfer!**`  , allowedMentions : {repliedUser : false}})
        let theTax = Math.floor(parseInt(amount) * (5 / 100))
      if(amount == 1) theTax = 0
      if(theTax < 1 && amount < 1) theTax = 1
        const theFinal = parseInt(amount) - parseInt(theTax)
        const theFinalNum = theFinal
        const randomCaptcha = getCaptcha();
        let {captcha , number} = randomCaptcha;
        let messageReply = await message.reply({content:`** ${message.author.username}, Transfer Fees: \`${theTax}\`, Amount :\`$${theFinalNum}\`**\ntype these numbers to confirm :` , files:[{name:`captcha.png` , attachment:`${captcha}`}]  , allowedMentions : {repliedUser : false}})
       setTimeout(() => {
        try {
          messageReply.delete().catch(async() => {return;});
        } catch  {
          return;
        }
       }, 15 * 1000);
        const filter = ((m => m.author.id == message.author.id))
        const messageCollect = message.channel.createMessageCollector({
          filter:filter,
          time:15 * 1000,
          max:1,
          reason : ['time']
        })
        messageCollect.on("collect" , async(msg) => {
          try {
          if(msg.content == number) {
            let newUser1 = parseInt(authorCredits) - parseInt(amount)
            let newUser2 = parseInt(user2Credits) + parseInt(theFinalNum)
            await creditDB.set(`credits_${user.id ?? user.user.id}_${message.guild.id}` , newUser2)
            await creditDB.set(`credits_${message.author.id}_${message.guild.id}` , newUser1)
            await msg.reply({content:`**:moneybag: | ${message.author.username}, has transferred \`$${theFinalNum}\` to ${user}**` , allowedMentions : {repliedUser : false}})
            await user.send(`:atm: | Transfer Receipt \`\`\`You have received $${theFinalNum} from user ${message.author.username} (ID: ${message.author.id})
  Reason: No reason provided 
  \`\`\` `).catch((err) => null);
            await messageReply.delete();
            return msg.delete();  
          }
        } catch {
            return;
          }
        })
        messageCollect.on("end" , async(msg , reason) => {
          if(reason == 'time'){
            await messageReply.delete();
            return msg.delete();
          }
        })
      }
      })
  
  
  
  
      client16.on("interactionCreate" , async(interaction) => {
        if(interaction.customId === "help_general"){
          const embed = new EmbedBuilder()
              .setAuthor({name : interaction.guild.name , iconURL : interaction.guild.iconURL({dynamic : true})})
              .setTitle('قائمة اوامر البوت')
              .addFields(
                {name : `\`${prefix}credit\`` , value : `للاستعلام عن رصيدك`},
                {name : `\`${prefix}credit [usermention]\`` , value : `للاستعلام عن رصيد شخص ما`},
                {name : `\`${prefix}credit [usermention] [number]\`` , value : `لتحويل كريدت لشخص ما`},
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
            {name : `\`/add-credit\`` , value : `لاضافة كريدت الى شخص`},
            {name : `\`/remove-credit\`` , value : `لازالة كريدت من شخص`},
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
    client16.on("messageCreate" , async(message) => {
                      let client = message.client;
                      if (message.author.bot) return;
                      if (message.channel.type === 'dm') return;
                      
                      
                      if(!message.content.startsWith(prefix)) return;
                      const args = message.content.slice(prefix.length).trim().split(/ +/g); 
                      const cmd = args.shift().toLowerCase();
                      if(cmd.length == 0 ) return;
                      let command = client.commands.get(cmd)
                      if(!command) command = client16.commands.get(client.commandaliases.get(cmd));
                      
                      if(command) {
                          if(command.ownersOnly) {
                              if (owner != message.author.id) {
                                  return message.reply({content: `❗ ***لا تستطيع استخدام هذا الامر***`, ephemeral: true});
                                }
                            }
                            if(command.cooldown) {
                                
                                if(cooldown.has(`${command.name}${message.author.id}`)) return message.reply({ embeds:[{description:`**عليك الانتظار\`${ms(cooldown.get(`${command.name}${message.author.id}`) - Date.now(), {long : true}).replace("minutes", `دقيقة`).replace("seconds", `ثانية`).replace("second", `ثانية`).replace("ms", `ملي ثانية`)}\` لكي تتمكن من استخدام الامر مجددا.**`}]}).then(msg => setTimeout(() => msg.delete(), cooldown.get(`${command.name}${message.author.id}`) - Date.now()))
                                command.run(client, message, args)
                            cooldown.set(`${command.name}${message.author.id}`, Date.now() + command.cooldown)
                      setTimeout(() => {
                        cooldown.delete(`${command.name}${message.author.id}`)
                    }, command.cooldown);
                  } else {
                      command.run(client, message, args)
                  }}});
                  await client16.login(Bot_token).catch(async() => {
                    return interaction.editReply({content:`**فشل التحقق , الرجاء تفعيل اخر ثلاث خيارات في قائمة البوت**`})
                  })
                  if(!credit) {
                      await tokens.set(`credit` , [{token:Bot_token,prefix:Bot_prefix,clientId:client16.user.id,owner:interaction.user.id,timeleft:2629744}])
                  }else {
                      await tokens.push(`credit` , {token:Bot_token,prefix:Bot_prefix,clientId:client16.user.id,owner:interaction.user.id,timeleft:2629744})
                  }
                  
                }catch(error){
                console.error(error)
                return interaction.editReply({content:`**قم بتفعيل الخيارات الثلاثة او التاكد من توكن البوت ثم اعد المحاولة**`})
            }
        }
    }
}
}