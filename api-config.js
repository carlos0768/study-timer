// OpenAI API設定（Vercel環境用に更新）
const API_CONFIG = {
    // Vercel環境では環境変数を使用
    model: 'gpt-4o-mini',
    maxTokens: 150,
    temperature: 0.8,
    
    // レート制限
    rateLimitPerMinute: 3,
    rateLimitPerDay: 100
};

// レート制限管理
class RateLimiter {
    constructor() {
        this.requests = JSON.parse(localStorage.getItem('api_requests') || '[]');
        this.cleanOldRequests();
    }
    
    cleanOldRequests() {
        const now = Date.now();
        const oneDay = 24 * 60 * 60 * 1000;
        
        this.requests = this.requests.filter(timestamp => {
            return now - timestamp < oneDay;
        });
        
        this.save();
    }
    
    canMakeRequest() {
        const now = Date.now();
        const oneMinute = 60 * 1000;
        const oneDay = 24 * 60 * 60 * 1000;
        
        // 1分間のリクエスト数をチェック
        const recentRequests = this.requests.filter(timestamp => {
            return now - timestamp < oneMinute;
        });
        
        if (recentRequests.length >= API_CONFIG.rateLimitPerMinute) {
            return { allowed: false, reason: '1分間のリクエスト制限に達しました。少し待ってからお試しください。' };
        }
        
        // 1日のリクエスト数をチェック
        const dailyRequests = this.requests.filter(timestamp => {
            return now - timestamp < oneDay;
        });
        
        if (dailyRequests.length >= API_CONFIG.rateLimitPerDay) {
            return { allowed: false, reason: '1日のリクエスト制限に達しました。明日またお試しください。' };
        }
        
        return { allowed: true };
    }
    
    recordRequest() {
        this.requests.push(Date.now());
        this.save();
    }
    
    save() {
        localStorage.setItem('api_requests', JSON.stringify(this.requests));
    }
}

