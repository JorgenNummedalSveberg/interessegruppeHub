<script>
    import {isAuthenticated, userInfo} from "@dopry/svelte-oidc";
    import {push, ref} from "firebase/database";
    import { form, field } from 'svelte-forms';
    import { required } from 'svelte-forms/validators';

    const title = field('title', '', [required()]);
    const language = field('language', '', [required()]);
    const ruleset = field('ruleset', '', [required()]);
    const maxPlayers = field('maxPlayers', '', [required()]);
    const description = field('description', '', [required()]);
    const myForm = form(title, language, ruleset, maxPlayers, description);

    export let database;

    function addGame() {

        if (!validateForm()) return;

        let game = {
            ...myForm.summary(), ...{
                'owner': $userInfo.name,
                'ownerID': $userInfo.sub,
                'created': new Date().toUTCString(),
            }
        }
        push(ref(database, 'games/upcoming'), game)
    }


    function validateForm() {
        const formValid = Object.values(myForm.summary()).every(item => item !== "") && $isAuthenticated;
        document.getElementById("addButton").disabled = !formValid;
        return formValid;
    }
</script>
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
<style>
    .campaignForm {
        margin: 20px;
        display: flex;
        flex-direction: column;
        background-color: #E9E3C3;
        padding: 1em;
        position: relative;
        width: 90vw; /* Full width for smaller screens */
        max-width: 400px; /* Will be 400px on larger screens, but adjust for smaller */
    }
    
    /* Media query for screens smaller than 600px, for example */
    @media (max-width: 600px) {
        .campaignForm {
            margin: 10px; /* Less margin for smaller screens */
            padding: 0.5em; /* Less padding as well */
        }
    }
    .descriptionBox {
        height: 10em;
        width: 20em;
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
