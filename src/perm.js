const { MessageEmbed } = require('discord.js');
module.exports = {
    execute: function (message, args, util) {
       const sharkdb = util.apis["shark-db-db"].api;
       const sperms = util.apis["shark-perms-manager"].api;
       switch(args[0]) {
			case 'group':
				sperms.permittedTo("perm", message.author.id, message.guild.id, (perm, user) => {
					if (!perm) return message.channel.send("you not allowed idiot");
					if (!args[1] || !args[2] || !args[3]) return message.channel.send("usage: perm group [add/remove] [group name] [user id]")
					if(!/^[0-9]{18,19}$/gm.test(args[3])) return message.channel.send("invalid user id >:(")
					if(!["add", "remove"].includes(args[1])) return message.channel.send("add or remove")
					sharkdb.getGroup(args[2], group => {
						if(!group) return message.channel.send("group not found")
						let userInGroup = user.permissions.groups.find(g => g._id.toString() == group._id.toString())
						if(args[1] == "add") {
							if (userInGroup) return message.channel.send("user already in group")
							user.permissions.groups.push({_id: group._id, name: group.name})
						}
						if(args[1] == "remove") {
							if (!userInGroup) return message.channel.send("user not in group")
							user.permissions.groups.splice(user.permissions.groups.indexOf(group._id), 1)
						}
						user.markModified("permissions");
						user.save(err => {
							if (err) return message.channel.send("error saving user")
							message.channel.send("user added/removed from/to group")
						})
					})
				})	
			break;
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
			case "whyperm":
				sperms.permittedTo("perm", message.author.id, message.guild.id, permitted => {
					if(!permitted) return message.channel.send("you not allowed idiot");
					if(!args[1] || !args[2]) return message.channel.send("user id and permissions please, usage: perm whyperm [user id] [permission]");
					if(!/^[0-9]{18,19}$/gm.test(args[1])) return message.channel.send("invalid user id >:(")
					sperms.wpermittedTo(args[2], args[1], message.guild.id, permitted => {
						if (!permitted) return message.channel.send("this person isnt allowed you idiot");
						if (permitted == "ERR_NOUSER") return message.channel.send("user not found (probably hasnt used the bot before)");
						message.channel.send(permitted);
					})
				});
				break;
			case 'setperm':
				sperms.permittedTo("perm", message.author.id, message.guild.id, permitted => {
					if(!permitted) return message.channel.send("you not allowed idiot");
					if(!args[1] || !args[2] || !args[3] || !args[4] || !args[5]) return message.channel.send("user or group and permission and what to do with it, \nusage: perm setperm [user/group] [user id/group name] [permission] [global/guild] [true/false]");
					let wtf = args.map((arg, i) => `${i}: ${arg}`).join('\n');
					let subject = args[1],
						id = args[2],
						perm = args[3],
						scope = args[4],
						value = args[5];
					if (!["user", "group"].includes(subject)) return message.channel.send("subject must be either user or group");
					if (subject == "user" && !/^[0-9]{18,19}$/gm.test(id)) return message.channel.send("use user id please");
					if (!["guild", "global"].includes(scope)) return message.channel.send("scope go either global or guild (will use the guild you are in)");
					if (!["false", "true"].includes(value)) return message.channel.send("value go either true or false");
					sperms.permissionObject(subject, id, permObject => {
						if (!permObject) return message.channel.send("user or group not found (or database error) \n make sure the user has used the bot before, or that the group exists");
						let isUser = subject == "user";
						let needCreation = false
						if(isUser && permObject.permissions.permissions.filter(p => p.id == perm).length < 1) needCreation = true
						if(!isUser && permObject.permissions.filter(p => p.id == perm).length < 1) needCreation = true
						if(needCreation) {
							if (isUser) permObject.permissions.permissions.push({id: perm, global: false, guildOnly: []});
							if (!isUser) permObject.permissions.push({id: perm, global: false, guildOnly: []});
						}
						if (scope == "global") {
							if (isUser) {
								let index = permObject.permissions.permissions.findIndex(p => p.id == perm);
								permObject.permissions.permissions[index].global = value == "true";
							}
							if (!isUser) {
								if (perm == "superhyperadmin") message.channel.send("that doesnt do anything but ok");
								let index = permObject.permissions.findIndex(p => p.id == perm);
								permObject.permissions[index].global = value == "true";
							}
						}
						if (scope == "guild") {
							if (isUser) {
								let index = permObject.permissions.permissions.findIndex(p => p.id == perm);
								let desiredValue = value == "true"
								if (desiredValue && !permObject.permissions.permissions[index].guildOnly.includes(message.guild.id)) permObject.permissions.permissions[index].guildOnly.push(message.guild.id);
								if (!desiredValue && permObject.permissions.permissions[index].guildOnly.includes(message.guild.id)) permObject.permissions.permissions[index].guildOnly.splice(permObject.permissions.permissions[index].guildOnly.indexOf(message.guild.id), 1);
							}
							if (!isUser) {
								if (perm == "superhyperadmin") message.channel.send("that doesnt do anything but ok");
								let index = permObject.permissions.findIndex(p => p.id == perm);
								let desiredValue = value == "true"
								if (desiredValue && !permObject.permissions[index].guildOnly.includes(message.guild.id)) permObject.permissions[index].guildOnly.push(message.guild.id);
								if (!desiredValue && permObject.permissions[index].guildOnly.includes(message.guild.id)) permObject.permissions[index].guildOnly.splice(permObject.permissions[index].guildOnly.indexOf(message.guild.id), 1);
							}
						}
						permObject.markModified("permissions");
						permObject.save(err => {
							if (err) {
								util.apis["core-error"].api.error(err);
								return message.channel.send("something broke")
							}
							return message.channel.send("permission set")
						})
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