/* ============================================================
   assets/engine.js — RRC 讲解器引擎 · 纯逻辑核心（Node/浏览器双跑）
   职责：模块 registry + schema 校验 + 工具函数 + 测验判分 + 进度/授权存储
   DOM 渲染在 assets/player.js（本文件顶层禁止访问 document）
   ============================================================ */
(function (g) {
  'use strict';

  /* ---------- registry ---------- */
  var DB = [];
  var byId = {};

  function isStr(s) { return typeof s === 'string' && s.trim().length > 0; }
  function isInt(n) { return typeof n === 'number' && isFinite(n) && Math.floor(n) === n; }

  /* ---------- 条款树索引（存在性 lint；由外部注入，未注入时只查格式） ----------
     支持跨规范引用：refs 可写 '38.423#9.1.1.1'（前缀#条款号）。setClauseIndex 接受
     数组（默认树=38.331）或对象 {'': [...], '38.423': [...], ...}；未注入索引的规范跳过存在性。 */
  var clauseIndex = null;
  function isClauseRef(s) {
    /* 允许末段字母后缀（如 5.3.3.1a / 5.7.3b——语料条款树中真实存在） */
    return typeof s === 'string' && (/^\d+(\.\d+)+[a-z]?$/.test(s) || /^\d{2}\.\d{3}#\d+(\.\d+)+[a-z]?$/.test(s));
  }
  function clauseMissing(ref) {
    if (clauseIndex == null) return false;
    var hashAt = ref.indexOf('#');
    var spec = hashAt < 0 ? '' : ref.slice(0, hashAt);
    var num = hashAt < 0 ? ref : ref.slice(hashAt + 1);
    var ids = clauseIndex[spec];
    if (!ids) return false; /* 未注入该规范的索引：仅格式校验 */
    return ids.indexOf(num) < 0;
  }
  function normClauseIndex(x) {
    if (Array.isArray(x)) return { '': x.filter(function (v) { return typeof v === 'string'; }) };
    if (x && typeof x === 'object') {
      var out = {};
      Object.keys(x).forEach(function (k) { out[k] = (x[k] || []).filter(function (v) { return typeof v === 'string'; }); });
      return out;
    }
    return null;
  }

  /* ---------- schema 校验：返回错误数组（空=合法） ---------- */
  var DIRS = ['ul', 'dl', 'nas', 'int', 'warn'];
  function validateModule(m, extraIds) {
    var e = [];
    if (!m || typeof m !== 'object') return ['module 必须是对象'];
    var v2 = m.schema === 2;
    if (m.schema != null && m.schema !== 1 && m.schema !== 2) e.push('schema 非法: ' + m.schema);
    if (!/^m[a-zA-Z0-9]+$/.test(m.id || '')) e.push('id 格式非法: ' + m.id);
    if (!isInt(m.num)) e.push('num 必须是整数');
    if (!isStr(m.title)) e.push('title 不能为空');
    if (!isStr(m.tagline)) e.push('tagline 不能为空');
    if (!isStr(m.tech)) e.push('tech 不能为空');
    if (!(typeof m.minutes === 'number' && m.minutes > 0)) e.push('minutes 必须 > 0');
    if (typeof m.free !== 'boolean') e.push('free 必须是布尔');
    if (!Array.isArray(m.prereq)) e.push('prereq 必须是数组');
    else {
      var known = Object.keys(byId).concat(extraIds || [], [m.id]);
      m.prereq.forEach(function (p) {
        if (!isStr(p) || known.indexOf(p) < 0) e.push('prereq 不存在: ' + p);
      });
    }
    if (!Array.isArray(m.actors) || m.actors.length < 2 || m.actors.length > 4) {
      e.push('actors 必须为 2–4 个');
    } else {
      m.actors.forEach(function (a, i) {
        if (typeof a.x !== 'number') e.push('actors[' + i + '].x 必须是数字');
        if (!isStr(a.label)) e.push('actors[' + i + '].label 不能为空');
      });
    }
    if (!m.paths || !Array.isArray(m.paths.success) || m.paths.success.length === 0) {
      e.push('paths.success 必须是非空数组');
    }
    if (m.paths && m.paths.fail != null && (!Array.isArray(m.paths.fail) || m.paths.fail.length === 0)) {
      e.push('paths.fail 要么为 null 要么是非空数组');
    }
    var pathIds = [];
    if (m.paths && typeof m.paths === 'object') {
      Object.keys(m.paths).forEach(function (bk) {
        if (Array.isArray(m.paths[bk])) {
          m.paths[bk].forEach(function (sid) {
            if (!m.steps || !m.steps[sid]) e.push('paths.' + bk + ' 引用了不存在的 step: ' + sid);
          });
          pathIds = pathIds.concat(m.paths[bk]);
        }
      });
    }
    if (m.steps && typeof m.steps === 'object') {
      Object.keys(m.steps).forEach(function (k) {
        if (pathIds.indexOf(k) < 0) e.push('step ' + k + ' 未被任何路径引用');
        var s = m.steps[k];
        if (!isStr(s.title)) e.push('step ' + k + '.title 不能为空');
        if (!isStr(s.label)) e.push('step ' + k + '.label 不能为空');
        if (!isStr(s.chan)) e.push('step ' + k + '.chan 不能为空');
        if (!isStr(s.narr)) e.push('step ' + k + '.narr 不能为空');
        if (s.plain != null && !(isStr(s.plain) && s.plain.length >= 20 && s.plain.length <= 240)) e.push('step ' + k + '.plain 若填须为 20–240 字的白话版');
        if (DIRS.indexOf(s.dir) < 0) e.push('step ' + k + ' dir 非法: ' + s.dir);
        if (m.actors && m.actors.length) {
          if (!isInt(s.from) || s.from < 0 || s.from >= m.actors.length) e.push('step ' + k + '.from 越界');
          if (!isInt(s.to) || s.to < 0 || s.to >= m.actors.length) e.push('step ' + k + '.to 越界');
          if (s.dir === 'int' && s.from !== s.to) e.push('step ' + k + ' dir=int 必须 from===to（自环）');
        }
        if (!Array.isArray(s.ies)) e.push('step ' + k + '.ies 必须是数组');
        if (s.exam != null && typeof s.exam !== 'string') e.push('step ' + k + '.exam 必须是字符串');
      });
    } else if (pathIds.length) {
      e.push('steps 缺失');
    }
    var cards = m.panel && Array.isArray(m.panel.cards) ? m.panel.cards : null;
    var edges = m.panel && Array.isArray(m.panel.edges) ? m.panel.edges : null;
    if (!cards || cards.length < 1 || cards.length > 4) e.push('panel.cards 必须为 1–4 个');
    else cards.forEach(function (c, i) {
      if (!isStr(c.id) || !isStr(c.name)) e.push('panel.cards[' + i + '] 缺 id/name');
    });
    if (cards && edges && edges.length !== cards.length - 1) {
      e.push('panel edges 数量应等于 cards-1（' + cards.length + '卡' + edges.length + '边）');
    }
    /* ---------- schema v2.2：branches 场景分支（站内/XN/NG 等多信令图） ----------
       m.branches = [{id,label}]（不含 fail）；m.paths 每个场景 id 一条路径；panelMap 同步要求。 */
    if (m.branches != null) {
      if (!Array.isArray(m.branches) || m.branches.length < 1) {
        e.push('branches 必须是非空数组');
      } else {
        var branchIds = [];
        m.branches.forEach(function (b, i) {
          if (!b || typeof b !== 'object') { e.push('branches[' + i + '] 必须是对象'); return; }
          if (!/^[a-z][a-zA-Z0-9]*$/.test(b.id || '')) e.push('branches[' + i + '].id 格式非法（小写字母开头）: ' + b.id);
          else if (branchIds.indexOf(b.id) >= 0) e.push('branches[' + i + '].id 重复: ' + b.id);
          else branchIds.push(b.id);
          if (!isStr(b.label)) e.push('branches[' + i + '].label 不能为空');
          if (m.paths && !Array.isArray(m.paths[b.id])) e.push('paths.' + b.id + ' 缺失（branches 声明的场景必须有路径）');
        });
        if (branchIds.length && branchIds[0] !== 'success') e.push('branches[0].id 必须是 success（默认场景）');
        if (m.paths) Object.keys(m.paths).forEach(function (k) {
          if (k !== 'fail' && branchIds.indexOf(k) < 0) {
            e.push('paths.' + k + ' 未在 branches 中声明（场景分支必须显式声明，防拼写孤儿）');
          }
        });
      }
    }
    if (m.panelMap) {
      var cardIds = cards ? cards.map(function (c) { return c.id; }) : [];
      var branches = m.branches ? m.branches.map(function (b) { return b.id; }) : ['success'];
      if (m.paths && Array.isArray(m.paths.fail)) branches.push('fail');
      branches.forEach(function (br) {
        var pm = m.panelMap[br];
        var plen = m.paths && m.paths[br] ? m.paths[br].length : 0;
        if (!pm) { e.push('paths.' + br + ' 存在但 panelMap.' + br + ' 缺失'); return; }
        var ks = Object.keys(pm).map(Number).filter(function (n) { return isInt(n); }).sort(function (a, b) { return a - b; });
        if (ks.indexOf(0) < 0) e.push('panelMap.' + br + ' 缺少键 0');
        if (plen && ks.indexOf(plen) < 0) e.push('panelMap.' + br + ' 缺少末位键 ' + plen);
        ks.forEach(function (k) {
          if (k < 0 || k > plen) e.push('panelMap.' + br + '[' + k + '] 越界');
          var st = pm[k];
          if (!st || !Array.isArray(st.on)) { e.push('panelMap.' + br + '[' + k + '].on 必须是数组'); return; }
          st.on.forEach(function (cid) { if (cardIds.indexOf(cid) < 0) e.push('panelMap.' + br + '[' + k + '] 引用不存在的卡片: ' + cid); });
          if (st.failed != null && cardIds.indexOf(st.failed) < 0) e.push('panelMap.' + br + '[' + k + '] failed 卡片不存在: ' + st.failed);
          if (st.edge != null && (!isInt(st.edge) || !edges || st.edge < 0 || st.edge >= edges.length)) {
            e.push('panelMap.' + br + '[' + k + '].edge 越界');
          }
        });
      });
    } else {
      e.push('panelMap 缺失');
    }
    /* ---------- schema v2 叠加规则：条款锚定 + 结构化 IE + 失败分支 + 决策点 ---------- */
    if (v2) {
      /* IE 节点校验（v2.2 递归：children 树 / meta 比喻 / vals 枚举值，深度限 3 层嵌套） */
      function validateIe(ie, where, depth) {
        if (!ie || typeof ie !== 'object') { e.push(where + ' 必须是结构化对象 {name,type,pres,sem,ref}（v2 禁止 v1 字符串）'); return; }
        if (!isStr(ie.name)) e.push(where + '.name 不能为空');
        if (!isStr(ie.type)) e.push(where + '.type 不能为空');
        if (['M', 'O', 'C'].indexOf(ie.pres) < 0) e.push(where + '.pres 必须是 M/O/C');
        if (!isStr(ie.sem)) e.push(where + '.sem（语义讲解）不能为空');
        if (ie.focus != null && ['core', 'extra'].indexOf(ie.focus) < 0) e.push(where + '.focus 必须是 core/extra（默认 core=重点字段，extra=展开才显示的完整字段）');
        if (!isClauseRef(ie.ref)) e.push(where + '.ref 条款号格式非法: ' + ie.ref);
        else if (clauseMissing(ie.ref)) e.push(where + '.ref 条款在条款树中不存在: ' + ie.ref);
        if (ie.meta != null && !isStr(ie.meta)) e.push(where + '.meta（形象比喻）存在时必须是非空字符串');
        if (ie.vals != null) {
          if (!Array.isArray(ie.vals) || ie.vals.length < 1) e.push(where + '.vals 必须是非空数组 [{v,note?}]');
          else (Array.isArray(ie.vals) ? ie.vals : []).forEach(function (v, j) {
            if (!v || typeof v !== 'object' || !isStr(v.v)) e.push(where + '.vals[' + j + '].v 不能为空');
            if (v && v.note != null && !isStr(v.note)) e.push(where + '.vals[' + j + '].note 存在时必须是非空字符串');
          });
        }
        if (ie.children != null) {
          if (!Array.isArray(ie.children) || ie.children.length < 1) e.push(where + '.children 必须是非空数组（树状子字段）');
          else if (depth >= 7) e.push(where + '.children 嵌套深度超限（最多 7 层：RRCReconfiguration 版本扩展链需要深树）');
          else ie.children.forEach(function (c, j) { validateIe(c, where + '.children[' + j + ']', depth + 1); });
        }
      }
      if (m.steps && typeof m.steps === 'object') {
        Object.keys(m.steps).forEach(function (k) {
          var s = m.steps[k];
          if (!Array.isArray(s.refs) || s.refs.length === 0) {
            e.push('step ' + k + '.refs 必须是非空数组（v2 论断需条款锚点）');
          } else s.refs.forEach(function (r) {
            if (!isClauseRef(r)) e.push('step ' + k + '.refs 条款号格式非法（应如 5.3.3.2）: ' + r);
            else if (clauseMissing(r)) e.push('step ' + k + '.refs 条款在条款树中不存在: ' + r);
          });
          if (Array.isArray(s.ies)) s.ies.forEach(function (ie, i) {
            validateIe(ie, 'step ' + k + '.ies[' + i + ']', 0);
          });
        });
      }
      var hasFailPath = m.paths && Array.isArray(m.paths.fail);
      if (hasFailPath && (!Array.isArray(m.failures) || m.failures.length < 4)) {
        e.push('有失败路径的模块 failures 必填且 ≥4 项（规范枚举的失败分支全集）');
      }
      if (Array.isArray(m.failures)) {
        var fids = {};
        m.failures.forEach(function (f, i) {
          var where = 'failures[' + i + ']';
          if (!f || typeof f !== 'object') { e.push(where + ' 必须是对象'); return; }
          if (!isStr(f.id)) e.push(where + '.id 不能为空');
          else if (fids[f.id]) e.push(where + '.id 重复: ' + f.id);
          else fids[f.id] = true;
          if (!isStr(f.cond)) e.push(where + '.cond（触发条件）不能为空');
          if (f.timer !== null && typeof f.timer !== 'string') e.push(where + '.timer 必须是字符串或显式 null（null=确认该分支无定时器）');
          if (!isStr(f.trans)) e.push(where + '.trans（状态去向）不能为空');
          if (!isStr(f.kpi)) e.push(where + '.kpi（影响）不能为空');
          if (!isClauseRef(f.ref)) e.push(where + '.ref 条款号格式非法: ' + f.ref);
          else if (clauseMissing(f.ref)) e.push(where + '.ref 条款在条款树中不存在: ' + f.ref);
          if (f.deep != null && !isStr(f.deep)) e.push(where + '.deep（深度详解）存在时必须是非空字符串');
        });
      }
      if (!Array.isArray(m.decisionPoints) || m.decisionPoints.length < 2) {
        e.push('decisionPoints 必填且 ≥2 项（决策式播放）');
      } else {
        var scIds = m.branches ? m.branches.map(function (b) { return b.id; }) : ['success'];
        m.decisionPoints.forEach(function (d, i) {
          var where = 'decisionPoints[' + i + ']';
          var dpBranch = (d && d.branch) || 'success';
          if (d && d.branch != null && scIds.indexOf(d.branch) < 0) {
            e.push(where + '.branch 引用不存在的场景分支: ' + d.branch);
          }
          var dlen = (m.paths && m.paths[dpBranch]) ? m.paths[dpBranch].length :
            (m.paths && Array.isArray(m.paths.success) ? m.paths.success.length : 0);
          if (!d || typeof d !== 'object') { e.push(where + ' 必须是对象'); return; }
          if (!isInt(d.at) || d.at < 0 || d.at >= dlen) e.push(where + '.at 越界（应在 ' + dpBranch + ' 路径 0–' + (dlen - 1) + '）: ' + d.at);
          if (!isStr(d.q)) e.push(where + '.q 不能为空');
          if (!Array.isArray(d.options) || d.options.length < 2 || d.options.length > 4) {
            e.push(where + '.options 必须为 2–4 个');
          } else {
            d.options.forEach(function (o, j) { if (!isStr(o)) e.push(where + '.options[' + j + '] 不能为空'); });
            if (!isInt(d.correct) || d.correct < 0 || d.correct >= d.options.length) e.push(where + '.correct 越界: ' + d.correct);
          }
          if (!isStr(d.why)) e.push(where + '.why 不能为空');
          if (!isClauseRef(d.ref)) e.push(where + '.ref 条款号格式非法: ' + d.ref);
          else if (clauseMissing(d.ref)) e.push(where + '.ref 条款在条款树中不存在: ' + d.ref);
        });
      }
    }
    var qmin = 3, qmax = v2 ? 5 : 3;
    if (!Array.isArray(m.quiz) || m.quiz.length < qmin || m.quiz.length > qmax) {
      e.push('quiz 必须 ' + qmin + (qmax !== qmin ? '–' + qmax : '') + ' 题');
    } else m.quiz.forEach(function (q, i) {
      if (!isStr(q.q)) e.push('quiz[' + i + '].q 不能为空');
      if (!Array.isArray(q.o) || q.o.length !== 4) e.push('quiz[' + i + '].o[] 选项必须 4 个');
      else q.o.forEach(function (o, j) { if (!isStr(o)) e.push('quiz[' + i + '].o[' + j + '] 选项必须是非空字符串'); });
      if (!isInt(q.a) || q.a < 0 || q.a > 3) e.push('quiz[' + i + '].a 越界');
      if (!isStr(q.why)) e.push('quiz[' + i + '].why 不能为空');
      if (v2 && q.ref != null) {
        if (!isClauseRef(q.ref)) e.push('quiz[' + i + '].ref 条款号格式非法: ' + q.ref);
        else if (clauseMissing(q.ref)) e.push('quiz[' + i + '].ref 条款在条款树中不存在: ' + q.ref);
      }
    });
    return e;
  }

  function register(m) {
    var errs = validateModule(m);
    if (errs.length) throw new Error('模块 ' + (m && m.id) + ' 未通过 schema 校验:\n- ' + errs.join('\n- '));
    if (byId[m.id]) throw new Error('模块 id 重复: ' + m.id);
    DB.push(m); byId[m.id] = m;
  }
  function _unregister(id) {
    DB = DB.filter(function (m) { return m.id !== id; }); delete byId[id];
  }
  function modules() { return DB.slice().sort(function (a, b) { return a.num - b.num; }); }
  function get(id) { return byId[id] || null; }
  function order() { return modules().map(function (m) { return m.id; }); }

  /* ---------- 工具 ---------- */
  function clampIdx(i, len) { return Math.max(0, Math.min(i, len)); }
  function pathIds(m, branch) { return m.paths[branch] || []; }
  /* panelMap 键继承：取 ≤idx 的最大已定义键；无该分支返回空态 */
  function panelStateFor(m, branch, idx) {
    var empty = { on: [], failed: null, edge: null };
    var pm = m.panelMap && m.panelMap[branch];
    if (!pm) return empty;
    var ks = Object.keys(pm).map(Number).filter(function (n) { return isInt(n); })
      .sort(function (a, b) { return a - b; }).filter(function (k) { return k <= idx; });
    if (!ks.length) return empty;
    var st = pm[ks[ks.length - 1]];
    return { on: st.on.slice(), failed: st.failed || null, edge: st.edge == null ? null : st.edge };
  }

  /* ---------- 测验判分 ---------- */
  var Checkers = {
    quiz: function (q, choice) { return { correct: isInt(choice) && choice === q.a }; }
  };

  /* ---------- 进度/授权存储（storage 可注入，浏览器默认 localStorage） ---------- */
  var KEY = 'rrc.v1';
  function Store(storage) {
    var st = storage || (typeof localStorage !== 'undefined' ? localStorage : null);
    if (!st) throw new Error('Store 需要可用的 storage（注入或 localStorage）');
    function read() {
      try {
        var raw = st.getItem(KEY);
        if (!raw) return fresh();
        var v = JSON.parse(raw);
        if (!v || typeof v !== 'object') return fresh();
        return {
          progress: v.progress && typeof v.progress === 'object' ? v.progress : {},
          quiz: v.quiz && typeof v.quiz === 'object' ? v.quiz : {},
          license: v.license && typeof v.license === 'object' ? v.license : { demo: false }
        };
      } catch (x) { return fresh(); } /* 损坏数据安全回退 */
    }
    function fresh() { return { progress: {}, quiz: {}, license: { demo: false } }; }
    function write(v) { st.setItem(KEY, JSON.stringify(v)); }
    return {
      all: read,
      progress: function (id) { var v = read(); return v.progress[id] || null; },
      markDone: function (id, steps) { var v = read(); v.progress[id] = { done: true, steps: steps }; write(v); },
      quizScore: function (id) { var v = read(); return v.quiz[id] || null; },
      setQuizScore: function (id, got, total) { var v = read(); v.quiz[id] = { got: got, total: total }; write(v); },
      license: function () { var v = read(); return { demo: !!v.license.demo }; },
      setLicense: function (l) { var v = read(); v.license = { demo: !!l.demo }; write(v); },
      reset: function () { st.removeItem(KEY); }
    };
  }

  /* ---------- 信元词典（IEDict）：跨消息复用的信元知识库 ----------
     条目 {k, term, brief, full, refs, spec}；消息 ies[].dict 挂键，
     player 渲染"词典详解"链接跳 dict.html#k=…。注册不校验唯一性以外的东西，
     词典内容的条款锚定由 dict.html 与复核材料包负责。 */
  var IEDICT = {};
  g.RRC = {
    register: register, _unregister: _unregister,
    modules: modules, get: get, order: order,
    validateModule: validateModule,
    setClauseIndex: function (idsOrMap) { clauseIndex = normClauseIndex(idsOrMap); },
    _clearClauseIndex: function () { clauseIndex = null; },
    utils: { clampIdx: clampIdx, pathIds: pathIds, panelStateFor: panelStateFor },
    Checkers: Checkers,
    Store: Store,
    DIRS: DIRS,
    IEDict: {
      register: function (entries) {
        (entries || []).forEach(function (it) {
          if (!it || typeof it.k !== 'string' || !it.k) throw new Error('IEDict 条目缺 k');
          IEDICT[it.k] = it;
        });
      },
      get: function (k) { return IEDICT[k] || null; },
      keys: function () { return Object.keys(IEDICT).sort(); },
      all: function () { return IEDICT; }
    }
  };
})(typeof window !== 'undefined' ? window : globalThis);
