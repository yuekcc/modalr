<script>
    import { createEventDispatcher, onMount } from "svelte";

    import Loading from "./Loading.svelte";

    import { nextIndex } from "./nextIndex";

    const dispatch = createEventDispatcher();

    export let id = "";
    export let content = null;
    export let config = {
      closeOnMark: true,
      isLoading: false,
      backgroundColor: "rgba(0, 0, 0, 0.25)",
      zindex: 10000
    };

    const handleModalContainerOnClose = ({ event, currentId }) => {
      if (event.target.dataset["modalrId"] != id) {
        return;
      }

      if (config.closeOnMark && currentId == id) {
        dispatch("destroy");
      }
    };

    const handleModalContainerOnClick = event =>
      handleModalContainerOnClose({ event, currentId: id });

    $: continerZIndex = config.zindex;
    $: clildZIndex = config.zindex + 10;
    $: backgroundColor = config.backgroundColor || "rgba(0, 0, 0, 0.25)";
    $: contentWrapperId = `${id}-content-wrapper}`;
    $: isLoading = config.isLoading

    onMount(() => {
      config.zindex = nextIndex();
    });
</script>

<style>
  .modalr-dialog-container {
    position: fixed;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    height: 100vh;
    width: 100%;
    overflow: hidden;
  }

  .modalr-flex-container {
    display: flex;
    justify-items: center;
    align-items: center;
  }

  .modalr-flex-container .flex-item {
    flex: 1;
  }
</style>

<div data-modalr-id="{id}" class="modalr-dialog-container modalr-flex-container" on:click={handleModalContainerOnClick}
  style="z-index: {continerZIndex}; background-color: {backgroundColor};">
  {#if isLoading}
  <div class="flex-item" style="z-index: {clildZIndex}">
    <Loading></Loading>
  </div>
  {:else}
  <div id='{contentWrapperId}' class="flex-item" style="z-index: {clildZIndex}">
    {@html content}
  </div>
  {/if}
</div>

