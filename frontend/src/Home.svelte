<script>
import {isAuthenticated, userInfo} from '@dopry/svelte-oidc';
    import { form, field } from 'svelte-forms';
    import { required } from 'svelte-forms/validators';
    import { initializeApp } from "firebase/app";
    import { getAnalytics } from "firebase/analytics";
    import { getDatabase, ref, onValue, push, set, get, remove } from "firebase/database";
    const firebaseConfig = {
        apiKey: "AIzaSyAibYt3NYopvfkhgHoJnYqGwLW-WaUjkoo",
        authDomain: "questmatch-86f27.firebaseapp.com",
        databaseURL: "https://questmatch-86f27-default-rtdb.europe-west1.firebasedatabase.app",
        projectId: "questmatch-86f27",
        storageBucket: "questmatch-86f27.appspot.com",
        messagingSenderId: "200833047382",
        appId: "1:200833047382:web:6ccc671ed10031b79a54f7",
        measurementId: "G-WF1BDT5448"
    };

    class Game {

        constructor(game) {
            this.gameID = game[0];
            Object.keys(game[1]).forEach(x => {
                this[x] = game[1][x];
            })
        }

    }

    // Initialize Firebase
    const app = initializeApp(firebaseConfig);
    const analytics = getAnalytics(app);
    const database = getDatabase();

    let upcoming = [];
    const upcomingRef = ref(database, 'games/upcoming/');
    onValue(upcomingRef, (snapshot) => {
        if (snapshot.exists()) {
            let games = snapshot.val();
            upcoming = games ? Object.entries(games).map((key, object) => new Game(key, object))
                .sort((a, b) => Date.parse(b.created) - Date.parse(a.created)) : [];
            console.dir(games)
            console.dir(upcoming)
        } else {
            upcoming = [];
            console.log("No upcoming games");
        }
    });

    let ongoing = [];
    const ongoingRef = ref(database, 'games/ongoing/');
    onValue(ongoingRef, (snapshot) => {
        if (snapshot.exists()) {
            let games = snapshot.val();
            ongoing = games ? Object.entries(games).map((key, object) => new Game(key, object))
                .sort((a, b) => Date.parse(b.started) - Date.parse(a.started)) : [];
        } else {
            ongoing = [];
            console.log("No ongoing games");
        }
    });

    let completed = [];
    const completedRef = ref(database, 'games/completed/');
    onValue(completedRef, (snapshot) => {
        if (snapshot.exists()) {
            let games = snapshot.val();
            completed = games ? Object.entries(games).map((key, object) => new Game(key, object))
                .sort((a, b) => Date.parse(b.ended) - Date.parse(a.ended)) : [];
        } else {
            completed = [];
            console.log("No completed games");
        }
    });

    const title = field('title', '', [required()]);
    const language = field('language', '', [required()]);
    const ruleset = field('ruleset', '', [required()]);
    const maxPlayers = field('maxPlayers', '', [required()]);
    const description = field('description', '', [required()]);
    const myForm = form(title, language, ruleset, maxPlayers, description);

    function waitForAuthority() {
        if ($isAuthenticated) {
            return true;
        } else {

        }
    }

    function removeGame(gameID, path) {
        remove(ref(database, `games/${path}/${gameID}`))
    }

    function addGame() {

        if (!validateForm()) return;

        let game = {...myForm.summary(), ...{
            'owner': $userInfo.name,
            'ownerID': $userInfo.sub,
            'created': new Date().toUTCString(),
        }}
        push(ref(database, 'games/upcoming'), game)
    }

    function startGame(gameID) {
        get(ref(database, `games/upcoming/${gameID}`)).then(result => {
            let game = result.val();
            game.started = new Date().toUTCString()
            set(ref(database, `games/ongoing/${gameID}`), game).then(() => {
                removeGame(gameID, 'upcoming')
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

    function joinGame(gameID) {
        push(ref(database, `games/database/${gameID}/players/`), {user: $userInfo.name, userID: $userInfo.sub})
    }

    function leaveGame(gameID) {
        get(ref(database, `games/database/${gameID}/players/`)).then(res => {
            let players = res.val();
            Object.entries(players).forEach((key, object) => {
                if (object.userID === $userInfo.sub) {
                    remove(ref(database, `games/database/${gameID}/players/${key}`))
                }
            })
        })
    }

    function isOwner(ownerID) {
        return ownerID === $userInfo.sub;
    }

    function validateForm() {
        const formValid = Object.values(myForm.summary()).every(item => item !== "") && $isAuthenticated;
        document.getElementById("addButton").disabled = !formValid;
        return formValid;
    }


</script>
<main>
    <div class="quest-lists">
        <div class="quest-list">
            <div class="board-sign">Upcoming campaigns</div>
            <div class="quests">
                {#if upcoming !== undefined}
                    {#each upcoming as game}
                        <div class="quest">
                            <div class="title">{game.title}</div>
                            <div class="content">
                                <div>Ruleset: {game.ruleset}</div>
                                <div>Language(s): {game.language}</div>
                                <div>
                                    <div>Players{`(max ${game.maxPlayers})`}:</div>
                                    <div>{game.players ? game.players.join(', ') : ''}</div>
                                </div>
                                <div class="description">Description: {game.description}</div>
                                <div class="game-master">Game master: {game.owner}</div>
                            </div>
                            <div class="quest-buttons">
                                {#if $isAuthenticated && !isOwner(game.ownerID) && (!game.players ||  (game.players && !game.players.includes({user: $userInfo.name, userID: $userInfo.sub})))}
                                    <button on:click={_ => joinGame(game.gameID)}>Join</button>
                                {/if}
                                {#if $isAuthenticated && game.players && game.players.includes({user: $userInfo.name, userID: $userInfo.sub})}
                                    <button on:click={_ => leaveGame(game.gameID)}>Leave</button>
                                {/if}
                                {#if $isAuthenticated && isOwner(game.ownerID)}
                                    <button on:click={_ => removeGame(game.gameID, 'upcoming')}>Remove</button>
                                    <button on:click={_ => startGame(game.gameID)}>Start</button>
                                {/if}
                            </div>
                        </div>
                    {/each}
                {/if}
            </div>
        </div>
        <div class="quest-list">
            <div class="board-sign">Ongoing campaigns</div>
            <div class="quests">
                {#if ongoing !== undefined}
                    {#each ongoing as game}
                        <div class="quest">
                            <div class="title">{game.title}</div>
                            <div class="content">
                                <div>Ruleset: {game.ruleset}</div>
                                <div>Language(s): {game.language}</div>
                                <div>
                                    <div>Players{`(max ${game.maxPlayers})`}:</div>
                                    <div>{game.players ? game.players.join(', ') : ''}</div>
                                </div>
                                <div class="description">Description: {game.description}</div>
                                <div class="game-master">Game master: {game.owner}</div>
                            </div>
                            <div class="quest-buttons">
                                {#if $isAuthenticated && !isOwner(game.ownerID) && (!game.players ||  (game.players && !game.players.includes({user: $userInfo.name, userID: $userInfo.sub})))}
                                    <button on:click={_ => joinGame(game.gameID)}>Join</button>
                                {/if}
                                {#if $isAuthenticated && game.players && game.players.includes({user: $userInfo.name, userID: $userInfo.sub})}
                                    <button on:click={_ => leaveGame(game.gameID)}>Leave</button>
                                {/if}
                                {#if $isAuthenticated && isOwner(game.ownerID)}
                                    <button on:click={_ => removeGame(game.gameID, 'ongoing')}>Remove</button>
                                    <button on:click={_ => endGame(game.gameID)}>End</button>
                                {/if}
                            </div>
                        </div>
                    {/each}
                {/if}
            </div>
        </div>
        <div class="quest-list">
            <div class="board-sign">Completed campaigns</div>
            <div class="quests">
                {#if completed !== undefined}
                    {#each completed as game}
                        <div class="quest">
                            <div class="title">{game.title}</div>
                            <div class="content">
                                <div>Language(s): {game.language}</div>
                                <div>Ruleset: {game.ruleset}</div>
                                <div>
                                    <div>Players{`(max ${game.maxPlayers})`}:</div>
                                    <div>{game.players ? game.players.join(', ') : ''}</div>
                                </div>
                                <div class="description">Description: {game.description}</div>
                                <div class="game-master">Game master: {game.owner}</div>
                            </div>
                            <div class="quest-buttons">
                                {#if $isAuthenticated && isOwner(game.ownerID)}
                                    <button on:click={_ => removeGame(game.gameID, 'completed')}>Remove</button>
                                {/if}
                            </div>
                        </div>
                    {/each}
                {/if}
            </div>
        </div>
        <div class="ongoing-quests"></div>
        <div class="completed-quests"></div>
    </div>
    <section class="campaignForm"  on:input={validateForm}>
        <h1>Start a campain</h1>

        <label>
            Campaign title:
            <input type="text" bind:value={$title.value} placeholder="Best game ever" />
        </label>
        <label>
            Preferred spoken language:
            <input type="text" bind:value={$language.value} placeholder="English"/>
        </label>
        <label>
            Tabletop ruleset:
            <input type="text" bind:value={$ruleset.value} placeholder="Dungeons and Dragons" />
        </label>
        <label>
            Max amount of players:
            <input type="number" bind:value={$maxPlayers.value} />
        </label>
        <label>
            Game description:
            <textarea class="descriptionBox" bind:value={$description.value} placeholder="This is meant to be a beginner-friendly campaign using the standard DnD rules, expansion books are ok"></textarea>
        </label>
        <div>
            <button disabled id="addButton" on:click={addGame}>Add game</button>
            <button on:click={() => myForm.reset()}>Clear form</button>
        </div>
    </section>
</main>

<style>
    .quest-lists {
        display: flex;
        flex-direction: column;
        width: 100%;
        align-items: center;
    }

    .quest-list {
        margin: 20px;
        padding: 20px;
        width: 1300px;
        background-image: repeating-linear-gradient(90deg, transparent, transparent 100px, #bbb 100px, #bbb 125px, transparent 125px, transparent 1215px, #bbb 1215px, #bbb 1240px),
        repeating-linear-gradient(#A5805B, #A5805B 100px, #9D744E 100px, #9D744E 110px);
        background-attachment: local;
        background-size: 1300px;
        display: grid;
        grid-template-rows: 120px minmax(500px, max-content);
        max-height: 620px;
        overflow-x: auto;
        justify-content: center;
    }

    .quests {
        display: flex;
        flex-direction: row;
        flex-wrap: wrap;
        width: 1080px;
    }

    .board-sign {
        font-size: 3em;
        font-weight: bold;
        display: flex;
        justify-content: center;
        justify-self: center;
        align-self: center;
        align-items: center;
        width: 500px;
        height: 100px;
        background-image: repeating-linear-gradient(#A5805B, #A5805B 40px, #9D744E 40px, #9D744E 45px);
        box-shadow: 1px 2px 2px 1px;
        background-attachment: local;
        background-size: 500px;
    }
    .quest {
        text-align: center;
        padding: 10px;
        background-color: #E9E3C3;
        width: 300px;
        height: 400px;
        margin: 20px;
        display: grid;
        grid-template-rows: 50px 300px 50px;
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
    main {
        display: flex;
        flex-direction: row;
        align-items: flex-start;
        font-family: Garamond, Arial,serif;
    }

    .campaignForm {
        display: flex;
        flex-direction: column;
        background-color: #E9E3C3;
        padding: 1em;
        margin: 20px;
    }
    .descriptionBox {
        height: 10em;
        width: 20em;
    }
</style>
