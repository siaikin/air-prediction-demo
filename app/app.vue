<script setup>
import 'echarts'

useHead({
  meta: [
    { name: 'viewport', content: 'width=device-width, initial-scale=1' }
  ],
  link: [
    { rel: 'icon', href: '/favicon.ico' }
  ]
})
</script>

<template>
  <UApp>
    <UDashboardGroup>
      <!-- 侧边栏 - 历史记录 -->
      <UDashboardSidebar
        collapsible
        resizable
        :default-size="25"
        :max-size="40"
        :min-size="20"
      >
        <template #header="{ collapsed }">
          <UIcon
            name="lucide:house"
            class="size-5 mx-auto text-primary"
          />
        </template>

        <template #default="{ collapsed }">
          <UNavigationMenu
            :collapsed="collapsed"
            :items="[
              {
                label: '图表',
                icon: 'lucide:chart-bar',
                to: { name: 'index' }
              }
            ]"
            orientation="vertical"
          />
        </template>
      </UDashboardSidebar>

      <!-- 主面板 -->
      <UDashboardPanel>
        <template #header>
          <UDashboardNavbar>
            <template #leading>
              <UDashboardSidebarCollapse />
            </template>
          </UDashboardNavbar>
        </template>

        <template #body>
          <NuxtPage />
        </template>
      </UDashboardPanel>
    </UDashboardGroup>
  </UApp>
</template>
