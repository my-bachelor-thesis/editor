<script>
    import Form from "../forms/Form.svelte"
    import {createForm} from "svelte-forms-lib";
    import * as helpers from "../../helpers";
    import {get} from "svelte/store";
    import * as store from "../../store";

    export let postError, message

    const {form, errors, state, handleChange, handleSubmit} = createForm({
        initialValues: {
            old_password: "",
            new_password: "",
            repeat_password: "",
        },
        validate: _ => {
            $errors = {}
            if ($form.old_password === "") {
                $errors["old_password"] = "old password can't be empty"
            }
            if ($form.new_password === "") {
                $errors["new_password"] = "new password can't be empty"
            } else if ($form.new_password === $form.old_password) {
                $errors["new_password"] = "new password has to be different from the old one"
            } else if ($form.new_password && $form.new_password.length < 5) {
                $errors["new_password"] = "new password is too short"
            }
            if ($form.new_password !== $form.repeat_password) {
                $errors["repeat_password"] = "passwords don't match"
            }
        },
        onSubmit: values => {
            postError = ""
            message = ""
            helpers.postJson(`${get(store.url)}/account-setting/update-password`, JSON.stringify(values)).then(
                () => message = "updated successfully")
                .catch(
                    err => postError = err
                )
        }
    });
</script>


<Form submitFunc={handleSubmit} handleFunc={handleChange} submitText="Update" args={[
        {
            label: "old password",
            error: $errors.old_password,
            value: $form.old_password,
            type: "password",
        },
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