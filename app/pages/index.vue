<script setup lang="ts">
import type { EChartsOption } from 'echarts'

// API 配置
const apiUrl = ref('http://192.168.224.100:8000')

// 预测步长选项（根据API文档）
const predictionDurations = [
  { label: '15分钟', value: 15 },
  { label: '2小时', value: 120 },
  { label: '12小时', value: 720 },
  { label: '1天', value: 1440 }
]

const selectedDuration = ref(15)
const loading = ref(false)

// 图表配置
const chartOption = ref<EChartsOption>({
  title: {
    text: '空调用电量预测',
    left: 'center',
    textStyle: {
      fontSize: 18
    }
  },
  tooltip: {
    trigger: 'axis'
  },
  legend: {
    data: ['实际用电量', '预测用电量'],
    top: '10%',
    left: 'center'
  },
  grid: {
    left: '3%',
    right: '4%',
    bottom: '3%',
    top: '20%',
    containLabel: true
  },
  xAxis: {
    type: 'category',
    boundaryGap: false,
    data: [],
    name: '时间',
    nameLocation: 'middle',
    nameGap: 30,
    axisLabel: {
      rotate: 45
    }
  },
  yAxis: {
    type: 'value',
    name: '用电量 (kWh)',
    nameLocation: 'middle',
    nameGap: 50
  },
  series: [
    {
      name: '实际用电量',
      type: 'line',
      smooth: true,
      symbol: 'circle',
      symbolSize: 6,
      itemStyle: {
        color: '#3b82f6'
      },
      lineStyle: {
        width: 2
      },
      data: []
    },
    {
      name: '预测用电量',
      type: 'line',
      smooth: true,
      symbol: 'circle',
      symbolSize: 6,
      itemStyle: {
        color: '#f59e0b'
      },
      lineStyle: {
        width: 2,
        type: 'dashed'
      },
      data: []
    }
  ]
})

// 生成时间标签
const generateTimeLabels = (startTime: Date, minutes: number, step = 1) => {
  const labels = []
  for (let i = 0; i <= minutes; i += step) {
    const time = new Date(startTime.getTime() + i * 60000)
    labels.push(
      `${time.getHours().toString().padStart(2, '0')}:${time.getMinutes().toString().padStart(2, '0')}`
    )
  }
  return labels
}

// 生成模拟历史数据
const generateHistoricalData = (count: number) => {
  return Array.from({ length: count }, (_, i) => {
    return Number((50 + Math.random() * 30 + Math.sin(i / 10) * 10).toFixed(2))
  })
}

// 获取数据的函数
const fetchData = async () => {
  loading.value = true

  try {
    // 生成历史数据（这里使用模拟数据，您可以替换为实际的历史数据源）
    const historicalMinutes = 60
    const historicalData = generateHistoricalData(historicalMinutes)

    // 调用预测API（通过本地API转发）
    const response = await $fetch<{
      status: string
      message: string
      forecast_data: number[]
      forecast_dates: string[]
      model_version: string
    }>(`${apiUrl.value}/api/v1/predict`, {
      method: 'POST',
      body: {
        history_data: historicalData,
        steps: selectedDuration.value
      }
    })

    // 处理响应数据
    const predictionData = response.forecast_data
    const predictionDates = response.forecast_dates

    // 生成时间标签
    const now = new Date()
    const historicalTimeLabels = generateTimeLabels(
      new Date(now.getTime() - historicalMinutes * 60000),
      historicalMinutes,
      1
    )

    // 使用API返回的日期作为预测时间标签
    const allTimeLabels = [...historicalTimeLabels, ...predictionDates.map((date) => {
      const d = new Date(date)
      return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`
    })]

    chartOption.value = {
      ...chartOption.value,
      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: allTimeLabels,
        name: '时间',
        nameLocation: 'middle',
        nameGap: 30,
        axisLabel: {
          rotate: 45
        }
      },
      series: [
        {
          name: '实际用电量',
          type: 'line',
          smooth: true,
          symbol: 'circle',
          symbolSize: 6,
          itemStyle: {
            color: '#3b82f6'
          },
          lineStyle: {
            width: 2
          },
          data: [...historicalData, ...Array(predictionData.length).fill(null)]
        },
        {
          name: '预测用电量',
          type: 'line',
          smooth: true,
          symbol: 'circle',
          symbolSize: 6,
          itemStyle: {
            color: '#f59e0b'
          },
          lineStyle: {
            width: 2,
            type: 'dashed'
          },
          data: [...Array(historicalData.length).fill(null), ...predictionData]
        }
      ]
    }
  } catch (error) {
    console.error('获取数据失败:', error)
    // 显示错误提示
    alert(`预测失败: ${error instanceof Error ? error.message : '未知错误'}`)
  } finally {
    loading.value = false
  }
}

watch(selectedDuration, () => {
  fetchData()
})

onMounted(() => {
  fetchData()
})
</script>

<template>
  <div class="w-full">
    <div class="mb-6">
      <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-4">
        空调用电量预测系统
      </h1>

      <div class="space-y-4">
        <div class="flex items-center gap-4 flex-wrap">
          <span class="text-sm font-medium text-gray-700 dark:text-gray-300">
            API地址：
          </span>
          <div class="flex items-center gap-2 flex-1 max-w-md">
            <UInput
              v-model="apiUrl"
              placeholder="输入API服务器地址"
              class="flex-1"
              :disabled="loading"
            />
            <UButton
              icon="i-lucide-check"
              color="success"
              variant="soft"
              size="sm"
              :disabled="loading"
              title="应用URL"
              @click="fetchData"
            >
              应用
            </UButton>
          </div>
        </div>

        <div class="flex items-center gap-4 flex-wrap">
          <span class="text-sm font-medium text-gray-700 dark:text-gray-300">
            预测时长：
          </span>
          <USelectMenu
            v-model="selectedDuration"
            :items="predictionDurations"
            value-key="value"
            class="w-40"
          />
          <UButton
            icon="i-lucide-refresh-cw"
            color="neutral"
            variant="soft"
            :loading="loading"
            @click="fetchData"
          >
            刷新数据
          </UButton>
        </div>
      </div>
    </div>

    <UCard>
      <template #header>
        <div class="flex items-center justify-between">
          <h2 class="text-lg font-semibold text-gray-900 dark:text-white">
            用电量趋势图
          </h2>
          <UBadge
            color="info"
            variant="soft"
          >
            步长: 1分钟
          </UBadge>
        </div>
      </template>

      <div class="relative">
        <div
          v-if="loading"
          class="absolute inset-0 flex items-center justify-center bg-white/50 dark:bg-gray-900/50 z-10"
        >
          <UIcon
            name="i-lucide-loader-2"
            class="w-8 h-8 animate-spin text-blue-500"
          />
        </div>

        <div class="w-full h-[500px]">
          <VChart
            :option="chartOption"
            autoresize
          />
        </div>
      </div>

      <template #footer>
        <div class="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
          <div class="flex items-center gap-2">
            <div class="w-4 h-0.5 bg-blue-500" />
            <span>实际用电量</span>
          </div>
          <div class="flex items-center gap-2">
            <div class="w-4 h-0.5 bg-amber-500 border-t-2 border-dashed border-amber-500" />
            <span>预测用电量</span>
          </div>
        </div>
      </template>
    </UCard>

    <UCard class="mt-6">
      <template #header>
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
          API 接口说明
        </h3>
      </template>

      <div class="space-y-3 text-sm">
        <p class="text-gray-700 dark:text-gray-300">
          当前使用的预测API: <code class="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded">{{ apiUrl }}/api/v1/predict</code>
        </p>

        <div class="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
          <p class="font-medium text-gray-900 dark:text-white mb-2">
            接口格式：
          </p>
          <pre class="text-xs overflow-x-auto"><code>POST {{ apiUrl }}/api/v1/predict

Request Body:
{
  "history_data": [number, ...],  // 历史时序数据
  "steps": 15 | 120 | 720 | 1440  // 预测步长(分钟)
}

Response:
{
  "status": "success",
  "message": "预测成功",
  "forecast_data": [number, ...],     // 预测结果数据
  "forecast_dates": ["ISO8601", ...], // 预测结果对应日期
  "model_version": "string"           // 模型版本
}</code></pre>
        </div>

        <div class="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg border border-blue-200 dark:border-blue-800">
          <p class="text-sm text-blue-900 dark:text-blue-200">
            <strong>预测步长选项：</strong><br>
            • 15 - 短期预测(15分钟)<br>
            • 120 - 中期预测(2小时)<br>
            • 720 - 长期预测(12小时)<br>
            • 1440 - 超长期预测(1天)
          </p>
        </div>
      </div>
    </UCard>
  </div>
</template>
