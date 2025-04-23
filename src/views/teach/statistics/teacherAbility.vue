<template>
  <div class="chart-container">
    <div id="demoDiv" style="width: 32%; height: 400px;"></div>
    <div id="demo2" style="width: 32%; height: 400px;"></div>
  </div>
</template>
  
<script setup name="statistics">
  import { inject } from 'vue'
  let $echarts = inject('echarts')
  
  onMounted(() => {
    let myChart = $echarts.init(document.getElementById('demoDiv'))
    let demo = $echarts.init(document.getElementById('demo2'))
    myChart.setOption({
        title: {
    text: 'Referer of a Website',
    subtext: 'Fake Data',
    left: 'center'
  },
  tooltip: {
    trigger: 'item'
  },
  legend: {
    orient: 'vertical',
    left: 'left'
  },
  series: [
    {
      name: 'Access From',
      type: 'pie',
      radius: '50%',
      data: [
        { value: 1048, name: 'Search Engine' },
        { value: 735, name: 'Direct' },
        { value: 580, name: 'Email' },
        { value: 484, name: 'Union Ads' },
        { value: 300, name: 'Video Ads' }
      ],
      emphasis: {
        itemStyle: {
          shadowBlur: 10,
          shadowOffsetX: 0,
          shadowColor: 'rgba(0, 0, 0, 0.5)'
        }
      }
    }
  ]
    });
    demo.setOption({
        tooltip: {
    trigger: 'axis',
    axisPointer: {
      type: 'shadow'
    }
  },
  grid: {
    left: '3%',
    right: '4%',
    bottom: '3%',
    containLabel: true
  },
  xAxis: [
    {
      type: 'category',
      data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      axisTick: {
        alignWithLabel: true
      }
    }
  ],
  yAxis: [
    {
      type: 'value'
    }
  ],
  series: [
    {
      name: 'Direct',
      type: 'bar',
      barWidth: '60%',
      data: [10, 52, 200, 334, 390, 330, 220]
    }
  ]
    })
  })
</script>

<style scoped>
.chart-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}
</style>