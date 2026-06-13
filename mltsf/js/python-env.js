let pyodide = null;
let pythonInputBuffer = [];

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

    // 重定向input函数
    pyodide.runPython(`
        import sys
        original_input = __builtins__.input

        def custom_input(prompt=''):
            import js
            if prompt:
                js.terminal.print(prompt)
            # 这里需要同步获取用户输入，我们使用一个特殊的方法
            # 在实际实现中，这需要更复杂的异步处理
            return ''

        __builtins__.input = custom_input
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
            if (code.strip().endswith(':') || code.strip().startswith('def ') || code.strip().startswith('class ')) {
                // 多行代码块，需要收集更多输入
                terminal.println('... ', 'info-line');
                // 这里需要实现多行输入收集逻辑
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