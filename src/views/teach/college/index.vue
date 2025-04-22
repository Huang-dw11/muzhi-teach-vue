<template>
  <div class="app-container">
    <el-space 
      wrap
      :fill= "1"
      :size="10"
      :fill-ratio="fillRatio"
      :direction="vertical"
      style="width: 100%; justify-content: center; align-items: center"
      align-items: stretch
      >
      
      <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="68px">
        
        <el-card class="box-card" style="width: 100%;">
          <el-form-item label="学院代码" prop="collegeCode">
            <el-input
              v-model="queryParams.collegeCode"
              placeholder="请输入学院代码"
              clearable
              @keyup.enter="handleQuery"
            />
          </el-form-item>
          <el-form-item label="学院名称" prop="collegeName">
            <el-input
              v-model="queryParams.collegeName"
              placeholder="请输入学院名称"
              clearable
              @keyup.enter="handleQuery"
            />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" icon="Search" round @click="handleQuery">搜索</el-button>
            <el-button icon="Refresh" round @click="resetQuery">重置</el-button>
          </el-form-item>
        </el-card>

      </el-form>
    
      <el-card class="box-card" style="flex: 1; min-width: 100%">
        <el-row :gutter="10" class="mb8">
          <el-col :span="1.5">
            <el-button
              type="primary"
              
              icon="Plus"
              @click="handleAdd"
              v-hasPermi="['teach:college:add']"
            >新增</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button
              type="success"
              
              icon="Edit"
              :disabled="single"
              @click="handleUpdate"
              v-hasPermi="['teach:college:edit']"
            >修改</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button
              type="danger"
              
              icon="Delete"
              :disabled="multiple"
              @click="handleDelete"
              v-hasPermi="['teach:college:remove']"
            >删除</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button
              type="warning"
              
              icon="Download"
              @click="handleExport"
              v-hasPermi="['teach:college:export']"
            >导出</el-button>
          </el-col>
          <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
        </el-row>
      
        <el-table v-loading="loading" :data="collegeList" @selection-change="handleSelectionChange">
          <el-table-column type="selection" width="55" align="center" />
          <el-table-column label="序号" type="index" width="60" align="center" prop="id" />
          <el-table-column label="学院代码" align="center" prop="collegeCode" />
          <el-table-column label="学院名称" align="center" prop="collegeName" />
          <el-table-column label="隶属关系" align="center" prop="affiliation">
            <template #default="scope">
              <dict-tag :options="affiliation" :value="scope.row.affiliation"/>
            </template>
          </el-table-column>
          <el-table-column label="学院性质" align="center" prop="collegeType">
            <template #default="scope">
              <dict-tag :options="college_type" :value="scope.row.collegeType"/>
            </template>
          </el-table-column>
          <el-table-column label="成立时间" align="center" prop="createTime" width="180">
            <template #default="scope">
              <span>{{ parseTime(scope.row.createTime, '{y}-{m}-{d} {h}:{m}:{s}') }}</span>
            </template>
          </el-table-column>
          <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
            <template #default="scope">
              <el-button class="compact-button" color="#626aef" :dark="isDark" icon="Edit"  @click="getParnterInfo(scope.row)" v-hasPermi="['teach:college:query']">详情</el-button>
              <el-button class="compact-button" color="#5E9C45" :dark="isDark" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['teach:college:edit']">修改</el-button>
              <el-button class="compact-button" color="#CB4949" :dark="isDark" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['teach:college:remove']">删除</el-button>
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
      
      </el-card>
    </el-space>
    
        <!-- 添加或修改学院管理对话框 -->
      <el-dialog :title="title" v-model="open" width="500px" append-to-body>
        <el-form ref="collegeRef" :model="form" :rules="rules" label-width="80px">
            <el-form-item label="学院代码" prop="collegeCode" v-if="form.id == null">
              <el-input v-model="form.collegeCode" placeholder="请输入学院代码" />
            </el-form-item>
            <el-form-item label="学院名称" prop="collegeName">
              <el-input v-model="form.collegeName" placeholder="请输入学院名称" />
            </el-form-item>
            <el-form-item label="隶属关系" prop="affiliation">
              <el-select v-model="form.affiliation" placeholder="请选择隶属关系">
                <el-option
                  v-for="dict in affiliation"
                  :key="dict.value"
                  :label="dict.label"
                  :value="dict.value"
                ></el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="学院性质" prop="collegeType">
              <el-select v-model="form.collegeType" placeholder="请选择学院性质">
                <el-option
                  v-for="dict in college_type"
                  :key="dict.value"
                  :label="dict.label"
                  :value="dict.value"
                ></el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="学院介绍" prop="introduction">
              <el-input v-model="form.introduction" type="textarea" placeholder="请输入内容" />
            </el-form-item>
            </el-form>
            <template #footer>
            <div class="dialog-footer">
              <el-button type="primary" @click="submitForm">确 定</el-button>
              <el-button @click="cancel">取 消</el-button>
            </div>
          </template>
        </el-dialog>
      
        <!-- 查看学院详情对话框 -->
    <el-dialog title="学院详情" v-model="partnerInfoOpen" width="500px" append-to-body>
      <el-row :gutter="20" style="margin-bottom: 10px;">
        <el-col :span="12">
          <div class="detail-item">
            <span class="detail-label">学院代码：</span>
            <span class="detail-value">{{ form.collegeCode || '暂无数据' }}</span>
          </div>
        </el-col>
        <el-col :span="12">
          <div class="detail-item">
            <span class="detail-label">学院名称：</span>
            <span class="detail-value">{{ form.collegeName || '暂无数据' }}</span>
          </div>
        </el-col>
      </el-row>
      <el-row :gutter="20" style="margin-bottom: 10px;">
        <el-col :span="12">
          <div class="detail-item">
            <span class="detail-label">隶属关系：</span>
            <span class="detail-value">{{ form.affiliation || '暂无数据' }}</span>
          </div>
        </el-col>
        <el-col :span="12">
          <div class="detail-item">
            <span class="detail-label">成立时间：</span>
            <span class="detail-value">{{ form.createTime || '暂无数据' }}</span>
          </div>
        </el-col>
      </el-row>
      <el-row :gutter="20">
        <el-col :span="24">
          <div class="detail-item">
            <span class="detail-label">学院介绍：</span>
            <span class="detail-value">{{ form.introduction || '暂无数据' }}</span>
          </div>
        </el-col>
      </el-row>
    </el-dialog>
  </div>
</template>

<script setup name="College">
import { listCollege, getCollege, delCollege, addCollege, updateCollege } from "@/api/teach/college";
// import { isDark } from '~/composables/dark'

const { proxy } = getCurrentInstance();
const { college_type, affiliation } = proxy.useDict('college_type', 'affiliation');

const collegeList = ref([]);
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
    collegeCode: null,
    collegeName: null,
  },
  rules: {
    collegeCode: [
      { required: true, message: "学院代码不能为空", trigger: "blur" }
    ],
    collegeName: [
      { required: true, message: "学院名称不能为空", trigger: "blur" }
    ],
    affiliation: [
      { required: true, message: "隶属关系不能为空", trigger: "change" }
    ],
    collegeType: [
      { required: true, message: "学院性质不能为空", trigger: "change" }
    ],
  }
});

const { queryParams, form, rules } = toRefs(data);

/** 查询学院管理列表 */
function getList() {
  loading.value = true;
  listCollege(queryParams.value).then(response => {
    collegeList.value = response.rows;
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
    collegeCode: null,
    collegeName: null,
    affiliation: null,
    collegeType: null,
    introduction: null,
    createTime: null,
    updateTime: null,
    createBy: null,
    updateBy: null,
    remark: null
  };
  proxy.resetForm("collegeRef");
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
  title.value = "添加学院管理";
}

/** 修改按钮操作 */
function handleUpdate(row) {
  reset();
  const _id = row.id || ids.value
  getCollege(_id).then(response => {
    form.value = response.data;
    open.value = true;
    title.value = "修改学院管理";
  });
}

/** 查看学院详情 */
const partnerInfoOpen=ref(false);
function getParnterInfo(row){
  reset();
  const _id = row.id
  getCollege(_id).then(response => {
    form.value = response.data;
    partnerInfoOpen.value = true;
  });
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs["collegeRef"].validate(valid => {
    if (valid) {
      if (form.value.id != null) {
        updateCollege(form.value).then(response => {
          proxy.$modal.msgSuccess("修改成功");
          open.value = false;
          getList();
        });
      } else {
        addCollege(form.value).then(response => {
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
  proxy.$modal.confirm('是否确认删除学院管理编号为"' + _ids + '"的数据项？').then(function() {
    return delCollege(_ids);
  }).then(() => {
    getList();
    proxy.$modal.msgSuccess("删除成功");
  }).catch(() => {});
}

/** 导出按钮操作 */
function handleExport() {
  proxy.download('teach/college/export', {
    ...queryParams.value
  }, `college_${new Date().getTime()}.xlsx`)
}

getList();
</script>

<style scoped>
/* 修正后的样式 */
.compact-button {
  /* 布局控制 */
  padding: 12px 4px;
  height: 24px;       /* 推荐使用偶数像素 */
  min-width: 60px;    /* 更合理的默认最小宽度 */
  
  /* 文字样式 */
  font-size: 12px;
  font-weight: 400;   /* 100 过细可能显示不全 */

  /* 图标间距修正 */
  gap: 0 !important;  /* 现代浏览器间距控制 */
}

/* 精准消除图标间距 */
.compact-button:deep(.el-icon) {
  margin-right: 0 !important;
}

/* 保持不同状态的间距一致性 */
.compact-button:hover:deep(.el-icon),
.compact-button:active:deep(.el-icon) {
  margin-right: 0 !important;
}

/* 垂直居中优化 */
.compact-button {
  display: inline-flex;
  align-items: center;
}
</style>
