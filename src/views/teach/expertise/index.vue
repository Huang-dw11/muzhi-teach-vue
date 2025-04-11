<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="专业名称" prop="expertiseName">
        <el-input
          v-model="queryParams.expertiseName"
          placeholder="请输入专业名称"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="所属院系" prop="collegeId">
        <el-input
          v-model="queryParams.collegeId"
          placeholder="请输入所属院系"
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
          v-hasPermi="['teach:expertise:add']"
        >新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          plain
          icon="Edit"
          :disabled="single"
          @click="handleUpdate"
          v-hasPermi="['teach:expertise:edit']"
        >修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          plain
          icon="Delete"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['teach:expertise:remove']"
        >删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="Download"
          @click="handleExport"
          v-hasPermi="['teach:expertise:export']"
        >导出</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="expertiseList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="序号" type="index" align="center" prop="id" />
      <el-table-column label="专业编码" align="center" prop="expertiseCode" />
      <el-table-column label="专业名称" align="center" prop="expertiseName" />
      <el-table-column label="学院名称" align="center" prop="collegeName" />
      <el-table-column label="培养层次" align="center" prop="educationLevel">
        <template #default="scope">
          <dict-tag :options="education_level" :value="scope.row.educationLevel"/>
        </template>
      </el-table-column>
      <el-table-column label="学位授予类型" align="center" prop="degreeType">
        <template #default="scope">
          <dict-tag :options="college_type" :value="scope.row.degreeType"/>
        </template>
      </el-table-column>
      <!-- <el-table-column label="门类、专业类" align="center" prop="categoryId" /> -->
      <el-table-column label="门类、专业类" align="center" prop="categoryName" />
      <el-table-column label="学制" align="center" prop="duration" />
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['teach:expertise:edit']">修改</el-button>
          <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['teach:expertise:remove']">删除</el-button>
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

    <!-- 添加或修改专业管理对话框 -->
    <el-dialog :title="title" v-model="open" width="500px" append-to-body>
      <el-form ref="expertiseRef" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="专业编码" prop="expertiseCode" >
          <el-input v-model="form.expertiseCode" placeholder="请输入专业编码" />
        </el-form-item>
        <el-form-item label="专业名称" prop="expertiseName" >
          <el-input v-model="form.expertiseName" placeholder="请输入专业名称" />
        </el-form-item>
        <el-form-item label="所属院系" prop="collegeId">
          <!-- <el-input v-model="form.collegeId" placeholder="请输入所属院系" /> -->
           <el-select v-model="form.collegeId" placeholder="请选择所属院系">
            <el-option
              v-for="item in collegeList2"
              :key="item.id" 
              :label="item.collegeName" 
              :value="item.id"
              />
            </el-select>
        </el-form-item>
        <!-- <el-form-item label="培养层次" prop="educationLevel">
          <el-select v-model="form.educationLevel" placeholder="请选择培养层次">
            <el-option
              v-for="dict in education_level"
              :key="dict.value"
              :label="dict.label"
              :value="parseInt(dict.value)"
            ></el-option>
          </el-select>
        </el-form-item> -->
        <!-- <el-form-item label="学位授予类型" prop="degreeType">
          <el-select v-model="form.degreeType" placeholder="请选择学位授予类型">
            <el-option
              v-for="dict in college_type"
              :key="dict.value"
              :label="dict.label"
              :value="parseInt(dict.value)"
            ></el-option>
          </el-select>
        </el-form-item> -->
        <!-- <el-form-item label="门类、专业类" prop="categoryId">
          <el-input v-model="form.categoryId" placeholder="请输入门类、专业类" />
        </el-form-item> -->
        <!-- <el-form-item label="学制" prop="duration">
          <el-input v-model="form.duration" placeholder="请输入学制" />
        </el-form-item>
        <el-form-item label="专业介绍" prop="introduction">
          <el-input v-model="form.introduction" type="textarea" placeholder="请输入内容" />
        </el-form-item> -->
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

<script setup name="Expertise">
import { listExpertise, getExpertise, delExpertise, addExpertise, updateExpertise } from "@/api/teach/expertise";
import { loadAllParams } from "@/api/page";
import { listCollege } from "@/api/teach/college";
import { listCategory } from "@/api/teach/category"

const { proxy } = getCurrentInstance();
const { college_type, education_level } = proxy.useDict('college_type', 'education_level');

const expertiseList = ref([]);
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
    expertiseName: null,
    collegeId: null,
  },
  rules: {
    expertiseCode: [
      { required: true, message: "专业编码不能为空", trigger: "blur" }
    ],
    expertiseName: [
      { required: true, message: "专业名称不能为空", trigger: "blur" }
    ],
    collegeId: [
      { required: true, message: "所属院系不能为空", trigger: "blur" }
    ],
  }
});

const { queryParams, form, rules } = toRefs(data);

/** 查询专业管理列表 */
function getList() {
  loading.value = true;
  listExpertise(queryParams.value).then(response => {
    expertiseList.value = response.rows;
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
    expertiseCode: null,
    expertiseName: null,
    collegeId: null,
    collegeName: null,
    educationLevel: null,
    degreeType: null,
    categoryId: null,
    duration: null,
    introduction: null,
    createTime: null,
    updateTime: null,
    createBy: null,
    updateBy: null
  };
  proxy.resetForm("expertiseRef");
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
  title.value = "添加专业管理";
}

/** 修改按钮操作 */
function handleUpdate(row) {
  reset();
  const _id = row.id || ids.value
  getExpertise(_id).then(response => {
    form.value = response.data;
    open.value = true;
    title.value = "修改专业管理";
  });
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs["expertiseRef"].validate(valid => {
    if (valid) {
      if (form.value.id != null) {
        updateExpertise(form.value).then(response => {
          proxy.$modal.msgSuccess("修改成功");
          open.value = false;
          getList();
        });
      } else {
        addExpertise(form.value).then(response => {
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
  proxy.$modal.confirm('是否确认删除专业管理编号为"' + _ids + '"的数据项？').then(function() {
    return delExpertise(_ids);
  }).then(() => {
    getList();
    proxy.$modal.msgSuccess("删除成功");
  }).catch(() => {});
}

/** 导出按钮操作 */
function handleExport() {
  proxy.download('teach/expertise/export', {
    ...queryParams.value
  }, `expertise_${new Date().getTime()}.xlsx`)
}

/* 查询院系列表 */
const collegeList2 = ref([]);
function getCollegeList() {
  listCollege(loadAllParams).then(response => {
    collegeList2.value = response.rows;
  });
}

getCollegeList();
getList();
</script>
