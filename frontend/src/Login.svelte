<script>
    import {
        LoginButton,
        LogoutButton,
        RefreshTokenButton,
        authError,
        accessToken,
        idToken,
        isAuthenticated,
        isLoading,
        userInfo,
    } from '@dopry/svelte-oidc';
</script>
<main>
    <LoginButton>Login</LoginButton>
    <LogoutButton>Logout</LogoutButton>
    <RefreshTokenButton>RefreshToken</RefreshTokenButton><br />
    <pre>isLoading: {$isLoading}</pre>
    <pre>isAuthenticated: {$isAuthenticated}</pre>
    <pre>authToken: {$accessToken}</pre>
    <pre>idToken: {$idToken}</pre>
    <pre>authError: {$authError}</pre>
</main>
