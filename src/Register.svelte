<script>
    import {createForm} from "svelte-forms-lib"
    import * as helpers from "./helpers"
    import * as store from "./store"
    import {get} from "svelte/store"
    import Form from "./partial_components/forms/Form.svelte"
    import ErrorMessage from "./partial_components/messages/ErrorMessage.svelte"

    function checkUsernameForUniqueness(username) {
        helpers.isValidUsername(username).then(exists => {
            $errors.username = ""
            if (exists) {
                $errors.username = "username already exists"
            }
        })
    }

    function checkEmailForUniqueness(email) {
        helpers.isValidEmail(email).then(exists => {
            $errors.email = ""
            if (exists) {
                $errors.email = "email already exists"
            }
        })
    }

    let postError = ""

    const {form, errors, state, handleChange, handleSubmit} = createForm({
        initialValues: {
            first_name: "",
            last_name: "",
            username: "",
            email: "",
            password: "",
            repeated_password: ""
        },
        validate: values => {
            let errs = {}
            if (values.first_name === "") {
                errs["first_name"] = "first name can't be empty"
            }
            if (values.last_name === "") {
                errs["last_name"] = "last name can't be empty"
            }
            if (values.username === "") {
                errs["username"] = "username can't be empty"
            } else if (values.username !== undefined) {
                checkUsernameForUniqueness(values.username)
            }
            if (values.email === "") {
                errs["email"] = "email can't be empty"
            } else if (!helpers.validateEmail(values.email)) {
                errs["email"] = "email is not valid"
            } else {
                checkEmailForUniqueness(values.email)
            }
            if (values.password === "") {
                errs["password"] = "password can't be empty"
            } else if (values.password && values.password.length < 5) {
                errs["password"] = "password is too short"
            }
            if ($form.password !== $form.repeated_password) {
                errs["repeated_password"] = "passwords don't match"
            }
            return errs
        },
        onSubmit: values => {
            postError = ""
            helpers.postJson(`${get(store.url)}/register/form`, JSON.stringify(values)).then(
                () => helpers.redirectToHomeWithMessage("Account registered. Please confirm your email")).catch((err) => postError = err
            )
        }
    })

    $: if ($form.password === $form.repeated_password) {
        $errors.repeated_password = ""
    }
</script>

<h1 class="small-margin">Register</h1>

<ErrorMessage msg={postError}/>

<Form submitFunc={handleSubmit} handleFunc={handleChange} args={[
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
        },
        {
            label: "email",
            error: $errors.email,
            value: $form.email,
            type: "text",
        },
        {
            label: "password",
            error: $errors.password,
            value: $form.password,
            type: "password",
        },
        {
            label: "repeated password",
            error: $errors.repeated_password,
            value: $form.repeated_password,
            type: "password",
        },
    ]}/>
