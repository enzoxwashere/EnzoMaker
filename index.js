const { Client, Collection, EmbedBuilder, ActionRowBuilder, ButtonBuilder, GatewayIntentBits, Partials } = require("discord.js");

// تعريف العميل مع الصلاحيات الصحيحة بدلاً من الأرقام
const client = new Client({
	intents: [
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildMembers, // هذه هي الأهم لحل مشكلتك
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.MessageContent,
		GatewayIntentBits.GuildPresences,
		GatewayIntentBits.GuildVoiceStates
	],
	partials: [Partials.Channel, Partials.Message, Partials.User, Partials.GuildMember]
});

// ضبط الحد الأقصى للمستمعين (مرة واحدة فقط)
client.setMaxListeners(1000);

const { readdirSync } = require("fs")
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v10');
// تأكد من مسار ملف الكونفق
const { token, mainguild, WEBHOOK_URL, voiceRoomID } = require(`./config.json`)
const ascii = require('ascii-table');
const { Database } = require("st.db");
const buyerCheckerDB = new Database('/Json-db/Others/buyerChecker.json')
const { owner, prefix } = require('./config.json');
const archiver = require('archiver');
const path = require('path');
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const { joinVoiceChannel } = require('@discordjs/voice');

// التحقق من صحة الـ Token قبل المتابعة
client.login(token).catch(err => {
	console.log('❌ Token are not working');
	console.error('Error details:', err);
	process.exit(1); // إيقاف البرنامج عند فشل تسجيل الدخول
});

client.commandaliases = new Collection()
const rest = new REST({ version: '10' }).setToken(token);
module.exports = client;
exports.mainBot = client;

// استخدام clientReady بدلاً من ready (Discord.js v14+)
client.on("clientReady", async () => {
	try {
		//  تسجيل اوامر السلاش كوماند
		await rest.put(
			Routes.applicationCommands(client.user.id),
			{ body: slashcommands },
		);

		await rest.put(
			Routes.applicationGuildCommands(client.user.id, mainguild),
			{ body: guildSlashCommands },
		);

		console.log(`✅ Registered ${slashcommands.length} global slash commands`);
		console.log(`✅ Registered ${guildSlashCommands.length} guild slash commands`);

	} catch (error) {
		console.error('❌ Error registering commands:', error);
	}


	// Database: SQLite (st.db) instead of MongoDB
	console.log('💾 Using SQLite database (st.db)');

	// Clear all purchase verification data
	buyerCheckerDB.deleteAll();

	// Print bot information
	console.log(`✅ Bot is now online!`);
	console.log(`👤 Tag: ${client.user.tag}`);
	console.log(`🏠 Servers: ${client.guilds.cache.size}`);
	console.log(`👥 Users: ${client.users.cache.size}`);
	console.log(`📊 Commands: ${slashcommands.length}\n`);
	if (voiceRoomID) {
		const connectToVoice = async () => {
			try {
				const guild = client.guilds.cache.get(mainguild);
				if (guild) {
					const voiceChannel = guild.channels.cache.get(voiceRoomID);
					if (voiceChannel && voiceChannel.isVoiceBased()) {
						const me = guild.members.me;
						if (!me.voice.channelId) {
							joinVoiceChannel({
								channelId: voiceChannel.id,
								guildId: guild.id,
								adapterCreator: guild.voiceAdapterCreator,
								selfDeaf: false,
								selfMute: false,
							});
							console.log(`🔊 Connected to voice channel: ${voiceChannel.name}`);
						}
					} else {
						console.log(`⚠️  Voice channel not found or is not a voice channel`);
					}
				}
			} catch (error) {
				console.error(`❌ Error connecting to voice channel:`, error.message);
			}
		};

		// Initial connection
		connectToVoice();

		// Auto-reconnect every 30 seconds
		setInterval(() => {
			connectToVoice();
		}, 30000);
	}

	// Send DM to owner on startup
	try {
		const ownerArray = Array.isArray(owner) ? owner : [owner];
		const ownerId = ownerArray[0]; // Get first owner ID

		if (ownerId) {
			const ownerUser = await client.users.fetch(ownerId);
			if (ownerUser) {
				const startupEmbed = new EmbedBuilder()
					.setColor('#00ff00')
					.setTitle('🤖 Bot Successfully Started')
					.setDescription('The bot has been successfully initialized and is now online!')
					.addFields(
						{ name: '👤 Bot', value: `\`${client.user.tag}\``, inline: true },
						{ name: '🆔 Bot ID', value: `\`${client.user.id}\``, inline: true },
						{ name: '🏠 Servers', value: `\`${client.guilds.cache.size}\``, inline: true },
						{ name: '👥 Users', value: `\`${client.users.cache.size}\``, inline: true },
						{ name: '📊 Commands', value: `\`${slashcommands.length}\``, inline: true },
						{ name: '🔊 Voice', value: voiceRoomID ? '✅ Connected' : '❌ Disabled', inline: true }
					)
					.setTimestamp()
					.setFooter({ text: 'Bot Status' });

				await ownerUser.send({ embeds: [startupEmbed] });
				console.log(`✅ Startup notification sent to owner`);
			}
		}
	} catch (error) {
		console.error(`❌ Failed to send DM to owner:`, error.message);
	}

})
client.slashcommands = new Collection()
const slashcommands = [];
const guildSlashCommands = [];
const table = new ascii('Owner Commands').setJustify();
for (let folder of readdirSync('./ownerOnly/').filter(folder => !folder.includes('.') && folder !== 'Developers')) {
	for (let file of readdirSync('./ownerOnly/' + folder).filter(f => f.endsWith('.js'))) {
		let command = require(`./ownerOnly/${folder}/${file}`);
		if (command) {
			slashcommands.push(command.data.toJSON());
			client.slashcommands.set(command.data.name, command);
			if (command.data.name) {
				table.addRow(`/${command.data.name}`, '🟢 Working')
			}
			if (!command.data.name) {
				table.addRow(`/${command.data.name}`, '🔴 Not Working')
			}
		}
	}
}

// Load guild-specific slash commands
for (let file of readdirSync('./ownerOnly/Developers').filter(f => f.endsWith('.js'))) {
	let command = require(`./ownerOnly/Developers/${file}`);
	if (command) {
		guildSlashCommands.push(command.data.toJSON());
		client.slashcommands.set(command.data.name, command);
		table.addRow(`/${command.data.name}`, '🟢 Working for mainguild');
	}
}

console.log(table.toString())

for (let folder of readdirSync('./events/').filter(folder => !folder.includes('.'))) {
	for (let file of readdirSync('./events/' + folder).filter(f => f.endsWith('.js'))) {
		const event = require(`./events/${folder}/${file}`);
		if (event.once) {
			client.once(event.name, (...args) => event.execute(...args));
		} else {
			client.on(event.name, (...args) => event.execute(...args));
		}
	}
}
for (let folder of readdirSync('./buttons/').filter(folder => !folder.includes('.'))) {
	for (let file of readdirSync('./buttons/' + folder).filter(f => f.endsWith('.js'))) {
		const event = require(`./buttons/${folder}/${file}`);
		if (event.once) {
			client.once(event.name, (...args) => event.execute(...args));
		} else {
			client.on(event.name, (...args) => event.execute(...args));
		}
	}
}
//
for (let file of readdirSync('./database/').filter(file => file.endsWith('.js'))) {
	const reuirenation = require(`./database/${file}`)
}

// ═══════════════════════════════════════════════════════════════════════════
// 📦 BACKUP SYSTEM - نظام النسخ الاحتياطي
// ═══════════════════════════════════════════════════════════════════════════

// Folders to backup
const FOLDERS_TO_BACKUP = ['Json-db', 'database', 'tokens'];
// Path to save the zip file
const BACKUP_PATH = path.join(__dirname, 'backup.zip');

/**
 * دالة إنشاء ملف النسخ الاحتياطي
 * @returns {Promise<boolean>} تعيد true إذا نجحت العملية
 */
const createBackupArchive = () => {
	return new Promise((resolve, reject) => {
		const output = fs.createWriteStream(BACKUP_PATH);
		const archive = archiver('zip', { zlib: { level: 9 } });

		output.on('close', () => {
			console.log(`✅ Backup created successfully: ${(archive.pointer() / 1024 / 1024).toFixed(2)} MB`);
			resolve(true);
		});

		archive.on('error', (err) => {
			console.error('❌ Error creating backup archive:', err);
			reject(err);
		});

		archive.pipe(output);

		FOLDERS_TO_BACKUP.forEach((folder) => {
			const folderPath = path.join(__dirname, folder);
			if (fs.existsSync(folderPath)) {
				archive.directory(folderPath, folder);
				console.log(`📁 Adding folder to backup: ${folder}`);
			} else {
				console.warn(`⚠️  Folder not found, skipping: ${folderPath}`);
			}
		});

		archive.finalize();
	});
};

/**
 * دالة إرسال النسخة الاحتياطية إلى الويب هوك
 * @returns {Promise<boolean>} تعيد true إذا نجحت العملية
 */
const sendBackupToWebhook = async () => {
	try {
		const form = new FormData();
		form.append('file', fs.createReadStream(BACKUP_PATH));
		form.append('content', `📦 **Backup** - ${new Date().toLocaleString('ar-EG', { timeZone: 'Africa/Cairo' })}`);

		const response = await axios.post(WEBHOOK_URL, form, {
			headers: {
				...form.getHeaders(),
			},
		});

		if (response.status === 200 || response.status === 204) {
			console.log('✅ Backup sent successfully to webhook');
			return true;
		} else {
			console.error('❌ Error sending backup:', response.statusText);
			return false;
		}
	} catch (error) {
		console.error('❌ Error sending backup to webhook:', error.message);
		return false;
	}
};

/**
 * دالة رئيسية لعمل النسخ الاحتياطي الكامل
 */
const performBackup = async () => {
	try {
		console.log('\n🔄 Starting backup process...');

		// إنشاء الأرشيف
		await createBackupArchive();

		// إرسال إلى الويب هوك
		const sent = await sendBackupToWebhook();

		// حذف الملف بعد الإرسال لتوفير المساحة
		if (sent && fs.existsSync(BACKUP_PATH)) {
			fs.unlinkSync(BACKUP_PATH);
			console.log('🗑️  Backup file deleted from local storage');
		}

		console.log('✅ Backup process completed successfully!\n');
		return true;
	} catch (error) {
		console.error('❌ Backup process failed:', error);
		return false;
	}
};

// استقبال أمر النسخ الاحتياطي اليدوي (محمي بفحص المالك)
client.on("messageCreate", async (message) => {
	// تجاهل رسائل البوتات
	if (message.author.bot) return;

	// التحقق من أمر النسخ الاحتياطي
	if (message.content.toLowerCase() === "backup") {
		// فحص الصلاحيات - فقط المالك يمكنه استخدام هذا الأمر
		if (message.author.id !== owner) {
			return message.reply('❌ هذا الأمر مخصص للمالك فقط!');
		}

		try {
			await message.react('⏳'); // تفاعل انتظار
			const success = await performBackup();

			if (success) {
				await message.reactions.removeAll();
				await message.react('✅');
			} else {
				await message.reactions.removeAll();
				await message.react('❌');
			}
		} catch (error) {
			console.error('Error in manual backup:', error);
			await message.react('❌');
		}
	}
});

// النسخ الاحتياطي التلقائي كل 10 دقائق
console.log('⏰ Automatic backup scheduled every 10 minutes');
setInterval(async () => {
	console.log('⏰ Scheduled backup triggered...');
	await performBackup();
}, 600_000); // 10 minutes


process.on('uncaughtException', (err) => {
	console.log(err)
});
process.on('unhandledRejection', (reason, promise) => {
	console.log(reason)
});
process.on("uncaughtExceptionMonitor", (reason) => {
	console.log(reason)
});