<script>
    import * as helpers from "./helpers"
    import * as store from "./store"
    import {get} from "svelte/store"
    import {createForm} from "svelte-forms-lib"
    import ErrorMessage from "./partial_components/messages/ErrorMessage.svelte";
    import Form from "./partial_components/forms/Form.svelte"
    import SuccessMessage from "./partial_components/messages/SuccessMessage.svelte";
    import UpdateBasicInfo from "./partial_components/account_settings/UpdateBasicInfo.svelte";
    import UpdatePassword from "./partial_components/account_settings/UpdatePassword.svelte";

    helpers.redirectIfNotLoggedIn()

    let username = get(store.username)

    let postError, message

    let url = get(store.url)
    //
    // function checkUsernameForUniqueness(name) {
    //     if (username === name) {
    //         return
    //     }
    //     helpers.isValidUsername(name).then(exists => {
    //         $errors.username = ""
    //         if (exists) {
    //             $errors.username = "username already exists"
    //         }
    //     })
    // }
    //
    // const {form, errors, state, handleChange, handleSubmit} = createForm({
    //     initialValues: {
    //         first_name: get(store.firstName),
    //         last_name: get(store.lastName),
    //         username: username,
    //     },
    //     validate: values => {
    //         let errs = {};
    //         if (values.first_name === "") {
    //             errs["first_name"] = "first name can't be empty"
    //         }
    //         if (values.last_name === "") {
    //             errs["last_name"] = "last name can't be empty"
    //         }
    //         if (values.username === "") {
    //             errs["username"] = "username can't be empty"
    //         } else if (values.username) {
    //             checkUsernameForUniqueness(values.username)
    //         }
    //         return errs;
    //     },
    //     onSubmit: values => {
    //         console.log("()", values)
    //         postError = ""
    //         message = ""
    //         helpers.postJson(`${get(store.url)}/account-setting/update-user-info`, JSON.stringify(values)).then(
    //             () => {
    //                 document.cookie = `first_name=${values.first_name}`
    //                 document.cookie = `last_name=${values.last_name}`
    //                 document.cookie = `username=${values.username}`
    //                 message = "updated successfully"
    //             })
    //             .catch(
    //                 err => postError = err
    //             )
    //     }
    // });

    // const {form2, errors2, state2, handleChange2, handleSubmit2} = createForm({
    //     initialValues: {
    //         old_password: "",
    //         new_password: "",
    //         new_password_repeated: "",
    //     },
    //     validate: values => {
    //         let errs = {};
    //         if (values.old_password === "") {
    //             errs["old_password"] = "old password can't be empty"
    //         }
    //         if (values.new_password === "") {
    //             errs["last_name"] = "new password can't be empty"
    //         }
    //         if ($form2.new_password !== $form2.new_password_repeated) {
    //             errs["new_password_repeated"] = "passwords don't match"
    //         }
    //         return errs;
    //     },
    //     onSubmit: values => {
    //         console.log("(-)", values)
    //         postError = ""
    //         message = ""
    //         helpers.postJson(`${get(store.url)}/account-setting/update-password`, JSON.stringify(values)).then(
    //             () => message = "updated successfully")
    //             .catch(
    //                 err => postError = err
    //             )
    //     }
    // });
</script>

<h1 class="small-margin">Account Settings</h1>
<h3 class="small-margin">Logged in as {username} ({(get(store.isAdmin)) ? "admin privileges" : "regular user"})</h3>

<br>

<SuccessMessage msg={message}/>
<ErrorMessage msg={postError}/>

<h4 class="small-margin">Update basic info</h4>

<UpdateBasicInfo bind:username={username} bind:postError={postError} bind:message={message}/>

<!--<Form submitFunc={handleSubmit} handleFunc={handleChange} submitText="Update" args={[-->
<!--        {-->
<!--            label: "first name",-->
<!--            error: $errors.first_name,-->
<!--            value: $form.first_name,-->
<!--            type: "text",-->
<!--        },-->
<!--        {-->
<!--            label: "last name",-->
<!--            error: $errors.last_name,-->
<!--            value: $form.last_name,-->
<!--            type: "text",-->
<!--        },-->
<!--        {-->
<!--            label: "username",-->
<!--            error: $errors.username,-->
<!--            value: $form.username,-->
<!--            type: "text",-->
<!--        }-->
<!--    ]}/>-->

<br>

<h4 class="small-margin">Update password</h4>

<UpdatePassword bind:postError={postError} bind:message={message}/>

<!--<Form submitFunc={handleSubmit2} handleFunc={handleChange2} submitText="Update" args={[-->
<!--        {-->
<!--            label: "old password",-->
<!--            error: $errors.old_password,-->
<!--            value: $form.old_password,-->
<!--            type: "password",-->
<!--        },-->
<!--        {-->
<!--            label: "new password",-->
<!--            error: $errors.new_password,-->
<!--            value: $form.new_password,-->
<!--            type: "password",-->
<!--        },-->
<!--        {-->
<!--            label: "repeat new password",-->
<!--            error: $errors.new_password_repeated,-->
<!--            value: $form.new_password_repeated,-->
<!--            type: "password",-->
<!--        }-->
<!--    ]}/>-->





