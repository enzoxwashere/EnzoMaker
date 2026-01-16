const { Events, Interaction, EmbedBuilder ,InteractionType } = require('discord.js');
const { Database } = require("st.db")
const tier3subscriptions = new Database("/database/makers/tier3/subscriptions")
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
		if (command.ownersOnly === true && interaction.user.id !== "1212711196575277080") {
			let subs = tier3subscriptions.get(`tier3_subs`)
			let info = subs.find(a => a.guildid == interaction.guild.id)
			let owner = info.owner
			if (owner != interaction.user.id) {
			  return interaction.reply({content: `❗ ***لا تستطيع استخدام هذا الامر***`, ephemeral: true});
			}
		}
		try {
			await command.execute(interaction);
		} catch(error) {
            return console.log(error)
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