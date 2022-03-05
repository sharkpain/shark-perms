const { MessageEmbed } = require('discord.js');
module.exports = {
    execute: function (message, args, util) {
       const sharkdb = util.apis["shark-db-db"].api;
       const sperms = util.apis["shark-perms-manager"].api;
       switch(args[0]) {
		   case 'myperms':
			   sharkdb.getUser(message.author.id, user => {
				   if (!user) return message.channel.send('try again');
				   let permEmbed = new MessageEmbed()
				   .setColor("#00A8F3")
				   .setTitle(`${message.author.username}'s permissions`)
				   .addFields(
					user.permissions.permissions.filter(p => p?.global).length > 0 ? { name: 'Global Permissions', value: user.permissions.permissions.filter(p => p?.global).map(p => p.id).join(', ') } : { name: 'Global Permissions', value: "none lol" }, 
					user.permissions.permissions.filter(p => p?.guildOnly.includes(message.guild.id)).length > 0 ? { name: 'Guild Permissions', value: user.permissions.permissions.filter(p => p?.guildOnly.includes(message.guild.id)).map(p => p.id).join(', ') } : { name: 'Guild Permissions', value: "none lol" },
					user.permissions.groups.length > 0 ? { name: 'Groups', value: user.permissions.groups.map(g => g?.name).join(', ') } : { name: 'Groups', value: "none lol" }
				   )
				   .setTimestamp()
				   .setFooter({text:"shark-perms-manager copyright 2023 urmom reserved", iconURL: "https://cdn.discordapp.com/avatars/585121910388424724/47ceb1466c5bd0648487c784d394cbfd.webp"});
					message.channel.send({embeds: [permEmbed]});
				})
			   break;
			default:
				sperms.permittedTo("perm", message.author.id, message.guild.id, permitted => {
					if(!permitted) return message.channel.send("you not allowed idiot");
					message.channel.send("you have perm epic man")
				});
	   }
    }
}