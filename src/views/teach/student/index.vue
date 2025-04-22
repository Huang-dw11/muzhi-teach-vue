<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="学号" prop="studentCode">
        <el-input
          v-model="queryParams.studentCode"
          placeholder="请输入学号"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="学院代码" prop="collegeCode">
        <el-input
          v-model="queryParams.collegeCode"
          placeholder="请输入学院代码"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="专业代码" prop="expertiseCode">
        <el-input
          v-model="queryParams.expertiseCode"
          placeholder="请输入专业代码"
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
          v-hasPermi="['teach:student:add']"
        >新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          plain
          icon="Edit"
          :disabled="single"
          @click="handleUpdate"
          v-hasPermi="['teach:student:edit']"
        >修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          plain
          icon="Delete"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['teach:student:remove']"
        >删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="Download"
          @click="handleExport"
          v-hasPermi="['teach:student:export']"
        >导出</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="studentList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="主键ID" align="center" prop="id" />
      <el-table-column label="班级" align="center" prop="classNumber" />
      <el-table-column label="学生照片" align="center" prop="avatar" width="100">
        <template #default="scope">
          <image-preview :src="scope.row.avatar" :width="50" :height="50"/>
        </template>
      </el-table-column>
      <el-table-column label="学号" align="center" prop="studentCode" />
      <el-table-column label="学生姓名" align="center" prop="studentName" />
      <el-table-column label="性别" align="center" prop="sex">
        <template #default="scope">
          <dict-tag :options="sys_user_sex" :value="scope.row.sex"/>
        </template>
      </el-table-column>
      <el-table-column label="入学时间" align="center" prop="entranceDate" width="180">
        <template #default="scope">
          <span>{{ parseTime(scope.row.entranceDate, '{y}-{m}-{d}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="学院名称" align="center" prop="collegeName" />
      <el-table-column label="专业名称" align="center" prop="expertiseName" />
      <el-table-column label="身份证号" align="center" prop="idCard" />
      <el-table-column label="联系方式" align="center" prop="contact" />
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['teach:student:edit']">修改</el-button>
          <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['teach:student:remove']">删除</el-button>
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

    <!-- 添加或修改学生信息对话框 -->
    <el-dialog :title="title" v-model="open" width="500px" append-to-body>
      <el-form ref="studentRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="班级" prop="classNumber">
          <!-- <el-input v-model="form.classNumber" placeholder="请输入班级" /> -->
          <el-select v-model="form.classNumber" placeholder="请选择班级">
            <el-option
              v-for="item in classList"
              :key="item.classNumber"
              :label="item.className"
              :value="`${item.classNumber},${item.expertiseId}`"
              />
          </el-select>
        </el-form-item>
        <el-form-item label="学生照片" prop="avatar">
          <image-upload v-model="form.avatar"/>
        </el-form-item>
        <el-form-item label="学生姓名" prop="studentName">
          <el-input v-model="form.studentName" placeholder="请输入学生姓名" />
        </el-form-item>
        <el-form-item label="性别" prop="sex">
          <el-select v-model="form.sex" placeholder="请选择性别">
            <el-option
              v-for="dict in sys_user_sex"
              :key="dict.value"
              :label="dict.label"
              :value="dict.value"
            ></el-option>
          </el-select>
        </el-form-item>
        <!-- <el-form-item label="入学时间" prop="entranceDate">
          <el-date-picker clearable
            v-model="form.entranceDate"
            type="date"
            value-format="YYYY-MM-DD"
            placeholder="请选择入学时间">
          </el-date-picker>
        </el-form-item> -->
        <!-- <el-form-item label="学院代码" prop="collegeCode">
          <el-input v-model="form.collegeCode" placeholder="请输入学院代码" />
        </el-form-item>
        <el-form-item label="专业代码" prop="expertiseCode">
          <el-input v-model="form.expertiseCode" placeholder="请输入专业代码" />
        </el-form-item> -->
        <el-form-item label="身份证号" prop="idCard">
          <el-input v-model="form.idCard" placeholder="请输入身份证号" />
        </el-form-item>
        <el-form-item label="联系方式" prop="contact">
          <el-input v-model="form.contact" placeholder="请输入联系方式" />
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

<script setup name="Student">
import { listStudent, getStudent, delStudent, addStudent, updateStudent } from "@/api/teach/student";
import { listClass } from "@/api/teach/class";
import { loadAllParams } from "@/api/page";

const { proxy } = getCurrentInstance();
const { sys_user_sex } = proxy.useDict('sys_user_sex');

const studentList = ref([]);
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
    studentCode: null,
    collegeCode: null,
    expertiseCode: null,
  },
  rules: {
    classNumber: [
      { required: true, message: "班级不能为空", trigger: "blur" }
    ],
    studentName: [
      { required: true, message: "学生姓名不能为空", trigger: "blur" }
    ],
    sex: [
      { required: true, message: "性别不能为空", trigger: "change" }
    ],
    idCard: [
      { required: true, message: "身份证号不能为空", trigger: "blur" }
    ],
    contact: [
      { required: true, message: "联系方式不能为空", trigger: "blur" }
    ],
  }
});

const { queryParams, form, rules } = toRefs(data);

/** 查询学生信息列表 */
function getList() {
  loading.value = true;
  listStudent(queryParams.value).then(response => {
    studentList.value = response.rows;
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
    classNumber: null,
    avatar: null,
    userId: null,
    userName: null,
    password: null,
    studentCode: null,
    studentName: null,
    sex: null,
    entranceDate: null,
    collegeCode: null,
    collegeName: null,
    expertiseCode: null,
    expertiseName: null,
    idCard: null,
    contact: null,
    publicRequiredCredit: null,
    majorRequiredCredit: null,
    majorElectiveCredit: null,
    publicElectiveCredit: null,
    createTime: null,
    dateTime: null,
    createBy: null,
    updateBy: null
  };
  proxy.resetForm("studentRef");
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
  title.value = "添加学生信息";
}

/** 修改按钮操作 */
function handleUpdate(row) {
  reset();
  const _id = row.id || ids.value
  getStudent(_id).then(response => {
    form.value = response.data;
    open.value = true;
    title.value = "修改学生信息";
  });
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs["studentRef"].validate(valid => {
    if (valid) {
      if (form.value.id != null) {
        updateStudent(form.value).then(response => {
          proxy.$modal.msgSuccess("修改成功");
          open.value = false;
          getList();
        });
      } else {
        addStudent(form.value).then(response => {
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
  proxy.$modal.confirm('是否确认删除学生信息编号为"' + _ids + '"的数据项？').then(function() {
    return delStudent(_ids);
  }).then(() => {
    getList();
    proxy.$modal.msgSuccess("删除成功");
  }).catch(() => {});
}

/** 导出按钮操作 */
function handleExport() {
  proxy.download('teach/student/export', {
    ...queryParams.value
  }, `student_${new Date().getTime()}.xlsx`)
}

/* 获取班级数据 */
const classList = ref([]);
function getClassData() {
  listClass().then(response => {
    classList.value = response.rows;
  }); 
}

getClassData();
getList();
</script>
