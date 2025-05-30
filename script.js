// AI Chat Interface - Enhanced Version
class AIChatInterface {
    constructor() {
        this.currentChatId = null;
        this.chats = new Map();
        this.uploadedFiles = [];
        this.currentArtifact = null;
        this.artifactZoomLevel = 1;
        this.isTyping = false;

        // Settings with defaults
        this.settings = {
            webhookUrl: '',
            apiKey: '',
            modelName: 'gpt-4',
            enableStreaming: false,
            maxTokens: 2048,
            temperature: 0.7
        };

        // Artifact types
        this.artifactTypes = {
            CODE: 'code',
            IMAGE: 'image',
            VIDEO: 'video',
            AUDIO: 'audio',
            HTML: 'html',
            CANVAS: 'canvas'
        };

        this.initElements();
        this.initMarkdown();
        this.bindEvents();
        this.loadSettings();
        this.loadChats();
        this.createNewChat();
        this.updateSidebarToggle();
    }

    initElements() {
        // Sidebar elements
        this.sidebar = document.getElementById('sidebar');
        this.toggleSidebarBtn = document.getElementById('toggleSidebar');
        this.sidebarToggleMobile = document.getElementById('sidebarToggleMobile');
        this.sidebarToggleDesktop = document.getElementById('sidebarToggleDesktop');
        this.newChatBtn = document.getElementById('newChatBtn');
        this.chatHistory = document.getElementById('chatHistory');
        this.settingsBtn = document.getElementById('settingsBtn');

        // Chat elements
        this.chatContainer = document.getElementById('chatContainer');
        this.chatMessages = document.getElementById('chatMessages');
        this.chatTitle = document.getElementById('chatTitle');
        this.clearChatBtn = document.getElementById('clearChatBtn');
        this.messageInput = document.getElementById('messageInput');
        this.sendBtn = document.getElementById('sendBtn');
        this.fileInput = document.getElementById('fileInput');
        this.uploadedFilesContainer = document.getElementById('uploadedFiles');
        this.fileUploadArea = document.getElementById('fileUploadArea');
        this.typingIndicator = document.getElementById('typingIndicator');

        // Artifacts elements
        this.artifactsPanel = document.getElementById('artifactsPanel');
        this.artifactTitle = document.getElementById('artifactTitle');
        this.closeArtifactsBtn = document.getElementById('closeArtifactsBtn');
        this.fullscreenBtn = document.getElementById('fullscreenBtn');

        // Tab elements
        this.previewTab = document.getElementById('previewTab');
        this.codeTab = document.getElementById('codeTab');
        this.playgroundTab = document.getElementById('playgroundTab');
        this.previewContent = document.getElementById('previewContent');
        this.codeContent = document.getElementById('codeContent');
        this.playgroundContent = document.getElementById('playgroundContent');

        // Preview elements
        this.previewFrame = document.getElementById('previewFrame');
        this.imagePreview = document.getElementById('imagePreview');
        this.artifactImage = document.getElementById('artifactImage');
        this.mediaPreview = document.getElementById('mediaPreview');
        this.mediaPlayer = document.getElementById('mediaPlayer');
        this.audioPlayer = document.getElementById('audioPlayer');

        // Code elements
        this.codeEditor = document.getElementById('codeEditor');
        this.languageSelect = document.getElementById('languageSelect');
        this.copyCodeBtn = document.getElementById('copyCodeBtn');
        this.downloadBtn = document.getElementById('downloadBtn');

        // Playground elements
        this.htmlEditor = document.getElementById('htmlEditor');
        this.cssEditor = document.getElementById('cssEditor');
        this.jsEditor = document.getElementById('jsEditor');
        this.tsEditor = document.getElementById('tsEditor');
        this.playgroundFrame = document.getElementById('playgroundFrame');
        this.runCodeBtn = document.getElementById('runCodeBtn');
        this.clearPlaygroundBtn = document.getElementById('clearPlaygroundBtn');

        // Image controls
        this.zoomInBtn = document.getElementById('zoomInBtn');
        this.zoomOutBtn = document.getElementById('zoomOutBtn');
        this.resetZoomBtn = document.getElementById('resetZoomBtn');

        // Modal elements
        this.settingsModal = document.getElementById('settingsModal');
        this.closeSettingsModal = document.getElementById('closeSettingsModal');
        this.webhookUrlInput = document.getElementById('webhookUrl');
        this.apiKeyInput = document.getElementById('apiKey');
        this.modelNameInput = document.getElementById('modelName');
        this.enableStreamingInput = document.getElementById('enableStreaming');
        this.maxTokensInput = document.getElementById('maxTokens');
        this.temperatureInput = document.getElementById('temperature');
        this.temperatureValue = document.getElementById('temperatureValue');
        this.saveSettingsBtn = document.getElementById('saveSettingsBtn');
        this.cancelSettingsBtn = document.getElementById('cancelSettingsBtn');

        // Toast container
        this.toastContainer = document.getElementById('toastContainer');
    }

    initMarkdown() {
        marked.setOptions({
            renderer: new marked.Renderer(),
            highlight: function(code, lang) {
                if (Prism.languages[lang]) {
                    return Prism.highlight(code, Prism.languages[lang], lang);
                }
                return code;
            },
            langPrefix: 'language-',
            pedantic: false,
            gfm: true,
            breaks: true,
            sanitize: false,
            smartypants: false,
            xhtml: false
        });
    }

    bindEvents() {
        // Sidebar events
        this.toggleSidebarBtn?.addEventListener('click', () => this.closeSidebar());
        this.sidebarToggleMobile?.addEventListener('click', () => this.toggleSidebarMobile());
        this.sidebarToggleDesktop?.addEventListener('click', () => this.openSidebar());
        this.newChatBtn?.addEventListener('click', () => this.createNewChat());
        this.settingsBtn?.addEventListener('click', () => this.openSettings());
        this.clearChatBtn?.addEventListener('click', () => this.clearCurrentChat());

        // Input events
        this.messageInput?.addEventListener('input', (e) => this.handleInputChange(e));
        this.messageInput?.addEventListener('keydown', (e) => this.handleKeyDown(e));
        this.sendBtn?.addEventListener('click', () => this.sendMessage());
        this.fileInput?.addEventListener('change', (e) => this.handleFileUpload(e));

        // Artifacts events
        this.closeArtifactsBtn?.addEventListener('click', () => this.closeArtifacts());
        this.fullscreenBtn?.addEventListener('click', () => this.toggleFullscreen());

        // Tab events
        this.previewTab?.addEventListener('click', () => this.switchTab('preview'));
        this.codeTab?.addEventListener('click', () => this.switchTab('code'));
        this.playgroundTab?.addEventListener('click', () => this.switchTab('playground'));

        // Code events
        this.copyCodeBtn?.addEventListener('click', () => this.copyCode());
        this.downloadBtn?.addEventListener('click', () => this.downloadArtifact());
        this.languageSelect?.addEventListener('change', () => this.updateCodeHighlighting());

        // Playground events
        document.querySelectorAll('.playground-tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const lang = e.target.dataset.lang;
                this.switchPlaygroundTab(lang);
            });
        });
        this.runCodeBtn?.addEventListener('click', () => this.runPlaygroundCode());
        this.clearPlaygroundBtn?.addEventListener('click', () => this.clearPlayground());

        // Image events
        this.zoomInBtn?.addEventListener('click', () => this.zoomImage(0.2));
        this.zoomOutBtn?.addEventListener('click', () => this.zoomImage(-0.2));
        this.resetZoomBtn?.addEventListener('click', () => this.resetZoom());

        // Modal events
        this.closeSettingsModal?.addEventListener('click', () => this.closeSettings());
        this.saveSettingsBtn?.addEventListener('click', () => this.saveSettings());
        this.cancelSettingsBtn?.addEventListener('click', () => this.closeSettings());
        this.temperatureInput?.addEventListener('input', (e) => {
            this.temperatureValue.textContent = e.target.value;
        });

        // Click outside modal to close
        this.settingsModal?.addEventListener('click', (e) => {
            if (e.target === this.settingsModal) {
                this.closeSettings();
            }
        });

        // Click outside sidebar on mobile to close
        document.addEventListener('click', (e) => {
            if (window.innerWidth <= 768 &&
                this.sidebar?.classList.contains('open') &&
                !this.sidebar.contains(e.target) &&
                !this.sidebarToggleMobile?.contains(e.target)) {
                this.closeSidebar();
            }
        });

        // Delegate artifact events
        this.chatMessages?.addEventListener('click', (e) => this.handleArtifactClick(e));

        // Resize textarea automatically
        this.messageInput?.addEventListener('input', () => this.autoResizeTextarea());

        // Window resize handler
        window.addEventListener('resize', () => this.handleResize());
    }

    // Sidebar Management - UPDATED
    openSidebar() {
        if (!this.sidebar) return;

        this.sidebar.classList.remove('collapsed');
        if (window.innerWidth <= 768) {
            this.sidebar.classList.add('open');
        }
        this.updateSidebarToggle();
    }

    closeSidebar() {
        if (!this.sidebar) return;

        if (window.innerWidth <= 768) {
            this.sidebar.classList.remove('open');
        } else {
            this.sidebar.classList.add('collapsed');
        }
        this.updateSidebarToggle();
    }

    toggleSidebarMobile() {
        if (!this.sidebar) return;

        if (this.sidebar.classList.contains('open')) {
            this.closeSidebar();
        } else {
            this.openSidebar();
        }
    }

    updateSidebarToggle() {
        if (!this.sidebarToggleDesktop) return;

        if (window.innerWidth > 768) {
            // Desktop
            const isCollapsed = this.sidebar?.classList.contains('collapsed');
            if (isCollapsed) {
                this.sidebarToggleDesktop.classList.add('visible');
            } else {
                this.sidebarToggleDesktop.classList.remove('visible');
            }
        } else {
            // Mobile - hide desktop toggle
            this.sidebarToggleDesktop.classList.remove('visible');
        }
    }

    handleResize() {
        this.updateSidebarToggle();

        // Handle window resize events
        if (window.innerWidth <= 768) {
            // On mobile, ensure sidebar is properly positioned
            if (this.sidebar?.classList.contains('collapsed')) {
                this.sidebar.classList.remove('collapsed');
                this.sidebar.classList.remove('open');
            }
        } else {
            // On desktop, remove mobile classes
            if (this.sidebar?.classList.contains('open')) {
                this.sidebar.classList.remove('open');
            }
        }
    }

    // Chat Management
    createNewChat() {
        const chatId = 'chat_' + Date.now();
        const chat = {
            id: chatId,
            title: 'Новый чат',
            messages: [],
            createdAt: new Date(),
            updatedAt: new Date()
        };

        this.chats.set(chatId, chat);
        this.currentChatId = chatId;
        this.saveChats();
        this.updateChatHistory();
        this.loadChatMessages();
    }

    switchChat(chatId) {
        if (this.chats.has(chatId)) {
            this.currentChatId = chatId;
            this.updateChatHistory();
            this.loadChatMessages();
            this.updateChatTitle();
        }
    }

    clearCurrentChat() {
        if (!this.currentChatId) return;

        const chat = this.chats.get(this.currentChatId);
        if (chat) {
            chat.messages = [];
            chat.title = 'Новый чат';
            chat.updatedAt = new Date();
            this.saveChats();
            this.loadChatMessages();
            this.updateChatTitle();
            this.closeArtifacts();
        }
    }

    deleteChat(chatId) {
        if (this.chats.size <= 1) {
            this.showToast('Нельзя удалить последний чат', 'warning');
            return;
        }

        this.chats.delete(chatId);

        if (chatId === this.currentChatId) {
            // Switch to the most recent chat
            const remainingChats = Array.from(this.chats.values())
                .sort((a, b) => b.updatedAt - a.updatedAt);

            if (remainingChats.length > 0) {
                this.currentChatId = remainingChats[0].id;
            } else {
                this.createNewChat();
                return;
            }
        }

        this.saveChats();
        this.updateChatHistory();
        this.loadChatMessages();
    }

    updateChatHistory() {
        if (!this.chatHistory) return;

        this.chatHistory.innerHTML = '';

        const chats = Array.from(this.chats.values())
            .sort((a, b) => b.updatedAt - a.updatedAt);

        chats.forEach(chat => {
            const item = document.createElement('div');
            item.className = 'chat-history-item';
            if (chat.id === this.currentChatId) {
                item.classList.add('active');
            }

            item.innerHTML = `
                <div class="chat-item-content" onclick="chatInterface.switchChat('${chat.id}')">
                    <span class="chat-title">${this.escapeHtml(chat.title)}</span>
                    <small class="chat-date">${this.formatDate(chat.updatedAt)}</small>
                </div>
                <button class="delete-chat-btn" onclick="chatInterface.deleteChat('${chat.id}')" title="Удалить чат">
                    <i class="fas fa-trash"></i>
                </button>
            `;

            this.chatHistory.appendChild(item);
        });
    }

    updateChatTitle() {
        if (!this.currentChatId || !this.chatTitle) return;

        const chat = this.chats.get(this.currentChatId);
        if (chat) {
            this.chatTitle.textContent = chat.title;
        }
    }

    loadChatMessages() {
        if (!this.currentChatId || !this.chatMessages) return;

        const chat = this.chats.get(this.currentChatId);
        if (!chat) return;

        this.chatMessages.innerHTML = '';
        this.uploadedFiles = [];
        this.updateUploadedFiles();

        if (chat.messages.length === 0) {
            this.showWelcomeMessage();
            return;
        }

        chat.messages.forEach(message => {
            this.displayMessage(message, false);
        });

        this.scrollToBottom();
    }

    showWelcomeMessage() {
        if (!this.chatMessages) return;

        this.chatMessages.innerHTML = `
            <div class="welcome-message">
                <div class="welcome-icon">
                    <i class="fas fa-robot"></i>
                </div>
                <h2>Добро пожаловать в AI Assistant</h2>
                <p>Я могу помочь вам с кодом, анализом файлов, созданием контента и многим другим. Начните диалог!</p>
                <div class="feature-highlights">
                    <div class="feature">
                        <i class="fas fa-file-upload"></i>
                        <span>Загрузка файлов</span>
                    </div>
                    <div class="feature">
                        <i class="fas fa-code"></i>
                        <span>Выполнение кода</span>
                    </div>
                    <div class="feature">
                        <i class="fas fa-paint-brush"></i>
                        <span>Артефакты</span>
                    </div>
                    <div class="feature">
                        <i class="fas fa-brain"></i>
                        <span>AI анализ</span>
                    </div>
                </div>
            </div>
        `;
    }

    // Message handling
    async sendMessage() {
        const text = this.messageInput?.value.trim();
        if (!text && this.uploadedFiles.length === 0) return;

        if (!this.settings.webhookUrl) {
            this.showToast('Пожалуйста, настройте Webhook URL в настройках', 'error');
            this.openSettings();
            return;
        }

        const message = {
            id: this.generateId(),
            type: 'user',
            content: text || '',
            files: [...this.uploadedFiles],
            timestamp: new Date()
        };

        // Add to chat and display
        this.addMessageToChat(message);
        this.displayMessage(message);

        // Clear input
        this.clearInput();

        // Check if user message contains artifacts
        this.checkMessageForArtifacts(message);

        // Show typing and send to API
        this.showTypingIndicator();

        try {
            const response = await this.sendToAPI();
            this.hideTypingIndicator();

            if (response?.content) {
                const assistantMessage = {
                    id: this.generateId(),
                    type: 'assistant',
                    content: response.content,
                    timestamp: new Date()
                };

                this.addMessageToChat(assistantMessage);
                this.displayMessage(assistantMessage);
                this.checkMessageForArtifacts(assistantMessage);
            }
        } catch (error) {
            this.hideTypingIndicator();
            this.showToast('Ошибка при отправке сообщения: ' + error.message, 'error');
        }

        this.scrollToBottom();
        this.messageInput?.focus();
    }

    async sendToAPI() {
        const chat = this.chats.get(this.currentChatId);
        if (!chat) throw new Error('Chat not found');

        const messages = chat.messages.map(msg => ({
            role: msg.type === 'user' ? 'user' : 'assistant',
            content: msg.content
        }));

        const payload = {
            model: this.settings.modelName,
            messages: messages,
            max_tokens: this.settings.maxTokens,
            temperature: this.settings.temperature,
            stream: this.settings.enableStreaming
        };

        const headers = {
            'Content-Type': 'application/json'
        };

        if (this.settings.apiKey) {
            headers['Authorization'] = `Bearer ${this.settings.apiKey}`;
        }

        const response = await fetch(this.settings.webhookUrl, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();

        // Handle different response formats
        if (data.choices && data.choices[0]?.message?.content) {
            return { content: data.choices[0].message.content };
        } else if (data.content) {
            return { content: data.content };
        } else if (data.message) {
            return { content: data.message };
        } else {
            throw new Error('Invalid response format');
        }
    }

    displayMessage(message, animate = true) {
        if (!this.chatMessages) return;

        const messageElement = document.createElement('div');
        messageElement.className = `message ${message.type}`;
        messageElement.dataset.messageId = message.id;

        if (animate) {
            messageElement.style.opacity = '0';
            messageElement.style.transform = 'translateY(20px)';
        }

        const avatar = document.createElement('div');
        avatar.className = 'message-avatar';
        avatar.innerHTML = message.type === 'user'
                           ? '<i class="fas fa-user"></i>'
                           : '<i class="fas fa-robot"></i>';

        const content = document.createElement('div');
        content.className = 'message-content';

        // Add files if present
        if (message.files && message.files.length > 0) {
            const filesContainer = document.createElement('div');
            filesContainer.className = 'message-files';

            message.files.forEach(file => {
                const fileElement = document.createElement('div');
                fileElement.className = 'file-preview';
                fileElement.innerHTML = `
                    <i class="fas fa-${this.getFileIcon(file.type)} file-icon"></i>
                    <span>${this.escapeHtml(file.name)}</span>
                `;
                filesContainer.appendChild(fileElement);
            });

            content.appendChild(filesContainer);
        }

        // Add text content with markdown and artifact detection
        if (message.content) {
            const textContainer = document.createElement('div');
            textContainer.className = 'message-text';

            const processedContent = this.processMessageContent(message.content);
            textContainer.innerHTML = processedContent;

            content.appendChild(textContainer);
        }

        messageElement.appendChild(avatar);
        messageElement.appendChild(content);
        this.chatMessages.appendChild(messageElement);

        if (animate) {
            requestAnimationFrame(() => {
                messageElement.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
                messageElement.style.opacity = '1';
                messageElement.style.transform = 'translateY(0)';
            });
        }

        // Update syntax highlighting
        this.highlightCode(messageElement);
    }

    processMessageContent(content) {
        // Detect artifacts BEFORE processing markdown
        const artifacts = this.detectArtifacts(content);

        // Create a map to store placeholders for artifacts
        const artifactPlaceholders = new Map();

        // Replace code blocks with placeholders before markdown processing
        let processedContent = content;
        artifacts.forEach((artifact, index) => {
            const placeholder = `__ARTIFACT_PLACEHOLDER_${index}__`;
            const codeBlockPattern = new RegExp(`\`\`\`${artifact.language ? artifact.language + '\\s*\\n' : '[\\w]*\\s*\\n'}?${this.escapeRegex(artifact.code)}\`\`\``, 'g');
            processedContent = processedContent.replace(codeBlockPattern, placeholder);
            artifactPlaceholders.set(placeholder, artifact);
        });

        // Process markdown
        let html = marked.parse(processedContent);

        // Replace placeholders with artifact containers
        artifactPlaceholders.forEach((artifact, placeholder) => {
            const artifactId = `artifact-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
            const container = this.createArtifactContainer(artifact, artifactId);
            html = html.replace(placeholder, container);
        });

        return html;
    }

    detectArtifacts(content) {
        const artifacts = [];

        // Enhanced regex to better handle code blocks
        const codeBlockRegex = /```(\w+)?\s*\n?([\s\S]*?)```/g;
        let match;

        while ((match = codeBlockRegex.exec(content)) !== null) {
            const language = match[1] || 'plaintext';
            const code = match[2].trim();

            if (this.isArtifactWorthy(code, language)) {
                artifacts.push({
                    type: this.getArtifactType(language, code),
                    language: language,
                    code: code,
                    title: this.generateArtifactTitle(language, code)
                });
            }
        }

        return artifacts;
    }

    isArtifactWorthy(code, language) {
        // More lenient criteria for artifacts
        const minLength = 20; // Reduced minimum code length

        if (code.length < minLength) return false;

        // Always create artifacts for web technologies
        if (['html', 'css', 'javascript', 'js', 'typescript', 'ts', 'jsx', 'tsx'].includes(language.toLowerCase())) {
            return true;
        }

        // Always create artifacts for common programming languages
        if (['python', 'java', 'cpp', 'c', 'php', 'ruby', 'go', 'rust', 'swift', 'kotlin'].includes(language.toLowerCase())) {
            return true;
        }

        // Always create artifacts for markup and data formats
        if (['xml', 'json', 'yaml', 'yml', 'sql', 'markdown', 'md'].includes(language.toLowerCase())) {
            return true;
        }

        // For unknown languages, check for meaningful content
        return code.includes('\n') && code.trim().length > minLength;
    }

    getArtifactType(language, code) {
        const lang = language.toLowerCase();

        if (lang === 'html' || code.includes('<html>') || code.includes('<!DOCTYPE')) {
            return this.artifactTypes.HTML;
        }

        return this.artifactTypes.CODE;
    }

    generateArtifactTitle(language, code) {
        const lang = language.toLowerCase();

        const titles = {
            html: 'HTML Document',
            css: 'CSS Styles',
            javascript: 'JavaScript Code',
            js: 'JavaScript Code',
            typescript: 'TypeScript Code',
            ts: 'TypeScript Code',
            jsx: 'React Component',
            tsx: 'React TypeScript Component',
            python: 'Python Script',
            java: 'Java Code',
            cpp: 'C++ Code',
            'c++': 'C++ Code',
            c: 'C Code',
            php: 'PHP Script',
            ruby: 'Ruby Script',
            go: 'Go Code',
            rust: 'Rust Code',
            swift: 'Swift Code',
            kotlin: 'Kotlin Code',
            json: 'JSON Data',
            xml: 'XML Document',
            yaml: 'YAML Config',
            yml: 'YAML Config',
            sql: 'SQL Query',
            markdown: 'Markdown Document',
            md: 'Markdown Document',
            bash: 'Bash Script',
            sh: 'Shell Script',
            powershell: 'PowerShell Script',
            dockerfile: 'Dockerfile',
            makefile: 'Makefile'
        };

        return titles[lang] || `${language.toUpperCase()} Code`;
    }

    createArtifactContainer(artifact, artifactId) {
        const isWebCode = ['html', 'css', 'javascript', 'js', 'typescript', 'ts', 'jsx', 'tsx'].includes(artifact.language.toLowerCase());
        const isHtml = artifact.type === this.artifactTypes.HTML || artifact.language.toLowerCase() === 'html';

        return `
            <div class="artifact-container" 
                 data-type="${artifact.type}" 
                 data-language="${artifact.language}"
                 data-title="${this.escapeHtml(artifact.title)}"
                 data-content="${this.escapeHtml(artifact.code)}"
                 data-id="${artifactId}">
                <div class="artifact-header">
                    <div class="artifact-info">
                        <i class="fas fa-${this.getArtifactIcon(artifact.type)}"></i>
                        <span class="artifact-title">${this.escapeHtml(artifact.title)}</span>
                        <span class="artifact-language">${artifact.language}</span>
                    </div>
                    <div class="artifact-actions">
                        <button class="artifact-btn copy-artifact-btn" title="Копировать код">
                            <i class="fas fa-copy"></i>
                        </button>
                        ${isWebCode ? `
                        <button class="artifact-btn playground-artifact-btn" title="Открыть в Playground">
                            <i class="fas fa-play"></i>
                        </button>
                        ` : ''}
                        ${isHtml ? `
                        <button class="artifact-btn preview-artifact-btn" title="Предпросмотр">
                            <i class="fas fa-eye"></i>
                        </button>
                        ` : ''}
                        <button class="artifact-btn open-artifact-btn" title="Открыть в панели артефактов">
                            <i class="fas fa-external-link-alt"></i>
                        </button>
                    </div>
                </div>
                <div class="artifact-preview">
                    <pre><code class="language-${artifact.language}">${this.escapeHtml(artifact.code)}</code></pre>
                </div>
            </div>
        `;
    }

    getArtifactIcon(type) {
        const icons = {
            [this.artifactTypes.CODE]: 'code',
            [this.artifactTypes.HTML]: 'globe',
            [this.artifactTypes.IMAGE]: 'image',
            [this.artifactTypes.VIDEO]: 'video',
            [this.artifactTypes.AUDIO]: 'music'
        };
        return icons[type] || 'file';
    }

    checkMessageForArtifacts(message) {
        // Update chat title based on first user message
        if (message.type === 'user' && message.content) {
            const chat = this.chats.get(this.currentChatId);
            if (chat && chat.messages.length === 1) {
                chat.title = this.generateChatTitle(message.content);
                this.updateChatTitle();
                this.updateChatHistory();
                this.saveChats();
            }
        }
    }

    generateChatTitle(content) {
        // Generate a meaningful title from the first message
        const words = content.trim().split(/\s+/).slice(0, 6);
        let title = words.join(' ');

        if (title.length > 50) {
            title = title.substring(0, 47) + '...';
        }

        return title || 'Новый чат';
    }

    // Artifact handling
    handleArtifactClick(e) {
        if (e.target.closest('.open-artifact-btn')) {
            const container = e.target.closest('.artifact-container');
            this.openArtifact(container);
        } else if (e.target.closest('.copy-artifact-btn')) {
            const container = e.target.closest('.artifact-container');
            this.copyArtifact(container);
        } else if (e.target.closest('.playground-artifact-btn')) {
            const container = e.target.closest('.artifact-container');
            this.openArtifactInPlayground(container);
        } else if (e.target.closest('.preview-artifact-btn')) {
            const container = e.target.closest('.artifact-container');
            this.openArtifactInPreview(container);
        }
    }

    openArtifact(container) {
        const type = container.dataset.type;
        const language = container.dataset.language;
        const title = container.dataset.title;
        const content = container.dataset.content;

        this.currentArtifact = {
            type,
            language,
            title,
            content
        };

        this.showArtifacts();
        this.loadArtifact();
    }

    openArtifactInPlayground(container) {
        const type = container.dataset.type;
        const language = container.dataset.language;
        const title = container.dataset.title;
        const content = container.dataset.content;

        this.currentArtifact = {
            type,
            language,
            title,
            content
        };

        this.showArtifacts();
        this.loadArtifact();
        this.switchTab('playground');

        this.showToast('Код загружен в Playground', 'success');
    }

    openArtifactInPreview(container) {
        const type = container.dataset.type;
        const language = container.dataset.language;
        const title = container.dataset.title;
        const content = container.dataset.content;

        this.currentArtifact = {
            type,
            language,
            title,
            content
        };

        this.showArtifacts();
        this.loadArtifact();
        this.switchTab('preview');

        this.showToast('Предпросмотр открыт', 'success');
    }

    copyArtifact(container) {
        const content = container.dataset.content;
        this.copyToClipboard(content);
        this.showToast('Код скопирован в буфер обмена', 'success');
    }

    showArtifacts() {
        if (this.artifactsPanel) {
            this.artifactsPanel.classList.add('open');
            this.chatContainer?.classList.add('with-artifacts');
        }
    }

    closeArtifacts() {
        if (this.artifactsPanel) {
            this.artifactsPanel.classList.remove('open', 'fullscreen');
            this.chatContainer?.classList.remove('with-artifacts');
        }
        this.currentArtifact = null;
    }

    toggleFullscreen() {
        if (this.artifactsPanel) {
            this.artifactsPanel.classList.toggle('fullscreen');

            const icon = this.fullscreenBtn?.querySelector('i');
            if (icon) {
                if (this.artifactsPanel.classList.contains('fullscreen')) {
                    icon.className = 'fas fa-compress';
                } else {
                    icon.className = 'fas fa-expand';
                }
            }
        }
    }

    loadArtifact() {
        if (!this.currentArtifact) return;

        if (this.artifactTitle) {
            this.artifactTitle.textContent = this.currentArtifact.title;
        }

        // Load into code tab
        this.loadCodeEditor();

        // Load into appropriate preview
        if (this.currentArtifact.type === this.artifactTypes.HTML || this.currentArtifact.language.toLowerCase() === 'html') {
            this.loadHTMLPreview();
            this.switchTab('preview');
        } else {
            this.switchTab('code');
        }

        // Load into playground if it's web code
        const isWebCode = ['html', 'css', 'javascript', 'js', 'typescript', 'ts', 'jsx', 'tsx'].includes(this.currentArtifact.language.toLowerCase());
        if (isWebCode) {
            this.loadIntoPlayground();
        }
    }

    loadCodeEditor() {
        if (!this.codeEditor || !this.currentArtifact) return;

        const codeElement = this.codeEditor.querySelector('code');
        if (codeElement) {
            codeElement.textContent = this.currentArtifact.content;
            codeElement.className = `language-${this.currentArtifact.language}`;
        }

        if (this.languageSelect) {
            this.languageSelect.value = this.currentArtifact.language;
        }

        this.highlightCode(this.codeEditor);
    }

    loadHTMLPreview() {
        if (!this.previewFrame || !this.currentArtifact) return;

        let content = this.currentArtifact.content;

        // If it's not a complete HTML document, wrap it
        if (!content.includes('<!DOCTYPE') && !content.includes('<html>')) {
            content = `
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Preview</title>
                    <style>
                        body { margin: 0; padding: 20px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
                    </style>
                </head>
                <body>
                    ${content}
                </body>
                </html>
            `;
        }

        const blob = new Blob([content], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        this.previewFrame.src = url;
    }

    loadIntoPlayground() {
        if (!this.currentArtifact) return;

        const { language, content } = this.currentArtifact;
        const lang = language.toLowerCase();

        if (lang === 'html') {
            const htmlTextarea = this.htmlEditor?.querySelector('textarea');
            if (htmlTextarea) htmlTextarea.value = content;
        } else if (lang === 'css') {
            const cssTextarea = this.cssEditor?.querySelector('textarea');
            if (cssTextarea) cssTextarea.value = content;
        } else if (['javascript', 'js', 'jsx'].includes(lang)) {
            const jsTextarea = this.jsEditor?.querySelector('textarea');
            if (jsTextarea) jsTextarea.value = content;
        } else if (['typescript', 'ts', 'tsx'].includes(lang)) {
            const tsTextarea = this.tsEditor?.querySelector('textarea');
            if (tsTextarea) tsTextarea.value = content;
        }
    }

    // Tab management
    switchTab(tabName) {
        // Update tab buttons
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.tab === tabName) {
                btn.classList.add('active');
            }
        });

        // Update tab content
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });

        const targetContent = document.getElementById(`${tabName}Content`);
        if (targetContent) {
            targetContent.classList.add('active');
        }
    }

    switchPlaygroundTab(language) {
        // Update playground tab buttons
        document.querySelectorAll('.playground-tab-btn').forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.lang === language) {
                btn.classList.add('active');
            }
        });

        // Update playground editors
        document.querySelectorAll('.playground-editor').forEach(editor => {
            editor.classList.remove('active');
        });

        const targetEditor = document.getElementById(`${language}Editor`);
        if (targetEditor) {
            targetEditor.classList.add('active');
        }
    }

    // Playground functionality
    runPlaygroundCode() {
        const htmlContent = this.htmlEditor?.querySelector('textarea')?.value || '';
        const cssContent = this.cssEditor?.querySelector('textarea')?.value || '';
        const jsContent = this.jsEditor?.querySelector('textarea')?.value || '';
        const tsContent = this.tsEditor?.querySelector('textarea')?.value || '';

        let finalJsContent = jsContent;

        // Compile TypeScript if present
        if (tsContent.trim()) {
            try {
                finalJsContent = ts.transpile(tsContent, {
                    target: ts.ScriptTarget.ES2020,
                    module: ts.ModuleKind.None
                });
            } catch (error) {
                this.showToast('Ошибка компиляции TypeScript: ' + error.message, 'error');
                return;
            }
        }

        const fullHTML = `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Playground</title>
                <style>
                    body { margin: 0; padding: 20px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
                    ${cssContent}
                </style>
            </head>
            <body>
                ${htmlContent}
                <script>
                    try {
                        ${finalJsContent}
                    } catch (error) {
                        document.body.innerHTML += '<div style="color: red; padding: 10px; background: #fee; border: 1px solid #fcc; border-radius: 4px; margin: 10px 0;"><strong>JavaScript Error:</strong> ' + error.message + '</div>';
                        console.error('Playground Error:', error);
                    }
                </script>
            </body>
            </html>
        `;

        const blob = new Blob([fullHTML], { type: 'text/html' });
        const url = URL.createObjectURL(blob);

        if (this.playgroundFrame) {
            this.playgroundFrame.src = url;
        }
    }

    clearPlayground() {
        const editors = [
            this.htmlEditor?.querySelector('textarea'),
            this.cssEditor?.querySelector('textarea'),
            this.jsEditor?.querySelector('textarea'),
            this.tsEditor?.querySelector('textarea')
        ];

        editors.forEach(editor => {
            if (editor) editor.value = '';
        });

        if (this.playgroundFrame) {
            this.playgroundFrame.src = 'about:blank';
        }
    }

    // Utility functions
    addMessageToChat(message) {
        const chat = this.chats.get(this.currentChatId);
        if (chat) {
            chat.messages.push(message);
            chat.updatedAt = new Date();
            this.saveChats();
        }
    }

    clearInput() {
        if (this.messageInput) {
            this.messageInput.value = '';
            this.autoResizeTextarea();
        }
        this.uploadedFiles = [];
        this.updateUploadedFiles();
        this.updateSendButton();
    }

    updateSendButton() {
        if (this.sendBtn && this.messageInput) {
            const hasContent = this.messageInput.value.trim().length > 0 || this.uploadedFiles.length > 0;
            this.sendBtn.disabled = !hasContent;
        }
    }

    handleInputChange(e) {
        this.updateSendButton();
    }

    handleKeyDown(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            if (!this.sendBtn?.disabled) {
                this.sendMessage();
            }
        }
    }

    autoResizeTextarea() {
        if (!this.messageInput) return;

        this.messageInput.style.height = 'auto';
        const newHeight = Math.min(this.messageInput.scrollHeight, 200);
        this.messageInput.style.height = newHeight + 'px';
    }

    // File handling
    handleFileUpload(e) {
        const files = Array.from(e.target.files);

        files.forEach(file => {
            // Validate file size (10MB limit)
            if (file.size > 10 * 1024 * 1024) {
                this.showToast(`Файл "${file.name}" слишком большой (максимум 10MB)`, 'warning');
                return;
            }

            this.uploadedFiles.push({
                file: file,
                name: file.name,
                type: file.type,
                size: file.size,
                id: this.generateId()
            });
        });

        this.updateUploadedFiles();
        this.updateSendButton();

        // Clear input
        if (e.target) e.target.value = '';
    }

    updateUploadedFiles() {
        if (!this.uploadedFilesContainer || !this.fileUploadArea) return;

        this.uploadedFilesContainer.innerHTML = '';

        if (this.uploadedFiles.length === 0) {
            this.fileUploadArea.style.display = 'none';
            return;
        }

        this.fileUploadArea.style.display = 'block';

        this.uploadedFiles.forEach((fileData, index) => {
            const fileElement = document.createElement('div');
            fileElement.className = 'uploaded-file';

            const icon = this.getFileIcon(fileData.type);
            const size = this.formatFileSize(fileData.size);

            fileElement.innerHTML = `
                <i class="fas fa-${icon} file-icon"></i>
                <span class="file-name">${this.escapeHtml(fileData.name)}</span>
                <span class="file-size">(${size})</span>
                <button class="remove-file" onclick="chatInterface.removeFile(${index})" title="Удалить файл">
                    <i class="fas fa-times"></i>
                </button>
            `;

            this.uploadedFilesContainer.appendChild(fileElement);
        });
    }

    removeFile(index) {
        this.uploadedFiles.splice(index, 1);
        this.updateUploadedFiles();
        this.updateSendButton();
    }

    getFileIcon(mimeType) {
        if (mimeType.startsWith('image/')) return 'image';
        if (mimeType.startsWith('video/')) return 'video';
        if (mimeType.startsWith('audio/')) return 'music';
        if (mimeType.includes('pdf')) return 'file-pdf';
        if (mimeType.includes('word') || mimeType.includes('msword')) return 'file-word';
        if (mimeType.includes('excel') || mimeType.includes('spreadsheet')) return 'file-excel';
        if (mimeType.includes('powerpoint') || mimeType.includes('presentation')) return 'file-powerpoint';
        if (mimeType.includes('text')) return 'file-alt';
        if (mimeType.includes('json')) return 'file-code';
        if (mimeType.includes('zip') || mimeType.includes('rar')) return 'file-archive';
        return 'file';
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
    }

    // UI state management
    showTypingIndicator() {
        if (this.typingIndicator && !this.isTyping) {
            this.isTyping = true;
            this.typingIndicator.style.display = 'block';
            this.scrollToBottom();
        }
    }

    hideTypingIndicator() {
        if (this.typingIndicator && this.isTyping) {
            this.isTyping = false;
            this.typingIndicator.style.display = 'none';
        }
    }

    // Settings management
    openSettings() {
        if (this.settingsModal) {
            this.loadSettingsForm();
            this.settingsModal.style.display = 'flex';
        }
    }

    closeSettings() {
        if (this.settingsModal) {
            this.settingsModal.style.display = 'none';
        }
    }

    loadSettingsForm() {
        if (this.webhookUrlInput) this.webhookUrlInput.value = this.settings.webhookUrl;
        if (this.apiKeyInput) this.apiKeyInput.value = this.settings.apiKey;
        if (this.modelNameInput) this.modelNameInput.value = this.settings.modelName;
        if (this.enableStreamingInput) this.enableStreamingInput.checked = this.settings.enableStreaming;
        if (this.maxTokensInput) this.maxTokensInput.value = this.settings.maxTokens;
        if (this.temperatureInput) {
            this.temperatureInput.value = this.settings.temperature;
            if (this.temperatureValue) {
                this.temperatureValue.textContent = this.settings.temperature;
            }
        }
    }

    saveSettings() {
        this.settings = {
            webhookUrl: this.webhookUrlInput?.value.trim() || '',
            apiKey: this.apiKeyInput?.value.trim() || '',
            modelName: this.modelNameInput?.value || 'gpt-4',
            enableStreaming: this.enableStreamingInput?.checked || false,
            maxTokens: parseInt(this.maxTokensInput?.value) || 2048,
            temperature: parseFloat(this.temperatureInput?.value) || 0.7
        };

        localStorage.setItem('aiChatSettings', JSON.stringify(this.settings));
        this.closeSettings();
        this.showToast('Настройки сохранены', 'success');
    }

    loadSettings() {
        try {
            const saved = localStorage.getItem('aiChatSettings');
            if (saved) {
                this.settings = { ...this.settings, ...JSON.parse(saved) };
            }
        } catch (error) {
            console.warn('Failed to load settings:', error);
        }
    }

    // Data persistence
    saveChats() {
        try {
            const chatsData = Array.from(this.chats.entries());
            localStorage.setItem('aiChatData', JSON.stringify({
                chats: chatsData,
                currentChatId: this.currentChatId
            }));
        } catch (error) {
            console.warn('Failed to save chats:', error);
        }
    }

    loadChats() {
        try {
            const saved = localStorage.getItem('aiChatData');
            if (saved) {
                const data = JSON.parse(saved);

                if (data.chats && Array.isArray(data.chats)) {
                    this.chats = new Map(data.chats.map(([id, chat]) => {
                        // Convert date strings back to Date objects
                        return [id, {
                            ...chat,
                            createdAt: new Date(chat.createdAt),
                            updatedAt: new Date(chat.updatedAt),
                            messages: chat.messages.map(msg => ({
                                ...msg,
                                timestamp: new Date(msg.timestamp)
                            }))
                        }];
                    }));
                }

                if (data.currentChatId && this.chats.has(data.currentChatId)) {
                    this.currentChatId = data.currentChatId;
                }
            }
        } catch (error) {
            console.warn('Failed to load chats:', error);
        }

        // Ensure we have at least one chat
        if (this.chats.size === 0) {
            this.createNewChat();
        }
    }

    // Code functionality
    copyCode() {
        if (this.currentArtifact) {
            this.copyToClipboard(this.currentArtifact.content);
            this.showToast('Код скопирован в буфер обмена', 'success');
        }
    }

    downloadArtifact() {
        if (!this.currentArtifact) return;

        const { content, language, title } = this.currentArtifact;
        const extensions = {
            javascript: 'js',
            js: 'js',
            typescript: 'ts',
            ts: 'ts',
            jsx: 'jsx',
            tsx: 'tsx',
            html: 'html',
            css: 'css',
            python: 'py',
            java: 'java',
            cpp: 'cpp',
            'c++': 'cpp',
            c: 'c',
            php: 'php',
            ruby: 'rb',
            go: 'go',
            rust: 'rs',
            swift: 'swift',
            kotlin: 'kt',
            json: 'json',
            xml: 'xml',
            yaml: 'yml',
            yml: 'yml',
            sql: 'sql',
            markdown: 'md',
            md: 'md',
            bash: 'sh',
            sh: 'sh',
            powershell: 'ps1',
            dockerfile: 'dockerfile',
            makefile: 'makefile'
        };

        const extension = extensions[language.toLowerCase()] || 'txt';
        const filename = `${title.replace(/[^a-zA-Z0-9]/g, '_')}.${extension}`;

        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        this.showToast('Файл скачан', 'success');
    }

    updateCodeHighlighting() {
        if (this.codeEditor && this.currentArtifact) {
            const codeElement = this.codeEditor.querySelector('code');
            if (codeElement) {
                const language = this.languageSelect?.value || this.currentArtifact.language;
                codeElement.className = `language-${language}`;
                this.highlightCode(this.codeEditor);
            }
        }
    }

    highlightCode(container) {
        if (typeof Prism !== 'undefined') {
            Prism.highlightAllUnder(container);
        }
    }

    // Image functionality
    zoomImage(delta) {
        this.artifactZoomLevel = Math.max(0.1, Math.min(5, this.artifactZoomLevel + delta));

        if (this.artifactImage) {
            this.artifactImage.style.transform = `scale(${this.artifactZoomLevel})`;
        }
    }

    resetZoom() {
        this.artifactZoomLevel = 1;

        if (this.artifactImage) {
            this.artifactImage.style.transform = 'scale(1)';
        }
    }

    // Utility functions
    generateId() {
        return Math.random().toString(36).substr(2, 9);
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    escapeRegex(string) {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }

    copyToClipboard(text) {
        if (navigator.clipboard && window.isSecureContext) {
            return navigator.clipboard.writeText(text);
        } else {
            // Fallback for older browsers
            const textArea = document.createElement('textarea');
            textArea.value = text;
            textArea.style.position = 'fixed';
            textArea.style.left = '-999999px';
            textArea.style.top = '-999999px';
            document.body.appendChild(textArea);
            textArea.focus();
            textArea.select();

            try {
                document.execCommand('copy');
                textArea.remove();
                return Promise.resolve();
            } catch (error) {
                textArea.remove();
                return Promise.reject(error);
            }
        }
    }

    showToast(message, type = 'info') {
        if (!this.toastContainer) return;

        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;

        const icon = {
            success: 'check-circle',
            error: 'exclamation-circle',
            warning: 'exclamation-triangle',
            info: 'info-circle'
        }[type] || 'info-circle';

        toast.innerHTML = `
            <i class="fas fa-${icon}"></i>
            <span>${this.escapeHtml(message)}</span>
            <button class="toast-close">
                <i class="fas fa-times"></i>
            </button>
        `;

        // Close button functionality
        const closeBtn = toast.querySelector('.toast-close');
        closeBtn.addEventListener('click', () => {
            toast.remove();
        });

        this.toastContainer.appendChild(toast);

        // Auto remove after delay
        setTimeout(() => {
            if (toast.parentNode) {
                toast.style.opacity = '0';
                setTimeout(() => toast.remove(), 300);
            }
        }, type === 'error' ? 5000 : 3000);
    }

    formatDate(date) {
        const now = new Date();
        const diff = now - date;

        if (diff < 60000) return 'только что';
        if (diff < 3600000) return Math.floor(diff / 60000) + ' мин назад';
        if (diff < 86400000) return Math.floor(diff / 3600000) + ' ч назад';

        return date.toLocaleDateString('ru-RU', {
            day: 'numeric',
            month: 'short'
        });
    }

    scrollToBottom() {
        if (this.chatMessages) {
            setTimeout(() => {
                this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
            }, 100);
        }
    }
}

// Initialize the chat interface when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.chatInterface = new AIChatInterface();
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AIChatInterface;
}
