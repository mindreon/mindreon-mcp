# Mindreon CLI

Mindreon 命令行工具，提供本地 Git/DVC 工作区、模型与数据集管理、文件上传和 workload 调度能力。

## 安装

全局安装：

```bash
npm i -g @sanmu2018/mindreon-mcp
mindreon --help
```

本地开发安装：

```bash
cd /path/to/mindreon-mcp
npm link
mindreon --help
```

当前对外命令名统一为 `mindreon`。

## 基本使用

### 1. 登录 (Login)
```bash
mindreon login --username <USERNAME> --password <PASSWORD> [--url https://dev-4-13.mindreon.com]
```
登录成功后 Token 将会自动保存在本地 `~/.config/mindreon/config.json` 中。对外部署默认走 Traefik 网关路径，IAM 登录入口是 `/iam/api/v1/auth/login`，FVM 入口是 `/fvm/...`。

### 2. 文件上传 (File Upload)
```bash
mindreon file upload <LOCAL_FILE_PATH> --bucket <BUCKET_NAME>
```
输出将会展示类似于：`Location: file-server://files/xxxxx`。在接下来的接口中，这会被用作 `location`。

### 3. 模型管理 (Model Management)
创建模型：
```bash
mindreon model create --name "my-cool-model" --description "A fresh new model"
```
创建版本（branch）：
```bash
mindreon model version create --name "my-cool-model" --version "v1.0.0" --base "main"
```
连接本地目录到模型版本：
```bash
cd /path/to/workspace
mindreon model connect --name "my-cool-model" --version "v1.0.0"
```

### 4. 数据集管理 (Dataset Management)
```bash
mindreon dataset create --name "my-test-data"
mindreon dataset version create --name "my-test-data" --version "v1" --base "main"
cd /path/to/workspace
mindreon dataset connect --name "my-test-data" --version "v1"
```

### 5. 本地仓库工作流 (Local Repo Workflow)
安装依赖：
```bash
mindreon install
```

连接成功后，后续在本地目录中操作：
```bash
mindreon repo pull
mindreon repo add                # 默认超过 5 MiB 走 dvc add
mindreon repo add --threshold 1 # 手动覆盖阈值，单位 MiB
mindreon repo commit -m "update assets"
mindreon repo push
```

### 6. 任务调度 (Workload)
启动推理服务：
```bash
mindreon workload create-infer --name "infer-test" --model "my-cool-model" --modelVersion "v1.0.0" --cpu 4 --memory "8G" --gpu 1
```
启动训练任务：
```bash
mindreon workload create-training --name "train-test" --dataset "my-test-data" --datasetVersion "v1" --pretrainModel "my-cool-model" --pretrainModelVersion "v1.0.0" --cpu 4 --memory "16G" --gpu 1
```

## 手动验证示例

```bash
cd /tmp
mindreon login --url https://dev-4-13.mindreon.com --username orgadmin --password 'mindreon@123'

TS=$(date +%Y%m%d%H%M%S)
DATASET_NAME="manual-ds-${TS}"

mindreon dataset create --name "$DATASET_NAME"

mkdir -p "./manual-${TS}/main"
cd "./manual-${TS}/main"
mindreon dataset connect --name "$DATASET_NAME"

python3 - <<'PY'
from pathlib import Path
p = Path("big.bin")
with p.open("wb") as f:
    f.write(b"a" * (6 * 1024 * 1024))
PY

mindreon repo add
mindreon repo commit -m "manual verify dvc push"
mindreon repo push
```

重新拉取验证：

```bash
mkdir -p "../verify"
cd "../verify"
mindreon dataset connect --name "$DATASET_NAME"
mindreon repo pull
ls -lh big.bin
```

## MCP Agent 集成
我们提供了标准化的 SDK/技能规范。参阅 `skills/mindreon/SKILL.md` 了解 Agent 集成说明。
