<script>
	import {Router, Route, Link} from "svelte-navigator";
	import Home from './Home.svelte';
	import {OidcContext, LoginButton, LogoutButton, userInfo} from '@dopry/svelte-oidc';
	import {getContext} from "svelte";
	import Profile from "./Profile.svelte";
	import BorrowEquipment from "./BorrowEquipment.svelte";
	import AboutUs from "./AboutUs.svelte";
	import {isAuthenticated} from "@dopry/svelte-oidc";
	import ClickableMenu from "./ClickableMenu.svelte";


</script>

<OidcContext
		issuer="https://old.online.ntnu.no/openid/.well-known/openid-configuration"
		client_id="421888"
		redirect_uri="http://localhost:3000/login"
		post_logout_redirect_uri="http://localhost:3000/login"
>
	<main>
	<Router>
		<nav class="navbar">
			<div class="navItem">
				<Link to="/"><img class="logo" src="questline-logo.webp" alt="img not found"/></Link>
			</div>
			<div class="navItem rightDivider">
				<Link to="/">Home</Link>
			</div>
			<div class="navItem rightDivider">
				<Link to="/borrowEquipment">Borrow equipment</Link>
			</div>
			<div class="navItem">
				<Link to="/aboutUs">About us</Link>
			</div>
			<div class="navItem">
				<ClickableMenu height="150px" width="250px">
					{#if $isAuthenticated}
						<b>{$userInfo.name}</b>
						<LogoutButton>Logout</LogoutButton>
					{/if}
					{#if !$isAuthenticated}
						<b>You're not logged in</b>
						<LoginButton>Login</LoginButton>
					{/if}
				</ClickableMenu>
			</div>
		</nav>
		<Route path="/">
			<Home/>
		</Route>
		<Route path="/login">
			<Home/>
		</Route>
		<Route path="/profile">
			<Profile/>
		</Route>
		<Route path="/borrowEquipment">
			<BorrowEquipment/>
		</Route>
		<Route path="/aboutUs">
			<AboutUs/>
		</Route>
	</Router>
	</main>
</OidcContext>

<style>
	.navbar {
		display: flex;
		flex-direction: row;
		align-items: center;
		height: 3.5em;
		/*background-color: #d9d9d9;*/
		background-image: radial-gradient(#ccc 2%, transparent 0px),
		radial-gradient(#ccc 2%, transparent 0px),
		repeating-linear-gradient(90deg, transparent, transparent 10px,  #0d3454 10px, #0d3454 15px, transparent 15px, transparent 400px)
		,repeating-linear-gradient(#0d5474, #0d5474 28px, #0d3454 28px, #0d3454 30px);
		background-size: 400px 31px, 400px 31px, cover, cover;
		background-position: -45px 0px, 319px 0px, 125px 0, 0 0;
	}
	:global(a) {
		color: #000;
		text-decoration: none;
	}
	.navbar > :global(:nth-last-child(1)) {
		margin-left: auto;
	}
	.rightDivider {
		border-right: solid grey 0.01em;
	}
	.navItem {
		padding-left: 15px;
		padding-right: 15px;
		max-height: 100%;
		text-align: center;
		display: flex;
		align-items: center;
		font-size: 2em;
	}
	.navItem > :global(button) {
		height: 1px;
	}
	.logo {
		vertical-align: middle;
		max-height: 2em;
		display:block;
		margin:auto;
	}
	main {
		display: flex;
		flex-direction: column;
		text-decoration: none;
	}
</style>
