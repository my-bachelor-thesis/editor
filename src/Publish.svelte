<script>
    import PublishApprove from "./partial_components/publish_approve/PublishApprove.svelte";
</script>

<PublishApprove
        title="Not published"
        buttonText="Publish"
        getTasksFromUrl="/not-published/all"
        postTasksToUrl="/not-published/publish"
        successMsg="published successfully"
/>