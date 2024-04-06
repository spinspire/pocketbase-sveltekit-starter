<script>
  // A reactive variable to hold the message
  export let message = "Loading...";
</script>

<div class="flex flex-col items-center justify-center h-72 min-h-[calc(100vh-200px)]">
  <div class="text-center">
    <svg class="h-8 w-8 animate-spin text-gray-800 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
    <p class="text-lg font-medium mt-4">{message}</p>
    <progress class="progress progress-primary w-56 mt-2" value="1" max="100"></progress>
  </div>
</div>
