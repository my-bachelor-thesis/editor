<script>
    import Form from "../forms/Form.svelte"
    import {createForm} from "svelte-forms-lib";
    import * as helpers from "../../helpers";
    import {get} from "svelte/store";
    import * as store from "../../store";

    export let postError, message

    const {form, errors, state, handleChange, handleSubmit} = createForm({
        initialValues: {
            old_password: null,
            new_password: null,
            repeat_password: null,
        },
        validate: values => {
            let errs = {};
            if (values.old_password === "") {
                errs["old_password"] = "old password can't be empty"
            }
            if (values.new_password === "") {
                errs["last_name"] = "new password can't be empty"
            }
            if ($form.new_password !== $form.repeat_password) {
                errs["repeat_password"] = "passwords don't match"
            }
            return errs;
        },
        onSubmit: values => {
            console.log("(-)", values)
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