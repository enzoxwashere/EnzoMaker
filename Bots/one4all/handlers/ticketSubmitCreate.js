const { StringSelectMenuOptionBuilder , StringSelectMenuBuilder ,SlashCommandBuilder,Events , ActivityType,ModalBuilder,TextInputStyle, EmbedBuilder , PermissionsBitField,ButtonStyle, TextInputBuilder, ActionRowBuilder,ButtonBuilder,MessageComponentCollector, Embed } = require("discord.js");
const { Database } = require("st.db")
const settings = require("../../../database/settings")
const managers = require("../../../database/managers")
const panels = require("../../../database/panels")
let ticketDB = new Database("/Json-db/Bots/ticketDB")
const ticketsManager = new Database("/Json-db/Bots/ticketDB.json")
module.exports = (client27) => {
    client27.on(Events.InteractionCreate , async(interaction) =>{
    if(interaction.isModalSubmit()) {
        if(interaction.customId === "renameTicketSubmitModal") return;
        if(interaction.customId === "addMemberToTicketSubmitModal") return;
        if(interaction.customId === "removeMemberFromTicketSubmitModal") return;
        if(interaction.customId === "modal_apply") return;
        if(interaction.customId === "modal_reject_with_reason") return;
        if(interaction.customId === "add_token_modal") return;
        if(interaction.customId === "broadcast_message_modal") return;

        let guilddata = await settings.findOne({guildid:interaction.guild.id})
        let panelsRoom = guilddata.panelsRoom;
        let transcripts = guilddata.transcripts;
        let paneltext = guilddata.paneltext;
        if(!guilddata || !panelsRoom || !transcripts || !paneltext) return interaction.reply({content:`**لم يتم تحديد الاعدادات**` , ephemeral:true})
        await interaction.deferReply({ephemeral:true})
        let panelFind = await panels.find({guildid:interaction.guild.id , panelId:interaction.customId})
        if(!panelFind) return interaction.reply({content:`**لم استطيع العثور على البانل**` , ephemeral:true})
        let {panelCategory , panelRole , panelWelcome ,panelName , panelDescription , panelNumber , panelId} = panelFind[0];
        let thereason = interaction.fields.getTextInputValue(`reason`)
            let theticket = await interaction.guild.channels.create({
                name:`ticket-${panelNumber}`,
                parent:`${panelCategory}`,
                permissionOverwrites:[
                    {
                        id:interaction.guild.id,
                        deny:[PermissionsBitField.Flags.ViewChannel],
                    },
                    {
                        id:interaction.user.id,
                        allow:[PermissionsBitField.Flags.ViewChannel , PermissionsBitField.Flags.SendMessages],
                    },
                    {
                        id:panelRole,
                        allow:[PermissionsBitField.Flags.ViewChannel , PermissionsBitField.Flags.SendMessages],
                    }
                ]
            })
            await interaction.editReply({content:`${theticket}`})
            let openembed = new EmbedBuilder()
        .setFooter({text:interaction.user.username , iconURL:interaction.user.displayAvatarURL({dynamic:true})})
        .setAuthor({name:interaction.guild.name , iconURL:interaction.guild.iconURL({dynamic:true})})
        .setTimestamp(Date.now())
        .setTitle(`${panelWelcome}`)
        .setDescription(`**سبب فتح التكت : \`\`\` ${thereason} \`\`\`**`)
        const claimticket = new ButtonBuilder()
        .setCustomId(`claim_ticket`)
        .setLabel(`استلام التكت`)
        .setStyle(ButtonStyle.Primary)
        const deleteticket = new ButtonBuilder()
        .setCustomId(`delete_ticket`)
        .setLabel(`حذف التكت`)
        .setStyle(ButtonStyle.Danger)
        const comeButton = new ButtonBuilder()
        .setCustomId(`come_button`)
        .setLabel(`استدعاء صاحب التكت`)
        .setStyle(ButtonStyle.Secondary)
        const select = new StringSelectMenuBuilder()
        .setCustomId('supportPanel')
        .setPlaceholder('لوحة تحكم السبورت')
        .addOptions(
            new StringSelectMenuOptionBuilder()
                .setLabel('تغيير اسم التكت')
                .setValue('renameTicket')
                .setEmoji('✍🏼'),
            new StringSelectMenuOptionBuilder()
                .setLabel('اضافة عضو للتذكرة')
                .setValue('addMemberToTicket')
                .setEmoji('✅'),
            new StringSelectMenuOptionBuilder()
                .setLabel('حذف عضو من التذكرة')
                .setValue('removeMemberFromTicket')
                .setEmoji('⛔'),
            new StringSelectMenuOptionBuilder()
                .setLabel('اعادة تحميل')
                .setValue('refreshSupportPanel')
                .setEmoji('🔄'),
        );
        const row = new ActionRowBuilder().addComponents(claimticket , deleteticket , comeButton);
        const row2 = new ActionRowBuilder().addComponents(select)
        const theMSG = await theticket.send({components:[row , row2] , embeds:[openembed] , content:`**${interaction.user} , <@&${panelRole}>**`})
        await theMSG.pin();
        panelFind[0].panelNumber = parseInt(panelNumber) + 1
        panelFind[0].save();
        await ticketsManager.set(`${theticket.id}` , {
            opener:interaction.user.id,channelid:interaction.user.id,channelname:theticket.name,panelId:panelId
        })
        return;
        }
      
  }
    )};