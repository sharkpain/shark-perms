module.exports = {
    execute: function (message, args, util) {
        /*
        if search(msg, 'admin'):
			if msg.author.id == 453924399402319882:
				try:
					datas['admins'][str(msg.author.guild.id)] = datas['admins'][str(msg.author.guild.id)]
				except:
					datas['admins'][str(msg.author.guild.id)] = []
				if args[1] == 'add':
					datas['admins'][str(msg.author.guild.id)].append(int(args[2]))
					await save(datas, msg=msg)
					await msg.channel.send('added ' + args[2] + ' to admin list')
				if args[1] == 'remove':
					datas['admins'][str(msg.author.guild.id)].remove(int(args[2]))
					await save(datas, msg=msg)
					await msg.channel.send('removed ' + args[2] + ' from admin list')
				return
        */
       const sharkdb = util.apis["shark-db-db"].api;
       const sperms = util.apis["shark-perms-manager"].api;
       
    }
}