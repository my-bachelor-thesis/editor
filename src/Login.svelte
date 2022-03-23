<script>
    import {createForm} from "svelte-forms-lib"
    import * as helpers from "./helpers"
    import * as store from "./store"
    import FormField from "./partial_components/forms/InputField.svelte"

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
        <FormField label="username" error={$errors.username} value={$form.username} type={"text"} handleFunc={handleChange}/>

        <FormField label="password" error={$errors.password} value={$form.password} type={"password"} handleFunc={handleChange}/>
        <br>
        <button>Submit</button>
    </form>
</div>

<style lang="scss">
  @import "./src/styles/global.scss";

  #login-form {
    margin: 2%;
  }

  #login-form label {
    font-weight: bold !important;
  }

  #login-form input {
    margin-bottom: 0.5%;
  }
</style>