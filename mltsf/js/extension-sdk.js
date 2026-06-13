/**
 * MLTSF 扩展包 SDK (Software Development Kit)
 * =============================================
 * 供第三方开发者创建 MLTSF 扩展包时使用。
 * 
 * 版本: 2.23
 * 日期: 2026-06-13
 */

/* ============================================================
 *  1. 扩展包目录结构
 * ============================================================
 * 
 * 一个完整的 MLTSF 扩展包目录结构如下：
 * 
 *   my-extension/
 *   ├── extension.json        # 扩展包配置文件 (必需)
 *   ├── main.js               # 扩展包主逻辑 (必需)
 *   ├── README.md             # 扩展包说明文档 (推荐)
 *   └── ...                   # 其他资源文件 (可选)
 * 
 * 托管方式:
 *   - GitHub 仓库: https://raw.githubusercontent.com/{用户}/{仓库}/main/extensions/{包名}/
 *   - 自定义 CDN: 任意静态文件服务器
 */

/* ============================================================
 *  2. extension.json 配置说明
 * ============================================================
 * 
 * 示例 extension.json 文件内容:
 * {
 *     "name": "my-extension",           // 扩展包名 (必填)
 *     "version": "1.0.0",               // 版本号 (必填)
 *     "description": "我的第一个扩展包",   // 描述 (推荐)
 *     "author": "开发者名",              // 作者 (推荐)
 *     "main": "main.js",               // 入口文件 (可选，默认 main.js)
 *     "commands": [                     // 注册的命令列表 (必填)
 *         {
 *             "name": "hello",           // 命令名 (无需 '/')
 *             "description": "打招呼"
 *         },
 *         {
 *             "name": "weather",
 *             "description": "查询天气"
 *         }
 *     ]
 * }
 */

/* ============================================================
 *  3. main.js 编程接口 (ExtensionAPI)
 * ============================================================
 * 
 * 扩展包的 main.js 可以通过 window.ExtensionAPI 调用以下方法：
 */

// ----- 3.1 registerCommand(cmdName, definition) -----
// 注册一个新命令，用户可在终端中使用。
// 
// 参数:
//   cmdName    - String, 命令名 (带或不带 '/' 均可)
//   definition - Object, 命令定义，包含:
//     description - String, 命令描述
//     handler     - Function(args, terminal) => {}, 命令处理函数
//                  args: String[], 用户输入的命令参数
//                  terminal: Object, MLTSF终端对象
//
// 示例:
//   window.ExtensionAPI.registerCommand('hello', {
//       description: '向用户打招呼',
//       handler: function(args, terminal) {
//           const name = args[0] || '世界';
//           terminal.println(`你好, ${name}!`, 'success-line');
//       }
//   });

// ----- 3.2 print(text, className) -----
// 在终端输出一行文本。等同于 terminal.println()。
//
// 参数:
//   text      - String, 要输出的文本
//   className - String (可选), 样式类名:
//     'info-line'    - 青色 (信息)
//     'success-line' - 绿色 (成功)
//     'error-line'   - 红色 (错误)
//     'warning-line' - 黄色 (警告)
//
// 示例:
//   window.ExtensionAPI.print('Hello!', 'success-line');

// ----- 3.3 getTerminal() -----
// 获取 MLTSF 终端对象，可调用其所有方法。
//
// 返回: terminal 对象
// 常用方法:
//   println(text, className)  - 输出文本
//   printHtml(html, className) - 输出 HTML
//   clear()                   - 清屏
//   setPrompt(text)           - 修改提示符
//
// 示例:
//   var t = window.ExtensionAPI.getTerminal();
//   t.clear();
//   t.println('已清屏!');

// ----- 3.4 getProjects() -----
// 获取所有项目列表。
//
// 返回: Object, 格式 { 项目名: { files: { 文件名: 内容 } } }
//
// 示例:
//   var projects = window.ExtensionAPI.getProjects();
//   for (var name in projects) {
//       window.ExtensionAPI.print('项目: ' + name);
//   }

// ----- 3.5 getCurrentEnv() -----
// 获取当前环境。
//
// 返回: String, 可能的值: 'python', 'c++', 'cmd', null

/* ============================================================
 *  4. 完整扩展包 main.js 示例
 * ============================================================
 * 
 *   // 示例: 一个简单的计数器扩展包
 *   (function() {
 *       var count = 0;
 * 
 *       // 注册 /count 命令
 *       window.ExtensionAPI.registerCommand('count', {
 *           description: '显示或增加计数器值',
 *           handler: function(args, terminal) {
 *               if (args[0] === 'reset') {
 *                   count = 0;
 *                   terminal.println('计数器已重置', 'success-line');
 *               } else {
 *                   count++;
 *                   terminal.println('当前计数: ' + count, 'info-line');
 *               }
 *           }
 *       });
 * 
 *       // 注册 /help-ext 命令
 *       window.ExtensionAPI.registerCommand('help-ext', {
 *           description: '显示扩展包帮助',
 *           handler: function(args, terminal) {
 *               terminal.println('我的扩展包 v1.0.0', 'info-line');
 *               terminal.println('可用命令:', 'info-line');
 *               terminal.println('  /count      - 增加计数器', 'info-line');
 *               terminal.println('  /count reset - 重置计数器', 'info-line');
 *           }
 *       });
 * 
 *       window.ExtensionAPI.print('计数器扩展包已加载!', 'success-line');
 *   })();
 */

/* ============================================================
 *  5. 命令冲突处理
 * ============================================================
 * 
 * 如果扩展包注册的命令与系统内置命令或其他扩展包冲突，
 * MLTSF 会自动检测并弹出交互提示，让用户选择:
 *   1. 保留旧的 (跳过冲突命令)
 *   2. 覆盖旧的 (使用新命令)
 *   3. 取消加载
 * 
 * 开发者无需在扩展包中额外处理冲突。
 */

/* ============================================================
 *  6. 注意事项
 * ============================================================
 * 
 * 1. 全局变量: 为避免污染全局作用域，建议扩展包代码
 *    使用 IIFE (立即执行函数表达式) 包裹:
 *    (function() { ... })();
 * 
 * 2. 异步支持: handler 支持 async/await:
 *    handler: async function(args, terminal) {
 *        var result = await fetch('https://api.example.com');
 *        terminal.println(result);
 *    }
 * 
 * 3. 版本兼容性: 本 SDK 适用于 MLTSF v2.x 及以上版本。
 * 
 * 4. 测试方法: 将扩展包上传到 GitHub 仓库后，在终端执行:
 *    /ap 包名 GitHub用户名 仓库名
 */

console.log('MLTSF Extension SDK v2.23 loaded');
