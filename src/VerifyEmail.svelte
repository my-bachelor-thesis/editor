<script>
    import * as helpers from "./helpers";
    import {get} from "svelte/store";
    import * as store from "./store";
    import ErrorMessage from "./partial_components/messages/ErrorMessage.svelte";

    let postError

    const token = new URLSearchParams(window.location.search).get("token")

    helpers.postJson(`${get(store.url)}/email-verification`, JSON.stringify({
        token: token
    })).then(
        () => helpers.redirectToHomeWithMessage("account verified successfully"))
        .catch(
            err => postError = err
        )
</script>

<br>

<ErrorMessage msg={postError}/>
