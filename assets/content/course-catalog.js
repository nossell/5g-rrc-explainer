/* ============================================================
   assets/content/course-catalog.js — 课程目录元数据（自动生成，勿手改）
   生成：tools/gen_catalog.js（数据源=engine 注册表实况，与 dump_refs ORDER 同装载法）
   消费：index 课程墙（Hub.render opts.metas）/ app 懒加载导航与按需装载（file+prereq 链）。
   纪律：动过任何课程源（m*.js）必须重跑生成器（红线 17，check_idempotence 把守）。
   ============================================================ */
(function (g) {
  'use strict';
  g.RRC_CATALOG = [
 {
  "id": "ma",
  "num": 0,
  "title": "接入全流程（注册）",
  "tagline": "每条标准信令一帧：从 PRACH 到注册完成，步步都有\"为什么\"",
  "tech": "5G NR · SA",
  "minutes": 22,
  "free": true,
  "file": "ma.js",
  "steps": 19,
  "quizN": 5,
  "prereq": []
 },
 {
  "id": "m0",
  "num": 1,
  "title": "RRC 连接建立",
  "tagline": "UE 是怎么\"上网落户\"的",
  "tech": "5G NR · SA",
  "minutes": 8,
  "free": true,
  "file": "core.js",
  "steps": 6,
  "quizN": 5,
  "prereq": []
 },
 {
  "id": "m1",
  "num": 2,
  "title": "系统消息",
  "tagline": "UE 的\"入住须知\"从哪来：MIB、SIB1 与按需 SI",
  "tech": "5G NR · SA",
  "minutes": 9,
  "free": true,
  "file": "m1.js",
  "steps": 7,
  "quizN": 5,
  "prereq": [
   "m0"
  ]
 },
 {
  "id": "m2",
  "num": 3,
  "title": "寻呼与 DRX",
  "tagline": "网络怎么\"敲门\"找到睡着的 UE",
  "tech": "5G NR · SA",
  "minutes": 10,
  "free": true,
  "file": "m2.js",
  "steps": 7,
  "quizN": 5,
  "prereq": [
   "m0"
  ]
 },
 {
  "id": "m3",
  "num": 4,
  "title": "测量事件",
  "tagline": "A1–A6 / B1–B2：UE 什么时候上报、报什么",
  "tech": "5G NR · SA",
  "minutes": 12,
  "free": false,
  "file": "",
  "steps": 7,
  "quizN": 5,
  "prereq": [
   "m0"
  ]
 },
 {
  "id": "m4",
  "num": 5,
  "title": "切换全流程",
  "tagline": "站内 / XN / NG 三条路：把协议规定的标准信令画全",
  "tech": "5G NR · SA",
  "minutes": 16,
  "free": false,
  "file": "",
  "steps": 6,
  "quizN": 5,
  "prereq": [
   "m3"
  ]
 },
 {
  "id": "m5",
  "num": 6,
  "title": "承载与重配置",
  "tagline": "SRB2 / DRB：信令与数据的\"网卡\"怎么装",
  "tech": "5G NR · SA",
  "minutes": 10,
  "free": false,
  "file": "",
  "steps": 6,
  "quizN": 5,
  "prereq": [
   "m0"
  ]
 },
 {
  "id": "m6",
  "num": 7,
  "title": "RRC_INACTIVE",
  "tagline": "5G 新状态：挂起、RNA 更新与\"失而复得\"的恢复",
  "tech": "5G NR · SA",
  "minutes": 12,
  "free": false,
  "file": "",
  "steps": 7,
  "quizN": 5,
  "prereq": [
   "m0",
   "m2"
  ]
 },
 {
  "id": "m7",
  "num": 8,
  "title": "AS 安全激活",
  "tagline": "SecurityModeCommand：先有鸡还是先有蛋的协议解法",
  "tech": "5G NR · SA",
  "minutes": 9,
  "free": false,
  "file": "",
  "steps": 6,
  "quizN": 5,
  "prereq": [
   "m0",
   "m5"
  ]
 },
 {
  "id": "m8",
  "num": 9,
  "title": "LTE↔NR 互操作（EN-DC）",
  "tagline": "NSA 双连接：NR 的 RRC 消息为什么装在 LTE 信封里",
  "tech": "LTE + NR · NSA",
  "minutes": 13,
  "free": false,
  "file": "",
  "steps": 7,
  "quizN": 5,
  "prereq": [
   "m0",
   "m3"
  ]
 },
 {
  "id": "mi",
  "num": 10,
  "title": "NG 接口课（38.413）",
  "tagline": "基站开张的一天：SCTP→NG SETUP→会话三件套→上下文管理与兜底",
  "tech": "5G NR · SA · NG-C",
  "minutes": 25,
  "free": false,
  "file": "",
  "steps": 15,
  "quizN": 5,
  "prereq": []
 },
 {
  "id": "mx",
  "num": 11,
  "title": "Xn 接口课（38.423）",
  "tagline": "邻居关系网：XN SETUP 建交 → S-NODE 双连接 → 找回 INACTIVE 档案 → 绝交与兜底",
  "tech": "5G NR · SA · Xn-C",
  "minutes": 30,
  "free": false,
  "file": "",
  "steps": 18,
  "quizN": 5,
  "prereq": []
 },
 {
  "id": "mc",
  "num": 12,
  "title": "MAC 随机接入课（38.321）",
  "tagline": "开机第一秒的对话：前导怎么喊、撞了怎么办、网络怎么回",
  "tech": "5G NR · MAC · 38.321",
  "minutes": 30,
  "free": false,
  "file": "",
  "steps": 9,
  "quizN": 5,
  "prereq": [
   "ma"
  ]
 },
 {
  "id": "mn",
  "num": 13,
  "title": "NAS 注册课（24.501）",
  "tagline": "拆开 NAS-PDU 信封：注册、服务请求与离场，5G 核心网怎么认识你",
  "tech": "5G NR · NAS · 24.501",
  "minutes": 30,
  "free": false,
  "file": "",
  "steps": 6,
  "quizN": 5,
  "prereq": [
   "ma"
  ]
 },
 {
  "id": "mg",
  "num": 14,
  "title": "5GC 流程课（23.502/23.501）",
  "tagline": "柜台后面的办公区：AMF 一声令下，核心网怎么把会话立起来",
  "tech": "5G Core · 23.502/23.501",
  "minutes": 30,
  "free": false,
  "file": "",
  "steps": 10,
  "quizN": 5,
  "prereq": [
   "ma"
  ]
 },
 {
  "id": "mp",
  "num": 15,
  "title": "用户面协议栈课（37.324/38.323/38.322）",
  "tagline": "DRB 里面的三层车间：SDAP 贴标、PDCP 记账加密、RLC 分段重传",
  "tech": "5G NR · 用户面 · 三层栈",
  "minutes": 30,
  "free": false,
  "file": "",
  "steps": 9,
  "quizN": 5,
  "prereq": [
   "ma"
  ]
 },
 {
  "id": "ml",
  "num": 16,
  "title": "LTE 对照课（36.331 对照 38.331）",
  "tagline": "两代同堂：消息名字瘦了身，骨架没换——对照学一遍顶两遍",
  "tech": "LTE ↔ NR · RRC 对照",
  "minutes": 30,
  "free": false,
  "file": "",
  "steps": 10,
  "quizN": 5,
  "prereq": [
   "ma"
  ]
 },
 {
  "id": "ms",
  "num": 17,
  "title": "安全线课（33.501 密钥分级）",
  "tagline": "从 K 到 KRRCint：一棵密钥树的家族谱、四次分家与每次换手",
  "tech": "5G 安全 · 33.501",
  "minutes": 30,
  "free": false,
  "file": "",
  "steps": 9,
  "quizN": 5,
  "prereq": [
   "ma"
  ]
 },
 {
  "id": "mf",
  "num": 18,
  "title": "物理层课（38.211/38.212/38.213/38.214）",
  "tagline": "下井看地基：一次调度的完整物理链、HARQ 与无线链监测",
  "tech": "5G 物理层 · L1 巡礼",
  "minutes": 30,
  "free": false,
  "file": "",
  "steps": 9,
  "quizN": 5,
  "prereq": [
   "ma"
  ]
 },
 {
  "id": "me",
  "num": 19,
  "title": "LTE NAS 专章（24.301 EMM/ESM）",
  "tagline": "EPS 侧的信封：EMM 管你在不在网，ESM 管数据走哪条线",
  "tech": "EPS · 24.301",
  "minutes": 30,
  "free": false,
  "file": "",
  "steps": 8,
  "quizN": 5,
  "prereq": [
   "ma"
  ]
 },
 {
  "id": "mz",
  "num": 20,
  "title": "接口族收官课（S1AP/F1AP/E1AP/GTP-U）",
  "tagline": "四张接口拼完信令地图：LTE 的镜子、被拆开的 gNB、还有数据走的隧道",
  "tech": "36.413/38.473/37.483/29.281",
  "minutes": 30,
  "free": false,
  "file": "",
  "steps": 7,
  "quizN": 5,
  "prereq": [
   "mi"
  ]
 },
 {
  "id": "mv",
  "num": 21,
  "title": "IMS 与语音线（SIP 从注册到挂断）",
  "tagline": "打电话的信令还没讲过：REGISTER 亮证、INVITE 旅行、被叫寻址、VoNR 落地",
  "tech": "23.228/33.203/23.502/38.300",
  "minutes": 30,
  "free": false,
  "file": "",
  "steps": 8,
  "quizN": 5,
  "prereq": [
   "mn",
   "mg"
  ]
 },
 {
  "id": "mb",
  "num": 22,
  "title": "核心网承载信令（GTP-C 与 PFCP）",
  "tagline": "隧道怎么建、转发面怎么编程——核心网岗的看家协议一双",
  "tech": "29.274/29.244",
  "minutes": 30,
  "free": false,
  "file": "",
  "steps": 8,
  "quizN": 5,
  "prereq": [
   "mg",
   "mp"
  ]
 },
 {
  "id": "mt",
  "num": 23,
  "title": "一致性测试线（38.523/38.508-1）",
  "tagline": "怎么证明一台 UE 是\"合格公民\"——协议测试岗的入门地图",
  "tech": "38.523-1/38.508-1",
  "minutes": 25,
  "free": false,
  "file": "",
  "steps": 7,
  "quizN": 5,
  "prereq": [
   "m0"
  ]
 },
 {
  "id": "md",
  "num": 24,
  "title": "定位线（LPP 与 NRPPa）",
  "tagline": "手机是怎么被\"找到\"的——从卫星到蜂窝的两条定位信令",
  "tech": "37.355/38.455",
  "minutes": 25,
  "free": false,
  "file": "",
  "steps": 7,
  "quizN": 5,
  "prereq": [
   "mi"
  ]
 },
 {
  "id": "mk",
  "num": 25,
  "title": "垂直特性速览（NTN/RedCap/Sidelink/MBS/IAB）",
  "tagline": "五个面试加分题一次过：卫星、轻量终端、车联网、广播、无线回传",
  "tech": "38.300/23.247",
  "minutes": 30,
  "free": false,
  "file": "",
  "steps": 6,
  "quizN": 5,
  "prereq": [
   "m0"
  ]
 },
 {
  "id": "mu",
  "num": 26,
  "title": "卡与终端（USIM 与 SMS）",
  "tagline": "手机里那颗小芯片：身份的根、密钥的家、还有一条短信的旅程",
  "tech": "31.102/23.502/24.011",
  "minutes": 25,
  "free": false,
  "file": "",
  "steps": 6,
  "quizN": 5,
  "prereq": [
   "mn",
   "ms"
  ]
 },
 {
  "id": "mw",
  "num": 27,
  "title": "SIP 消息解剖（24.229 信令级）",
  "tagline": "把 M21 的流程拆到字段级：每一行头字段的来历与作用",
  "tech": "24.229/23.228",
  "minutes": 30,
  "free": false,
  "file": "",
  "steps": 6,
  "quizN": 5,
  "prereq": [
   "mv"
  ]
 },
 {
  "id": "mr",
  "num": 28,
  "title": "网络切片专课（S-NSSAI 的旅程）",
  "tagline": "一张网络切成多张经营：身份证、注册协商、会话归属与运维闸门",
  "tech": "23.501/38.300/24.501",
  "minutes": 30,
  "free": false,
  "file": "",
  "steps": 6,
  "quizN": 5,
  "prereq": [
   "mn",
   "mg"
  ]
 },
 {
  "id": "my",
  "num": 29,
  "title": "空闲态与小区重选（RRC_IDLE 的 UE 规程）",
  "tagline": "手机的大半生：选网、驻留、听寻呼——省电与择优之间的每一道刻度",
  "tech": "38.304",
  "minutes": 26,
  "free": false,
  "file": "",
  "steps": 7,
  "quizN": 5,
  "prereq": [
   "m1",
   "m2",
   "m6",
   "mn"
  ]
 },
 {
  "id": "mq",
  "num": 30,
  "title": "QoS 专课（5QI/QoS Flow/DRB 绑定与反射 QoS）",
  "tagline": "一条 IP 流的三级跳：策略定等级、会话发名牌、空口分车道，还有让 UE 自学的反射 QoS",
  "tech": "23.501/38.300/37.324",
  "minutes": 30,
  "free": false,
  "file": "",
  "steps": 7,
  "quizN": 5,
  "prereq": [
   "mp",
   "mr"
  ]
 },
 {
  "id": "mj",
  "num": 31,
  "title": "5G 密钥层级专课（K 的旅程：从 K 到 K_NAS/K_RRC/K_UP 与切换推衍）",
  "tagline": "一棵密钥树的四幕剧：鉴权生根、切换抽枝、算法上柜、互操作嫁接",
  "tech": "33.501",
  "minutes": 25,
  "free": false,
  "file": "",
  "steps": 7,
  "quizN": 5,
  "prereq": [
   "ms",
   "mn"
  ]
 },
 {
  "id": "mo",
  "num": 32,
  "title": "SBA 服务化架构（NRF/发现/token）",
  "tagline": "控制面不再拉专用专线：上户口、查黄页、拿通行证，再按 REST 规矩办事",
  "tech": "29.500/29.501/29.510/23.501",
  "minutes": 30,
  "free": false,
  "file": "",
  "steps": 7,
  "quizN": 5,
  "prereq": [
   "mg"
  ]
 },
 {
  "id": "mm",
  "num": 33,
  "title": "PDU 会话信令专课（建立/修改/释放）",
  "tagline": "PTI 当合同编号的一问一答：REQUEST、COMMAND、REJECT 与 cause 的人情世故",
  "tech": "24.501/23.502",
  "minutes": 30,
  "free": false,
  "file": "",
  "steps": 7,
  "quizN": 5,
  "prereq": [
   "mn",
   "mg"
  ]
 },
 {
  "id": "mng",
  "num": 34,
  "title": "NGAP 信令专课（38.413 消息族）",
  "tagline": "mi 课是地图，本课解剖柜台单据：EP 分级、双 ID 配对与四大消息族的因果链",
  "tech": "5G NR · NGAP · 38.413",
  "minutes": 30,
  "free": false,
  "file": "",
  "steps": 7,
  "quizN": 5,
  "prereq": [
   "mi",
   "mg"
  ]
 },
 {
  "id": "mns",
  "num": 35,
  "title": "Service Request 专课（从空闲到业务通）",
  "tagline": "CM-IDLE 唤醒的心脏一跳：UE 触发全链、寻呼反向链、连接态瘦身版与拒绝 cause 桶",
  "tech": "24.501/23.502",
  "minutes": 30,
  "free": false,
  "file": "",
  "steps": 6,
  "quizN": 5,
  "prereq": [
   "mn",
   "mg"
  ]
 },
 {
  "id": "ms1",
  "num": 36,
  "title": "S1AP 信令专课（36.413 消息族）",
  "tagline": "me/mb 之外补上 4G 官话：S1-MME 上的 EP 分级、双 S1AP ID 配对与四大消息族的因果链",
  "tech": "LTE · S1AP · 36.413",
  "minutes": 30,
  "free": false,
  "file": "",
  "steps": 7,
  "quizN": 5,
  "prereq": [
   "mb",
   "me"
  ]
 },
 {
  "id": "mx2",
  "num": 37,
  "title": "X2AP 信令专课（36.423 消息族）",
  "tagline": "ms1 的姊妹篇：X2 接口上 eNB↔eNB 的官话——EP 换档对照、Old/New 短号配对、站到站切换全链与双定时器护航",
  "tech": "LTE · X2AP · 36.423",
  "minutes": 30,
  "free": false,
  "file": "",
  "steps": 7,
  "quizN": 5,
  "prereq": [
   "ms1"
  ]
 },
 {
  "id": "mau",
  "num": 38,
  "title": "跨层排障毕业课 · 一次掉线的全栈尸检",
  "tagline": "一条掉线日志，六层各问一句：物理层失步、MAC 哑火、RLC 数重传、PDCP 记账、RRC 走表、NAS 保档——全站知识在这里合拢",
  "tech": "38.331/38.321/38.322/38.323/24.501",
  "minutes": 28,
  "free": false,
  "file": "",
  "steps": 6,
  "quizN": 5,
  "prereq": [
   "mf",
   "mc",
   "mj"
  ]
 },
 {
  "id": "mf1",
  "num": 39,
  "title": "F1AP 信令专课（38.473 消息族）",
  "tagline": "接口台账第五本：gNB-CU↔gNB-DU 的消息级官话——F1 Setup 抹旧换新、双 F1AP ID 配对、UE 上下文与 RRC 集装箱、寻呼警报广播面与 FAILURE/Reset 清场族",
  "tech": "NR · F1AP · 38.473",
  "minutes": 30,
  "free": false,
  "file": "",
  "steps": 7,
  "quizN": 5,
  "prereq": [
   "mz"
  ]
 },
 {
  "id": "me1",
  "num": 40,
  "title": "E1AP 信令专课（38.463 消息族）",
  "tagline": "接口台账第六本：gNB-CU-CP↔gNB-CU-UP 的承载与接口管理官话——双向 E1 Setup、Bearer Context 单进单出配隧道口、UP 遥测指示族与 FAILURE/Reset 清场族",
  "tech": "NR · E1AP · 38.463",
  "minutes": 30,
  "free": false,
  "file": "",
  "steps": 7,
  "quizN": 5,
  "prereq": [
   "mz",
   "mp"
  ]
 },
 {
  "id": "m41",
  "num": 41,
  "title": "NG-RAN 架构总纲（38.401）",
  "tagline": "全站地基：gNB 三形态与半张栈分家、四接口连谁、AP ID 双号族、初始接入/移动性/状态迁移的架构级总流程、TNL 冗余与失败面——所有\"教学归纳：38.401\"的娘家条款",
  "tech": "NR · 架构描述 · 38.401",
  "minutes": 25,
  "free": false,
  "file": "",
  "steps": 7,
  "quizN": 5,
  "prereq": [
   "ma"
  ]
 },
 {
  "id": "m42",
  "num": 42,
  "title": "测量与移动性控制",
  "tagline": "测量机器的制造与交付：四件套装配线、事件判据的公共机器、5.5.5 上报流程、gap/SMTC 与 38.133 秒表、失败面与速度缩放、定位测量专属信令口（v60 R2 起 pos 幕：LMI/Tx TEG/SRS INACTIVE）",
  "tech": "5G NR · SA · 38.331 §5.5 + §5.5.6/§5.7.14/§5.7.17/§5.7.20 定位测量 + 38.133 §9",
  "minutes": 26,
  "free": false,
  "file": "",
  "steps": 7,
  "quizN": 5,
  "prereq": [
   "m3",
   "m4"
  ]
 },
 {
  "id": "m43",
  "num": 43,
  "title": "MRO 与切换自愈",
  "tagline": "切换失败后的取证-上报-判责-调参闭环：UE 证据三件套与成功切换报告、站间 Handover Report 判责、Too Early/Too Late/Wrong Cell 三分类、Unnecessary HO 与乒乓的验证环、O&M 缰绳下的参数自优化",
  "tech": "5G NR · SA · 38.300 §15.5.2 + 38.331 §5.7.9/5.7.10 + 38.423 §8.4.8",
  "minutes": 24,
  "free": false,
  "file": "",
  "steps": 7,
  "quizN": 5,
  "prereq": [
   "m4",
   "m42"
  ]
 },
 {
  "id": "m44",
  "num": 44,
  "title": "ANR 与邻区自管理",
  "tagline": "邻区表怎么自己长：UE 取证读广播（reportCGI 与 T321 档位）、NCR 三条件与 NCRT 长表、系统内四步/跨系统五步、Xn-C TNL 地址经 AMF 中转、OAM 缰绳下的邻区自管理",
  "tech": "5G NR · SA · 38.300 §15.3.3 + §15.3.4 + 38.331 §5.5.2/5.5.3/5.5.4/5.5.5 + 38.423 §8.4.2",
  "minutes": 24,
  "free": false,
  "file": "",
  "steps": 7,
  "quizN": 5,
  "prereq": [
   "m42",
   "m43"
  ]
 },
 {
  "id": "m45",
  "num": 45,
  "title": "话统 KPI 与空口信令映射",
  "tagline": "从话统指标的「果」反推空口信令的「因」：接通率拆到 RACH/RRC 建立/拒绝/退避、掉线率拆到 RLF 判定与重建、切换成功率拆到 T304 与三分类判责、干扰覆盖对上 UE 测量机器——四条链每环都给取证工具",
  "tech": "5G NR · SA · 38.331 §5.3.3/5.3.10/5.3.15 + 38.321 §5.1 + 38.300 §15.5.2/15.5.3",
  "minutes": 24,
  "free": false,
  "file": "",
  "steps": 7,
  "quizN": 5,
  "prereq": [
   "m43"
  ]
 },
 {
  "id": "m46",
  "num": 46,
  "title": "CHO 条件切换",
  "tagline": "RRC 版图最后一块招牌特性：网络先备好多个候选目标、把执行条件的评估权下放给 UE——条件一满足 UE 自己拍板断源换目标；本课讲 CHO 特有的那一半：预配置、自主评估、执行窗口、失效清理与判词换名",
  "tech": "5G NR · SA · 38.331 §5.3.5.13 + 38.300 §9.2.3.4 + §15.5.2.2.2",
  "minutes": 22,
  "free": false,
  "file": "",
  "steps": 5,
  "quizN": 5,
  "prereq": [
   "m4",
   "m42"
  ]
 },
 {
  "id": "m47",
  "num": 47,
  "title": "LTM · L1/L2 触发移动性",
  "tagline": "移动性三部曲收官：候选照旧 RRC 下发、拍板却降到 L2——gNB 收到 L1/L3 测量报告后一纸 MAC CE 换小区；TCI 预激活与 early TA 把同步账提前，RACH-less 让切换不跑随机接入；本课讲 LTM 特有的那一半",
  "tech": "5G NR · SA · 38.331 §5.3.5.18 + 38.300 §9.2.3.5 + §15.5.2.2.2",
  "minutes": 22,
  "free": false,
  "file": "",
  "steps": 5,
  "quizN": 5,
  "prereq": [
   "m4",
   "m46"
  ]
 },
 {
  "id": "m48",
  "num": 48,
  "title": "LTE RRC 连接控制全流程",
  "tagline": "两代对称收官：4G 的 RRC 一条龙——从 RACH 到 SRB1、从双消息安全到 mobilityControlInfo、从重建兜底到重定向退场；同构的骨架 NR 侧都讲过，差异处才值得多看一眼",
  "tech": "LTE · E-UTRA · 36.331 §5.3.3/5.3.4/5.3.5/5.5/5.3.7/5.3.8/5.3.11",
  "minutes": 22,
  "free": false,
  "file": "",
  "steps": 5,
  "quizN": 5,
  "prereq": [
   "ma",
   "ml"
  ]
 },
 {
  "id": "m49",
  "num": 49,
  "title": "NTN 与 RedCap · 卫星与轻量终端",
  "tagline": "5G-A 两张新面孔的 RRC 侧纵深：卫星直连把定时与位置变成账本（SIB19/epochTime/T430/t-Service），轻量终端把带宽与测量全线瘦身（专用 barring/放宽准则/省电偏好上报）",
  "tech": "NTN · RedCap · 38.331 §3.1/§5.2/§5.3.5/§5.3.7/§5.3.10/§5.3.13/§5.6.1/§5.7.4/§5.7.10/§5.7.13/§5.7.19/§5.8.12",
  "minutes": 22,
  "free": false,
  "file": "",
  "steps": 5,
  "quizN": 5,
  "prereq": [
   "mk"
  ]
 },
 {
  "id": "m50",
  "num": 50,
  "title": "Sidelink · PC5 直连",
  "tagline": "车联网的另一半 RRC：UE 自报家门的兴趣上报（SidelinkUEInformationNR）、谁当时间基准的同步之争（SLSS/优先组/GNSS→DFN）、直连侧的第二条 RRC 线（PC5-RRC 重配与承载）与收发兜底（RLF/端到端失败/公共控制）",
  "tech": "Sidelink · PC5 · 38.331 §5.8",
  "minutes": 23,
  "free": false,
  "file": "",
  "steps": 6,
  "quizN": 5,
  "prereq": [
   "mk",
   "m49"
  ]
 },
 {
  "id": "m51",
  "num": 51,
  "title": "MBS · 广播与多播",
  "tagline": "一份信令服务一群人：MCCH 桌牌与 2bit 位图、MBS Interest Indication 的承载取舍、join 过才收的多播与 G-RNTI 停监控、INACTIVE 续收与 resume 兜底",
  "tech": "MBS · 广播与多播 · 38.331 §5.9/§5.10",
  "minutes": 20,
  "free": false,
  "file": "",
  "steps": 5,
  "quizN": 5,
  "prereq": [
   "mk"
  ]
 },
 {
  "id": "m52",
  "num": 52,
  "title": "IAB · 集成接入回传",
  "tagline": "给基站装上无线尾巴：donor 与 MT/DU 双角色、SIB1 门槛与集成四阶段、回程失效的同 CU/跨 CU 恢复、授权·IP·移动 IAB 的运维面",
  "tech": "IAB · 集成接入回传 · 38.401 §6.1.3/§8.12/§8.17 + 38.331 IAB 侧条款",
  "minutes": 22,
  "free": false,
  "file": "",
  "steps": 7,
  "quizN": 5,
  "prereq": [
   "m41"
  ]
 },
 {
  "id": "m53",
  "num": 53,
  "title": "毕业课 · 全站知识地图与 JD 面试总攻",
  "tagline": "81 门课拧成一张地图：八域纵览、学习路径、JD 岗位矩阵与综合检验——从学完到考上",
  "tech": "全站地图 · 81 门课与配套资产",
  "minutes": 20,
  "free": false,
  "file": "",
  "steps": 6,
  "quizN": 5,
  "prereq": [
   "ma"
  ]
 },
 {
  "id": "m54",
  "num": 54,
  "title": "MDT · 最小化路测",
  "tagline": "logged MDT 的完整生命周期——CONNECTED 配置、IDLE/INACTIVE 打点、T330 与 48 小时保留、reportType 三型门控、记录内容与限额、IDC 挂起，外加应用层测量与网侧 CSI 收集两兄弟对照",
  "tech": "MDT · 最小化路测 · 38.331 §5.5a/§5.5b/§5.5c",
  "minutes": 15,
  "free": false,
  "file": "",
  "steps": 5,
  "quizN": 5,
  "prereq": [
   "m3"
  ]
 },
 {
  "id": "m55",
  "num": 55,
  "title": "Sidelink 中继 · L2 U2N/U2U Relay 架构",
  "tagline": "UE 当路由器的完整账本：SRAP 逐跳终结与 local ID 映射的架构账、SD-RSRP/SL-RSRP 判据驱动的发现选择账、六步建连与 SI/寻呼/UAC 代收的控制面账、三类路径切换与 U2U 十步建链的连续性账",
  "tech": "Sidelink Relay · 38.300 §16.12",
  "minutes": 22,
  "free": false,
  "file": "",
  "steps": 6,
  "quizN": 5,
  "prereq": [
   "m50"
  ]
 },
 {
  "id": "m56",
  "num": 56,
  "title": "Multi-path Relay · 多路径中继架构",
  "tagline": "直连与中继同时在线：三类承载与两条间接路（PC5/N3C）的架构账、允许性矩阵与 SRB 归属的规则账、四条路径管理流程（间接加/间接换/直接加/直接换）的工程账、路径失败上报与系统信息双路的兜底账",
  "tech": "Multi-path Relay · 38.300 §16.21",
  "minutes": 22,
  "free": false,
  "file": "",
  "steps": 6,
  "quizN": 5,
  "prereq": [
   "m55"
  ]
 },
 {
  "id": "m57",
  "num": 57,
  "title": "Ambient IoT · 环境物联网",
  "tagline": "零电池标签怎么上网：gNB 变身 reader 的架构增补与 CN 连接两形态、R2D 的 OOK 波形与 D2R 的背散射两套物理信道、CBRA/CFA 两种访问与 AS ID 认人账、Inventory/Command/Release 三条 NG-C 流程，以及本版本的三条边界",
  "tech": "Ambient IoT · 38.300 §16.23",
  "minutes": 22,
  "free": false,
  "file": "",
  "steps": 5,
  "quizN": 5,
  "prereq": [
   "m41"
  ]
 },
 {
  "id": "m58",
  "num": 58,
  "title": "Sidelink 增强架构 · IUC、共享频谱与载波聚合",
  "tagline": "PC5 直连的完整架构账：三种传输模式与四套协议栈、Mode 1/Mode 2 两套发牌机器、Uu 控制的连接态与空闲态两本账、SL DRX 的作息表协商、Rel-18 三件演进——邻居互助的 IUC、闯共享频谱的 SL-U 与多车道并行的 SL CA",
  "tech": "Sidelink 增强 · 38.300 §16.9",
  "minutes": 23,
  "free": false,
  "file": "",
  "steps": 5,
  "quizN": 5,
  "prereq": [
   "m50"
  ]
 },
 {
  "id": "m59",
  "num": 59,
  "title": "MBS 架构 · 多播与广播的完整账",
  "tagline": "同一条数据发给一群人：广播与多播两族服务、L2 裁剪与 MRB 六配置菜单、MTCH/DTCH/MCCH 三条信道、Shared/Individual 两种交付与 PDCP COUNT 同步两法、无损切换三本账、INACTIVE 不断线的两根柱子、广播的 MCCH 四原则与 CFR 地皮账、两套 DRX 与一张「不支持」清单——Rel-17 引入、Rel-18 eMBS 增强的完整架构面",
  "tech": "MBS 架构 · 38.300 §16.10",
  "minutes": 23,
  "free": false,
  "file": "",
  "steps": 5,
  "quizN": 5,
  "prereq": [
   "m51"
  ]
 },
 {
  "id": "m60",
  "num": 60,
  "title": "NTN 架构 · 卫星直连的完整账",
  "tagline": "把基站搬到天上看：透明与再生两种载荷、服务链路与馈电链路两段、地对固定/准地对固定/地对移动三种会动的区、Common TA 与两笔偏移的定时账、UE 自算自补的守门红线、Mapped Cell ID 的五用两不用、O&M 两套星历与 J2000 历元、CHO 三触发与卫星重同步、switchover 的 TNL 台子、覆盖与容量增强、ISA 与半双工、星上 NG 拆台——Rel-17 引入、Rel-18 增强、Rel-19 phase 3 的完整架构面",
  "tech": "NTN 架构 · 38.300 §16.14",
  "minutes": 22,
  "free": false,
  "file": "",
  "steps": 5,
  "quizN": 5,
  "prereq": [
   "m49"
  ]
 },
 {
  "id": "m61",
  "num": 61,
  "title": "切片与专网 · 网络身份的完整账",
  "tagline": "同一张网里分身份、网外自立身份、网内封闭身份：S-NSSAI 与 NSAG 的切片资源账、Allowed 三张名单与 AMF 三条选路、NG/Xn 切换的两种门槛、SNPN 的 PLMN ID+NID 与 access mode、CH 凭据与 onboarding、PNI-NPN 的 CAG 门禁与 Member Cell、Xn 交底与 AMF 终审、零资源小区与八条红线——Rel-15 到 Rel-19 的身份演进而",
  "tech": "切片与专网 · 38.300 §16.3/§16.6/§16.7",
  "minutes": 23,
  "free": false,
  "file": "",
  "steps": 5,
  "quizN": 5,
  "prereq": [
   "mr"
  ]
 },
 {
  "id": "m62",
  "num": 62,
  "title": "URLLC 与 TSN · 低时延与确定性",
  "tagline": "把一次传输做得更可靠更早，让每一拍落在预期时刻：LCP 限制、包复制的多腿与去重、CQI 10⁻⁵ 与 MCS-C-RNTI、两条冗余路径、PUCCH 小区切换、共享频谱的 CG 重传、10 ns 时间参考与 RTT/TA 补偿、TSCAI 与 survival time、SIB9 时钟质量、L4S 的 CE 标记、TSN 传输网的一句话边界——Rel-15 到 Rel-19 的低时延与确定性机制账",
  "tech": "低时延与确定性 · 38.300 §16.1/§16.8/§16.16/§16.17",
  "minutes": 23,
  "free": false,
  "file": "",
  "steps": 5,
  "quizN": 5,
  "prereq": [
   "mk"
  ]
 },
 {
  "id": "m63",
  "num": 63,
  "title": "公共告警、轻量终端与空中接口收边",
  "tagline": "从地震海啸的第一声寻呼，到灾难漫游的禁网放行；从 20 MHz 的 RedCap，到万米高空的 ATG 与 AI/ML 的预测账——§16 最后八节一次收边：广播与豁免、轻量与省电、高度与航路、时间提前与模型边界",
  "tech": "公共告警 · 轻量终端 · 空天与智能 · 38.300 §16.4/§16.5/§16.11/§16.13/§16.18/§16.19/§16.20/§16.22",
  "minutes": 24,
  "free": false,
  "file": "",
  "steps": 5,
  "quizN": 5,
  "prereq": [
   "mk"
  ]
 },
 {
  "id": "m64",
  "num": 64,
  "title": "空口演进 · Multi-USIM、空口 AI/ML 与 SBFD",
  "tagline": "一块终端两张卡：寻呼不能撞车、切网要先打招呼、能力可以临时收起；一个模型两侧部署：适用性上报、推理监测、CSI 预测与定位；一条载波两种方向：SBFD 让 gNB 同时收发，UE 仍只做半双工——38.300 最后三节，收的是空口演进的三条边界",
  "tech": "双卡协同 · 空口 AI/ML · 子带全双工 · 38.300 §20/§22/§23",
  "minutes": 23,
  "free": false,
  "file": "",
  "steps": 5,
  "quizN": 5,
  "prereq": [
   "mk"
  ]
 },
 {
  "id": "m65",
  "num": 65,
  "title": "网侧测量与节能 · QoE 收集、网络节能与干扰管理",
  "tagline": "网络自己也有三本账：QoE 收集让网络看见「用户觉得好不好」，网络节能让基站闲时关灯省电，干扰管理把大气波导与图样错位的账算清——38.300 网络侧三节，收的是 NG-RAN 的自我修养",
  "tech": "QoE 收集 · 网络节能 · 干扰管理 · 38.300 §21/§15.4/§17",
  "minutes": 24,
  "free": false,
  "file": "",
  "steps": 5,
  "quizN": 5,
  "prereq": [
   "m42"
  ]
 },
 {
  "id": "m66",
  "num": 66,
  "title": "UE 轻量省电 · 小包传输、UE 省电与覆盖增强",
  "tagline": "终端也有三笔账：小包不醒（SDT 停在 INACTIVE 收发）、醒着省电（DRX/DCP/LP-WUS 五旋钮）、弱覆盖够得着（上下行重复与聚合）——38.300 终端侧收边",
  "tech": "小包传输 · UE 省电 · 覆盖增强 · 38.300 §18/§11/§19",
  "minutes": 22,
  "free": false,
  "file": "",
  "steps": 5,
  "quizN": 5,
  "prereq": [
   "m6"
  ]
 },
 {
  "id": "m67",
  "num": 67,
  "title": "安全·能力·标识 · 架构三支柱收官",
  "tagline": "安全（K 树与 SMC 激活时序）、能力（FS 矩阵与过滤）、标识（RNTI 认人报事二分）——38.300 架构侧三支柱一次收齐",
  "tech": "AS 安全 · UE 能力 · NG 标识 · 38.300 §13/§14/§8＋38.331 §5.3.6 对照（v61 R3）",
  "minutes": 21,
  "free": false,
  "file": "",
  "steps": 5,
  "quizN": 5,
  "prereq": [
   "m7"
  ]
 },
 {
  "id": "m68",
  "num": 68,
  "title": "Sidelink · 无线承载管理",
  "tagline": "SLRB 三族（DRB/SRB/附加 RLC 承载）×条件-操作二段式——NR 侧链承载生命周期全账，三源配置通道与两段确认时序闸",
  "tech": "SL 无线承载 · SLRB · 38.331 §5.8.9.1a",
  "minutes": 21,
  "free": false,
  "file": "",
  "steps": 5,
  "quizN": 5,
  "prereq": [
   "m50"
  ]
 },
 {
  "id": "m69",
  "num": 69,
  "title": "SL 中继 · 控制与承载面",
  "tagline": "PC5 Relay RLC 信道×Remote UE 信息×Uu 消息转移×Notification×QoS 信息转移——L2 U2N/U2U 中继五件账，per-hop 承载与 e2e 账本两层对齐",
  "tech": "SL 中继 · 控制与承载面 · 38.331 §5.8.9.7–.11",
  "minutes": 23,
  "free": false,
  "file": "",
  "steps": 5,
  "quizN": 5,
  "prereq": [
   "m68"
  ]
 },
 {
  "id": "m70",
  "num": 70,
  "title": "SL 中继 · Relay 与 Remote UE 操作",
  "tagline": "U2N/U2U 的 Relay 与 Remote 四角色×门限/选择重选/近邻三机制轴——14 叶的 AS 条件评估与中继选择算法，单跳与多跳门限换轴",
  "tech": "SL 中继 · Relay 与 Remote UE 操作 · 38.331 §5.8.14–.19",
  "minutes": 22,
  "free": false,
  "file": "",
  "steps": 5,
  "quizN": 5,
  "prereq": [
   "m69"
  ]
 },
 {
  "id": "m71",
  "num": 71,
  "title": "SL 发现与定位",
  "tagline": "发现=监控与传输、定位=SL-PRS 测量与传输——资源池从哪来：RRC 专用/SIB12/预配置三源与 SIB23，十一条角色条件的 OR 调用与例外池逃生门",
  "tech": "SL 发现与定位 · 38.331 §5.8.13/.18",
  "minutes": 22,
  "free": false,
  "file": "",
  "steps": 5,
  "quizN": 5,
  "prereq": [
   "m70"
  ]
 },
 {
  "id": "m72",
  "num": 72,
  "title": "SL 测量与拾遗",
  "tagline": "测量=对端下发的账本（对象/报告配置/身份/量配置四件套），触发=事件与周期两制，上报=发满自毁；外挂载波增删、能力转移、PC5 收尾、V2X 同步与 Zone 五件拾遗，v58 R1 补 NR 同步两过程（5.8.5 发送条件+5.8.6 参考选择）",
  "tech": "SL 测量与拾遗 · 38.331 §5.8.10 与五件",
  "minutes": 22,
  "free": false,
  "file": "",
  "steps": 5,
  "quizN": 5,
  "prereq": [
   "m71"
  ]
 },
 {
  "id": "m73",
  "num": 73,
  "title": "物理层测量 · Uu 量族",
  "tagline": "量=per-RE 线性平均（RSRP）、N×RSRP÷RSSI（RSRQ）、信号÷噪干（SINR）；时机各锁 SMTC 窗/CSI-RS 机会/配置符号；表读法=Definition+Applicable for 两列——38.331 管怎么配怎么报，本课管量本身怎么算",
  "tech": "物理层测量量定义 · 38.215 §5.1 Uu 量族",
  "minutes": 22,
  "free": false,
  "file": "",
  "steps": 5,
  "quizN": 5,
  "prereq": [
   "m42"
  ]
 },
 {
  "id": "m74",
  "num": 74,
  "title": "物理层测量 · SL 与 gNB 量族",
  "tagline": "SL 量=UE 本端收对端（DMRS 为主可加 S-SSS、RSSI 锁 sub-channel 第 2 符号起）；gNB 量=本端自测自用（参考点按基站形态五档、TADV 喂 TA、功率跟着时序走）——38.331 管怎么配怎么报，38.215 管量本身怎么算",
  "tech": "物理层测量量定义 · 38.215 §5.1 SL 量族+§5.2 NG-RAN 量族",
  "minutes": 22,
  "free": false,
  "file": "",
  "steps": 5,
  "quizN": 5,
  "prereq": [
   "m73"
  ]
 },
 {
  "id": "m75",
  "num": 75,
  "title": "测量线横向复习 · 一条数的旅程",
  "tagline": "五课一线串总账：38.211 的砖、38.215 的量、38.214 的台阶、38.331 的账——从 per-RE 平均到 L3 滤波、事件判据、TA 产业链一图收官；门牌会搬家，跨规范追条款按内容认门牌",
  "tech": "测量线横向复习 · 38.211/38.214 新语料深读（21 新锚 2.17×）+38.331/38.215 横串（21 复用锚）",
  "minutes": 24,
  "free": false,
  "file": "",
  "steps": 5,
  "quizN": 5,
  "prereq": [
   "m74"
  ]
 },
 {
  "id": "m76",
  "num": 76,
  "title": "主线拾遗 · 恢复收尾与失败上报",
  "tagline": "38.331 主线的补刀课：恢复线五叶（SL 条件/密钥恢复/停表清点/失败记账）、重配细叶十件（fullConfig/CPAC 尾/SL 专配/中继增改）、SCG·MCG 失败上报与 RA 报告、每 SIB 动作与按需 SI、H 高度事件四变体、空闲测量账、UE Assistance 全族细分（v59 R1 起 ua 幕）、重配接收与执行机器（v60 R1 起 rcv 幕）、连接控制总纲与 AS 安全面（v61 R1 起 ctrl 幕）——ASN.1 字典与时延表记注不建课",
  "tech": "38.331 §5.2/§5.3/§5.5/§5.7 拾遗 44 锚（318,342 chars=17.7×覆盖面口径）+§7.1.1 定时器总表纯讲述",
  "minutes": 25,
  "free": false,
  "file": "",
  "steps": 5,
  "quizN": 5,
  "prereq": [
   "m6"
  ]
 },
 {
  "id": "m77",
  "num": 77,
  "title": "38.300 全景 · 架构、RRC 框架与移动性总览",
  "tagline": "NG-RAN 节点=gNB/ng-eNB，Xn 互联、NG-C 到 AMF、NG-U 到 UPF；RRC 三态各有特征账；每类过程有框架图——IDLE 建连十步、RNAU 八步、Xn 四步 HO；38.331 管每一步，本课给骨架",
  "tech": "38.300 全景 · 架构/RRC 框架/移动性总览",
  "minutes": 26,
  "free": false,
  "file": "",
  "steps": 9,
  "quizN": 5,
  "prereq": [
   "m1",
   "m6"
  ]
 },
 {
  "id": "m78",
  "num": 78,
  "title": "38.304 深水 · 空闲态全景——IDLE/INACTIVE、选择重选与寻呼",
  "tagline": "空闲态的完整立法：三过程与 AS/NAS 分工表、S/R 双准则与绝对优先级机器、移动性三态缩放、TA/RNA 双注册触发、PO/PF 两条公式与三源最短、PEI 与 LP-WUS 两个省电前哨",
  "tech": "38.304 深水 · 空闲态选择重选与寻呼",
  "minutes": 24,
  "free": false,
  "file": "",
  "steps": 5,
  "quizN": 5,
  "prereq": [
   "my",
   "m2"
  ]
 },
 {
  "id": "m79",
  "num": 79,
  "title": "38.300 深水 · L2 与空口全景——四子层数据流、物理层双工、特性组与 Inter-RAT",
  "tagline": "38.300 三块补位立法：L2 四子层（IAB 加 BAP 为五）的服务栈与逻辑信道映射总账、空口物理层双工（波形/参数集/PDCCH/SSB/PUCCH/RA）、特性组（CA/DC/SUL/BA/共享频谱/multi-TRP/XR）与 Inter-RAT 四条迁移的原文判据",
  "tech": "38.300 深水 · L2 与空口全景",
  "minutes": 25,
  "free": false,
  "file": "",
  "steps": 5,
  "quizN": 5,
  "prereq": [
   "m77"
  ]
 },
 {
  "id": "m80",
  "num": 80,
  "title": "38.331 深水 · 过程面收边——系统信息生命周期、Inter-RAT 移动性与 UE 能力机器",
  "tagline": "38.331 过程面三块残余的 UE 行为立法：SI 生命周期（触发/获取矩阵/存量豁免与有效性〔v59 R2〕/变更指示与 PWS/缺失处置/NTN T430）、Inter-RAT 双向（切入 NR 的前提与动作、迁出 NR 的停表清单/源侧清理/失败回退）、UE 能力机器（三容器查询上报与 band combination 拼图）、通用错误处理（v60 R3 起 err 幕：not comprehended 定义/整条忽略/三分岔/嵌套归账）",
  "tech": "38.331 深水 · 过程面收边",
  "minutes": 22,
  "free": false,
  "file": "",
  "steps": 9,
  "quizN": 5,
  "prereq": [
   "m2",
   "m79"
  ]
 }
];
})(typeof window !== 'undefined' ? window : globalThis);
