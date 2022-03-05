const apis = require('../../../index').apis;
const sharkdb = apis["shark-db-db"].api;

const pstates = Object.freeze({
    DISALLOW:   Symbol(0),
    ALLOW:      Symbol(1),
    MISSING:    Symbol(2)
});

function permCheck(permId, discordId, guildId, cb) {
    //see howthefuckitworks.png for reference
    sharkdb.getUser(discordId, user => {
        if (!user) return cb(pstates.MISSING);
        let APerm = user.permissions.permissions.filter(p => p.id == "superhyperadmin")[0];
        if (APerm) {
            if (APerm.global) return cb(pstates.ALLOW);
            if (APerm.guildOnly.includes(guildId)) return cb(pstates.ALLOW);
        }
        let UPerm = user.permissions.permissions.filter(p => p.id == permId)[0]; // {id: permId, global: false/true, guildOnly: [123,123,563,1,23,123,141]}
        if (UPerm) {
            if (UPerm.global) return cb(pstates.ALLOW);
            if (UPerm.guildOnly.includes(guildId)) return cb(pstates.ALLOW);
        }
        let userGroups = user.permissions.groups; // {id: groupId, name: groupName}
        if (userGroups.length < 1) return cb(pstates.DISALLOW);
        let ugi = userGroups.map(g => g.id);
        sharkdb.getGroups(ugi, groups => {
            if (!groups) return cb(pstates.DISALLOW);
            let gp = false
            groups.forEach(group => {
                let GPerm = group.permissions.filter(p => p.id == permId)[0];
                if (GPerm) {
                    if (GPerm.global) {
                        gp = true
                        return cb(pstates.ALLOW);
                    }
                    if (GPerm.guildOnly.includes(guildId)) {
                        gp = true
                        return cb(pstates.ALLOW);
                    }
                }
            })
            if (!gp) return cb(pstates.DISALLOW)
        })
    })
}

function permittedTo(permId, discordId, guildId, cb) {
    permCheck(permId, discordId, guildId, pstate => {
        switch(pstate) {
            case pstates.ALLOW:
                cb(true);
                break;
            case pstates.DISALLOW:
                cb(false);
                break;
            case pstates.MISSING:
                permittedTo(permId, discordId, guildId, cb);
                break;
            default:
                cb(false);
                break;
        }
    })
}

module.exports = {
    api: {permittedTo},
    pstates
}