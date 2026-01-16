const { ChatInputCommandInteraction , Client , SlashCommandBuilder, EmbedBuilder , PermissionsBitField } = require("discord.js");
const { Database } = require("st.db")
const db = new Database("/Json-db/Bots/taxDB")
module.exports = {
    ownersOnly:true,
    data: new SlashCommandBuilder()
    .setName('set-line')
    .setDescription('تحديد الخط')
    .addAttachmentOption(Option => 
        Option
        .setName('line')
        .setDescription('الخط')
        .setRequired(true)), // or false
    /**
     * @param {ChatInputCommandInteraction} interaction
     * @param {Client} client
     */
async execute(interaction) {
    try{
    await interaction.deferReply();
    const line = interaction.options.getAttachment(`line`)
    await db.set(`tax_line_${interaction.guild.id}` , line.url)
    let embed = new EmbedBuilder()
                        .setDescription(`**تم تحديد الخط**`)
                        .setColor('Green')
                        .setImage(line.url)
                        .setTimestamp()
                        .setFooter({text : interaction.guild.name , iconURL : interaction.guild.iconURL({dynamic : true})});
    return interaction.editReply({embeds : [embed]})
} catch  {
    return;
}
}
}