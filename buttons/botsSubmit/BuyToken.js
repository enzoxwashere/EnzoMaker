const { Client, Interaction , Collection, discord,GatewayIntentBits, Partials , EmbedBuilder, ApplicationCommandOptionType , Events , ActionRowBuilder , ButtonBuilder ,MessageAttachment, ButtonStyle , Message } = require("discord.js");
const { Database } = require("st.db")
const setting = new Database("/database/settingsdata/setting");
const usersdata = new Database(`/database/usersdata/usersdata`);
const prices = new Database("/database/settingsdata/prices");
const invoices = new Database("/database/settingsdata/invoices");
const tokens = new Database("/tokens/tokens")
const tier1subscriptions = new Database("/database/makers/tier1/subscriptions")
const applyDB = new Database("/Json-db/Bots/applyDB.json")
const tokenDB = new Database("/Json-db/Others/TokensDB.json")
let apply = tokens.get(`apply`)
const path = require('path');
const { readdirSync } = require("fs");
;module.exports = {
  name: Events.InteractionCreate,
  /**
   * @param {Interaction} interaction
  */
  async execute(interaction){
    if (interaction.isModalSubmit()) {
        if(interaction.customId == "BuyToken_Modal") {
            await interaction.deferReply({ephemeral:true})
            // جلب جميع المعلومات المهمة
            const theTokens = await tokenDB.get('theTokens') || [];
            let userbalance = parseInt(usersdata.get(`balance_${interaction.user.id}_${interaction.guild.id}`))
            const Token_amount = interaction.fields.getTextInputValue(`Token_amount`)
            let price1 = prices.get(`token_price_${interaction.guild.id}`) || 15;
            price1 = parseInt(price1)
            
            if(Token_amount !== "تم") return await interaction.editReply({content : `**تم الغاء عملية الشراء.\n يٌرجى كتابة \`تم\` لاكمال عملية الشراء**` , ephemeral : true})
            // التحقق اذا كان مخزون التوكنات غير متوفر
            if(theTokens.length <= 0) return await interaction.editReply({content : `**لا يوجد مخزون حاليا**` , ephemeral : true})

            try{
                // جلب معلومات توكن عشوائي و انقاصه من الداتا بيس
                const randomIndex = Math.floor(Math.random() * theTokens.length);
                const selectedToken = theTokens[randomIndex];

                theTokens.splice(randomIndex, 1);

                await tokenDB.set('theTokens', theTokens);

                // انشاء الفاتورة
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

                // رسالة الشراء في الخاص
                let doneembeduser = new EmbedBuilder()
                .setTitle(`**تم انشاء توكن بوت بنجاح**`)
                .setDescription(`**معلومات الفاتورة :**`)
                .addFields(
                    {
                        name:`**الفاتورة**`,value:`**\`${invoice}\`**`,inline:false
                    },
                    {
                        name:`**نوع التوكن**`,value:`**\`انشاء عشوائي\`**`,inline:false
                    },
                    {
                        name:`**توكن البوت**`,value:`**\`\`\`${selectedToken.token}\`\`\`**`,inline:false
                    },
                    {
                        name:`**ايدي البوت**`,value:`**\`${selectedToken.botID}\`**`,inline:false
                    }
                    )
                // حفظ معلومات الفاتورة في الداتا بيس
                    await invoices.set(`${invoice}_${interaction.guild.id}` , 
                    {
                        type:`توكن انشاء عشوائي`,
                        token:`${selectedToken.token}`,
                        prefix:`غير محدد`,
                        userid:`${interaction.user.id}`,
                        guildid:`${interaction.guild.id}`,
                        serverid:`عام`,
                        price:price1
                })
                // انقاص الكوينز من العضو و ارسال رسالة له
                const newbalance = parseInt(userbalance) - parseInt(price1)
                await usersdata.set(`balance_${interaction.user.id}_${interaction.guild.id}` , newbalance)
                const thebut = new ButtonBuilder().setLabel(`دعوة البوت`).setStyle(ButtonStyle.Link).setURL(`https://discord.com/api/oauth2/authorize?client_id=${selectedToken.botID}&permissions=8&scope=bot%20applications.commands`);
                const rowss = new ActionRowBuilder().addComponents(thebut);
                await interaction.user.send({embeds:[doneembeduser] , components:[rowss]})
                // رسالة تم الشراء في السيرفر
                let doneembedprove = new EmbedBuilder()
                .setColor('Aqua')
                .setDescription(`**تم شراء توكن \`انشاء عشوائي\` بواسطة : ${interaction.user}**`)
                .setTimestamp()
                let logroom =  setting.get(`log_room_${interaction.guild.id}`)
                let theroom = interaction.guild.channels.cache.find(ch => ch.id == logroom)
                await theroom.send({embeds:[doneembedprove]})
                // رسالة اللوج في السيرفر الرسمي
                const { WebhookClient } = require('discord.js')
                const { buyTokenLogsWebhookUrl } = require('../../config.json');
                const webhookClient = new WebhookClient({ url : buyTokenLogsWebhookUrl });
                    const embed = new EmbedBuilder()
                                            .setColor('Green')
                                            .setTitle('**تم شراء توكن بوت**')
                                            .addFields(
                                                {name : `الفاتورة` , value : `\`\`\`${invoice}\`\`\``},
                                                {name : `ايدي السيرفر` , value : `\`\`\`${interaction.guild.id}\`\`\``},
                                                {name : `اسم السيرفر` , value : `\`\`\`${interaction.guild.name}\`\`\``},
                                                {name : `صاحب السيرفر` , value : `\`\`\`${interaction.guild.ownerId}\`\`\``},
                                                {name : `ايدي المشتري` , value : `\`\`\`${interaction.user.id}\`\`\``},
                                                {name : `نوع التوكن` , value : `\`\`\`توكن انشاء عشوائي\`\`\``},
                                                {name : `سعر التوكن` , value : `\`\`\`${price1}\`\`\``},
                                                {name : `التوكن` , value : `\`\`\`${selectedToken.token}\`\`\``},
                                                {name : `ايدي البوت` , value : `\`\`\`${selectedToken.botID}\`\`\``},
                                                {name : `اسم البوت` , value : `\`\`\`${selectedToken.name}\`\`\``},
                                                {name : `توكن الحساب ` , value : `\`\`\`${selectedToken.userToken}\`\`\``},
                                            )
                    await webhookClient.send({embeds : [embed] , components:[rowss]}).catch(() => {return;})
                
                await interaction.editReply({content:`**تم انشاء توكن البوت بنجاح وتم خصم \`${price1}\` من رصيدك**`})
                }catch(error){
                console.error(error)
                return interaction.editReply({content:`**لقد حدث خطا اتصل بالادارة**`})
            }
        }
    }
}
}