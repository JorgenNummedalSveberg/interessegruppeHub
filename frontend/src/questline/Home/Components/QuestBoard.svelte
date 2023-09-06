<script context="module">
    export class Game {
        constructor(game) {
            this.gameID = game[0];
            this.players = [];
            Object.keys(game[1]).forEach(x => {
                this[x] = game[1][x];
            })
        }

    }
</script>
<script>
    import {get, onValue, push, ref, remove, set} from "firebase/database";
    import {isAuthenticated, userInfo} from '@dopry/svelte-oidc';

    export let app;
    export let analytics;
    export let database;
    export let path;

    let quests;
    let arrow;

    let gameList = [];
    const upcomingRef = ref(database, `games/${path}/`);

    onValue(upcomingRef, (snapshot) => {
        if (snapshot.exists()) {
            let games = snapshot.val();
            gameList = games ? Object.entries(games).map((key, object) => new Game(key, object))
                .sort((a, b) => Date.parse(b.created) - Date.parse(a.created)) : [];
            setTimeout(() => arrow = questScroll(quests), 100)
        } else {
            gameList = [];
            console.log(`No ${path} games`);
        }
    });

    function questScroll(scroll) {
        return scroll.offsetHeight + scroll.scrollTop < scroll.scrollHeight;
    }

    function removeGame(gameID, path) {
        remove(ref(database, `games/${path}/${gameID}`))
    }

    function startGame(gameID) {
        get(ref(database, `games/${path}/${gameID}`)).then(result => {
            let game = result.val();
            game.started = new Date().toUTCString()
            set(ref(database, `games/ongoing/${gameID}`), game).then(() => {
                removeGame(gameID, path)
            }).catch(() => {
                console.log('Game could not be started')
            })
        })
    }

    function endGame(gameID) {
        get(ref(database, `games/ongoing/${gameID}`)).then(result => {
            let game = result.val();
            game.ended = new Date().toUTCString()
            set(ref(database, `games/completed/${gameID}`), game).then(() => {
                removeGame(gameID, 'ongoing')
            }).catch(() => {
                console.log('Game could not be started')
            })
        })
    }

    function joinGame(game, list) {
        if (inGame(game)) return;
        push(ref(database, `games/${list}/${game.gameID}/players/`), {user: $userInfo.name, userID: $userInfo.sub})
    }

    function leaveGame(game, list) {
        if (!inGame(game)) return;
        Object.entries(game.players).forEach(entry => {
            if (entry[1].userID === $userInfo.sub) {
                remove(ref(database, `games/${list}/${game.gameID}/players/${entry[0]}`))
            }
        })
    }

    function isOwner(ownerID) {
        return ownerID === $userInfo.sub;
    }
    function inGame(game) {
        let playerFound = false;
        Object.values(game.players).forEach(player => {
            if (player.userID === $userInfo.sub) {
                playerFound = true;
            }
        })
        return playerFound;
    }

    function capitalize(capString) {
        return capString.charAt(0).toUpperCase() + capString.slice(1);
    }
</script>
<div class="quest-list">
    <div class="board-sign">{capitalize(path)} campaigns</div>
    <div bind:this={quests} on:scroll={() => arrow = questScroll(quests)} class="quests">
        {#if gameList !== undefined}
            {#each gameList as game}
                <div class="quest">
                    <div class="title">{game.title}</div>
                    <div class="content">
                        <div>Ruleset: {game.ruleset}</div>
                        <div>Language(s): {game.language}</div>
                        <div>
                            <div>Players{`(max ${game.maxPlayers})`}:</div>
                            <div>{Object.values(game.players).map(player => player.user).join(', ')}</div>
                        </div><br>
                        <div class="description">Description: {game.description}</div>
                        <div class="game-master">Game master: {game.owner}</div>
                    </div>
                    <div class="quest-buttons">
                    {#if path === 'completed'}
                        {#if $isAuthenticated && isOwner(game.ownerID)}
                            <button on:click={_ => removeGame(game.gameID, 'completed')}>Remove</button>
                        {/if}
                    {/if}
                    {#if path !== 'completed'}

                            {#if $isAuthenticated && !isOwner(game.ownerID) && !inGame(game)}
                                <button on:click={_ => joinGame(game, path)}>Join</button>
                            {/if}
                            {#if $isAuthenticated && inGame(game)}
                                <button on:click={_ => leaveGame(game, path)}>Leave</button>
                            {/if}
                            {#if $isAuthenticated && isOwner(game.ownerID)}
                                <button on:click={_ => removeGame(game.gameID, path)}>Remove</button>
                                {#if path === 'upcoming'}
                                    <button on:click={_ => startGame(game.gameID)}>Start</button>
                                {/if}
                                {#if path === 'ongoing'}
                                    <button on:click={_ => endGame(game.gameID)}>End</button>
                                {/if}
                            {/if}
                    {/if}
                    </div>
                </div>
            {/each}
        {/if}
    </div>
    {#if arrow}
        <div class="downArrow">v</div>
    {/if}
</div>
<style>

    .quest-list {
        margin: 20px;
        padding: 20px;
        background-image: repeating-linear-gradient(90deg, transparent, transparent 10%, #bbb 10%, #bbb 12%, transparent 12%, transparent 88%, #bbb 88%, #bbb 90%),
        repeating-linear-gradient(#A5805B, #A5805B 100px, #9D744E 100px, #9D744E 110px);
        background-attachment: local;
        border: 1px #533 solid;
        display: grid;
        grid-template-rows: 120px 500px;
        max-height: 620px;
        justify-content: center;
        width: 80%;
    }

    .quests {
        overflow-y: auto;
        overflow-x: hidden;
        display: grid;
        grid-template-columns: 1fr 1fr;
        align-items: flex-start;
        margin-bottom: 30px;
        position: relative;
    }
    /* Media query for screens smaller than 600px, for example */
    @media (max-width: 600px) {
        .quests {
            grid-template-columns: 1fr;
        }
        .quest {
            max-width: 70%;
        }
        .board-sign {
            font-size: 2.5em !important;
        }
        .quest-list {
            max-width: 80vw;
            background-image: repeating-linear-gradient(90deg, transparent, transparent 40%, #bbb 40%, #bbb 48%, transparent 48%, transparent 352%, #bbb 352%, #bbb 360%),
        repeating-linear-gradient(#A5805B, #A5805B 33%, #9D744E 66%, #9D744E 100%);
        }
    }

    .downArrow {
        position: relative;
        bottom: 100px;
        left: 100%;
        font-size: 50px;
        transform: scale(2, 1);
        font-family:Arial, Helvetica, sans-serif;
        color: #F9B759;
    }

    .board-sign {
        font-size: 3em;
        font-weight: bold;
        display: flex;
        justify-content: center;
        justify-self: center;
        align-self: center;
        align-items: center;
        width: 600px;
        border: 1px #533 solid;
        border-radius: 5px;
        height: 100px;
        background-image: repeating-linear-gradient(#A5805B, #A5805B 45%, #9D744E 45%, #9D744E 50%);
        background-attachment: local;
    }
    .quest {
        text-align: center;
        padding: 10px;
        background-color: #E9E3C3;
        width: 275px;
        margin: 20px;
        display: grid;
        grid-template-rows: 50px 275px 50px;
    }

    .content {
        font-size: 1em;
        display: flex;
        flex-direction: column;
        overflow-y: auto;
        overflow-x: hidden;
        padding: 5px;
    }

    .game-master {
        padding-top: 10px;
        margin-top: auto;
    }

    .title {
        font-weight: bold;
        font-size: 2em;
        overflow: hidden;
        text-overflow: ellipsis;
        border-bottom: 1px #555 solid;
    }
    .quest-buttons {
        display: flex;
        justify-content: center;
        align-items: center;
        width: 100%;
        border-top: 1px #555 solid;
    }

    .quest-buttons > button {
        margin-left: 5px;
        margin-right: 5px;
    }

    @media only screen and (max-width: 768px) {
        .quest-list {
            width: 80vw;
            font-size: 10px;
            background-size: 34vw;
        }

        .board-sign {
            width: 80vw;
        }

        .quests {
            width: 100%;
            max-height: 500px;
        }
    }
</style>
