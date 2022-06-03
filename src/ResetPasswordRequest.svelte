<script>
    import Form from "./partial_components/forms/Form.svelte";
    import * as helpers from "./helpers";
    import {createForm} from "svelte-forms-lib";
    import * as store from "./store";
    import {get} from "svelte/store";
    import ErrorMessage from "./partial_components/messages/ErrorMessage.svelte";

    export let postError = undefined

    function checkEmailForUniqueness(email) {
        helpers.isValidEmail(email).then(exists => {
            $errors.registered_email = ""
            if (!exists) {
                $errors.registered_email = "email doesn't exists"
            }
        })
    }

    const {form, errors, state, handleChange, handleSubmit} = createForm({
        initialValues: {
            registered_email: "",
        },
        validate: _ => {
            $errors = {}
            if ($form.registered_email === "") {
                $errors["registered_email"] = "email can't be empty"
            } else if (!helpers.validateEmail($form.registered_email)) {
                $errors["registered_email"] = "email is not valid"
            } else {
                checkEmailForUniqueness($form.registered_email)
            }
            return $errors
        },
        onSubmit: values => {
            postError = ""
            helpers.postJson(`${get(store.url)}/login/reset-password`, JSON.stringify(values)).then(
                () => {
                    helpers.redirectToHomeWithMessage("An email has been sent. Please check your inbox")
                })
                .catch(
                    err => postError = err
                )
        }
    });
</script>

<h1 class="small-margin">Request password reset</h1>

<ErrorMessage msg={postError}/>

<Form submitFunc={handleSubmit} handleFunc={handleChange} submitText="Reset" args={[
        {
            label: "registered email",
            error: $errors.registered_email,
            value: $form.registered_email,
            type: "text",
        },
    ]}/>