let terminal = {
    output: document.getElementById('output'),
    input: document.getElementById('command-input'),
    prompt: document.getElementById('prompt'),
    currentEnv: null,
    currentProject: null,
    history: [],
    historyIndex: -1,
    isProcessing: false,

    init() {
        this.printWelcomeMessage();
        this.input.focus();
        
        // 处理命令输入
        this.input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !this.isProcessing) {
                const command = this.input.value.trim();
                if (command) {
                    this.history.push(command);
                    this.historyIndex = this.history.length;
                    this.executeCommand(command);
                }
                this.input.value = '';
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                if (this.historyIndex > 0) {
                    this.historyIndex--;
                    this.input.value = this.history[this.historyIndex];
                }
            } else if (e.key === 'ArrowDown') {
                e.preventDefault();
                if (this.historyIndex < this.history.length - 1) {
                    this.historyIndex++;
                    this.input.value = this.history[this.historyIndex];
                } else {
                    this.historyIndex = this.history.length;
                    this.input.value = '';
                }
            }
        });

        // 点击终端自动聚焦输入框
        document.getElementById('terminal').addEventListener('click', () => {
            this.input.focus();
        });
    },

    printWelcomeMessage() {
        this.println('╔══════════════════════════════════════════════════════════╗', 'info-line');
        this.println('║              MLTSF - 多语言终端模拟器 v1.0.0             ║', 'info-line');
        this.println('║          集成 Python, C++, CMD 环境于一体               ║', 'info-line');
        this.println('╚══════════════════════════════════════════════════════════╝', 'info-line');
        this.println('');
        this.println('输入 /help 查看所有可用命令', 'success-line');
        this.println('');
    },

    println(text, className = '') {
        const line = document.createElement('div');
        line.textContent = text;
        if (className) line.className = className;
        this.output.appendChild(line);
        this.scrollToBottom();
    },

    printHtml(html, className = '') {
        const line = document.createElement('div');
        line.innerHTML = html;
        if (className) line.className = className;
        this.output.appendChild(line);
        this.scrollToBottom();
    },

    scrollToBottom() {
        this.output.scrollTop = this.output.scrollHeight;
    },

    clear() {
        this.output.innerHTML = '';
    },

    async executeCommand(command) {
        this.println(`${this.prompt.textContent}${command}`);
        
        if (command.startsWith('/')) {
            await this.processSystemCommand(command);
        } else if (this.currentEnv) {
            await this.processCodeInput(command);
        } else {
            this.println('错误: 请先使用 /hj 命令选择一个环境', 'error-line');
        }
    },

    async processSystemCommand(command) {
        const parts = command.split(/\s+/);
        const cmd = parts[0].toLowerCase();
        const args = parts.slice(1);

        switch (cmd) {
            case '/help':
                showHelp();
                break;
            case '/cq':
                location.reload();
                break;
            case '/qk':
                this.clear();
                break;
            case '/hj':
                await switchEnvironment(args);
                break;
            case '/run':
                await runCode(args);
                break;
            case '/dc':
                exportProject(args);
                break;
            case '/xj':
                createItem(args);
                break;
            case '/d':
                await installPackage(args);
                break;
            case '/b':
                deleteItem(args);
                break;
            default:
                this.println(`错误: 未知命令 '${cmd}'，输入 /help 查看帮助`, 'error-line');
        }
    },

    async processCodeInput(code) {
        if (this.currentEnv === 'python') {
            await runPythonCode(code);
        } else if (this.currentEnv === 'c++') {
            // C++需要完整文件编译，这里提示用户使用/run命令
            this.println('提示: C++环境需要使用 /run 命令运行完整文件', 'info-line');
        } else if (this.currentEnv === 'cmd') {
            runCmdCommand(code);
        }
    },

    setPrompt(text) {
        this.prompt.textContent = text;
    },

    updateEnvDisplay(envName) {
        document.getElementById('current-env').textContent = `当前环境: ${envName}`;
    }
};

// 初始化终端
window.addEventListener('load', () => {
    terminal.init();
});