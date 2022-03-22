<script>
    import {createForm} from "svelte-forms-lib"
    import * as helpers from "./helpers"
    import * as store from "./store"

    let url = ""
    store.url.subscribe(val => {
        url = val
    })

    function validateEmail(email) {
        return String(email)
            .toLowerCase()
            .match(
                /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
            )
    }

    function checkUsernameForUniqueness(username) {
        helpers.isValidUsername(username).then(res => {
            $errors.username = ""
            if (res) {
                $errors.username = "username is not unique"
            }
        })
    }

    let postError = ""
    let password = ""

    const {form, errors, state, handleChange, handleSubmit} = createForm({
        initialValues: {
            first_name: "",
            last_name: "",
            username: "",
            email: "",
            password: "",
            repeated_password: ""
        },
        validate: values => {
            let errs = {}
            if (values.first_name === "") {
                errs["first_name"] = "first name can't be empty"
            }
            if (values.last_name === "") {
                errs["last_name"] = "last name can't be empty"
            }
            if (values.username === "") {
                errs["username"] = "username can't be empty"
            } else if (values.username !== undefined) {
                checkUsernameForUniqueness(values.username)
            }
            if (values.email === "") {
                errs["email"] = "email can't be empty"
            } else if (!validateEmail(values.email)) {
                errs["email"] = "email is not valid"
            }
            if (values.password === "") {
                errs["password"] = "password can't be empty"
            }
            if (values.repeated_password !== password) {
                errs["repeated_password"] = "passwords don't match"
            }
            return errs
        },
        onSubmit: values => {
            postError = ""
            helpers.postJson(`${url}/register/form`, JSON.stringify(values)).then(
                () => helpers.redirectToHomeWithMessage("account registered")).catch((err) => postError = err
            )
        }
    })

    $: if ($form.password) {
        password = $form.password
    }

</script>

<h1>Register</h1>

{#if postError}
    <div class="error">{postError}</div>
{/if}

<div class="form">

    <form on:submit={handleSubmit}>
        <label for="first_name">first name</label><br>
        <input bind:value={$form.first_name} on:change={handleChange} id="first_name" name="first_name" type="text"
               placeholder="first name">
        {#if $errors.first_name}
            <div class="error">{$errors.first_name}</div>
        {/if}<br>

        <label for="last_name">last name</label><br>
        <input bind:value={$form.last_name} on:change={handleChange} id="last_name" name="last_name" type="text"
               placeholder="last name">
        {#if $errors.last_name}
            <div class="error">{$errors.last_name}</div>
        {/if}<br>

        <label for="username">username</label><br>
        <input bind:value={$form.username} on:change={handleChange} id="username" name="username" type="text"
               placeholder="username">
        {#if $errors.username}
            <div class="error">{$errors.username}</div>
        {/if}<br>

        <label for="email">email</label><br>
        <input bind:value={$form.email} on:change={handleChange} id="email" name="email" type="text"
               placeholder="email">
        {#if $errors.email}
            <div class="error">{$errors.email}</div>
        {/if}<br>

        <label for="password">password</label><br>
        <input bind:value={$form.password} on:change={handleChange} id="password" name="password" type="password"
               placeholder="password">
        {#if $errors.password}
            <div class="error">{$errors.password}</div>
        {/if}<br>

        <label for="repeated_password">repeat password</label><br>
        <input bind:value={$form.repeated_password} on:change={handleChange} id="repeated_password"
               name="repeated_password" type="password"
               placeholder="repeat password">
        {#if $errors.repeated_password}
            <div class="error">{$errors.repeated_password}</div>
        {/if}<br>

        <br>
        <button>Submit</button>
    </form>
</div>