/* ============================================================
   assets/flowanim.js — RRC 流程动画引擎 + 资产库（v1）
   设计：引擎管时间轴（rAF）、节拍字幕、进度点、跳转；场景脚本
   （道具+节拍函数）是"资产"——attach 是第一件，后续切换/重建
   等按同格式追加到 SCRIPTS。零依赖、file:// 可用、SVG 矢量自绘。
   挂载：RRC.FlowAnim.mount(rootEl, scriptIdOrObj, opts) → controller
   controller：play/pause/seek(秒)/state/unmount；e2e 用。
   ============================================================ */
(function (g) {
  'use strict';
  var R = g.RRC || (g.RRC = {});
  var NS = 'http://www.w3.org/2000/svg';

  /* ---------- 基础工具 ---------- */
  function E(tag, attrs, parent) {
    var n = document.createElementNS(NS, tag);
    for (var k in attrs) n.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(n);
    return n;
  }
  function T(x, y, cls, str, parent) {
    var t = E('text', { x: x, y: y, 'class': cls }, parent);
    t.textContent = str; return t;
  }
  function clamp01(t) { return t < 0 ? 0 : t > 1 ? 1 : t; }
  function smooth(t) { t = clamp01(t); return t * t * (3 - 2 * t); }
  function win(pg, a, b) { return clamp01((pg - a) / (b - a)); } /* 区间归一 */

  /* ---------- 道具工厂（全部自绘矢量，~30px 见方，锚点在中心） ---------- */
  var PROP = {
    envelope: function (p, label) {
      E('rect', { x: -16, y: -11, width: 32, height: 22, rx: 2.5, fill: '#FFFFFF', stroke: '#B45309', 'stroke-width': 1.6 }, p);
      E('path', { d: 'M-16 -11 L0 2 L16 -11', fill: 'none', stroke: '#B45309', 'stroke-width': 1.6 }, p);
      if (label) T(0, 22, 'fa-prop-t', label, p);
    },
    key: function (p, label) {
      E('circle', { cx: -8, cy: 0, r: 6, fill: 'none', stroke: '#B8860B', 'stroke-width': 2.4 }, p);
      E('path', { d: 'M-2 0 L14 0 M9 0 L9 5 M13 0 L13 5', stroke: '#B8860B', 'stroke-width': 2.4, fill: 'none' }, p);
      if (label) T(0, 22, 'fa-prop-t', label, p);
    },
    shield: function (p, label) {
      E('path', { d: 'M0 -12 L11 -7 L11 2 C11 8 6 12 0 14 C-6 12 -11 8 -11 2 L-11 -7 Z', fill: '#E7F6EC', stroke: '#18A34A', 'stroke-width': 2 }, p);
      E('path', { d: 'M-4.5 0 L-1 4 L5 -4', fill: 'none', stroke: '#18A34A', 'stroke-width': 2.2, 'stroke-linecap': 'round' }, p);
      if (label) T(0, 26, 'fa-prop-t', label, p);
    },
    card: function (p, label) {
      E('rect', { x: -15, y: -10, width: 30, height: 20, rx: 3.5, fill: '#2563EB' }, p);
      E('rect', { x: -15, y: -5, width: 30, height: 5, fill: '#FFFFFF', opacity: .85 }, p);
      if (label) T(0, 22, 'fa-prop-t', label, p);
    },
    doc: function (p, label) {
      E('path', { d: 'M-13 -14 L5 -14 L13 -6 L13 14 L-13 14 Z', fill: '#FFFFFF', stroke: '#7C3AED', 'stroke-width': 1.8 }, p);
      E('path', { d: 'M5 -14 L5 -6 L13 -6', fill: 'none', stroke: '#7C3AED', 'stroke-width': 1.8 }, p);
      E('path', { d: 'M-8 -1 L8 -1 M-8 4 L8 4 M-8 9 L3 9', stroke: '#9AA0AE', 'stroke-width': 1.5 }, p);
      if (label) T(0, 26, 'fa-prop-t', label, p);
    },
    ask: function (p, label) {
      E('rect', { x: -13, y: -15, width: 26, height: 30, rx: 3, fill: '#FFFFFF', stroke: '#5A6072', 'stroke-width': 1.8 }, p);
      E('path', { d: 'M-7 -8 L7 -8 M-7 -2 L7 -2 M-7 4 L2 4', stroke: '#9AA0AE', 'stroke-width': 1.6 }, p);
      E('path', { d: 'M0 15 L0 21 M-3.5 18.5 a3.5 3.5 0 1 0 7 0 a3.5 3.5 0 1 0 -7 0', stroke: '#18A34A', 'stroke-width': 2, fill: '#FFFFFF' }, p);
      if (label) T(0, 28, 'fa-prop-t', label, p);
    }
  };

  /* ---------- 场景脚本：attach（第一件资产） ---------- */
  var A = { ue: { x: 118, y: 300 }, gnb: { x: 470, y: 268 }, amf: { x: 812, y: 288 } };
  function laneY(a, b) { return (a.y + b.y) / 2 + 6; }

  var SCRIPTS = {
    attach: {
      title: '接入全流程（注册/Attach）· 19 帧动画版（与信令图一一对应）',
      vb: [0, 0, 960, 470],
      props: [
        { id: 'envRar', kind: 'envelope', label: 'RAR · TA' },
        { id: 'envUp', kind: 'envelope', label: '上行信令' },
        { id: 'envDl', kind: 'envelope', label: '下行信令' },
        { id: 'envUl', kind: 'envelope', label: '上行信令' },
        { id: 'key', kind: 'key', label: '安全钥匙' },
        { id: 'docICS', kind: 'doc', label: '开张材料' },
        { id: 'docResp', kind: 'doc', label: '完工回执' },
        { id: 'shield', kind: 'shield' },
        { id: 'ask', kind: 'ask', label: '能力问卷' },
        { id: 'cardA', kind: 'card', label: 'SRB2' },
        { id: 'cardB', kind: 'card', label: 'DRB' }
      ],
      /* 19 拍 = 信令图 19 步一一对齐；每拍回答"为什么一定要有这条消息" */
      beats: [
        { cap: '① PRACH 前导（Msg1）', sub: '为什么有它：UE 还没有任何专属资源，只能公共信道喊一嗓子——没有它，后面一切无从谈起。', dur: 2.8,
          run: function (pg, h) { h.ripple(h.UE, pg); } },
        { cap: '② 随机接入响应 RAR（Msg2）', sub: '为什么有它：校准时钟（TA）+ 指定下一帧的资源（授权）——没有 RAR，Msg3 就是无人指挥的乱喊。', dur: 2.6,
          run: function (pg, h) { h.fly('envRar', 'gnb', 'ue', win(pg, .1, .9)); } },
        { cap: '③ RRCSetupRequest（Msg3）', sub: '为什么有它：UE 的自我介绍（39bit 身份+来意）——RRC 关系从此建立，T300 计时开始。', dur: 2.6,
          run: function (pg, h) { h.fly('envUp', 'ue', 'gnb', win(pg, .1, .9), 'Msg3'); } },
        { cap: '④ RRCSetup（Msg4）', sub: '为什么有它：录取通知——SRB1 随信建立（专用信令通道点亮），竞争解决同帧完成。', dur: 2.8,
          run: function (pg, h) { h.fly('envDl', 'gnb', 'ue', win(pg, .1, .8)); h.pipe(win(pg, .4, .95)); } },
        { cap: '⑤ RRCSetupComplete ★捎带注册请求', sub: '为什么有它：确认配置生效 + 捎带 Registration Request——5GC 注册从这一刻搭 RRC 的顺风车。', dur: 3.2,
          run: function (pg, h) { h.fly('envUp', 'ue', 'gnb', win(pg, .05, .85), 'Complete+申请'); h.ueState('reg'); } },
        { cap: '⑥ INITIAL UE MESSAGE', sub: '为什么有它：给 UE 在核心网"开档案"——NAS-PDU 原样上交（邮差不拆信），TAI/位置供 AMF 选路。', dur: 3,
          run: function (pg, h) { h.fly('envUp', 'gnb', 'amf', win(pg, .05, .9), 'INITIAL UE MESSAGE'); } },
        { cap: '⑦ AMF 取鉴权向量（5G-AKA）', sub: '为什么有它：能发 Msg3 的不一定是真卡——AUSF/UDM 出鉴权向量，根密钥 K_AMF 就位（不出核心网）。', dur: 2.8,
          run: function (pg, h) { h.vault(win(pg, 0, 1)); h.nodeGlow('amf', win(pg, .2, .9)); } },
        { cap: '⑧ DOWNLINK NAS TRANSPORT', sub: '为什么有它：AMF 没有无线通道——NGAP 下行直传把鉴权挑战递给 gNB（双号牌配对完成）。', dur: 2.6,
          run: function (pg, h) { h.fly('envDl', 'amf', 'gnb', win(pg, .05, .9), '鉴权挑战'); } },
        { cap: '⑨ DLInformationTransfer', sub: '为什么有它：最后一公里由 RRC 跑——这条消息几乎只有"NAS 信封"一个字段，专职邮差。', dur: 2.4,
          run: function (pg, h) { h.fly('envDl', 'gnb', 'ue', win(pg, .05, .9), 'Authentication Request'); } },
        { cap: '⑩ ULInformationTransfer', sub: '为什么有它：UE 的应答（RES*）要回 AMF——空口段的上行邮差专列。', dur: 2.4,
          run: function (pg, h) { h.fly('envUl', 'ue', 'gnb', win(pg, .05, .9), 'Authentication Response'); } },
        { cap: '⑪ UPLINK NAS TRANSPORT', sub: '为什么有它：应答交还 AMF 验算 + 补报用户位置（档案必填项）——鉴权闭环，K_AMF 就位。', dur: 2.6,
          run: function (pg, h) { h.fly('envUl', 'gnb', 'amf', win(pg, .05, .9)); h.vault(0); } },
        { cap: '⑫ INITIAL CONTEXT SETUP REQUEST ★交钥匙', sub: '为什么有它：让 gNB 从邮差变管家——安全钥匙（自派生 KgNB）/速率闸门/待建会话清单整包交接，还捎着 NAS 安全命令。', dur: 3.8,
          run: function (pg, h) { h.fly('docICS', 'amf', 'gnb', win(pg, .02, .6), 'ICS REQUEST'); h.fly('key', 'amf', 'gnb', win(pg, .15, .8)); h.nodeGlow('gnb', win(pg, .7, 1)); } },
        { cap: '⑬ SecurityModeCommand', sub: '为什么有它：钥匙立刻用——从这条起信令上锁。只做完整性不加密：用"已通电的完整性"锁住"还没通电的加密配置"。', dur: 3,
          run: function (pg, h) { h.fly('shield', 'gnb', 'ue', win(pg, .05, .7)); h.lock(win(pg, .4, .95)); } },
        { cap: '⑭ SecurityModeComplete', sub: '为什么必须有它：协议世界没有"发出即收到"——UE 证明算法+钥匙验算通过。明文发送但带完整性（时序差精髓）。', dur: 2.6,
          run: function (pg, h) { h.fly('envUl', 'ue', 'gnb', win(pg, .05, .85), 'SMComplete'); h.pipeSecure(win(pg, .3, .95)); } },
        { cap: '⑮ UECapabilityEnquiry', sub: '为什么有它：定制配置前先问"你会什么"——按频段过滤着问（有存档则整步跳过：网络记性好，UE 少说话）。', dur: 2.6,
          run: function (pg, h) { h.fly('ask', 'gnb', 'ue', win(pg, .05, .9), 'Enquiry'); } },
        { cap: '⑯ UECapabilityInformation', sub: '为什么必须有它：问必有答——逐制式能力答卷 + 声明过滤口径（网络拿它对账缓存）。', dur: 2.6,
          run: function (pg, h) { h.fly('ask', 'ue', 'gnb', win(pg, .05, .9), '能力答卷'); } },
        { cap: '⑰ RRCReconfiguration ★装网卡', sub: '为什么有它：发装备——SRB2/DRB 一次装齐（此刻才装：用户面加密依赖安全激活），Registration Accept 搭车下行。', dur: 3.2,
          run: function (pg, h) { h.fly('cardA', 'gnb', 'ue', win(pg, .02, .55)); h.fly('cardB', 'gnb', 'ue', win(pg, .12, .65)); h.fly('envDl', 'gnb', 'ue', win(pg, .3, .9), 'Accept'); h.ueState('sec'); } },
        { cap: '⑱ RRCReconfigurationComplete', sub: '为什么必须有它：装机单要签收——网络必须知道配置真的生效（资源对账），回执再捎 Registration Complete。', dur: 2.6,
          run: function (pg, h) { h.fly('envUl', 'ue', 'gnb', win(pg, .05, .9), 'Complete×2'); } },
        { cap: '⑲ INITIAL CONTEXT SETUP RESPONSE ★闭环', sub: '为什么必须有它：与⑫配对收尾——gNB 报"档案建好、资源就位"，AMF/UPF 开通下行。19 帧、三层接力至此闭环。', dur: 3.6,
          run: function (pg, h) { h.fly('docResp', 'gnb', 'amf', win(pg, .02, .55), 'ICS RESPONSE'); h.ueState('on', win(pg, .2, .6)); h.happyPath(win(pg, .25, .9)); h.nodeGlow('amf', win(pg, .3, .9)); } }
      ]
    }
  };

  /* ---------- 引擎 ---------- */
  function mount(root, scriptOrId, opts) {
    opts = opts || {};
    var script = typeof scriptOrId === 'string' ? SCRIPTS[scriptOrId] : scriptOrId;
    if (!script) throw new Error('未知动画脚本: ' + scriptOrId);
    root.innerHTML = '';

    var card = document.createElement('div'); card.className = 'fa-wrap';
    root.appendChild(card);
    var head = document.createElement('div'); head.className = 'fa-head';
    head.innerHTML = '<div class="fa-title">' + script.title + '</div>';
    card.appendChild(head);

    var svgBox = document.createElement('div'); svgBox.className = 'fa-stage';
    card.appendChild(svgBox);
    var svg = E('svg', { viewBox: script.vb.join(' '), preserveAspectRatio: 'xMidYMid meet', role: 'img', 'aria-label': script.title });
    svgBox.appendChild(svg);

    var cap = document.createElement('div'); cap.className = 'fa-cap';
    cap.innerHTML = '<div class="fa-cap-t"></div><div class="fa-cap-c"></div>';
    card.appendChild(cap);

    var ctl = document.createElement('div'); ctl.className = 'fa-ctl';
    card.appendChild(ctl);
    var btnPlay = document.createElement('button'); btnPlay.className = 'fa-btn primary'; btnPlay.title = '播放/暂停';
    var dots = document.createElement('div'); dots.className = 'fa-dots';
    var barWrap = document.createElement('div'); barWrap.className = 'fa-bar';
    var barIn = document.createElement('i'); barWrap.appendChild(barIn);
    ctl.appendChild(btnPlay); ctl.appendChild(dots); ctl.appendChild(barWrap);

    /* —— 场景搭建：演员 + 通道 —— */
    var S = svg;
    var defs = E('defs', {}, S);
    [['green', '#18A34A'], ['amber', '#B45309'], ['violet', '#7C3AED'], ['blue', '#2563EB']].forEach(function (c) {
      var mk = E('marker', { id: 'fa-ah-' + c[0], viewBox: '0 0 10 10', refX: 9, refY: 5, markerWidth: 6.5, markerHeight: 6.5, orient: 'auto-start-reverse' }, defs);
      E('path', { d: 'M0 0 L10 5 L0 10 z', fill: c[1] }, mk);
    });

    /* 道具（通用，先于场景生成——自定义 setup 与默认场景都可用） */
    var props = {};
    script.props.forEach(function (pd) {
      var pg = E('g', { opacity: 0 }, S);
      PROP[pd.kind](pg, pd.label);
      props[pd.id] = pg;
    });
    /* 场景派发：剧本可自带 setup（自定义演员/通道/助手），否则用 attach 默认场景 */
    var scene = script.setup
      ? script.setup({ S: S, E: E, T: T, PROP: PROP, props: props, U: { clamp01: clamp01, smooth: smooth, win: win, laneY: laneY } })
      : (function () {
    var PT = { ue: A.ue, gnb: A.gnb, amf: A.amf }; /* 场景锚点（attach 专用） */
    var lanes = {
      uegnb: { from: PT.ue, to: PT.gnb },
      gnbamf: { from: PT.gnb, to: PT.amf }
    };

    /* 演员绘制（attach 版；引擎允许脚本自定义） */
    var ueG = E('g', { 'class': 'fa-node' }, S);
    E('rect', { x: PT.ue.x - 34, y: PT.ue.y - 62, width: 68, height: 112, rx: 12, fill: '#FFFFFF', stroke: '#B6BAC4', 'stroke-width': 2 }, ueG);
    var ueScr = E('rect', { x: PT.ue.x - 26, y: PT.ue.y - 52, width: 52, height: 82, rx: 5, fill: '#F0EDE6' }, ueG);
    var ueFace = E('text', { x: PT.ue.x, y: PT.ue.y - 6, 'class': 'fa-ue-face', 'text-anchor': 'middle' }, ueG); ueFace.textContent = '…';
    T(PT.ue.x, PT.ue.y + 76, 'fa-actor-t', 'UE', S);
    T(PT.ue.x, PT.ue.y + 94, 'fa-actor-s', '你的手机', S);
    var ueState = E('text', { x: PT.ue.x, y: PT.ue.y + 112, 'class': 'fa-ue-state', 'text-anchor': 'middle' }, S); ueState.textContent = '无服务';

    var gnbG = E('g', { 'class': 'fa-node' }, S);
    (function () {
      var x = PT.gnb.x, y = PT.gnb.y;
      E('path', { d: 'M' + (x - 3) + ' ' + (y + 42) + ' L' + (x - 22) + ' ' + (y - 44) + ' M' + (x + 3) + ' ' + (y + 42) + ' L' + (x + 22) + ' ' + (y - 44), stroke: '#9AA0AE', 'stroke-width': 3, fill: 'none' }, gnbG);
      E('path', { d: 'M' + (x - 30) + ' ' + (y + 42) + ' L' + (x + 30) + ' ' + (y + 42), stroke: '#9AA0AE', 'stroke-width': 3 }, gnbG);
      [-1, 1].forEach(function (s) {
        E('rect', { x: x + s * 22 - 8, y: y - 62, width: 16, height: 26, rx: 3, fill: '#FFFFFF', stroke: '#5A6072', 'stroke-width': 2 }, gnbG);
        E('path', { d: 'M' + (x + s * 22) + ' ' + (y - 36) + ' l' + s * 14 + ' 12 M' + (x + s * 22) + ' ' + (y - 36) + ' l-' + s * 14 + ' 12', stroke: '#18A34A', 'stroke-width': 1.6, fill: 'none' }, gnbG);
      });
      E('circle', { cx: x, cy: y - 20, r: 7, fill: '#E7F6EC', stroke: '#18A34A', 'stroke-width': 2 }, gnbG);
    })();
    T(PT.gnb.x, PT.gnb.y + 66, 'fa-actor-t', 'gNB', S);
    T(PT.gnb.x, PT.gnb.y + 84, 'fa-actor-s', '基站 · 邮差+管家', S);

    var amfG = E('g', { 'class': 'fa-node' }, S);
    (function () {
      var x = PT.amf.x, y = PT.amf.y;
      E('rect', { x: x - 52, y: y - 58, width: 104, height: 104, rx: 10, fill: '#FFFFFF', stroke: '#7C3AED', 'stroke-width': 2 }, amfG);
      for (var i = 0; i < 3; i++) {
        E('rect', { x: x - 40, y: y - 44 + i * 30, width: 80, height: 20, rx: 4, fill: '#F5F0FE', stroke: '#D5D2C8' }, amfG);
        [-28, -12, 4].forEach(function (dx) { E('circle', { cx: x + dx, cy: y - 34 + i * 30, r: 2.4, fill: '#7C3AED', opacity: .55 }, amfG); });
      }
    })();
    var vaultG = E('g', { opacity: 0 }, amfG);
    E('circle', { cx: PT.amf.x, cy: PT.amf.y - 84, r: 15, fill: '#FFF8E6', stroke: '#B45309', 'stroke-width': 2 }, vaultG);
    T(PT.amf.x, PT.amf.y - 80, 'fa-vault-t', 'AUSF', vaultG);
    T(PT.amf.x, PT.amf.y + 76, 'fa-actor-t', 'AMF', S);
    T(PT.amf.x, PT.amf.y + 94, 'fa-actor-s', '核心网 5GC · 档案馆', S);

    /* 通道：UE—gNB（SRB1 管道）与 gNB—AMF */
    var yL1 = laneY(PT.ue, PT.gnb) + 18, yL2 = laneY(PT.gnb, PT.amf) + 10;
    E('line', { x1: PT.ue.x + 44, y1: yL1, x2: PT.gnb.x - 40, y2: yL1, stroke: '#B6BAC4', 'stroke-width': 1.4, 'stroke-dasharray': '3 5' }, S);
    var pipe1 = E('line', { x1: PT.ue.x + 44, y1: yL1, x2: PT.gnb.x - 40, y2: yL1, stroke: '#18A34A', 'stroke-width': 3, 'stroke-linecap': 'round', opacity: 0 }, S);
    T((PT.ue.x + PT.gnb.x) / 2, yL1 - 8, 'fa-lane-t', 'SRB1 · 信令通道', S);
    var shieldHome = E('g', { opacity: 0 }, S);
    PROP.shield(shieldHome);
    shieldHome.setAttribute('transform', 'translate(' + ((PT.ue.x + PT.gnb.x) / 2) + ',' + (yL1 - 30) + ') scale(.8)');
    E('line', { x1: PT.gnb.x + 40, y1: yL2, x2: PT.amf.x - 58, y2: yL2, stroke: '#B6BAC4', 'stroke-width': 1.4, 'stroke-dasharray': '3 5' }, S);
    var pipe2 = E('line', { x1: PT.gnb.x + 40, y1: yL2, x2: PT.amf.x - 58, y2: yL2, stroke: '#7C3AED', 'stroke-width': 2.6, 'stroke-linecap': 'round', opacity: 0 }, S);
    T((PT.gnb.x + PT.amf.x) / 2, yL2 - 8, 'fa-lane-t', 'NG-C · 核心网连接', S);
    var lockBadge = E('g', { opacity: 0 }, S);
    (function () {
      var x = PT.gnb.x - 34, y = PT.gnb.y - 70;
      E('rect', { x: x - 8, y: y - 2, width: 16, height: 12, rx: 2.5, fill: '#E7F6EC', stroke: '#18A34A', 'stroke-width': 2 }, lockBadge);
      E('path', { d: 'M' + (x - 5) + ' ' + (y - 2) + ' v-3 a5 5 0 0 1 10 0 v3', fill: 'none', stroke: '#18A34A', 'stroke-width': 2 }, lockBadge);
    })();
    var happy = E('path', { d: 'M' + (PT.ue.x + 44) + ' ' + (yL1 + 22) + ' Q ' + PT.gnb.x + ' ' + (yL1 + 46) + ' ' + (PT.gnb.x + 40) + ' ' + (yL2 + 22) + ' Q ' + ((PT.gnb.x + PT.amf.x) / 2) + ' ' + (yL2 + 52) + ' ' + (PT.amf.x - 52) + ' ' + (PT.amf.y + 58), fill: 'none', stroke: '#18A34A', 'stroke-width': 2.2, 'stroke-dasharray': '7 6', opacity: 0, 'stroke-linecap': 'round' }, S);

    /* 道具 */
    var ripples = [];
    for (var ri = 0; ri < 3; ri++) ripples.push(E('circle', { cx: PT.ue.x + 10, cy: PT.ue.y - 70, r: 0, fill: 'none', stroke: '#B45309', 'stroke-width': 2, opacity: 0 }, S));

    /* —— 场景操作句柄（节拍 run 的工具箱） —— */
    function arcFly(id, fromKey, toKey, t, lift, dist) {
      var el = props[id]; if (!el) return;
      if (t <= 0 || t >= 1) { el.setAttribute('opacity', 0); return; }
      var a = PT[fromKey], b = PT[toKey];
      var u = smooth(t);
      var cx = (a.x + b.x) / 2, cy = Math.min(a.y, b.y) - (lift == null ? 70 : lift);
      var x = (1 - u) * (1 - u) * a.x + 2 * (1 - u) * u * cx + u * u * b.x;
      var y = (1 - u) * (1 - u) * a.y + 2 * (1 - u) * u * cy + u * u * b.y + (dist == null ? -46 : dist);
      el.setAttribute('transform', 'translate(' + x + ',' + y + ')' + (t > .06 && t < .94 ? ' rotate(' + ((u - .5) * 14) + ')' : ''));
      el.setAttribute('opacity', t > .92 ? (1 - (t - .92) / .08) : 1);
    }
    var UEFACE = { off: '–', reg: '…', sec: '◐', on: '✓' };
    var UESTATE = { off: '无服务', reg: '注册中', sec: '已保护', on: '在线' };
    var h = {
      UE: { x: PT.ue.x + 44, y: yL1 },
      fly: function (id, from, to, t) { arcFly(id, from, to, t); },
      ripple: function (at, t) {
        ripples.forEach(function (c, i) {
          var local = clamp01(t * 1.6 - i * .22);
          c.setAttribute('r', 6 + local * 46);
          c.setAttribute('opacity', local > 0 ? (1 - local) * .8 : 0);
        });
      },
      pipe: function (t) { pipe1.setAttribute('opacity', smooth(t) * .9); pipe2.setAttribute('opacity', smooth(t) * .5); },
      pipeSecure: function (t) { pipe1.setAttribute('opacity', 1); pipe1.setAttribute('stroke-width', 3 + smooth(t) * 1.5); shieldHome.setAttribute('opacity', smooth(t)); },
      lock: function (t) { lockBadge.setAttribute('opacity', smooth(t)); },
      vault: function (t) { vaultG.setAttribute('opacity', .25 + smooth(t) * .75); },
      nodeGlow: function (who, t) {
        var el = who === 'gnb' ? gnbG : who === 'amf' ? amfG : ueG;
        el.style.filter = t > 0 ? 'drop-shadow(0 0 ' + (6 * t) + 'px rgba(24,163,74,.65))' : '';
      },
      ueState: function (st, t) {
        var tt = t == null ? 1 : smooth(t);
        ueFace.textContent = UEFACE[st] || '…';
        ueState.textContent = UESTATE[st] || '';
        ueScr.setAttribute('fill', st === 'on' ? '#E7F6EC' : st === 'sec' ? '#F5F0FE' : st === 'reg' ? '#FFF8E6' : '#F0EDE6');
        ueScr.setAttribute('opacity', .5 + tt * .5);
      },
      happyPath: function (t) { happy.setAttribute('opacity', smooth(t) * .85); },
      reset: function () {
        Object.keys(props).forEach(function (k) { props[k].setAttribute('opacity', 0); });
        ripples.forEach(function (c) { c.setAttribute('opacity', 0); });
        pipe1.setAttribute('opacity', 0); pipe1.setAttribute('stroke-width', 3);
        pipe2.setAttribute('opacity', 0); shieldHome.setAttribute('opacity', 0);
        lockBadge.setAttribute('opacity', 0); vaultG.setAttribute('opacity', 0);
        happy.setAttribute('opacity', 0);
        h.ueState('off'); [gnbG, amfG, ueG].forEach(function (el) { el.style.filter = ''; });
      }
    };
    return { PT: PT, h: h };
    })();
    var PT = scene.PT, h = scene.h;

    /* —— 时间轴 —— */
    var starts = [], total = 0;
    script.beats.forEach(function (b) { starts.push(total); total += b.dur; });
    var t = 0, playing = !!opts.autoplay, last = null, rafId = null, curBeat = -1, rate = opts.rate || 1;

    /* dots */
    script.beats.forEach(function (b, i) {
      var d = document.createElement('button');
      d.className = 'fa-dot'; d.title = (i + 1) + '. ' + b.cap;
      d.setAttribute('aria-label', d.title);
      d.onclick = function () { seek(starts[i] + .01); if (!playing) draw(); };
      dots.appendChild(d);
    });
    var dotEls = dots.children;

    var playSVG = '<svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M7 4.8v14.4L19.2 12z"/></svg>';
    var pauseSVG = '<svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="5" width="4" height="14" rx="1"/><rect x="14" y="5" width="4" height="14" rx="1"/></svg>';
    function icon() { btnPlay.innerHTML = playing ? pauseSVG : playSVG; }
    btnPlay.onclick = function () { playing = !playing; if (playing) { last = null; loop(); } icon(); };
    icon();

    function beatAt(time) {
      for (var i = script.beats.length - 1; i >= 0; i--) if (time >= starts[i]) return i;
      return 0;
    }
    function draw() {
      var bi = beatAt(t);
      var b = script.beats[bi];
      var pg = clamp01((t - starts[bi]) / b.dur);
      if (bi !== curBeat) {
        curBeat = bi;
        cap.querySelector('.fa-cap-t').textContent = (bi + 1) + ' / ' + script.beats.length + ' · ' + b.cap;
        cap.querySelector('.fa-cap-c').textContent = b.sub;
        cap.classList.remove('flip'); void cap.offsetWidth; cap.classList.add('flip');
        for (var i = 0; i < dotEls.length; i++) dotEls[i].classList.toggle('on', i === bi);
      }
      h.resetKeep = null;
      b.run(pg, h);
      barIn.style.width = (t / total * 100) + '%';
      if (t >= total) { playing = false; icon(); }
    }
    function loop() {
      if (!playing) return;
      var now = performance.now();
      if (last != null) t += (now - last) / 1000 * rate;
      last = now;
      if (t > total) t = total;
      draw();
      if (playing) rafId = requestAnimationFrame(loop); else last = null;
    }
    function seek(nt) { t = Math.max(0, Math.min(total - .01, nt)); last = null; if (!playing) draw(); }

    if (opts.onEnd == null) opts.onEnd = null;
    h.reset();
    if (playing) loop(); else draw();

    return {
      play: function () { if (t >= total) t = 0; playing = true; last = null; icon(); loop(); },
      pause: function () { playing = false; icon(); },
      seek: seek,
      state: function () { return { t: t, total: total, playing: playing, beat: beatAt(t) }; },
      unmount: function () { playing = false; root.innerHTML = ''; }
    };
  }

  R.FlowAnim = { mount: mount, SCRIPTS: SCRIPTS, _SCRIPTS_attach: SCRIPTS.attach };
})(typeof window !== 'undefined' ? window : globalThis);
