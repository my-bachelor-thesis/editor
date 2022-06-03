<script>
    import {createForm} from "svelte-forms-lib"
    import * as helpers from "./helpers"
    import * as store from "./store"
    import {get} from "svelte/store";
    import Form from "./partial_components/forms/Form.svelte";
    import ErrorMessage from "./partial_components/messages/ErrorMessage.svelte";
    import SuccessMessage from "./partial_components/messages/SuccessMessage.svelte";
    import {navigate} from "svelte-navigator";

    let postError = ""
    let message = new URLSearchParams(window.location.search).get('msg')

    const {form, errors, state, handleChange, handleSubmit} = createForm({
        initialValues: {
            username: "",
            password: "",
        },
        validate: _ => {
            $errors = {}
            if ($form.username === "") {
                $errors["username"] = "username can't be empty"
            } else if ($form.username !== undefined) {
                helpers.isValidUsername($form.username).then(isValid => {
                    if (!isValid) {
                        $errors.username = "incorrect username"
                    }
                })
            }
            if ($form.password === "") {
                $errors["password"] = "password can't be empty"
            }
            return $errors
        },
        onSubmit: values => {
            postError = ""
            message = ""
            helpers.postJson(`${get(store.url)}/login/form`, JSON.stringify(values)).then(
                () => {
                    helpers.setStorage()
                    helpers.redirectToHomeWithMessage("logged in")
                }).catch(err => postError = err)
        }
    })
</script>

<h1 class="small-margin">Login</h1>

<SuccessMessage msg={message}/>
<ErrorMessage msg={postError}/>

<Form submitFunc={handleSubmit} handleFunc={handleChange} args={[
        {
            label: "username",
            error: $errors.username,
            value: $form.username,
            type: "text",
        },
        {
            label: "password",
            error: $errors.password,
            value: $form.password,
            type: "password",
        },
    ]}/>

<a id="reset-password" class="small-margin" href="#/"
   on:click|preventDefault={() => navigate("reset-password-request")}>If you forgot your password click here</a>


<style>
    #reset-password {
        font-size: larger;
    }
</style>

