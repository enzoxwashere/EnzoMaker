const { Events, Interaction, EmbedBuilder, InteractionType } = require('discord.js');
const { Database } = require("st.db")
const tier1subscriptions = new Database("/database/makers/tier1/subscriptions")
const { mainguild } = require('../../config.json');

module.exports = {
	name: Events.InteractionCreate,
	/**
	* @param {Interaction} interaction
  */
	async execute(interaction) {
		if (interaction.isChatInputCommand()) {
			if (interaction.user.bot) return;
			let client = interaction.client;
			const command = interaction.client.slashcommands.get(interaction.commandName);

			if (!command) {
				console.error(`No command matching ${interaction.commandName} was found.`);
				return;
			}
			if (command.ownersOnly === true && !["1212711196575277080"].includes(interaction.user.id)) {
				try {
					let subs = tier1subscriptions.get(`tier1_subs`)
					let info = subs.find(a => a.guildid == interaction.guild.id)
					let ownerid = info.ownerid;
					if (ownerid != interaction.user.id) {
						return interaction.reply({ content: `❗ ***لا تستطيع استخدام هذا الامر***`, ephemeral: true });
					}
				} catch (err) {
					return interaction.reply({ content: `❗ ***لا تستطيع استخدام هذا الامر***`, ephemeral: true });
				}
			}

			if (command.mainGuildOnly === true) {
				if (mainguild != interaction.guild.id) {
					return interaction.reply({ content: `❗ ***هذا الامر خاص بالمطورين***`, ephemeral: true });
				}
			}

			try {
				// إزالة auto-defer - كل أمر يدير ذلك بنفسه حسب احتياجه
				await command.execute(interaction);
			} catch (err) {
				console.error(`Error in ${interaction.commandName}:`, err);
				const errorMsg = { content: '❌ حدث خطأ أثناء تنفيذ الأمر!', ephemeral: true };

				// محاولة الرد بناءً على حالة interaction
				try {
					if (interaction.deferred) {
						await interaction.editReply(errorMsg);
					} else if (!interaction.replied) {
						await interaction.reply(errorMsg);
					}
				} catch (replyError) {
					console.error('Failed to send error message:', replyError);
				}
			}
		}

		if (interaction.isAutocomplete()) {
			const command = interaction.client.slashcommands.get(interaction.commandName);

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