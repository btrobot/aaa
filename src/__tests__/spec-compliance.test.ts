/**
 * Spec 合规自动检查
 *
 * 读取 specs/*.spec.yaml，自动验证：
 * 1. 每个 spec 模块有对应的测试文件
 * 2. 每个 spec 操作（operations）在测试文件中有对应 describe/it
 * 3. 每个 pre 条件在测试文件中有违反测试（不/不能/throws/rejects）
 *
 * 这是 spec 权威性的自动化保障层。
 */
import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import * as yaml from 'js-yaml';

// ── Spec 文件加载 ────────────────────────────────────────────────────────────

const SPECS_DIR = path.resolve(__dirname, '../../specs');
const TESTS_DIR = path.resolve(__dirname);

function getTestFilePath(specName: string): string {
  if (specName === 'auth') {
    return path.join(TESTS_DIR, 'unit', 'auth.test.ts');
  }
  return path.join(TESTS_DIR, 'unit', 'services', `${specName}.service.test.ts`);
}

interface SpecOperation {
  name: string;
  method: string;
  path: string;
  auth?: string;
  pre?: string | string[];
  post?: string | string[];
}

interface ParsedSpec {
  module: string;
  version: string;
  operations: SpecOperation[];
  rules?: string[];
}

// ── 别名映射 ─────────────────────────────────────────────────────────────────
// spec 操作名 → 测试中可能出现的 describe/it 名称

const OP_ALIASES: Record<string, string[]> = {
  // 列表
  list:          ["findAll", "getAll", "list", "listAll", "index", "query", "getCart", "getTree", "search", "getItems", "listItems"],
  listAll:       ['findAll', 'getAll', 'list', 'listAll'],
  findAll:       ['findAll', 'getAll', 'list', 'listAll'],
  getAll:        ['findAll', 'getAll', 'list', 'listAll'],

  // 详情
  detail:        ['findById', 'getById', 'findOne', 'detail', 'get', 'getOne', 'show'],
  getById:       ['findById', 'getById', 'findOne', 'detail', 'get', 'getOne'],
  findById:      ['findById', 'getById', 'findOne', 'detail', 'get', 'getOne'],
  getOne:        ['findById', 'getById', 'findOne', 'detail', 'get', 'getOne'],

  // CRUD
  create:        ['create', 'add', 'insert', 'store', 'save', 'register'],
  update:        ['update', 'edit', 'modify', 'patch', 'save'],
  delete:        ['delete', 'remove', 'destroy', 'drop'],

  // 特殊映射
  getMe:         ['getMe', 'me', 'getProfile', 'whoami', 'getCurrentUser'],
  getSettings:   ['getAll', 'getSettings', 'get', 'list'],
  updateSettings:['updateAll', 'updateSettings', 'update', 'set'],
  listLanguages: ['listLanguages', 'getAll', 'list', 'getLanguages', 'languages'],
  listCurrencies:['listCurrencies', 'getAll', 'list', 'getCurrencies', 'currencies'],

  // Auth
  customerLogin:    ['customerLogin', 'login', 'authenticate', 'customer_login', 'customerLogin'],
  customerRegister: ['customerRegister', 'register', 'signup', 'signUp', 'customer_register'],
  adminLogin:       ['adminLogin', 'login', 'authenticate', 'admin_login'],
  checkPermission:  ['checkPermission', 'requireAuth', 'authorize', 'check', 'hasPermission'],

  // Page 模块
  listPages:     ['listPages', 'findAll', 'getAll', 'list', 'listAll'],
  getPage:       ['getPage', 'findById', 'getById', 'get', 'findOne'],
  createPage:    ['createPage', 'create', 'add'],
  updatePage:    ['updatePage', 'update', 'edit'],
  deletePage:    ['deletePage', 'delete', 'remove'],
  listCategories:['listCategories', 'getAll', 'list', 'getCategories'],

  // Attribute
  listGroups:    ["listGroups", "findAll", "getAll", "list", "getGroups", "getByGroup", "getAttributes", "listAttributes", "createGroup"],
  addValue:      ['addValue', 'create', 'add', 'insert', 'createValue'],
  linkProduct:   ['linkProduct', 'create', 'add', 'link', 'associate'],

  // Notification
  markAllAsRead: ["markAllAsRead", "updateAll", "markRead", "readAll", "markAsRead"],
  cleanup:       ['cleanup', 'delete', 'remove', 'clear', 'purge'],

  // RMA
  createRma:     ['createRma', 'create', 'add', 'submit'],

  // Tax
  calculateTax:  ['calculateTax', 'calculate', 'compute', 'getTax'],
}

/** 操作名的别名列表 */
function getOpAliases(opName: string): string[] {
  // 直接映射
  if (OP_ALIASES[opName]) return OP_ALIASES[opName];

  // 去掉模块前缀：getPage → [getPage, get, page]
  const stripped = opName.replace(/^(get|list|create|update|delete|mark|add|link)/, '');
  const verb = opName.replace(stripped, '');
  const aliases = [opName, verb.toLowerCase(), stripped.toLowerCase()];

  return [...new Set(aliases.filter(Boolean))];
}

/** 预处理 YAML */
function preprocessYaml(raw: string): string {
  let s = raw;
  s = s.replace(/(\S):(\{)/g, '$1: $2');
  s = s.replace(/\.\.\.(?=\s*[\]}])/g, '"__ellipsis__": 1');
  s = s.replace(/:\s*([a-zA-Z_]\w*)(?=\s*[,}\]])/g, (match, word: string) => {
    if (/^(true|false|null|yes|no)$/i.test(word)) return match;
    return `: "${word}"`;
  });
  return s;
}

function parseSpec(filePath: string): ParsedSpec | null {
  const content = fs.readFileSync(filePath, 'utf-8');

  // 尝试 1: 直接解析
  try {
    const doc = yaml.load(content) as Record<string, unknown>;
    if (doc && typeof doc === 'object') return extractFromDoc(doc);
  } catch { /* 继续 */ }

  // 尝试 2: 预处理后解析
  try {
    const processed = preprocessYaml(content);
    const doc = yaml.load(processed) as Record<string, unknown>;
    if (doc && typeof doc === 'object') return extractFromDoc(doc);
  } catch { /* 继续 */ }

  // 尝试 3: 正则提取
  return extractFromText(content);
}

function extractFromDoc(doc: Record<string, unknown>): ParsedSpec {
  const operations: SpecOperation[] = [];
  const ops = (doc.operations ?? {}) as Record<string, Record<string, unknown>>;

  for (const [name, op] of Object.entries(ops)) {
    operations.push({
      name,
      method: String(op.method ?? ''),
      path: String(op.path ?? ''),
      auth: op.auth as string | undefined,
      pre: op.pre as string | string[] | undefined,
      post: op.post as string | string[] | undefined,
    });
  }

  return {
    module: String(doc.module ?? ''),
    version: String(doc.version ?? ''),
    operations,
    rules: doc.rules as string[] | undefined,
  };
}

function extractFromText(content: string): ParsedSpec {
  const moduleMatch = content.match(/^module:\s*(.+)$/m);
  const versionMatch = content.match(/^version:\s*['"]?([^'"#\n]+)['"]?$/m);
  const operations: SpecOperation[] = [];

  const opsBlock = content.split(/^operations:\s*$/m)[1];
  if (opsBlock) {
    const opRegex = /^  (\w+):\s*$/gm;
    let opMatch: RegExpExecArray | null;
    while ((opMatch = opRegex.exec(opsBlock)) !== null) {
      const opName = opMatch[1];
      const startIdx = opMatch.index + opMatch[0].length;
      const nextOp = opsBlock.substring(startIdx).search(/^(?:  \w+:|\w+:)/m);
      const opBlock = nextOp >= 0
        ? opsBlock.substring(startIdx, startIdx + nextOp)
        : opsBlock.substring(startIdx);

      const methodMatch = opBlock.match(/method:\s*(\w+)/);
      const pathMatch = opBlock.match(/path:\s*(\S+)/);
      const authMatch = opBlock.match(/auth:\s*(\w+)/);
      const preMatch = opBlock.match(/pre:\s*(.+)/);

      operations.push({
        name: opName,
        method: methodMatch?.[1] ?? '',
        path: pathMatch?.[1] ?? '',
        auth: authMatch?.[1],
        pre: preMatch?.[1],
      });
    }
  }

  return {
    module: moduleMatch?.[1]?.trim() ?? '',
    version: versionMatch?.[1]?.trim() ?? '',
    operations,
  };
}

function loadAllSpecs(): Array<{ specName: string; spec: ParsedSpec; filePath: string }> {
  const files = fs.readdirSync(SPECS_DIR).filter(f => f.endsWith('.spec.yaml'));
  const results: Array<{ specName: string; spec: ParsedSpec; filePath: string }> = [];
  for (const f of files) {
    const filePath = path.join(SPECS_DIR, f);
    const spec = parseSpec(filePath);
    if (spec) results.push({ specName: f.replace('.spec.yaml', ''), spec, filePath });
  }
  return results;
}

// ── 测试文件内容读取 ─────────────────────────────────────────────────────────

function readTestFile(testPath: string): string | null {
  if (!fs.existsSync(testPath)) return null;
  return fs.readFileSync(testPath, 'utf-8');
}

function extractTestNames(content: string): string[] {
  const names: string[] = [];
  const regex = /(?:describe|it)\s*\(\s*['"`]([^'"`]+)['"`]/g;
  let match: RegExpExecArray | null;
  while ((match = regex.exec(content)) !== null) {
    names.push(match[1]);
  }
  return names;
}

function extractViolationTests(content: string): string[] {
  const violations: string[] = [];
  const regex = /(?:describe|it)\s*\(\s*['"`]([^'"`]+)['"`]/g;
  let match: RegExpExecArray | null;
  while ((match = regex.exec(content)) !== null) {
    const name = match[1];
    if (/不|throw|reject|fail|error|禁止|无法|非法|缺失|缺少|不存在|为空|无效/i.test(name)) {
      violations.push(name);
    }
  }
  return violations;
}

// ── 加载所有 spec ────────────────────────────────────────────────────────────

const allSpecs = loadAllSpecs();

// ── 合规检查测试套件 ─────────────────────────────────────────────────────────

describe('Spec 合规自动检查', () => {
  // ── 0. Spec 文件可解析性 ──────────────────────────────────────────────────

  describe('Spec 文件可解析性', () => {
    const allFiles = fs.readdirSync(SPECS_DIR).filter(f => f.endsWith('.spec.yaml'));

    for (const f of allFiles) {
      it(`${f} — 应能被解析`, () => {
        const filePath = path.join(SPECS_DIR, f);
        const spec = parseSpec(filePath);
        expect(spec, `${f} 解析失败`).not.toBeNull();
        expect(spec!.module, `${f} 缺少 module 字段`).toBeTruthy();
        expect(spec!.operations.length, `${f} 未提取到 operations`).toBeGreaterThan(0);
      });
    }
  });

  // ── 1. 测试文件存在性 ─────────────────────────────────────────────────────

  describe('测试文件存在性', () => {
    for (const { specName } of allSpecs) {
      it(`${specName} — 应有对应测试文件`, () => {
        const testPath = getTestFilePath(specName);
        expect(
          fs.existsSync(testPath),
          `缺少测试文件: ${testPath}\n请运行 $spec-align ${specName} 生成`
        ).toBe(true);
      });
    }
  });

  // ── 2. 操作覆盖 ───────────────────────────────────────────────────────────

  describe('操作覆盖', () => {
    for (const { specName, spec } of allSpecs) {
      const testPath = getTestFilePath(specName);
      const content = readTestFile(testPath);
      if (!content) continue;

      const testNames = extractTestNames(content);
      const testNamesLower = testNames.map(n => n.toLowerCase());

      for (const op of spec.operations) {
        it(`${specName}.${op.name} — 测试中应有覆盖`, () => {
          const aliases = getOpAliases(op.name);
          const aliasesLower = aliases.map(a => a.toLowerCase());

          const found = testNamesLower.some(t =>
            aliasesLower.some(alias => t.includes(alias))
          );

          if (!found) {
            const available = testNames.slice(0, 20).join(', ');
            expect.fail(
              `操作 "${op.name}" (别名: ${aliases.join('/')}) 在测试文件中无对应 describe/it\n` +
              `已有测试: ${available}\n` +
              `请在测试文件中添加 "${op.name}" 的测试用例`
            );
          }
        });
      }
    }
  });

  // ── 3. 前置条件违反测试 ────────────────────────────────────────────────────

  describe('前置条件违反测试', () => {
    for (const { specName, spec } of allSpecs) {
      const testPath = getTestFilePath(specName);
      const content = readTestFile(testPath);
      if (!content) continue;

      const violationTests = extractViolationTests(content);

      const opsWithPre = spec.operations.filter(op => {
        if (!op.pre) return false;
        if (Array.isArray(op.pre)) return op.pre.length > 0;
        return String(op.pre).trim().length > 0;
      });

      if (opsWithPre.length === 0) continue;

      it(`${specName} — 应有前置条件违反测试`, () => {
        expect(
          violationTests.length,
          `模块 "${specName}" 有 ${opsWithPre.length} 个带前置条件的操作，\n` +
          `但测试文件中未找到违反测试。\n` +
          `请为前置条件添加违反测试，例如:\n` +
          opsWithPre.slice(0, 3).map(op => {
            const pres = Array.isArray(op.pre) ? op.pre : [op.pre];
            return `  it('${op.name} — ${String(pres[0]).trim().substring(0, 30)}不满足时应抛出错误', ...)`;
          }).join('\n')
        ).toBeGreaterThan(0);
      });
    }
  });

  // ── 4. Spec 结构完整性 ────────────────────────────────────────────────────

  describe('Spec 结构完整性', () => {
    for (const { specName, spec } of allSpecs) {
      it(`${specName} — 应有 module 字段`, () => {
        expect(spec.module).toBeTruthy();
      });

      it(`${specName} — 应有 version 字段`, () => {
        expect(spec.version).toBeTruthy();
      });

      it(`${specName} — 应至少有一个 operation`, () => {
        expect(spec.operations.length).toBeGreaterThan(0);
      });
    }
  });

  // ── 5. 操作路径规范 ────────────────────────────────────────────────────────

  describe('操作路径规范', () => {
    for (const { specName, spec } of allSpecs) {
      for (const op of spec.operations) {
        it(`${specName}.${op.name} — 路径应以 /api/ 开头`, () => {
          if (!op.path) return;
          expect(
            op.path.startsWith('/api/'),
            `操作 "${op.name}" 路径 "${op.path}" 不以 /api/ 开头`
          ).toBe(true);
        });

        it(`${specName}.${op.name} — 应有 HTTP method`, () => {
          expect(op.method).toBeTruthy();
        });
      }
    }
  });

  // ── 6. 权限声明 ────────────────────────────────────────────────────────────

  describe('权限声明', () => {
    for (const { specName, spec } of allSpecs) {
      for (const op of spec.operations) {
        if (!op.path) continue;
        it(`${specName}.${op.name} — 应声明 auth`, () => {
          expect(
            op.auth,
            `操作 "${op.name}" 未声明 auth（public/admin/customer）`
          ).toBeDefined();
        });
      }
    }
  });
});
