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