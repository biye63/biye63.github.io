// 显示帮助信息
function showHelp() {
    terminal.println('', 'info-line');
    terminal.println('╔══════════════════════════════════════════════════════════╗', 'info-line');
    terminal.println('║           MLTSF 命令帮助 v3.0 - 可扩展终端               ║', 'info-line');
    terminal.println('╚══════════════════════════════════════════════════════════╝', 'info-line');
    terminal.println('', 'info-line');

    terminal.println('系统命令:', 'info-line');
    terminal.println('  /help         - 显示此帮助信息', 'info-line');
    terminal.println('  /hj 环境      - 切换到指定环境 (python/c++/cmd)', 'info-line');
    terminal.println('  /color 字母   - 更改终端字体颜色 (单字母首字母大写)', 'info-line');
    terminal.println('                  R=红 G=绿 B=蓝 C=青 Y=黄 M=品红', 'info-line');
    terminal.println('                  W=白 K=黑 A=灰 O=橙 P=紫 I=粉 N=棕', 'info-line');
    terminal.println('                  (也支持全名: Red/Green/Blue/等)', 'info-line');
    terminal.println('  /jr 项目名    - 打开项目进行编程', 'info-line');
    terminal.println('  /ex 项目名    - 退出当前项目', 'info-line');
    terminal.println('  /op 项目或文件 - 打开本地项目或文件', 'info-line');
    terminal.println('  /y            - 切换官方源和镜像源 (全局生效)', 'info-line');
    terminal.println('  /bq           - 查看免责声明', 'info-line');
    terminal.println('  /run 文件名   - 按当前环境运行文件并输出结果', 'info-line');
    terminal.println('  /wr 文件名    - 写入/修改文件内容（Ctrl+Enter 保存，Esc 取消）', 'info-line');
    terminal.println('  /dc 项目名    - 导出项目', 'info-line');
    terminal.println('  /xj 名称      - 创建新项目或文件（交互式选择类型）', 'info-line');
    terminal.println('  /d 包名       - 安装Python包', 'info-line');
    terminal.println('  /b type 名称  - 删除项目或文件', 'info-line');
    terminal.println('  /cq           - 清空并刷新页面', 'info-line');
    terminal.println('  /qk           - 清空终端输出', 'info-line');
    terminal.println('', 'info-line');

    terminal.println('项目管理:', 'info-line');
    terminal.println('  当前项目: ' + (terminal.currentProject || '未选择'), 'info-line');
    terminal.println('  当前环境: ' + (terminal.currentEnv || '未选择'), 'info-line');
    terminal.println('', 'info-line');

    // 扩展包相关命令
    terminal.println('扩展包命令 (Extension SDK v3.0):', 'info-line');
    terminal.println('  /lxe          - 列出已加载的扩展包及其注册命令', 'info-line');
    terminal.println('  /查看扩展包   - 从 GitHub 发现可用扩展包', 'info-line');
    terminal.println('  /ap 包名      - 安装扩展包', 'info-line');
    terminal.println('  /az URL       - 从 URL 加载扩展包', 'info-line');
    terminal.println('  /ar 仓库路径  - 从 GitHub 仓库自动发现扩展包', 'info-line');
    terminal.println('  /rm 包名      - 移除扩展包', 'info-line');
    terminal.println('  /extlist      - 列出所有扩展注册的命令', 'info-line');
    terminal.println('  /runxt 命令   - 调用扩展注册的自定义命令', 'info-line');
    terminal.println('  /extstatus    - 查看扩展系统状态', 'info-line');
    terminal.println('', 'info-line');

    // 显示已加载扩展包注册的自定义命令
    if (window.extensionManager && window.extensionManager.registeredCommands) {
        const extCmds = Object.keys(window.extensionManager.registeredCommands);
        if (extCmds.length > 0) {
            terminal.println('已加载扩展注册的命令:', 'info-line');
            extCmds.forEach(cmd => {
                const info = window.extensionManager.registeredCommands[cmd];
                terminal.println(`  ${cmd.padEnd(12)} - ${info.description || '自定义扩展命令'} (来自: ${info.extension || '未知'})`, 'info-line');
            });
            terminal.println('', 'info-line');
        }
    }

    terminal.println('注: 命令参数无需输入 < > 尖括号符号，直接写参数即可', 'info-line');
    terminal.println('扩展包开发者: 使用 Extension SDK v3.0 开发丰富的图形化扩展（支持 CSS/JS/HTML UI）', 'info-line');
    terminal.println('', 'info-line');
}

async function switchEnvironment(args) {
    if (args.length === 0) {
        terminal.println('可用环境: python, c++, cmd', 'info-line');
        terminal.println('使用方法: /hj <环境名> 或 /hj 环境名', 'info-line');
        return;
    }

    // 移除参数中的尖括号并转为小写
    let env = args[0].toLowerCase().replace(/[<>]/g, '');
    
    if (!['python', 'c++', 'cmd'].includes(env)) {
        terminal.println(`错误: 不支持的环境 '${env}'`, 'error-line');
        terminal.println('可用环境: python, c++, cmd', 'info-line');
        return;
    }

    terminal.isProcessing = true;
    terminal.printHtml('<span class="loading"></span>正在加载环境...', 'info-line');

    try {
        if (env === 'python') {
            await initPythonEnv();
            terminal.currentEnv = 'python';
            terminal.setPrompt('user@mltsf:python$ ');
        } else if (env === 'c++') {
            await initCppEnv();
            terminal.currentEnv = 'c++';
            terminal.setPrompt('user@mltsf:c++$ ');
        } else if (env === 'cmd') {
            initCmdEnv();
            terminal.currentEnv = 'cmd';
            terminal.setPrompt('C:\\Users\\user> ');
        }

        // 移除加载行
        terminal.output.lastChild.remove();
        terminal.println(`成功加载 ${env.toUpperCase()} 环境`, 'success-line');
        terminal.println('提示: 现在可以直接输入代码执行，或使用 /run 文件名 运行文件', 'info-line');
        terminal.updateEnvDisplay(env.toUpperCase());
    } catch (error) {
        terminal.output.lastChild.remove();
        terminal.println(`加载 ${env} 环境失败: ${error.message}`, 'error-line');
        terminal.println('请检查网络连接后重试，或使用 /cq 命令刷新页面', 'info-line');
    } finally {
        terminal.isProcessing = false;
    }
}

// 打开项目进行编程
async function openProject(args) {
    if (args.length === 0) {
        terminal.println('用法: /jr <项目名>', 'info-line');
        terminal.println('示例: /jr myproject', 'info-line');
        return;
    }

    const projectName = args[0].replace(/[<>]/g, '').trim();
    const project = projects[projectName];

    if (!project) {
        terminal.println(`错误: 项目 '${projectName}' 不存在`, 'error-line');
        return;
    }

    terminal.currentProject = projectName;
    terminal.println(`成功打开项目 '${projectName}'`, 'success-line');
    terminal.println(`项目文件: ${Object.keys(project.files).join(', ') || '（空）'}`, 'info-line');
}

// 退出当前项目
async function exitProject(args) {
    if (terminal.currentProject) {
        terminal.println(`已退出项目 '${terminal.currentProject}'`, 'success-line');
        terminal.currentProject = null;
    } else {
        terminal.println('提示: 当前未打开任何项目', 'info-line');
    }
}

// 打开本地项目或文件
async function openLocalItem(args) {
    if (args.length === 0) {
        terminal.println('用法: /op <项目名或文件路径>', 'info-line');
        terminal.println('示例: /op myproject', 'info-line');
        terminal.println('      /op C:\\Users\\user\\file.py', 'info-line');
        return;
    }

    const itemName = args[0].replace(/[<>]/g, '').trim();
    const project = projects[itemName];

    if (project) {
        // 打开项目
        terminal.currentProject = itemName;
        terminal.println(`成功打开项目 '${itemName}'`, 'success-line');
        terminal.println(`项目文件: ${Object.keys(project.files).join(', ') || '（空）'}`, 'info-line');
    } else if (terminal.currentProject && projects[terminal.currentProject]?.files[itemName]) {
        // 打开项目中的文件
        const fileContent = projects[terminal.currentProject].files[itemName];
        terminal.println(`文件内容 (${itemName}):`, 'info-line');
        terminal.println(fileContent || '(空)');
    } else {
        terminal.println(`错误: 找不到项目或文件 '${itemName}'`, 'error-line');
    }
}

// 颜色字母映射表 (单字母 → 完整颜色名)
const colorLetterMap = {
    'R': 'Red', 'G': 'Green', 'B': 'Blue',
    'C': 'Cyan', 'Y': 'Yellow', 'M': 'Magenta',
    'W': 'White', 'K': 'Black', 'A': 'Gray',
    'O': 'Orange', 'P': 'Purple', 'I': 'Pink', 'N': 'Brown'
};

// 支持的完整颜色名列表
const supportedColors = [
    'Red', 'Green', 'Blue', 'Cyan', 'Yellow', 'Magenta',
    'White', 'Black', 'Gray', 'Orange', 'Purple', 'Pink', 'Brown'
];

// 更改终端字体颜色
function changeColor(args) {
    if (!args[0]) {
        terminal.println('用法: /color <字母>', 'info-line');
        terminal.println('可用颜色代码 (单字母首字母):', 'info-line');
        terminal.println('  R=红  G=绿  B=蓝  C=青  Y=黄  M=品红', 'info-line');
        terminal.println('  W=白  K=黑  A=灰  O=橙  P=紫  I=粉  N=棕', 'info-line');
        terminal.println('也支持全名: /color Red, /color Green ...', 'info-line');
        terminal.println('示例: /color R 或 /color Red', 'info-line');
        return;
    }

    // 移除可能的尖括号
    const raw = args[0].replace(/[<>]/g, '');
    
    // 判断是单字母还是完整颜色名
    let colorName;
    if (raw.length === 1) {
        // 单字母模式
        const letter = raw.toUpperCase();
        if (colorLetterMap[letter]) {
            colorName = colorLetterMap[letter];
        } else {
            terminal.println(`错误: 不支持的颜色字母 '${letter}'`, 'error-line');
            terminal.println('可用颜色: R G B C Y M W K A O P I N', 'info-line');
            return;
        }
    } else {
        // 完整颜色名模式
        const capitalized = raw.charAt(0).toUpperCase() + raw.slice(1).toLowerCase();
        if (supportedColors.includes(capitalized)) {
            colorName = capitalized;
        } else {
            terminal.println(`错误: 不支持的颜色 '${capitalized}'`, 'error-line');
            terminal.println('可用颜色: Red, Green, Blue, Cyan, Yellow, Magenta, White, Black, Gray, Orange, Purple, Pink, Brown', 'info-line');
            terminal.println('单字母: R G B C Y M W K A O P I N', 'info-line');
            return;
        }
    }

    // 移除所有颜色类，添加新颜色类 (应用到 body 以确保全局生效)
    const targetEl = document.body;
    supportedColors.forEach(c => {
        targetEl.classList.remove(`color-${c}`);
        document.getElementById('terminal').classList.remove(`color-${c}`);
    });
    targetEl.classList.add(`color-${colorName}`);
    document.getElementById('terminal').classList.add(`color-${colorName}`);

    // 保存颜色设置
    localStorage.setItem('mltsf-color', colorName);

    // Black 特殊提示
    if (colorName === 'Black') {
        terminal.println('已切换到黑色字体（文字在黑色背景上可能不可见）', 'warning-line');
        terminal.println('如需恢复，请盲打: /color G 然后按 Enter', 'warning-line');
    } else {
        terminal.println(`终端颜色已更改为 ${colorName}`, 'success-line');
    }
}

// 运行代码
async function runCode(args) {
    if (!terminal.currentProject) {
        terminal.println('错误: 请先使用 /jr 打开一个项目', 'error-line');
        return;
    }

    const project = projects[terminal.currentProject];
    const fileName = args[0] ? args[0].replace(/[<>]/g, '') : null;

    if (!fileName) {
        // 列出项目中的所有文件
        const files = Object.keys(project.files);
        if (files.length === 0) {
            terminal.println('当前项目为空，请先创建文件', 'info-line');
        } else {
            terminal.println('项目文件列表:', 'info-line');
            files.forEach(f => terminal.println(`- ${f}`, 'info-line'));
            terminal.println('使用 /run <文件名> 运行指定文件', 'info-line');
        }
        return;
    }

    const fileContent = project.files[fileName];
    if (!fileContent) {
        terminal.println(`错误: 文件 '${fileName}' 不存在`, 'error-line');
        return;
    }

    if (!terminal.currentEnv) {
        terminal.println('错误: 请先使用 /hj 选择环境 (python/c++/cmd)', 'error-line');
        return;
    }

    // 打印执行头部
    terminal.println('', 'info-line');
    terminal.println(`═══════════════════════════════════════════`, 'info-line');
    terminal.println(`  运行: ${fileName}`, 'info-line');
    terminal.println(`  环境: ${terminal.currentEnv.toUpperCase()}`, 'info-line');
    terminal.println(`  项目: ${terminal.currentProject}`, 'info-line');
    terminal.println(`═══════════════════════════════════════════`, 'info-line');
    terminal.println('', 'info-line');

    const startTime = Date.now();

    terminal.isProcessing = true;
    try {
        if (terminal.currentEnv === 'python') {
            await runPythonCode(fileContent, true);
        } else if (terminal.currentEnv === 'c++') {
            await runCppCode(fileContent);
        } else if (terminal.currentEnv === 'cmd') {
            const lines = fileContent.split('\n');
            for (const line of lines) {
                if (line.trim()) {
                    runCmdCommand(line.trim());
                }
            }
        }

        // 执行完成
        const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);
        terminal.println('', 'info-line');
        terminal.println(`═══════════════════════════════════════════`, 'info-line');
        terminal.println(`  ✅ 执行完成 | 耗时: ${elapsed}s`, 'success-line');
        terminal.println(`═══════════════════════════════════════════`, 'info-line');
        terminal.println('', 'info-line');
    } catch (error) {
        const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);
        terminal.println('', 'error-line');
        terminal.println(`═══════════════════════════════════════════`, 'error-line');
        terminal.println(`  ❌ 执行失败 | 耗时: ${elapsed}s`, 'error-line');
        terminal.println(`  错误: ${error.message}`, 'error-line');
        terminal.println(`═══════════════════════════════════════════`, 'error-line');
        terminal.println('', 'error-line');
    } finally {
        terminal.isProcessing = false;
    }
}

// 创建项目或文件
function createItem(args) {
    const raw0 = args[0] ? args[0].replace(/[<>]/g, '') : '';
    const raw1 = args[1] ? args[1].replace(/[<>]/g, '') : '';

    // 完整参数模式: /xj project 名称 或 /xj file 名称
    if (raw0 && raw1) {
        const type = raw0.toLowerCase();
        const name = raw1;

        if (type === 'project' || type === 'p') {
            createProject(name);
        } else if (type === 'file' || type === 'f') {
            if (!terminal.currentProject) {
                terminal.println('错误: 请先使用 /jr 打开一个项目，或在项目内创建文件', 'error-line');
                return;
            }
            createFile(name);
        } else {
            terminal.println(`错误: 不支持的类型 '${type}'`, 'error-line');
            terminal.println('支持的类型: project (项目), file (文件)', 'info-line');
        }
        return;
    }

    // 单个参数模式: /xj 名称 → 交互式选择
    const name = raw0;
    if (!name) {
        terminal.println('用法:', 'info-line');
        terminal.println('  /xj 名称         - 交互式选择创建项目或文件', 'info-line');
        terminal.println('  /xj project 名称  - 直接创建新项目', 'info-line');
        terminal.println('  /xj file 名称     - 在当前项目中创建新文件', 'info-line');
        terminal.println('示例:', 'info-line');
        terminal.println('  /xj myapp        - 然后选择 project 或 file', 'info-line');
        terminal.println('  /xj project myapp - 直接创建项目', 'info-line');
        return;
    }

    // 交互式选择类型
    terminal.println(`请输入要创建的 "${name}" 类型:`);
    terminal.println('  1: project (项目)', 'info-line');
    terminal.println('  2: file (文件)', 'info-line');

    // 创建临时输入
    const inputContainer = document.createElement('div');
    inputContainer.style.cssText = 'display:flex;align-items:center;margin-top:5px;';
    inputContainer.innerHTML = `
        <span style="color:var(--terminal-prompt);">选择类型 (1/2)&gt; </span>
        <input type="text" id="xj-type-input"
               style="background:#000;color:var(--terminal-color);border:none;outline:none;font-family:inherit;font-size:14px;flex:1;"
               autocomplete="off">
    `;

    terminal.input.disabled = true;
    terminal.input.style.opacity = '0.3';

    terminal.output.appendChild(inputContainer);
    terminal.scrollToBottom();

    const typeInput = document.getElementById('xj-type-input');
    if (typeInput) {
        typeInput.focus();
        typeInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                const choice = typeInput.value.trim();
                inputContainer.remove();
                terminal.input.disabled = false;
                terminal.input.style.opacity = '1';
                terminal.input.focus();

                if (choice === '1' || choice.toLowerCase() === 'p' || choice.toLowerCase() === 'project') {
                    createProject(name);
                } else if (choice === '2' || choice.toLowerCase() === 'f' || choice.toLowerCase() === 'file') {
                    if (!terminal.currentProject) {
                        terminal.println('错误: 当前未打开任何项目，无法创建文件', 'error-line');
                        terminal.println('提示: 请先用 /xj project 项目名 创建项目，或用 /jr 打开已有项目', 'info-line');
                        return;
                    }
                    createFile(name);
                } else {
                    terminal.println(`已取消创建 '${name}'`, 'info-line');
                }
            }
        });
    }
}

// 安装Python包
async function installPackage(args) {
    if (!args[0]) {
        terminal.println('用法: /d <包名>', 'info-line');
        terminal.println('示例: /d numpy', 'info-line');
        return;
    }

    if (terminal.currentEnv !== 'python') {
        terminal.println('错误: 请先使用 /hj python 切换到Python环境', 'error-line');
        return;
    }

    const packageName = args[0].replace(/[<>]/g, '');
    terminal.println(`正在安装包 '${packageName}'...`, 'info-line');

    try {
        await installPythonPackage(packageName);
        terminal.println(`成功安装 '${packageName}'`, 'success-line');
    } catch (error) {
        terminal.println(`安装 '${packageName}' 失败: ${error.message}`, 'error-line');
    }
}

// 删除项目或文件
function deleteItem(args) {
    if (!args[0]) {
        terminal.println('用法:', 'info-line');
        terminal.println('  /b project 项目名  - 删除项目', 'info-line');
        terminal.println('  /b file 文件名     - 在当前项目中删除文件', 'info-line');
        return;
    }

    const type = args[0].replace(/[<>]/g, '');
    const itemName = args[1] ? args[1].replace(/[<>]/g, '') : '';

    if (!itemName) {
        // 如果只有一个参数，检查是否是项目名
        if (projects[type]) {
            deleteProject(type);
        } else {
            terminal.println(`错误: 未找到项目或文件 '${type}'`, 'error-line');
        }
        return;
    }

    if (type === 'project') {
        deleteProject(itemName);
    } else if (type === 'file') {
        if (!terminal.currentProject) {
            terminal.println('错误: 请先使用 /jr 打开一个项目', 'error-line');
            return;
        }
        deleteFile(itemName);
    } else {
        terminal.println(`错误: 不支持的类型 '${type}'`, 'error-line');
    }
}

// CMD环境初始化
function initCmdEnv() {
    terminal.println('CMD环境已就绪', 'success-line');
    terminal.println('提示: 输入CMD命令直接执行', 'info-line');
}

// 运行CMD命令
function runCmdCommand(cmd) {
    terminal.println(`执行: ${cmd}`, 'info-line');
    // 由于浏览器限制，CMD命令只能在服务器端执行
    // 这里模拟输出
    terminal.println('注意: CMD命令在浏览器中无法直接执行', 'warning-line');
    terminal.println('建议切换到其他环境或使用本地终端', 'info-line');
}

// 源 (Source) 管理 - localStorage key
const SOURCE_STORAGE_KEY = 'mltsf-source';

// 可用源列表
const sourceList = [
    { id: 'official', name: '官方源 (Official)', url: '默认官方源' },
    { id: 'mirror', name: '镜像源 (Mirror - 清华)', url: 'https://pypi.tuna.tsinghua.edu.cn/simple' }
];

// 切换源 - 带交互提示
function toggleSource(args) {
    const currentSource = localStorage.getItem(SOURCE_STORAGE_KEY) || 'official';
    const currentName = sourceList.find(s => s.id === currentSource)?.name || '未知';

    terminal.println('╔══════════════════════════════════════════╗', 'info-line');
    terminal.println('║              源 (Source) 切换             ║', 'info-line');
    terminal.println('╚══════════════════════════════════════════╝', 'info-line');
    terminal.println(`当前源: ${currentName}`, 'info-line');
    terminal.println('');
    terminal.println('请选择要切换到的源 (输入编号或字母后按 Enter):', 'info-line');
    terminal.println('  1: 官方源 (Official)', 'info-line');
    terminal.println('  2: 镜像源 (Mirror - 清华)', 'info-line');
    terminal.println('  其他: 取消', 'info-line');

    // 创建临时输入界面
    const inputContainer = document.createElement('div');
    inputContainer.style.cssText = 'display:flex;align-items:center;margin-top:5px;';
    inputContainer.innerHTML = `
        <span style="color:var(--terminal-prompt);">选择&gt; </span>
        <input type="text" id="source-input"
               style="background:#000;color:var(--terminal-color);border:none;outline:none;font-family:inherit;font-size:14px;flex:1;"
               autocomplete="off">
    `;

    // 禁用主输入框
    terminal.input.disabled = true;
    terminal.input.style.opacity = '0.3';

    const output = terminal.output;
    output.appendChild(inputContainer);

    const sourceInput = document.getElementById('source-input');
    if (sourceInput) {
        sourceInput.focus();

        const handleInput = (e) => {
            if (e.key === 'Enter') {
                const choice = sourceInput.value.trim();
                inputContainer.remove();

                // 恢复主输入框
                terminal.input.disabled = false;
                terminal.input.style.opacity = '1';
                terminal.input.focus();

                let selectedSource = null;
                if (choice === '1' || choice.toLowerCase() === 'o' || choice.toLowerCase() === 'official') {
                    selectedSource = 'official';
                } else if (choice === '2' || choice.toLowerCase() === 'm' || choice.toLowerCase() === 'mirror') {
                    selectedSource = 'mirror';
                }

                if (selectedSource) {
                    if (selectedSource === currentSource) {
                        terminal.println(`当前已是 ${sourceList.find(s => s.id === selectedSource)?.name}，无需切换`, 'info-line');
                    } else {
                        localStorage.setItem(SOURCE_STORAGE_KEY, selectedSource);
                        const newName = sourceList.find(s => s.id === selectedSource)?.name || '未知';
                        terminal.println(`源已切换到: ${newName}`, 'success-line');
                        terminal.println('提示: 切换源后部分功能需要刷新页面才能生效 (/cq)', 'info-line');
                    }
                } else {
                    terminal.println('已取消切换', 'info-line');
                }
            }
        };

        sourceInput.addEventListener('keydown', handleInput);
    }
}

// 写入/修改文件内容 (/wr 命令)
function writeFile(args) {
    const fileName = args[0] ? args[0].replace(/[<>]/g, '').trim() : '';

    if (!fileName) {
        terminal.println('用法: /wr <文件名>', 'info-line');
        terminal.println('示例: /wr main.py', 'info-line');
        terminal.println('      /wr index.html', 'info-line');
        return;
    }

    if (!terminal.currentProject) {
        terminal.println('错误: 请先使用 /jr 打开一个项目', 'error-line');
        return;
    }

    const project = projects[terminal.currentProject];
    const existingContent = project.files[fileName] || '';

    terminal.println(`正在编辑文件 '${fileName}'...`, 'info-line');
    terminal.println('--- 在下方编辑区输入内容，按 Ctrl+Enter 保存 ---', 'info-line');

    // 创建编辑区域
    const editorContainer = document.createElement('div');
    editorContainer.style.cssText = 'margin:5px 0;width:100%;';

    const textarea = document.createElement('textarea');
    textarea.value = existingContent;
    textarea.style.cssText = `
        width:100%;
        min-height:200px;
        background:#1a1a2e;
        color:var(--terminal-color, #00ff00);
        border:1px solid var(--terminal-color, #00ff00);
        border-radius:4px;
        padding:8px;
        font-family:'Consolas','Courier New',monospace;
        font-size:13px;
        resize:vertical;
        outline:none;
        box-sizing:border-box;
    `;
    textarea.spellcheck = false;
    textarea.autocomplete = 'off';
    textarea.placeholder = '在此输入文件内容...';

    const buttonBar = document.createElement('div');
    buttonBar.style.cssText = 'display:flex;gap:8px;margin-top:6px;align-items:center;';

    const saveBtn = document.createElement('button');
    saveBtn.textContent = '💾 保存 (Ctrl+Enter)';
    saveBtn.style.cssText = `
        padding:5px 14px;
        background:var(--terminal-color, #00ff00);
        color:#1a1a2e;
        border:none;
        border-radius:3px;
        cursor:pointer;
        font-family:inherit;
        font-size:13px;
        font-weight:bold;
    `;

    const cancelBtn = document.createElement('button');
    cancelBtn.textContent = '取消 (Esc)';
    cancelBtn.style.cssText = `
        padding:5px 14px;
        background:#555;
        color:#fff;
        border:none;
        border-radius:3px;
        cursor:pointer;
        font-family:inherit;
        font-size:13px;
    `;

    const statusMsg = document.createElement('span');
    statusMsg.style.cssText = 'font-size:12px;color:#888;margin-left:8px;';
    statusMsg.textContent = existingContent ? `已加载 ${fileName}` : '新文件';

    buttonBar.appendChild(saveBtn);
    buttonBar.appendChild(cancelBtn);
    buttonBar.appendChild(statusMsg);
    editorContainer.appendChild(textarea);
    editorContainer.appendChild(buttonBar);

    // 禁用主输入框
    terminal.input.disabled = true;
    terminal.input.style.opacity = '0.3';

    terminal.output.appendChild(editorContainer);
    terminal.scrollToBottom();
    textarea.focus();

    // 保存函数
    function doSave() {
        const content = textarea.value;

        if (terminal.currentProject && projects[terminal.currentProject]) {
            project.files[fileName] = content;
            saveProjects();
            statusMsg.textContent = '✅ 已保存!';
            statusMsg.style.color = '#00ff00';
            terminal.println(`文件 '${fileName}' 已保存 (${content.length} 字符)`, 'success-line');
        } else {
            terminal.println('错误: 项目已丢失，请重新选择项目', 'error-line');
        }

        editorContainer.remove();
        terminal.input.disabled = false;
        terminal.input.style.opacity = '1';
        terminal.input.focus();
    }

    // 取消函数
    function doCancel() {
        if (textarea.value !== existingContent) {
            if (!confirm('文件内容已更改，确定放弃修改吗？')) {
                return;
            }
        }
        terminal.println('已取消编辑', 'info-line');
        editorContainer.remove();
        terminal.input.disabled = false;
        terminal.input.style.opacity = '1';
        terminal.input.focus();
    }

    // 事件绑定
    textarea.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
            e.preventDefault();
            doSave();
        } else if (e.key === 'Escape') {
            e.preventDefault();
            doCancel();
        }
    });

    saveBtn.addEventListener('click', doSave);
    cancelBtn.addEventListener('click', doCancel);
}

// 显示免责声明
function showDisclaimer() {
    terminal.println('');
    terminal.println('╔══════════════════════════════════════════════════════════╗', 'info-line');
    terminal.println('║                    免 责 声 明                          ║', 'info-line');
    terminal.println('╚══════════════════════════════════════════════════════════╝', 'info-line');
    terminal.println('');
    terminal.println('1. MLTSF (多语言终端模拟器) 是一个开源学习工具，', 'info-line');
    terminal.println('   仅用于教育和学习目的。', 'info-line');
    terminal.println('');
    terminal.println('2. 本工具不对用户通过 Python/C++/CMD 环境执行的', 'info-line');
    terminal.println('   代码所产生的任何后果负责。', 'info-line');
    terminal.println('');
    terminal.println('3. 扩展包由第三方开发者提供，MLTSF 不对其内容、', 'info-line');
    terminal.println('   安全性或功能作任何保证。', 'info-line');
    terminal.println('');
    terminal.println('4. 用户应自行承担使用本工具及其扩展包的所有风险。', 'info-line');
    terminal.println('');
    terminal.println('5. 本工具完全在浏览器端运行，不会收集或上传', 'info-line');
    terminal.println('   任何用户数据。', 'info-line');
    terminal.println('');
    terminal.println('╔══════════════════════════════════════════════════════════╗', 'info-line');
    terminal.println('║  使用本工具即表示您同意以上条款                          ║', 'info-line');
    terminal.println('╚══════════════════════════════════════════════════════════╝', 'info-line');
    terminal.println('');
}

// ==========================================
// 扩展自动化指令 (Extension SDK v3.0)
// ==========================================

// 列出所有扩展注册的命令
function listExtensionCommands() {
    const extCmds = window.extensionManager && window.extensionManager.registeredCommands;
    if (!extCmds || Object.keys(extCmds).length === 0) {
        terminal.println('当前没有扩展注册任何命令', 'info-line');
        terminal.println('使用 /lxe 查看已加载的扩展包', 'info-line');
        return;
    }

    terminal.println('╔══════════════════════════════════════════╗', 'info-line');
    terminal.println('║         扩展注册命令列表                  ║', 'info-line');
    terminal.println('╚══════════════════════════════════════════╝', 'info-line');
    terminal.println('');

    Object.keys(extCmds).forEach((cmd, idx) => {
        const info = extCmds[cmd];
        terminal.println(`  ${idx + 1}. ${cmd}`, 'success-line');
        terminal.println(`     描述: ${info.description || '无描述'}`, 'info-line');
        terminal.println(`     扩展: ${info.extension || '未知'}`, 'info-line');
        terminal.println(`     用法: /runxt ${cmd} [参数...]`, 'info-line');
        terminal.println('');
    });

    terminal.println(`共 ${Object.keys(extCmds).length} 个扩展命令`, 'info-line');
    terminal.println('使用 /runxt <命令名> [参数] 调用扩展命令', 'info-line');
}

// 调用扩展注册的命令
async function runExtensionCommand(args) {
    if (!args || args.length === 0) {
        terminal.println('用法: /runxt <命令名> [参数...]', 'info-line');
        terminal.println('示例: /runxt mycommand arg1 arg2', 'info-line');
        terminal.println('提示: 使用 /extlist 查看所有可用的扩展命令', 'info-line');
        return;
    }

    const cmdName = args[0];
    const cmdArgs = args.slice(1);

    const extCmds = window.extensionManager && window.extensionManager.registeredCommands;
    if (!extCmds || !extCmds[cmdName]) {
        terminal.println(`错误: 未找到扩展命令 '${cmdName}'`, 'error-line');
        terminal.println('使用 /extlist 查看所有可用的扩展命令', 'info-line');
        return;
    }

    const extCmd = extCmds[cmdName];
    terminal.println(`[扩展命令] 正在调用 '${cmdName}' (来自: ${extCmd.extension || '未知'})...`, 'info-line');

    try {
        terminal.isProcessing = true;
        await extCmd.handler(cmdArgs, terminal);
        terminal.println(`[扩展命令] '${cmdName}' 执行完成`, 'success-line');
    } catch (e) {
        terminal.println(`[扩展命令] '${cmdName}' 执行错误: ${e.message}`, 'error-line');
    } finally {
        terminal.isProcessing = false;
    }
}

// 查看扩展系统状态
function showExtensionStatus() {
    const mgr = window.extensionManager;
    if (!mgr) {
        terminal.println('错误: 扩展管理器未加载', 'error-line');
        return;
    }

    terminal.println('╔══════════════════════════════════════════╗', 'info-line');
    terminal.println('║         扩展系统状态 (v3.0)               ║', 'info-line');
    terminal.println('╚══════════════════════════════════════════╝', 'info-line');
    terminal.println('');

    // SDK 状态
    const sdk = window.ExtensionAPI;
    terminal.println('SDK 状态:', 'info-line');
    terminal.println('  SDK 版本: v3.0', sdk ? 'success-line' : 'error-line');
    terminal.println(`  SDK 已初始化: ${sdk ? '✅ 是' : '❌ 否'}`, sdk ? 'success-line' : 'error-line');
    terminal.println('');

    // 已加载扩展
    const loadedCount = Object.keys(mgr.loadedExtensions || {}).length;
    terminal.println(`已加载扩展包: ${loadedCount} 个`, loadedCount > 0 ? 'success-line' : 'info-line');

    if (loadedCount > 0) {
        Object.keys(mgr.loadedExtensions).forEach(name => {
            const ext = mgr.loadedExtensions[name];
            terminal.println(`  📦 ${name}`, 'info-line');
            terminal.println(`     版本: ${ext.config?.version || '未知'}`, 'info-line');
            terminal.println(`     描述: ${ext.config?.description || '无描述'}`, 'info-line');
            terminal.println(`     命令: ${ext.commands ? ext.commands.join(', ') : '无'}`, 'info-line');
            terminal.println(`     资源: ${ext.loadedCSS ? ext.loadedCSS.length + ' CSS' : '0 CSS'}, ${ext.loadedScripts ? ext.loadedScripts.length + ' 脚本' : '0 脚本'}`, 'info-line');
            terminal.println('');
        });
    }

    // 注册命令
    const cmdCount = Object.keys(mgr.registeredCommands || {}).length;
    terminal.println(`注册的自定义命令: ${cmdCount} 个`, 'info-line');
    terminal.println('');
    terminal.println('使用 /lxe 查看详细扩展列表', 'info-line');
    terminal.println('使用 /extlist 查看所有扩展命令', 'info-line');
}

// ==========================================
// AI 命令支持 (v1.0)
// ==========================================

const AI_CONFIG_KEY = 'mltsf-ai-config';

const AI_SYSTEM_PROMPT = `你是一个嵌入在 MLTSF（多语言终端模拟器）中的 AI 编程助手。

你是 MLTSF 终端的一部分，可以通过执行终端命令来帮助用户完成编程任务。

可用的终端命令列表（请根据需要使用）：
- /hj <环境名>       : 切换环境 (python/c++/cmd)
- /jr <项目名>        : 打开/切换项目
- /xj project <名称>  : 创建新项目
- /xj file <名称>     : 在当前项目中创建文件
- /wr <文件名>        : 编辑或创建文件
- /run <文件名>       : 运行文件
- /b project <名称>   : 删除项目
- /b file <名称>      : 删除文件
- /bq                : 清空当前项目
- /color <颜色>       : 更改终端主题颜色
- /d <包名>           : 安装 Python 包
- /dc <项目名>        : 导出项目
- /ex <文件名>        : 执行外部命令
- /cq                : 清屏
- /qk <文件名>        : 快速查看文件内容

如果你需要执行命令，请在回答中包含命令本身（以 / 开头）。
例如：
    我可以帮你查看项目文件。
    /jr myProject

之后系统会自动执行这些命令。

请用中文回答用户的问题，保持简洁且专业。`;

function loadAIConfig() {
    try {
        const saved = localStorage.getItem(AI_CONFIG_KEY);
        if (saved) {
            return JSON.parse(saved);
        }
    } catch (e) {}
    return null;
}

function saveAIConfig(config) {
    localStorage.setItem(AI_CONFIG_KEY, JSON.stringify(config));
}

/**
 * 创建交互式输入框，返回用户输入的值
 */
function createPromptInput(promptText, defaultValue = '') {
    return new Promise((resolve) => {
        const lineContainer = document.createElement('div');
        lineContainer.style.cssText = 'display:flex;align-items:center;margin-top:5px;';
        lineContainer.innerHTML = `
            <span style="color:#00ff00;">${promptText}</span>
            <input type="text" id="ai-prompt-input"
                   style="background:#000;color:#fff;border:none;outline:none;font-family:inherit;font-size:14px;flex:1;margin-left:4px;"
                   autocomplete="off" value="${defaultValue}">
        `;
        
        const terminalEl = document.getElementById('output');
        terminalEl.appendChild(lineContainer);
        
        // 滚动到输入框
        terminalEl.scrollTop = terminalEl.scrollHeight;
        
        const input = document.getElementById('ai-prompt-input');
        if (input) {
            input.focus();
            // 将光标移到末尾
            if (defaultValue) {
                input.setSelectionRange(defaultValue.length, defaultValue.length);
            }
        }
        
        // 禁用终端输入
        if (terminal && terminal.input) {
            terminal.input.disabled = true;
            terminal.input.style.opacity = '0.3';
        }
        
        const handleKeydown = (e) => {
            if (e.key === 'Enter') {
                const value = input ? input.value.trim() : '';
                lineContainer.remove();
                
                if (terminal && terminal.input) {
                    terminal.input.disabled = false;
                    terminal.input.style.opacity = '1';
                    terminal.input.focus();
                }
                document.removeEventListener('keydown', handleKeydown);
                resolve(value);
            }
        };
        
        document.addEventListener('keydown', handleKeydown);
    });
}

/**
 * `/ai` 命令主入口
 */
async function aiCommand(args) {
    if (!args || args.length === 0) {
        // 显示帮助信息
        terminal.println('╔══════════════════════════════════════════╗', 'info-line');
        terminal.println('║         AI 命令帮助                      ║', 'info-line');
        terminal.println('╚══════════════════════════════════════════╝', 'info-line');
        terminal.println('');
        terminal.println('  /ai code          - 配置 AI 参数 (API Key、URL、模型)', 'info-line');
        terminal.println('  /ai <问题>        - 向 AI 提问，AI 可执行终端命令', 'info-line');
        terminal.println('  /aic              - 清除 AI 配置', 'info-line');
        terminal.println('');
        
        const config = loadAIConfig();
        if (config) {
            terminal.println('当前配置:', 'success-line');
            terminal.println(`  API URL: ${config.url || '未设置'}`, 'info-line');
            terminal.println(`  模型: ${config.model || '未设置'}`, 'info-line');
            terminal.println(`  API Key: ${config.apiKey ? '****' + config.apiKey.slice(-4) : '未设置'}`, 'info-line');
        } else {
            terminal.println('当前未配置 AI，请使用 /ai code 进行配置', 'warning-line');
        }
        return;
    }
    
    const subCmd = args[0].toLowerCase();
    
    if (subCmd === 'code') {
        // 进入配置模式
        await configureAI();
        return;
    }
    
    // 其他情况下，将用户输入作为问题发送给 AI
    const question = args.join(' ');
    await sendToAI(question);
}

/**
 * 交互式配置 AI 参数
 */
async function configureAI() {
    const existingConfig = loadAIConfig();
    
    terminal.println('╔══════════════════════════════════════════╗', 'info-line');
    terminal.println('║         AI 配置向导                       ║', 'info-line');
    terminal.println('╚══════════════════════════════════════════╝', 'info-line');
    terminal.println('输入对应值后按 Enter 确认，留空则跳过。输入 cancel 取消。', 'warning-line');
    terminal.println('');
    
    // 1. API Key
    const apiKey = await createPromptInput(
        'API Key: ',
        existingConfig ? existingConfig.apiKey || '' : ''
    );
    if (apiKey.toLowerCase() === 'cancel') {
        terminal.println('已取消配置', 'warning-line');
        return;
    }
    
    // 2. API URL
    const url = await createPromptInput(
        'API URL (例如 https://api.openai.com/v1): ',
        existingConfig ? existingConfig.url || 'https://api.openai.com/v1' : 'https://api.openai.com/v1'
    );
    if (url.toLowerCase() === 'cancel') {
        terminal.println('已取消配置', 'warning-line');
        return;
    }
    
    // 3. 模型名称
    const model = await createPromptInput(
        '模型名称 (例如 gpt-4, deepseek-chat): ',
        existingConfig ? existingConfig.model || 'gpt-4' : 'gpt-4'
    );
    if (model.toLowerCase() === 'cancel') {
        terminal.println('已取消配置', 'warning-line');
        return;
    }
    
    // 保存配置
    const newConfig = {};
    if (apiKey) newConfig.apiKey = apiKey;
    if (url) newConfig.url = url;
    if (model) newConfig.model = model;
    
    saveAIConfig(newConfig);
    
    terminal.println('');
    terminal.println('╔══════════════════════════════════════════╗', 'success-line');
    terminal.println('║         AI 配置已保存                      ║', 'success-line');
    terminal.println('╚══════════════════════════════════════════╝', 'success-line');
    terminal.println(`  API URL: ${newConfig.url}`, 'info-line');
    terminal.println(`  模型: ${newConfig.model}`, 'info-line');
    terminal.println(`  API Key: ${newConfig.apiKey ? '****' + newConfig.apiKey.slice(-4) : '未设置'}`, 'info-line');
    terminal.println('');
    terminal.println('现在可以使用 /ai <问题> 向 AI 提问', 'info-line');
}

/**
 * 清除 AI 配置
 */
function aiClearConfig() {
    localStorage.removeItem(AI_CONFIG_KEY);
    terminal.println('AI 配置已清除', 'success-line');
}

/**
 * 向 AI 发送问题并处理响应
 */
async function sendToAI(question) {
    const config = loadAIConfig();
    
    if (!config || !config.apiKey) {
        terminal.println('错误: AI 未配置，请先使用 /ai code 进行配置', 'error-line');
        return;
    }
    
    if (!config.url) {
        terminal.println('错误: API URL 未配置', 'error-line');
        return;
    }
    
    terminal.println('');
    terminal.println('正在向 AI 发送问题...', 'info-line');
    terminal.println(`问题: ${question}`, 'info-line');
    terminal.println('');
    
    try {
        const response = await fetch(`${config.url}/chat/completions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${config.apiKey}`
            },
            body: JSON.stringify({
                model: config.model || 'gpt-4',
                messages: [
                    { role: 'system', content: AI_SYSTEM_PROMPT },
                    { role: 'user', content: question }
                ],
                stream: false,
                temperature: 0.7,
                max_tokens: 4096
            })
        });
        
        if (!response.ok) {
            let errorMsg = `API 请求失败 (HTTP ${response.status})`;
            try {
                const errData = await response.json();
                if (errData.error && errData.error.message) {
                    errorMsg += `: ${errData.error.message}`;
                }
            } catch (e) {}
            throw new Error(errorMsg);
        }
        
        const data = await response.json();
        
        if (!data.choices || data.choices.length === 0) {
            throw new Error('API 返回结果异常：无有效回复');
        }
        
        const aiReply = data.choices[0].message.content;
        
        // 显示 AI 回复
        terminal.println('╔══════════════════════════════════════════╗', 'info-line');
        terminal.println('║         AI 回复                          ║', 'info-line');
        terminal.println('╚══════════════════════════════════════════╝', 'info-line');
        terminal.println('');
        
        // 逐行显示回复，并检查是否有命令
        const lines = aiReply.split('\n');
        const commandsToExecute = [];
        
        for (const line of lines) {
            const trimmedLine = line.trim();
            // 检查是否以 / 开头（可能是命令）
            if (trimmedLine.startsWith('/') && trimmedLine.length > 1) {
                commandsToExecute.push(trimmedLine);
                terminal.println(trimmedLine, 'warning-line');
            } else {
                terminal.println(line, 'code-line');
            }
        }
        
        terminal.println('');
        
        // 执行 AI 指定的命令
        if (commandsToExecute.length > 0) {
            terminal.println('╔══════════════════════════════════════════╗', 'info-line');
            terminal.println('║         AI 正在执行命令...               ║', 'info-line');
            terminal.println('╚══════════════════════════════════════════╝', 'info-line');
            
            for (const cmd of commandsToExecute) {
                terminal.println('');
                terminal.println(`> ${cmd}`, 'warning-line');
                try {
                    // 通过 processSystemCommand 执行
                    if (terminal && terminal.processSystemCommand) {
                        await terminal.processSystemCommand(cmd);
                    }
                } catch (cmdErr) {
                    terminal.println(`命令执行失败: ${cmdErr.message}`, 'error-line');
                }
            }
        }
        
        terminal.println('');
        terminal.println(`--- 回复结束 (Token: ${data.usage ? (data.usage.total_tokens || '?') : '?'}) ---`, 'info-line');
        
    } catch (error) {
        terminal.println('');
        terminal.println('╔══════════════════════════════════════════╗', 'error-line');
        terminal.println('║         AI 请求失败                      ║', 'error-line');
        terminal.println('╚══════════════════════════════════════════╝', 'error-line');
        terminal.println(`错误: ${error.message}`, 'error-line');
        terminal.println('');
        terminal.println('请检查:', 'info-line');
        terminal.println('  1. API URL 是否正确', 'info-line');
        terminal.println('  2. API Key 是否有效', 'info-line');
        terminal.println('  3. 模型名称是否正确', 'info-line');
        terminal.println('  4. 网络连接是否正常', 'info-line');
        terminal.println('使用 /ai code 重新配置', 'info-line');
    }
}