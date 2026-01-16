const { ChatInputCommandInteraction , Client, Collection,PermissionsBitField,SlashCommandBuilder, discord,GatewayIntentBits, Partials , EmbedBuilder, ApplicationCommandOptionType , Events , ActionRowBuilder , ButtonBuilder ,MessageAttachment, ButtonStyle , Message } = require("discord.js");
const { Database } = require("st.db")
const systemDB = new Database("/Json-db/Bots/systemDB.json")
module.exports = {
    ownersOnly:false,
    data: new SlashCommandBuilder()
    .setName('embed')
    .setDescription('قول كلام في ايمبد')
    .addStringOption((option) => option
    .setName('title')
    .setDescription(`العنوان`)
    .setRequired(true))
    .addStringOption((option) => option
    .setName('message')
    .setDescription(`الرسالة`)
    .setRequired(false))
    .addAttachmentOption((option) => option
    .setName('image')
    .setDescription(`صورة`)
    .setRequired(false))
    .addChannelOption((option) => option
    .setName('channel')
    .setDescription(`منشن الروم`)
    .setRequired(false))
    .addStringOption((option) => option
    .setName('color')
    .setDescription(`اللون`)
    .addChoices(
        {name : `احمر` , value : 'Red'},
        {name : `ازرق` , value : 'Blue'},
        {name : `ازرق فاتح` , value : 'Aqua'},
        {name : `اخضر` , value : 'Green'},
        {name : `اصفر` , value : 'Yellow'},
        {name : `اسود` , value : 'Black'},
        {name : `ذهبي` , value : 'Gold'},
        {name : `ابيض` , value : 'White'},
        {name : `برتقالي` , value : 'Orange'},
        {name : `رمادي` , value : 'Grey'},
        {name : `بدون لون` , value : 'DarkButNotBlack'},
        {name : `عشوائي` , value : 'Random'},
    )
    .setRequired(false)),
    /**
     * @param {ChatInputCommandInteraction} interaction
     * @param {Client} client
    */
async execute(interaction) {
    try {
        if(!interaction.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) return interaction.reply({content:`**لا تمتلك صلاحية لفعل ذلك**` , ephemeral:true})
        
        let title = await interaction.options.getString('title');
        let message = await interaction.options.getString('message');
        let imageOption = interaction.options.getAttachment('image');
        let color = interaction.options.getString('color') || "Random"
        let image = imageOption ? imageOption.proxyURL : null;    
        let channel = await interaction.options.getChannel('channel') || interaction.channel;

        let embed = new EmbedBuilder().setColor(`${color}`);  

        if(title){
            embed.setTitle(`${title}`)
        }
        if(message){
            embed.setDescription(`${message}`)
        } 
        if(image){
            embed.setImage(`${image}`)
        }
        await channel.send({embeds : [embed]})
        return interaction.reply({content:`**Done**` , ephemeral:true}).then(async(msg) => {
            setTimeout(() => {
                msg.delete();
            }, 1.5 * 1000);
        })
    } catch (error) {
        interaction.reply({content : `لقد حدث خطا اتصل بالمطورين` , ephemeral : true})
        console.log(error);
    }
}
}