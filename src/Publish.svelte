<script>
    import PublishApprove from "./partial_components/publish_approve/PublishApprove.svelte";
    import SuccessMessage from "./partial_components/messages/SuccessMessage.svelte";

    const message = new URLSearchParams(window.location.search).get('msg')
</script>

<SuccessMessage msg={message}/>

<PublishApprove
        title="Not published"
        buttonText="Publish"
        getTasksFromUrl="/not-published/all"
        postTasksToUrl="/not-published/publish"
        successMsg="published successfully"
/>