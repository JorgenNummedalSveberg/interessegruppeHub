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
            this.players = [];
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
            arrow1 = questScroll(quests1)
            arrow2 = questScroll(quests2)
            arrow3 = questScroll(quests3)
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

    function validateForm() {
        const formValid = Object.values(myForm.summary()).every(item => item !== "") && $isAuthenticated;
        document.getElementById("addButton").disabled = !formValid;
        return formValid;
    }

    let quests1;
    let arrow1;
    let quests2;
    let arrow2;
    let quests3;
    let arrow3;

    function questScroll(scroll) {
        return scroll.offsetHeight + scroll.scrollTop < scroll.scrollHeight;
    }


</script>
<main>
    <div class="quest-lists">
        <div class="quest-list">
            <div class="board-sign">Upcoming campaigns</div>
            <div bind:this={quests1} on:scroll={() => arrow1 = questScroll(quests1)} class="quests">
                {#if upcoming !== undefined}
                    {#each upcoming as game}
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
                                {#if $isAuthenticated && !isOwner(game.ownerID) && !inGame(game)}
                                    <button on:click={_ => joinGame(game, 'upcoming')}>Join</button>
                                {/if}
                                {#if $isAuthenticated && inGame(game)}
                                    <button on:click={_ => leaveGame(game, 'upcoming')}>Leave</button>
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
            {#if arrow1}
                <div class="downArrow">v</div>
            {/if}
        </div>
        <div class="quest-list">
            <div class="board-sign">Ongoing campaigns</div>
            <div bind:this={quests2} on:scroll={() => arrow2 = questScroll(quests2)} class="quests">
                {#if ongoing !== undefined}
                    {#each ongoing as game}
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
                                {#if $isAuthenticated && !isOwner(game.ownerID) && !inGame(game)}
                                    <button on:click={_ => joinGame(game, 'ongoing')}>Join</button>
                                {/if}
                                {#if $isAuthenticated && inGame(game)}
                                    <button on:click={_ => leaveGame(game, 'ongoing')}>Leave</button>
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
            {#if arrow2}
                <div class="downArrow">v</div>
            {/if}
        </div>
        <div class="quest-list">
            <div class="board-sign">Completed campaigns</div>
            <div bind:this={quests3} on:scroll={() => arrow3 = questScroll(quests3)} class="quests">
                {#if completed !== undefined}
                    {#each completed as game}
                        <div class="quest">
                            <div class="title">{game.title}</div>
                            <div class="content">
                                <div>Language(s): {game.language}</div>
                                <div>Ruleset: {game.ruleset}</div>
                                <div>
                                    <div>Players{`(max ${game.maxPlayers})`}:</div>
                                    <div>{Object.values(game.players).map(player => player.user).join(', ')}</div>
                                </div><br>
                                <div class="description">Description: {game.description}</div>
                                <div class="game-master">Game master: {game.owner}</div>
                            </div>
                            <div class="quest-buttons">
<!--                                <button disabled >Join</button>-->
                                {#if $isAuthenticated && isOwner(game.ownerID)}
                                    <button on:click={_ => removeGame(game.gameID, 'completed')}>Remove</button>
                                {/if}
                            </div>
                        </div>
                    {/each}
                {/if}
            </div>
            {#if arrow3}
                <div class="downArrow">v</div>
            {/if}
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
        {#if !$isAuthenticated}
            <div class="formCover">You're not logged in</div>
        {/if}
    </section>
</main>

<style>
    .quest-lists {
        display: flex;
        flex-direction: column;
        align-items: center;
    }

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
        grid-template-columns: 1fr 1fr 1fr;
        align-items: flex-start;
        margin-bottom: 30px;
        position: relative;
    }

    .downArrow {
        position: relative;
        bottom: 100px;
        left: 100%;
        font-size: 50px;
        transform: scale(2, 1);
        font-family: cursive;
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
    main {
        display: grid;
        align-items: flex-start;
        grid-template-columns: 3fr 1fr;
    }

    .campaignForm {
        margin: 20px;
        display: flex;
        flex-direction: column;
        background-color: #E9E3C3;
        padding: 1em;
        position: relative;
        width: 400px;
    }
    .descriptionBox {
        height: 10em;
        width: 20em;
    }

    @media only screen and (max-width: 768px) {
        /* For mobile phones: */
        main {
            flex-direction: column;
        }
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

    .formCover {
        position: absolute;
        top: 0;
        left: 0;
        height: 100%;
        width: 100%;
        background-color: rgba(255, 255, 255, 0.7);
        display: flex;
        justify-content: center;
        align-items: center;
        font-size: 30px;
        font-weight: bold;
    }

</style>
