const { MessageEmbed } = require('discord.js');
module.exports = {
    execute: function (message, args, util) {
       const sharkdb = util.apis["shark-db-db"].api;
       const sperms = util.apis["shark-perms-manager"].api;
       switch(args[0]) {
		   case 'creategroup':
				sperms.permittedTo("perm", message.author.id, message.guild.id, permitted => {
					if(!permitted) return message.channel.send("you not allowed idiot");
					if(!args[1]) return message.channel.send("specify group name, usage: perm creategroup [group name]");
					sharkdb.createGroup(args[1], group => {
						if (group == "ERR_BLACKLISTED") return message.channel.send("group name is blacklisted");
						if (group == "ERR_INUSE") return message.channel.send("group name is already taken");
						if (group == "ERR_DBFAIL") return message.channel.send("something broke");
						let groupEmbed = new MessageEmbed()
						.setColor("#00A8F3")
						.setTitle(`${args[1]}`)
						.setDescription(`created group ${group.name} with id ${group._id}`)
						.setFooter({text: `created by ${message.author.tag}`});
						message.channel.send({embeds: [groupEmbed]});
					})
				});
			   break;
			default:
				sharkdb.getUser(message.author.id, user => {
					if (!user) return this.execute(message, args, util);
				   let permEmbed = new MessageEmbed()
				   .setColor("#00A8F3")
				   .setTitle(`${message.author.username}'s permissions`)
				   .addFields(
					user.permissions.permissions.filter(p => p?.global).length > 0 ? { name: 'Global Permissions', value: user.permissions.permissions.filter(p => p?.global).map(p => p.id).join(', ') } : { name: 'Global Permissions', value: "none lol" }, 
					user.permissions.permissions.filter(p => p?.guildOnly.includes(message.guild.id) && !p?.global).length > 0 ? { name: 'Guild Permissions', value: user.permissions.permissions.filter(p => p?.guildOnly.includes(message.guild.id) && !p?.global).map(p => p.id).join(', ') } : { name: 'Guild Permissions', value: "none lol" },
					user.permissions.groups.length > 0 ? { name: 'Groups', value: user.permissions.groups.map(g => g?.name).join(', ') } : { name: 'Groups', value: "none lol" }
				   )
				   .setTimestamp()
				   .setFooter({text:"shark-perms-manager copyright 2023 urmom reserved", iconURL: "https://cdn.discordapp.com/avatars/585121910388424724/47ceb1466c5bd0648487c784d394cbfd.webp"});
					message.channel.send({embeds: [permEmbed]});
				})
				break;
	   }
    }
}