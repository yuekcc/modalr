<script>
  import { LoaderImage } from './loader-image';
</script>

<div class="modalr-loading">
  <img src={LoaderImage} alt="加载中" class="modalr-loader-image" />
</div>

<style>
  @keyframes -global-spinner-border {
    to {
      transform: rotate(360deg);
    }
  }

  .modalr-loading {
    text-align: center;
    width: 100%;
  }

  .modalr-loading .modalr-loader-image {
    width: 3rem;
    height: 3rem;
    animation: 1s linear infinite spinner-border;
  }
</style>
