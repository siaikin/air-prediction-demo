# 空调用电量预测系统

这是一个基于 Nuxt 3、Nuxt UI 和 ECharts 的空调用电量预测可视化系统。

## 功能特性

- ✅ 实时显示空调用电量历史数据
- ✅ 预测未来用电量趋势
- ✅ 支持多种预测时长选项（15分钟、30分钟、6小时、24小时）
- ✅ 响应式图表设计
- ✅ 深色模式支持
- ✅ 数据步长：1分钟

## 技术栈

- **Nuxt 3** - Vue 3 框架
- **Nuxt UI** - UI 组件库
- **ECharts** - 数据可视化库
- **TypeScript** - 类型安全

## 图表说明

### 数据展示

- **实际用电量**（蓝色实线）：显示过去60分钟的历史用电数据
- **预测用电量**（橙色虚线）：显示未来预测的用电趋势

### 预测时长选项

| 选项 | 时长（分钟） | 适用场景 |
|------|-------------|----------|
| 15分钟 | 15 | 短期预测 |
| 30分钟 | 30 | 短期预测 |
| 6小时 | 360 | 中期预测 |
| 24小时 | 1440 | 长期预测 |

## API 集成

### 接口位置

在 `app/pages/index.vue` 文件的 `fetchData` 函数中，找到以下注释：

```typescript
// TODO: 替换为实际的 API 调用
// const response = await $fetch('/api/power-consumption', {
//   method: 'GET',
//   query: {
//     duration: selectedDuration.value
//   }
// })
```

### 建议的 API 格式

#### 请求

```http
GET /api/power-consumption?duration={minutes}
```

**参数说明：**
- `duration`: 预测时长（分钟），可选值：15, 30, 360, 1440

#### 响应

```json
{
  "historical": {
    "timestamps": ["14:00", "14:01", "14:02", "..."],
    "values": [52.3, 53.1, 54.2, "..."]
  },
  "prediction": {
    "timestamps": ["15:00", "15:01", "15:02", "..."],
    "values": [55.8, 56.2, 57.1, "..."]
  }
}
```

**字段说明：**
- `historical.timestamps`: 历史数据的时间戳数组（格式：HH:mm）
- `historical.values`: 历史用电量数值数组（单位：kWh）
- `prediction.timestamps`: 预测数据的时间戳数组（格式：HH:mm）
- `prediction.values`: 预测用电量数值数组（单位：kWh）

### 集成示例

替换 `fetchData` 函数中的模拟数据部分：

```typescript
const fetchData = async () => {
  loading.value = true

  try {
    // 调用实际 API
    const response = await $fetch<{
      historical: {
        timestamps: string[]
        values: number[]
      }
      prediction: {
        timestamps: string[]
        values: number[]
      }
    }>('/api/power-consumption', {
      method: 'GET',
      query: {
        duration: selectedDuration.value
      }
    })

    // 组合时间标签
    const timeLabels = [
      ...response.historical.timestamps,
      ...response.prediction.timestamps
    ]

    // 组合数据（预测数据在历史数据位置填充 null）
    const historicalData = response.historical.values
    const predictionData = response.prediction.values

    // 更新图表
    chartOption.value = {
      ...chartOption.value,
      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: timeLabels,
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
    // TODO: 添加错误提示
  } finally {
    loading.value = false
  }
}
```

## 运行项目

```bash
# 安装依赖
pnpm install

# 启动开发服务器
pnpm dev

# 构建生产版本
pnpm build

# 预览生产版本
pnpm preview
```

## 自定义配置

### 修改图表样式

在 `chartOption.value` 中可以自定义：

- **颜色**：修改 `itemStyle.color`
  - 实际用电量：`#3b82f6`（蓝色）
  - 预测用电量：`#f59e0b`（橙色）

- **线条样式**：修改 `lineStyle`
  - `width`：线条宽度
  - `type`：线条类型（solid、dashed、dotted）

- **图表尺寸**：修改 `<div class="w-full h-[500px]">`

### 修改预测时长选项

在 `predictionDurations` 数组中添加或修改选项：

```typescript
const predictionDurations = [
  { label: '15分钟', value: 15 },
  { label: '30分钟', value: 30 },
  { label: '1小时', value: 60 },  // 新增选项
  { label: '6小时', value: 360 },
  { label: '24小时', value: 1440 }
]
```

## 项目结构

```
app/
├── pages/
│   └── index.vue          # 主页面组件（包含图表）
├── components/
│   ├── AppLogo.vue        # Logo 组件
│   └── TemplateMenu.vue   # 菜单组件
└── assets/
    └── css/
        └── main.css       # 全局样式
```

## 注意事项

1. 确保后端 API 返回的数据格式与建议格式一致
2. 时间戳格式应为 `HH:mm`（24小时制）
3. 数据值应为数字类型（单位：kWh）
4. 建议历史数据显示最近60分钟的数据
5. 预测数据长度应与选择的预测时长匹配

## 许可证

MIT
