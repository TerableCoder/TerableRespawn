module.exports = function TerableRespawn(mod) {
	const command = mod.command || mod.require.command;
	
	function timeStamp() {
		let timeNow = new Date();
		let timeText = timeNow.getHours().toLocaleString(undefined, {minimumIntegerDigits: 2}) + ':' +
			timeNow.getMinutes().toLocaleString(undefined, {minimumIntegerDigits: 2}) + ':' + 
			timeNow.getSeconds().toLocaleString(undefined, {minimumIntegerDigits: 2});
		return ("[" + timeText + "] ");
	}

	let loc = {
        "x": 0,
        "y": 0,
        "z": 0
    };
	let deadLoc = {
        "x": 0,
        "y": 0,
        "z": 0
    };
	let enabled = false;
	let myGID = 0n;
	let location;
	let locationRealTime;
	
	command.add(['respawn', 'terar', 'trespawn', 'terablerespawn'], {
    	$default() {
    		enabled = !enabled;
        	command.message(`Respawn is now ${enabled ? "enabled" : "disabled"}.`);
    	}
	});
	
	mod.hook('S_CREATURE_LIFE', 3, event => {
		if (event.gameId == myGID && !event.alive && !event.resItem && !event.resPassive) {
			deadLoc = event.loc;
		}
	});

	mod.hook('S_DEAD_LOCATION', 2, event => {
		if (event.gameId == myGID && !event.alive && !event.resItem && !event.resPassive) {
			deadLoc = event.loc;
			if(enabled){
				console.log("sending ressurection");
				mod.setTimeout(() => {
					mod.send('C_REVIVE_NOW', 2, {
						"type": 0,
						"id": 4294967295 // ???
					});
				}, 1000);
			}
		}
	});
	
	mod.hook('S_LOAD_TOPO', 3, event => {
		loc = event.loc;
	});

	mod.hook('S_SPAWN_ME', 3, event => {
		if(enabled){
			event.loc = deadLoc;
			event.loc.z += 20;
			event.w = 3;
			mod.hookOnce('S_CREATURE_LIFE', 3, (e) => {
				if (e.gameId == myGID && e.alive){
					mod.setTimeout(() => {
						jump();
					}, 7000); // cus spawn protection
				}
			});
			return true;
		}
	});
	
	function jump() {
		let tempLoc = deadLoc;
		tempLoc.z +=20;
        mod.send('C_PLAYER_LOCATION', 5, {
            loc: deadLoc,
            w: 3,
            lookDirection: 0,
            dest: tempLoc,
            type: 2,
            jumpDistance: 0,
            inShuttle: false,
            time: location.time - locationRealTime + Date.now() - 50
        });
		mod.send('C_PLAYER_LOCATION', 5, {
            loc: deadLoc,
            w: 3,
            lookDirection: 0,
            dest: tempLoc,
            type: 7,
            jumpDistance: 0,
            inShuttle: false,
            time: location.time - locationRealTime + Date.now() + 50
        });
    }

	mod.hook('C_PLAYER_LOCATION', 5, event => {
		location = event;
		locationRealTime = Date.now();
	});

	mod.hook('S_LOGIN', 12, event => {
        myGID = event.gameId;
    });
};