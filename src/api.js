const apis = require('../../../index').apis;
const sharkdb = apis["shark-db-db"].api;

function permittedTo(permId, discordId, guildId, cb) {
    //see howthefuckitworks.png for reference
    sharkdb.getUser(discordId, user => {
        let APerm = user.permissions.permissions.filter(p => p.id == "superhyperadmin")[0];
        if (APerm) {
            if (APerm.global) return cb(true);
            if (APerm.guildOnly.includes(guildId)) return cb(true);
        }
        let UPerm = user.permissions.permissions.filter(p => p.id == permId)[0]; // {id: permId, global: false/true, guildOnly: [123,123,563,1,23,123,141]}
        if (UPerm) {
            if (UPerm.global) return cb(true);
            if (UPerm.guildOnly.includes(guildId)) return cb(true);
        }
        let userGroups = user.permissions.groups; // {id: groupId, name: groupName}
        if (userGroups.length < 1) return cb(false);
        let ugi = userGroups.map(g => g.id);
        sharkdb.getGroups(ugi, groups => {
            if (!groups) return cb(false);
            let gp = false
            groups.forEach(group => {
                let GPerm = group.permissions.filter(p => p.id == permId)[0];
                if (GPerm) {
                    if (GPerm.global) {
                        gp = true
                        return cb(true);
                    }
                    if (GPerm.guildOnly.includes(guildId)) {
                        gp = true
                        return cb(true);
                    }
                }
            })
            if (!gp) return cb(false)
        })
    })
}

module.exports = {
    api: {permittedTo}
}