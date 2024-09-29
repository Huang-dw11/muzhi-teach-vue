<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="课程编码" prop="courseCode">
        <el-input
          v-model="queryParams.courseCode"
          placeholder="请输入课程编码"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="课程名称" prop="courseName">
        <el-input
          v-model="queryParams.courseName"
          placeholder="请输入课程名称"
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
          v-hasPermi="['teach:course:add']"
        >新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          plain
          icon="Edit"
          :disabled="single"
          @click="handleUpdate"
          v-hasPermi="['teach:course:edit']"
        >修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          plain
          icon="Delete"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['teach:course:remove']"
        >删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="Download"
          @click="handleExport"
          v-hasPermi="['teach:course:export']"
        >导出</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="courseList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="主键ID" align="center" prop="id" />
      <el-table-column label="课程编码" align="center" prop="courseCode" />
      <el-table-column label="开课学院" align="center">
      <template #default="{ row }">
        {{ getCollegeName(row.collegeId) }}
      </template>
      </el-table-column>
      <el-table-column label="课程名称" align="center" prop="courseName" />
      <el-table-column label="课程类型" align="center" prop="courseType">
        <template #default="scope">
          <dict-tag :options="course_type" :value="scope.row.courseType"/>
        </template>
      </el-table-column>
      <el-table-column label="学分" align="center" prop="credit" />
      <el-table-column label="学时" align="center" prop="classHours" />
      <!-- <el-table-column label="授课对象" align="center" prop="targetStudents" /> -->
      <!-- <el-table-column label="考核方式" align="center" prop="assessmentMethods" /> -->
      <el-table-column label="最后操作时间" align="center" prop="updateTime" width="180">
        <template #default="scope">
          <span>{{ parseTime(scope.row.updateTime, '{y}-{m}-{d} {h}:{m}:{s}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['teach:course:edit']">修改</el-button>
          <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['teach:course:remove']">删除</el-button>
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

    <!-- 添加或修改课程管理对话框 -->
    <el-dialog :title="title" v-model="open" width="500px" append-to-body>
      <el-form ref="courseRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="课程编码" prop="courseCode" v-if="form.id != undefined">
          <el-input v-model="form.courseCode" placeholder="请输入课程编码" />
        </el-form-item>
        <el-form-item label="课程名称" prop="courseName">
          <el-input v-model="form.courseName" placeholder="请输入课程名称" />
        </el-form-item>
        <el-form-item label="所属院系" prop="collegeId">
           <el-select v-model="form.collegeId" placeholder="请选择所属院系">
            <el-option
              v-for="item in collegeList2"
              :key="item.collegeCode" 
              :label="item.collegeName" 
              :value="item.collegeCode"
              />
            </el-select>
        </el-form-item>
        <el-form-item label="课程类型" prop="courseType">
          <el-select v-model="form.courseType" placeholder="请选择课程类型">
            <el-option
              v-for="dict in course_type"
              :key="dict.value"
              :label="dict.label"
              :value="parseInt(dict.value)"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="学分" prop="credit">
          <el-input v-model="form.credit" placeholder="请输入学分" />
        </el-form-item>
        <el-form-item label="学时" prop="classHours">
          <el-input v-model="form.classHours" placeholder="请输入学时" />
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

<script setup name="Course">
import { listCourse, getCourse, delCourse, addCourse, updateCourse } from "@/api/teach/course";
import { loadAllParams } from "@/api/page";
import { listCollege } from "@/api/teach/college";

const { proxy } = getCurrentInstance();
const { course_type } = proxy.useDict('course_type');

const courseList = ref([]);
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
    courseCode: null,
    collegeId: null,
    courseName: null,
  },
  rules: {
    courseCode: [
      { required: true, message: "课程编码不能为空", trigger: "blur" }
    ],
    collegeId: [
      { required: true, message: "开课学院不能为空", trigger: "change" }
    ],
    courseName: [
      { required: true, message: "课程名称不能为空", trigger: "blur" }
    ],
    courseType: [
      { required: true, message: "课程类型不能为空", trigger: "change" }
    ],
    credit: [
      { required: true, message: "学分不能为空", trigger: "blur" }
    ],
    classHours: [
      { required: true, message: "学时不能为空", trigger: "blur" }
    ],
  }
});

const { queryParams, form, rules } = toRefs(data);

/** 查询课程管理列表 */
function getList() {
  loading.value = true;
  listCourse(queryParams.value).then(response => {
    courseList.value = response.rows;
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
    courseCode: null,
    collegeId: null,
    courseName: null,
    courseType: null,
    credit: null,
    classHours: null,
    targetStudents: null,
    assessmentMethods: null,
    createTime: null,
    updateTime: null,
    createBy: null,
    updateBy: null,
    remark: null
  };
  proxy.resetForm("courseRef");
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
  title.value = "添加课程管理";
}

/** 修改按钮操作 */
function handleUpdate(row) {
  reset();
  const _id = row.id || ids.value
  getCourse(_id).then(response => {
    form.value = response.data;
    open.value = true;
    title.value = "修改课程管理";
  });
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs["courseRef"].validate(valid => {
    if (valid) {
      if (form.value.id != null) {
        updateCourse(form.value).then(response => {
          proxy.$modal.msgSuccess("修改成功");
          open.value = false;
          getList();
        });
      } else {
        addCourse(form.value).then(response => {
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
  proxy.$modal.confirm('是否确认删除课程管理编号为"' + _ids + '"的数据项？').then(function() {
    return delCourse(_ids);
  }).then(() => {
    getList();
    proxy.$modal.msgSuccess("删除成功");
  }).catch(() => {});
}

/** 导出按钮操作 */
function handleExport() {
  proxy.download('teach/course/export', {
    ...queryParams.value
  }, `course_${new Date().getTime()}.xlsx`)
}

/* 查询院系列表 */
const collegeList2 = ref([]);
function getCollegeList() {
  listCollege(loadAllParams).then(response => {
    collegeList2.value = response.rows;
  });
}

// 根据 collegeId 匹配 collegeCode 获取名称
const getCollegeName = (collegeId) => {
  const college = collegeList2.value.find(item => item.collegeCode === String(collegeId));
  return college ? college.collegeName : '未知学院'; // 避免 undefined
};

getCollegeList();
getList();
</script>
