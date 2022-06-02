<script>
    import Form from "../forms/Form.svelte"
    import * as helpers from "../../helpers";
    import {createForm} from "svelte-forms-lib";
    import {get} from "svelte/store";
    import * as store from "../../store";

    export let postError, message

    function checkUsernameForUniqueness(name) {
        if (get(store.username) === name) {
            return
        }
        helpers.isValidUsername(name).then(exists => {
            $errors.username = ""
            if (exists) {
                $errors.username = "username already exists"
            }
        })
    }

    const {form, errors, state, handleChange, handleSubmit} = createForm({
        initialValues: {
            first_name: get(store.firstName),
            last_name: get(store.lastName),
            username: get(store.username),
        },
        validate: _ => {
            if ($form.first_name === "") {
                $errors["first_name"] = "first name can't be empty"
            }
            if ($form.last_name === "") {
                $errors["last_name"] = "last name can't be empty"
            }
            if ($form.username === "") {
                $errors["username"] = "username can't be empty"
            } else if ($form.username) {
                checkUsernameForUniqueness($form.username)
            }
        },
        onSubmit: values => {
            postError = ""
            message = ""
            helpers.postJson(`${get(store.url)}/account-setting/update-user-info`, JSON.stringify(values)).then(
                () => {
                    document.cookie = `first_name=${values.first_name}`
                    document.cookie = `last_name=${values.last_name}`
                    document.cookie = `username=${values.username}`
                    message = "updated successfully"
                })
                .catch(
                    err => postError = err
                )
        }
    });
</script>


<Form submitFunc={handleSubmit} handleFunc={handleChange} submitText="Update" args={[
        {
            label: "first name",
            error: $errors.first_name,
            value: $form.first_name,
            type: "text",
        },
        {
            label: "last name",
            error: $errors.last_name,
            value: $form.last_name,
            type: "text",
        },
        {
            label: "username",
            error: $errors.username,
            value: $form.username,
            type: "text",
        }
    ]}/>