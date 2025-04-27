# LeaguePacketInspector
Packet Inspector (packet editor) is a tool designed for analyzing, editing, and replaying network packets. This tool is particularly useful for debugging. Built specifically for LoL but may be implemented to be used with other games.

## Features

- **Packet Analysis**: View detailed information about network packets, including their direction, size, and content.
- **Packet Editing**: Modify packet data (hex or parsed JSON) and resend it.
- **Replay Support**: Load packet data from saved files.

## Installation
Before installing it, you need [LeagueEmulatorJS](https://github.com/Karmel0x/LeagueEmulatorJS), follow `Installation` instructions there.  
Then use this commands to install the packet inspector:
```
npm install -g ts-node
cd LeagueEmulatorJS

cd apps
cd tools
git clone https://github.com/Karmel0x/LeaguePacketInspector

cd LeaguePacketInspector
npm install
```

## Usage
Launch the front-end interface server.
```
cd front
npm run dev
```

Launch the packet parsing server, listens for WebSocket connections.
```
cd server
npm run dev
```

Open your browser at [http://localhost:5173](http://localhost:5173) to access application.

## enet-proxy
Intercept and log packets between the client and server.  
- run game server on port 5119
- run it with: `ts-node -T enet-proxy/index.ts`  
- run game using port 5118

## spectator-emulator
Load and replay packet data from saved files. You can find replays [here](https://github.com/Karmel0x/LeaguePacketInspector/issues/1).  
- run it with: `ts-node -T spectator-emulator/index.ts <replay_file_path>`  
- run game using port 5119 or use together with enet-proxy

## TODO

- Add support for `.lrf` replay files (currently it has to be unpacked with [LoLReplayUnpacker](https://github.com/moonshadow565/LoLReplayUnpacker)).
- Improve spectator emulator - fix in-game lags.
- Enhance packet search and filtering capabilities.
- Few more not finished things here.
