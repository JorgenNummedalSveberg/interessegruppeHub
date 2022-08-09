<script>
    import {userInfo} from '@dopry/svelte-oidc';
    import {isAuthenticated} from "@dopry/svelte-oidc";

</script>
{#if $isAuthenticated}
    <h1>Profile:</h1>
    <h2>{$userInfo.name}</h2>
{/if}
{#if !$isAuthenticated}
    <h1s>Not logged in</h1s>
{/if}
