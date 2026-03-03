# Mindreon MCP CLI

Mindreon MCP 命令行工具，帮助 Agent 直接在本地集成 IAM 登录、上传文件、管理模型与数据集，以及调度 AI 测试训练工作流。

## 安装

由于目前是以本地项目形式存在，可以在本目录执行 `npm link` 来安装全局命令 `mindreon-mcp`。

## 基本使用

### 1. 登录 (Login)
```bash
mindreon-mcp login --username <USERNAME> --password <PASSWORD> [--url https://dev-4-13.mindreon.com]
```
登录成功后 Token 将会自动保存在本地 `~/.config/mindreon/config.json` 中。

### 2. 文件上传 (File Upload)
```bash
mindreon-mcp file upload <LOCAL_FILE_PATH> --bucket <BUCKET_NAME>
```
输出将会展示类似于：`Location: file-server://files/xxxxx`。在接下来的接口中，这会被用作 `location`。

### 3. 模型管理 (Model Management)
创建模型：
```bash
mindreon-mcp model create --name "my-cool-model" --description "A fresh new model"
```
创建版本（branch）：
```bash
mindreon-mcp model create-version --model "my-cool-model" --version "v1.0.0"
```
向模型版本追加文件：
```bash
mindreon-mcp model append-file --model "my-cool-model" --version "v1.0.0" --location "file-server://files/xxxx" --dest "weights.safetensors"
```

### 4. 数据集管理 (Dataset Management)
```bash
mindreon-mcp dataset create --name "my-test-data"
mindreon-mcp dataset create-version --dataset "my-test-data" --version "v1"
mindreon-mcp dataset append-file --dataset "my-test-data" --version "v1" --location "file-server://files/yyyy" --dest "train.jsonl"
```

### 5. 任务调度 (Workload)
启动推理服务：
```bash
mindreon-mcp workload create-infer --name "infer-test" --model "my-cool-model" --modelVersion "v1.0.0" --cpu 4 --memory "8G" --gpu 1
```
启动训练任务：
```bash
mindreon-mcp workload create-training --name "train-test" --dataset "my-test-data" --datasetVersion "v1" --pretrainModel "my-cool-model" --pretrainModelVersion "v1.0.0" --cpu 4 --memory "16G" --gpu 1
```

## MCP Agent 集成
我们提供了标准化的 SDK/技能规范。参阅 `skills/mindreon/SKILL.md` 了解 Agent 集成说明。