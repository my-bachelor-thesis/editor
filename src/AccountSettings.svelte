<script>
    import * as helpers from "./helpers"
    import * as store from "./store"
    import {get} from "svelte/store"
    import ErrorMessage from "./partial_components/messages/ErrorMessage.svelte";
    import SuccessMessage from "./partial_components/messages/SuccessMessage.svelte";
    import UpdateBasicInfo from "./partial_components/account_settings/UpdateBasicInfo.svelte";
    import UpdatePassword from "./partial_components/account_settings/UpdatePassword.svelte";
    import UpdateEmail from "./partial_components/account_settings/UpdateEmail.svelte";

    helpers.redirectIfNotLoggedIn()

    let postError, message
</script>

<h1 class="small-margin">Account Settings <span style="font-size: smaller">- Logged in as {get(store.username)}
    ({(get(store.isAdmin)) ? "with admin privileges" : "regular user"})</span></h1>

<br>

<SuccessMessage msg={message}/>
<ErrorMessage msg={postError}/>

<h4 class="small-margin">Update basic info</h4>
<UpdateBasicInfo bind:postError={postError} bind:message={message}/>

<h4 class="small-margin">Update password</h4>
<UpdatePassword bind:postError={postError} bind:message={message}/>

<h4 class="small-margin">Update email</h4>
<UpdateEmail bind:postError={postError} bind:message={message}/>




