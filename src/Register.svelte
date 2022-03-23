<script>
    import {createForm} from "svelte-forms-lib"
    import * as helpers from "./helpers"
    import * as store from "./store"
    import {get} from "svelte/store"
    import Form from "./partial_components/forms/Form.svelte"

    function validateEmail(email) {
        return String(email)
            .toLowerCase()
            .match(
                /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
            )
    }

    function checkUsernameForUniqueness(username) {
        helpers.isValidUsername(username).then(res => {
            $errors.username = ""
            if (res) {
                $errors.username = "username already exists"
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
            } else if (!validateEmail(values.email)) {
                errs["email"] = "email is not valid"
            }
            if (values.password === "") {
                errs["password"] = "password can't be empty"
            }
            if ($form.password !== $form.repeated_password) {
                errs["repeated_password"] = "passwords don't match"
            }
            return errs
        },
        onSubmit: values => {
            postError = ""
            helpers.postJson(`${get(store.url)}/register/form`, JSON.stringify(values)).then(
                () => helpers.redirectToHomeWithMessage("account registered")).catch((err) => postError = err
            )
        }
    })

    $: if ($form.password === $form.repeated_password) {
        $errors.repeated_password = ""
    }
</script>

<h1>Register</h1>

{#if postError}
    <div class="error">{postError}</div>
{/if}

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
            label: "email",
            error: $errors.email,
            value: $form.email,
            type: "text",
        },
    ]}/>

<!--<div class="form">-->
<!--    <form on:submit={handleSubmit}>-->
<!--        <FormField label="first name" error={$errors.first_name} value={$form.first_name} type={"text"} handleFunc={handleChange}/>-->

<!--        <FormField label="last name" error={$errors.last_name} value={$form.last_name} type={"text"} handleFunc={handleChange}/>-->

<!--        <FormField label="username" error={$errors.username} value={$form.username} type={"text"} handleFunc={handleChange}/>-->

<!--        <FormField label="email" error={$errors.email} value={$form.email} type={"text"} handleFunc={handleChange}/>-->

<!--        <FormField label="password" error={$errors.password} value={$form.password} type={"password"} handleFunc={handleChange}/>-->

<!--        <FormField label="repeated password" error={$errors.repeated_password} value={$form.repeated_password} type={"password"} handleFunc={handleChange}/>-->

<!--        <br>-->
<!--        <button>Submit</button>-->
<!--    </form>-->
<!--</div>-->

<style lang="scss">
  @import "./src/styles/global.scss";
</style>