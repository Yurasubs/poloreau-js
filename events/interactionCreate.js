const { MessageEmbed } = require('discord.js');

module.exports = async (client, interaction) => {

    if (!interaction.guild) return;

    if (interaction.isCommand()) {
        await interaction.deferReply();

        const cmd = client.commands.get(interaction.commandName);

        if (!cmd) return interaction.editReply({
            content: `Command \`${interaction.commandName}\` not found.`,
            ephemeral: true,
        });

        const DJ = client.config.opt.DJ;

        if (cmd && DJ.enabled && DJ.commands.includes(interaction.commandName)) {
            const roleDJ = interaction.guild.roles.cache.find(x => x.name === DJ.roleName);
            if (!interaction.member.permissions.has("MANAGE_GUILD")) {
                if (!interaction.member.roles.cache.has(roleDJ?.id)) {

                    const embed = new MessageEmbed()
                        .setColor('BLUE')
                        .setTitle(client.user.username)
                        .setThumbnail(client.user.displayAvatarURL())
                        .setDescription("To use some of the music commands in this bot, you must create and own a role named **DJ** on your server. Users without this role cannot use the " + client.config.opt.DJ.commands.map(astra => '`' + astra + '`').join(", "))
                        .addField("Invite Bot", `**[Add Me](https://bit.ly/3kbzi7b)**`, true)
                        .setTimestamp()
                        .setFooter({ text: 'Music Bot - by Umut Bayraktar ❤️', iconURL: interaction.user.displayAvatarURL({ dynamic: true }) });
                    return interaction.editReply({ content: `${interaction.user}`, embeds: [embed], ephemeral: true }).catch(() => false);
                }
            }
        }

        if (cmd && cmd.voiceChannel) {
            if (!interaction.member.voice.channel) return interaction.editReply({ content: `You are not connected to an audio channel. ❌`, ephemeral: true });
            if (interaction.guild.me.voice.channel && interaction.member.voice.channel.id !== interaction.guild.me.voice.channel.id) return interaction.editReply({ content: `You are not on the same audio channel as me. ❌`, ephemeral: true });
        }

        cmd.run(client, interaction)
    }

    if (interaction.isButton()) {
        const queue = client.player.getQueue(interaction.guildId);
        switch (interaction.customId) {
            case 'saveTrack': {
                if (!queue || !queue.playing) {
                    return interaction.editReply({ content: `No music currently playing. ❌`, ephemeral: true, components: [] });
                } else {
                    const embed = new MessageEmbed()
                        .setColor('BLUE')
                        .setTitle(client.user.username + " - Save Track")
                        .setThumbnail(client.user.displayAvatarURL())
                        .addField(`Track`, `\`${queue.current.title}\``)
                        .addField(`Duration`, `\`${queue.current.duration}\``)
                        .addField(`URL`, `${queue.current.url}`)
                        .addField(`Saved Server`, `\`${interaction.guild.name}\``)
                        .addField(`Requested By`, `${queue.current.requestedBy}`)
                        .setTimestamp()
                        .setFooter({ text: 'Music Bot Commands - by Umut Bayraktar ❤️', iconURL: interaction.user.displayAvatarURL({ dynamic: true }) });
                    interaction.member.send({ embeds: [embed] }).then(() => {
                        return interaction.editReply({ content: `I sent you the name of the music in a private message ✅`, ephemeral: true }).catch(e => { })
                    }).catch(error => {
                        return interaction.editReply({ content: `I can't send you a private message. ❌`, ephemeral: true }).catch(e => { })
                    });
                }
            }
                break
            case 'time': {
                if (!queue || !queue.playing) {
                    return interaction.editReply({ content: `No music currently playing. ❌`, ephemeral: true, components: [] });
                } else {

                    const progress = queue.createProgressBar();
                    const timestamp = queue.getPlayerTimestamp();

                    if (timestamp.progress == 'Infinity') return interaction.message.edit({ content: `This song is live streaming, no duration data to display. 🎧` }).catch(e => { })

                    const embed = new MessageEmbed()
                        .setColor('BLUE')
                        .setTitle(queue.current.title)
                        .setThumbnail(client.user.displayAvatarURL())
                        .setTimestamp()
                        .setDescription(`${progress} (**${timestamp.progress}**%)`)
                        .setFooter({ text: 'Music Bot Commands - by Umut Bayraktar ❤️', iconURL: interaction.user.displayAvatarURL({ dynamic: true }) });
                    interaction.message.edit({ embeds: [embed] }).catch(e => { })
                    interaction.editReply({ content: `**✅ Success:** Time data updated. `, ephemeral: true }).catch(() => false);
                }
            }
        }
    }
};
