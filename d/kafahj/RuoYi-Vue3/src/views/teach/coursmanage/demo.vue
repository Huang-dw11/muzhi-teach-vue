<script>
import { defineComponent, ref } from 'vue'
import { getCourses } from '@/api/courses'

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
      default: () => [] // 移除默认值，改为从后端动态获取
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

  methods: {
    /* 从后端获取课程数据 */
    fetchCourses() {
      getCourses().then(response => {
        this.events = response.data.map(course => ({
          xq: course.weekday,       // 星期几
          title: course.courseName, // 课程名称
          content: course.content,  // 详细信息
          start: course.start,      // 开始节次
          end: course.end           // 结束节次
        }))
        this.mergeData() // 合并课程数据
      }).catch(error => {
        console.error('获取课程数据失败:', error)
        this.events = [] // 数据获取失败时清空课程数据
      })
    },

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
