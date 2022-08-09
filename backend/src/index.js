const express = require('express');
const fs = require('fs');
const cors = require('cors');
const uuid = require('uuid');

const app = express();
app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.send("hello world");
})
app.get('/about', (req, res) => {
    res.send("About route");
})
app.get('/games', (req, res) => {
    let rawdata = fs.readFileSync('./database/games.json');
    let games = JSON.parse(rawdata);
    res.send(games);
})
app.post('/games', (req, res) => {
    let rawdata = fs.readFileSync('./database/games.json');
    let games = JSON.parse(rawdata);
    let game = req.body;
    if (req.body.ownerID) {
        game.gameID = uuid.v4();
        game.players = [];
        games.upcoming = [...games.upcoming, req.body];
        fs.writeFileSync('./database/games.json', JSON.stringify(games));
    }
    res.send(req.body);
})

function playerJoin(list, query) {
    list.forEach(game => {
        if (game.players.length < game.maxPlayers && game["gameID"] === query.gameID && game["ownerID"] !== query.userID && game["players"].every(user => user.userID !== query.userID)) {
            game["players"] = [...game["players"], {user: query.user, userID: query.userID}]
        }
    })
    return list;
}
app.put('/games', (req, res) => {
    let rawdata = fs.readFileSync('./database/games.json');
    let games = JSON.parse(rawdata);
    let query = req.body;
    if (query.userID) {
        games.upcoming = playerJoin(games.upcoming, query)
        games.ongoing = playerJoin(games.ongoing, query)
        fs.writeFileSync('./database/games.json', JSON.stringify(games));
    }
    res.send(req.body);
})
app.delete('/games', (req, res) => {
    let rawdata = fs.readFileSync('./database/games.json');
    let games = JSON.parse(rawdata);
    let query = req.body;
    games.completed = games.completed.filter(game => game.gameID !== query.gameID || game.ownerID !== query.userID);
    games.upcoming = games.upcoming.filter(game => game.gameID !== query.gameID || game.ownerID !== query.userID);
    games.ongoing = games.ongoing.filter(game => game.gameID !== query.gameID || game.ownerID !== query.userID);
    fs.writeFileSync('./database/games.json', JSON.stringify(games));
    res.send(req.body);
})
app.patch('/games/start', (req, res) => {
    let rawdata = fs.readFileSync('./database/games.json');
    let games = JSON.parse(rawdata);
    let query = req.body;
    let game = games.upcoming.find(item => item.gameID === query.gameID);
    if (query.userID === game.ownerID) {
        games.ongoing = [...games.ongoing, game]
        games.upcoming = games.upcoming.filter(game => game.gameID !== query.gameID);
    }
    fs.writeFileSync('./database/games.json', JSON.stringify(games));
    res.send(req.body);
})
app.patch('/games/end', (req, res) => {
    let rawdata = fs.readFileSync('./database/games.json');
    let games = JSON.parse(rawdata);
    let query = req.body;
    let game = games.ongoing.find(item => item.gameID === query.gameID);
    console.log("ending game")
    if (query.userID === game.ownerID) {
        games.completed = [...games.completed, game]
        games.ongoing = games.ongoing.filter(game => game.gameID !== query.gameID);
    }
    fs.writeFileSync('./database/games.json', JSON.stringify(games));
    res.send(games);
})

app.listen(3300, () => console.log("Server is listening to port on 3300"));
