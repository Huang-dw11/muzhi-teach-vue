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

    <!-- <TimetableDialog 
  v-model="openTimetable"
  :title="课程表"
  :current-data="currentCoursemange"
  :events="courseData"
  @save="handleSaveCourse"
/> -->
<TimetableDialog 
  v-model="openTimetable"
  :title="'课程表'" 
  :current-data="currentCoursemange"
/>

  </div>
</template>

<script setup name="Coursmanage">
import { listCoursmanage, getCoursmanage, delCoursmanage, addCoursmanage, updateCoursmanage } from "@/api/teach/coursmanage";
import { loadAllParams } from "@/api/page";
import { listExpertise } from "@/api/teach/expertise";

import { ref, onMounted, watch } from 'vue'
import TimetableDialog from './TimetableDialog.vue'

import { listArrange,updateArrange , addArrange } from '@/api/teach/arrange' // 课表的数据

const courseData = ref([])

// 父组件只需保留这些核心逻辑
const currentCoursemange = ref({ 
  id: null,
  cmCode: '',
  expertiseCode: ''
});

const openTimetable = ref(false);

// 父组件index.vue
const handleTimetable = (row) => {
  currentCoursemange.value = {
    id: row.id,
    cmCode: row.code, // 保持字段名与子组件一致
    expertiseCode: row.expertiseCode
  };
  openTimetable.value = true;
};

// 新增当前课表引用
// const currentCoursemange = ref(null)

// // 修改后的loadCurrentCourses方法
// const loadCurrentCourses = async (params) => {
//   try {
//     const res = await listArrange({
//       cmCode: params.cmCode,
//       id: params.id
//     });
    
//     courseData.value = res.rows.map(item => ({
//       ...item,
//       cmCode: params.cmCode // 关联父级课表标识
//     }));
//   } catch (error) {
//     console.error('加载课程失败:', error);
//     courseData.value = [];
//   }
// }


// // 修改保存处理方法
// const handleSaveCourse = async (course) => {
//   try {
//     const payload = {
//       ...course,
//       cmCode: currentCoursemange.value.cmCode
//     }

//     if (course.id) {
//       await updateArrange(payload)
//     } else {
//       await addArrange(payload)
//     }
    
//     ElMessage.success('操作成功')
//     await loadCurrentCourses()
//   } catch (error) {
//     ElMessage.error('操作失败')
//     console.error('课程操作失败:', error)
//   }
// }

// // 对话框状态
// const openTimetable = ref(false);

// watch(openTimetable, (newVal) => {
//   if (!newVal) {
//     console.log('对话框已关闭')
//     // 可以在这里添加关闭后的逻辑
//   }
// })

// // 新增refresh事件处理
// const handleRefresh = async () => {
//   if (currentCoursemange.value?.id) {
//     await loadCourses(currentCoursemange.value.id)
//   }
// }

// // 修改打开课表方法
// /* 打开课表管理对话框 */
// function handleTimetable(row) {
//   // 传递整个行数据
//   currentCoursemange.value = { 
//     ...row,
//     cmCode: row.code,  // 确保包含必要字段
//     id: row.id
//   };
  
//   // 加载关联课程数据
//   loadCurrentCourses({ 
//     cmCode: row.code,
//     id: row.id 
//   });
  
//   openTimetable.value = true;
// }

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
