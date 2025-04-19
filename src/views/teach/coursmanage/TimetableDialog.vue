<template>
  <el-dialog 
    :title="title"
    v-model="visible"
    width="1000px"
    append-to-body
    :close-on-click-modal="false"
    @close="handleClose"
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
          <div class="course-cell">
            <div v-if="scope.row[week]?.title" class="course-content">
              <!-- <h4>{{ scope.row[week]?.title }}</h4>
              <div v-html="scope.row[week]?.content"></div> -->
              <h4>{{ scope.row[week]?.title }}</h4>
              <!-- <div>教师: {{ scope.row[week]?.teacher }}</div> -->
              <!-- <div>课号: {{ scope.row[week]?.courseCode }}</div> -->
              <div>教室: {{ scope.row[week]?.content }}</div>
              <div class="cell-actions">
                <el-button 
                  type="text" 
                  size="small"
                  @click.stop="handleEdit(scope.row, week)"
                >编辑</el-button>
                <el-button 
                  type="text" 
                  size="small"
                  @click.stop="handleRemove(scope.row, week)"
                >删除</el-button>
              </div>
            </div>
            <div v-else class="empty-cell">
              <el-button 
                type="text" 
                size="small"
                @click.stop="handleAdd(scope.row, week)"
              >       </el-button>
            </div>
          </div>
        </template>
      </el-table-column>
    </el-table>

    <!-- 课程编辑对话框 -->
    <el-dialog
      v-model="courseDialogVisible"
      :title="courseDialogTitle"
      width="600px"
      append-to-body
      :close-on-click-modal="false"
    >
      <el-form :model="currentCourse" label-width="80px">
        <el-form-item label="课程名称">
          <!-- <el-input v-model="currentCourse.title" /> -->
           <el-select v-model="currentCourse.courseCode">
            <el-option
              v-for="item in courseList"
              :key="item.courseCode"
              :label="item.courseName"
              :value="item.courseCode"
            />
           </el-select>
        </el-form-item>
        <el-form-item label="开始节次">
          <span class="detail-value">
            {{ currentCourse.start }}
          </span>
        </el-form-item>
        <el-form-item label="结束节次">
          <el-input-number 
            v-model="currentCourse.end" 
            :min="currentCourse.start" 
            :max="props.length"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="courseDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveCourse">保存</el-button>
      </template>
    </el-dialog>
  </el-dialog>
</template>

<script setup>
import { ref, watch, onMounted, defineProps, defineEmits } from 'vue'
import { loadAllParams } from "@/api/page"
import { listCourse } from "@/api/teach/course";
import { listArrange,addArrange, updateArrange, delArrange } from '@/api/teach/arrange'

const props = defineProps({
   // 新增currentData接收完整课表信息
   currentData: {
    // type: Object,
    // default: () => ({
    //   id: null,
    //   code: '',
    //   expertiseCode: ''
    // })
    type: Object,
    required: true,  // 改为必填
    validator(value) {
      return !!value.id && !!value.cmCode
    }
  },
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
  },
  events: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['update:model-value', 'save'])

// 响应式状态
const visible = ref(props.modelValue)
const timetable = ref([])
const weeks = ref(['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'])
const localEvents = ref([...props.events]) // 本地副本

// 课程编辑相关状态
const courseDialogVisible = ref(false)
const courseDialogTitle = ref('')
const currentCourse = ref({
  weekday: 0,
  title: '',
  content: '',
  start: 1,
  end: 1,
  row: null,
  weekKey: '',
  courseCode: '' // 初始化 openCourseCode
})
const editingIndex = ref(-1) // 编辑的课程索引，-1表示新增

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

// 添加深度监听currentData变化
watch(() => props.currentData, (newVal) => {
  if (newVal?.id) {
    fetchCourses();
  }
}, { deep: true, immediate: true })

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

const fetchCourses = async () => {
  try {
    // 确保参数名称与接口文档一致
    const res = await listArrange({
      cmCode: props.currentData.cmCode, // 使用cmCode参数
      id: props.currentData.id
    });
    
    // 调试日志
    console.log('课程数据加载成功:', res.rows);
    
    localEvents.value = res.rows;
    mergeData();
  } catch (error) {
    console.error('课程加载失败:', error);
    ElMessage.error('课程加载失败');
    localEvents.value = [];
  }
};

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
        content: event.content,
        weekday: event.weekday,
        start: event.start,
        end: event.end,
        _isCourseStart: true,
        _courseSpan: event.end - event.start + 1,
        _index: index,
        // 添加其他需要显示的字段
        teacher: event.teacherName,
        // courseCode: event.openCourseCode
        content: event.content
      }
    }
  })

  timetable.value = newTimetable
}

// 单元格合并逻辑
const objectSpanMethod = ({ row, column, rowIndex, columnIndex }) => {
  // 时间段列合并
  if (columnIndex === 0) {
    // 上午合并（1-4节）
    if (rowIndex < 2) {
      return rowIndex === 0 ? { rowspan: 2, colspan: 1 } : { rowspan: 0, colspan: 0 }
    }
    // 下午合并（5-8节）
    if (rowIndex < 2 + Number(props.afternoonLength)) {
      return rowIndex === 2 ? { rowspan: Number(props.afternoonLength), colspan: 1 } : { rowspan: 0, colspan: 0 }
    }
    // 晚上合并（9-12节）
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
// 添加课程
const handleAdd = (row, weekKey) => {
  const weekday = weeks.value.indexOf(weekKey) + 1
  currentCourse.value = {
    weekday,
    title: '',
    content: '',
    start: row.jc,
    end: row.jc,
    row,
    weekKey,
    /* 开课编码 */
    courseCode: ''
  }
  editingIndex.value = -1
  courseDialogTitle.value = '添加课程'
  courseDialogVisible.value = true
}

// 编辑课程
const handleEdit = (row, weekKey) => {
  const course = row[weekKey]
  if (!course) return
  
  currentCourse.value = {
    weekday: course.weekday,
    title: course.title,
    content: course.content,
    start: course.start,
    end: course.end,
    row,
    weekKey,
    /* 开课编码 */
    courseCode: ''
  }
  editingIndex.value = course._index
  courseDialogTitle.value = '编辑课程'
  courseDialogVisible.value = true
}



// 修改删除方法
const handleRemove = async (row, weekKey) => {
  const course = row[weekKey]
  if (!course?.id) {
    ElMessage.error('无效的课程ID')
    return
  }

  try {
    await ElMessageBox.confirm(`确认删除 ${course.title} 吗？`, '警告')
    await delArrange(course.id)
    await fetchCourses() // 删除后刷新数据
    ElMessage.success('删除成功')
  } catch (error) {
    if (error !== 'cancel') ElMessage.error('删除失败')
  }
}

// 添加提交状态锁
const submitting = ref(false)


// 修改保存方法
const saveCourse = async () => {
  if (submitting.value) return
  submitting.value = true

  try {
    const payload = {
      ...currentCourse.value,
      cmCode: props.currentData.cmCode,
      coursmanageId: props.currentData.id,
      id: currentCourse.value.id // 携带编辑时的ID
    }

    const res = currentCourse.value.id 
      ? await updateArrange(payload)
      : await addArrange(payload)

    if (res.code === 200) {
      ElMessage.success('操作成功')
      await fetchCourses() // 子组件自行刷新数据
      courseDialogVisible.value = false // 立即关闭对话框
    }
  } finally {
    submitting.value = false
  }
}

const handleClose = () => {
  visible.value = false
}


/* 查询课程列表 */
const courseList = ref([]);
function getCourseList() {
  listCourse(loadAllParams).then(response => {
    courseList.value = response.rows;
  });
}

getCourseList();
</script>

<style scoped>
/* 添加加载状态样式 */
.course-cell {
  position: relative;
}
.loading-mask {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255,255,255,0.8);
  display: flex;
  align-items: center;
  justify-content: center;
}
.course-cell {
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.course-content {
  padding: 8px;
}

.empty-cell {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.cell-actions {
  margin-top: 8px;
  display: flex;
  justify-content: center;
  gap: 8px;
}

.el-table :deep(.el-table__cell) {
  padding: 0;
}

.el-table :deep(.el-table__cell .cell) {
  padding: 0;
  height: 100%;
}

/* 课表内字体样式 */
.course-cell {
  min-height: 20px;
  padding: 8px;
}

.course-content h4 {
  margin: 0 0 5px 0;
  font-size: 14px;
  color: #333;
}

.content-text {
  font-size: 12px;
  color: #666;
  margin-top: 5px;
}

.cell-actions {
  margin-top: 10px;
  text-align: center;
}
</style>