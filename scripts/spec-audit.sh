#!/bin/bash
# Spec 覆盖率审计：检查每个 spec 操作和规则是否有对应测试
set -e

MODULES="cart brand category product customer review payment order"
PASS=0
FAIL=0
WARN=0

for mod in $MODULES; do
  spec="specs/${mod}.spec.yaml"
  test="src/__tests__/unit/services/${mod}.service.test.ts"
  
  if [ ! -f "$spec" ]; then
    echo "⚠️  $mod: spec 不存在"
    ((WARN++))
    continue
  fi
  if [ ! -f "$test" ]; then
    echo "❌ $mod: 测试文件不存在"
    ((FAIL++))
    continue
  fi

  # 提取 spec 中的操作名
  ops=$(grep -E '^  \w+:$' "$spec" | sed 's/://;s/^  //' | sort -u)
  
  # 提取 spec 中的 pre 条件关键词
  pres=$(grep -E '^\s+- "' "$spec" | sed 's/.*- "//;s/".*//' | sort -u)

  # 提取测试中的 describe/it 描述
  test_content=$(cat "$test")

  mod_pass=0
  mod_fail=0

  for op in $ops; do
    # 检查测试中是否有该操作的 describe 块
    if echo "$test_content" | grep -qi "$op"; then
      ((mod_pass++))
    else
      echo "  ❌ $mod.$op: 测试中无覆盖"
      ((mod_fail++))
    fi
  done

  if [ $mod_fail -eq 0 ]; then
    echo "✅ $mod: ${mod_pass} 个操作全部有测试覆盖"
    ((PASS++))
  else
    echo "❌ $mod: ${mod_fail}/${mod_pass} 个操作缺失测试"
    ((FAIL++))
  fi
done

echo ""
echo "=== 审计结果 ==="
echo "✅ 通过: $PASS"
echo "❌ 失败: $FAIL"
echo "⚠️  警告: $WARN"
