<script>
    import PublishApprove from "./partial_components/publish_approve/PublishApprove.svelte";
    import * as helpers from "./helpers"

    // redirect if not admin
    helpers.redirectIfNotAdmin()
</script>

<PublishApprove
        title="Not approved"
        buttonText="Approve"
        getTasksFromUrl="/not-approved/all"
        postTasksToUrl="/not-approved/approve"
        successMsg="approved successfully"
/>