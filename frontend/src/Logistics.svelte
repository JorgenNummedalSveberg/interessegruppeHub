<script>
    import {accessToken} from "@dopry/svelte-oidc";

    let salesstatistics;

    let nextLink = "https://old.online.ntnu.no/api/v1/payment/transactions/";
    let transactions = [];
    const req = {
        method: 'GET',
        headers: {
            'Authorization': 'Bearer ' + $accessToken,
            'Accept': 'application/json'
        }
    }
    function fetchAllTransactions() {
        if (nextLink != null) {
            fetch(nextLink, req).then(result => result.json().then(json => {
                json.results.forEach(result => transactions = [...transactions, ...result.items])
                nextLink = json.next;
                fetchAllTransactions();
            })).catch(err => console.log(err))
        }
    }

    fetchAllTransactions();
</script>
<div>
    {#each transactions as transaction}
        <div>{JSON.stringify(transaction)}</div>
    {/each}
</div>
