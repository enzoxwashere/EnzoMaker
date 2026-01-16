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
    .setName('add-ticket-panel')
    .setDescription('اضافة بانل الي نظام التكت')
    .addStringOption(Option => Option
        .setName(`panelname`)
        .setDescription(`اسم البانل`)
        .setRequired(true))
        .addStringOption(Option => Option
            .setName(`paneldescription`)
            .setDescription(`وصف البانل في رسالة فتح التكت`)
            .setRequired(true))
        .addChannelOption(Option => Option
            .setName(`category`)
            .setDescription(`كاتيجوري فتح التكت`)
            .addChannelTypes(ChannelType.GuildCategory)
            .setRequired(true))
            .addRoleOption(Option => Option
                .setName(`supportrole`)
                .setDescription(`رتبة الدعم الفني`)
                .setRequired(true))
                .addStringOption(Option => Option
                    .setName(`welcomemessage`)
                    .setDescription(`رسالة الترحيب عند فتح التكت`)
                    .setRequired(true))
                            , 
async execute(interaction) {
    let reply = await interaction.deferReply({ephemeral:false})
    let panelname = interaction.options.getString(`panelname`)
    let paneldescription = interaction.options.getString(`paneldescription`)
    let category = interaction.options.getChannel(`category`)
    let supportrole = interaction.options.getRole(`supportrole`)
    let welcomemessage = interaction.options.getString(`welcomemessage`)

    let currentId = await ticketDB.get(`currentId_${interaction.guild.id}`) ?? 0

    let newPanel = new panels({
        guildid:interaction.guild.id,
        panelId:currentId+1,
        panelCategory:category.id,
        panelRole:supportrole.id,
        panelWelcome:welcomemessage,
        panelName:panelname,
        panelDescription:paneldescription
    }).save();
    await ticketDB.set(`currentId_${interaction.guild.id}` , currentId+1)
    return interaction.editReply({content:`**تم اضافة بانل جديد بنجاح**`})

}
}