
  const { Client, Collection, discord,GatewayIntentBits, Partials , EmbedBuilder, ApplicationCommandOptionType , Events , ActionRowBuilder , ButtonBuilder ,MessageAttachment, ButtonStyle , Message } = require("discord.js");
const { Database } = require("st.db")
const shopDB = new Database("/Json-db/Bots/shopDB.json")
const tokens = new Database("/tokens/tokens")
const tier1subscriptions = new Database("/database/makers/tier1/subscriptions")


let shop = tokens.get('shop')
if(!shop) return;

const path = require('path');
const { readdirSync } = require("fs");
shop.forEach(async(data) => {
  const { REST } = require('@discordjs/rest');
  const { Routes } = require('discord-api-types/v10');
  const { prefix , token , clientId , owner } = data;
  theowner = owner
  const client20 = new Client({intents: [GatewayIntentBits.Guilds,GatewayIntentBits.GuildMessageReactions, GatewayIntentBits.GuildMessages, GatewayIntentBits.GuildMessageTyping, GatewayIntentBits.MessageContent], shards: "auto", partials: [Partials.Message, Partials.Channel, Partials.GuildMember,]});
  client20.commands = new Collection();
  require(`./handlers/events`)(client20);
  client20.events = new Collection();
  require(`../../events/requireBots/shop-commands`)(client20);
  const rest = new REST({ version: '10' }).setToken(token);
  client20.setMaxListeners(1000)

  client20.on("ready" , async() => {

      try {
        await rest.put(
          Routes.applicationCommands(client20.user.id),
          { body: shopSlashCommands },
          );
          
        } catch (error) {
          console.error(error)
        }

    });
        client20.once('ready', () => {
    client20.guilds.cache.forEach(guild => {
        guild.members.fetch().then(members => {
            if (members.size < 10) {
                console.log(`shop bot : Guild: ${guild.name} has less than 10 members`);
            }
        }).catch(console.error);
    });
});
  //------------- التحقق من وقت البوت --------------//
  client20.on("ready", async () => {
    setInterval(async () => {
      let BroadcastTokenss = tokens.get(`shop`) || [];
      let thiss = BroadcastTokenss.find((br) => br.token == token);
      if (thiss) {
        if (thiss.timeleft <= 0) {
          const user = await client20.users.cache.get(owner) || await client20.users.fetch(owner);
          const embed = new EmbedBuilder()
                    .setDescription(`**مرحبا <@${thiss.owner}>،لقد انتهى اشتراك بوتك <@${thiss.clientId}>. النوع : شوب\nالاشتراك انتهى**`)
                    .setColor("DarkerGrey")
                    .setTimestamp();
          await user.send({embeds : [embed]}).catch((err) => {console.log(err)})

          const filtered = BroadcastTokenss.filter((bo) => bo != thiss);
          await tokens.set(`shop`, filtered);
          await client20.destroy().then(async () => {
            console.log(`${clientId} Ended`);
          });
        }
      }
    }, 60000);
  });
    require(`../shop/handlers/events`)(client20)
  const folderPath = path.join(__dirname, 'slashcommand20');
  client20.shopSlashCommands = new Collection();
  const shopSlashCommands = [];
  const ascii = require("ascii-table");
  const table = new ascii("shop commands").setJustify();
  for (let folder of readdirSync(folderPath).filter(
    (folder) => !folder.includes(".")
    )) {
      for (let file of readdirSync(`${folderPath}/` + folder).filter((f) =>
      f.endsWith(".js")
      )) {
        let command = require(`${folderPath}/${folder}/${file}`);
        if (command) {
          shopSlashCommands.push(command.data.toJSON());
          client20.shopSlashCommands.set(command.data.name, command);
          if (command.data.name) {
            table.addRow(`/${command.data.name}`, "🟢 Working");
          } else {
            table.addRow(`/${command.data.name}`, "🔴 Not Working");
          }
        }
  }
}



const folderPath2 = path.join(__dirname, 'slashcommand20');

for(let foldeer of readdirSync(folderPath2).filter((folder) => !folder.includes("."))) {
  for(let fiee of(readdirSync(`${folderPath2}/${foldeer}`).filter((fi) => fi.endsWith(".js")))) {
    const commander = require(`${folderPath2}/${foldeer}/${fiee}`)
  }
}

require(`../../events/requireBots/shop-commands`)(client20)
require("./handlers/events")(client20)

	for (let file of readdirSync('./events/').filter(f => f.endsWith('.js'))) {
		const event = require(`./events/${file}`);
	if (event.once) {
		client20.once(event.name, (...args) => event.execute(...args));
	} else {
		client20.on(event.name, (...args) => event.execute(...args));
	}
	}




  client20.on("interactionCreate" , async(interaction) => {
    if (interaction.isChatInputCommand()) {
      
	    if(interaction.user.bot) return;

      
      const command = client20.shopSlashCommands.get(interaction.commandName);
	    
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
			console.log(error)
		}
    }
  } )


client20.on("interactionCreate" , async(interaction) => {
  if(interaction.isModalSubmit()) {
    if(interaction.customId == "add_goods") {
      let type = interaction.fields.getTextInputValue(`type`)
      let Goods = interaction.fields.getTextInputValue(`Goods`)
      let products = shopDB.get(`products_${interaction.guild.id}`)
      let productFind = products.find(prod => prod.name == type)
      if(!productFind) return interaction.reply({content:`**لا يوجد منتج بهذا الاسم**`})
      let goodsFind = productFind.goods;
      const embed = new EmbedBuilder()
      .setTimestamp(Date.now())
      .setColor('#000000')
      Goods = Goods.split("\n")
      Goods.filter(item => item.trim() !== '')
      await goodsFind.push(...Goods)
      productFind.goods = Goods
      await shopDB.set(`products_${interaction.guild.id}` , products)
      embed.setTitle(`**[✅] تم اضافة السلع الى المنتج بنجاح**`)
      return interaction.reply({embeds:[embed]})
    }
  } 
})

client20.on("interactionCreate" , async(interaction) => {
  if(interaction.customId === "help_general"){
    const embed = new EmbedBuilder()
        .setAuthor({name : interaction.guild.name , iconURL : interaction.guild.iconURL({dynamic : true})})
        .setTitle('قائمة اوامر البوت')
        .addFields(
          {name : `\`/buy\`` , value : `لشراء سلعة`},
          {name : `\`/products\`` , value : `لرؤية المنتجات المتاحة للبيع`},
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
      {name : `\`/setup\`` , value : `لتسطيب الاعدادات الرئيسية`},
      {name : `\`/add-product\`` , value : `لاضافة نوع من المنتجات للبيع`},
      {name : `\`/add-product-goods\`` , value : `لاضافة سلع لمنتج معين`},
      {name : `\`/edit-product-price\`` , value : `لتعديل سعر منتج`},
      {name : `\`/remove-product\`` , value : `لازالة نوع من المنتجات للبيع`},
      {name : `\`/remove-product-goods\`` , value : `لازالة سلع من منتج معين`},
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

   client20.login(token)
   .catch(async(err) => {
    const filtered = shop.filter(bo => bo != data)
			await tokens.set(`shop` , filtered)
      console.log(`${clientId} Not working and removed `)
   });


})
