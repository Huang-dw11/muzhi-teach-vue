<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="所属院系" prop="collegeId">
        <el-input v-model="queryParams.collegeId" placeholder="请输入所属院系" clearable @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item label="所属专业" prop="expertiseId">
        <el-input v-model="queryParams.expertiseId" placeholder="请输入所属专业" clearable @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item label="班级编号" prop="classNumber">
        <el-input v-model="queryParams.classNumber" placeholder="请输入班级编号" clearable @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
        <el-button icon="Refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button type="primary" plain icon="Plus" @click="handleAdd" v-hasPermi="['teach:class:add']">新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="success" plain icon="Edit" :disabled="single" @click="handleUpdate"
          v-hasPermi="['teach:class:edit']">修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="danger" plain icon="Delete" :disabled="multiple" @click="handleDelete"
          v-hasPermi="['teach:class:remove']">删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="warning" plain icon="Download" @click="handleExport"
          v-hasPermi="['teach:class:export']">导出</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="classList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="序号" type="index" width="55" align="center" prop="id" />
      <el-table-column label="班级编号" align="center" prop="classNumber" />
      <!-- <el-table-column label="所属院系" align="center" prop="collegeId" /> -->
      <el-table-column label="所属院系" align="center" prop="collegeName" />
      <!-- <el-table-column label="所属专业" align="center" prop="expertiseId" /> -->
      <el-table-column label="所属专业" align="center" prop="expertiseName" />
      
      <el-table-column label="所属年级" align="center" prop="grade" width="180">
        <template #default="scope">
          <span>{{ parseTime(scope.row.grade, '{y}-{m}-{d}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="班级人数" align="center" prop="studentCount" />
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)"
            v-hasPermi="['teach:class:edit']">修改</el-button>
          <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)"
            v-hasPermi="['teach:class:remove']">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum"
      v-model:limit="queryParams.pageSize" @pagination="getList" />

    <!-- 添加或修改班级管理对话框 -->
    <el-dialog :title="title" v-model="open" width="500px" append-to-body>
      <el-form ref="classRef" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="所属院系" prop="collegeId">
          <el-select v-model="form.collegeId" placeholder="请输入所属院系" >
            <el-option 
            v-for="item in collegeList1"
            :key="item.id"
            :label="item.collegeName"
            :value="item.id"
            />
          </el-select>
        </el-form-item>

        <!-- <el-form-item label="所属院系" prop="collegeId" v-if="form.id != null">
          <el-input v-model="form.collegeId" placeholder="请输入所属院系ID" />
           {{  }}
        </el-form-item> -->
        <el-form-item label="班级编号" prop="classNumber"  v-if="form.id != null">
          {{ form.classNumber }}
        </el-form-item>
        <el-form-item label="所属专业" prop="expertiseId">
          <!-- <el-input v-model="form.expertiseId" placeholder="请输入所属专业ID" /> -->
          <el-select v-model="form.expertiseId" placeholder="请选择所属专业">
            <el-option v-for="item in expertiseList" :key="item.id" :label="item.expertiseName" :value="item.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="课程所属类型" prop="grade">
          <el-input v-model="form.grade" placeholder="本科为5，研究生为6" />
        </el-form-item>
        <el-form-item label="班级数量" prop="count" v-if="form.id == undefined">
            <el-input-number
            v-model="form.count"
            :min="1"
            :max="20"
            placeholder="请输入班级数量" 
            />
        </el-form-item>
        <el-form-item label="课程安排" prop="scheduleId">
          <el-input v-model="form.scheduleId" placeholder="请输入课程安排ID" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="submitForm">确 定</el-button>
          <el-button @click="cancel">取 消</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="Class">
import { listClass, getClass, delClass, addClass, updateClass } from "@/api/teach/class";
import { listExpertise } from "@/api/teach/expertise";
import { loadAllParams } from "@/api/page";
import { listCollege } from "@/api/teach/college";

const { proxy } = getCurrentInstance();

const classList = ref([]);
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
    collegeId: null,
    expertiseId: null,
    classNumber: null,
  },
  rules: {
    collegeId: [
      { required: true, message: "所属院系不能为空", trigger: "blur" }
    ],
    expertiseId: [
      { required: true, message: "所属专业不能为空", trigger: "blur" }
    ],
    classNumber: [
      { required: true, message: "班级编号不能为空", trigger: "blur" }
    ],
  }
});

const { queryParams, form, rules } = toRefs(data);

/** 查询班级管理列表 */
function getList() {
  loading.value = true;
  listClass(queryParams.value).then(response => {
    classList.value = response.rows;
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
    collegeId: null,
    expertiseId: null,
    classNumber: null,
    grade: null,
    studentCount: null,
    scheduleId: null,
    createTime: null,
    updateTime: null,
    createBy: null,
    updateBy: null
  };
  proxy.resetForm("classRef");
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
  title.value = "添加班级管理";
}

/** 修改按钮操作 */
function handleUpdate(row) {
  reset();
  const _id = row.id || ids.value
  getClass(_id).then(response => {
    form.value = response.data;
    open.value = true;
    title.value = "修改班级管理";
  });
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs["classRef"].validate(valid => {
    if (valid) {
      if (form.value.id != null) {
        updateClass(form.value).then(response => {
          proxy.$modal.msgSuccess("修改成功");
          open.value = false;
          getList();
        });
      } else {
        addClass(form.value).then(response => {
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
  proxy.$modal.confirm('是否确认删除班级管理编号为"' + _ids + '"的数据项？').then(function () {
    return delClass(_ids);
  }).then(() => {
    getList();
    proxy.$modal.msgSuccess("删除成功");
  }).catch(() => { });
}

/** 导出按钮操作 */
function handleExport() {
  proxy.download('teach/class/export', {
    ...queryParams.value
  }, `class_${new Date().getTime()}.xlsx`)
}

/* 查询专业列表 */
const expertiseList = ref([]);
function getExpertiseList() {
  listExpertise(loadAllParams).then(response => {
    expertiseList.value = response.rows;
    console.log('专业列表信息:', expertiseList.value); // 打印专业列表信息
  });
}

/* 查询院系列表 */
const collegeList1 = ref([]);
function getCollegeList() {
  listCollege(loadAllParams).then(response => {
    collegeList1.value = response.rows;
  });
}

getCollegeList();
getExpertiseList();
getList();
</script>
