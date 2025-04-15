<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="课表编号" prop="code">
        <el-input
          v-model="queryParams.code"
          placeholder="请输入课表编号"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="适用专业编码" prop="expertiseCode">
        <el-input
          v-model="queryParams.expertiseCode"
          placeholder="请输入适用专业编码"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
        <el-button icon="Refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
          type="primary"
          plain
          icon="Plus"
          @click="handleAdd"
          v-hasPermi="['teach:coursmanage:add']"
        >新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          plain
          icon="Edit"
          :disabled="single"
          @click="handleUpdate"
          v-hasPermi="['teach:coursmanage:edit']"
        >修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          plain
          icon="Delete"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['teach:coursmanage:remove']"
        >删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="Download"
          @click="handleExport"
          v-hasPermi="['teach:coursmanage:export']"
        >导出</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="coursmanageList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="主键ID" align="center" prop="id" />
      <el-table-column label="课表编号" align="center" prop="code" />
      <el-table-column label="课表状态" align="center" prop="status">
        <template #default="scope">
          <dict-tag :options="sys_normal_disable" :value="scope.row.status"/>
        </template>
      </el-table-column>
      <el-table-column label="适用专业名称" align="center" prop="expertiseName" />
      <el-table-column label="适用学期" align="center" prop="semester" />
      <el-table-column label="创建时间" align="center" prop="createTime" width="180">
        <template #default="scope">
          <span>{{ parseTime(scope.row.createTime, '{y}-{m}-{d}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button link type="primary" icon="Edit" @click="handleTimetable(scope.row)" v-hasPermi="['teach:coursmanage:edit']">打开课表</el-button>
          <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['teach:coursmanage:edit']">修改</el-button>
          <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['teach:coursmanage:remove']">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    
    <pagination
      v-show="total>0"
      :total="total"
      v-model:page="queryParams.pageNum"
      v-model:limit="queryParams.pageSize"
      @pagination="getList"
    />

    <!-- 添加或修改课表管理对话框 -->
    <el-dialog :title="title" v-model="open" width="500px" append-to-body>
      <el-form ref="coursmanageRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="课表编号" prop="code">
          <el-input v-model="form.code" placeholder="请输入课表编号" />
        </el-form-item>
        <el-form-item label="适用专业" prop="expertiseCode">
          <!-- <el-input v-model="form.expertiseCode" placeholder="请选择适用专业" > -->
            <el-select v-model="form.expertiseCode" placeholder="请选择适用专业">
            <el-option
              v-for="item in expertiseList"
              :key="item.expertiseCode"
              :label="item.expertiseName"
              :value="`${item.expertiseCode},${item.expertiseName}`"
            />
           </el-select>
        </el-form-item>
        <el-form-item label="适用学期" prop="semester">
          <el-input v-model="form.semester" placeholder="请输入适用学期" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="submitForm">确 定</el-button>
          <el-button @click="cancel">取 消</el-button>
        </div>
      </template>
    </el-dialog>

    <TimetableDialog 
      v-model="openTimetable"
      :title="我的课程表"
      :events="courseEvents"
    />

  </div>
</template>

<script setup name="Coursmanage">
import { listCoursmanage, getCoursmanage, delCoursmanage, addCoursmanage, updateCoursmanage } from "@/api/teach/coursmanage";
import { loadAllParams } from "@/api/page";
import { listExpertise } from "@/api/teach/expertise";

import { ref, onMounted } from 'vue'
import TimetableDialog from './TimetableDialog.vue'
import { watch } from 'vue'

// 对话框状态
const openTimetable = ref(false);
// 课程数据
const courseEvents = ref([])

// 初始化数据
onMounted(async () => {
  try {
    const res = await listCoursmanage(loadAllParams)
    courseEvents.value = res.rows.map(item => ({
      // 根据实际接口字段转换
      weekday: item.weekday,
      courseName: item.courseName,
      content: item.content,
      start: item.start,
      end: item.end
    }))
  } catch (error) {
    console.error('数据加载失败:', error)
  }
})

watch(openTimetable, (newVal) => {
  if (!newVal) {
    console.log('对话框已关闭')
    // 可以在这里添加关闭后的逻辑
  }
})

const { proxy } = getCurrentInstance();
const { sys_normal_disable } = proxy.useDict('sys_normal_disable');

const coursmanageList = ref([]);
const open = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);
const title = ref("");


const data = reactive({
  form: {},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    code: null,
    expertiseCode: null,
  },
  rules: {
    code: [
      { required: true, message: "课表编号不能为空", trigger: "blur" }
    ],
    status: [
      { required: true, message: "课表状态不能为空", trigger: "change" }
    ],
    expertiseCode: [
      { required: true, message: "适用专业编码不能为空", trigger: "blur" }
    ],
    expertiseName: [
      { required: true, message: "适用专业名称不能为空", trigger: "blur" }
    ],
  }
});

const { queryParams, form, rules } = toRefs(data);

/** 查询课表管理列表 */
function getList() {
  loading.value = true;
  listCoursmanage(queryParams.value).then(response => {
    coursmanageList.value = response.rows;
    total.value = response.total;
    loading.value = false;
  });
}

// 取消按钮
function cancel() {
  open.value = false;
  reset();
}

// 表单重置
function reset() {
  form.value = {
    id: null,
    code: null,
    status: null,
    expertiseCode: null,
    expertiseName: null,
    semester: null,
    createTime: null,
    updateTime: null,
    createBy: null,
    updateBy: null
  };
  proxy.resetForm("coursmanageRef");
}

/** 搜索按钮操作 */
function handleQuery() {
  queryParams.value.pageNum = 1;
  getList();
}

/** 重置按钮操作 */
function resetQuery() {
  proxy.resetForm("queryRef");
  handleQuery();
}

// 多选框选中数据
function handleSelectionChange(selection) {
  ids.value = selection.map(item => item.id);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
}

/** 新增按钮操作 */
function handleAdd() {
  reset();
  open.value = true;
  title.value = "添加课表管理";
}

/** 修改按钮操作 */
function handleUpdate(row) {
  reset();
  const _id = row.id || ids.value
  getCoursmanage(_id).then(response => {
    form.value = response.data;
    open.value = true;
    title.value = "修改课表管理";
  });
}

/* 打开课表管理对话框 */
function handleTimetable(row) {
  openTimetable.value = true;
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs["coursmanageRef"].validate(valid => {
    if (valid) {
      if (form.value.id != null) {
        updateCoursmanage(form.value).then(response => {
          proxy.$modal.msgSuccess("修改成功");
          open.value = false;
          getList();
        });
      } else {
        addCoursmanage(form.value).then(response => {
          proxy.$modal.msgSuccess("新增成功");
          open.value = false;
          getList();
        });
      }
    }
  });
}

/** 删除按钮操作 */
function handleDelete(row) {
  const _ids = row.id || ids.value;
  proxy.$modal.confirm('是否确认删除课表管理编号为"' + _ids + '"的数据项？').then(function() {
    return delCoursmanage(_ids);
  }).then(() => {
    getList();
    proxy.$modal.msgSuccess("删除成功");
  }).catch(() => {});
}

/** 导出按钮操作 */
function handleExport() {
  proxy.download('teach/coursmanage/export', {
    ...queryParams.value
  }, `coursmanage_${new Date().getTime()}.xlsx`)
}

/* 查询专业列表 */
const expertiseList = ref([]);
function getExpertiseList() {
  listExpertise(loadAllParams).then(response => {
    expertiseList.value = response.rows;
  });
}

getExpertiseList();
getList();

</script>

<!-- 课程表相关 -->
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