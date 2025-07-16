class TaskManager {
    constructor() {
        this.tasks = [];
        this.currentTaskId = null;
        this.modal = document.getElementById('task-modal');
        this.taskSection = document.querySelector('.task-section');
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.checkDailyTasks();
    }

    setupEventListeners() {
        // モーダル関連
        document.getElementById('add-task-input-btn').addEventListener('click', () => this.addTaskInput());
        document.getElementById('save-tasks-btn').addEventListener('click', () => this.saveTasks());
        
        // タスク選択
        document.getElementById('current-task-select').addEventListener('change', (e) => {
            this.setCurrentTask(e.target.value);
        });

        // 助言ボタン
        document.getElementById('get-advice-btn').addEventListener('click', () => {
            this.requestEmperorAdvice();
        });

        // タスク完了チェック（動的に追加される要素用）
        document.addEventListener('change', (e) => {
            if (e.target.classList.contains('task-checkbox')) {
                this.toggleTaskComplete(e.target.dataset.taskId);
            }
        });
    }

    checkDailyTasks() {
        const today = new Date().toDateString();
        const lastAccessDate = localStorage.getItem('lastAccessDate');
        const savedTasks = localStorage.getItem('dailyTasks');

        if (lastAccessDate !== today || !savedTasks) {
            // 新しい日またはタスクがない場合
            this.showTaskModal();
            localStorage.setItem('lastAccessDate', today);
        } else {
            // 既存のタスクを読み込む
            const tasksData = JSON.parse(savedTasks);
            if (tasksData[today]) {
                this.tasks = tasksData[today].tasks || [];
                this.currentTaskId = tasksData[today].currentTaskId;
                this.showTaskSection();
                this.updateTaskUI();
            } else {
                this.showTaskModal();
            }
        }
    }

    showTaskModal() {
        this.modal.classList.add('show');
    }

    hideTaskModal() {
        this.modal.classList.remove('show');
    }

    addTaskInput() {
        const taskInputs = document.getElementById('task-inputs');
        const inputCount = taskInputs.querySelectorAll('.task-input').length;
        
        if (inputCount < 10) {
            const newInput = document.createElement('div');
            newInput.className = 'task-input-item';
            newInput.innerHTML = `
                <input type="text" class="task-input" placeholder="タスクを入力">
            `;
            taskInputs.appendChild(newInput);
        } else {
            this.showNotification('最大10個までのタスクを設定できます', 'warning');
        }
    }

    saveTasks() {
        const inputs = document.querySelectorAll('.task-input');
        const tasks = [];
        
        inputs.forEach(input => {
            const text = input.value.trim();
            if (text) {
                tasks.push({
                    id: `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                    text: text,
                    completed: false,
                    createdAt: new Date().toISOString()
                });
            }
        });

        if (tasks.length === 0) {
            this.showNotification('少なくとも1つのタスクを入力してください', 'warning');
            return;
        }

        this.tasks = tasks;
        this.saveToLocalStorage();
        this.hideTaskModal();
        this.showTaskSection();
        this.updateTaskUI();
        this.showNotification('タスクを保存しました', 'success');
    }

    showTaskSection() {
        this.taskSection.style.display = 'block';
    }

    updateTaskUI() {
        // タスク選択ドロップダウンを更新
        const select = document.getElementById('current-task-select');
        select.innerHTML = '<option value="">タスクを選択してください</option>';
        
        this.tasks.forEach(task => {
            const option = document.createElement('option');
            option.value = task.id;
            option.textContent = task.completed ? `✓ ${task.text}` : task.text;
            select.appendChild(option);
        });

        if (this.currentTaskId) {
            select.value = this.currentTaskId;
        }

        // 進捗を更新
        this.updateProgress();
    }

    updateProgress() {
        const completed = this.tasks.filter(t => t.completed).length;
        const total = this.tasks.length;
        const percentage = total > 0 ? (completed / total) * 100 : 0;

        document.getElementById('task-progress-text').textContent = `${completed}/${total} タスク完了`;
        document.getElementById('progress-bar-fill').style.width = `${percentage}%`;
    }

    setCurrentTask(taskId) {
        this.currentTaskId = taskId;
        this.saveToLocalStorage();
        
        if (taskId) {
            // タスク切り替え時に助言を求める（オプション）
            setTimeout(() => this.requestEmperorAdvice(), 500);
        }
    }

    toggleTaskComplete(taskId) {
        const task = this.tasks.find(t => t.id === taskId);
        if (task) {
            task.completed = !task.completed;
            this.saveToLocalStorage();
            this.updateTaskUI();
        }
    }

    getCurrentTask() {
        return this.tasks.find(t => t.id === this.currentTaskId);
    }

    getTasksInfo() {
        const completed = this.tasks.filter(t => t.completed);
        const remaining = this.tasks.filter(t => !t.completed);
        const current = this.getCurrentTask();

        return {
            current: current,
            all: this.tasks,
            completed: completed,
            remaining: remaining,
            completedCount: completed.length,
            remainingCount: remaining.length,
            totalCount: this.tasks.length
        };
    }

    async requestEmperorAdvice() {
        const tasksInfo = this.getTasksInfo();
        
        if (!tasksInfo.current) {
            this.showNotification('まずタスクを選択してください', 'warning');
            return;
        }

        try {
            // AI助言を取得
            const emperorAI = new EmperorAI();
            const adviceData = await emperorAI.getAdvice(tasksInfo);
            this.displayAdvice(adviceData);
        } catch (error) {
            console.error('助言取得エラー:', error);
            // エラー時はフォールバックを使用
            const fallbackAdvice = this.getMockEmperorAdvice(tasksInfo);
            this.displayAdvice(fallbackAdvice);
        }
    }

    getMockEmperorAdvice(tasksInfo) {
        const emperors = [
            { name: 'マルクス・アウレリウス', style: 'stoic' },
            { name: 'アウグストゥス', style: 'strategic' },
            { name: 'トラヤヌス', style: 'encouraging' }
        ];
        
        const emperor = emperors[Math.floor(Math.random() * emperors.length)];
        const current = tasksInfo.current.text;
        const remaining = tasksInfo.remainingCount;
        
        let advice = '';
        
        switch(emperor.style) {
            case 'stoic':
                advice = `今この瞬間に集中せよ。「${current}」は君の成長の糧となる。`;
                if (remaining > 1) {
                    advice += `まだ${remaining}つの試練が待っているが、一つずつ着実に進めよ。`;
                }
                break;
            case 'strategic':
                advice = `ゆっくり急げ。「${current}」を着実に進めることが、`;
                if (remaining > 1) {
                    advice += `残りの${remaining}つのタスクへの道を開く。`;
                } else {
                    advice += `成功への確実な道だ。`;
                }
                break;
            case 'encouraging':
                advice = `素晴らしい選択だ！「${current}」に取り組む君の姿勢を讃えよう。`;
                if (remaining > 1) {
                    advice += `この調子で残りの課題も制覇するのだ！`;
                }
                break;
        }
        
        return {
            emperor: emperor.name,
            advice: advice
        };
    }

    displayAdvice(adviceData) {
        const adviceEl = document.getElementById('emperor-advice');
        const contentEl = adviceEl.querySelector('.advice-content');
        
        contentEl.innerHTML = `<strong>${adviceData.emperor}:</strong> ${adviceData.advice}`;
        adviceEl.style.display = 'block';
        
        // 一定時間後に自動的に隠す
        setTimeout(() => {
            adviceEl.style.display = 'none';
        }, 10000);
    }

    saveToLocalStorage() {
        const today = new Date().toDateString();
        const allTasks = JSON.parse(localStorage.getItem('dailyTasks') || '{}');
        
        allTasks[today] = {
            tasks: this.tasks,
            currentTaskId: this.currentTaskId
        };
        
        localStorage.setItem('dailyTasks', JSON.stringify(allTasks));
    }

    showNotification(message, type = 'info') {
        // 既存の通知システムを使用
        const notification = document.getElementById('notification');
        notification.textContent = message;
        notification.className = `notification ${type}`;
        notification.style.transform = 'translateX(0)';
        
        setTimeout(() => {
            notification.style.transform = 'translateX(400px)';
        }, 3000);
    }

    // ポモドーロタイマーとの連携用メソッド
    onPomodoroBreak() {
        const tasksInfo = this.getTasksInfo();
        if (tasksInfo.current && tasksInfo.current.completed === false) {
            this.requestEmperorAdvice();
        }
    }

    onStudyMilestone(minutes) {
        // 30分ごとに助言
        if (minutes % 30 === 0 && minutes > 0) {
            this.requestEmperorAdvice();
        }
    }
}

// ページ読み込み時に初期化
document.addEventListener('DOMContentLoaded', () => {
    window.taskManager = new TaskManager();
});