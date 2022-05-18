<script>
    import {createForm} from "svelte-forms-lib"
    import * as helpers from "./helpers"
    import * as store from "./store"
    import {get} from "svelte/store";
    import Form from "./partial_components/forms/Form.svelte";
    import ErrorMessage from "./partial_components/messages/ErrorMessage.svelte";
    import SuccessMessage from "./partial_components/messages/SuccessMessage.svelte";

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
                helpers.isValidUsername(values.username).then(isValid => {
                    if (!isValid) {
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
            helpers.postJson(`${get(store.url)}/login/form`, JSON.stringify(values)).then(
                () => {
                    helpers.setStorage()
                    helpers.redirectToHomeWithMessage("logged in")
                }).catch(err => postError = err)
        }
    })

    const message = new URLSearchParams(window.location.search).get('msg')
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

