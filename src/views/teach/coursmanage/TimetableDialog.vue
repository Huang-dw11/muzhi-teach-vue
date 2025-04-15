<template>
  <el-dialog 
    :title="title"
    v-model="visible"
    width="800px"
    append-to-body
  >
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
  </el-dialog>
</template>

<script setup>
import { ref, watch, onMounted, defineProps, defineEmits } from 'vue'
import { listArrange } from "@/api/teach/arrange"
import { loadAllParams } from "@/api/page"

const props = defineProps({
  modelValue: Boolean,
  title: {
    type: String,
    default: '课程表'
  },
  afternoonLength: {
    type: [Number, String],
    default: 4
  },
  length: {
    type: [Number, String],
    default: 11
  },
  events: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['update:model-value'])

// 响应式状态
const visible = ref(props.modelValue)
const timetable = ref([])
const weeks = ref(['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'])
const localEvents = ref([...props.events]) // 本地副本

// 同步对话框状态
watch(() => props.modelValue, (newVal) => {
  visible.value = newVal
})

watch(visible, (newVal) => {
  emit('update:model-value', newVal)
})

// 监听外部事件数据变化
watch(() => props.events, (newVal) => {
  localEvents.value = [...newVal]
  mergeData()
}, { deep: true })

// 初始化课表
onMounted(() => {
  makeTimetable()
  fetchCourses()
})

// 生成空课表结构
const makeTimetable = () => {
  const temp = []
  for (let i = 0; i < props.length; i++) {
    temp.push({
      sjd: getTimePeriod(i),
      jc: i + 1,
      mon: {}, tue: {}, wed: {}, thu: {}, fri: {}, sat: {}, sun: {}
    })
  }
  timetable.value = temp
}

// 获取课程数据
const fetchCourses = async () => {
  try {
    const res = await listArrange(loadAllParams)
    localEvents.value = res.rows.map(course => ({
      weekday: course.weekday,
      title: course.courseName,
      content: course.content,
      start: course.start,
      end: course.end
    }))
    mergeData()
  } catch (error) {
    console.error('课程加载失败:', error)
    localEvents.value = []
  }
}

// 合并课程数据
const mergeData = () => {
  const newTimetable = timetable.value.map(row => ({
    ...row,
    mon: {}, tue: {}, wed: {}, thu: {}, fri: {}, sat: {}, sun: {}
  }))

  localEvents.value.forEach(event => {
    const weekKey = weeks.value[event.weekday - 1]
    const startRow = event.start - 1
    
    if (startRow >= 0 && startRow < props.length) {
      newTimetable[startRow][weekKey] = {
        ...event,
        _isCourseStart: true,
        _courseSpan: event.end - event.start + 1
      }
    }
  })

  timetable.value = newTimetable
}

// 单元格合并逻辑
const objectSpanMethod = ({ row, column, rowIndex, columnIndex }) => {
  // 时间段列合并
  if (columnIndex === 0) {
    if (rowIndex < 4) {
      return rowIndex === 0 ? { rowspan: 4, colspan: 1 } : { rowspan: 0, colspan: 0 }
    }
    if (rowIndex < 4 + Number(props.afternoonLength)) {
      return rowIndex === 4 ? { rowspan: Number(props.afternoonLength), colspan: 1 } : { rowspan: 0, colspan: 0 }
    }
    return rowIndex === 4 + Number(props.afternoonLength) ? { rowspan: 4, colspan: 1 } : { rowspan: 0, colspan: 0 }
  }

  // 课程列合并
  if (columnIndex >= 2) {
    const weekKey = weeks.value[columnIndex - 2]
    const course = row[weekKey]
    
    if (course?._isCourseStart) {
      return { rowspan: course._courseSpan, colspan: 1 }
    }
    
    if (course?.title) {
      return { rowspan: 0, colspan: 0 }
    }
  }
  
  return { rowspan: 1, colspan: 1 }
}

// 时间段划分
const getTimePeriod = (index) => {
  if (index < 4) return '上午'
  if (index < 4 + Number(props.afternoonLength)) return '下午'
  return '晚上'
}
</script>