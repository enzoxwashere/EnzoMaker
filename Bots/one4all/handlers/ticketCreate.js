const { SlashCommandBuilder,Events , ActivityType,ModalBuilder,TextInputStyle, EmbedBuilder , PermissionsBitField,ButtonStyle, TextInputBuilder, ActionRowBuilder,ButtonBuilder,MessageComponentCollector, Embed } = require("discord.js");
const settings = require("../../../database/settings")
const { Database } = require("st.db")
const managers = require("../../../database/managers")
const panels = require("../../../database/panels")
let ticketDB = new Database("/Json-db/Bots/ticketDB")
module.exports = (client27) => {
  client27.on(Events.InteractionCreate , async(interaction) =>{
      if (interaction.isStringSelectMenu()) {
        let guilddata = await settings.findOne({guildid:interaction.guild.id})
        let panelsRoom = guilddata.panelsRoom;
        let transcripts = guilddata.transcripts;
        let paneltext = guilddata.paneltext;
         if(!guilddata || !panelsRoom || !transcripts || !paneltext) return interaction.reply({content:`**لم يتم تحديد الاعدادات**`})

      if(interaction.customId == 'tickt_select') {
        let selected = interaction.values[0]
        if(selected == "reset")return;
        let panelFind = await panels.find({guildid:interaction.guild.id , panelId:selected})
        if(!panelFind) return interaction.reply({content:`**لم استطيع العثور على البانل**` , ephemeral:true})
        let {panelCategory , panelRole , panelWelcome ,panelName ,panelId, panelDescription , panelNumber} = panelFind[0];
        const modal = new ModalBuilder()
                          .setCustomId(`${selected}`)
                          .setTitle(`${panelName}`);
        const reason = new TextInputBuilder()
                          .setCustomId(`reason`)
                          .setLabel("ما هو سبب فتح التكت")
                          .setStyle(TextInputStyle.Short);
          const firstActionRow = new ActionRowBuilder().addComponents(reason);
          modal.addComponents(firstActionRow)
          await interaction.showModal(modal)
    }
  }

  
  })};