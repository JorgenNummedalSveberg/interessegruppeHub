<script>
import {isAuthenticated, userInfo} from '@dopry/svelte-oidc';
    import { form, field } from 'svelte-forms';
    import { required } from 'svelte-forms/validators';

    // Import the functions you need from the SDKs you need
    import { initializeApp } from "firebase/app";
    import { getAnalytics } from "firebase/analytics";
    import { getDatabase, ref, onValue, child, get, push } from "firebase/database";
    // TODO: Add SDKs for Firebase products that you want to use
    // https://firebase.google.com/docs/web/setup#available-libraries

    // Your web app's Firebase configuration
    // For Firebase JS SDK v7.20.0 and later, measurementId is optional
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

    // Initialize Firebase
    const app = initializeApp(firebaseConfig);
    const analytics = getAnalytics(app);
    const database = getDatabase();

    // function postGame() {
    //     set(dbRef, {
    //         username: name,
    //         email: email,
    //         profile_picture: imageUrl
    //     });
    // }

    let upcoming = undefined;
    let ongoing = undefined;
    let completed = undefined;


    const dbRef = ref(database);
    onValue(dbRef, (snapshot) => {
        if (snapshot.exists()) {
            let games = snapshot.val().games;
            upcoming = Object.values(games.upcoming).reverse();
            ongoing = Object.values(games.ongoing).reverse();
            completed = Object.values(games.completed).reverse();
            console.log(upcoming);
        } else {
            console.log("No data available");
        }
    });

    function getGames() {
        get(child(dbRef, `games/`)).then((snapshot) => {
            if (snapshot.exists()) {
                let games = snapshot.val().games;
                upcoming = Object.values(games.upcoming);
                ongoing = Object.values(games.ongoing);
                completed = Object.values(games.completed);
                console.log(upcoming);
            } else {
                console.log("No data available");
            }
        }).catch((error) => {
            console.error(error);
        });
    }

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

    function removeGame(gameID) {
        let body = {
            'userID': $userInfo.sub,
            'gameID': gameID
        }
        const req = {
            method: 'DELETE',
            credentials: 'same-origin',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body)
        }
        fetch("http://localhost:3300/games", req).then(_ => getGames());
    }

    function addGame() {

        if (!validateForm()) return;

        let game = {...myForm.summary(), ...{
            'owner': $userInfo.name,
            'ownerID': $userInfo.sub
        }}
        console.log(game);
        push(ref(database, 'games/upcoming'), game)
    }

    function startGame(gameID) {
        let game = {
            'userID': $userInfo.sub,
            'gameID': gameID
        }

        const req = {
            method: 'PATCH',
            credentials: 'same-origin',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(game)
        }
        fetch("http://localhost:3300/games/start", req).then(_ => getGames());
    }

    function endGame(gameID) {
        let game = {
            'userID': $userInfo.sub,
            'gameID': gameID
        }

        const req = {
            method: 'PATCH',
            credentials: 'same-origin',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(game)
        }
        fetch("http://localhost:3300/games/end", req).then(res => {
            getGames()
            res.json().then(json => console.log(json))
        });
    }

    function joinGame(gameID) {
        let body = {
            'user': $userInfo.name,
            'userID': $userInfo.sub,
            'gameID': gameID
        }
        const req = {
            method: 'PUT',
            credentials: 'same-origin',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body)
        }
        fetch("http://localhost:3300/games", req).then(_ => getGames());
    }

    function isOwner(ownerID) {
        return ownerID === $userInfo.sub;
    }

    function validateForm() {
        const formValid = Object.values(myForm.summary()).every(item => item !== "");
        document.getElementById("addButton").disabled = !formValid;
        return formValid;
    }


</script>
<main style="background-image: url('dnd background.jpg')">
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
                                </div> : ''
                                <div class="description">Description: {game.description}</div>
                                <div class="game-master">Game master: {game.owner}</div>
                            </div>
                            <div class="quest-buttons">
                                {#if $isAuthenticated && !isOwner(game.ownerID)}
                                    <button on:click={_ => joinGame(game.gameID)}>Join</button>
                                {/if}
                                {#if $isAuthenticated && isOwner(game.ownerID)}
                                    <button on:click={_ => removeGame(game.gameID)}>Remove</button>
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
                                {#if $isAuthenticated && !isOwner(game.ownerID)}
                                    <button on:click={_ => joinGame(game.gameID)}>Join</button>
                                {/if}
                                {#if $isAuthenticated && isOwner(game.ownerID)}
                                    <button on:click={_ => removeGame(game.gameID)}>Remove</button>
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
                                <button disabled >Join</button>
                                {#if $isAuthenticated && isOwner(game.ownerID)}
                                    <button on:click={_ => removeGame(game.gameID)}>Remove</button>
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
        background-size: cover;

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
