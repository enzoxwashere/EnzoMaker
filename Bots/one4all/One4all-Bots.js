
const { Client, Collection, discord, GatewayIntentBits, AuditLogEvent, Partials, EmbedBuilder, ApplicationCommandOptionType, Events, ActionRowBuilder, ButtonBuilder, MessageAttachment, ButtonStyle, Message } = require("discord.js");
const moment = require('moment');
const ms = require('ms')
const { Database } = require("st.db")
const taxDB = new Database("/Json-db/Bots/taxDB.json")
const tokens = new Database("/tokens/tokens")
const tier1subscriptions = new Database("/database/makers/tier1/subscriptions")
const autolineDB = new Database("/Json-db/Bots/autolineDB.json")
const suggestionsDB = new Database("/Json-db/Bots/suggestionsDB.json")
const feedbackDB = new Database("/Json-db/Bots/feedbackDB.json")
const giveawayDB = new Database("/Json-db/Bots/giveawayDB.json")
const protectDB = new Database("/Json-db/Bots/protectDB.json")
const logsDB = new Database("/Json-db/Bots/logsDB.json")
const nadekoDB = new Database("/Json-db/Bots/nadekoDB.json")
const one4allDB = new Database("/Json-db/Bots/one4allDB.json")


let one4all = tokens.get('one4all')
if (!one4all) return;

const path = require('path');
const { readdirSync } = require("fs");
let theowner;
one4all.forEach(async (data) => {
  const { REST } = require('@discordjs/rest');
  const { Routes } = require('discord-api-types/v10');
  const { prefix, token, clientId, owner } = data;
  theowner = owner
  const client27 = new Client({ intents: 131071, shards: "auto", partials: [Partials.Message, Partials.Channel, Partials.GuildMember,] });
  client27.commands = new Collection();
  try { require(`./handlers/events`)(client27); } catch (err) { /* Handler not found */ }
  client27.events = new Collection();
  require(`../../events/requireBots/One4all-Commands`)(client27);
  const rest = new REST({ version: '10' }).setToken(token);
  client27.setMaxListeners(1000)

  client27.on("clientReady", async () => {

    try {
      await rest.put(
        Routes.applicationCommands(client27.user.id),
        { body: one4allSlashCommands },
      );

    } catch (error) {
      console.error(error)
    }

  });
  // تم إزالة التحقق من عدد الأعضاء لتجنب GuildMembersTimeout
  //------------- التحقق من وقت البوت --------------//
  client27.on("clientReady", async () => {
    setInterval(async () => {
      let BroadcastTokenss = tokens.get(`one4all`) || [];
      let thiss = BroadcastTokenss.find((br) => br.token == token);
      if (thiss) {
        if (thiss.timeleft <= 0) {
          const user = await client27.users.cache.get(owner) || await client27.users.fetch(owner);
          const embed = new EmbedBuilder()
            .setDescription(`**مرحبا <@${thiss.owner}>،لقد انتهى اشتراك بوتك <@${thiss.clientId}>. النوع : واحد للكل\nالاشتراك انتهى**`)
            .setColor("DarkerGrey")
            .setTimestamp();
          await user.send({ embeds: [embed] }).catch((err) => { console.log(err) })

          const filtered = BroadcastTokenss.filter((bo) => bo != thiss);
          await tokens.set(`one4all`, filtered);
          await client27.destroy().then(async () => {
            console.log(`${clientId} Ended`);
          });
        }
      }
    }, 60000);
  });
  // تحميل جميع الـ handlers مع معالجة الأخطاء
  const handlers = [
    '../one4all/handlers/events', './handlers/suggest', './handlers/events',
    './handlers/ticketClaim', './handlers/ticketCreate', './handlers/ticketDelete',
    './handlers/ticketSubmitCreate', './handlers/ticketUnclaim', './handlers/comeButton',
    './handlers/reset', './handlers/supportTicketPanel', './handlers/joinGiveaway',
    './handlers/applyCreate', './handlers/applyResult', './handlers/applySubmit',
    './handlers/addToken', './handlers/sendBroadcast', './handlers/setBroadcastMessage'
  ];
  handlers.forEach(handler => {
    try { require(handler)(client27); } catch (err) { /* Handler not found */ }
  });

  const folderPath = path.join(__dirname, 'slashcommand27');
  client27.one4allSlashCommands = new Collection();
  const one4allSlashCommands = [];
  const ascii = require("ascii-table");
  const table = new ascii("one4all commands").setJustify();
  for (let folder of readdirSync(folderPath).filter(
    (folder) => !folder.includes(".")
  )) {
    for (let file of readdirSync(`${folderPath}/` + folder).filter((f) =>
      f.endsWith(".js")
    )) {
      let command = require(`${folderPath}/${folder}/${file}`);
      if (command) {
        one4allSlashCommands.push(command.data.toJSON());
        client27.one4allSlashCommands.set(command.data.name, command);
        if (command.data.name) {
          table.addRow(`/${command.data.name}`, "🟢 Working");
        } else {
          table.addRow(`/${command.data.name}`, "🔴 Not Working");
        }
      }
    }
  }



  const folderPath2 = path.join(__dirname, 'slashcommand27');

  for (let foldeer of readdirSync(folderPath2).filter((folder) => !folder.includes("."))) {
    for (let fiee of (readdirSync(`${folderPath2}/${foldeer}`).filter((fi) => fi.endsWith(".js")))) {
      const commander = require(`${folderPath2}/${foldeer}/${fiee}`)
    }
  }

  require(`../../events/requireBots/One4all-Commands`)(client27)
  try { require("./handlers/events")(client27); } catch (err) { /* Handler not found */ }

  for (let file of readdirSync('./events/').filter(f => f.endsWith('.js'))) {
    const event = require(`./events/${file}`);
    if (event.once) {
      client27.once(event.name, (...args) => event.execute(...args));
    } else {
      client27.on(event.name, (...args) => event.execute(...args));
    }
  }


  client27.on("messageCreate", async (message) => {
    if (message.content == "test") {
      message.reply(`works fine`)
    }
  })

  client27.on("interactionCreate", async (interaction) => {
    if (interaction.isChatInputCommand()) {

      if (interaction.user.bot) return;


      const command = client27.one4allSlashCommands.get(interaction.commandName);

      if (!command) {
        return;
      }
      if (command.ownersOnly === true) {
        if (owner != interaction.user.id) {
          return interaction.reply({ content: `❗ ***لا تستطيع استخدام هذا الامر***`, ephemeral: true });
        }
      }
      try {

        await command.execute(interaction);
      } catch (error) {
        return console.log("🔴 | error in one4all bot", error)
      }
    }
  })

  //-------------------------- جميع الاكواد هنا ----------------------//


  client27.on("clientReady", async () => {
    let theguild = client27.guilds.cache.first();
    setInterval(() => {
      if (!theguild) return;
      let giveaways = giveawayDB.get(`giveaways_${theguild.id}`)
      if (!giveaways) return;
      giveaways.forEach(async (giveaway) => {
        let { messageid, channelid, entries, winners, prize, duration, dir1, dir2, ended } = giveaway;
        if (duration > 0) {
          duration = duration - 1
          giveaway.duration = duration;
          await giveawayDB.set(`giveaways_${theguild.id}`, giveaways)
        } else if (duration == 0) {
          duration = duration - 1
          giveaway.duration = duration;
          await giveawayDB.set(`giveaways_${theguild.id}`, giveaways)
          const theroom = theguild.channels.cache.find(ch => ch.id == channelid)
          await theroom.messages.fetch(messageid)
          const themsg = await theroom.messages.cache.find(msg => msg.id == messageid)
          if (entries.length > 0 && entries.length >= winners) {
            const theWinners = [];
            for (let i = 0; i < winners; i++) {
              let winner = Math.floor(Math.random() * entries.length);
              let winnerExcept = entries.splice(winner, 1)[0];
              theWinners.push(winnerExcept);
            }
            const button = new ButtonBuilder()
              .setEmoji(`🎉`)
              .setStyle(ButtonStyle.Primary)
              .setCustomId(`join_giveaway`)
              .setDisabled(true)
            const row = new ActionRowBuilder().addComponents(button)
            themsg.edit({ components: [row] })
            themsg.reply({ content: `Congratulations ${theWinners}! You won the **${prize}**!` })
            giveaway.ended = true;
            await giveawayDB.set(`giveaways_${theguild.id}`, giveaways)
          } else {
            const button = new ButtonBuilder()
              .setEmoji(`🎉`)
              .setStyle(ButtonStyle.Primary)
              .setCustomId(`join_giveaway`)
              .setDisabled(true)
            const row = new ActionRowBuilder().addComponents(button)
            themsg.edit({ components: [row] })
            themsg.reply({ content: `**لا يوجد عدد من المشتركين كافي**` })
            giveaway.ended = true;
            await giveawayDB.set(`giveaways_${theguild.id}`, giveaways)
          }
        }
      })
    }, 60000);

  })

  client27.on('messageCreate', async (message) => {
    if (message.author.bot) return;
    let roomid = taxDB.get(`tax_room_${message.guild.id}`)
    let taxLine = taxDB.get(`tax_line_${message.guild.id}`)
    if (roomid) {
      if (message.channel.id == roomid) {
        if (message.author.bot) return;
        let number = message.content
        if (number.endsWith("k")) number = number.replace(/k/gi, "") * 1000;
        else if (number.endsWith("K")) number = number.replace(/K/gi, "") * 1000;
        else if (number.endsWith("m")) number = number.replace(/m/gi, "") * 1000000;
        else if (number.endsWith("M")) number = number.replace(/M/gi, "") * 1000000;
        if (isNaN(number) || number == 0) return message.delete();
        let number2 = parseInt(number)
        let tax = Math.floor(number2 * (20) / (19) + 1) // المبلغ مع الضريبة
        let tax2 = Math.floor(tax - number2) // الضريبة
        let tax3 = Math.floor(tax * (20) / (19) + 1) // المبلغ مع ضريبة الوسيط
        let tax4 = Math.floor(tax3 - tax) // ضريبة الوسيط
        let embed1 = new EmbedBuilder()
          .setFooter({ text: message.author.username, iconURL: message.author.displayAvatarURL({ dynamic: true }) })
          .setAuthor({ name: message.guild.name, iconURL: message.guild.iconURL({ dynamic: true }) })
          .setTimestamp(Date.now())
          .setColor('Random')
          .addFields([
            {
              name: `**المبلغ**`, value: `**\`${number2}\`**`, inline: true
            },
            {
              name: `**المبلغ مع الضريبة**`, value: `**\`${tax}\`**`, inline: true
            },
            {
              name: `**المبلغ مع ضريبة الوسيط**`, value: `**\`${tax3}\`**`, inline: false
            },
            {
              name: `**الضريبة**`, value: `**\`${tax2}\`**`, inline: true
            },
            {
              name: `**ضريبة الوسيط**`, value: `**\`${tax4}\`**`, inline: true
            }
          ])
        let btn1 = new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId('dis').setLabel(`${message.guild.name}`).setEmoji('✨').setStyle(ButtonStyle.Secondary).setDisabled(true))
        message.reply({ embeds: [embed1], components: [btn1] })
        if (taxLine) {
          message.channel.send({ files: [taxLine] })
        }
        return;
      }
    }
  })

  client27.on("messageCreate", async (message) => {
    if (message.author.bot) return;
    try {
      if (message.content == "-" || message.content == "خط") {
        const line = autolineDB.get(`line_${message.guild.id}`)
        if (line && message.member.permissions.has('ManageMessages')) {
          await message.delete()
          return message.channel.send({ content: `${line}` });
        } else {
          return;
        }
      }
    } catch (error) {
      return;
    }

  })

  client27.on("messageCreate", async (message) => {
    if (message.author.bot) return;
    const autoChannels = autolineDB.get(`line_channels_${message.guild.id}`)
    if (autoChannels) {
      if (autoChannels.length > 0) {
        if (autoChannels.includes(message.channel.id)) {
          const line = autolineDB.get(`line_${message.guild.id}`)
          if (line) {
            return message.channel.send({ content: `${line}` });
          }
        }
      }
    }
  })

  client27.on("messageCreate", async (message) => {
    if (message.author.bot) return;
    const line = suggestionsDB.get(`line_${message.guild.id}`)
    const chan = suggestionsDB.get(`suggestions_room_${message.guild.id}`)
    if (chan) {
      if (message.channel.id !== chan) return;
      const embed = new EmbedBuilder()
        .setColor('Random')
        .setTimestamp()
        .setTitle(`**${message.content}**`)
        .setAuthor({ name: message.author.username, iconURL: message.author.displayAvatarURL({ dynamic: true }) })
        .setFooter({ text: message.guild.name, iconURL: message.guild.iconURL({ dynamic: true }) })
      const button1 = new ButtonBuilder()
        .setCustomId(`ok_button`)
        .setLabel(`0`)
        .setEmoji("✔️")
        .setStyle(ButtonStyle.Success)
      const button2 = new ButtonBuilder()
        .setCustomId(`no_button`)
        .setLabel(`0`)
        .setEmoji("✖️")
        .setStyle(ButtonStyle.Danger)
      const row = new ActionRowBuilder().addComponents(button1, button2)
      let send = await message.channel.send({ embeds: [embed], components: [row] }).catch(() => { return; })
      await send.startThread({
        name: `Comments - تعليقات`
      }).then(async (thread) => {
        thread.send(`** - هذا المكان مخصص لمشاركة رايك هو هذا الاقتراح : \`${message.content}\` **`)
      })
      if (line) {
        await message.channel.send({ content: `${line}` }).catch((err) => { return; })
      }
      await suggestionsDB.set(`${send.id}_ok`, 0)
      await suggestionsDB.set(`${send.id}_no`, 0)
      return message.delete();

    }
  })

  client27.on("messageCreate", async (message) => {
    const line = feedbackDB.get(`line_${message.guild.id}`)
    const chan = feedbackDB.get(`feedback_room_${message.guild.id}`)
    if (chan && chan == message.channel.id) {
      if (message.author.bot) return;
      if (message.content.length > 256) return message.delete();
      const embed = new EmbedBuilder()
        .setTimestamp()
        .setTitle(`** > ${message.content} **`)
        .setAuthor({ name: message.guild.name, iconURL: message.guild.iconURL({ dynamic: true }) })
        .setThumbnail(message.author.displayAvatarURL({ dynamic: true }))
        .setColor('Random');
      await message.delete()
      const themsg = await message.channel.send({ content: `**<@${message.author.id}> شكرا لمشاركتنا رأيك :tulip: **`, embeds: [embed] })
      await themsg.react("❤")
      await themsg.react("❤️‍🔥")
      if (line) {
        await message.channel.send({ content: `${line}` })
      }
    }
  })

  // بداية الحماية من البوتات
  client27.on("guildMemberAdd", async (member) => {
    if (protectDB.has(`antibots_status_${member.guild.id}`)) {
      let antibotsstatus = protectDB.get(`antibots_status_${member.guild.id}`)
      if (antibotsstatus == "on") {
        if (member.user.bot) {
          try {
            const logRoom = await protectDB.get(`protectLog_room_${member.guild.id}`)
            if (logRoom) {
              const theLogRoom = await member.guild.channels.cache.find((ch) => ch.id == logRoom);
              theLogRoom.send({ embeds: [new EmbedBuilder().setTitle('نظام الحماية').addFields({ name: `العضو :`, value: `${member.user.username} \`${member.id}\`` }, { name: `السبب :`, value: `نظام الحماية من البوتات` }, { name: `العقاب :`, value: `طرد البوت` })] })
            }
            member.kick()
          } catch (err) {
            return console.log('error', err);
          }
        }
      }
    }
  })
  // نهاية الحماية من البوتات

  //-

  // بداية الحماية من حذف الرومات
  client27.on('clientReady', async () => {
    const guild = client27.guilds.cache.first()
    if (!guild) return;
    const guildid = guild.id
    let status = protectDB.get(`antideleterooms_status_${guildid}`)
    if (!status) return;
    if (status == "off") return;
    setInterval(() => {
      const users = protectDB.get(`roomsdelete_users_${guildid}`)
      if (!users) return;
      if (users.length > 0) {
        users.forEach(async (user) => {
          const { userid, limit, newReset } = user;
          const currentTime = moment().format('YYYY-MM-DD');
          if (moment(currentTime).isSame(newReset) || moment(currentTime).isAfter(newReset)) {
            const newResetDate = moment().add(1, 'day').format('YYYY-MM-DD')
            executordb = { userid: userid, limit: 0, newReset: newResetDate }
            const index = users.findIndex(user => user.userid === userid);
            users[index] = executordb;
            await protectDB.set(`roomsdelete_users_${guildid}`, users)
          }
          let limitrooms = protectDB.get(`antideleterooms_limit_${guildid}`)
          if (limit > limitrooms) {
            let member = guild.members.cache.find(m => m.id == userid)
            try {
              member.kick()
            } catch {
              return;
            }
          }
        })

      }
    }, 6 * 1000);
  })

  client27.on('channelDelete', async (channel) => {
    let guildid = channel.guild.id
    let status = protectDB.get(`antideleterooms_status_${guildid}`)
    if (!status) return;
    if (status == "off") return;
    const fetchedLogs = await channel.guild.fetchAuditLogs({
      limit: 1,
      type: AuditLogEvent.ChannelDelete
    });
    const channelDeleteLog = fetchedLogs.entries.first();
    const { executor } = channelDeleteLog;
    const users = protectDB.get(`roomsdelete_users_${guildid}`)
    const endTime = moment().add(1, 'day').format('YYYY-MM-DD')
    if (users.length <= 0) {
      await protectDB.push(`roomsdelete_users_${guildid}`, { userid: executor.id, limit: 1, newReset: endTime })
      return;
    }
    let executordb = users.find(user => user.userid == executor.id)
    if (!executordb) {
      await protectDB.push(`roomsdelete_users_${guildid}`, { userid: executor.id, limit: 1, newReset: endTime })
      return;
    }
    let oldexecutorlimit = executordb.limit
    let newexecutorlimit = oldexecutorlimit + 1
    executordb = { userid: executor.id, limit: newexecutorlimit, newReset: endTime }
    const index = users.findIndex(user => user.userid === executor.id);
    users[index] = executordb;
    let deletelimit = protectDB.get(`antideleterooms_limit_${guildid}`)
    if (newexecutorlimit > deletelimit) {
      let guild = client27.guilds.cache.find(gu => gu.id == guildid)
      let member = guild.members.cache.find(ex => ex.id == executor.id)
      try {
        const logRoom = await protectDB.get(`protectLog_room_${member.guild.id}`)
        if (logRoom) {
          const theLogRoom = await member.guild.channels.cache.find((ch) => ch.id == logRoom);
          theLogRoom.send({ embeds: [new EmbedBuilder().setTitle('نظام الحماية').addFields({ name: `العضو :`, value: `${member.user.username} \`${member.id}\`` }, { name: `السبب :`, value: `حذف رومات` }, { name: `العقاب :`, value: `طرد العضو` })] })
        }
        member.kick()
      } catch {
        return;
      }
      let filtered = users.filter(a => a.userid != executor.id)
      await protectDB.set(`roomsdelete_users_${guildid}`, filtered)
    } else {
      await protectDB.set(`roomsdelete_users_${guildid}`, users)
    }
  })
  // نهاية الحماية من حذف الرومات

  //-

  // بداية الحماية من حذف الرتب
  client27.on('clientReady', async () => {
    const guild = client27.guilds.cache.first()
    if (!guild) return;
    const guildid = guild.id
    let status = protectDB.get(`antideleteroles_status_${guildid}`)
    if (!status) return;
    if (status == "off") return;
    setInterval(() => {
      const users = protectDB.get(`rolesdelete_users_${guildid}`)
      if (!users) return;
      if (users.length > 0) {
        users.forEach(async (user) => {
          const { userid, limit, newReset } = user;
          const currentTime = moment().format('YYYY-MM-DD');
          if (moment(currentTime).isSame(newReset) || moment(currentTime).isAfter(newReset)) {
            const newResetDate = moment().add(1, 'day').format('YYYY-MM-DD')
            executordb = { userid: userid, limit: 0, newReset: newResetDate }
            const index = users.findIndex(user => user.userid === userid);
            users[index] = executordb;
            await protectDB.set(`rolesdelete_users_${guildid}`, users)
          }
          let limitrooms = protectDB.get(`antideleteroles_limit_${guildid}`)
          if (limit > limitrooms) {
            let member = guild.members.cache.find(m => m.id == userid)
            try {
              member.kick()
            } catch {
              return;
            }
          }
        })

      }
    }, 6 * 1000);
  })

  client27.on('roleDelete', async (role) => {
    let guildid = role.guild.id
    let status = protectDB.get(`antideleteroles_status_${guildid}`)
    if (!status) return;
    if (status == "off") return;
    const fetchedLogs = await role.guild.fetchAuditLogs({
      limit: 1,
      type: AuditLogEvent.ChannelDelete
    });
    const channelDeleteLog = fetchedLogs.entries.first();
    const { executor } = channelDeleteLog;
    const users = protectDB.get(`rolesdelete_users_${guildid}`)
    const endTime = moment().add(1, 'day').format('YYYY-MM-DD')
    if (users.length <= 0) {
      await protectDB.push(`rolesdelete_users_${guildid}`, { userid: executor.id, limit: 1, newReset: endTime })
      return;
    }
    let executordb = users.find(user => user.userid == executor.id)
    if (!executordb) {
      await protectDB.push(`rolesdelete_users_${guildid}`, { userid: executor.id, limit: 1, newReset: endTime })
      return;
    }
    let oldexecutorlimit = executordb.limit
    let newexecutorlimit = oldexecutorlimit + 1
    executordb = { userid: executor.id, limit: newexecutorlimit, newReset: endTime }
    const index = users.findIndex(user => user.userid === executor.id);
    users[index] = executordb;
    let deletelimit = protectDB.get(`antideleteroles_limit_${guildid}`)
    if (newexecutorlimit > deletelimit) {
      let guild = client27.guilds.cache.find(gu => gu.id == guildid)
      let member = guild.members.cache.find(ex => ex.id == executor.id)
      try {
        const logRoom = await protectDB.get(`protectLog_room_${member.guild.id}`)
        if (logRoom) {
          const theLogRoom = await member.guild.channels.cache.find((ch) => ch.id == logRoom);
          theLogRoom.send({ embeds: [new EmbedBuilder().setTitle('نظام الحماية').addFields({ name: `العضو :`, value: `${member.user.username} \`${member.id}\`` }, { name: `السبب :`, value: `حذف رتب` }, { name: `العقاب :`, value: `طرد العضو` })] })
        }
        member.kick()
      } catch {
        return;
      }
      let filtered = users.filter(a => a.userid != executor.id)
      await protectDB.set(`rolesdelete_users_${guildid}`, filtered)
    } else {
      await protectDB.set(`rolesdelete_users_${guildid}`, users)
    }
  })

  // نهاية الحماية من حذف الرتب

  //-

  // بداية الحماية من البان
  client27.on('clientReady', async () => {
    const guild = client27.guilds.cache.first()
    if (!guild) return;
    const guildid = guild.id
    let status = protectDB.get(`ban_status_${guildid}`)
    if (!status) return;
    if (status == "off") return;
    setInterval(() => {
      const users = protectDB.get(`ban_users_${guildid}`)
      if (!users) return;
      if (users.length > 0) {
        users.forEach(async (user) => {
          const { userid, limit, newReset } = user;
          const currentTime = moment().format('YYYY-MM-DD');
          if (moment(currentTime).isSame(newReset) || moment(currentTime).isAfter(newReset)) {
            const newResetDate = moment().add(1, 'day').format('YYYY-MM-DD')
            executordb = { userid: userid, limit: 0, newReset: newResetDate }
            const index = users.findIndex(user => user.userid === userid);
            users[index] = executordb;
            await protectDB.set(`ban_users_${guildid}`, users)
          }
          let limitrooms = protectDB.get(`ban_limit_${guildid}`)
          if (limit > limitrooms) {
            let member = guild.members.cache.find(m => m.id == userid)
            try {
              member.kick()
            } catch {
              return;
            }
          }
        })

      }
    }, 6 * 1000);
  })

  client27.on('guildBanAdd', async (member) => {
    let guildid = member.guild.id
    let status = protectDB.get(`ban_status_${guildid}`)
    if (!status) return;
    if (status == "off") return;
    const fetchedLogs = await member.guild.fetchAuditLogs({
      limit: 1,
      type: AuditLogEvent.MemberBanAdd
    });
    const channelDeleteLog = fetchedLogs.entries.first();
    const { executor } = channelDeleteLog;
    const users = protectDB.get(`ban_users_${guildid}`)
    const endTime = moment().add(1, 'day').format('YYYY-MM-DD')
    if (users.length <= 0) {
      await protectDB.push(`ban_users_${guildid}`, { userid: executor.id, limit: 1, newReset: endTime })
      return;
    }
    let executordb = users.find(user => user.userid == executor.id)
    if (!executordb) {
      await protectDB.push(`ban_users_${guildid}`, { userid: executor.id, limit: 1, newReset: endTime })
      return;
    }
    let oldexecutorlimit = executordb.limit
    let newexecutorlimit = oldexecutorlimit + 1
    executordb = { userid: executor.id, limit: newexecutorlimit, newReset: newReset }
    const index = users.findIndex(user => user.userid === executor.id);
    users[index] = executordb;
    let deletelimit = protectDB.get(`ban_limit_${guildid}`)
    if (newexecutorlimit > deletelimit) {
      let guild = client27.guilds.cache.find(gu => gu.id == guildid)
      let member = guild.members.cache.find(ex => ex.id == executor.id)
      try {
        const logRoom = await protectDB.get(`protectLog_room_${member.guild.id}`)
        if (logRoom) {
          const theLogRoom = await member.guild.channels.cache.find((ch) => ch.id == logRoom);
          theLogRoom.send({ embeds: [new EmbedBuilder().setTitle('نظام الحماية').addFields({ name: `العضو :`, value: `${member.user.username} \`${member.id}\`` }, { name: `السبب :`, value: `حظر اعضاء` }, { name: `العقاب :`, value: `طرد العضو` })] })
        }
        member.kick()
      } catch {
        return;
      }
      let filtered = users.filter(a => a.userid != executor.id)
      await protectDB.set(`ban_users_${guildid}`, filtered)
    } else {
      await protectDB.set(`ban_users_${guildid}`, users)
    }
  })

  client27.on('guildMemberRemove', async (member) => {
    let guildid = member.guild.id
    let status = protectDB.get(`ban_status_${guildid}`)
    if (!status) return;
    if (status == "off") return;
    if (member.id === client27.user.id) return;
    const fetchedLogs = await member.guild.fetchAuditLogs({
      limit: 1,
      type: AuditLogEvent.MemberKick
    });
    const channelDeleteLog = fetchedLogs.entries.first();
    const { executor } = channelDeleteLog;
    const users = protectDB.get(`ban_users_${guildid}`)
    const endTime = moment().add(1, 'day').format('YYYY-MM-DD')
    if (users.length <= 0) {
      await protectDB.push(`ban_users_${guildid}`, { userid: executor.id, limit: 1, newReset: endTime })
      return;
    }
    let executordb = users.find(user => user.userid == executor.id)
    if (!executordb) {
      await protectDB.push(`ban_users_${guildid}`, { userid: executor.id, limit: 1, newReset: endTime })
      return;
    }
    let oldexecutorlimit = executordb.limit
    let newexecutorlimit = oldexecutorlimit + 1
    executordb = { userid: executor.id, limit: newexecutorlimit, newReset: endTime }
    const index = users.findIndex(user => user.userid === executor.id);
    users[index] = executordb;
    let deletelimit = protectDB.get(`ban_limit_${guildid}`)
    if (newexecutorlimit > deletelimit) {
      let guild = client27.guilds.cache.find(gu => gu.id == guildid)
      let member = guild.members.cache.find(ex => ex.id == executor.id)
      try {
        const logRoom = await protectDB.get(`protectLog_room_${member.guild.id}`)
        if (logRoom) {
          const theLogRoom = await member.guild.channels.cache.find((ch) => ch.id == logRoom);
          theLogRoom.send({ embeds: [new EmbedBuilder().setTitle('نظام الحماية').addFields({ name: `العضو :`, value: `${member.user.username} \`${member.id}\`` }, { name: `السبب :`, value: `طرد اعضاء` }, { name: `العقاب :`, value: `طرد العضو` })] })
        }
        member.kick()
      } catch {
        return;
      }
      let filtered = users.filter(a => a.userid != executor.id)
      await protectDB.set(`ban_users_${guildid}`, filtered)
    } else {
      await protectDB.set(`ban_users_${guildid}`, users)
    }
  })

  // نهاية الحماية من البان

  client27.on('messageDelete', async (message) => {
    if (!message) return;
    if (!message.author) return;
    if (message.author.bot) return;
    if (!logsDB.has(`log_messagedelete_${message.guild.id}`)) return;
    let deletelog1 = logsDB.get(`log_messagedelete_${message.guild.id}`)
    let deletelog2 = message.guild.channels.cache.get(deletelog1)
    const fetchedLogs = await message.guild.fetchAuditLogs({
      limit: 1,
      type: AuditLogEvent.MessageDelete
    });
    const deletionLog = fetchedLogs.entries.first();
    const { executor, target } = deletionLog;
    let deleteembed = new EmbedBuilder()
      .setTitle(`**تم حذف رسالة**`)
      .addFields(
        {
          name: `**صاحب الرسالة : **`, value: `**\`\`\`${message.author.tag} - (${message.author.id})\`\`\`**`, inline: false
        },
        {
          name: `**حاذف الرسالة : **`, value: `**\`\`\`${executor.username} - (${executor.id})\`\`\`**`, inline: false
        },
        {
          name: `**محتوى الرسالة : **`, value: `**\`\`\`${message.content}\`\`\`**`, inline: false
        },
        {
          name: `**الروم الذي تم الحذف فيه : **`, value: `${message.channel}`, inline: false
        }
      )
      .setTimestamp();
    await deletelog2.send({ embeds: [deleteembed] })
  })
  client27.on('messageUpdate', async (oldMessage, newMessage) => {
    if (!oldMessage.author) return;
    if (oldMessage.author.bot) return;
    if (!logsDB.has(`log_messageupdate_${oldMessage.guild.id}`)) return;
    const fetchedLogs = await oldMessage.guild.fetchAuditLogs({
      limit: 1,
      type: AuditLogEvent.MessageUpdate
    });
    let updateLog1 = logsDB.get(`log_messageupdate_${oldMessage.guild.id}`);
    let updateLog2 = oldMessage.guild.channels.cache.get(updateLog1);
    const updateLog = fetchedLogs.entries.first();
    const { executor } = updateLog;
    let updateEmbed = new EmbedBuilder()
      .setTitle(`**تم تعديل رسالة**`)
      .addFields(
        {
          name: "**صاحب الرسالة:**",
          value: `**\`\`\`${oldMessage.author.tag} (${oldMessage.author.id})\`\`\`**`,
          inline: false
        },
        {
          name: "**المحتوى القديم:**",
          value: `**\`\`\`${oldMessage.content}\`\`\`**`,
          inline: false
        },
        {
          name: "**المحتوى الجديد:**",
          value: `**\`\`\`${newMessage.content}\`\`\`**`,
          inline: false
        },
        {
          name: "**الروم الذي تم التحديث فيه:**",
          value: `${oldMessage.channel}`,
          inline: false
        }
      )
      .setTimestamp()
    await updateLog2.send({ embeds: [updateEmbed] });
  })
  client27.on('roleCreate', async (role) => {
    if (!logsDB.has(`log_rolecreate_${role.guild.id}`)) return;
    let roleCreateLog1 = logsDB.get(`log_rolecreate_${role.guild.id}`);
    let roleCreateLog2 = role.guild.channels.cache.get(roleCreateLog1);
    const fetchedLogs = await role.guild.fetchAuditLogs({
      limit: 1,
      type: AuditLogEvent.RoleCreate
    });
    const roleCreateLog = fetchedLogs.entries.first();
    const { executor } = roleCreateLog;
    let roleCreateEmbed = new EmbedBuilder()
      .setTitle('**تم انشاء رتبة**')
      .addFields(
        { name: 'اسم الرتبة :', value: `\`\`\`${role.name}\`\`\``, inline: true },
        { name: 'الذي قام بانشاء الرتبة :', value: `\`\`\`${executor.username} (${executor.id})\`\`\``, inline: true }
      )
      .setTimestamp();
    await roleCreateLog2.send({ embeds: [roleCreateEmbed] });
  })
  client27.on('roleDelete', async (role) => {
    if (!logsDB.has(`log_roledelete_${role.guild.id}`)) return;
    let roleDeleteLog1 = logsDB.get(`log_roledelete_${role.guild.id}`);
    let roleDeleteLog2 = role.guild.channels.cache.get(roleDeleteLog1);
    const fetchedLogs = await role.guild.fetchAuditLogs({
      limit: 1,
      type: AuditLogEvent.RoleDelete
    });

    const roleDeleteLog = fetchedLogs.entries.first();
    const { executor } = roleDeleteLog;

    let roleDeleteEmbed = new EmbedBuilder()
      .setTitle('**تم حذف رتبة**')
      .addFields({ name: 'اسم الرتبة :', value: `\`\`\`${role.name}\`\`\``, inline: true }, { name: 'الذي قام بحذف الرتبة :', value: `\`\`\`${executor.username} (${executor.id})\`\`\``, inline: true })
      .setTimestamp();

    await roleDeleteLog2.send({ embeds: [roleDeleteEmbed] });
  })




  client27.on('channelCreate', async (channel) => {
    if (logsDB.has(`log_channelcreate_${channel.guild.id}`)) {
      let channelCreateLog1 = logsDB.get(`log_channelcreate_${channel.guild.id}`);
      let channelCreateLog2 = channel.guild.channels.cache.get(channelCreateLog1);




      const fetchedLogs = await channel.guild.fetchAuditLogs({
        limit: 1,
        type: AuditLogEvent.ChannelCreate
      });

      const channelCreateLog = fetchedLogs.entries.first();
      const { executor } = channelCreateLog;

      let channelCategory = channel.parent ? channel.parent.name : 'None';

      let channelCreateEmbed = new EmbedBuilder()
        .setTitle('**تم انشاء روم**')
        .addFields(
          { name: 'اسم الروم : ', value: `\`\`\`${channel.name}\`\`\``, inline: true },
          { name: 'كاتيجوري الروم : ', value: `\`\`\`${channelCategory}\`\`\``, inline: true },
          { name: 'الذي قام بانشاء الروم : ', value: `\`\`\`${executor.username} (${executor.id})\`\`\``, inline: true }
        )
        .setTimestamp();

      await channelCreateLog2.send({ embeds: [channelCreateEmbed] });
    }
  });




  client27.on('channelDelete', async (channel) => {
    if (logsDB.has(`log_channeldelete_${channel.guild.id}`)) {
      let channelDeleteLog1 = logsDB.get(`log_channeldelete_${channel.guild.id}`);
      let channelDeleteLog2 = channel.guild.channels.cache.get(channelDeleteLog1);




      const fetchedLogs = await channel.guild.fetchAuditLogs({
        limit: 1,
        type: AuditLogEvent.ChannelDelete
      });

      const channelDeleteLog = fetchedLogs.entries.first();
      const { executor } = channelDeleteLog;

      let channelDeleteEmbed = new EmbedBuilder()
        .setTitle('**تم حذف روم**')
        .addFields(
          { name: 'اسم الروم : ', value: `\`\`\`${channel.name}\`\`\``, inline: true },
          { name: 'الذي قام بحذف الروم : ', value: `\`\`\`${executor.username} (${executor.id})\`\`\``, inline: true }
        )
        .setTimestamp();

      await channelDeleteLog2.send({ embeds: [channelDeleteEmbed] });
    }
  });

  client27.on('guildMemberUpdate', async (oldMember, newMember) => {
    const guild = oldMember.guild;
    const addedRoles = newMember.roles.cache.filter((role) => !oldMember.roles.cache.has(role.id));
    const removedRoles = oldMember.roles.cache.filter((role) => !newMember.roles.cache.has(role.id));




    if (addedRoles.size > 0 && logsDB.has(`log_rolegive_${guild.id}`)) {
      let roleGiveLog1 = logsDB.get(`log_rolegive_${guild.id}`);
      let roleGiveLog2 = guild.channels.cache.get(roleGiveLog1);

      const fetchedLogs = await guild.fetchAuditLogs({
        limit: addedRoles.size,
        type: AuditLogEvent.MemberRoleUpdate
      });

      addedRoles.forEach((role) => {
        const roleGiveLog = fetchedLogs.entries.find((log) => log.target.id === newMember.id && log.changes[0].new[0].id === role.id);
        const roleGiver = roleGiveLog ? roleGiveLog.executor : null;
        const roleGiverUsername = roleGiver ? `${roleGiver.username} (${roleGiver.id})` : `UNKNOWN`;



        let roleGiveEmbed = new EmbedBuilder()
          .setTitle('**تم إعطاء رتبة لعضو**')
          .addFields(
            { name: 'اسم الرتبة:', value: `\`\`\`${role.name}\`\`\``, inline: true },
            { name: 'تم إعطاءها بواسطة:', value: `\`\`\`${roleGiverUsername}\`\`\``, inline: true },
            { name: 'تم إعطائها للعضو:', value: `\`\`\`${newMember.user.username} (${newMember.user.id})\`\`\``, inline: true }
          )
          .setTimestamp();

        roleGiveLog2.send({ embeds: [roleGiveEmbed] });
      });
    }

    if (removedRoles.size > 0 && logsDB.has(`log_roleremove_${guild.id}`)) {
      let roleRemoveLog1 = logsDB.get(`log_roleremove_${guild.id}`);
      let roleRemoveLog2 = guild.channels.cache.get(roleRemoveLog1);

      const fetchedLogs = await guild.fetchAuditLogs({
        limit: removedRoles.size,
        type: AuditLogEvent.MemberRoleUpdate
      });




      removedRoles.forEach((role) => {
        const roleRemoveLog = fetchedLogs.entries.find((log) => log.target.id === newMember.id && log.changes[0].new[0].id === role.id);
        const roleRemover = roleRemoveLog ? roleRemoveLog.executor : null;
        const roleRemoverUsername = roleRemover ? `${roleRemover.username} (${roleRemover.id})` : `UNKNOWN`;

        let roleRemoveEmbed = new EmbedBuilder()
          .setTitle('**تم إزالة رتبة من عضو**')
          .addFields(
            { name: 'اسم الرتبة:', value: `\`\`\`${role.name}\`\`\``, inline: true },
            { name: 'تم إزالتها بواسطة:', value: `\`\`\`${roleRemoverUsername}\`\`\``, inline: true },
            { name: 'تم إزالتها من العضو:', value: `\`\`\`${newMember.user.username} (${newMember.user.id})\`\`\``, inline: true }
          )
          .setTimestamp();


        roleRemoveLog2.send({ embeds: [roleRemoveEmbed] });
      });
    }
  });
  client27.on('guildMemberAdd', async (member) => {
    const guild = member.guild;
    if (!member.bot) return;
    const fetchedLogs = await guild.fetchAuditLogs({
      limit: 1,
      type: AuditLogEvent.BotAdd
    });




    const botAddLog = fetchedLogs.entries.first();
    const { executor, target } = botAddLog;

    if (target.bot) {
      let botAddLog1 = logsDB.get(`log_botadd_${guild.id}`);
      let botAddLog2 = guild.channels.cache.get(botAddLog1);

      let botAddEmbed = new EmbedBuilder()
        .setTitle('**تم اضافة بوت جديد الى السيرفر**')
        .addFields(
          { name: 'اسم البوت :', value: `\`\`\`${member.user.username}\`\`\``, inline: true },
          { name: 'ايدي البوت :', value: `\`\`\`${member.user.id}\`\`\``, inline: true },
          { name: 'هل لدية صلاحية الادمن ستريتور ؟ :', value: member.permissions.has('Administrator') ? `\`\`\`نعم لديه\`\`\`` : `\`\`\`لا ليس لديه\`\`\``, inline: true },
          { name: 'تم اضافته بواسطة :', value: `\`\`\`${executor.username} (${executor.id})\`\`\``, inline: false }
        )
        .setTimestamp();

      botAddLog2.send({ embeds: [botAddEmbed] });
    }
  });





  client27.on('guildBanAdd', async (guild, user) => {
    if (logsDB.has(`log_banadd_${guild.id}`)) {
      let banAddLog1 = logsDB.get(`log_banadd_${guild.id}`);
      let banAddLog2 = guild.channels.cache.get(banAddLog1);

      const fetchedLogs = await guild.fetchAuditLogs({
        limit: 1,
        type: AuditLogEvent.MemberBanAdd
      });

      const banAddLog = fetchedLogs.entries.first();
      const banner = banAddLog ? banAddLog.executor : null;
      const bannerUsername = banner ? `\`\`\`${banner.username} (${banner.id})\`\`\`` : `\`\`\`UNKNOWN\`\`\``;


      let banAddEmbed = new EmbedBuilder()
        .setTitle('**تم حظر عضو**')
        .addFields(
          { name: 'العضو المحظور:', value: `\`\`\`${user.tag} (${user.id})\`\`\`` },
          { name: 'تم حظره بواسطة:', value: bannerUsername },
        )
        .setTimestamp();

      banAddLog2.send({ embeds: [banAddEmbed] });
    }
  });




  client27.on('guildBanRemove', async (guild, user) => {
    if (logsDB.has(`log_bandelete_${guild.id}`)) {
      let banRemoveLog1 = logsDB.get(`log_bandelete_${guild.id}`);
      let banRemoveLog2 = guild.channels.cache.get(banRemoveLog1);

      const fetchedLogs = await guild.fetchAuditLogs({
        limit: 1,
        type: AuditLogEvent.MemberBanRemove
      });

      const banRemoveLog = fetchedLogs.entries.first();
      const unbanner = banRemoveLog ? banRemoveLog.executor : null;
      const unbannerUsername = unbanner ? `\`\`\`${unbanner.username} (${unbanner.id})\`\`\`` : `\`\`\`UNKNOWN\`\`\``;

      let banRemoveEmbed = new EmbedBuilder()
        .setTitle('**تم إزالة حظر عضو**')
        .addFields(
          { name: 'العضو المفكّر الحظر عنه:', value: `\`\`\`${user.tag} (${user.id})\`\`\`` },
          { name: 'تم إزالة الحظر بواسطة:', value: unbannerUsername }
        )
        .setTimestamp();


      banRemoveLog2.send({ embeds: [banRemoveEmbed] });
    }
  });


  client27.on('guildMemberRemove', async (member) => {
    const guild = member.guild;
    if (logsDB.has(`log_kickadd_${guild.id}`)) {
      const kickLogChannelId = logsDB.get(`log_kickadd_${guild.id}`);
      const kickLogChannel = guild.channels.cache.get(kickLogChannelId);

      const fetchedLogs = await guild.fetchAuditLogs({
        limit: 1,
        type: AuditLogEvent.MemberKick,
      });

      const kickLog = fetchedLogs.entries.first();
      const kicker = kickLog ? kickLog.executor : null;
      const kickerUsername = kicker ? `\`\`\`${kicker.username} (${kicker.id})\`\`\`` : 'Unknown';

      const kickEmbed = new EmbedBuilder()
        .setTitle('**تم طرد عضو**')
        .addFields(
          { name: 'العضو المطرود:', value: `\`\`\`${member.user.tag} (${member.user.id})\`\`\`` },
          { name: 'تم طرده بواسطة:', value: kickerUsername },
        )
        .setTimestamp();

      kickLogChannel.send({ embeds: [kickEmbed] });
    }
  });

  client27.on("guildMemberAdd", async (member) => {
    const theeGuild = member.guild
    let rooms = nadekoDB.get(`rooms_${theeGuild.id}`)
    const message = nadekoDB.get(`message_${theeGuild.id}`)
    if (!rooms) return;
    if (rooms.length <= 0) return;
    if (!message) return;
    await rooms.forEach(async (room) => {
      const theRoom = await theeGuild.channels.cache.find(ch => ch.id == room)
      if (!theRoom) return;
      await theRoom.send({ content: `${member} - ${message}` }).then(async (msg) => {
        setTimeout(() => {
          msg.delete();
        }, 3000);
      })
    })
  })

  client27.on("messageCreate", async (message) => {
    if (message.author.bot) return;
    const autoReplys = one4allDB.get(`replys_${message.guild.id}`);
    if (!autoReplys) return;
    const data = autoReplys.find((r) => r.word == message.content);
    if (!data) return;
    message.reply(`${data.reply}`)
  })



  client27.on("interactionCreate", async (interaction) => {
    /**
     * @desc : TAX COMMANDS
     */
    if (interaction.customId === "help_tax") {
      const embed = new EmbedBuilder()
        .setAuthor({ name: interaction.guild.name, iconURL: interaction.guild.iconURL({ dynamic: true }) })
        .setTitle('قائمة اوامر البوت')
        .addFields(
          { name: `\`/set-tax-room\``, value: `لتحديد روم الضريبة التلقائية` },
          { name: `\`/set-tax-line\``, value: `لتحديد الخط` },
          { name: `\`/tax\``, value: `لحساب ضريبة بروبوت اي مبلغ تريده` }
        )
        .setTimestamp()
        .setFooter({ text: `Requested By ${interaction.user.username}`, iconURL: interaction.user.displayAvatarURL({ dynamic: true }) })
        .setColor('DarkButNotBlack');
      const btns1 = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId('help_tax').setLabel('ضريبة').setStyle(ButtonStyle.Secondary).setEmoji('💰').setDisabled(true),
        new ButtonBuilder().setCustomId('help_autoline').setLabel('خط تلقائي').setStyle(ButtonStyle.Secondary).setEmoji('🤖'),
        new ButtonBuilder().setCustomId('help_suggestion').setLabel('اقتراحات').setStyle(ButtonStyle.Secondary).setEmoji('💡'),
        new ButtonBuilder().setCustomId('help_feedback').setLabel('اراء').setStyle(ButtonStyle.Secondary).setEmoji('💭'),
        new ButtonBuilder().setCustomId('help_system').setLabel('سيستم').setStyle(ButtonStyle.Secondary).setEmoji('⚙️'),
      )

      const btns2 = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId('help_ticket').setLabel('تكت').setStyle(ButtonStyle.Secondary).setEmoji('🎫'),
        new ButtonBuilder().setCustomId('help_giveaway').setLabel('جيف اوي').setStyle(ButtonStyle.Secondary).setEmoji('🎁'),
        new ButtonBuilder().setCustomId('help_protection').setLabel('حماية').setStyle(ButtonStyle.Secondary).setEmoji('🛡️'),
        new ButtonBuilder().setCustomId('help_logs').setLabel('لوج').setStyle(ButtonStyle.Secondary).setEmoji('📜'),
        new ButtonBuilder().setCustomId('help_apply').setLabel('تقديمات').setStyle(ButtonStyle.Secondary).setEmoji('📝'),
      )

      const btns3 = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId('help_broadcast').setLabel('برودكاست').setStyle(ButtonStyle.Secondary).setEmoji('📢'),
        new ButtonBuilder().setCustomId('help_nadeko').setLabel('ناديكو').setStyle(ButtonStyle.Secondary).setEmoji('⏳'),
        new ButtonBuilder().setCustomId('help_autoreply').setLabel('رد تلقائي').setStyle(ButtonStyle.Secondary).setEmoji('💎'),
      )

      await interaction.update({ embeds: [embed], components: [btns1, btns2, btns3] });
    } else
      /**
       * @desc : AUTOLINE COMMANDS
       */
      if (interaction.customId === "help_autoline") {
        const embed = new EmbedBuilder()
          .setAuthor({ name: interaction.guild.name, iconURL: interaction.guild.iconURL({ dynamic: true }) })
          .setTitle('قائمة اوامر البوت')
          .addFields(
            { name: `\`/set-autoline-line\``, value: `لتحديد الخط` },
            { name: `\`/add-autoline-channel\``, value: `لاضافة روم خط تلقائي` },
            { name: `\`/remove-autoline-channel\``, value: `لازالة روم خط تلقائي` },
            { name: `\`خط\` | \`-\``, value: `لارسال خط` },
          )
          .setTimestamp()
          .setFooter({ text: `Requested By ${interaction.user.username}`, iconURL: interaction.user.displayAvatarURL({ dynamic: true }) })
          .setColor('DarkButNotBlack');
        const btns1 = new ActionRowBuilder().addComponents(
          new ButtonBuilder().setCustomId('help_tax').setLabel('ضريبة').setStyle(ButtonStyle.Secondary).setEmoji('💰'),
          new ButtonBuilder().setCustomId('help_autoline').setLabel('خط تلقائي').setStyle(ButtonStyle.Secondary).setEmoji('🤖').setDisabled(true),
          new ButtonBuilder().setCustomId('help_suggestion').setLabel('اقتراحات').setStyle(ButtonStyle.Secondary).setEmoji('💡'),
          new ButtonBuilder().setCustomId('help_feedback').setLabel('اراء').setStyle(ButtonStyle.Secondary).setEmoji('💭'),
          new ButtonBuilder().setCustomId('help_system').setLabel('سيستم').setStyle(ButtonStyle.Secondary).setEmoji('⚙️'),
        )

        const btns2 = new ActionRowBuilder().addComponents(
          new ButtonBuilder().setCustomId('help_ticket').setLabel('تكت').setStyle(ButtonStyle.Secondary).setEmoji('🎫'),
          new ButtonBuilder().setCustomId('help_giveaway').setLabel('جيف اوي').setStyle(ButtonStyle.Secondary).setEmoji('🎁'),
          new ButtonBuilder().setCustomId('help_protection').setLabel('حماية').setStyle(ButtonStyle.Secondary).setEmoji('🛡️'),
          new ButtonBuilder().setCustomId('help_logs').setLabel('لوج').setStyle(ButtonStyle.Secondary).setEmoji('📜'),
          new ButtonBuilder().setCustomId('help_apply').setLabel('تقديمات').setStyle(ButtonStyle.Secondary).setEmoji('📝'),
        )

        const btns3 = new ActionRowBuilder().addComponents(
          new ButtonBuilder().setCustomId('help_broadcast').setLabel('برودكاست').setStyle(ButtonStyle.Secondary).setEmoji('📢'),
          new ButtonBuilder().setCustomId('help_nadeko').setLabel('ناديكو').setStyle(ButtonStyle.Secondary).setEmoji('⏳'),
          new ButtonBuilder().setCustomId('help_autoreply').setLabel('رد تلقائي').setStyle(ButtonStyle.Secondary).setEmoji('💎'),
        )

        await interaction.update({ embeds: [embed], components: [btns1, btns2, btns3] });
      } else
        /**
         * @desc : SUGGESTION COMMANDS
         */
        if (interaction.customId === "help_suggestion") {
          const embed = new EmbedBuilder()
            .setAuthor({ name: interaction.guild.name, iconURL: interaction.guild.iconURL({ dynamic: true }) })
            .setTitle('قائمة اوامر البوت')
            .addFields(
              { name: `\`/set-suggestions-line\``, value: `لتحديد خط الاقتراحات` },
              { name: `\`/set-suggestions-room\``, value: `لتحديد روم الاقتراحات` },
            )
            .setTimestamp()
            .setFooter({ text: `Requested By ${interaction.user.username}`, iconURL: interaction.user.displayAvatarURL({ dynamic: true }) })
            .setColor('DarkButNotBlack');
          const btns1 = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('help_tax').setLabel('ضريبة').setStyle(ButtonStyle.Secondary).setEmoji('💰'),
            new ButtonBuilder().setCustomId('help_autoline').setLabel('خط تلقائي').setStyle(ButtonStyle.Secondary).setEmoji('🤖'),
            new ButtonBuilder().setCustomId('help_suggestion').setLabel('اقتراحات').setStyle(ButtonStyle.Secondary).setEmoji('💡').setDisabled(true),
            new ButtonBuilder().setCustomId('help_feedback').setLabel('اراء').setStyle(ButtonStyle.Secondary).setEmoji('💭'),
            new ButtonBuilder().setCustomId('help_system').setLabel('سيستم').setStyle(ButtonStyle.Secondary).setEmoji('⚙️'),
          )

          const btns2 = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('help_ticket').setLabel('تكت').setStyle(ButtonStyle.Secondary).setEmoji('🎫'),
            new ButtonBuilder().setCustomId('help_giveaway').setLabel('جيف اوي').setStyle(ButtonStyle.Secondary).setEmoji('🎁'),
            new ButtonBuilder().setCustomId('help_protection').setLabel('حماية').setStyle(ButtonStyle.Secondary).setEmoji('🛡️'),
            new ButtonBuilder().setCustomId('help_logs').setLabel('لوج').setStyle(ButtonStyle.Secondary).setEmoji('📜'),
            new ButtonBuilder().setCustomId('help_apply').setLabel('تقديمات').setStyle(ButtonStyle.Secondary).setEmoji('📝'),
          )

          const btns3 = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('help_broadcast').setLabel('برودكاست').setStyle(ButtonStyle.Secondary).setEmoji('📢'),
            new ButtonBuilder().setCustomId('help_nadeko').setLabel('ناديكو').setStyle(ButtonStyle.Secondary).setEmoji('⏳'),
            new ButtonBuilder().setCustomId('help_autoreply').setLabel('رد تلقائي').setStyle(ButtonStyle.Secondary).setEmoji('💎'),
          )

          await interaction.update({ embeds: [embed], components: [btns1, btns2, btns3] });
        } else
          /**
           * @desc : FEEDBACK COMMANDS
          */
          if (interaction.customId === "help_feedback") {
            const embed = new EmbedBuilder()
              .setAuthor({ name: interaction.guild.name, iconURL: interaction.guild.iconURL({ dynamic: true }) })
              .setTitle('قائمة اوامر البوت')
              .addFields(
                { name: `\`/set-feedback-line\``, value: `لتحديد خط الاراء` },
                { name: `\`/set-feedback-room\``, value: `لتحديد روم الاراء` },
              )
              .setTimestamp()
              .setFooter({ text: `Requested By ${interaction.user.username}`, iconURL: interaction.user.displayAvatarURL({ dynamic: true }) })
              .setColor('DarkButNotBlack');
            const btns1 = new ActionRowBuilder().addComponents(
              new ButtonBuilder().setCustomId('help_tax').setLabel('ضريبة').setStyle(ButtonStyle.Secondary).setEmoji('💰'),
              new ButtonBuilder().setCustomId('help_autoline').setLabel('خط تلقائي').setStyle(ButtonStyle.Secondary).setEmoji('🤖'),
              new ButtonBuilder().setCustomId('help_suggestion').setLabel('اقتراحات').setStyle(ButtonStyle.Secondary).setEmoji('💡'),
              new ButtonBuilder().setCustomId('help_feedback').setLabel('اراء').setStyle(ButtonStyle.Secondary).setEmoji('💭').setDisabled(true),
              new ButtonBuilder().setCustomId('help_system').setLabel('سيستم').setStyle(ButtonStyle.Secondary).setEmoji('⚙️'),
            )

            const btns2 = new ActionRowBuilder().addComponents(
              new ButtonBuilder().setCustomId('help_ticket').setLabel('تكت').setStyle(ButtonStyle.Secondary).setEmoji('🎫'),
              new ButtonBuilder().setCustomId('help_giveaway').setLabel('جيف اوي').setStyle(ButtonStyle.Secondary).setEmoji('🎁'),
              new ButtonBuilder().setCustomId('help_protection').setLabel('حماية').setStyle(ButtonStyle.Secondary).setEmoji('🛡️'),
              new ButtonBuilder().setCustomId('help_logs').setLabel('لوج').setStyle(ButtonStyle.Secondary).setEmoji('📜'),
              new ButtonBuilder().setCustomId('help_apply').setLabel('تقديمات').setStyle(ButtonStyle.Secondary).setEmoji('📝'),
            )

            const btns3 = new ActionRowBuilder().addComponents(
              new ButtonBuilder().setCustomId('help_broadcast').setLabel('برودكاست').setStyle(ButtonStyle.Secondary).setEmoji('📢'),
              new ButtonBuilder().setCustomId('help_nadeko').setLabel('ناديكو').setStyle(ButtonStyle.Secondary).setEmoji('⏳'),
              new ButtonBuilder().setCustomId('help_autoreply').setLabel('رد تلقائي').setStyle(ButtonStyle.Secondary).setEmoji('💎'),
            )

            await interaction.update({ embeds: [embed], components: [btns1, btns2, btns3] });
          } else
            /**
             * @desc : SYSTEM COMMANDS
            */
            if (interaction.customId === "help_system") {
              const embed = new EmbedBuilder()
                .setAuthor({ name: interaction.guild.name, iconURL: interaction.guild.iconURL({ dynamic: true }) })
                .setTitle('قائمة اوامر البوت')
                .addFields(
                  { name: `\`/avatar\``, value: `لرؤية افتارك او فتار شخص اخر` },
                  { name: `\`/server\``, value: `لرؤية معلومات السيرفر` },
                  { name: `\`/user\``, value: `لرؤية معلومات حسابك او حساب شخص اخر` },
                  { name: `\`/banner\``, value: `لرؤية بانرك او بانر شخص اخر` },
                  { name: `\`/ban\``, value: `لاعطاء باند لشخص او ازالته` },
                  { name: `\`/clear\``, value: `لحذف عدد من الرسائل` },
                  { name: `\`/come\``, value: `لاستدعاء شخص` },
                  { name: `\`/embed\``, value: `لقول كلام في ايمبد` },
                  { name: `\`/hide\``, value: `لاخفاء روم` },
                  { name: `\`/kick\``, value: `لاعطاء طرد لشخص او ازالته` },
                  { name: `\`/lock\``, value: `لقفل روم` },
                  { name: `\`/nickname\``, value: `اعطاء اسم مستعار لشخص او ازالته` },
                  { name: `\`/mute\``, value: `لاعطاء ميوت لشخص او ازالته` },
                  { name: `\`/role\``, value: `لاعطاء رتبة لشخص او ازالتها` },
                  { name: `\`/roles\``, value: `للاستعلام عن رتب السيرفر` },
                  { name: `\`/say\``, value: `لقول كلام` },
                  { name: `\`/send\``, value: `لارسال رسالة لشخص ما` },
                  { name: `\`/timeout\``, value: `لاعطاء تايم اوت لشخص او ازالته` },
                  { name: `\`/unhide\``, value: `لاظهار روم` },
                  { name: `\`/unlock\``, value: `لفتح الروم` },
                )
                .setTimestamp()
                .setFooter({ text: `Requested By ${interaction.user.username}`, iconURL: interaction.user.displayAvatarURL({ dynamic: true }) })
                .setColor('DarkButNotBlack');
              const btns1 = new ActionRowBuilder().addComponents(
                new ButtonBuilder().setCustomId('help_tax').setLabel('ضريبة').setStyle(ButtonStyle.Secondary).setEmoji('💰'),
                new ButtonBuilder().setCustomId('help_autoline').setLabel('خط تلقائي').setStyle(ButtonStyle.Secondary).setEmoji('🤖'),
                new ButtonBuilder().setCustomId('help_suggestion').setLabel('اقتراحات').setStyle(ButtonStyle.Secondary).setEmoji('💡'),
                new ButtonBuilder().setCustomId('help_feedback').setLabel('اراء').setStyle(ButtonStyle.Secondary).setEmoji('💭'),
                new ButtonBuilder().setCustomId('help_system').setLabel('سيستم').setStyle(ButtonStyle.Secondary).setEmoji('⚙️').setDisabled(true),
              )

              const btns2 = new ActionRowBuilder().addComponents(
                new ButtonBuilder().setCustomId('help_ticket').setLabel('تكت').setStyle(ButtonStyle.Secondary).setEmoji('🎫'),
                new ButtonBuilder().setCustomId('help_giveaway').setLabel('جيف اوي').setStyle(ButtonStyle.Secondary).setEmoji('🎁'),
                new ButtonBuilder().setCustomId('help_protection').setLabel('حماية').setStyle(ButtonStyle.Secondary).setEmoji('🛡️'),
                new ButtonBuilder().setCustomId('help_logs').setLabel('لوج').setStyle(ButtonStyle.Secondary).setEmoji('📜'),
                new ButtonBuilder().setCustomId('help_apply').setLabel('تقديمات').setStyle(ButtonStyle.Secondary).setEmoji('📝'),
              )

              const btns3 = new ActionRowBuilder().addComponents(
                new ButtonBuilder().setCustomId('help_broadcast').setLabel('برودكاست').setStyle(ButtonStyle.Secondary).setEmoji('📢'),
                new ButtonBuilder().setCustomId('help_nadeko').setLabel('ناديكو').setStyle(ButtonStyle.Secondary).setEmoji('⏳'),
                new ButtonBuilder().setCustomId('help_autoreply').setLabel('رد تلقائي').setStyle(ButtonStyle.Secondary).setEmoji('💎'),
              )

              await interaction.update({ embeds: [embed], components: [btns1, btns2, btns3] });
            } else
              /**
               * @desc : TICKET COMMANDS
              */
              if (interaction.customId === "help_ticket") {
                const embed = new EmbedBuilder()
                  .setAuthor({ name: interaction.guild.name, iconURL: interaction.guild.iconURL({ dynamic: true }) })
                  .setTitle('قائمة اوامر البوت')
                  .addFields(
                    { name: `\`/setup\``, value: `لتسطيب نظام التكت` },
                    { name: `\`/add-ticket-panel\``, value: `اضافة بانل لنظام التكت` },
                    { name: `\`/send-ticket-panel\``, value: `لارسال بانل التكت` },
                    { name: `\`/remove-ticket-panel\``, value: `حذف بانل من نظام التكت` },
                    { name: `\`/reset\``, value: `لتصفير نقاط شخص` },
                    { name: `\`/reset-all\``, value: `لتصفير نقاط الكل` },
                    { name: `\`/top\``, value: `لرؤية نقاط جميع الاعضاء` },
                  )
                  .setTimestamp()
                  .setFooter({ text: `Requested By ${interaction.user.username}`, iconURL: interaction.user.displayAvatarURL({ dynamic: true }) })
                  .setColor('DarkButNotBlack');
                const btns1 = new ActionRowBuilder().addComponents(
                  new ButtonBuilder().setCustomId('help_tax').setLabel('ضريبة').setStyle(ButtonStyle.Secondary).setEmoji('💰'),
                  new ButtonBuilder().setCustomId('help_autoline').setLabel('خط تلقائي').setStyle(ButtonStyle.Secondary).setEmoji('🤖'),
                  new ButtonBuilder().setCustomId('help_suggestion').setLabel('اقتراحات').setStyle(ButtonStyle.Secondary).setEmoji('💡'),
                  new ButtonBuilder().setCustomId('help_feedback').setLabel('اراء').setStyle(ButtonStyle.Secondary).setEmoji('💭'),
                  new ButtonBuilder().setCustomId('help_system').setLabel('سيستم').setStyle(ButtonStyle.Secondary).setEmoji('⚙️'),
                )

                const btns2 = new ActionRowBuilder().addComponents(
                  new ButtonBuilder().setCustomId('help_ticket').setLabel('تكت').setStyle(ButtonStyle.Secondary).setEmoji('🎫').setDisabled(true),
                  new ButtonBuilder().setCustomId('help_giveaway').setLabel('جيف اوي').setStyle(ButtonStyle.Secondary).setEmoji('🎁'),
                  new ButtonBuilder().setCustomId('help_protection').setLabel('حماية').setStyle(ButtonStyle.Secondary).setEmoji('🛡️'),
                  new ButtonBuilder().setCustomId('help_logs').setLabel('لوج').setStyle(ButtonStyle.Secondary).setEmoji('📜'),
                  new ButtonBuilder().setCustomId('help_apply').setLabel('تقديمات').setStyle(ButtonStyle.Secondary).setEmoji('📝'),
                )

                const btns3 = new ActionRowBuilder().addComponents(
                  new ButtonBuilder().setCustomId('help_broadcast').setLabel('برودكاست').setStyle(ButtonStyle.Secondary).setEmoji('📢'),
                  new ButtonBuilder().setCustomId('help_nadeko').setLabel('ناديكو').setStyle(ButtonStyle.Secondary).setEmoji('⏳'),
                  new ButtonBuilder().setCustomId('help_autoreply').setLabel('رد تلقائي').setStyle(ButtonStyle.Secondary).setEmoji('💎'),
                )

                await interaction.update({ embeds: [embed], components: [btns1, btns2, btns3] });
              } else
                /**
                 * @desc : GIVEAWAY COMMANDS
                */
                if (interaction.customId === "help_giveaway") {
                  const embed = new EmbedBuilder()
                    .setAuthor({ name: interaction.guild.name, iconURL: interaction.guild.iconURL({ dynamic: true }) })
                    .setTitle('قائمة اوامر البوت')
                    .addFields(
                      { name: `\`/gstart\``, value: `لبدا جيف اوي` },
                      { name: `\`/gend\``, value: `لانهاء جيف اوي` },
                      { name: `\`/greroll\``, value: `لاعادة الفائزين في جيف اوي` },
                    )
                    .setTimestamp()
                    .setFooter({ text: `Requested By ${interaction.user.username}`, iconURL: interaction.user.displayAvatarURL({ dynamic: true }) })
                    .setColor('DarkButNotBlack');
                  const btns1 = new ActionRowBuilder().addComponents(
                    new ButtonBuilder().setCustomId('help_tax').setLabel('ضريبة').setStyle(ButtonStyle.Secondary).setEmoji('💰'),
                    new ButtonBuilder().setCustomId('help_autoline').setLabel('خط تلقائي').setStyle(ButtonStyle.Secondary).setEmoji('🤖'),
                    new ButtonBuilder().setCustomId('help_suggestion').setLabel('اقتراحات').setStyle(ButtonStyle.Secondary).setEmoji('💡'),
                    new ButtonBuilder().setCustomId('help_feedback').setLabel('اراء').setStyle(ButtonStyle.Secondary).setEmoji('💭'),
                    new ButtonBuilder().setCustomId('help_system').setLabel('سيستم').setStyle(ButtonStyle.Secondary).setEmoji('⚙️'),
                  )

                  const btns2 = new ActionRowBuilder().addComponents(
                    new ButtonBuilder().setCustomId('help_ticket').setLabel('تكت').setStyle(ButtonStyle.Secondary).setEmoji('🎫'),
                    new ButtonBuilder().setCustomId('help_giveaway').setLabel('جيف اوي').setStyle(ButtonStyle.Secondary).setEmoji('🎁').setDisabled(true),
                    new ButtonBuilder().setCustomId('help_protection').setLabel('حماية').setStyle(ButtonStyle.Secondary).setEmoji('🛡️'),
                    new ButtonBuilder().setCustomId('help_logs').setLabel('لوج').setStyle(ButtonStyle.Secondary).setEmoji('📜'),
                    new ButtonBuilder().setCustomId('help_apply').setLabel('تقديمات').setStyle(ButtonStyle.Secondary).setEmoji('📝'),
                  )

                  const btns3 = new ActionRowBuilder().addComponents(
                    new ButtonBuilder().setCustomId('help_broadcast').setLabel('برودكاست').setStyle(ButtonStyle.Secondary).setEmoji('📢'),
                    new ButtonBuilder().setCustomId('help_nadeko').setLabel('ناديكو').setStyle(ButtonStyle.Secondary).setEmoji('⏳'),
                    new ButtonBuilder().setCustomId('help_autoreply').setLabel('رد تلقائي').setStyle(ButtonStyle.Secondary).setEmoji('💎'),
                  )

                  await interaction.update({ embeds: [embed], components: [btns1, btns2, btns3] });
                } else
                  /**
               * @desc : PROTECTION COMMANDS
              */
                  if (interaction.customId === "help_protection") {
                    const embed = new EmbedBuilder()
                      .setAuthor({ name: interaction.guild.name, iconURL: interaction.guild.iconURL({ dynamic: true }) })
                      .setTitle('قائمة اوامر البوت')
                      .addFields(
                        { name: `\`/anti-ban\``, value: `لتسطيب نظام الحماية من الباند` },
                        { name: `\`/anti-bots\``, value: `لتسطيب نظام الحماية من البوتات` },
                        { name: `\`/anti-delete-roles\``, value: `لتسطيب نظام الحماية من حذف الرتب` },
                        { name: `\`/anti-delete-rooms\``, value: `لتسطيب نظام الحماية من حذف الرومات` },
                        { name: `\`/protection-status\``, value: `للاستعلام عن حالة نظام الحماية` },
                        { name: `\`/set-protect-logs\``, value: `لتحديد روم لوج الحماية` },
                      )
                      .setTimestamp()
                      .setFooter({ text: `Requested By ${interaction.user.username}`, iconURL: interaction.user.displayAvatarURL({ dynamic: true }) })
                      .setColor('DarkButNotBlack');
                    const btns1 = new ActionRowBuilder().addComponents(
                      new ButtonBuilder().setCustomId('help_tax').setLabel('ضريبة').setStyle(ButtonStyle.Secondary).setEmoji('💰'),
                      new ButtonBuilder().setCustomId('help_autoline').setLabel('خط تلقائي').setStyle(ButtonStyle.Secondary).setEmoji('🤖'),
                      new ButtonBuilder().setCustomId('help_suggestion').setLabel('اقتراحات').setStyle(ButtonStyle.Secondary).setEmoji('💡'),
                      new ButtonBuilder().setCustomId('help_feedback').setLabel('اراء').setStyle(ButtonStyle.Secondary).setEmoji('💭'),
                      new ButtonBuilder().setCustomId('help_system').setLabel('سيستم').setStyle(ButtonStyle.Secondary).setEmoji('⚙️'),
                    )

                    const btns2 = new ActionRowBuilder().addComponents(
                      new ButtonBuilder().setCustomId('help_ticket').setLabel('تكت').setStyle(ButtonStyle.Secondary).setEmoji('🎫'),
                      new ButtonBuilder().setCustomId('help_giveaway').setLabel('جيف اوي').setStyle(ButtonStyle.Secondary).setEmoji('🎁'),
                      new ButtonBuilder().setCustomId('help_protection').setLabel('حماية').setStyle(ButtonStyle.Secondary).setEmoji('🛡️').setDisabled(true),
                      new ButtonBuilder().setCustomId('help_logs').setLabel('لوج').setStyle(ButtonStyle.Secondary).setEmoji('📜'),
                      new ButtonBuilder().setCustomId('help_apply').setLabel('تقديمات').setStyle(ButtonStyle.Secondary).setEmoji('📝'),
                    )

                    const btns3 = new ActionRowBuilder().addComponents(
                      new ButtonBuilder().setCustomId('help_broadcast').setLabel('برودكاست').setStyle(ButtonStyle.Secondary).setEmoji('📢'),
                      new ButtonBuilder().setCustomId('help_nadeko').setLabel('ناديكو').setStyle(ButtonStyle.Secondary).setEmoji('⏳'),
                      new ButtonBuilder().setCustomId('help_autoreply').setLabel('رد تلقائي').setStyle(ButtonStyle.Secondary).setEmoji('💎'),
                    )

                    await interaction.update({ embeds: [embed], components: [btns1, btns2, btns3] });
                  } else
                    /**
             * @desc : LOGS COMMANDS
            */
                    if (interaction.customId === "help_logs") {
                      const embed = new EmbedBuilder()
                        .setAuthor({ name: interaction.guild.name, iconURL: interaction.guild.iconURL({ dynamic: true }) })
                        .setTitle('قائمة اوامر البوت')
                        .addFields(
                          { name: `\`/logs-info\``, value: `لمعرفة معلومات نظام اللوج في السيرفر` },
                          { name: `\`/setup-logs\``, value: `لتسطيب نظام اللوج في السيرفر` },
                        )
                        .setTimestamp()
                        .setFooter({ text: `Requested By ${interaction.user.username}`, iconURL: interaction.user.displayAvatarURL({ dynamic: true }) })
                        .setColor('DarkButNotBlack');
                      const btns1 = new ActionRowBuilder().addComponents(
                        new ButtonBuilder().setCustomId('help_tax').setLabel('ضريبة').setStyle(ButtonStyle.Secondary).setEmoji('💰'),
                        new ButtonBuilder().setCustomId('help_autoline').setLabel('خط تلقائي').setStyle(ButtonStyle.Secondary).setEmoji('🤖'),
                        new ButtonBuilder().setCustomId('help_suggestion').setLabel('اقتراحات').setStyle(ButtonStyle.Secondary).setEmoji('💡'),
                        new ButtonBuilder().setCustomId('help_feedback').setLabel('اراء').setStyle(ButtonStyle.Secondary).setEmoji('💭'),
                        new ButtonBuilder().setCustomId('help_system').setLabel('سيستم').setStyle(ButtonStyle.Secondary).setEmoji('⚙️'),
                      )

                      const btns2 = new ActionRowBuilder().addComponents(
                        new ButtonBuilder().setCustomId('help_ticket').setLabel('تكت').setStyle(ButtonStyle.Secondary).setEmoji('🎫'),
                        new ButtonBuilder().setCustomId('help_giveaway').setLabel('جيف اوي').setStyle(ButtonStyle.Secondary).setEmoji('🎁'),
                        new ButtonBuilder().setCustomId('help_protection').setLabel('حماية').setStyle(ButtonStyle.Secondary).setEmoji('🛡️'),
                        new ButtonBuilder().setCustomId('help_logs').setLabel('لوج').setStyle(ButtonStyle.Secondary).setEmoji('📜').setDisabled(true),
                        new ButtonBuilder().setCustomId('help_apply').setLabel('تقديمات').setStyle(ButtonStyle.Secondary).setEmoji('📝'),
                      )

                      const btns3 = new ActionRowBuilder().addComponents(
                        new ButtonBuilder().setCustomId('help_broadcast').setLabel('برودكاست').setStyle(ButtonStyle.Secondary).setEmoji('📢'),
                        new ButtonBuilder().setCustomId('help_nadeko').setLabel('ناديكو').setStyle(ButtonStyle.Secondary).setEmoji('⏳'),
                        new ButtonBuilder().setCustomId('help_autoreply').setLabel('رد تلقائي').setStyle(ButtonStyle.Secondary).setEmoji('💎'),
                      )

                      await interaction.update({ embeds: [embed], components: [btns1, btns2, btns3] });
                    } else
                      /**
                       * @desc : APPLY COMMANDS
                      */
                      if (interaction.customId === "help_apply") {
                        const embed = new EmbedBuilder()
                          .setAuthor({ name: interaction.guild.name, iconURL: interaction.guild.iconURL({ dynamic: true }) })
                          .setTitle('قائمة اوامر البوت')
                          .addFields(
                            { name: `\`/setup-apply\``, value: `لتسطيب نظام التقديم` },
                            { name: `\`/new-apply\``, value: `لانشاء تقديم جديد` },
                            { name: `\`/dm-mode\``, value: `لارسال رسالة لخاص المتقدم عند الرفض او القبول` },
                            { name: `\`/close-apply\``, value: `لانهاء التقديم المفتوح` },
                          )
                          .setTimestamp()
                          .setFooter({ text: `Requested By ${interaction.user.username}`, iconURL: interaction.user.displayAvatarURL({ dynamic: true }) })
                          .setColor('DarkButNotBlack');
                        const btns1 = new ActionRowBuilder().addComponents(
                          new ButtonBuilder().setCustomId('help_tax').setLabel('ضريبة').setStyle(ButtonStyle.Secondary).setEmoji('💰'),
                          new ButtonBuilder().setCustomId('help_autoline').setLabel('خط تلقائي').setStyle(ButtonStyle.Secondary).setEmoji('🤖'),
                          new ButtonBuilder().setCustomId('help_suggestion').setLabel('اقتراحات').setStyle(ButtonStyle.Secondary).setEmoji('💡'),
                          new ButtonBuilder().setCustomId('help_feedback').setLabel('اراء').setStyle(ButtonStyle.Secondary).setEmoji('💭'),
                          new ButtonBuilder().setCustomId('help_system').setLabel('سيستم').setStyle(ButtonStyle.Secondary).setEmoji('⚙️'),
                        )

                        const btns2 = new ActionRowBuilder().addComponents(
                          new ButtonBuilder().setCustomId('help_ticket').setLabel('تكت').setStyle(ButtonStyle.Secondary).setEmoji('🎫'),
                          new ButtonBuilder().setCustomId('help_giveaway').setLabel('جيف اوي').setStyle(ButtonStyle.Secondary).setEmoji('🎁'),
                          new ButtonBuilder().setCustomId('help_protection').setLabel('حماية').setStyle(ButtonStyle.Secondary).setEmoji('🛡️'),
                          new ButtonBuilder().setCustomId('help_logs').setLabel('لوج').setStyle(ButtonStyle.Secondary).setEmoji('📜'),
                          new ButtonBuilder().setCustomId('help_apply').setLabel('تقديمات').setStyle(ButtonStyle.Secondary).setEmoji('📝').setDisabled(true),
                        )

                        const btns3 = new ActionRowBuilder().addComponents(
                          new ButtonBuilder().setCustomId('help_broadcast').setLabel('برودكاست').setStyle(ButtonStyle.Secondary).setEmoji('📢'),
                          new ButtonBuilder().setCustomId('help_nadeko').setLabel('ناديكو').setStyle(ButtonStyle.Secondary).setEmoji('⏳'),
                          new ButtonBuilder().setCustomId('help_autoreply').setLabel('رد تلقائي').setStyle(ButtonStyle.Secondary).setEmoji('💎'),
                        )

                        await interaction.update({ embeds: [embed], components: [btns1, btns2, btns3] });
                      } else
                        /**
                 * @desc : BROADCAST COMMANDS
                */
                        if (interaction.customId === "help_broadcast") {
                          const embed = new EmbedBuilder()
                            .setAuthor({ name: interaction.guild.name, iconURL: interaction.guild.iconURL({ dynamic: true }) })
                            .setTitle('قائمة اوامر البوت')
                            .addFields(
                              { name: `\`/send-panel\``, value: `ارسال بانل التحكم في البرودكاست` },
                            )
                            .setTimestamp()
                            .setFooter({ text: `Requested By ${interaction.user.username}`, iconURL: interaction.user.displayAvatarURL({ dynamic: true }) })
                            .setColor('DarkButNotBlack');
                          const btns1 = new ActionRowBuilder().addComponents(
                            new ButtonBuilder().setCustomId('help_tax').setLabel('ضريبة').setStyle(ButtonStyle.Secondary).setEmoji('💰'),
                            new ButtonBuilder().setCustomId('help_autoline').setLabel('خط تلقائي').setStyle(ButtonStyle.Secondary).setEmoji('🤖'),
                            new ButtonBuilder().setCustomId('help_suggestion').setLabel('اقتراحات').setStyle(ButtonStyle.Secondary).setEmoji('💡'),
                            new ButtonBuilder().setCustomId('help_feedback').setLabel('اراء').setStyle(ButtonStyle.Secondary).setEmoji('💭'),
                            new ButtonBuilder().setCustomId('help_system').setLabel('سيستم').setStyle(ButtonStyle.Secondary).setEmoji('⚙️'),
                          )

                          const btns2 = new ActionRowBuilder().addComponents(
                            new ButtonBuilder().setCustomId('help_ticket').setLabel('تكت').setStyle(ButtonStyle.Secondary).setEmoji('🎫'),
                            new ButtonBuilder().setCustomId('help_giveaway').setLabel('جيف اوي').setStyle(ButtonStyle.Secondary).setEmoji('🎁'),
                            new ButtonBuilder().setCustomId('help_protection').setLabel('حماية').setStyle(ButtonStyle.Secondary).setEmoji('🛡️'),
                            new ButtonBuilder().setCustomId('help_logs').setLabel('لوج').setStyle(ButtonStyle.Secondary).setEmoji('📜'),
                            new ButtonBuilder().setCustomId('help_apply').setLabel('تقديمات').setStyle(ButtonStyle.Secondary).setEmoji('📝'),
                          )

                          const btns3 = new ActionRowBuilder().addComponents(
                            new ButtonBuilder().setCustomId('help_broadcast').setLabel('برودكاست').setStyle(ButtonStyle.Secondary).setEmoji('📢').setDisabled(true),
                            new ButtonBuilder().setCustomId('help_nadeko').setLabel('ناديكو').setStyle(ButtonStyle.Secondary).setEmoji('⏳'),
                            new ButtonBuilder().setCustomId('help_autoreply').setLabel('رد تلقائي').setStyle(ButtonStyle.Secondary).setEmoji('💎'),
                          )

                          await interaction.update({ embeds: [embed], components: [btns1, btns2, btns3] });
                        } else
                          /**
                           * @desc : NADEKO COMMANDS
                          */
                          if (interaction.customId === "help_nadeko") {
                            const embed = new EmbedBuilder()
                              .setAuthor({ name: interaction.guild.name, iconURL: interaction.guild.iconURL({ dynamic: true }) })
                              .setTitle('قائمة اوامر البوت')
                              .addFields(
                                { name: `\`/set-message\``, value: `لتحديد الرسالة عند الدخول` },
                                { name: `\`/add-nadeko-room\``, value: `لاضافة روم يتم تفعيل الخاصية فيها` },
                                { name: `\`/remove-nadeko-room\``, value: `لازالة روم مفعل الخاصية فيها` },
                              )
                              .setTimestamp()
                              .setFooter({ text: `Requested By ${interaction.user.username}`, iconURL: interaction.user.displayAvatarURL({ dynamic: true }) })
                              .setColor('DarkButNotBlack');
                            const btns1 = new ActionRowBuilder().addComponents(
                              new ButtonBuilder().setCustomId('help_tax').setLabel('ضريبة').setStyle(ButtonStyle.Secondary).setEmoji('💰'),
                              new ButtonBuilder().setCustomId('help_autoline').setLabel('خط تلقائي').setStyle(ButtonStyle.Secondary).setEmoji('🤖'),
                              new ButtonBuilder().setCustomId('help_suggestion').setLabel('اقتراحات').setStyle(ButtonStyle.Secondary).setEmoji('💡'),
                              new ButtonBuilder().setCustomId('help_feedback').setLabel('اراء').setStyle(ButtonStyle.Secondary).setEmoji('💭'),
                              new ButtonBuilder().setCustomId('help_system').setLabel('سيستم').setStyle(ButtonStyle.Secondary).setEmoji('⚙️'),
                            )

                            const btns2 = new ActionRowBuilder().addComponents(
                              new ButtonBuilder().setCustomId('help_ticket').setLabel('تكت').setStyle(ButtonStyle.Secondary).setEmoji('🎫'),
                              new ButtonBuilder().setCustomId('help_giveaway').setLabel('جيف اوي').setStyle(ButtonStyle.Secondary).setEmoji('🎁'),
                              new ButtonBuilder().setCustomId('help_protection').setLabel('حماية').setStyle(ButtonStyle.Secondary).setEmoji('🛡️'),
                              new ButtonBuilder().setCustomId('help_logs').setLabel('لوج').setStyle(ButtonStyle.Secondary).setEmoji('📜'),
                              new ButtonBuilder().setCustomId('help_apply').setLabel('تقديمات').setStyle(ButtonStyle.Secondary).setEmoji('📝'),
                            )

                            const btns3 = new ActionRowBuilder().addComponents(
                              new ButtonBuilder().setCustomId('help_broadcast').setLabel('برودكاست').setStyle(ButtonStyle.Secondary).setEmoji('📢'),
                              new ButtonBuilder().setCustomId('help_nadeko').setLabel('ناديكو').setStyle(ButtonStyle.Secondary).setEmoji('⏳').setDisabled(true),
                              new ButtonBuilder().setCustomId('help_autoreply').setLabel('رد تلقائي').setStyle(ButtonStyle.Secondary).setEmoji('💎'),
                            )

                            await interaction.update({ embeds: [embed], components: [btns1, btns2, btns3] });
                          } else
                            /**
                             * @desc : AUTOREPLY COMMANDS
                            */
                            if (interaction.customId === "help_autoreply") {
                              const embed = new EmbedBuilder()
                                .setAuthor({ name: interaction.guild.name, iconURL: interaction.guild.iconURL({ dynamic: true }) })
                                .setTitle('قائمة اوامر البوت')
                                .addFields(
                                  { name: `\`/autoreply-add\``, value: `لاضافة رد تلقائي` },
                                  { name: `\`/autoreply-remove\``, value: `لازالة رد تلقائي` },
                                  { name: `\`/autoreply-list\``, value: `لرؤية جميع الردود` },
                                )
                                .setTimestamp()
                                .setFooter({ text: `Requested By ${interaction.user.username}`, iconURL: interaction.user.displayAvatarURL({ dynamic: true }) })
                                .setColor('DarkButNotBlack');
                              const btns1 = new ActionRowBuilder().addComponents(
                                new ButtonBuilder().setCustomId('help_tax').setLabel('ضريبة').setStyle(ButtonStyle.Secondary).setEmoji('💰'),
                                new ButtonBuilder().setCustomId('help_autoline').setLabel('خط تلقائي').setStyle(ButtonStyle.Secondary).setEmoji('🤖'),
                                new ButtonBuilder().setCustomId('help_suggestion').setLabel('اقتراحات').setStyle(ButtonStyle.Secondary).setEmoji('💡'),
                                new ButtonBuilder().setCustomId('help_feedback').setLabel('اراء').setStyle(ButtonStyle.Secondary).setEmoji('💭'),
                                new ButtonBuilder().setCustomId('help_system').setLabel('سيستم').setStyle(ButtonStyle.Secondary).setEmoji('⚙️'),
                              )

                              const btns2 = new ActionRowBuilder().addComponents(
                                new ButtonBuilder().setCustomId('help_ticket').setLabel('تكت').setStyle(ButtonStyle.Secondary).setEmoji('🎫'),
                                new ButtonBuilder().setCustomId('help_giveaway').setLabel('جيف اوي').setStyle(ButtonStyle.Secondary).setEmoji('🎁'),
                                new ButtonBuilder().setCustomId('help_protection').setLabel('حماية').setStyle(ButtonStyle.Secondary).setEmoji('🛡️'),
                                new ButtonBuilder().setCustomId('help_logs').setLabel('لوج').setStyle(ButtonStyle.Secondary).setEmoji('📜'),
                                new ButtonBuilder().setCustomId('help_apply').setLabel('تقديمات').setStyle(ButtonStyle.Secondary).setEmoji('📝'),
                              )

                              const btns3 = new ActionRowBuilder().addComponents(
                                new ButtonBuilder().setCustomId('help_broadcast').setLabel('برودكاست').setStyle(ButtonStyle.Secondary).setEmoji('📢'),
                                new ButtonBuilder().setCustomId('help_nadeko').setLabel('ناديكو').setStyle(ButtonStyle.Secondary).setEmoji('⏳'),
                                new ButtonBuilder().setCustomId('help_autoreply').setLabel('رد تلقائي').setStyle(ButtonStyle.Secondary).setEmoji('💎').setDisabled(true),
                              )

                              await interaction.update({ embeds: [embed], components: [btns1, btns2, btns3] });
                            }
  })

  //-------------------------- جميع الاكواد هنا ----------------------//

  client27.login(token)
    .catch(async (err) => {
      const filtered = one4all.filter(bo => bo != data)
      await tokens.set(`one4all`, filtered)
      console.log(`${clientId} Not working and removed `)
    });


})
