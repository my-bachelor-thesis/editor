<script>
    import {createForm} from "svelte-forms-lib"
    import * as helpers from "./helpers"
    import * as store from "./store"

    let url = ""
    store.url.subscribe(val => {
        url = val
    })

    let postError = ""

    const {form, errors, state, handleChange, handleSubmit} = createForm({
        initialValues: {
            username: "",
            password: "",
        },
        validate: values => {
            let errs = {}
            if (values.username === "") {
                errs["username"] = "username can't be empty"
            } else if (values.username !== undefined) {
                helpers.isValidUsername(values.username).then(res => {
                    if (!res) {
                        $errors.username = "incorrect username"
                    }
                })
            }
            if (values.password === "") {
                errs["password"] = "password can't be empty"
            }
            return errs
        },
        onSubmit: values => {
            postError = ""
            helpers.postJson(`${url}/login/form`, JSON.stringify(values)).then(
                () => {
                    helpers.setStorage()
                    helpers.redirectToHomeWithMessage()
                }).catch(err => postError = err)
        }
    })

</script>

<h1>Login</h1>

{#if postError}
    <div class="error">{postError}</div>
{/if}

<div id="login-form">
    <form on:submit={handleSubmit}>
        <label for="username">username</label><br>
        <input bind:value={$form.username} on:change={handleChange} id="username" name="username" type="text"
               placeholder="username">
        {#if $errors.username}
            <div class="error">{$errors.username}</div>
        {/if}<br>

        <label for="password">password</label><br>
        <input bind:value={$form.password} on:change={handleChange} id="password" name="password" type="password"
               placeholder="password">
        {#if $errors.password}
            <div class="error">{$errors.password}</div>
        {/if}<br>

        <br>
        <button>Submit</button>
    </form>
</div>

<style>
    #login-form {
        margin: 2%;
    }

    #login-form label {
        font-weight: bold;
    }

    #login-form input {
        margin-bottom: 0.5%;
    }
</style>