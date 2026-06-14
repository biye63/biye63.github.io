let projects = {};

function loadProjects() {
    const saved = localStorage.getItem('mltsf-projects');
    if (saved) {
        projects = JSON.parse(saved);
    }
}

function saveProjects() {
    localStorage.setItem('mltsf-projects', JSON.stringify(projects));
}

function createProject(name) {
    if (projects[name]) {
        terminal.println(`错误: 项目 '${name}' 已存在`, 'error-line');
        return;
    }

    projects[name] = {
        name: name,
        files: {},
        createdAt: new Date().toISOString()
    };

    saveProjects();
    terminal.currentProject = name;
    terminal.println(`成功创建项目 '${name}'`, 'success-line');
    terminal.println(`已自动切换到项目 '${name}'`, 'info-line');
}

function deleteProject(name) {
    if (!projects[name]) {
        terminal.println(`错误: 项目 '${name}' 不存在`, 'error-line');
        return;
    }

    delete projects[name];
    saveProjects();

    if (terminal.currentProject === name) {
        terminal.currentProject = null;
        terminal.println(`已删除当前项目`, 'info-line');
    }

    terminal.println(`成功删除项目 '${name}'`, 'success-line');
}

function deleteAllProjects() {
    projects = {};
    saveProjects();
    terminal.currentProject = null;
    terminal.println('已删除所有项目', 'success-line');
}

function createFile(name) {
    const project = projects[terminal.currentProject];
    
    if (project.files[name]) {
        terminal.println(`错误: 文件 '${name}' 已存在`, 'error-line');
        return;
    }

    project.files[name] = '';
    saveProjects();
    terminal.println(`成功创建文件 '${name}'`, 'success-line');
    terminal.println('提示: 使用 /run ' + name + ' 运行此文件', 'info-line');
}

function deleteFile(name) {
    const project = projects[terminal.currentProject];
    
    if (!project.files[name]) {
        terminal.println(`错误: 文件 '${name}' 不存在`, 'error-line');
        return;
    }

    delete project.files[name];
    saveProjects();
    terminal.println(`成功删除文件 '${name}'`, 'success-line');
}

function deleteAllFiles() {
    const project = projects[terminal.currentProject];
    project.files = {};
    saveProjects();
    terminal.println('已删除当前项目中的所有文件', 'success-line');
}

function exportProject(args) {
    let projectName = args[0];
    
    if (!projectName && !terminal.currentProject) {
        terminal.println('错误: 请指定要导出的项目名', 'error-line');
        return;
    }

    if (!projectName) {
        projectName = terminal.currentProject;
    }

    if (!projects[projectName]) {
        terminal.println(`错误: 项目 '${projectName}' 不存在`, 'error-line');
        return;
    }

    const project = projects[projectName];
    let content = `# MLTSF 项目导出: ${projectName}\n`;
    content += `# 创建时间: ${project.createdAt}\n\n`;

    for (const [fileName, fileContent] of Object.entries(project.files)) {
        content += `══════════════════════════════════════════════════════════\n`;
        content += `# 文件: ${fileName}\n`;
        content += `══════════════════════════════════════════════════════════\n`;
        content += fileContent + '\n\n';
    }

    // 创建下载链接
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${projectName}.txt`;
    a.click();
    URL.revokeObjectURL(url);

    terminal.println(`成功导出项目 '${projectName}'`, 'success-line');
}

// 初始化时加载保存的项目
window.addEventListener('load', loadProjects);