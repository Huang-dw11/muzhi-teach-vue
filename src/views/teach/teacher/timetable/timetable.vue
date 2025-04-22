<template>
  <el-space 
      wrap
      :fill= "1"
      :size="10"
      :fill-ratio="fillRatio"
      :direction="vertical"
      style="width: 100%; justify-content: center; align-items: center"
      align-items: stretch
      >
      <el-card class="box-card" style="width: 100%;">
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
              <el-card class="box-card" style="width: 80%;">
                <div v-if="scope.row[week]?.title" class="course-content">
                  <!-- <h4>{{ scope.row[week]?.title }}</h4>
                  <div v-html="scope.row[week]?.content"></div> -->
                  <h4>{{ scope.row[week]?.title }}</h4>
                  <div>教师: {{ scope.row[week]?.teacherName }}</div>
                  <div>教室: {{ scope.row[week]?.classroomCode }}</div>
                </div>
              </el-card>
            </template>
          </el-table-column>
        </el-table>
      </el-card>
    </el-space>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { getStudentTimetable } from '@/api/teach/student'
const localEvents = ref([]) // 本地副本

// 移除所有currentData相关props
const props = defineProps({
  modelValue: Boolean,
  title: {
    type: String,
    default: '课程表'
  },
  afternoonLength: {
    type: [Number, String],
    default: 2
  },
  length: {
    type: [Number, String],
    default: 5
  }
})

const emit = defineEmits(['update:model-value', 'save'])

// 响应式状态
const timetable = ref([])
const weeks = ref(['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'])


// 初始化配置数据
const initConfig = async () => {
  try {
    getStudentTimetable().then(response => {
      localEvents.value = response.rows;
      mergeData();
  });

  } catch (error) {
    console.error('初始化失败:', error)
    ElMessage.error('无法加载课程表配置')
  }
}

// 初始化课表
onMounted(() => {
  makeTimetable()
  initConfig() // 替换原来的fetchCourses
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

// 合并课程数据
const mergeData = () => {
  const newTimetable = timetable.value.map(row => ({
    ...row,
    mon: {}, tue: {}, wed: {}, thu: {}, fri: {}, sat: {}, sun: {}
  }))

  
  localEvents.value.forEach((event, index) => {
    const weekKey = weeks.value[event.weekday - 1] // 周一到周日对应 1-7
    const startRow = event.start - 1
    
    if (startRow >= 0 && startRow < props.length) {
      newTimetable[startRow][weekKey] = {
        title: event.courseName, // 使用后端返回的courseName字段
        id: event.id, // 添加ID字段
        // content: event.content,
        weekday: event.weekday,
        start: event.start,
        end: event.end,
        _isCourseStart: true,
        _courseSpan: event.end - event.start + 1,
        // _index: index,
        // 添加其他需要显示的字段
        teacherName: event.name, // 教师
        // content: event.content,
        classroomCode:event.classroomCode // 教室

      }
    }
  })

  timetable.value = newTimetable
}

// 单元格合并逻辑
const objectSpanMethod = ({ row, column, rowIndex, columnIndex }) => {
  // 时间段列合并
  if (columnIndex === 0) {
    // 上午合并（1-2节）
    if (rowIndex < 2) {
      return rowIndex === 0 ? { rowspan: 2, colspan: 1 } : { rowspan: 0, colspan: 0 }
    }
    // 下午合并（1-4节）
    if (rowIndex < 2 + Number(props.afternoonLength)) {
      return rowIndex === 2 ? { rowspan: Number(props.afternoonLength), colspan: 1 } : { rowspan: 0, colspan: 0 }
    }
    // 晚上合并（5节）
    return rowIndex === 2 + Number(props.afternoonLength) ? { rowspan: 2, colspan: 1 } : { rowspan: 0, colspan: 0 }
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
  if (index < 2) return '上午'
  if (index < 2 + Number(props.afternoonLength)) return '下午'
  return '晚上'
}
</script>

