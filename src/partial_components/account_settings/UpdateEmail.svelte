<script>
    import Form from "../forms/Form.svelte"
    import {createForm} from "svelte-forms-lib";
    import * as helpers from "../../helpers";
    import {get} from "svelte/store";
    import * as store from "../../store";

    export let postError = undefined, message = undefined

    function checkEmailForUniqueness(email) {
        helpers.isValidEmail(email).then(exists => {
            $errors.new_email = ""
            if (exists) {
                $errors.new_email = "email already exists"
            }
        })
    }

    const {form, errors, state, handleChange, handleSubmit} = createForm({
        initialValues: {
            new_email: get(store.email),
        },
        validate: _ => {
            $errors = {}
            if ($form.new_email === "") {
                $errors["new_email"] = "email can't be empty"
            } else if (!helpers.validateEmail($form.new_email)) {
                $errors["new_email"] = "email is not valid"
            } else {
                checkEmailForUniqueness($form.new_email)
            }
            return $errors
        },
        onSubmit: values => {
            postError = ""
            message = ""
            helpers.postJson(`${get(store.url)}/account-setting/update-email`, JSON.stringify(values)).then(
                () => {
                    document.cookie = `email=${values.new_email}`
                    message = `updated successfully. An email with confirmation link has been sent to you.
                    Please confirm it, otherwise you won't be able to log in`
                })
                .catch(
                    err => postError = err
                )
        }
    });
</script>


<Form submitFunc={handleSubmit} handleFunc={handleChange} submitText="Update" args={[
        {
            label: "new email",
            error: $errors.new_email,
            value: $form.new_email,
            type: "text",
        },
    ]}/>