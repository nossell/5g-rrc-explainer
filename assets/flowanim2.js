/* ============================================================
   assets/flowanim2.js — 动画资产 #2/#3：切换（XN）与重建
   依赖 flowanim.js 引擎（须在其后加载；SCRIPTS 已由引擎暴露）。
   剧本结构：title/vb/props/setup(自定义场景+助手)/beats。
   每拍 cap+sub，sub 以"为什么有它"开头——与课程信令图一一对齐。
   ============================================================ */
(function (g) {
  'use strict';
  var FA = g.RRC && g.RRC.FlowAnim;
  if (!FA) throw new Error('flowanim2.js 须在 flowanim.js 之后加载');

  /* beats 闭包可直接使用的工具（与引擎同款语义） */
  function clamp01(t) { return t < 0 ? 0 : t > 1 ? 1 : t; }
  function smooth(t) { t = clamp01(t); return t * t * (3 - 2 * t); }
  function win(pg, a, b) { return clamp01((pg - a) / (b - a)); }

  /* ---------- 资产 #2：切换全流程（XN 站间） ---------- */
  FA.SCRIPTS.handover = {
    title: '切换全流程（XN 站间）· 12 拍动画版（与切换课 XN 信令图对应）',
    vb: [0, 0, 960, 470],
    props: [
      { id: 'rep', kind: 'ask', label: 'A3 报告' },
      { id: 'docReq', kind: 'doc', label: 'HO REQUEST' },
      { id: 'docAck', kind: 'doc', label: 'HO ACK·指南' },
      { id: 'cmdEnv', kind: 'envelope', label: 'HO 命令' },
      { id: 'snDoc', kind: 'card', label: 'SN 状态' },
      { id: 'doneEnv', kind: 'envelope', label: 'Complete' },
      { id: 'psrDoc', kind: 'doc', label: 'PATH SWITCH' },
      { id: 'relEnv', kind: 'envelope', label: 'CTX RELEASE' }
    ],
    setup: function (ctx) {
      var S = ctx.S, E = ctx.E, T = ctx.T, props = ctx.props, U = ctx.U;
      var PT = { ue: { x: 118, y: 330 }, src: { x: 400, y: 225 }, tgt: { x: 560, y: 400 }, amf: { x: 845, y: 235 } };

      /* UE 手机 */
      var ueG = E('g', { 'class': 'fa-node' }, S);
      E('rect', { x: PT.ue.x - 34, y: PT.ue.y - 62, width: 68, height: 112, rx: 12, fill: '#FFFFFF', stroke: '#B6BAC4', 'stroke-width': 2 }, ueG);
      var ueScr = E('rect', { x: PT.ue.x - 26, y: PT.ue.y - 52, width: 52, height: 82, rx: 5, fill: '#E7F6EC' }, ueG);
      var ueFace = E('text', { x: PT.ue.x, y: PT.ue.y - 6, 'class': 'fa-ue-face', 'text-anchor': 'middle' }, ueG); ueFace.textContent = '✓';
      T(PT.ue.x, PT.ue.y + 76, 'fa-actor-t', 'UE', S);
      T(PT.ue.x, PT.ue.y + 94, 'fa-actor-s', '你的手机 · 边走边通话', S);
      var ueState = E('text', { x: PT.ue.x, y: PT.ue.y + 112, 'class': 'fa-ue-state', 'text-anchor': 'middle' }, S); ueState.textContent = '在线 · 源小区';

      /* 塔绘制（源/目标复用） */
      function tower(x, y, label, sub) {
        var gr = E('g', { 'class': 'fa-node' }, S);
        E('path', { d: 'M' + (x - 3) + ' ' + (y + 42) + ' L' + (x - 22) + ' ' + (y - 44) + ' M' + (x + 3) + ' ' + (y + 42) + ' L' + (x + 22) + ' ' + (y - 44), stroke: '#9AA0AE', 'stroke-width': 3, fill: 'none' }, gr);
        E('path', { d: 'M' + (x - 30) + ' ' + (y + 42) + ' L' + (x + 30) + ' ' + (y + 42), stroke: '#9AA0AE', 'stroke-width': 3 }, gr);
        [-1, 1].forEach(function (s) {
          E('rect', { x: x + s * 22 - 8, y: y - 62, width: 16, height: 26, rx: 3, fill: '#FFFFFF', stroke: '#5A6072', 'stroke-width': 2 }, gr);
          E('path', { d: 'M' + (x + s * 22) + ' ' + (y - 36) + ' l' + s * 14 + ' 12 M' + (x + s * 22) + ' ' + (y - 36) + ' l-' + s * 14 + ' 12', stroke: '#18A34A', 'stroke-width': 1.6, fill: 'none' }, gr);
        });
        E('circle', { cx: x, cy: y - 20, r: 7, fill: '#E7F6EC', stroke: '#18A34A', 'stroke-width': 2 }, gr);
        T(x, y + 66, 'fa-actor-t', label, S);
        T(x, y + 84, 'fa-actor-s', sub, S);
        return gr;
      }
      var srcG = tower(PT.src.x, PT.src.y, '源 gNB', '旧家 · 信号渐弱');
      var tgtG = tower(PT.tgt.x, PT.tgt.y, '目标 gNB', '新家 · 收单备房');

      /* AMF/UPF */
      var amfG = E('g', { 'class': 'fa-node' }, S);
      (function () {
        var x = PT.amf.x, y = PT.amf.y;
        E('rect', { x: x - 52, y: y - 58, width: 104, height: 104, rx: 10, fill: '#FFFFFF', stroke: '#7C3AED', 'stroke-width': 2 }, amfG);
        for (var i = 0; i < 3; i++) {
          E('rect', { x: x - 40, y: y - 44 + i * 30, width: 80, height: 20, rx: 4, fill: '#F5F0FE', stroke: '#D5D2C8' }, amfG);
          [-28, -12, 4].forEach(function (dx) { E('circle', { cx: x + dx, cy: y - 34 + i * 30, r: 2.4, fill: '#7C3AED', opacity: .55 }, amfG); });
        }
      })();
      T(PT.amf.x, PT.amf.y + 76, 'fa-actor-t', 'AMF / UPF', S);
      T(PT.amf.x, PT.amf.y + 94, 'fa-actor-s', '核心网 · 数据总闸', S);

      /* 通道：UE—源（现服务，绿）、UE—目标（新服务，切换后点亮）、源—目标（Xn）、目标—AMF（NG） */
      function seg(a, b, padA, padB, yoff) {
        var y1 = (a.y + b.y) / 2 + (yoff || 0);
        return { y: y1, x1: a.x + padA, x2: b.x + padB };
      }
      var l1 = seg(PT.ue, PT.src, 44, -34, 2);
      var laneOld = E('line', { x1: l1.x1, y1: l1.y, x2: l1.x2, y2: l1.y, stroke: '#18A34A', 'stroke-width': 3, 'stroke-linecap': 'round', opacity: .85 }, S);
      T((l1.x1 + l1.x2) / 2, l1.y - 8, 'fa-lane-t', '现服务 · SRB', S);
      var l2 = seg(PT.ue, PT.tgt, 44, -34, 66);
      var laneNew = E('line', { x1: l2.x1, y1: l2.y, x2: l2.x2, y2: l2.y, stroke: '#B6BAC4', 'stroke-width': 1.4, 'stroke-dasharray': '3 5' }, S);
      var laneNewOn = E('line', { x1: l2.x1, y1: l2.y, x2: l2.x2, y2: l2.y, stroke: '#18A34A', 'stroke-width': 3, 'stroke-linecap': 'round', opacity: 0 }, S);
      T((l2.x1 + l2.x2) / 2 + 26, l2.y + 16, 'fa-lane-t', '新服务 · 切换后点亮', S);
      var yX = (PT.src.y + PT.tgt.y) / 2 + 30;
      var laneX = E('line', { x1: PT.src.x - 8, y1: PT.src.y + 46, x2: PT.tgt.x + 8, y2: PT.tgt.y - 68, stroke: '#B45309', 'stroke-width': 1.4, 'stroke-dasharray': '3 5' }, S);
      var laneXOn = E('line', { x1: PT.src.x - 8, y1: PT.src.y + 46, x2: PT.tgt.x + 8, y2: PT.tgt.y - 68, stroke: '#B45309', 'stroke-width': 2.6, 'stroke-linecap': 'round', opacity: 0 }, S);
      T((PT.src.x + PT.tgt.x) / 2 - 44, (PT.src.y + PT.tgt.y) / 2 + 6, 'fa-lane-t', 'Xn · 站间直连', S);
      var laneNG = E('line', { x1: PT.tgt.x + 34, y1: PT.tgt.y - 52, x2: PT.amf.x - 56, y2: PT.amf.y + 52, stroke: '#B6BAC4', 'stroke-width': 1.4, 'stroke-dasharray': '3 5' }, S);
      var laneNGOn = E('line', { x1: PT.tgt.x + 34, y1: PT.tgt.y - 52, x2: PT.amf.x - 56, y2: PT.amf.y + 52, stroke: '#7C3AED', 'stroke-width': 2.6, 'stroke-linecap': 'round', opacity: 0 }, S);
      T((PT.tgt.x + PT.amf.x) / 2 + 8, (PT.tgt.y + PT.amf.y) / 2 + 40, 'fa-lane-t', 'NG · 新家报户口', S);

      /* T304 沙漏徽章（UE 头顶） */
      var t304 = E('g', { opacity: 0 }, S);
      E('rect', { x: PT.ue.x + 40, y: PT.ue.y - 96, width: 58, height: 22, rx: 5, fill: '#FFF8E6', stroke: '#B45309', 'stroke-width': 1.8 }, t304);
      T(PT.ue.x + 69, PT.ue.y - 81, 'fa-lane-t', 'T304 计时', t304);

      /* 用户新数据路（happy path：UE—目标—核心网） */
      var happy = E('path', { d: 'M' + (PT.ue.x + 44) + ' ' + (l2.y + 8) + ' Q ' + PT.tgt.x + ' ' + (l2.y + 30) + ' ' + (PT.tgt.x + 30) + ' ' + (PT.tgt.y - 44) + ' Q ' + ((PT.tgt.x + PT.amf.x) / 2) + ' ' + ((PT.tgt.y + PT.amf.y) / 2 + 70) + ' ' + (PT.amf.x - 52) + ' ' + (PT.amf.y + 58), fill: 'none', stroke: '#18A34A', 'stroke-width': 2.2, 'stroke-dasharray': '7 6', opacity: 0, 'stroke-linecap': 'round' }, S);

      function arcFly(id, a, b, t, lift) {
        var el = props[id]; if (!el) return;
        if (t <= 0 || t >= 1) { el.setAttribute('opacity', 0); return; }
        var u = U.smooth(t);
        var cx = (a.x + b.x) / 2, cy = Math.min(a.y, b.y) - (lift == null ? 60 : lift);
        var x = (1 - u) * (1 - u) * a.x + 2 * (1 - u) * u * cx + u * u * b.x;
        var y = (1 - u) * (1 - u) * a.y + 2 * (1 - u) * u * cy + u * u * b.y - 40;
        el.setAttribute('transform', 'translate(' + x + ',' + y + ')' + (t > .06 && t < .94 ? ' rotate(' + ((u - .5) * 14) + ')' : ''));
        el.setAttribute('opacity', t > .92 ? (1 - (t - .92) / .08) : 1);
      }
      var UESTATE = { src: '在线 · 源小区', moving: '搬家执行中', tgt: '在线 · 新小区' };
      var h = {
        fly: function (id, from, to, t, lift) { arcFly(id, PT[from], PT[to], t, lift); },
        xOn: function (t) { laneXOn.setAttribute('opacity', U.smooth(t) * .95); },
        ngOn: function (t) { laneNGOn.setAttribute('opacity', U.smooth(t) * .95); },
        serveSwap: function (t) {
          var s = U.smooth(t);
          laneOld.setAttribute('opacity', .85 * (1 - s));
          laneOld.setAttribute('stroke-dasharray', s > 0 ? '2 6' : '');
          laneNewOn.setAttribute('opacity', s);
          srcG.style.opacity = 1 - s * .45;
          tgtG.style.filter = s > 0 ? 'drop-shadow(0 0 ' + (6 * s) + 'px rgba(24,163,74,.6))' : '';
          srcG.style.filter = s < 1 ? 'drop-shadow(0 0 ' + (5 * (1 - s)) + 'px rgba(180,83,9,.55))' : '';
        },
        t304: function (t) { t304.setAttribute('opacity', U.smooth(t)); },
        ueState: function (st) { ueState.textContent = UESTATE[st] || ''; ueFace.textContent = st === 'moving' ? '…' : st === 'tgt' ? '✓' : '✓'; },
        happyPath: function (t) { happy.setAttribute('opacity', U.smooth(t) * .85); },
        nodeGlow: function (who, t) {
          var el = who === 'src' ? srcG : who === 'tgt' ? tgtG : who === 'amf' ? amfG : ueG;
          el.style.filter = t > 0 ? 'drop-shadow(0 0 ' + (6 * t) + 'px rgba(124,58,237,.55))' : '';
        },
        reset: function () {
          Object.keys(props).forEach(function (k) { props[k].setAttribute('opacity', 0); });
          laneOld.setAttribute('opacity', .85); laneOld.setAttribute('stroke-dasharray', '');
          laneNewOn.setAttribute('opacity', 0); laneXOn.setAttribute('opacity', 0); laneNGOn.setAttribute('opacity', 0);
          t304.setAttribute('opacity', 0); happy.setAttribute('opacity', 0);
          srcG.style.opacity = 1; srcG.style.filter = ''; tgtG.style.filter = ''; amfG.style.filter = '';
          h.ueState('src');
        }
      };
      return { PT: PT, h: h };
    },
    /* 12 拍 = 切换课 XN 信令路径 + 数据前转/新隧道两拍细化 */
    beats: [
      { cap: '① MeasurementReport（A3）', sub: '为什么有它：邻区持续比服务区好（A3 不等式+TTT）——网络长眼睛全靠这份侦察报告，切换决策的第一手依据。', dur: 2.8,
        run: function (pg, h) { h.fly('rep', 'ue', 'src', win(pg, .1, .9)); } },
      { cap: '② HANDOVER REQUEST（Xn 托运单）', sub: '为什么有它：源站不认识 UE 的"新家"——托运单直发目标站：搬谁（UE 上下文整包）、为什么（Cause）、押金（UE-AMBR/QoS）。', dur: 3.4,
        run: function (pg, h) { h.fly('docReq', 'src', 'tgt', win(pg, .02, .85)); h.xOn(win(pg, .1, .5)); } },
      { cap: '③ HANDOVER REQUEST ACK（备好了）', sub: '为什么必须有它：协议不搞"默认成功"——目标站验货备房后回执，还随信附上给 UE 的搬家指南（透明容器，源站原样转发不偷看）。', dur: 3,
        run: function (pg, h) { h.fly('docAck', 'tgt', 'src', win(pg, .02, .85)); h.nodeGlow('tgt', win(pg, .3, 1)); } },
      { cap: '④ HO 命令 · RRCReconfiguration', sub: '为什么有它：把搬家指南亲手交给 UE——新小区参数+新 C-RNTI+T304 沙漏。UE 收到即断旧迎新，沙漏开始跑。', dur: 3,
        run: function (pg, h) { h.fly('cmdEnv', 'src', 'ue', win(pg, .02, .8)); h.t304(win(pg, .45, 1)); } },
      { cap: '⑤ UE 执行切换 · 接入新小区', sub: '为什么有这一拍：命令≠完成——UE 在新小区敲门（随机接入）、换牌（新 C-RNTI 转正），T304 停表，源侧链路同时熄灭。', dur: 3.4,
        run: function (pg, h) { h.serveSwap(win(pg, .15, .95)); h.ueState('moving'); } },
      { cap: '⑥ SN STATUS TRANSFER（交接班记录）', sub: '为什么有它：一帧都不能丢重——源站把每个承载的 PDCP 序号账本交给新站，用户无感续传。', dur: 2.8,
        run: function (pg, h) { h.fly('snDoc', 'src', 'tgt', win(pg, .05, .9)); } },
      { cap: '⑦ RRCReconfigurationComplete（新家签收）', sub: '为什么必须有它：新配置生效要有凭证——UE 在新小区发回执，目标站收到才敢放用户面数据。', dur: 2.6,
        run: function (pg, h) { h.fly('doneEnv', 'ue', 'tgt', win(pg, .05, .9)); h.ueState('tgt'); } },
      { cap: '⑧ PATH SWITCH REQUEST（改道申请）', sub: '为什么有它：数据总闸还开着旧龙头——新站向核心网申请把下行隧道终点改到自己家（逐会话的新端点）。', dur: 3,
        run: function (pg, h) { h.fly('psrDoc', 'tgt', 'amf', win(pg, .02, .85)); h.ngOn(win(pg, .1, .6)); } },
      { cap: '⑨ PATH SWITCH REQUEST ACK（改道回执）', sub: '为什么必须有它：核心网确认改道完成+顺带交后续密钥材料——从这一刻起，数据走新家。', dur: 2.8,
        run: function (pg, h) { h.fly('psrDoc', 'amf', 'tgt', win(pg, .05, .9)); h.nodeGlow('amf', win(pg, .2, 1)); } },
      { cap: '⑩ 用户面新隧道打通', sub: '为什么有这一拍：控制面闭环的终点是数据面换路——UE↔新站↔核心网的新隧道满速放行（原隧道作废）。', dur: 3,
        run: function (pg, h) { h.happyPath(win(pg, .05, .95)); } },
      { cap: '⑪ UE CONTEXT RELEASE（Xn 销户）', sub: '为什么有它：旧家的档案该销了——目标站通知源站释放 UE 上下文（资源回收，Xn 事务闭环）。', dur: 2.8,
        run: function (pg, h) { h.fly('relEnv', 'tgt', 'src', win(pg, .05, .9)); } },
      { cap: '⑫ 收官 · 源熄新明', sub: '一场搬家十二拍收官：报告→托运→备房→命令→执行→账本→签收→改道→换路→销户。三场景（站内/XN/NG）与 CHO 变体见切换课。', dur: 3,
        run: function (pg, h) { h.nodeGlow('tgt', win(pg, 0, .8)); h.nodeGlow('ue', win(pg, .3, 1)); } }
    ]
  };

  /* ---------- 资产 #3：无线链路失败与重建 ---------- */
  FA.SCRIPTS.reestablish = {
    title: '掉线救场 · 无线链路失败与 RRC 重建 · 8 拍动画版',
    vb: [0, 0, 960, 470],
    props: [
      { id: 'sos', kind: 'envelope', label: '求救信 · 三件套' },
      { id: 'ctxDoc', kind: 'doc', label: 'UE 档案' },
      { id: 'okEnv', kind: 'envelope', label: 'Reestablishment' },
      { id: 'key', kind: 'key', label: '续命钥匙' }
    ],
    setup: function (ctx) {
      var S = ctx.S, E = ctx.E, T = ctx.T, props = ctx.props, U = ctx.U;
      var PT = { ue: { x: 200, y: 330 }, gnb: { x: 640, y: 250 } };

      var ueG = E('g', { 'class': 'fa-node' }, S);
      E('rect', { x: PT.ue.x - 34, y: PT.ue.y - 62, width: 68, height: 112, rx: 12, fill: '#FFFFFF', stroke: '#B6BAC4', 'stroke-width': 2 }, ueG);
      var ueScr = E('rect', { x: PT.ue.x - 26, y: PT.ue.y - 52, width: 52, height: 82, rx: 5, fill: '#E7F6EC' }, ueG);
      var ueFace = E('text', { x: PT.ue.x, y: PT.ue.y - 6, 'class': 'fa-ue-face', 'text-anchor': 'middle' }, ueG); ueFace.textContent = '✓';
      T(PT.ue.x, PT.ue.y + 76, 'fa-actor-t', 'UE', S);
      T(PT.ue.x, PT.ue.y + 94, 'fa-actor-s', '通话中 · 突遇深衰落', S);
      var ueState = E('text', { x: PT.ue.x, y: PT.ue.y + 112, 'class': 'fa-ue-state', 'text-anchor': 'middle' }, S); ueState.textContent = '在线';

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
      T(PT.gnb.x, PT.gnb.y + 84, 'fa-actor-s', '原小区 · 档案还在', S);

      /* 无线链路（粗管：正常绿→失步闪红→断裂→重建后恢复） */
      var yL = (PT.ue.y + PT.gnb.y) / 2 + 20;
      var linkBase = E('line', { x1: PT.ue.x + 44, y1: yL, x2: PT.gnb.x - 36, y2: yL, stroke: '#B6BAC4', 'stroke-width': 1.4, 'stroke-dasharray': '3 5' }, S);
      var linkOk = E('line', { x1: PT.ue.x + 44, y1: yL, x2: PT.gnb.x - 36, y2: yL, stroke: '#18A34A', 'stroke-width': 3.2, 'stroke-linecap': 'round', opacity: .9 }, S);
      var linkBad = E('line', { x1: PT.ue.x + 44, y1: yL, x2: PT.gnb.x - 36, y2: yL, stroke: '#DC2626', 'stroke-width': 2.6, 'stroke-dasharray': '10 8', opacity: 0 }, S);
      T((PT.ue.x + PT.gnb.x) / 2, yL - 10, 'fa-lane-t', '无线链路 · SRB1/2 + DRB', S);
      /* T310/N310 徽章 */
      var nBadge = E('g', { opacity: 0 }, S);
      E('rect', { x: (PT.ue.x + PT.gnb.x) / 2 - 74, y: yL - 46, width: 148, height: 24, rx: 5, fill: '#FFF1F0', stroke: '#DC2626', 'stroke-width': 1.8 }, nBadge);
      T((PT.ue.x + PT.gnb.x) / 2, yL - 30, 'fa-lane-t', 'N310 连续失步 · T310 计时', nBadge);
      /* RLF 闪电 */
      var rlf = E('g', { opacity: 0 }, S);
      E('path', { d: 'M' + ((PT.ue.x + PT.gnb.x) / 2 - 4) + ' ' + (yL - 34) + ' l-10 16 h8 l-6 14 l16 -18 h-9 l7 -12 z', fill: '#DC2626' }, rlf);
      T((PT.ue.x + PT.gnb.x) / 2 + 30, yL - 24, 'fa-lane-t', 'RLF', rlf);

      function arcFly(id, a, b, t, lift) {
        var el = props[id]; if (!el) return;
        if (t <= 0 || t >= 1) { el.setAttribute('opacity', 0); return; }
        var u = U.smooth(t);
        var cx = (a.x + b.x) / 2, cy = Math.min(a.y, b.y) - (lift == null ? 60 : lift);
        var x = (1 - u) * (1 - u) * a.x + 2 * (1 - u) * u * cx + u * u * b.x;
        var y = (1 - u) * (1 - u) * a.y + 2 * (1 - u) * u * cy + u * u * b.y - 40;
        el.setAttribute('transform', 'translate(' + x + ',' + y + ')' + (t > .06 && t < .94 ? ' rotate(' + ((u - .5) * 14) + ')' : ''));
        el.setAttribute('opacity', t > .92 ? (1 - (t - .92) / .08) : 1);
      }
      var UESTATE = { on: '在线', lost: '失步 · 计时中', rlf: '链路失败（RLF）', sos: '求救中', back: '重建成功 · 续传' };
      var h = {
        fly: function (id, from, to, t, lift) { arcFly(id, PT[from], PT[to], t, lift); },
        link: function (t) { var s = U.smooth(t); linkOk.setAttribute('opacity', .9 * s); linkBad.setAttribute('opacity', (1 - s) * .85); },
        jitter: function (t) { var s = U.smooth(t); nBadge.setAttribute('opacity', s); linkOk.setAttribute('stroke-dasharray', s > .2 ? ((10 + Math.round(Math.sin(s * 30) * 8)) + ' ' + (8 - Math.round(Math.sin(s * 30) * 6))) : ''); },
        rlf: function (t) { rlf.setAttribute('opacity', U.smooth(t)); },
        ueState: function (st) { ueState.textContent = UESTATE[st] || ''; ueFace.textContent = st === 'on' || st === 'back' ? '✓' : st === 'rlf' ? '✗' : '…'; ueScr.setAttribute('fill', st === 'on' || st === 'back' ? '#E7F6EC' : st === 'lost' ? '#FFF8E6' : '#FFF1F0'); },
        nodeGlow: function (who, t) { (who === 'gnb' ? gnbG : ueG).style.filter = t > 0 ? 'drop-shadow(0 0 ' + (6 * t) + 'px rgba(24,163,74,.6))' : ''; },
        ctxPop: function (t) { gnbG.style.filter = U.smooth(t) > 0 ? 'drop-shadow(0 0 6px rgba(24,163,74,.6))' : ''; },
        reset: function () {
          Object.keys(props).forEach(function (k) { props[k].setAttribute('opacity', 0); });
          linkOk.setAttribute('opacity', .9); linkOk.setAttribute('stroke-dasharray', '');
          linkBad.setAttribute('opacity', 0); nBadge.setAttribute('opacity', 0); rlf.setAttribute('opacity', 0);
          gnbG.style.filter = ''; ueG.style.filter = ''; h.ueState('on');
        }
      };
      return { PT: PT, h: h };
    },
    beats: [
      { cap: '① 通话进行中', sub: '基线一拍：SRB1/2+DRB 全开、数据满速——接下来的每一拍都在回答"这场安稳是怎么被打破、又怎么救回来的"。', dur: 2.6,
        run: function (pg, h) { h.link(1); h.ueState('on'); } },
      { cap: '② N310 连续失步', sub: '为什么有它：物理层开始连报"听不清"——N310 是道闸：连续 n 次失步才动手（单次抖动不误杀），达到门槛即启动 T310。', dur: 3,
        run: function (pg, h) { h.jitter(win(pg, .1, .9)); h.ueState('lost'); } },
      { cap: '③ T310 到期 · RLF', sub: '为什么有它：沙漏走完还没同步回来——正式宣布无线链路失败（RLF）：测量/重配全部冻结，进入救场程序。', dur: 2.8,
        run: function (pg, h) { h.rlf(win(pg, .1, .8)); h.link(0); h.ueState('rlf'); } },
      { cap: '④ RRCReestablishmentRequest（求救信）', sub: '为什么有它：回原小区续旧链——信里只有三件套：老门牌（PCI）+工牌（C-RNTI）+防伪章（shortMAC-I，用旧钥匙算的短鉴权码，防冒名求救）。', dur: 3.4,
        run: function (pg, h) { h.fly('sos', 'ue', 'gnb', win(pg, .02, .9)); h.ueState('sos'); } },
      { cap: '⑤ gNB 找回档案（验明正身）', sub: '为什么有这一拍：网络侧按 PCI+短码翻档案——shortMAC-I 对得上才认账（对不上回 Reject，UE 只能回 IDLE 重来）。', dur: 2.8,
        run: function (pg, h) { h.ctxPop(win(pg, .1, .9)); h.nodeGlow('gnb', win(pg, .2, 1)); } },
      { cap: '⑥ RRCReestablishment（恢复批复）', sub: '为什么有它：SRB1 重建+密钥续命——用 NHC 计数横向派生新钥匙（不动根密钥），信令通道重新上锁。', dur: 3,
        run: function (pg, h) { h.fly('okEnv', 'gnb', 'ue', win(pg, .05, .55)); h.fly('key', 'gnb', 'ue', win(pg, .25, .85)); } },
      { cap: '⑦ 链路重生 · 数据续传', sub: '为什么必须有它：恢复≠回原样——DRB 由网络随后重配（RRCReconfiguration），PDCP 从断点续传，用户只感到半秒卡顿。', dur: 3,
        run: function (pg, h) { h.link(win(pg, .1, .9)); h.ueState('back'); h.nodeGlow('ue', win(pg, .3, 1)); } },
      { cap: '⑧ 一拍讲透失败树', sub: '重建只是救场的一种：T304 超时（切换失败）走的是同一条求救路；求救被拒才回 IDLE。三大定时器分工见「定时器网」。', dur: 3,
        run: function (pg, h) { h.ueState('back'); } }
    ]
  };
})(typeof window !== 'undefined' ? window : globalThis);
