const { Events, Interaction, EmbedBuilder ,InteractionType } = require('discord.js');
const { Database } = require("st.db")
const tier2subscriptions = new Database("/database/makers/tier2/subscriptions")
module.exports = {
  name: Events.InteractionCreate,
    /**
    * @param {Interaction} interaction
  */
  async execute(interaction){
    if (interaction.isChatInputCommand()) {
	    if(interaction.user.bot) return;
	     let client = interaction.client;
		const command = interaction.client.premiumSlashCommands.get(interaction.commandName);
	    
		if (!command) {
			console.error(`No command matching ${interaction.commandName} was found.`);
			return;
		}
		if (command.ownersOnly === true) {
			let subs = tier2subscriptions.get(`tier2_subs`)
			let info = subs.find(a => a.guildid == interaction.guild.id)
			let owner = info.owner
			if (owner != interaction.user.id) {
			  return interaction.reply({content: `❗ ***لا تستطيع استخدام هذا الامر***`, ephemeral: true});
			}
		} 		
		try {
			await command.execute(interaction);
		} catch {
            await command.execute(interaction).catch(() => {return interaction.reply({ephemeral:true , content:`**حدثت مشكلة اثناء محاولة تشغيل الامر بسبب الضغط الكبير الرجاء المحاولة مرة اخرى**`})})
		}
    }

	if(interaction.isAutocomplete()){
		const command = interaction.client.premiumSlashCommands.get(interaction.commandName);
		
		if (!command) {
			console.error(`No command matching ${interaction.commandName} was found.`);
			return;
		}

		try {
			await command.autocomplete(interaction)
		} catch (error) {
			console.log(error)
		}
	}

  }
}