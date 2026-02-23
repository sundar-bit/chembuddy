// ChemBuddy - Shared Utilities

const Utils = {
    // Format timestamp to readable date
    formatDate(ts) {
        if (!ts) return '-';
        const d = new Date(ts);
        return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
    },

    // Format timestamp to date + time
    formatDateTime(ts) {
        if (!ts) return '-';
        const d = new Date(ts);
        return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    },

    // Format seconds to mm:ss
    formatTime(seconds) {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s.toString().padStart(2, '0')}`;
    },

    // Get today's date string YYYY-MM-DD
    todayStr() {
        return new Date().toISOString().slice(0, 10);
    },

    // Sanitize HTML to prevent XSS
    sanitize(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    },

    // Generate random ID
    generateId(len) {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let result = '';
        for (let i = 0; i < (len || 8); i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
    },

    // Debounce function
    debounce(fn, delay) {
        let timer;
        return function (...args) {
            clearTimeout(timer);
            timer = setTimeout(() => fn.apply(this, args), delay);
        };
    },

    // Show toast notification
    toast(message, type) {
        type = type || 'info';
        const existing = document.querySelector('.cb-toast');
        if (existing) existing.remove();

        const toast = document.createElement('div');
        toast.className = 'cb-toast cb-toast-' + type;
        toast.textContent = message;
        document.body.appendChild(toast);

        requestAnimationFrame(() => toast.classList.add('show'));
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    },

    // Show loading overlay
    showLoading(container) {
        const loader = document.createElement('div');
        loader.className = 'cb-loading';
        loader.innerHTML = '<div class="cb-spinner"></div><p>Loading...</p>';
        if (container) {
            container.innerHTML = '';
            container.appendChild(loader);
        }
        return loader;
    },

    // Shuffle array (Fisher-Yates)
    shuffle(arr) {
        const a = arr.slice();
        for (let i = a.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [a[i], a[j]] = [a[j], a[i]];
        }
        return a;
    },

    // Get ordinal suffix
    ordinal(n) {
        const s = ['th', 'st', 'nd', 'rd'];
        const v = n % 100;
        return n + (s[(v - 20) % 10] || s[v] || s[0]);
    },

    // Calculate streak from a set of date strings (YYYY-MM-DD)
    calculateStreak(dateStrings) {
        if (!dateStrings || dateStrings.length === 0) return 0;
        const sorted = dateStrings.sort().reverse();
        const today = this.todayStr();
        const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);

        if (sorted[0] !== today && sorted[0] !== yesterday) return 0;

        let streak = 1;
        for (let i = 1; i < sorted.length; i++) {
            const prev = new Date(sorted[i - 1]);
            const curr = new Date(sorted[i]);
            const diffDays = (prev - curr) / 86400000;
            if (diffDays === 1) {
                streak++;
            } else {
                break;
            }
        }
        return streak;
    }
};
