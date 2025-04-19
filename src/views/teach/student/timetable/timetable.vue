<template>
  <el-table
    :data="timetable"
    :span-method="objectSpanMethod"
    border
    :cell-style="tableCellStyle"
  >
    <!-- 时间段列 -->
    <el-table-column prop="sjd" label="时间段" width="80" align="center" />
    
    <!-- 节次列 -->
    <el-table-column prop="jc" label="节次" width="80" align="center" />
    
    <!-- 动态生成星期列 -->
    <el-table-column 
      v-for="(week, index) in weeks" 
      :key="index"
      :prop="week"
      :label="'星期' + ['一','二','三','四','五','六','日'][index]"
      align="center"
    >
      <template #default="scope">
        <h4>{{ scope.row[week]?.title }}</h4>
        <div v-html="scope.row[week]?.content"></div>
      </template>
    </el-table-column>
  </el-table>
</template>

<script>
import { defineComponent } from 'vue'

export default defineComponent({
props: {
  // 下午包含的节次数（默认4节）
  afternoonLength: {
    type: [String, Number],
    default: 4
  },
  // 全天总节次数（默认12节）
  length: {
    type: [String, Number],
    default: 11
  },
  // 课程数据，格式要求：
  // [
  //   {
  //     xq: 1,             // 星期几（1-7）
  //     title: '课程名称',
  //     content: '详细信息', // 支持HTML
  //     start: 1,          // 开始节次
  //     end: 2             // 结束节次
  //   },
  //   ...
  // ]
  events: {
    type: Array,
    default: () => [ {
        xq: 1,
        title: '高等数学',
        content: '1-2节<br>李老师<br>301教室',
        start: 1,
        end: 2
      },
      {
        xq: 3,
        title: '大学英语',
        content: '5-6节<br>王老师<br>203教室',
        start: 5,
        end: 6
      }]
  }
},
data() {
  return {
    timetable: [],    // 表格核心数据结构
    weeks: ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'] // 星期字段映射
  }
},
// 生命周期钩子
created() {
  this.makeTimetable() // 初始化空课表结构
},
mounted() {
  this.mergeData() // 合并课程数据
},
// 监听器
watch: {
  events: {
    handler(newVal) {
      this.mergeData() // 当课程数据变化时重新合并
    },
    deep: true // 深度监听数组变化
  }
},

methods: {
  /* 统一后的mergeData方法 */
  mergeData() {
    // 清空现有数据但保留时间段
    this.timetable = this.timetable.map(row => ({
      ...row,
      mon: {}, tue: {}, wed: {}, thu: {}, fri: {}, sat: {}, sun: {}
    }))

    // 填充课程数据（修正版本）
    this.events.forEach(event => {
      const weekKey = this.weeks[event.xq - 1]
      const startRow = event.start - 1
      
      // 只填充起始行并记录跨度
      if (startRow >= 0 && startRow < this.length) {
        this.timetable[startRow][weekKey] = {
          ...event,
          _isCourseStart: true,
          _courseSpan: event.end - event.start + 1
        }
      }
    })
  },

  /* 初始化空课表结构 */
  makeTimetable() {
    this.timetable = []
    for (let i = 0; i < this.length; i++) {
      this.timetable.push({
        sjd: this.getTimePeriod(i), // 时间段（上午/下午/晚上）
        jc: i + 1,                 // 当前节次（1-based）
        // 初始化星期数据为空对象
        mon: {}, tue: {}, wed: {}, thu: {}, fri: {}, sat: {}, sun: {}
      })
    }
  },

  /* 修正后的单元格合并方法 */
  objectSpanMethod({ row, column, rowIndex, columnIndex }) {
    // 时间段列合并逻辑
    if (columnIndex === 0) {
      // 上午合并（1-4节）
      if (rowIndex < 4) {
        return rowIndex === 0 ? { rowspan: 4, colspan: 1 } : { rowspan: 0, colspan: 0 }
      }
      // 下午合并（5-8节）
      if (rowIndex < 4 + this.afternoonLength) {
        return rowIndex === 4 ? { rowspan: this.afternoonLength, colspan: 1 } : { rowspan: 0, colspan: 0 }
      }
      // 晚上合并（9-12节）
      return rowIndex === 8 ? { rowspan: 4, colspan: 1 } : { rowspan: 0, colspan: 0 }
    }

    // 课程列合并（第3列开始）
    if (columnIndex >= 2) {
      const weekKey = this.weeks[columnIndex - 2]
      const course = row[weekKey]
      
      if (course?._isCourseStart) {
        return { 
          rowspan: course._courseSpan,
          colspan: 1 
        }
      }
      
      // 被合并的单元格隐藏
      if (course?.title) {
        return { rowspan: 0, colspan: 0 }
      }
    }
    
    return { rowspan: 1, colspan: 1 }
  },

  /* 修正时间段划分逻辑 */
  getTimePeriod(index) {
    // index从0开始（对应第1节）
    if (index < 4) return '上午'       // 1-4节
    if (index < 4 + this.afternoonLength) return '下午' // 5-8节（当afternoonLength=4时）
    return '晚上'                      // 9-12节
  }
}
})
 
</script>

