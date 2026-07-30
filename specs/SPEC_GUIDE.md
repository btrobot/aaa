# 规格编写规范

## 概述

本规范定义了 `specs/*.spec.yaml` 文件的编写规则。规格文件是模块的**形式化契约**，用于指导开发、测试验证和回归检查。

## 文件组织

### 命名规则

```
{module-name}.spec.yaml
```

- 全小写
- 单词间用连字符 `-` 分隔
- 使用单数形式

**示例**: `product.spec.yaml`、`customer-group.spec.yaml`

### 模块分层

| Layer | 名称 | 说明 |
|-------|------|------|
| 0 | 独立基础 | 无外部依赖, 如 Settings, Brand, CustomerGroup |
| 1 | 基础数据 | 依赖 Layer 0, 如 Category, TaxRate |
| 2 | 产品体系 | 依赖 Layer 0~1, 如 Product, Attribute |
| 3 | 客户体系 | 依赖 Layer 0, 如 Customer |
| 4 | 交易体系 | 依赖 Layer 2~3, 如 Order, Cart |
| 5 | 售后体系 | 依赖 Layer 2~4, 如 Review, RMA |
| 5 | 内容体系 | 依赖 Layer 0, 如 Page |

---

## 文件结构

每个 spec 文件必须包含以下四个部分, 按顺序排列：

### 1. 文件头注释

```yaml
# {Module Name} Module Specification
# Layer: {N} ({Layer Name})
# Dependencies: {module1}, {module2}, ...
```

**规则**：
- `Dependencies` 列出本模块直接依赖的其他模块名
- 如果无依赖, 写 `(none)`
- 依赖关系必须与 `03-dependencies.md` 一致

### 2. module 声明

```yaml
module: {ModuleName}
version: '{Major}.{Minor}'
```

**规则**：
- `version` 用字符串包裹, 避免 YAML 解析为数字

### 3. entities

定义本模块涉及的所有数据库实体。

#### 字段定义

```yaml
entities:
  {EntityName}:
    table: {table_name}
    fields:
      {fieldName}:
        type:       {type}          # 必填. 数据类型
        required:   true|false      # 可选. 默认 false
        primary:    true|false      # 可选. 主键标记
        unique:     true|false      # 可选. 唯一约束
        ref:        {table}.{field} # 可选. 外键引用
        null:       true|false      # 可选. 允许空值
        default:    {value}         # 可选. 默认值
        length:     {integer}       # 可选. varchar 长度
        precision:  {integer}       # 可选. decimal 总位数
        scale:      {integer}       # 可选. decimal 小数位数
        min:        {number}        # 可选. 最小值
        max:        {number}        # 可选. 最大值
        enum:       [{v1}, {v2}]    # 可选. 枚举值列表
        auto:       true|false      # 可选. 自动生成 (timestamp)
        index:      true|false      # 可选. 索引标记
        onDelete:   cascade|setnull # 可选. 外键级联策略
        unit:       "{string}"      # 可选. 单位说明
        note:       "{string}"      # 可选. 字段说明
```

**规则**：
- `type` 支持以下类型：
  - `serial` — 自增整数
  - `integer` — 整数
  - `decimal` — 小数 (需指定 precision/scale)
  - `varchar` — 字符串 (需指定 length)
  - `text` — 长文本
  - `boolean` — 布尔
  - `timestamp` — 时间戳
  - `jsonb` — JSON 对象
  - `enum` — 枚举 (需指定 values 列表)
  - `oklch` — CSS oklch 颜色值
- 所有字段必须有 `type`
- 有 `ref` 的字段必须标注 `required` 或 `null`
- 带 `auto: true` 的 timestamp 字段不写 `required`
- `note` 用于解释非自明的字段（如枚举值的含义、单位）
- 主键用 `primary: true` 标记, 不写 `required`

#### 多语言实体

```yaml
entities:
  {EntityName}:
    table: {table_name}
    fields:
      id:  { type: serial, primary: true }
      ...
    locale: true
    localeFields: [field1, field2, ...]
```

**规则**：
- `locale: true` 表示该实体有独立的描述表 `{entity}_descriptions`
- `localeFields` 列出需要翻译的字段
- 主表只存非语言字段, 描述表存 `{entity}_id` + `locale` + 各语言字段

#### 非数据库实体

```yaml
entities:
  {EntityName}:
    note: "内置于 {file}, 非数据库表"
    fields:
      ...
```

### 4. relations

```yaml
relations:
  {EntityName}:
    {relationName}:
      type:   {relationType}
      entity: {TargetEntity}
      via:    {foreignKey}
      optional: true|false    # 可选
      pivot: [field1, field2] # 仅 many_to_many
```

**关系类型**：

| 类型 | 说明 | 示例 |
|------|------|------|
| `belongs_to` | 多对一 | `Review belongs_to Product` |
| `has_many` | 一对多 | `Product has_many ProductDescription` |
| `many_to_many` | 多对多 | `Product many_to_many Category via product_categories` |
| `polymorphic` | 多态关联 | `Notification polymorphic (notifiableId, notifiableType)` |

**规则**：
- 每个方向的关系都要声明（如 `Product has_many Review` 和 `Review belongs_to Product`）
- `via` 指定外键字段名
- `many_to_many` 必须指定 `pivot` 数组
- `polymorphic` 用 `fields` 数组替代 `via`

### 5. state_machine

```yaml
state_machine:
  initial: {firstState}
  transitions:
    - { from: {state},  to: [{state1}, {state2}] }
```

**规则**：
- `initial` 必须存在
- `transitions` 列出所有合法转换
- 未列出的转换视为非法, 测试应验证其被拒绝
- 每个状态至少出现在一个 `from` 或 `to` 中

### 6. operations

```yaml
operations:
  {operationName}:
    method:   GET|POST|PUT|DELETE|internal
    path:     /api/{resource}[/:id]
    auth:     public|customer|admin|[customer, admin]
    input:    { fieldName: { type, required, ... } }   # 可选
    pre:      "前置条件"                                 # 可选
    post:     "后置条件"                                 # 可选
    output:   {type}                                     # 可选
    effect:   "副作用"                                   # 可选
    cache:    {seconds}                                  # 可选
    schedule: "{cron表达式}"                             # 可选
    errors:                                              # 可选
      - { status: 400, condition: "...", message: "..." }
    note:     "{说明}"                                   # 可选
```

**规则**：
- `method` 为 `internal` 表示内部调用（非 API 暴露）
- `auth` 必须明确：`public` / `customer` / `admin` / 组合
- `pre` 用自然语言描述前置条件, 每条一句
- `post` 描述操作完成后的系统状态变化
- `effect` 描述副作用（如库存扣减、通知发送）
- 多条前置条件可用列表格式

```yaml
    pre:
      - "条件一"
      - "条件二"
```

**错误场景**：

```yaml
    errors:
      - { status: 400, condition: "参数校验失败", message: "邮箱格式不正确" }
      - { status: 404, condition: "资源不存在",    message: "产品未找到" }
      - { status: 409, condition: "状态冲突",      message: "订单状态不允许取消" }
```

### 7. rules

```yaml
rules:
  - "业务规则描述"
```

**规则**：
- 每条规则必须是**可验证的断言**（能写成测试）
- 避免空泛描述（如"体验要好"）
- 每条规则一句话, 明确主语和条件
- 格式：
  - 约束类：`{实体} 必须/不能 {条件}`
  - 条件类：`仅当 {条件} 时, 才 {操作}`
  - 关系类：`{A} 的 {属性} 等于 {B} 的 {属性}`

---

## 编写原则

### 1. 完整性

每个模块必须覆盖：
- 所有数据库实体（含子表）
- 所有 API 路由（含内部操作）
- 所有业务规则
- 所有状态机转换

### 2. 准确性

- 字段名、表名、API 路径必须与实际代码一致
- 前置/后置条件必须可验证
- 依赖关系必须与依赖拓扑一致

### 3. 可验证性

每条规则、每个前置条件、每个后置条件都应该能转化为测试用例：

```yaml
# 规格中的规则
rules:
  - "一个客户对一个产品只能评价一次"

# ⇓ 推导出的测试
it('一个客户对一个产品不能重复评价', async () => {
  await createReview(customerId, productId);
  await expect(createReview(customerId, productId)).rejects.toThrow();
});
```

### 4. 简洁性

- 避免在 spec 中描述 UI 实现细节
- 避免在 spec 中描述技术实现（如"用 Redis 缓存"）
- 专注于「做什么」而非「怎么做」

### 5. 一致性

- 所有 `spec.yaml` 文件使用相同的字段命名风格（camelCase）
- 枚举值全小写
- 注释用中文

---

## 校验清单

编写或修改 spec 后, 对照以下清单检查：

```markdown
- [ ] 文件头注释包含 Layer 和 Dependencies
- [ ] 所有数据库实体都已定义
- [ ] 所有字段都有 type
- [ ] 外键字段有 ref
- [ ] 每个 belongs_to 对应上游的 has_many
- [ ] 状态机初始状态正确
- [ ] 状态机转换覆盖所有合法路径
- [ ] 所有 API 路由都已定义
- [ ] 每个操作都有 auth 声明
- [ ] 前置条件可验证
- [ ] 后置条件可验证
- [ ] 业务规则至少 3 条
- [ ] 规则是断言而非描述
- [ ] 多语言实体标注 locale: true
```

---

## 示例

### 最小完整 spec

```yaml
# Brand Module Specification
# Layer: 0 (独立基础)
# Dependencies: (none)

module: Brand
version: '1.0'

entities:
  Brand:
    table: brands
    fields:
      id:          { type: serial, primary: true }
      name:        { type: varchar, required: true, length: 128, unique: true }
      logo:        { type: varchar, length: 255, null: true }
      description: { type: text, null: true }
      website:     { type: varchar, length: 255, null: true }
      sortOrder:   { type: integer, default: 0 }
      status:      { type: boolean, default: true }
      createdAt:   { type: timestamp, auto: true }
      updatedAt:   { type: timestamp, auto: true }

relations:
  Brand:
    products: { type: has_many, entity: Product, via: brandId }

operations:
  list:
    method: GET
    path: /api/brands
    auth: public
    output: { items: [Brand] }
    cache: 120

  getById:
    method: GET
    path: /api/brands/:id
    auth: public
    pre:  "品牌存在"
    output: Brand

  create:
    method: POST
    path: /api/brands
    auth: admin
    input: { name: required, logo: optional, description: optional, website: optional, sortOrder: optional, status: optional }
    pre:  "品牌名唯一"
    post: "品牌创建"

  update:
    method: PUT
    path: /api/brands/:id
    auth: admin
    pre:  "品牌存在"
    post: "品牌更新"

  delete:
    method: DELETE
    path: /api/brands/:id
    auth: admin
    pre:  "品牌无关联产品"
    post: "品牌删除"

rules:
  - "品牌名唯一"
  - "有产品的品牌不可删除"
  - "前台只展示 status = true 的品牌"
```