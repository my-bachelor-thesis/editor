<script>
    import PublishApprove from "./partial_components/publish_approve/PublishApprove.svelte";
</script>

<PublishApprove
        title="Not approved"
        buttonText="Approve"
        getTasksFromUrl="/not-approved/all"
        postTasksToUrl="/not-approved/approve"
        successMsg="approved successfully"
/>