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
        if (!user) return cb(pstates.MISSING, null);
        let APerm = user.permissions.permissions.filter(p => p.id == "superhyperadmin")[0];
        if (APerm) {
            if (APerm.global) return cb(pstates.ALLOW, user);
            if (APerm.guildOnly.includes(guildId)) return cb(pstates.ALLOW, user);
        }
        let UPerm = user.permissions.permissions.filter(p => p.id == permId)[0]; // {id: permId, global: false/true, guildOnly: [123,123,563,1,23,123,141]}
        if (UPerm) {
            if (UPerm.global) return cb(pstates.ALLOW, user);
            if (UPerm.guildOnly.includes(guildId)) return cb(pstates.ALLOW, user);
        }
        let userGroups = user.permissions.groups; // {id: groupId, name: groupName}
        if (userGroups.length < 1) return cb(pstates.DISALLOW, user);
        let ugi = userGroups.map(g => g.id);
        sharkdb.getGroups(ugi, groups => {
            if (!groups) return cb(pstates.DISALLOW, user);
            let gp = false
            groups.forEach(group => {
                let GPerm = group.permissions.filter(p => p.id == permId)[0];
                if (GPerm) {
                    if (GPerm.global) {
                        gp = true
                        return cb(pstates.ALLOW, user);
                    }
                    if (GPerm.guildOnly.includes(guildId)) {
                        gp = true
                        return cb(pstates.ALLOW, user);
                    }
                }
            })
            if (!gp) return cb(pstates.DISALLOW, user)
        })
    })
}

function wpermCheck(permId, discordId, guildId, cb) {
    let why = "";
    sharkdb.getUser(discordId, user => {
        if (!user) return cb(pstates.MISSING);
        let APerm = user.permissions.permissions.filter(p => p.id == "superhyperadmin")[0];
        if (APerm) {
            if (APerm.global) why += "superhyperadmin (global)\n";
            if (APerm.guildOnly.includes(guildId)) why += "superhyperadmin (guild)\n";
        }
        let UPerm = user.permissions.permissions.filter(p => p.id == permId)[0]; // {id: permId, global: false/true, guildOnly: [123,123,563,1,23,123,141]}
        if (UPerm) {
            if (UPerm.global) why += `${permId} (global)\n`;
            if (UPerm.guildOnly.includes(guildId)) why += `${permId} (guild)\n`;
        }
        let userGroups = user.permissions.groups; // {id: groupId, name: groupName}
        if (userGroups.length < 1 && why.length > 0) return cb(why);
        if (userGroups.length < 1 && why.length < 1) return cb(pstates.DISALLOW);
        let ugi = userGroups.map(g => g.id);
        sharkdb.getGroups(ugi, groups => {
            if (!groups && why.length > 0) return cb(why);
            if (!groups && why.length < 1) return cb(pstates.DISALLOW);
            let gp = false
            groups.forEach(group => {
                let GPerm = group.permissions.filter(p => p.id == permId)[0];
                if (GPerm) {
                    if (GPerm.global) {
                        gp = true
                        why += `${permId} (global) from group ${group.name}\n`;
                    }
                    if (GPerm.guildOnly.includes(guildId)) {
                        gp = true
                        why += `${permId} (guild) from group ${group.name}\n`;
                    }
                }
            })
            if (!gp && why.length < 1) return cb(pstates.DISALLOW);
            if (!gp && why.length > 0) return cb(why);
            if (gp) return cb(why);
        })
    })
}

function permittedTo(permId, discordId, guildId, cb) {
    permCheck(permId, discordId, guildId, (pstate, user) => {
        switch(pstate) {
            case pstates.ALLOW:
                cb(true, user);
                break;
            case pstates.DISALLOW:
                cb(false, user);
                break;
            case pstates.MISSING:
                permittedTo(permId, discordId, guildId, cb);
                break;
            default:
                cb(false, user);
                break;
        }
    })
}

function wpermittedTo(permId, discordId, guildId, cb) {
    wpermCheck(permId, discordId, guildId, pstate => {
        switch(pstate) {
            case pstates.DISALLOW:
                cb(false);
                break;
            case pstates.MISSING:
                cb("ERR_NOUSER");
                break;
            default:
                cb(pstate);
                break;
        }
    })
}

function permissionObject(subject, id, cb) {
    switch (subject) {
        case "user":
            sharkdb.getUser(id, user => {
                if (!user) return cb(false);
                cb(user);
            })
            break;
        case "group":
            sharkdb.getGroup(id, group => {
                if (!group) return cb(false);
                cb(group);
            })
            break;
    }
}

module.exports = {
    api: {wpermittedTo, permittedTo, permissionObject},
    pstates
}