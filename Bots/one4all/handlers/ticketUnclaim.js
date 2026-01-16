const { SlashCommandBuilder,Events , ActivityType,ModalBuilder,TextInputStyle, EmbedBuilder , PermissionsBitField,ButtonStyle, TextInputBuilder, ActionRowBuilder,ButtonBuilder,MessageComponentCollector, Embed } = require("discord.js");
const settings = require("../../../database/settings")
const managers = require("../../../database/managers")
const panels = require("../../../database/panels")
const { Database } = require("st.db")
const ticketsManager = new Database("/Json-db/Bots/ticketDB.json")
module.exports = (client27) => {
    client27.on(Events.InteractionCreate , async(interaction) =>{
   if(interaction.isButton()) {
    let guilddata = await settings.findOne({guildid:interaction.guild.id})
    if(!guilddata)return;
    let panelsRoom = guilddata.panelsRoom;
    let transcripts = guilddata.transcripts;
    let paneltext = guilddata.paneltext;
    if(!guilddata || !panelsRoom || !transcripts || !paneltext) return interaction.reply({content:`**لم يتم تحديد الاعدادات**` , ephemeral:true})

    if(interaction.customId == "claimed_ticket") {
        let selected = await ticketsManager.get(`${interaction.channel.id}`)
        let panelFind = await panels.findOne({guildid:interaction.guild.id , panelId:selected.panelId})
        let {panelCategory , panelRole , panelWelcome ,panelName ,panelId, panelDescription , panelNumber} = panelFind;
            if(!ticketsManager.has(`${interaction.user.id}_claimer_${interaction.channel.id}`)) return interaction.reply({content:`** لا تمتلك صلاحية لفعل ذلك**`}) 
            let opener = ticketsManager.get(`${interaction.channel.id}`)
                let opener2 = opener.opener
                let userprofile = await managers.findOne({guildid:interaction.guild.id , id:interaction.user.id})
            await interaction.channel.permissionOverwrites.set([
                {
                    id:interaction.guild.id,
                    deny:[PermissionsBitField.Flags.ViewChannel],
                },
                {
                    id:panelRole,
                    allow:[PermissionsBitField.Flags.ViewChannel],
                },
                {
                    id:opener2,
                    allow:[PermissionsBitField.Flags.ViewChannel , PermissionsBitField.Flags.SendMessages],
                }
            ])
            let userpoints = userprofile.points;
            userprofile.points = parseInt(userpoints) - 1
            userprofile.save();
            await interaction.channel.setName(`${opener.channelname}`)
            let unclaimembed = new EmbedBuilder()
                                    .setDescription(`**تم الغاء استلام التكت بواسطه : ${interaction.user}**`)
                                    .setTimestamp()
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
            const rowee = new ActionRowBuilder().addComponents(claimticket , deleteticket , comeButton);
            await interaction.message.edit({components:[rowee]})
            return interaction.channel.send({embeds:[unclaimembed]})
        
  }}})}
    