/* ============================================================
   assets/engine 的 DOM 侧 — assets/player.js
   依赖：engine.js（RRC）、site.css。提供：
   - RRC.mountPlayer(root, moduleId, {store}) → controller
   - RRC.Gate.render(root, moduleId, store, onUnlocked)
   - RRC.Hub.render(root, store, opts)
   控制器暴露 fwd/back/play/pause/setBranch/state/unmount（e2e 用）。
   ============================================================ */
(function (g) {
  'use strict';
  var R = g.RRC;
  var WIRE = { ul: '#B45309', dl: '#2563EB', nas: '#7C3AED' };
  var DIRTEXT = {
    ul: ['上行 →', 'dir-ul'], dl: ['← 下行', 'dir-dl'], nas: ['→ 核心网/站间', 'dir-nas'],
    int: ['UE 内部动作', 'dir-int'], warn: ['失败分支', 'dir-warn']
  };
  var LOCK_SVG = '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/></svg>';
  var CHECK_SVG = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><path d="M20 6 9 17l-5-5"/></svg>';

  function el(tag, cls, html) {
    var d = document.createElement(tag);
    if (cls) d.className = cls;
    if (html != null) d.innerHTML = html;
    return d;
  }
  function svg(tag, attrs) {
    var n = document.createElementNS('http://www.w3.org/2000/svg', tag);
    for (var k in attrs) n.setAttribute(k, attrs[k]);
    return n;
  }
  function txtEst(s) { // 单行文本宽度粗估（CJK≈12px，ASCII≈7px @12.5px mono）
    var w = 0;
    for (var i = 0; i < s.length; i++) w += s.charCodeAt(i) > 0x2e80 ? 12.5 : 7.4;
    return w;
  }
  /* 内容数据里的 **强调** → <strong>（内容与展示解耦：内容文件可写纯 Markdown 强调） */
  function mdBold(s) {
    return String(s).replace(/\*\*([^*\n]+)\*\*/g, '<strong>$1</strong>');
  }
  /* ================= 确定性选项洗牌（v6 块 1）=================
     课内测验/决策点此前按 authored 序渲染，而课程数据大多把正确项写在 options[0]
     → 正确答案恒在 A 位，背位置即可全对。改用 mulberry32(strHash(模块id+题号))
     生成确定性置换：同一题每次渲染布局恒定（防"刷新来回跳"），永不 Math.random。
     渲染按置换序输出、点击/判分/高亮全部映射回 authored 序，课程数据与 schema 零改动。 */
  function strHash(s) {
    var h = 2166136261 >>> 0;
    for (var i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
    return h >>> 0;
  }
  function mulberry32(a) {
    return function () {
      a |= 0; a = (a + 0x6D2B79F5) | 0;
      var t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  /* 返回 disp2auth：显示位 di 放 authored 第 disp2auth[di] 个选项。Fisher-Yates；
     小概率撞出恒等置换时轮转一位兜底（结果仍是确定性双射）。 */
  function optionPerm(key, n) {
    var rnd = mulberry32(strHash(key));
    var arr = [], i, j, t;
    for (i = 0; i < n; i++) arr.push(i);
    for (j = n - 1; j > 0; j--) {
      var k = Math.floor(rnd() * (j + 1));
      t = arr[j]; arr[j] = arr[k]; arr[k] = t;
    }
    var identity = true;
    for (i = 0; i < n; i++) if (arr[i] !== i) { identity = false; break; }
    if (identity && n > 1) arr.push(arr.shift());
    return arr;
  }
  /* ================= 信元树（v2.2）=================
     行=字段节点：点行看详情（比喻/语义/枚举值/条款），点箭头展开子字段。
     参考形态：工程侧信令解析工具的"信元树"（左树右详情的紧凑内联版）。 */
  var TOG_SVG = '<svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><path d="M9 5.5l7 6.5-7 6.5z"/></svg>';
  var META_SVG = '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-4 10.5c.8.7 1 1.5 1 2.5h6c0-1 .2-1.8 1-2.5A6 6 0 0 0 12 3z"/></svg>';
  function countExtra(nodes) {
    var n = 0;
    nodes.forEach(function (ie) {
      if (ie.focus === 'extra') n++;
      if (ie.children) n += countExtra(ie.children);
    });
    return n;
  }
  function ieNodeHtml(ie, depth) {
    var kids = ie.children || [];
    var vals = ie.vals || [];
    var dictHit = ie.dict && R.IEDict ? R.IEDict.get(ie.dict) : null;
    return '<div class="ie-row d' + depth + (ie.focus === 'extra' ? ' extra' : '') + (kids.length ? ' has-kids' + (depth < 2 ? ' kids-open' : '') : '') + '">' +
      '<div class="ie-head" role="button" tabindex="0">' +
      '<span class="ie-top">' +
      (kids.length
        ? '<span class="ie-tog" data-act="ie-tog" role="button" tabindex="0" aria-label="展开/收起子字段">' + TOG_SVG + '</span>'
        : '<span class="ie-tog leaf"></span>') +
      '<span class="ie-name">' + ie.name + '</span>' +
      '<span class="ie-pres p-' + String(ie.pres).toLowerCase() + '" title="presence：M=必选 O=可选 C=条件出现">' + ie.pres + '</span>' +
      '</span>' +
      '<span class="ie-type">' + ie.type + '</span>' +
      '</div>' +
      '<div class="ie-detail">' +
      (ie.meta ? '<div class="ie-meta">' + META_SVG + '<span>' + mdBold(ie.meta) + '</span></div>' : '') +
      '<div class="ie-sem">' + mdBold(ie.sem) + '</div>' +
      (vals.length
        ? '<div class="ie-vals"><div class="ie-vals-cap">枚举值一览（共 ' + vals.length + ' 个，点开看白话）</div>' +
          vals.map(function (v) {
            return '<div class="ie-val"><code>' + v.v + '</code>' + (v.note ? '<span>' + mdBold(v.note) + '</span>' : '') + '</div>';
          }).join('') + '</div>'
        : '') +
      '<div class="ie-refrow">' +
      '<span class="ref-badge" title="条款锚点（本字段定义出处）">§' + ie.ref + '</span>' +
      (dictHit ? '<a class="ie-dict" href="dict.html#k=' + encodeURIComponent(ie.dict) + '" title="信元词典：' + dictHit.term + '">词典详解 →</a>' : '') +
      '</div>' +
      '</div>' +
      (kids.length
        ? '<div class="ie-kids">' + kids.map(function (c) { return ieNodeHtml(c, depth + 1); }).join('') + '</div>'
        : '') +
      '</div>';
  }

  /* ================= 播放器 ================= */
  function mountPlayer(root, moduleId, opts) {
    opts = opts || {};
    var store = opts.store || R.Store();
    var m = R.get(moduleId);
    if (!m) throw new Error('未知模块: ' + moduleId);
    var branch = 'success', scenario = 'success', idx = 0, playing = false, speed = 0.75, timer = null;
    var scenarios = (m.branches && m.branches.length > 1) ? m.branches : null;

    if (g.RRCPlayer) { try { g.RRCPlayer.unmount(); } catch (e0) {} }
    root.innerHTML = '';
    /* ---- 布局骨架 ---- */
    var bench = el('div', 'workbench');
    var panelL = el('aside', 'panel');
    var panelC = el('section', 'panel canvas-panel');
    var panelR = el('aside', 'panel');
    bench.appendChild(panelL); bench.appendChild(panelC); bench.appendChild(panelR);
    root.appendChild(bench);

    /* ---- 动手沙盘角标（v8 块 5）：仅测量两课显示，链参数沙盘 ---- */
    if (moduleId === 'm3' || moduleId === 'm42') {
      var sbJump = el('div', 'sb-jump');
      sbJump.setAttribute('style', 'margin:10px 0 2px;padding:9px 14px;border:1px dashed var(--bd);border-radius:10px;font-size:12.5px;color:var(--tx2);background:var(--panel)');
      sbJump.innerHTML = '🧪 <b>动手沙盘</b>：本课的 L3 滤波、A3 门限、TTT 判据与速度缩放可以在参数沙盘里亲手拖一拖 —— <a href="meas-sandbox.html">打开参数沙盘 →</a>';
      root.appendChild(sbJump);
    }

    /* ---- 左：锚点面板 ---- */
    panelL.appendChild(el('div', 'panel-head', m.panelTitle || '状态 / 阶段'));
    var cardEls = {}, edgeEls = [];
    m.panel.cards.forEach(function (c, i) {
      var card = el('div', 'state-card' + (c.locked ? ' locked' : ''));
      card.innerHTML = '<div class="st-name">' + (c.locked ? LOCK_SVG : '<span class="dot"></span>') + c.name + '</div>' +
        '<div class="st-desc">' + c.desc + '</div>' +
        (c.id ? '<span class="failtag">' + (m.failTagText || '失败 · 见信令图') + '</span>' : '');
      cardEls[c.id] = card;
      panelL.appendChild(card);
      if (i < m.panel.edges.length) {
        var e = el('div', 'state-edge');
        e.innerHTML = '<span class="elabel">' + m.panel.edges[i].label + '</span>';
        if (m.panel.edges[i].dim) e.style.opacity = .6;
        edgeEls.push(e); panelL.appendChild(e);
      }
    });
    panelL.appendChild(el('div', 'state-note', '<b>读法：</b>' + (m.panelNote || '信令图每走一步，这里实时点亮当前所处状态/阶段。')));

    /* ---- 中：时序画布 ---- */
    panelC.appendChild(el('div', 'panel-head', '信令时序 · ' + m.title +
      '<span class="legend"><span><i style="background:var(--ul)"></i>上行</span>' +
      '<span><i style="background:var(--dl)"></i>下行</span>' +
      '<span><i style="background:var(--nas)"></i>核心网/站间</span></span>'));
    var wrap = el('div', 'canvas-wrap');
    var hint = el('div', 'canvas-hint',
      '<div>点 <b style="color:var(--accent)">▶</b> 播放，逐帧看流程怎么走</div>' +
      '<div><span class="kb">←</span><span class="kb">→</span> 步进 · <span class="kb">Space</span> 播放/暂停</div>');
    var svgRoot = buildSeq(m);
    wrap.appendChild(svgRoot); wrap.appendChild(hint);
    panelC.appendChild(wrap);

    /* 控件条 */
    var controls = el('div', 'controls');
    var btnReplay = ctlBtn('<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M3 12a9 9 0 1 0 3-6.7"/><path d="M3 4v5h5"/></svg>', '重播');
    var btnBack = ctlBtn('<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M18 5v14L8.5 12z"/><rect x="5" y="5" width="2.4" height="14" rx="1"/></svg>', '上一步');
    var btnPlay = ctlBtn('<svg id="ic-play-' + m.id + '" width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M7 4.8v14.4L19.2 12z"/></svg>' +
      '<svg id="ic-pause-' + m.id + '" width="14" height="14" viewBox="0 0 24 24" fill="currentColor" style="display:none"><rect x="6" y="5" width="4" height="14" rx="1"/><rect x="14" y="5" width="4" height="14" rx="1"/></svg>', '播放/暂停', true);
    var dots = el('div', 'dots');
    var speedBox = el('div', 'speed');
    speedBox.title = '播放速度：0.75× 为新手默认（每步约 5.6 秒），熟练后可加快';
    [['0.5', 0.5], ['0.75', 0.75], ['1', 1], ['1.5', 1.5], ['2', 2]].forEach(function (p, i) {
      var b = el('button', p[1] === 0.75 ? 'on' : '', p[0] + '×'); b.dataset.s = p[1];
      b.onclick = function () {
        speed = p[1];
        speedBox.querySelectorAll('button').forEach(function (x) { x.classList.toggle('on', x === b); });
      };
      speedBox.appendChild(b);
    });
    controls.appendChild(btnReplay); controls.appendChild(btnBack); controls.appendChild(btnPlay);
    controls.appendChild(dots); controls.appendChild(speedBox);
    /* 场景分支（v2.2：站内/XN/NG 等多信令图）——分段按钮，切换整套信令图 */
    var scnBox = null;
    if (scenarios) {
      scnBox = el('div', 'scn');
      scnBox.title = '切换场景：每套场景有独立信令图';
      scenarios.forEach(function (sc) {
        var b = el('button', '', sc.label);
        b.dataset.scn = sc.id;
        b.setAttribute('aria-label', '场景：' + sc.label);
        b.onclick = function () { setBranch(sc.id); };
        scnBox.appendChild(b);
      });
      controls.insertBefore(scnBox, dots);
    }
    var branchCtl = null;
    if (m.paths.fail) {
      branchCtl = el('label', 'branch');
      branchCtl.innerHTML = '<span>' + (m.failLabel || '失败分支') + '</span>' +
        '<span class="switch"><input type="checkbox"><span class="tr"></span><span class="kn"></span></span>';
      var sw = branchCtl.querySelector('input');
      sw.onchange = function () { setBranch(sw.checked ? 'fail' : scenario); };
      controls.appendChild(branchCtl);
    }
    panelC.appendChild(controls);
    /* 打印讲义（卅六轮）：@media print 隐藏交互控件，保留讲解正文与信令图 */
    var btnPrint = ctlBtn('<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 9V3h12v6M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>', '打印本页讲义');
    btnPrint.onclick = function () { window.print(); };
    controls.appendChild(btnPrint);

    /* ---- 右：讲解（含"一句话版"初学开关，本机记忆） ---- */
    var plainMode = (function () { try { return localStorage.getItem('rrc.plain') !== '0'; } catch (e0) { return true; } })();
    var headR = el('div', 'panel-head');
    headR.innerHTML = '讲解 <span style="text-transform:none;letter-spacing:0">大白话 + 类比</span>' +
      '<label class="plain-toggle" title="开：每步先给一句外行也能懂的白话；关：只看完整讲解"><input type="checkbox"' + (plainMode ? ' checked' : '') + '><span class="pt-track"><span class="pt-knob"></span></span>一句话版</label>';
    var ptInput = headR.querySelector('input');
    ptInput.onchange = function () {
      plainMode = ptInput.checked;
      try { localStorage.setItem('rrc.plain', plainMode ? '1' : '0'); } catch (e1) {}
      renderExplain();
    };
    panelR.appendChild(headR);
    var explain = el('div');
    panelR.appendChild(explain);

    /* ---- 失败分支全集卡（schema v2）——全宽区，移出工作台避免右栏过长 ---- */
    if (m.failures && m.failures.length) {
      var deck = el('section', 'fail-deck');
      deck.innerHTML = '<div class="fd-head">失败分支全集 · 规范枚举</div>' +
        '<p class="fd-sub">信令图演示的只是其中一条路。规范为本过程定义的全部失败出口如下——每条都能挂到条款。</p>' +
        '<div class="fgrid">' +
        m.failures.map(function (f) {
          return '<div class="fail-card">' +
            '<div class="fc-top"><span class="fc-id">' + f.id + '</span>' +
            (f.timer ? '<span class="fc-timer" title="相关定时器">' + f.timer + '</span>' : '') +
            '<span class="ref-badge" title="TS 38.331 Rel-19 条款 ' + f.ref + '">§' + f.ref + '</span></div>' +
            '<div class="fc-field"><b>触发</b><span>' + mdBold(f.cond) + '</span></div>' +
            '<div class="fc-field"><b>去向</b><span>' + mdBold(f.trans) + '</span></div>' +
            '<div class="fc-field"><b>影响</b><span>' + mdBold(f.kpi) + '</span></div>' +
            (f.deep ? '<div class="fc-deep">' + mdBold(f.deep) + '</div>' : '') +
            '</div>';
        }).join('') + '</div>';
      root.appendChild(deck); /* bench 之后、quiz 之前（此刻 quiz 尚未创建） */
    }

    /* ---- 测验 ---- */
    var quizSec = el('section', 'quiz');
    quizSec.appendChild(el('h2', 'sec', '自测 · 面试风格 ' + m.quiz.length + ' 题'));
    quizSec.appendChild(el('p', 'sec-sub', '答错会显示解析；全部答完自动记分（进度存本机浏览器）。'));
    var qgrid = el('div', 'qgrid');
    quizSec.appendChild(qgrid);
    root.appendChild(quizSec);
    var gotCount = 0, answered = 0;
    var scoreLine = el('div', 'quiz-score');
    m.quiz.forEach(function (q, qi) {
      var card = el('div', 'qcard');
      card.innerHTML = '<div class="qtag">Q' + (qi + 1) + '</div><div class="qtext">' + mdBold(q.q) + '</div>';
      var box = el('div', 'opts');
      var why = el('div', 'why');
      var d2a = optionPerm(m.id + ':q' + qi, q.o.length);
      var a2d = {};
      d2a.forEach(function (ai, di) { a2d[ai] = di; });
      d2a.forEach(function (ai, di) {
        var b = el('button', 'opt', String.fromCharCode(65 + di) + ' · ' + q.o[ai]);
        b.setAttribute('data-authored', String(ai));
        b.onclick = function () {
          box.querySelectorAll('.opt').forEach(function (x) { x.disabled = true; });
          var res = R.Checkers.quiz(q, ai);
          if (res.correct) { b.classList.add('correct'); gotCount++; why.innerHTML = '<b>答对了。</b>' + mdBold(q.why); }
          else {
            b.classList.add('wrong');
            box.querySelector('.opt[data-authored="' + q.a + '"]').classList.add('correct');
            why.className = 'why wrong-ans';
            why.innerHTML = '<b>不对，选 ' + String.fromCharCode(65 + a2d[q.a]) + '。</b>' + mdBold(q.why);
          }
          answered++;
          why.classList.add('show');
          if (!card.contains(why)) card.appendChild(why);
          if (answered === m.quiz.length) {
            scoreLine.innerHTML = '本模块得分：<b>' + gotCount + ' / ' + m.quiz.length + '</b>' +
              (gotCount === m.quiz.length ? ' · 全对，可以进入下一模块' : ' · 建议回看上面答错步骤的讲解');
            quizSec.appendChild(scoreLine);
            store.setQuizScore(m.id, gotCount, m.quiz.length);
          }
        };
        box.appendChild(b);
      });
      card.appendChild(box); qgrid.appendChild(card);
    });

    /* ---- 引擎状态机 ---- */
    function pathLen() { return m.paths[branch].length; }
    function stepFwd() { if (idx < pathLen()) { idx++; render(); return true; } return false; }
    function play() {
      if (playing) { pause(); return; }
      if (idx >= pathLen()) idx = 0;
      playing = true; icon(); loop();
    }
    function loop() {
      clearTimeout(timer);
      timer = setTimeout(function () {
        if (!stepFwd()) { pause(); return; }
        if (playing) loop();
      }, (idx === 0 ? 2400 : 4200) / speed);
    }
    function pause() { playing = false; clearTimeout(timer); icon(); }
    function icon() {
      var p = document.getElementById('ic-play-' + m.id), q = document.getElementById('ic-pause-' + m.id);
      if (p && q) { p.style.display = playing ? 'none' : 'block'; q.style.display = playing ? 'block' : 'none'; }
    }
    function setBranch(b) {
      if (!m.paths[b]) b = 'success';
      var curSid = idx > 0 ? m.paths[branch][idx - 1] : null;
      pause();
      /* 跨场景/失败切换：当前步若在新路径中存在则原地保留，否则截断到新路径长度 */
      var pos = curSid ? m.paths[b].indexOf(curSid) : -1;
      if (pos >= 0) idx = pos + 1;
      else idx = Math.min(idx, m.paths[b].length);
      if (b !== 'fail') scenario = b;
      branch = b;
      rebuildSeq(); render(); syncBranchCtl();
    }
    function syncBranchCtl() {
      if (scnBox) [].forEach.call(scnBox.children, function (x) {
        x.classList.toggle('on', x.dataset.scn === branch);
      });
      if (branchCtl) branchCtl.querySelector('input').checked = (branch === 'fail');
    }
    function render() {
      var p = m.paths[branch];
      svgRoot.querySelectorAll('g.msg').forEach(function (gEl) {
        var pos = p.indexOf(gEl.dataset.step);
        var inPath = pos > -1;
        gEl.classList.toggle('active', inPath && pos === idx - 1);
        gEl.classList.toggle('past', inPath && pos < idx - 1);
        gEl.classList.toggle('future', !inPath || pos >= idx);
      });
      var st = R.utils.panelStateFor(m, branch, idx);
      m.panel.cards.forEach(function (c) {
        cardEls[c.id].classList.toggle('on', st.on.indexOf(c.id) >= 0 && st.failed !== c.id);
        cardEls[c.id].classList.toggle('failed', st.failed === c.id);
      });
      edgeEls.forEach(function (e, i) { e.classList.toggle('on', st.edge === i); });
      hint.classList.toggle('off', idx > 0);
      renderExplain();
      if (idx === pathLen()) store.markDone(m.id, pathLen());
      renderDots();
    }
    /* ---- 决策点作答状态（本 mount 内保留；"你就是 UE"） ---- */
    var dpAnswered = {};
    function plainHtml(d) {
      return (plainMode && d && d.plain)
        ? '<div class="plain-box"><span class="pb-cap">一句话看懂</span><p>' + d.plain + '</p></div>'
        : '';
    }

    function renderExplain() {
      var d, dir;
      if (idx === 0) {
        d = m.intro || { title: '开场', narr: '按播放开始。' }; dir = ['场景', 'dir-int'];
        explain.innerHTML = '<div class="explain-body"><div class="step-kicker">第 0 步 / 共 ' + pathLen() + ' 步 · ' +
          '<span class="' + dir[1] + '">' + dir[0] + '</span></div>' +
          '<h3 class="step-title">' + d.title + '</h3>' + plainHtml(d) + '<p class="step-narr">' + mdBold(d.narr) + '</p></div>';
        return;
      }
      d = m.steps[m.paths[branch][idx - 1]];
      dir = DIRTEXT[d.dir];
      /* 信元：v2 结构化对象 → 消息解剖树（v2.2：children 树/vals 枚举/meta 比喻）；v1 字符串 → chips */
      var iesHtml = '';
      if (d.ies.length) {
        if (typeof d.ies[0] === 'object') {
          var nExtra = countExtra(d.ies);
          iesHtml = '<div class="ie-table">' +
            '<div class="ie-cap"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 6h16M4 12h10M4 18h7"/></svg>消息解剖 · 拆开这条消息看信元' +
            (nExtra ? '<button class="ie-more" data-act="ie-more">展开全部字段（+' + nExtra + '）</button>' : '') +
            '</div>' +
            d.ies.map(function (ie) { return ieNodeHtml(ie, 0); }).join('') + '</div>';
        } else {
          iesHtml = '<div class="chips">' + d.ies.map(function (x) { return '<span class="chip-ie">' + x + '</span>'; }).join('') + '</div>';
        }
      }
      /* 规范出处徽章（v2 refs） */
      var refsHtml = (d.refs && d.refs.length)
        ? '<div class="refs-row"><span class="refs-cap">规范出处</span>' +
          d.refs.map(function (r) { return '<span class="ref-badge" title="TS 38.331 Rel-19 条款 ' + r + '（本步论断的锚点）">§' + r + '</span>'; }).join('') +
          '</div>'
        : '';
      /* 决策点卡（at === 当前步索引，且挂在本场景上） */
      var dp = null;
      if (m.decisionPoints) {
        for (var di = 0; di < m.decisionPoints.length; di++) {
          if ((m.decisionPoints[di].branch || 'success') === branch && m.decisionPoints[di].at === idx - 1) { dp = m.decisionPoints[di]; break; }
        }
      }
      var dpHtml = '';
      if (dp) {
        var key = 'at' + dp.at, picked = dpAnswered[key];
        var d2a = optionPerm(m.id + ':dp' + dp.at, dp.options.length);
        var a2d = {};
        d2a.forEach(function (ai, di) { a2d[ai] = di; });
        dpHtml = '<div class="dp-card">' +
          '<div class="dp-head"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 3.6-7 8-7s8 3 8 7"/></svg>你就是 UE · 此刻怎么选？</div>' +
          '<div class="dp-q">' + mdBold(dp.q) + '</div>' +
          '<div class="dp-opts">' + d2a.map(function (ai, di) {
            var cls = 'dp-opt';
            if (picked != null) {
              if (ai === dp.correct) cls += ' correct';
              else if (ai === picked) cls += ' wrong';
            }
            return '<button class="' + cls + '" data-i="' + ai + '"' + (picked != null ? ' disabled' : '') + '>' +
              String.fromCharCode(65 + di) + ' · ' + dp.options[ai] + '</button>';
          }).join('') + '</div>' +
          (picked != null ? '<div class="dp-why show"><b>' + (picked === dp.correct ? '选对了。' : '不对，正确是 ' + String.fromCharCode(65 + a2d[dp.correct]) + '。') + '</b>' + mdBold(dp.why) +
            ' <span class="ref-badge">§' + dp.ref + '</span></div>' : '') +
          '</div>';
      }
      explain.innerHTML = '<div class="explain-body">' +
        '<div class="step-kicker">第 ' + idx + ' 步 / 共 ' + pathLen() + ' 步 · <span class="' + dir[1] + '">' + dir[0] + '</span>' +
        ((d.ies && d.ies.length) ? ' · <a class="wb-link" href="lab.html" target="_blank" title="在 ASN 编码实验室里亲手编码这条消息">去编码实验室 ↗</a>' : '') +
        '</div>' +
        '<h3 class="step-title">' + d.title + '</h3>' +
        plainHtml(d) +
        '<p class="step-narr">' + mdBold(d.narr) + '</p>' +
        iesHtml + dpHtml + refsHtml +
        (d.exam ? '<div class="exambox"><div class="exam-head"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><circle cx="12" cy="12" r="9"/><path d="M12 8v5"/><circle cx="12" cy="16.6" r=".6" fill="currentColor"/></svg>面试考法</div><p>' + mdBold(d.exam) + '</p></div>' : '') +
        '</div>';
      /* 决策点交互绑定 */
      if (dp) {
        var optsEls = explain.querySelectorAll('.dp-opt');
        for (var oi = 0; oi < optsEls.length; oi++) {
          (function (b) {
            b.onclick = function () {
              dpAnswered['at' + dp.at] = parseInt(b.dataset.i, 10);
              renderExplain();
            };
          })(optsEls[oi]);
        }
      }
      /* 全字段展开/收起绑定：extra 显隐 + 所有子树节点 kids-open 联动（否则手动收起后按钮"看起来没反应"） */
      var moreBtn = explain.querySelector('[data-act="ie-more"]');
      if (moreBtn) {
        moreBtn.onclick = function () {
          var tbl = moreBtn.closest('.ie-table');
          var open = tbl.classList.toggle('all');
          var parents = tbl.querySelectorAll('.ie-row.has-kids');
          [].forEach.call(parents, function (r) { r.classList.toggle('kids-open', open); });
          var n = tbl.querySelectorAll('.ie-row.extra').length;
          moreBtn.textContent = open ? '收起全部字段' : '展开全部字段（+' + n + '）';
        };
      }
      /* 信元树交互：点行看详情（.open），点箭头展开子字段（.kids-open） */
      var heads = explain.querySelectorAll('.ie-head');
      for (var hi = 0; hi < heads.length; hi++) {
        (function (h) {
          h.onclick = function (ev) {
            if (ev.target.closest('[data-act="ie-tog"]')) return;
            h.parentNode.classList.toggle('open');
          };
        })(heads[hi]);
      }
      var togs = explain.querySelectorAll('[data-act="ie-tog"]:not(.leaf)');
      for (var ti = 0; ti < togs.length; ti++) {
        (function (t) {
          t.onclick = function (ev) {
            ev.stopPropagation();
            t.closest('.ie-row').classList.toggle('kids-open');
          };
        })(togs[ti]);
      }
    }
    function renderDots() {
      dots.innerHTML = '';
      for (var i = 0; i <= pathLen(); i++) {
        (function (i) {
          var b = el('button', 'pdot' + (i === idx ? ' on' : i < idx ? ' past' : ''));
          b.title = i === 0 ? '开场' : '第 ' + i + ' 步';
          b.setAttribute('aria-label', b.title);
          b.onclick = function () { pause(); idx = i; render(); };
          dots.appendChild(b);
        })(i);
      }
    }
    function rebuildSeq() {
      var ns = buildSeq(m, branch);
      wrap.removeChild(svgRoot); svgRoot = ns; wrap.insertBefore(ns, hint);
    }
    function onKey(e) {
      if (e.target.tagName === 'INPUT' || e.target.closest('.qcard')) return;
      if (e.code === 'ArrowRight') { pause(); stepFwd(); }
      else if (e.code === 'ArrowLeft') { pause(); if (idx > 0) { idx--; render(); } }
      else if (e.code === 'Space') { e.preventDefault(); play(); }
    }
    /* 点击信令图上的任一消息 → 直接切到那一步（委托在 wrap，rebuildSeq 换图后仍有效） */
    wrap.addEventListener('click', function (e) {
      var gEl = e.target.closest ? e.target.closest('g.msg') : null;
      if (!gEl || !gEl.dataset || !gEl.dataset.step) return;
      var pos = m.paths[branch].indexOf(gEl.dataset.step);
      if (pos < 0) return;
      pause(); idx = pos + 1; render();
    });
    document.addEventListener('keydown', onKey);
    btnPlay.onclick = play;
    btnBack.onclick = function () { pause(); if (idx > 0) { idx--; render(); } };
    btnReplay.onclick = function () { pause(); idx = 0; render(); play(); };
    var fwdBtn = ctlBtn('<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M6 5v14l9.5-7z"/><rect x="16.6" y="5" width="2.4" height="14" rx="1"/></svg>', '下一步');
    fwdBtn.onclick = function () { pause(); stepFwd(); };
    controls.insertBefore(fwdBtn, dots);

    render();
    syncBranchCtl();

    var controller = {
      fwd: function () { pause(); return stepFwd(); },
      back: function () { pause(); if (idx > 0) { idx--; render(); } },
      play: play, pause: pause, setBranch: setBranch,
      step: function () { return idx; },
      state: function () { return { idx: idx, branch: branch, pathLen: pathLen(), playing: playing }; },
      unmount: function () { pause(); document.removeEventListener('keydown', onKey); root.innerHTML = ''; }
    };
    g.RRCPlayer = controller;
    return controller;
  }

  function ctlBtn(iconHtml, title, primary) {
    var b = el('button', 'ctl' + (primary ? ' primary' : ''), iconHtml);
    b.title = title; b.setAttribute('aria-label', title);
    return b;
  }

  /* ================= SVG 时序图构建 ================= */
  function buildSeq(m, branch) {
    branch = branch || 'success';
    var path = m.paths[branch];
    var Y0 = 150, DY = 100;
    var H = Math.max(560, Y0 + (path.length - 1) * DY + 130);
    var root = svg('svg', { viewBox: '0 0 920 ' + H, preserveAspectRatio: 'xMidYMin meet', role: 'img', 'aria-label': m.title + ' 信令时序图' });
    var defs = svg('defs', {});
    [['ul', WIRE.ul], ['dl', WIRE.dl], ['nas', WIRE.nas], ['rd', '#DC2626']].forEach(function (p) {
      var mk = svg('marker', { id: 'ah-' + p[0], viewBox: '0 0 10 10', refX: 9, refY: 5, markerWidth: 7, markerHeight: 7, orient: 'auto-start-reverse' });
      mk.appendChild(svg('path', { d: 'M0 0 L10 5 L0 10 z', fill: p[1] }));
      defs.appendChild(mk);
    });
    root.appendChild(defs);

    /* actors + 生命线 */
    m.actors.forEach(function (a, i) {
      var g = svg('g', {});
      g.appendChild(svg('rect', { class: 'actor-box', x: a.x - 62, y: 10, width: 124, height: 46, rx: 8 }));
      g.appendChild(text(a.label, { class: 'actor-t', x: a.x, y: 30 }));
      g.appendChild(text(a.sub || '', { class: 'actor-s', x: a.x, y: 47 }));
      root.appendChild(g);
      root.appendChild(svg('line', { class: 'actor-sub', x1: a.x, y1: 58, x2: a.x, y2: H - 24 }));
      a._i = i;
    });

    path.forEach(function (sid, i) {
      var s = m.steps[sid];
      var y = Y0 + i * DY;
      var gEl = svg('g', { class: 'msg future', 'data-step': sid });
      var src = m.actors[s.from];
      if (s.dir === 'ul' || s.dir === 'dl' || s.dir === 'nas') {
        var dst = m.actors[s.to];
        var x1 = src.x, x2 = dst.x > src.x ? dst.x - 10 : dst.x + 10;
        var lineAttrs = { class: 'wire' + (s.dir === 'nas' ? ' nas' : ''), pathLength: 1, x1: x1, y1: y, x2: x2, y2: y, stroke: WIRE[s.dir], 'stroke-width': 1.8, 'marker-end': 'url(#ah-' + s.dir + ')' };
        if (s.dir === 'nas') { lineAttrs['stroke-dasharray'] = '6 5'; lineAttrs['stroke-width'] = 1.6; }
        gEl.appendChild(svg('line', lineAttrs));
        var mid = (x1 + dst.x) / 2;
        gEl.appendChild(text(s.label, { class: 'mlabel', x: mid, y: y - 16 }));
        gEl.appendChild(text(s.chan, { class: 'chan', x: mid, y: y + 20 }));
        gEl.appendChild(num(dst.x > src.x ? x1 + 34 : x1 - 34, y, i + 1));
      } else if (s.dir === 'int') {
        var bw = Math.max(150, Math.min(400, txtEst(s.label) + 30));
        gEl.appendChild(svg('rect', { class: 'intbox', x: src.x - 62, y: y - 16, width: bw, height: 34, rx: 7 }));
        gEl.appendChild(text(s.label, { class: 'intt', x: src.x - 48, y: y - 3 }));
        gEl.appendChild(text(s.chan, { class: 'chan ints', x: src.x - 48, y: y + 12 }));
        gEl.appendChild(num(src.x - 62 - 22, y, i + 1));
      } else { /* warn */
        var cxx = src.x + 42;
        gEl.appendChild(svg('circle', { class: 'clockc', cx: cxx, cy: y, r: 11 }));
        gEl.appendChild(svg('path', { class: 'clockh', d: 'M' + cxx + ' ' + (y - 6) + ' L' + cxx + ' ' + y + ' L' + (cxx + 5) + ' ' + (y + 3) }));
        gEl.appendChild(text(s.label, { class: 'fx-label', x: cxx + 24, y: y - 3 }));
        gEl.appendChild(text(s.chan, { class: 'chan', x: cxx + 24, y: y + 14 }));
        gEl.appendChild(num(src.x + 12, y, i + 1));
      }
      root.appendChild(gEl);
    });
    function num(cx, cy, n) {
      var g2 = svg('g', {});
      g2.appendChild(svg('circle', { class: 'numc', cx: cx, cy: cy, r: 10 }));
      g2.appendChild(text(String(n), { class: 'numt', x: cx, y: cy }));
      return g2;
    }
    function text(s, attrs) {
      var t = svg('text', attrs); t.textContent = s; return t;
    }
    return root;
  }

  /* ================= Gate 付费墙 ================= */
  var Gate = {
    render: function (root, moduleId, store, onUnlocked) {
      var m = R.get(moduleId);
      if (!m) throw new Error('未知模块: ' + moduleId);
      store = store || R.Store();
      var gate = m.gate || {};
      var points = gate.points || [
        '逐帧播放的交互式信令图——视频给不了的"亲手走一遍"',
        '失败分支演示 + 定时器语义（T300/T304/T380 等）',
        '每步大白话讲解 + 面试考法标注 + 结课自测',
        '买一次，浏览器本地永久离线可用'
      ];
      var price = gate.price || '完整版 81 模块（M0–M80）一次性买断，本地永久离线可用<br>内测期全套 <b>¥99</b> / 单模块 <b>¥12</b>——获取方式见仓库 README';
      root.innerHTML = '';
      var w = el('div', 'gate-wrap');
      var c = el('div', 'gate');
      c.innerHTML =
        '<div class="g-kicker">付费模块 · ' + m.tech + (m.prereq.length ? ' · 建议先修：' + m.prereq.map(function (p) { return R.get(p).title; }).join('、') : '') + '</div>' +
        '<h2>' + m.title + '</h2>' +
        '<p class="g-sub">' + m.tagline + '（' + m.minutes + ' 分钟 · ' + m.paths.success.length + ' 步）</p>' +
        '<ul>' + points.map(function (p) { return '<li>' + CHECK_SVG + '<span>' + p + '</span></li>'; }).join('') + '</ul>' +
        '<div class="g-price">' + price + '</div>' +
        '<div class="g-actions">' +
        '<button class="btn primary" data-act="unlock">完整版解锁码</button>' +
        '<a class="btn" href="index.html">返回目录</a></div>' +
        '<p class="g-note">免费层（Free Edition）：本站开放 M0–M3 四课与全部工具页；M4–M80 共 77 个模块属完整版，获取方式见仓库 README。</p>';
      w.appendChild(c); root.appendChild(w);
      c.querySelector('[data-act="unlock"]').onclick = function () {
        store.setLicense({ demo: true });
        if (onUnlocked) onUnlocked();
      };
    }
  };

  /* ================= Hub 模块墙 ================= */
  /* 学习域分组（2026-09-30 重构）：按"一条消息的完整旅程"排组——
     主线 → 空口信令（RRC）→ 接口运输 → 信封外层（NAS/核心网）→ 底层地基 → 横切对照 */
  var HUB_GROUPS = [
    { key: 'main', no: '01', short: '主线', name: '主线 · 免费起点', desc: '一部电影看完全程：从开机到注册能上网的每一条信令——全站的地图，也是所有课的前置。', mods: ['ma'] },
    { key: 'rrc', no: '02', short: 'RRC 空口', name: 'RRC · 空口信令组', desc: 'UE 与基站之间的对话全集：连接建立、系统消息、寻呼、测量、切换、承载重配、挂起、AS 安全、双连接，外加空闲态与小区重选专课（38.304）、测量机器深潜课（38.331 §5.5 + 38.133 秒表）、MRO 切换自愈课——切换失败后的取证、判责与参数自优化（38.300 §15.5.2 + 38.331 §5.7.9/5.7.10 + 38.423）、ANR 邻区自管理课——邻区关系怎么自己长：UE 取证读广播、NCRT 长表、AMF 中转 TNL 地址（38.300 §15.3.3/§15.3.4 + 38.331 §5.5.2–5.5.5）、话统 KPI 映射课——从接通率/掉线率/切换率/干扰覆盖四条 KPI 链反推空口信令与失败分支，每环配 UE 取证工具（38.331 §5.3.3/5.3.10 + 38.321 §5.1 + 38.300 §15.5.2/15.5.3）、CHO 条件切换课——网络备好候选、UE 条件满足自己拍板的执行机器（38.331 §5.3.5.13 + 38.300 §9.2.3.4）、LTM 触发移动性课——拍板信令降到 L2：gNB 收 L1/L3 测量报告后经 MAC CE 一击换小区、TCI 预激活与 early TA 把同步提前、RACH-less 免随机接入（38.331 §5.3.5.18 + 38.300 §9.2.3.5）、LTE RRC 连接控制全流程课——两代对称收官：4G 侧一条龙从 RACH 到 SRB1、双消息安全、mobilityControlInfo 切换、重建五步与重定向退场（36.331 §5.3.3/5.3.4/5.3.5/5.5/5.3.7/5.3.8/5.3.11）、MDT 最小化路测课——让 UE 自己当路测员：CONNECTED 配置、IDLE/INACTIVE 打点、T330 与 48 小时保留、reportType 三型门控、记录限额与 IDC 挂起，外加应用层测量与网侧 CSI 收集对照（38.331 §5.5a/§5.5b/§5.5c）、网侧测量与节能课——网络自己的三本账一次收齐：QoE 收集全生命周期（两基激活/容器链上报/去激活与过载暂停/IDLE 保留与 SRB4-5 取回/切片分簿/切换留放/RAN visible/MDT 对齐/高移动限定）、网络节能十式（booster 关断与波束账/cell DTX/DRX/驻留门禁/按需 SIB1/NES CHO/SSB-less/空域功放/OD-SSB/公共信道适应）与干扰管理两张账（RIM 大气波导与两框架/CLI 测量上报与静默）（38.300 §21+§15.4+§17）、UE 轻量省电课——终端侧三本账：SDT 小包传输（MO/MT 双发起、RACH 与 Type 1 CG 双入口、带/不迁移与 MT-SDT）、省电机制群（DRX 参数组/BA/DCP/LP-WUS/空闲测量放松与 LP-SS/双 DRX 组/RLM-BFD 放松/PDCCH skipping+SSSG）与覆盖增强（上行聚合重复八式/下行 FR1 两式）（38.300 §18+§11+§19）、安全·能力·标识课——架构三支柱收官：AS 安全（原则四条与 COUNT 一次性、KSEAF→KAMF 密钥树、水平/垂直推导与 NCC、AS SMC 六条激活时序、终止点与状态迁移键存亡）、UE 能力（分层与 category 决裂、FS 矩阵、过滤三闸与 eRedCap 镜像、能力 ID 与 AMF 存储、UTRA-FDD 动态 IE 现取不存）、NG 标识（RNTI 三十二枚认人/报事二分、网络标识十枚、侧链 Layer-2 ID 非对称拆分）、主线拾遗课——38.331 主线的补刀（恢复线五叶：RAN 寻呼决策树/restore 三例外/停表清点/失败记账 6·3·3；重配细叶：fullConfig 留五件与密钥四支/CPAC 大小洗牌/SL 专配与中继增改；失败上报：failureType 九枚举与 MCG 倒换 T316；每 SIB 动作与按需 SI；H 高度事件米制与空闲测量；§7.1.1 定时器总表压舱）（38.331 §5.2/§5.3/§5.5/§5.7 拾遗 32 锚——过程面叶子级清账，ASN.1 字典与时延表记注）、38.300 全景课——把 38.331 的每一步放回骨架：架构三向接口、三态特征账、三张框架图（十步建连/八步 RNAU/四步 HO）、测量两级滤波与寻呼三源（38.300 §4/§7/§9）、38.304 深水课——空闲态的完整立法：三过程与 AS/NAS 分工表、S/R 双准则与绝对优先级机器、移动性三态缩放、TA/RNA 双注册触发、PO/PF 两条公式与 PEI/LP-WUS 省电前哨（38.304 §4/§5/§7）、38.300 深水课——L2 与空口全景：四子层服务栈与逻辑信道映射、物理层双工全家（波形/PDCCH/SSB/PUCCH/RA）、特性组与 Inter-RAT 四迁移的原文判据（38.300 §5/§6/§9.3/§16.15）、38.331 过程面收边课——系统信息生命周期、Inter-RAT 双向迁移与 UE 能力三容器拼图（38.331 §5.2/§5.4/§5.6）。', mods: ['m0', 'm1', 'm2', 'm3', 'm4', 'm5', 'm6', 'm7', 'm8', 'my', 'm42', 'm43', 'm44', 'm45', 'm46', 'm47', 'm48', 'm54', 'm65', 'm66', 'm67', 'm76', 'm77', 'm78', 'm79', 'm80'] },
    { key: 'if', no: '03', short: '接口与用户面', name: '接口与用户面 · 信令离开基站之后', desc: '38.401 架构总纲课打底（NG-RAN 节点模型与协议栈分布的娘家）、NG/Xn/S1/X2/F1/E1 六本消息级接口台账一台凑齐、接口族收官课、数据面与 GTP-U 隧道——网络侧视角与比特流视角。', mods: ['mi', 'mx', 'mp', 'mz', 'mng', 'ms1', 'mx2', 'mf1', 'me1', 'm41'] },
    { key: 'nas', no: '04', short: 'NAS 与核心网', name: 'NAS 与核心网 · 信封的外层', desc: '注册与会话这一层的全套：5G NAS、5GC 会话流程、隧道与转发面信令（GTP-C/PFCP）、网络切片专课（S-NSSAI 的旅程）、EPS 侧 EMM/ESM 专章，加上 SBA 服务化架构（NRF/发现/token）、PDU 会话信令专课与 Service Request 专课。', mods: ['mn', 'mg', 'mb', 'me', 'mr', 'mo', 'mm', 'mns'] },
    { key: 'low', no: '05', short: '空口底层', name: '空口底层 · 信令脚下的地基', desc: '信令之前的那一秒：MAC 怎么敲门、物理层怎么把比特搬上无线帧、QoS 流怎么绑进承载（5QI/SDAP 专课）——学完上层再下井，豁然开朗。', mods: ['mc', 'mf', 'mq'] },
    { key: 'cross', no: '06', short: '安全与对照', name: '安全与两代对照 · 横切视角收官', desc: '密钥树怎么一级级长出来（33.501 骨架课+密钥层级深潜课）、4G/5G 同一流程并排看，外加把 PHY→MAC→RLC→PDCP→RRC→NAS 六层串成一条尸检链的跨层排障毕业课——横穿所有层的收官课组。', mods: ['ms', 'ml', 'mj', 'mau'] },
    { key: 'apps', no: '07', short: '业务与垂直', name: '业务与垂直 · 信令的应用现场', desc: '信令学完去哪用：IMS 语音（SIP 注册到挂断+字段级解剖）、定位（LPP/NRPPa）、五大垂直特性速览（NTN/RedCap/Sidelink/MBS/IAB）、NTN 与 RedCap 纵深课——卫星直连把定时与位置变成账本（SIB19/epochTime/T430/卫星切换预告），轻量终端全线瘦身（专用 barring/放宽测量/省电偏好上报）、Sidelink 纵深课——UE↔UE 直连的 PC5 侧 RRC（兴趣上报/SLSS 同步/PC5-RRC 重配/RLF 兜底）、MBS 纵深课——广播与多播的 RRC 侧（MCCH 桌牌/MBS Interest Indication/G-RNTI 停监控/resume 兜底）、IAB 纵深课——给基站装上无线尾巴（donor 与 MT/DU 双角色/SIB1 门槛与集成四阶段/回程 RLF 换父恢复/授权与移动 IAB）、Sidelink 中继纵深课——UE 当路由器的架构账（SRAP 逐跳终结/local ID 映射与发现选择/U2N 控制面建连与代收/三类路径切换与 U2U 十步建链）、多路径中继纵深课——直连与中继同开的双路径架构（三类承载/两条间接路 SL 与 N3C/四条路径管理流程/路径失败上报与 SI 双路）、环境物联网课——零电池标签与 gNB-reader 的完整账（R2D/D2R 两套物理信道与 MAC 机器/CBRA 与 CFA 两种访问/Inventory·Command·Release 三条 NG-C 流程/本版本三「不」边界）、Sidelink 增强架构课——PC5 直连的增强与演进而（三模式与四栈/Mode 1·2 发牌与省电账/SL DRX 与 Uu 控制/IUC·SL-U·SL CA 演进三件）、MBS 架构课——广播与多播的完整账（两族服务与三层架构/L2 裁剪与 MRB 菜单/MTCH·DTCH·MCCH 三信道与 RNTI/Shared·Individual 交付与 PDCP COUNT 同步/无损切换与 INACTIVE 不断线/广播 MCCH 四原则与 CFR 地皮/两条腿与 DRX 两态两账/不支持清单总装）、NTN 架构课——卫星直连的完整账（两载荷三小区/Mapped Cell ID 五用两不用/Common TA 与两偏移/预补偿守门/位置与国界/CHO 三触发与卫星重同步/switchover TNL 台子/覆盖与容量增强/ISA 与半双工/NG Removal）、切片与专网课——网络身份的完整账（S-NSSAI 与 NSAG 的切片资源账/Allowed 三张名单与 AMF 三条选路/NG 与 Xn 两种切换门槛/SNPN 的 PLMN ID+NID 与 onboarding/PNI-NPN 的 CAG 门禁与寻呼）、URLLC 与 TSN 课——低时延与确定性（LCP 限制与包复制的多腿/10⁻⁵ CQI 与 MCS-C-RNTI/两条冗余路径/PUCCH 小区切换与共享频谱 CG 重传/10 ns 时间参考与 PDC/TSCAI 与 survival time/SIB9 时钟质量/L4S 的 CE 标记与 TSN 传输网边界）、公共告警与空天收边课——公共告警、轻量终端与空中接口收边（PWS 广播与寻呼触发/IMS 紧急与 eCall 回退/灾难漫游 AI 3/RedCap 与 eRedCap 门禁与省电/空中终端高度航路 A2X/ATG GNSS 预补偿/AI-ML 原则与数据采集/2Rx XR 门禁）、空口演进课——Multi-USIM、空口 AI/ML 与 SBFD（双卡寻呼避撞/切网通知与调度间隙/能力临时限制/AI-ML 波束与 CSI 预测/适用性上报与监测/SBFD 子带与随机接入）、Sidelink 无线承载管理课——SLRB 三族全账（DRB 释放九触发与 PDCP→SDAP→RLC 释放层级/增改四件套与 NOTE 1 同 RLC mode 选型/SRB 三触发与 allowed carrier 预指示/附加 RLC 承载四释放条件与 received-transmitted 镜像语法/SL-TxProfile 二值与两腿载波不重叠）（38.331 §5.8.9.1a）、Sidelink 中继控制与承载面课——UE 当路由器时的五件账：PC5 Relay RLC 信道按 per-hop QoS 派生与生死（派生/释放/增改铺底）、远端需求单（SIB/posSIB/寻呼/SFN-DFN/connectionForMP）与中继四路服务、Uu 消息转移四触发与两侧接收、Notification 三角色发起与三套指示字段、U2U QoS split 请求-响应闭环（38.331 §5.8.9.7–.11）、Sidelink 中继操作课——Relay 与 Remote 四角色×门限/选择重选/近邻三机制轴（U2N 双门限带与单门限/选择重选触发与候选 AS 判据/U2U 两套消息门限与近邻通告/两条发现路径动作/多跳 Last 与 Intermediate 三份门限）（38.331 §5.8.14–.19）、Sidelink 发现与定位课——发现与定位的资源池账（监控触发两且与三级池/传输十一条角色条件×三源/非中继发现的定时器例外与 sensing/SL-PRS 测量与传输与 SIB23）（38.331 §5.8.13/.18）、Sidelink 测量与拾遗课——对端下发的测量账与拾遗五件（配置四件套与七分发/事件三态与 S1·S2 镜像/发满自毁；载波增删·能力转移·PC5 收尾·同步·Zone）（38.331 §5.8.10 与五件）、物理层测量课——量的户口本：per-RE 线性平均、N×RSRP÷RSSI 与信噪比三族公式，时机锁 SMTC 窗/CSI-RS 机会/配置符号，定义表两列读法（38.215 §5.1 Uu 量族）、SL 与 gNB 量族课——对端 UE 的信号账与基站的十叶自测账（S-SSS 加用镜像/双端口求和/SL RSSI 第 2 符号起/CR-CBR 池温双比/PRS 定位五件/TADV 喂 TA/时域信道双子）（38.215 §5.1 SL 面+§5.2 全十叶）、测量线横向复习课——一条数的旅程收官（38.211 的砖/38.215 的量/38.214 的台阶/38.331 的账、L1 量化四档与两条上报铁路、门牌搬家案）（38.211+38.214 新语料 21 枚首锚）——应用现场的二十六门课。', mods: ['mv', 'md', 'mk', 'mw', 'm49', 'm50', 'm51', 'm52', 'm55', 'm56', 'm57', 'm58', 'm59', 'm60', 'm61', 'm62', 'm63', 'm64', 'm68', 'm69', 'm70', 'm71', 'm72', 'm73', 'm74', 'm75'] },
    { key: 'jobs', no: '08', short: '测试与终端', name: '测试与终端 · 岗位直通', desc: '与求职岗位最短路径的课程：一致性测试线（怎么给手机发合格证）、卡与终端（USIM 与一条短信的旅程），外加毕业课——全站知识地图与 JD 面试总攻（八域纵览/学习路径/三岗课单/综合检验）——全站收官。', mods: ['mt', 'mu', 'm53'] }
  ];
  var Hub = {
    render: function (root, store, opts) {
      opts = opts || {};
      store = store || R.Store();
      var href = opts.href || function (id) { return 'app.html#' + id; };
      /* v55 R2 按需加载：课程墙可由目录元数据驱动（opts.metas，来自 course-catalog.js），
         默认仍从全量注册表推导同一形状——e2e 与 unit 两测试页的默认路径行为不变。
         metas 字段：{id,num,title,tagline,tech,minutes,free,steps,quizN}（steps/quizN
         在默认路径由 paths.success.length / quiz.length 推导，目录路径由生成器预置）。 */
      function metaOf(m) {
        return { id: m.id, num: m.num, title: m.title, tagline: m.tagline, tech: m.tech,
                 minutes: m.minutes, free: !!m.free,
                 steps: m.paths && m.paths.success ? m.paths.success.length : 0,
                 quizN: (m.quiz || []).length };
      }
      var mods = (opts.metas && opts.metas.length) ? opts.metas : R.modules().map(metaOf);
      var byId = {};
      mods.forEach(function (m) { byId[m.id] = m; });
      root.innerHTML = '';

      /* 岗位学习路径（卅八轮块 4）：三岗 × 4 周计划——建议顺序，可自由跳序。
         key 与 interview 岗位卷对齐（opt/core/test）；进度徽章实时算。 */
      var JOB_PATHS = [
        { key: 'opt', name: '无线网优岗', blurb: '空口与无线侧：接入/切换/重建/寻呼/测量——RRC 主战场',
          weeks: [
            { label: '第 1 周 · 主线与空口地基', mods: ['ma', 'm0', 'm1', 'm2', 'mc'] },
            { label: '第 2 周 · RRC 核心流程', mods: ['m3', 'm4', 'm5', 'm6', 'my'] },
            { label: '第 3 周 · 状态机与排障', mods: ['m7', 'm8', 'mf', 'mau'] },
            { label: '第 4 周 · 接口与核心网速览', mods: ['mi', 'mng', 'm41'] }
          ] },
        { key: 'core', name: '核心网岗', blurb: '注册/会话/切片/SBA——信封外层的全套',
          weeks: [
            { label: '第 1 周 · 主线与 NAS 入门', mods: ['ma', 'm0', 'm1', 'mn'] },
            { label: '第 2 周 · 5GC 流程与承载', mods: ['mg', 'mb', 'mm', 'mns'] },
            { label: '第 3 周 · 切片/SBA/服务化', mods: ['mr', 'mo', 'mq'] },
            { label: '第 4 周 · 接口台账', mods: ['mi', 'mng', 'ms1', 'm41'] }
          ] },
        { key: 'test', name: '协议测试岗', blurb: '一致性测试/卡与终端/安全——岗位直通',
          weeks: [
            { label: '第 1 周 · 主线与接入', mods: ['ma', 'm0', 'm1', 'mc'] },
            { label: '第 2 周 · 测试线与终端', mods: ['mt', 'mu', 'me'] },
            { label: '第 3 周 · 安全与对照', mods: ['ms', 'ml', 'mj'] },
            { label: '第 4 周 · 排障与接口', mods: ['mau', 'mi', 'm41'] }
          ] }
      ];

      /* 视图切换：browse（按域）| path（按岗位） */
      var view = 'browse';
      var viewbar = el('div', 'hub-viewbar');
      var btnBrowse = el('button', 'on', '按学习域浏览');
      var btnPath = el('button', '', '按岗位路径学');
      btnBrowse.type = 'button'; btnPath.type = 'button';
      viewbar.appendChild(btnBrowse); viewbar.appendChild(btnPath);
      var pathView = el('div', 'jobpath-view');

      function renderPath() {
        pathView.innerHTML = '';
        pathView.appendChild(el('p', 'sec-sub', '建议学习路径，可自由跳序——每岗 4 周，跟着周计划走完就是一条完整的备战线。走完一课最后一帧，徽章自动点亮。'));
        JOB_PATHS.forEach(function (jp) {
          var allMods = [];
          jp.weeks.forEach(function (w) { allMods = allMods.concat(w.mods); });
          var doneN = allMods.filter(function (id) { var m = byId[id]; var p = m && store.progress(id); return p && p.done; }).length;
          /* 当前该学：按周序第一个未完成课 */
          var nextId = null;
          for (var wi = 0; wi < jp.weeks.length && !nextId; wi++) {
            for (var xi = 0; xi < jp.weeks[wi].mods.length; xi++) {
              var pn = store.progress(jp.weeks[wi].mods[xi]);
              if (!(pn && pn.done)) { nextId = jp.weeks[wi].mods[xi]; break; }
            }
          }
          var card = el('div', 'hubgroup jobpath');
          card.innerHTML = '<div class="ghead" role="button" tabindex="0" aria-expanded="true">' +
            '<span class="gnum">★</span>' +
            '<div class="gtxt"><div class="gname">' + jp.name + ' · 4 周路径</div><div class="gdesc">' + jp.blurb + '　<a class="wb-link" href="interview.html">去面试页开「' + jp.name + '」模拟卷 →</a></div></div>' +
            '<span class="gcount">' + doneN + '/' + allMods.length + ' 门</span></div>';
          var body = el('div', 'gbody');
          jp.weeks.forEach(function (w) {
            var wk = el('div', 'jobweek');
            var wdone = w.mods.filter(function (id) { var p = store.progress(id); return p && p.done; }).length;
            wk.innerHTML = '<div class="jobweek-t"><b>' + w.label + '</b><span>' + wdone + '/' + w.mods.length + '</span></div>';
            var row = el('div', 'jobweek-row');
            w.mods.forEach(function (id) {
              var m = byId[id]; if (!m) return;
              var p = store.progress(id);
              var isNext = (id === nextId && !(p && p.done));
              var chip = el('a', 'jobchip' + (p && p.done ? ' done' : '') + (m.free ? ' free' : '') + (isNext ? ' next' : ''));
              chip.href = href(id);
              chip.innerHTML = '<i class="jk">' + (p && p.done ? '✓' : m.num) + '</i>' + m.title + (isNext ? '<b class="jk-next">当前该学</b>' : '');
              chip.title = 'M' + m.num + ' · ' + m.title + (p && p.done ? '（已完成）' : '');
              row.appendChild(chip);
            });
            wk.appendChild(row);
            body.appendChild(wk);
          });
          card.appendChild(body);
          pathView.appendChild(card);
        });
      }

      function setView(v) {
        view = v;
        btnBrowse.classList.toggle('on', v === 'browse');
        btnPath.classList.toggle('on', v === 'path');
        if (v === 'path') renderPath();
        pathView.style.display = v === 'path' ? '' : 'none';
        path.style.display = v === 'browse' ? '' : 'none';
        tools.style.display = v === 'browse' ? '' : 'none';
        overall.style.display = v === 'browse' ? '' : 'none';
        grid.style.display = v === 'browse' ? '' : 'none';
      }
      btnBrowse.onclick = function () { setView('browse'); };
      btnPath.onclick = function () { setView('path'); };

      /* 学习域导览条：六组胶囊，点击展开并滚动到组 */
      var path = el('div', 'pathline gnav');
      var grpOpen = {}; HUB_GROUPS.forEach(function (g, i) { grpOpen[g.key] = (i === 0); });
      function openGroup(key, open) {
        grpOpen[key] = open !== false;
        var sec = document.getElementById('hub-g-' + key);
        if (sec) {
          sec.classList.toggle('closed', !grpOpen[key]);
          var h = sec.querySelector('.ghead');
          if (h) h.setAttribute('aria-expanded', grpOpen[key]);
        }
      }
      HUB_GROUPS.forEach(function (g, i) {
        if (i) path.appendChild(el('span', 'pathsep', '→'));
        var s = el('button', 'pathstep gstep');
        s.type = 'button';
        s.innerHTML = '<span class="n">' + g.no + '</span>' + g.short;
        s.title = g.name;
        s.onclick = function () {
          openGroup(g.key, true);
          var t = document.getElementById('hub-g-' + g.key);
          if (t) t.scrollIntoView({ behavior: 'smooth', block: 'start' });
        };
        path.appendChild(s);
      });
      root.appendChild(path);

      /* 工具行：过滤 + 授权 */
      var tools = el('div', 'hub-tools');
      var filter = el('div', 'filter');
      var inp = el('input'); inp.placeholder = '过滤模块（标题 / 关键词 / 制式）…';
      filter.appendChild(inp); tools.appendChild(filter);
      var lic = store.license();
      var licCard = el('div', 'license-card');
      function renderLic() {
        lic = store.license();
        licCard.innerHTML =
          '<div><div class="lc-t">付费模块授权</div><div class="lc-d">免费层开放 M0–M3 与全部工具页；完整版（M4–M80）获取方式见 README。</div></div>' +
          '<div style="display:flex;gap:8px;align-items:center">' +
          '<span class="license-state' + (lic.demo ? ' on' : '') + '">' + (lic.demo ? '完整版用户' : '免费层') + '</span>' +
          '<button class="btn sm" data-act="export-progress" title="生成 Markdown 学习进度单（完成态/测验分/下一步建议）">导出学习进度</button>' +
          '<button class="btn sm" data-act="backup-store" title="把学习进度与错题本打包成 JSON 文件">备份学习档案</button>' +
          '<button class="btn sm" data-act="restore-store" title="从 JSON 备份恢复进度与错题本（结构不符则原数据不动）">恢复</button>' +
          '<input type="file" data-act="restore-file" accept=".json,application/json" style="display:none">' +
          (lic.demo
            ? '<button class="btn sm" data-act="relock">重新锁定</button>'
            : '<button class="btn sm primary" data-act="unlock">了解完整版</button>') +
          '</div>';
        var u = licCard.querySelector('[data-act="unlock"]'), r = licCard.querySelector('[data-act="relock"]'), ep = licCard.querySelector('[data-act="export-progress"]');
        var bk = licCard.querySelector('[data-act="backup-store"]'), rs = licCard.querySelector('[data-act="restore-store"]'), rf = licCard.querySelector('[data-act="restore-file"]');
        if (bk) bk.onclick = function () {
          var IV = g.RRC && g.RRC.Interview;
          if (!IV || !IV.buildBackupJSON) return;
          var a = document.createElement('a');
          a.href = URL.createObjectURL(new Blob([IV.buildBackupJSON(store)], { type: 'application/json' }));
          a.download = 'rrc-学习档案-' + new Date().toISOString().slice(0, 10) + '.json';
          document.body.appendChild(a); a.click();
          setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 400);
        };
        if (rs) rs.onclick = function () { if (rf) rf.click(); };
        if (rf) rf.onchange = function () {
          var f = rf.files && rf.files[0];
          if (!f) return;
          var fr = new FileReader();
          fr.onload = function () {
            var IV = g.RRC && g.RRC.Interview;
            var okRes = IV && IV.restoreBackupJSON ? IV.restoreBackupJSON(String(fr.result)) : false;
            rf.value = '';
            if (okRes) { location.reload(); }
            else { alert('恢复失败：文件结构不符合备份格式（version:1），原数据未改动。'); }
          };
          fr.readAsText(f);
        };
        if (u) u.onclick = function () { store.setLicense({ demo: true }); renderLic(); renderGrid(); };
        if (r) r.onclick = function () { store.setLicense({ demo: false }); renderLic(); renderGrid(); };
        if (ep) ep.onclick = function () {
          var IV = g.RRC && g.RRC.Interview;
          if (IV && IV.buildProgressMarkdown) {
            var md = IV.buildProgressMarkdown(store);
            var a = document.createElement('a');
            a.href = URL.createObjectURL(new Blob([md], { type: 'text/markdown;charset=utf-8' }));
            a.download = 'rrc-学习进度.md';
            document.body.appendChild(a); a.click();
            setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 400);
          }
        };
      }
      renderLic();
      var headRow = el('div', 'hub-headrow');
      headRow.appendChild(el('h2', 'sec', '模块目录'));
      var expandBtn = el('button', 'btn sm hub-expand');
      expandBtn.type = 'button';
      expandBtn.textContent = '全部展开';
      expandBtn.onclick = function () {
        var anyClosed = HUB_GROUPS.some(function (g) { return !grpOpen[g.key]; });
        HUB_GROUPS.forEach(function (g) { openGroup(g.key, anyClosed); });
        expandBtn.textContent = anyClosed ? '全部收起' : '全部展开';
      };
      headRow.appendChild(expandBtn);
      root.appendChild(headRow);
      root.appendChild(viewbar);
      root.appendChild(el('p', 'sec-sub', '两级目录：先选学习域，展开后再挑课。免费层：M0 接入全流程、M1 连接建立、M2 系统消息与 M3 寻呼与 DRX + 全部工具页；M4–M80 属完整版。'));
      root.appendChild(tools);
      root.appendChild(pathView); pathView.style.display = 'none';

      /* 总进度 */
      var doneCount = mods.filter(function (m) { var p = store.progress(m.id); return p && p.done; }).length;
      var overall = el('div');
      overall.innerHTML = '<div style="display:flex;justify-content:space-between;font:500 12px var(--mono);color:var(--tx3);margin-top:22px"><span>总进度（走完最后一帧即记完成）</span><span>' + doneCount + ' / ' + mods.length + '</span></div><div class="progressbar"><i style="width:' + (doneCount / mods.length * 100) + '%"></i></div>';
      root.appendChild(overall);

      /* 模块卡网格 */
      var grid = el('div', 'mgrid');
      function cardHtml(m) {
        var p = store.progress(m.id), qs = store.quizScore(m.id);
        var steps = m.steps != null ? m.steps : (m.paths && m.paths.success ? m.paths.success.length : 0);
        var quizN = m.quizN != null ? m.quizN : (m.quiz || []).length;
        var pct = p ? Math.round(p.steps / steps * 100) : 0;
        return '<div class="mtop"><span class="mnum">M' + m.num + ' · ' + m.tech + '</span>' +
          (m.free ? '<span class="badge free">免费样品</span>'
            : (lic.demo ? '<span class="badge">已解锁</span>' : '<span class="badge paid">' + LOCK_SVG + ' 付费</span>')) + '</div>' +
          '<div class="mname">' + m.title + '</div>' +
          '<div class="mdesc">' + m.tagline + '</div>' +
          '<div class="mmeta">' + m.minutes + ' 分钟 / ' + steps + ' 步 / ' + quizN + ' 题</div>' +
          '<div class="mprog"><i style="width:' + pct + '%"></i></div>' +
          '<div class="mfoot"><span>' + (p && p.done ? '<span class="done">✓ 已完成</span>' : pct > 0 ? '学到第 ' + p.steps + ' 步' : '未开始') + '</span>' +
          '<span>' + (qs ? '测验 ' + qs.got + '/' + qs.total : (m.free ? '免费开始 →' : '解锁学习 →')) + '</span></div>';
      }
      function renderGrid() {
        var kw = (inp.value || '').trim().toLowerCase();
        var byId = {}; mods.forEach(function (m) { byId[m.id] = m; });
        var grouped = {}; HUB_GROUPS.forEach(function (g) { g.mods.forEach(function (id) { grouped[id] = true; }); });
        var groups = HUB_GROUPS.slice();
        var rest = mods.filter(function (m) { return !grouped[m.id]; }).map(function (m) { return m.id; });
        if (rest.length) { groups.push({ key: 'more', no: '··', name: '更多课程', desc: '新上架，尚未归组。', mods: rest }); grpOpen.more = true; }
        grid.innerHTML = '';
        groups.forEach(function (g) {
          var hits = g.mods.filter(function (id) {
            var m = byId[id]; if (!m) return false;
            return !kw || (m.title + m.tagline + m.tech + 'm' + m.num).toLowerCase().indexOf(kw) >= 0;
          });
          if (!hits.length) return;
          /* 过滤中：有命中的组自动展开；无过滤：尊重折叠态 */
          var open = kw ? true : grpOpen[g.key] !== false;
          var done = hits.filter(function (id) { var p = store.progress(id); return p && p.done; }).length;
          var sec = el('div', 'hubgroup' + (open ? '' : ' closed')); sec.id = 'hub-g-' + g.key;
          sec.innerHTML = '<div class="ghead" role="button" tabindex="0" aria-expanded="' + open + '">' +
            '<span class="gtog" aria-hidden="true"><svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor"><path d="M9 5.5l7 6.5-7 6.5z"/></svg></span>' +
            '<span class="gnum">' + g.no + '</span>' +
            '<div class="gtxt"><div class="gname">' + g.name + '</div><div class="gdesc">' + g.desc + '</div></div>' +
            '<span class="gcount">' + hits.length + ' 门' + (done ? ' · ' + done + '/' + hits.length : '') + '</span></div>';
          var ggrid = el('div', 'mgrid gbody');
          hits.forEach(function (id) {
            var a = el('a', 'mcard', cardHtml(byId[id]));
            a.href = href(id);
            ggrid.appendChild(a);
          });
          sec.appendChild(ggrid);
          var head = sec.querySelector('.ghead');
          function toggle() {
            var nowOpen = sec.classList.toggle('closed') === false;
            head.setAttribute('aria-expanded', nowOpen);
            grpOpen[g.key] = nowOpen;
          }
          head.onclick = toggle;
          head.onkeydown = function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(); } };
          grid.appendChild(sec);
        });
        if (!grid.children.length) grid.appendChild(el('p', 'sec-sub', '没有匹配的模块。'));
      }
      inp.oninput = renderGrid;
      renderGrid();
      tools.appendChild(licCard);
      root.appendChild(grid);
    }
  };

  R.mountPlayer = mountPlayer;
  R.Gate = Gate;
  R.Hub = Hub;
  R.HUB_GROUPS = HUB_GROUPS; /* 面试模式等工具页复用六域划分 */
})(typeof window !== 'undefined' ? window : globalThis);
