const { SlashCommandBuilder, EmbedBuilder , PermissionsBitField } = require("discord.js");
const { Database } = require("st.db")
const { ChannelType } = require("discord-api-types/v9");
const settings = require("../../../../database/settings")
const managers = require("../../../../database/managers")
module.exports = {
    ownersOnly:true,
    data: new SlashCommandBuilder()
    .setName('setup')
    .setDescription('تسطيب نظام التكت')
    .addChannelOption(Option => 
        Option
        .setName('panelsroom')
        .setDescription('روم ارسال رسالة البانل')
        .setRequired(false))
    .addChannelOption(Option => 
        Option
        .setName('transcripts')
        .setDescription('روم ارسال رسالة اللوج')
        .setRequired(false))
        .addStringOption(Option => Option
            .setName(`paneltext`)
            .setDescription(`الكتابة الموجودة في ايمبد البانل`)
            .setRequired(false))
  
                            , 
async execute(interaction) {
    let reply = await interaction.deferReply({ephemeral:false})

    let panelsroom = interaction.options.getChannel(`panelsroom`)
    let transcripts = interaction.options.getChannel(`transcripts`)
    let paneltext = interaction.options.getString(`paneltext`)


    let settingss = await settings.findOne({guildid:interaction.guild.id})
    if(!settingss) {
        await new settings({
            guildid:interaction.guild.id
        }).save();
        settingss = await settings.findOne({guildid:interaction.guild.id})
    }
    if(panelsroom) {
        settingss.panelsRoom = panelsroom.id
    }
    if(transcripts) {
        settingss.transcripts = transcripts.id
    }
    if(paneltext) {
        settingss.paneltext = paneltext
    }
    settingss.save();
    return interaction.editReply({content:`**تم تحديد الاعدادات بنجاح**`})

}
}