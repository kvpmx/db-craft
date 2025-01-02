<template>
  <header class="border-b-[1px] bg-white">
    <div class="flex items-center justify-between px-4 py-2 sm:px-6 lg:px-3">
      <NuxtImg src="/images/logo.png" class="w-28" alt="DB Craft" />

      <div class="flex items-center gap-2">
        <DiagramSaveButton />
        <UserButton />
      </div>
    </div>
  </header>
</template>
