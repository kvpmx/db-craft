<template>
  <div class="min-h-screen bg-gray-100">
    <PageHeader />

    <div class="mx-auto flex items-start">
      <SidebarAppSidebar />

      <main class="min-h-[calc(100vh-70px)] min-w-0 flex-1 px-4 py-8 sm:px-6 lg:px-8">
        <slot />
      </main>
    </div>
  </div>
</template>
