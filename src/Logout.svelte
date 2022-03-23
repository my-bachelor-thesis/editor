<script>
    import * as helpers from "./helpers"

    document.cookie = "auth="
    helpers.setStorage()
    helpers.redirectToHomeWithMessage("logged out")
</script>