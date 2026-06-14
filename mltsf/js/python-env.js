let pyodide = null;

async function initPythonEnv() {
    if (pyodide) return;

    pyodide = await loadPyodide({
        indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.26.2/full/',
        fullStdLib: true
    });

    // 重定向标准输出
    pyodide.runPython(`
        import sys
        from io import StringIO

        class StdoutRedirector:
            def __init__(self):
                self.buffer = StringIO()
            
            def write(self, s):
                self.buffer.write(s)
                if '\\n' in s:
                    self.flush()
            
            def flush(self):
                content = self.buffer.getvalue()
                if content:
                    import js
                    js.terminal.println(content.rstrip('\\n'))
                    self.buffer = StringIO()

        class StderrRedirector:
            def __init__(self):
                self.buffer = StringIO()
            
            def write(self, s):
                self.buffer.write(s)
                if '\\n' in s:
                    self.flush()
            
            def flush(self):
                content = self.buffer.getvalue()
                if content:
                    import js
                    js.terminal.println(content.rstrip('\\n'), 'error-line')
                    self.buffer = StringIO()

        sys.stdout = StdoutRedirector()
        sys.stderr = StderrRedirector()
    `);

    // 重写 input 函数：调用浏览器原生 prompt() 实现交互输入
    pyodide.runPython(`
        import js
        __builtins__.input = lambda prompt="": js.prompt(prompt) or ""
    `);
}

async function runPythonCode(code, isFile = false) {
    if (!pyodide) {
        throw new Error('Python环境未初始化');
    }

    try {
        if (isFile) {
            // 运行完整文件
            await pyodide.runPythonAsync(code);
        } else {
            // 交互式运行
            if (code.trim().endsWith(':') || /^(def |class |for |while |if |elif |else|try |except |with |async |await )/.test(code.trimStart())) {
                // 多行代码块：启动收集模式，不阻塞主循环
                const lines = [code];
                terminal.println('... (输入空行后执行, Ctrl+C 取消)', 'info-line');
                const collector = (e) => {
                    if (e.key === 'Enter') {
                        const nextLine = terminal.input.value;
                        terminal.input.value = '';
                        if (nextLine.trim() === '') {
                            // 空行：执行收集的多行代码
                            terminal.input.removeEventListener('keydown', collector);
                            terminal.isMultiLineCollecting = false;
                            pyodide.runPythonAsync(lines.join('\n')).catch(err => {
                                terminal.println(err.message, 'error-line');
                            });
                        } else {
                            lines.push(nextLine);
                            terminal.println('... ', 'info-line');
                        }
                        e.stopImmediatePropagation();
                    } else if (e.key === 'Escape') {
                        terminal.input.removeEventListener('keydown', collector);
                        terminal.isMultiLineCollecting = false;
                        terminal.println('已取消多行输入', 'info-line');
                        e.stopImmediatePropagation();
                    }
                };
                terminal.isMultiLineCollecting = true;
                terminal.input.addEventListener('keydown', collector);
            } else {
                await pyodide.runPythonAsync(code);
            }
        }
    } catch (error) {
        terminal.println(error.message, 'error-line');
    }
}

async function installPythonPackage(packageName) {
    if (!pyodide) {
        throw new Error('Python环境未初始化');
    }

    await pyodide.loadPackage(['micropip']);
    const micropip = pyodide.pyimport('micropip');
    await micropip.install(packageName);
}
