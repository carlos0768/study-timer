class StudyTimer {
    constructor() {
        this.timerInterval = null;
        this.timeRemaining = parseInt(localStorage.getItem('timeRemaining') || (25 * 60));
        this.isRunning = false;
        this.isPaused = false;
        this.pomodoroWorkTime = parseInt(localStorage.getItem('pomodoroWorkTime') || 25);
        this.pomodoroBreakTime = parseInt(localStorage.getItem('pomodoroBreakTime') || 5);
        this.isBreakTime = localStorage.getItem('isBreakTime') === 'true';
        this.pomodoroCount = parseInt(localStorage.getItem('pomodoroCount') || 0);
        this.dailyStats = this.loadDailyStats();
        this.emperors = [];
        this.currentEmperorIndex = parseInt(localStorage.getItem('currentEmperorIndex') || '0');
        
        this.initializeElements();
        this.initializeEventListeners();
        this.loadEmperorsData();
        this.loadSettings();
        this.updateDisplay();
        this.updateStats();
        this.updatePomodoroStatus();
        this.registerServiceWorker();
        this.requestNotificationPermission();
        this.checkAndResumeTimer();
    }

    initializeElements() {
        this.elements = {
            timerMinutes: document.getElementById('timer-minutes'),
            timerSeconds: document.getElementById('timer-seconds'),
            startBtn: document.getElementById('start-btn'),
            pauseBtn: document.getElementById('pause-btn'),
            resetBtn: document.getElementById('reset-btn'),
            customMinutes: document.getElementById('custom-minutes'),
            setCustomBtn: document.getElementById('set-custom-btn'),
            workTime: document.getElementById('work-time'),
            breakTime: document.getElementById('break-time'),
            savePomodoroBtn: document.getElementById('save-pomodoro-btn'),
            pomodoroMode: document.getElementById('pomodoro-mode'),
            pomodoroCount: document.getElementById('pomodoro-count'),
            totalTime: document.getElementById('total-time'),
            completedSessions: document.getElementById('completed-sessions'),
            sessionLog: document.getElementById('session-log'),
            notification: document.getElementById('notification'),
            emperorImage: document.getElementById('emperor-image'),
            emperorName: document.getElementById('emperor-name'),
            emperorQuoteLatin: document.getElementById('emperor-quote-latin'),
            emperorQuoteJp: document.getElementById('emperor-quote-jp'),
            presetButtons: document.querySelectorAll('.preset-btn'),
            shareTwitterBtn: document.getElementById('share-twitter-btn')
        };
    }

    initializeEventListeners() {
        this.elements.startBtn.addEventListener('click', () => this.start());
        this.elements.pauseBtn.addEventListener('click', () => this.pause());
        this.elements.resetBtn.addEventListener('click', () => this.reset());
        this.elements.setCustomBtn.addEventListener('click', () => this.setCustomTime());
        this.elements.savePomodoroBtn.addEventListener('click', () => this.savePomodoroSettings());
        
        this.elements.presetButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const minutes = parseInt(e.target.dataset.minutes);
                this.setTime(minutes);
                this.updatePresetButtons(e.target);
            });
        });

        this.elements.customMinutes.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.setCustomTime();
            }
        });

        this.elements.shareTwitterBtn.addEventListener('click', () => this.shareOnTwitter());
    }

    async loadEmperorsData() {
        try {
            // CSVから読み込み
            const response = await fetch('./emperors_lat_jp.csv');
            if (!response.ok) {
                throw new Error('CSV ロード失敗');
            }
            const text = await response.text();
            this.emperors = this.parseCSV(text);
            
            this.scheduleEmperorRotation();
            this.displayCurrentEmperor();
        } catch (error) {
            console.error('皇帝データの読み込みに失敗しました:', error);
            // フォールバックデータを使用
            this.emperors = this.getDefaultEmperors();
            this.displayCurrentEmperor();
        }
    }
    getDefaultEmperors() {
        return [{
            name: 'Marcus Aurelius',
            quoteLatin: 'What we do now echoes in eternity',
            quoteJp: '今我々が行うことは永遠に響き渡る',
            img: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5a/Marcus_Aurelius_Glyptothek_Munich.jpg/200px-Marcus_Aurelius_Glyptothek_Munich.jpg'
        }];
    }

    parseCSV(text) {
        const lines = text.trim().split('\n');
        const emperors = [];

        for (let i = 1; i < lines.length; i++) {
            // 正規表現でCSVを適切にパース（カンマを含む引用符付き文字列に対応）
            const regex = /(?:,|^)("(?:[^"]+|"")*"|[^,]*)/g;
            const values = [];
            let match;
            
            while ((match = regex.exec(lines[i])) !== null) {
                let value = match[1];
                // 引用符を除去
                if (value.startsWith('"') && value.endsWith('"')) {
                    value = value.slice(1, -1).replace(/""/g, '"');
                }
                values.push(value.trim());
            }
            
            if (values.length >= 5) {
                emperors.push({
                    id: values[0],
                    name: values[1],
                    quoteLatin: values[2],
                    quoteJp: values[3],
                    img: values[4]
                });
            }
        }
        return emperors;
    }

    scheduleEmperorRotation() {
        // 最後の表示時刻をチェック
        const lastRotation = localStorage.getItem('lastEmperorRotation');
        const now = new Date();
        
        if (lastRotation) {
            const lastTime = new Date(lastRotation);
            const hoursPassed = Math.floor((now - lastTime) / (60 * 60 * 1000));
            
            // 1時間以上経過していたら、その分だけ皇帝を進める
            if (hoursPassed > 0) {
                for (let i = 0; i < hoursPassed; i++) {
                    this.currentEmperorIndex = (this.currentEmperorIndex + 1) % this.emperors.length;
                }
                localStorage.setItem('currentEmperorIndex', this.currentEmperorIndex);
                this.displayCurrentEmperor();
            }
        }
        
        // 現在時刻を保存
        localStorage.setItem('lastEmperorRotation', now.toISOString());
        
        // 次の正時までの時間を計算
        const nextHour = new Date(now);
        nextHour.setHours(now.getHours() + 1, 0, 0, 0);
        const timeUntilNextHour = nextHour - now;

        setTimeout(() => {
            this.rotateEmperor();
            setInterval(() => this.rotateEmperor(), 60 * 60 * 1000);
        }, timeUntilNextHour);
    }

    rotateEmperor() {
        this.currentEmperorIndex = (this.currentEmperorIndex + 1) % this.emperors.length;
        localStorage.setItem('currentEmperorIndex', this.currentEmperorIndex);
        localStorage.setItem('lastEmperorRotation', new Date().toISOString());
        this.displayCurrentEmperor();
    }

    displayCurrentEmperor() {
        if (this.emperors.length === 0) return;

        const emperor = this.emperors[this.currentEmperorIndex];
        this.elements.emperorName.textContent = emperor.name;
        this.elements.emperorQuoteLatin.textContent = emperor.quoteLatin;
        this.elements.emperorQuoteJp.textContent = emperor.quoteJp;
        
        // デバッグ用ログ
        console.log('Current emperor:', emperor);
        
        if (emperor.img.startsWith('http')) {
            this.elements.emperorImage.src = emperor.img;
        } else {
            this.elements.emperorImage.src = `./assets/emperors/${emperor.img}`;
        }
        
        this.elements.emperorImage.onerror = async () => {
            console.error('Failed to load image:', emperor.img);
            // Wikipediaから画像を検索
            const fallbackImage = await this.searchWikipediaImage(emperor.name);
            if (fallbackImage) {
                this.elements.emperorImage.src = fallbackImage;
            } else {
                this.elements.emperorImage.src = './assets/emperors/default.webp';
            }
        };
    }

    registerServiceWorker() {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('service-worker.js')
                .then(reg => console.log('Service Worker 登録成功'))
                .catch(err => console.error('Service Worker 登録失敗:', err));
        }
    }

    requestNotificationPermission() {
        if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission();
        }
    }

    loadSettings() {
        const savedWork = localStorage.getItem('pomodoroWorkTime');
        const savedBreak = localStorage.getItem('pomodoroBreakTime');
        
        if (savedWork) {
            this.pomodoroWorkTime = parseInt(savedWork);
            this.elements.workTime.value = this.pomodoroWorkTime;
        }
        
        if (savedBreak) {
            this.pomodoroBreakTime = parseInt(savedBreak);
            this.elements.breakTime.value = this.pomodoroBreakTime;
        }
    }

    savePomodoroSettings() {
        const workTime = parseInt(this.elements.workTime.value);
        const breakTime = parseInt(this.elements.breakTime.value);
        
        if (workTime > 0 && breakTime > 0) {
            this.pomodoroWorkTime = workTime;
            this.pomodoroBreakTime = breakTime;
            
            localStorage.setItem('pomodoroWorkTime', workTime);
            localStorage.setItem('pomodoroBreakTime', breakTime);
            
            this.showNotification('ポモドーロ設定を保存しました');
        }
    }

    start() {
        if (!this.isRunning) {
            this.isRunning = true;
            this.isPaused = false;
            this.elements.startBtn.disabled = true;
            this.elements.pauseBtn.disabled = false;
            
            localStorage.setItem('timerRunning', 'true');
            localStorage.setItem('timerStartTime', new Date().getTime());
            
            this.timerInterval = setInterval(() => this.tick(), 1000);
        }
    }

    pause() {
        if (this.isRunning && !this.isPaused) {
            this.isPaused = true;
            this.isRunning = false;
            clearInterval(this.timerInterval);
            
            localStorage.setItem('timerRunning', 'false');
            localStorage.removeItem('timerStartTime');
            
            this.elements.startBtn.disabled = false;
            this.elements.pauseBtn.disabled = true;
        }
    }

    reset() {
        this.isRunning = false;
        this.isPaused = false;
        clearInterval(this.timerInterval);
        
        this.timeRemaining = this.isBreakTime ? this.pomodoroBreakTime * 60 : this.pomodoroWorkTime * 60;
        
        localStorage.setItem('timeRemaining', this.timeRemaining);
        localStorage.setItem('timerRunning', 'false');
        localStorage.removeItem('timerStartTime');
        
        this.elements.startBtn.disabled = false;
        this.elements.pauseBtn.disabled = true;
        
        this.updateDisplay();
    }

    tick() {
        if (this.timeRemaining > 0) {
            this.timeRemaining--;
            localStorage.setItem('timeRemaining', this.timeRemaining);
            this.updateDisplay();
        } else {
            this.timerComplete();
        }
    }

    timerComplete() {
        clearInterval(this.timerInterval);
        this.isRunning = false;
        
        localStorage.setItem('timerRunning', 'false');
        localStorage.removeItem('timerStartTime');
        
        this.playBeep();
        this.sendNotification();
        
        const sessionDuration = this.isBreakTime ? this.pomodoroBreakTime : this.pomodoroWorkTime;
        this.recordSession(sessionDuration);
        
        if (!this.isBreakTime) {
            this.pomodoroCount++;
            localStorage.setItem('pomodoroCount', this.pomodoroCount);
            this.elements.pomodoroCount.textContent = `セッション: ${this.pomodoroCount}`;
        }
        
        this.isBreakTime = !this.isBreakTime;
        localStorage.setItem('isBreakTime', this.isBreakTime);
        this.elements.pomodoroMode.textContent = this.isBreakTime ? '休憩時間' : '作業時間';
        
        this.timeRemaining = this.isBreakTime ? this.pomodoroBreakTime * 60 : this.pomodoroWorkTime * 60;
        localStorage.setItem('timeRemaining', this.timeRemaining);
        
        this.elements.startBtn.disabled = false;
        this.elements.pauseBtn.disabled = true;
        
        this.updateDisplay();
    }

    playBeep() {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.value = 800;
        oscillator.type = 'sine';
        
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.5);
    }

    sendNotification() {
        if ('Notification' in window && Notification.permission === 'granted') {
            const message = this.isBreakTime ? '休憩時間が終了しました！' : '作業時間が終了しました！';
            const emperor = this.emperors[this.currentEmperorIndex];
            
            new Notification('ローマ皇帝タイマー', {
                body: message,
                icon: 'assets/icon-192.png',
                tag: 'timer-complete',
                requireInteraction: true
            });
        }
    }

    recordSession(duration) {
        const now = new Date();
        const dateKey = now.toDateString();
        
        if (!this.dailyStats[dateKey]) {
            this.dailyStats[dateKey] = {
                totalMinutes: 0,
                sessions: []
            };
        }
        
        this.dailyStats[dateKey].totalMinutes += duration;
        this.dailyStats[dateKey].sessions.push({
            time: now.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' }),
            duration: duration,
            type: this.isBreakTime ? 'work' : 'break'
        });
        
        this.saveDailyStats();
        this.updateStats();
    }

    loadDailyStats() {
        const saved = localStorage.getItem('dailyStats');
        return saved ? JSON.parse(saved) : {};
    }

    saveDailyStats() {
        localStorage.setItem('dailyStats', JSON.stringify(this.dailyStats));
    }

    updateStats() {
        const today = new Date().toDateString();
        const todayStats = this.dailyStats[today] || { totalMinutes: 0, sessions: [] };
        
        this.elements.totalTime.textContent = `${todayStats.totalMinutes}分`;
        this.elements.completedSessions.textContent = `${todayStats.sessions.filter(s => s.type === 'work').length}回`;
        
        this.elements.sessionLog.innerHTML = '';
        todayStats.sessions.slice(-10).reverse().forEach(session => {
            const li = document.createElement('li');
            li.innerHTML = `
                <span class="session-time">${session.time}</span>
                <span class="session-duration">${session.duration}分 (${session.type === 'work' ? '作業' : '休憩'})</span>
            `;
            this.elements.sessionLog.appendChild(li);
        });
    }

    setTime(minutes) {
        if (!this.isRunning) {
            this.timeRemaining = minutes * 60;
            this.updateDisplay();
        }
    }

    setCustomTime() {
        const minutes = parseInt(this.elements.customMinutes.value);
        if (minutes > 0 && minutes <= 999) {
            this.setTime(minutes);
            this.showNotification(`タイマーを${minutes}分に設定しました`);
        }
    }

    updatePresetButtons(activeButton) {
        this.elements.presetButtons.forEach(btn => {
            btn.classList.remove('active');
        });
        activeButton.classList.add('active');
    }

    updateDisplay() {
        const minutes = Math.floor(this.timeRemaining / 60);
        const seconds = this.timeRemaining % 60;
        
        this.elements.timerMinutes.textContent = minutes.toString().padStart(2, '0');
        this.elements.timerSeconds.textContent = seconds.toString().padStart(2, '0');
    }

    updatePomodoroStatus() {
        this.elements.pomodoroMode.textContent = this.isBreakTime ? '休憩時間' : '作業時間';
        this.elements.pomodoroCount.textContent = `セッション: ${this.pomodoroCount}`;
    }

    checkAndResumeTimer() {
        const wasRunning = localStorage.getItem('timerRunning') === 'true';
        const startTime = localStorage.getItem('timerStartTime');
        
        if (wasRunning && startTime) {
            // タイマーが実行中だった場合、経過時間を計算
            const elapsed = Math.floor((new Date().getTime() - parseInt(startTime)) / 1000);
            this.timeRemaining = Math.max(0, this.timeRemaining - elapsed);
            localStorage.setItem('timeRemaining', this.timeRemaining);
            
            if (this.timeRemaining > 0) {
                // タイマーを自動的に再開
                this.start();
            } else {
                // 時間切れの場合は完了処理
                this.timerComplete();
            }
        }
    }

    showNotification(message) {
        this.elements.notification.textContent = message;
        this.elements.notification.classList.add('show');
        
        setTimeout(() => {
            this.elements.notification.classList.remove('show');
        }, 3000);
    }

    shareOnTwitter() {
        const today = new Date().toDateString();
        const todayStats = this.dailyStats[today] || { totalMinutes: 0, sessions: [] };
        const completedSessions = todayStats.sessions.filter(s => s.type === 'work').length;
        
        // 現在の皇帝情報を取得
        const currentEmperor = this.emperors[this.currentEmperorIndex];
        const emperorName = currentEmperor ? currentEmperor.name : '';
        const emperorQuote = currentEmperor ? currentEmperor.quoteJp : '';
        
        // ツイートテキストを生成
        let tweetText = `【Studium Aeternum】\n`;
        tweetText += `本日の学習記録\n`;
        tweetText += `⏱ 合計時間: ${todayStats.totalMinutes}分\n`;
        tweetText += `🏛 完了セッション: ${completedSessions}回\n`;
        
        if (emperorName && emperorQuote) {
            tweetText += `\n「${emperorQuote}」\n`;
            tweetText += `- ${emperorName}\n`;
        }
        
        tweetText += `\n#StudiumAeternum #ポモドーロタイマー #学習記録`;
        
        // TwitterのWeb Intent URLを生成
        const tweetUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}`;
        
        // 新しいウィンドウで開く
        window.open(tweetUrl, '_blank', 'width=550,height=420');
    }

    async searchWikipediaImage(emperorName) {
        try {
            // Wikipedia APIで画像を検索
            const searchUrl = `https://en.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(emperorName)}&prop=pageimages&format=json&pithumbsize=500&origin=*`;
            const response = await fetch(searchUrl);
            const data = await response.json();
            
            const pages = data.query.pages;
            const pageId = Object.keys(pages)[0];
            
            if (pages[pageId].thumbnail) {
                return pages[pageId].thumbnail.source;
            }
            
            // 代替画像URLのマッピング
            const alternativeImages = {
                'Tiberius': 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f5/Tiberius%2C_Romisch-Germanisches_Museum%2C_Cologne_%288115606671%29.jpg/440px-Tiberius%2C_Romisch-Germanisches_Museum%2C_Cologne_%288115606671%29.jpg',
                'Augustus': 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/eb/Statue-Augustus.jpg/440px-Statue-Augustus.jpg',
                'Caligula': 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9b/Caligula_Ny_Carlsberg_Glyptotek_IN1453.jpg/440px-Caligula_Ny_Carlsberg_Glyptotek_IN1453.jpg',
                'Claudius': 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b2/Claudius_Pio-Clementino_Inv243.jpg/440px-Claudius_Pio-Clementino_Inv243.jpg',
                'Nero': 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6d/Bust_of_Nero_Palazzo_Massimo_alle_Terme.jpg/440px-Bust_of_Nero_Palazzo_Massimo_alle_Terme.jpg',
                'Vespasian': 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c9/Vespasian_Bust.jpg/440px-Vespasian_Bust.jpg',
                'Trajan': 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/28/Traianus_Glyptothek_Munich_336.jpg/440px-Traianus_Glyptothek_Munich_336.jpg',
                'Hadrian': 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7e/Bust_Hadrian_Musei_Capitolini_MC817.jpg/440px-Bust_Hadrian_Musei_Capitolini_MC817.jpg',
                'Marcus Aurelius': 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/75/Marcus_Aurelius_Metropolitan_Museum.jpg/440px-Marcus_Aurelius_Metropolitan_Museum.jpg'
            };
            
            return alternativeImages[emperorName] || null;
        } catch (error) {
            console.error('Failed to search Wikipedia image:', error);
            return null;
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new StudyTimer();
});