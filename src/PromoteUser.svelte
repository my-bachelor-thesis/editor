<script>
    import {createForm} from "svelte-forms-lib"
    import * as helpers from "./helpers"
    import * as store from "./store"
    import {get} from "svelte/store"
    import Form from "./partial_components/forms/Form.svelte"
    import ErrorMessage from "./partial_components/messages/ErrorMessage.svelte"
    import SuccessMessage from "./partial_components/messages/SuccessMessage.svelte"

    helpers.redirectIfNotAdmin()

    function checkUsernameForUniqueness(username) {
        helpers.isValidUsername(username).then(exists => {
            $errors.username_to_promote = ""
            if (!exists) {
                $errors.username_to_promote = "username doesn't exists"
            }
        })
    }

    let postError = "", message = ""

    const {form, errors, state, handleChange, handleSubmit} = createForm({
        initialValues: {
            username_to_promote: ""
        },
        validate: _ => {
            $errors = {}
            if ($form.username_to_promote === "") {
                $errors["username_to_promote"] = "username can't be empty"
            } else if ($form.username_to_promote) {
                checkUsernameForUniqueness($form.username_to_promote)
            }
            return $errors
        },
        onSubmit: values => {
            postError = ""
            message = ""
            helpers.postJson(`${get(store.url)}/promote-user-form`, JSON.stringify(values)).then(
                () => message = "Promoted successfully. Promoted user has to log in again to become an admin").catch((err) => postError = err
            )
        }
    })
</script>

<h1 class="small-margin">Promote a user to admin</h1>

<ErrorMessage msg={postError}/>
<SuccessMessage msg={message}/>

<Form submitText="Promote" submitFunc={handleSubmit} handleFunc={handleChange} args={[
        {
            label: "username to promote",
            error: $errors.username_to_promote,
            value: $form.username_to_promote,
            type: "text",
        }
    ]}/>
