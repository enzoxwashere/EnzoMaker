const { SlashCommandBuilder, EmbedBuilder , PermissionsBitField } = require("discord.js");
const { Database } = require("st.db")
const { ChannelType } = require("discord-api-types/v9");
const settings = require("../../../../database/settings")
const managers = require("../../../../database/managers")
const panels = require("../../../../database/panels")
let ticketDB = new Database("/Json-db/Bots/ticketDB")
module.exports = {
    ownersOnly:true,
    data: new SlashCommandBuilder()
    .setName('remove-ticket-panel')
    .setDescription('حذف بانل من نظام التكت')
    .addStringOption(Option => Option
        .setName(`panelname`)
        .setDescription(`اسم البانل`)
        .setRequired(true)), 
async execute(interaction) {
    let reply = await interaction.deferReply({ephemeral:false})
    let panelname = interaction.options.getString(`panelname`)

    let panelInfo = await panels.findOne({panelName : panelname , guildid : interaction.guild.id});
    if(panelInfo){
        await panels.findOneAndDelete({panelName : panelname , guildid : interaction.guild.id})
        let currentId = await ticketDB.get(`currentId_${interaction.guild.id}`) ?? 0
        await ticketDB.set(`currentId_${interaction.guild.id}` , currentId-1)
        return interaction.editReply({content:`**تم حذف البانل بنجاح**`})
    }else{
        return interaction.editReply({content:`**عذرا لم اجد بانل بهذا الاسم \`${panelname}\`**`})
    }
}
}