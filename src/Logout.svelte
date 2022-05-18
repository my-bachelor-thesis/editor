<script>
    import * as helpers from "./helpers"

    // redirect if not logged in
    helpers.redirectIfNotLoggedIn()

    function deleteCookie(name) {
        document.cookie = `${name}= ; expires = Thu, 01 Jan 1970 00:00:00 GMT`
    }

    for (let cookie of ["auth", "username", "first_name", "last_name"]) {
        deleteCookie(cookie)
    }

    helpers.setStorage()
    helpers.redirectToHomeWithMessage("logged out")
</script>