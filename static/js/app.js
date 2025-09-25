// DevOps Developer Organizer - Frontend JavaScript

class DevOpsOrganizer {
    constructor() {
        this.currentTab = 'agents';
        this.init();
    }

    init() {
        this.bindEvents();
        this.loadSystemInfo();
        this.loadAgents();
    }

    bindEvents() {
        // Tab navigation
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const tabName = e.currentTarget.dataset.tab;
                this.switchTab(tabName);
            });
        });

        // Refresh buttons
        document.getElementById('refreshAgents')?.addEventListener('click', () => {
            this.loadAgents();
        });

        document.getElementById('refreshProjects')?.addEventListener('click', () => {
            this.loadProjects();
        });

        document.getElementById('refreshDocker')?.addEventListener('click', () => {
            this.loadDocker();
        });

        document.getElementById('refreshK3s')?.addEventListener('click', () => {
            this.loadK3s();
        });

        document.getElementById('refreshSSH')?.addEventListener('click', () => {
            this.loadSSH();
        });

        // AI Assistant buttons
        document.getElementById('sendMessage')?.addEventListener('click', () => {
            this.sendChatMessage();
        });

        document.getElementById('clearChat')?.addEventListener('click', () => {
            this.clearChat();
        });

        // Search button
        document.getElementById('searchBtn')?.addEventListener('click', () => {
            this.loadProjects();
        });

        // Enter key in custom path input
        document.getElementById('customPath')?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.loadProjects();
            }
        });

        // Enter key in chat input
        document.getElementById('chatInput')?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.sendChatMessage();
            }
        });
    }

    switchTab(tabName) {
        // Update active tab button
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');

        // Update active tab content
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });
        document.getElementById(tabName).classList.add('active');

        this.currentTab = tabName;

        // Load data for the new tab
        switch (tabName) {
            case 'agents':
                this.loadAgents();
                break;
            case 'projects':
                this.loadProjects();
                break;
            case 'docker':
                this.loadDocker();
                break;
            case 'k3s':
                this.loadK3s();
                break;
            case 'ssh':
                this.loadSSH();
                break;
            case 'ai':
                this.initAI();
                break;
        }
    }

    async loadSystemInfo() {
        try {
            const response = await fetch('/api/system/info');
            const data = await response.json();

            // Show aggregated stats from all agents
            if (data.length > 0) {
                const totalAgents = data.length;
                const onlineAgents = data.filter(item => item.agent && item.agent.status === 'online').length;
                
                document.getElementById('platform').textContent = `${totalAgents} Agents`;
                document.getElementById('cpu').textContent = `${onlineAgents} Online`;
                document.getElementById('memory').textContent = 'Multi-Host';
                document.getElementById('disk').textContent = 'Distributed';
            } else {
                document.getElementById('platform').textContent = 'No Agents';
                document.getElementById('cpu').textContent = '0 Online';
                document.getElementById('memory').textContent = 'N/A';
                document.getElementById('disk').textContent = 'N/A';
            }
        } catch (error) {
            console.error('Error loading system info:', error);
            document.getElementById('platform').textContent = 'Error';
            document.getElementById('cpu').textContent = 'N/A';
            document.getElementById('memory').textContent = 'N/A';
            document.getElementById('disk').textContent = 'N/A';
        }
    }

    async loadAgents() {
        const loading = document.getElementById('agentsLoading');
        const grid = document.getElementById('agentsGrid');
        const instructions = document.getElementById('agentInstructions');

        loading.style.display = 'block';
        grid.innerHTML = '';
        instructions.style.display = 'none';

        try {
            const response = await fetch('/api/agents');
            const agents = await response.json();

            loading.style.display = 'none';

            if (agents.length === 0) {
                instructions.style.display = 'block';
                grid.innerHTML = this.createEmptyState('server', 'No Agents Connected', 'Install agents on your machines to start monitoring.');
                return;
            }

            grid.innerHTML = agents.map(agent => this.createAgentCard(agent)).join('');
        } catch (error) {
            loading.style.display = 'none';
            grid.innerHTML = this.createErrorState('Error loading agents', error.message);
            console.error('Error loading agents:', error);
        }
    }

    async loadProjects() {
        const loading = document.getElementById('projectsLoading');
        const grid = document.getElementById('projectsGrid');
        const customPath = document.getElementById('customPath').value.trim();

        loading.style.display = 'block';
        grid.innerHTML = '';

        try {
            const url = customPath ? `/api/projects?path=${encodeURIComponent(customPath)}` : '/api/projects';
            const response = await fetch(url);
            const projects = await response.json();

            loading.style.display = 'none';

            if (projects.length === 0) {
                grid.innerHTML = this.createEmptyState('folder-open', 'No Projects Found', 'No Git repositories were found in the search directory.');
                return;
            }

            grid.innerHTML = projects.map(project => this.createProjectCard(project)).join('');
        } catch (error) {
            loading.style.display = 'none';
            grid.innerHTML = this.createErrorState('Error loading projects', error.message);
            console.error('Error loading projects:', error);
        }
    }

    async loadDocker() {
        const runningLoading = document.getElementById('dockerRunningLoading');
        const runningGrid = document.getElementById('runningContainers');
        const stoppedGrid = document.getElementById('stoppedContainers');
        const imagesGrid = document.getElementById('dockerImages');

        if (runningLoading) runningLoading.style.display = 'block';
        runningGrid.innerHTML = '';
        stoppedGrid.innerHTML = '';
        imagesGrid.innerHTML = '';

        try {
            // Load containers
            const containersResponse = await fetch('/api/docker/containers');
            const containersData = await containersResponse.json();

            if (runningLoading) runningLoading.style.display = 'none';

            // Running containers
            if (containersData.running.length === 0) {
                runningGrid.innerHTML = this.createEmptyState('play-circle', 'No Running Containers', 'No Docker containers are currently running.');
            } else {
                runningGrid.innerHTML = containersData.running.map(container => this.createContainerCard(container)).join('');
            }

            // Stopped containers
            if (containersData.stopped.length === 0) {
                stoppedGrid.innerHTML = this.createEmptyState('stop-circle', 'No Stopped Containers', 'No stopped Docker containers found.');
            } else {
                stoppedGrid.innerHTML = containersData.stopped.map(container => this.createContainerCard(container)).join('');
            }

            // Load images
            const imagesResponse = await fetch('/api/docker/images');
            const images = await imagesResponse.json();

            if (images.length === 0) {
                imagesGrid.innerHTML = this.createEmptyState('layer-group', 'No Docker Images', 'No Docker images found on the system.');
            } else {
                imagesGrid.innerHTML = images.map(image => this.createImageCard(image)).join('');
            }

        } catch (error) {
            if (runningLoading) runningLoading.style.display = 'none';
            runningGrid.innerHTML = this.createErrorState('Error loading Docker data', 'Make sure Docker is running and accessible.');
            console.error('Error loading Docker data:', error);
        }
    }

    async loadK3s() {
        const nodesLoading = document.getElementById('k3sNodesLoading');
        const podsLoading = document.getElementById('k3sPodsLoading');
        const nodesGrid = document.getElementById('k3sNodes');
        const podsGrid = document.getElementById('k3sPods');

        if (nodesLoading) nodesLoading.style.display = 'block';
        if (podsLoading) podsLoading.style.display = 'block';
        nodesGrid.innerHTML = '';
        podsGrid.innerHTML = '';

        try {
            // Load nodes
            const nodesResponse = await fetch('/api/k3s/nodes');
            const nodes = await nodesResponse.json();

            if (nodesLoading) nodesLoading.style.display = 'none';

            if (nodes.length === 0) {
                nodesGrid.innerHTML = this.createEmptyState('server', 'No Nodes Found', 'No Kubernetes nodes are available or cluster is not accessible.');
            } else {
                nodesGrid.innerHTML = nodes.map(node => this.createNodeCard(node)).join('');
            }

            // Load pods
            const podsResponse = await fetch('/api/k3s/pods');
            const pods = await podsResponse.json();

            if (podsLoading) podsLoading.style.display = 'none';

            if (pods.length === 0) {
                podsGrid.innerHTML = this.createEmptyState('cubes', 'No Active Pods', 'No running pods found in the cluster.');
            } else {
                podsGrid.innerHTML = pods.map(pod => this.createPodCard(pod)).join('');
            }

        } catch (error) {
            if (nodesLoading) nodesLoading.style.display = 'none';
            if (podsLoading) podsLoading.style.display = 'none';
            nodesGrid.innerHTML = this.createErrorState('Error loading K3s data', 'Make sure K3s is running and kubectl is configured.');
            console.error('Error loading K3s data:', error);
        }
    }

    async loadSSH() {
        const loading = document.getElementById('sshLoading');
        const grid = document.getElementById('sshKeys');

        loading.style.display = 'block';
        grid.innerHTML = '';

        try {
            const response = await fetch('/api/ssh/keys');
            const keys = await response.json();

            loading.style.display = 'none';

            if (keys.length === 0) {
                grid.innerHTML = this.createEmptyState('key', 'No SSH Keys Found', 'No SSH keys were found in the ~/.ssh directory.');
                return;
            }

            grid.innerHTML = keys.map(key => this.createSSHKeyCard(key)).join('');
        } catch (error) {
            loading.style.display = 'none';
            grid.innerHTML = this.createErrorState('Error loading SSH keys', error.message);
            console.error('Error loading SSH keys:', error);
        }
    }

    createAgentCard(agent) {
        const statusClass = {
            'online': 'status-online',
            'warning': 'status-warning',
            'offline': 'status-offline'
        }[agent.status] || 'status-unknown';

        const lastSeen = agent.last_seen ? new Date(agent.last_seen).toLocaleString() : 'Never';
        const capabilities = agent.capabilities || {};

        return `
            <div class="agent-card">
                <div class="card-header">
                    <div class="agent-info">
                        <div class="agent-name">
                            <i class="fas fa-server"></i>
                            ${agent.agent_name}
                        </div>
                        <div class="agent-hostname">${agent.hostname}</div>
                    </div>
                    <span class="status-badge ${statusClass}">${agent.status}</span>
                </div>
                <div class="agent-details">
                    <div class="detail-row">
                        <strong>Platform:</strong> ${agent.platform} ${agent.architecture}
                    </div>
                    <div class="detail-row">
                        <strong>Python:</strong> ${agent.python_version}
                    </div>
                    <div class="detail-row">
                        <strong>Last Seen:</strong> ${lastSeen}
                    </div>
                    <div class="detail-row">
                        <strong>Capabilities:</strong>
                        <div class="capabilities">
                            ${capabilities.projects ? '<span class="capability-badge enabled">Projects</span>' : '<span class="capability-badge disabled">Projects</span>'}
                            ${capabilities.docker ? '<span class="capability-badge enabled">Docker</span>' : '<span class="capability-badge disabled">Docker</span>'}
                            ${capabilities.k3s ? '<span class="capability-badge enabled">K3s</span>' : '<span class="capability-badge disabled">K3s</span>'}
                            ${capabilities.ssh ? '<span class="capability-badge enabled">SSH</span>' : '<span class="capability-badge disabled">SSH</span>'}
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    createProjectCard(project) {
        const types = project.project_type.map(type => 
            `<span class="type-badge">${type}</span>`
        ).join('');

        const libraries = project.libraries.length > 0 ? 
            `<div class="libraries">
                <div class="libraries-title">Libraries (${project.libraries.length}):</div>
                <div class="libraries-list">
                    ${project.libraries.slice(0, 5).map(lib => 
                        `<span class="library-badge">${lib}</span>`
                    ).join('')}
                    ${project.libraries.length > 5 ? '<span class="library-badge">...</span>' : ''}
                </div>
            </div>` : '';

        const agentInfo = project.agent_name ? 
            `<div class="agent-source">
                <i class="fas fa-server"></i>
                From: ${project.agent_name}
            </div>` : '';

        return `
            <div class="project-card">
                <div class="project-name">
                    <i class="fas fa-folder"></i>
                    ${project.name}
                </div>
                <div class="project-path">${project.path}</div>
                ${agentInfo}
                <div class="project-meta">
                    <div class="meta-item">
                        <i class="fas fa-weight-hanging"></i>
                        ${project.size} MB
                    </div>
                    <div class="meta-item">
                        <i class="fas fa-file"></i>
                        ${project.file_count} files
                    </div>
                    <div class="meta-item">
                        <i class="fas fa-code-branch"></i>
                        ${project.git_branch}
                    </div>
                    <div class="meta-item">
                        <i class="fas fa-circle ${project.has_venv ? 'text-success' : 'text-muted'}"></i>
                        ${project.has_venv ? 'Has venv' : 'No venv'}
                    </div>
                </div>
                <div class="project-types">
                    ${types}
                </div>
                ${libraries}
            </div>
        `;
    }

    createContainerCard(container) {
        const statusClass = container.status === 'running' ? 'status-running' : 'status-stopped';
        const ports = container.ports ? container.ports.map(port => 
            `<span class="port-badge">${port}</span>`
        ).join('') : '';

        return `
            <div class="container-card">
                <div class="card-header">
                    <div class="card-title">${container.name}</div>
                    <span class="status-badge ${statusClass}">${container.status}</span>
                </div>
                <div class="card-details">
                    <div><strong>ID:</strong> ${container.id}</div>
                    <div><strong>Image:</strong> ${container.image}</div>
                    ${ports ? `<div><strong>Ports:</strong><br><div class="ports-list">${ports}</div></div>` : ''}
                    <div><strong>Created:</strong> ${new Date(container.created).toLocaleDateString()}</div>
                </div>
            </div>
        `;
    }

    createImageCard(image) {
        const tags = image.tags.length > 0 ? image.tags.join(', ') : 'No tags';
        
        return `
            <div class="image-card">
                <div class="card-header">
                    <div class="card-title">${tags}</div>
                    <span class="status-badge status-ready">${image.size} MB</span>
                </div>
                <div class="card-details">
                    <div><strong>ID:</strong> ${image.id}</div>
                    <div><strong>Created:</strong> ${new Date(image.created).toLocaleDateString()}</div>
                </div>
            </div>
        `;
    }

    createNodeCard(node) {
        const statusClass = node.status === 'Ready' ? 'status-ready' : 'status-notready';
        const roles = node.roles.map(role => 
            `<span class="type-badge">${role}</span>`
        ).join('');

        return `
            <div class="node-card">
                <div class="card-header">
                    <div class="card-title">${node.name}</div>
                    <span class="status-badge ${statusClass}">${node.status}</span>
                </div>
                <div class="card-details">
                    <div><strong>Roles:</strong><br>${roles}</div>
                    <div><strong>Version:</strong> ${node.version}</div>
                    <div><strong>OS:</strong> ${node.os}</div>
                </div>
            </div>
        `;
    }

    createPodCard(pod) {
        return `
            <div class="pod-card">
                <div class="card-header">
                    <div class="card-title">${pod.name}</div>
                    <span class="status-badge status-running">${pod.status}</span>
                </div>
                <div class="card-details">
                    <div><strong>Namespace:</strong> ${pod.namespace}</div>
                    <div><strong>Node:</strong> ${pod.node || 'N/A'}</div>
                    <div><strong>Containers:</strong> ${pod.containers}</div>
                    <div><strong>Restarts:</strong> ${pod.restarts}</div>
                </div>
            </div>
        `;
    }

    createSSHKeyCard(key) {
        const sizeKB = Math.round(key.size / 1024);
        const modifiedDate = new Date(key.modified * 1000).toLocaleDateString();

        return `
            <div class="ssh-key-card">
                <div class="key-name">
                    <i class="fas fa-key"></i>
                    ${key.name}
                    <span class="key-type">${key.type}</span>
                </div>
                <div class="key-details">
                    <div><strong>Path:</strong> ${key.path}</div>
                    <div><strong>Size:</strong> ${sizeKB} KB</div>
                    <div><strong>Has Public Key:</strong> ${key.has_public ? 'Yes' : 'No'}</div>
                    <div><strong>Modified:</strong> ${modifiedDate}</div>
                </div>
            </div>
        `;
    }

    createEmptyState(icon, title, message) {
        return `
            <div class="empty-state">
                <i class="fas fa-${icon}"></i>
                <h3>${title}</h3>
                <p>${message}</p>
            </div>
        `;
    }

    createErrorState(title, message) {
        return `
            <div class="error-state">
                <i class="fas fa-exclamation-triangle"></i>
                <h3>${title}</h3>
                <p>${message}</p>
            </div>
        `;
    }

    // AI Assistant Methods
    async initAI() {
        this.checkLLMStatus();
    }

    async checkLLMStatus() {
        const statusIndicator = document.getElementById('llmStatus');
        const statusText = document.getElementById('llmStatusText');
        const sendButton = document.getElementById('sendMessage');
        const chatInput = document.getElementById('chatInput');
        
        statusIndicator.className = 'fas fa-circle checking';
        statusText.textContent = 'Checking LLM connection...';

        try {
            const response = await fetch('/api/ai/status');
            const data = await response.json();
            
            if (data.status === 'online') {
                statusIndicator.className = 'fas fa-circle online';
                statusText.textContent = 'AI Assistant ready';
                if (sendButton) sendButton.disabled = false;
                if (chatInput) {
                    chatInput.disabled = false;
                    chatInput.placeholder = 'Ask me about your infrastructure...';
                }
            } else {
                statusIndicator.className = 'fas fa-circle offline';
                statusText.textContent = 'AI Assistant unavailable - Docker Model not enabled';
                if (sendButton) sendButton.disabled = true;
                if (chatInput) {
                    chatInput.disabled = true;
                    chatInput.placeholder = 'AI Assistant unavailable - enable Docker Model to chat';
                }
                this.showLLMUnavailableMessage();
            }
        } catch (error) {
            statusIndicator.className = 'fas fa-circle offline';
            statusText.textContent = 'AI Assistant offline';
            if (sendButton) sendButton.disabled = true;
            if (chatInput) {
                chatInput.disabled = true;
                chatInput.placeholder = 'AI Assistant offline';
            }
            this.showLLMUnavailableMessage();
        }
    }

    showLLMUnavailableMessage() {
        const chatMessages = document.getElementById('chatMessages');
        const existingUnavailable = document.getElementById('llmUnavailableMessage');
        
        if (existingUnavailable) return; // Don't show multiple times
        
        const unavailableHtml = `
            <div class="message-bubble ai-message" id="llmUnavailableMessage">
                <div class="message-content">
                    <i class="fas fa-exclamation-triangle"></i>
                    <div class="message-text" style="background: #fff3cd; color: #856404; border: 1px solid #ffeaa7;">
                        <strong>AI Assistant Currently Unavailable</strong><br>
                        The AI Assistant requires Docker Model to be enabled. To activate this feature:
                        <ol style="margin: 10px 0; padding-left: 20px;">
                            <li>Update Docker Desktop to the latest version</li>
                            <li>Enable Docker Model in Docker Desktop settings</li>
                            <li>Restart the server with <code>./start-server.sh</code></li>
                        </ol>
                        The rest of the monitoring features work normally without AI.
                    </div>
                </div>
            </div>
        `;
        
        chatMessages.insertAdjacentHTML('beforeend', unavailableHtml);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    async sendChatMessage() {
        const input = document.getElementById('chatInput');
        const message = input.value.trim();
        
        if (!message) return;

        // Add user message to chat
        this.addMessage(message, 'user');
        input.value = '';

        // Show typing indicator
        this.showTypingIndicator();

        try {
            const response = await fetch('/api/ai/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ message: message })
            });

            const data = await response.json();
            
            // Remove typing indicator
            this.hideTypingIndicator();

            if (data.success) {
                this.addMessage(data.response, 'ai');
            } else {
                this.addMessage('Sorry, I encountered an error: ' + (data.error || 'Unknown error'), 'ai', true);
            }
        } catch (error) {
            this.hideTypingIndicator();
            this.addMessage('Sorry, I cannot connect to the AI service right now.', 'ai', true);
            console.error('Chat error:', error);
        }
    }

    addMessage(text, sender, isError = false) {
        const chatMessages = document.getElementById('chatMessages');
        const messageClass = sender === 'user' ? 'user-message' : 'ai-message';
        const icon = sender === 'user' ? 'fas fa-user' : 'fas fa-robot';
        const errorClass = isError ? ' error-message' : '';

        const messageHtml = `
            <div class="message-bubble ${messageClass}${errorClass}">
                <div class="message-content">
                    <i class="${icon}"></i>
                    <div class="message-text">${this.formatMessage(text)}</div>
                </div>
            </div>
        `;

        chatMessages.insertAdjacentHTML('beforeend', messageHtml);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    formatMessage(text) {
        // Basic formatting for AI responses
        return text
            .replace(/\n/g, '<br>')
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>');
    }

    showTypingIndicator() {
        const chatMessages = document.getElementById('chatMessages');
        const typingHtml = `
            <div class="typing-indicator" id="typingIndicator">
                <i class="fas fa-robot"></i>
                <span>AI is thinking</span>
                <div class="typing-dots">
                    <div class="typing-dot"></div>
                    <div class="typing-dot"></div>
                    <div class="typing-dot"></div>
                </div>
            </div>
        `;
        chatMessages.insertAdjacentHTML('beforeend', typingHtml);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    hideTypingIndicator() {
        const indicator = document.getElementById('typingIndicator');
        if (indicator) {
            indicator.remove();
        }
    }

    clearChat() {
        const chatMessages = document.getElementById('chatMessages');
        // Keep only the welcome message
        const welcomeMessage = chatMessages.querySelector('.welcome-message');
        chatMessages.innerHTML = '';
        if (welcomeMessage) {
            chatMessages.appendChild(welcomeMessage);
        }
    }
}

// Initialize the application when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new DevOpsOrganizer();
});
