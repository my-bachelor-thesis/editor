<script>
    import {createForm} from "svelte-forms-lib";
    import * as helpers from "./helpers";
    import {get} from "svelte/store";
    import * as store from "./store";
    import Form from "./partial_components/forms/Form.svelte";
    import ErrorMessage from "./partial_components/messages/ErrorMessage.svelte";

    let postError

    const token = new URLSearchParams(window.location.search).get("token")

    const {form, errors, state, handleChange, handleSubmit} = createForm({
        initialValues: {
            new_password: "",
            repeat_password: "",
        },
        validate: _ => {
            $errors = {}
            if ($form.new_password === "") {
                $errors["new_password"] = "old password can't be empty"
            } else if ($form.new_password && $form.new_password.length < 5) {
                $errors["new_password"] = "new password is too short"
            }
            if ($form.new_password !== $form.repeat_password) {
                $errors["repeat_password"] = "passwords don't match"
            }
            return $errors
        },
        onSubmit: values => {
            postError = ""
            helpers.postJson(`${get(store.url)}/do-password-reset`, JSON.stringify({
                new_password: values.new_password,
                repeat_password: values.repeat_password,
                token: token
            })).then(
                () => helpers.redirectToHomeWithMessage("Password reset successfully. You can now log in"))
                .catch(
                    err => postError = err
                )
        }
    });
</script>

<h1 class="small-margin">Password reset</h1>

<ErrorMessage msg={postError}/>

<Form submitFunc={handleSubmit} handleFunc={handleChange} submitText="Reset" args={[
        {
            label: "new password",
            error: $errors.new_password,
            value: $form.new_password,
            type: "password",
        },
        {
            label: "repeat password",
            error: $errors.repeat_password,
            value: $form.repeat_password,
            type: "password",
        }
    ]}/>

