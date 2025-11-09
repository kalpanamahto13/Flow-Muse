
        let currentMonth = new Date();
        let trendChart, correlationChart;
        let showPredictedPeriods = false;

        // LocalStorage helpers
        const getSettings = () => JSON.parse(localStorage.getItem('flowmuse_settings') || '{}');
        const saveSettingsData = (data) => localStorage.setItem('flowmuse_settings', JSON.stringify({...getSettings(), ...data}));
        const getLogs = () => JSON.parse(localStorage.getItem('flowmuse_logs') || '{}');
        const saveLogData = (date, data) => {
            const logs = getLogs();
            logs[date] = data;
            localStorage.setItem('flowmuse_logs', JSON.stringify(logs));
        };

        // Initialize
        document.addEventListener('DOMContentLoaded', () => {
            setupMoodSelector();
            setTodayDate();
            loadSettings();
        });

        function startApp() {
            const settings = getSettings();
            if (!settings.lastPeriod) {
                document.getElementById('onboarding-modal').classList.add('active');
            } else {
                showAppInterface();
            }
        }

        function showAppInterface() {
            document.getElementById('landing').style.display = 'none';
            document.getElementById('app').classList.add('active');
            updateDashboard();
            renderCalendar();
        }

        function completeOnboarding() {
            const name = document.getElementById('onboard-name').value || 'Friend';
            const cycleLength = document.getElementById('onboard-cycle-length').value;
            const periodDuration = document.getElementById('onboard-period-duration').value;
            const lastPeriod = document.getElementById('onboard-last-period').value;
            if (!lastPeriod) { alert('Please enter your last period start date'); return; }
            saveSettingsData({ name, cycleLength, periodDuration, lastPeriod });
            document.getElementById('onboarding-modal').classList.remove('active');
            showAppInterface();
        }

        function setupMoodSelector() {
            document.querySelectorAll('.mood-option').forEach(opt => {
                opt.addEventListener('click', function() {
                    document.querySelectorAll('.mood-option').forEach(o => o.classList.remove('selected'));
                    this.classList.add('selected');
                });
            });
        }

        function setTodayDate() {
            const today = new Date().toISOString().split('T')[0];
            document.getElementById('log-date').value = today;
            loadLogForDate(today);
        }

        function loadLogForDate(date) {
            const logs = getLogs();
            const log = logs[date];
            if (log) {
                document.querySelectorAll('.mood-option').forEach(opt => {
                    opt.classList.remove('selected');
                    if (parseInt(opt.dataset.mood) === log.mood) opt.classList.add('selected');
                });
                document.getElementById('log-sleep').value = log.sleep || '';
                document.getElementById('log-exercise-duration').value = log.exercise || '';
                document.getElementById('log-exercise-type').value = log.exerciseType || '';
                document.getElementById('log-notes').value = log.notes || '';
                document.querySelectorAll('#symptom-checks input[type="checkbox"]').forEach(cb => {
                    cb.checked = log.symptoms && log.symptoms.includes(cb.value);
                });
            } else {
                document.querySelectorAll('.mood-option').forEach(opt => opt.classList.remove('selected'));
                document.getElementById('log-sleep').value = '';
                document.getElementById('log-exercise-duration').value = '';
                document.getElementById('log-exercise-type').value = '';
                document.getElementById('log-notes').value = '';
                document.querySelectorAll('#symptom-checks input[type="checkbox"]').forEach(cb => cb.checked = false);
            }
        }

        function saveLog() {
            const date = document.getElementById('log-date').value;
            const moodEl = document.querySelector('.mood-option.selected');
            const mood = moodEl ? parseInt(moodEl.dataset.mood) : 3;
            const sleep = parseFloat(document.getElementById('log-sleep').value) || 0;
            const exercise = parseInt(document.getElementById('log-exercise-duration').value) || 0;
            const exerciseType = document.getElementById('log-exercise-type').value;
            const notes = document.getElementById('log-notes').value;
            const symptoms = Array.from(document.querySelectorAll('#symptom-checks input[type="checkbox"]:checked')).map(cb => cb.value);
            
            saveLogData(date, { mood, sleep, exercise, exerciseType, notes, symptoms });
            alert('Log saved! 💕');
            updateDashboard();
            renderCalendar();
        }

        function showPage(page) {
            document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
            document.getElementById(page).classList.add('active');
            document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
            event.target.classList.add('active');
            
            if (page === 'dashboard') updateDashboard();
            if (page === 'calendar') renderCalendar();
            if (page === 'insights') updateInsights();
            if (page === 'log') setTodayDate();
        }

        function getCurrentPhase() {
            const settings = getSettings();
            if (!settings.lastPeriod) return { phase: 'Unknown', description: 'Set your last period date in Settings', class: 'phase-follicular' };
            
            const lastPeriod = new Date(settings.lastPeriod);
            const today = new Date();
            const daysSince = Math.floor((today - lastPeriod) / (1000 * 60 * 60 * 24));
            const cycleDay = daysSince % settings.cycleLength;
            if (cycleDay < settings.periodDuration) return { phase: 'Menstrual', description: 'Time for rest and self-care', class: 'phase-menstrual' };
            else if (cycleDay < settings.cycleLength / 2) return { phase: 'Follicular', description: 'Energy is rising, great for new beginnings', class: 'phase-follicular' };
            else if (cycleDay === Math.floor(settings.cycleLength / 2)) return { phase: 'Ovulation', description: 'Peak energy and creativity', class: 'phase-ovulation' };
            else return { phase: 'Luteal', description: 'Winding down, focus on completion and reflection', class: 'phase-luteal' };    
        }

        function updateDashboard() {
            const settings = getSettings();
            const greetingEl = document.getElementById('greeting');
            const name = settings.name || 'Friend';
            const hours = new Date().getHours();
            let greetingText = 'Hello';
            if (hours < 12) greetingText = 'Good Morning';
            else if (hours < 18) greetingText = 'Good Afternoon';
            else greetingText = 'Good Evening';
            greetingEl.textContent = `${greetingText}, ${name}! 🌸`;

            const phaseInfo = getCurrentPhase();
            const phaseDisplay = document.getElementById('phase-display');
            phaseDisplay.innerHTML = `<div class="phase-badge ${phaseInfo.class}">${phaseInfo.phase}</div><p>${phaseInfo.description}</p>`;

            const today = new Date().toISOString().split('T')[0];
            const logs = getLogs();
            const todayLog = logs[today] || {};
            document.getElementById('today-mood').textContent = todayLog.mood ? getMoodEmoji(todayLog.mood) : '--';
            document.getElementById('today-sleep').textContent = todayLog.sleep ? `${todayLog.sleep} hrs` : '--';
            document.getElementById('today-exercise').textContent = todayLog.exercise ? `${todayLog.exercise} mins` : '--';

            updateMoodPrediction();
            updateSelfCareTips();
            updateDailyQuote();
            renderTrendChart();
        }
        function getMoodEmoji(mood) {
            switch(mood) {
                case 5: return '😄';
                case 4: return '🙂';
                case 3: return '😐';
                case 2: return '😔';
                case 1: return '😢';
                default: return '--';
            }
        }
        function updateMoodPrediction() {
            // Simple random prediction for demo purposes
            const moods = [5, 4, 3, 2, 1];
            const predictedMood = moods[Math.floor(Math.random() * moods.length)];
            const confidence = Math.floor(Math.random() * 30) + 70; // 70% to 100%
            const predictionBox = document.getElementById('mood-prediction');
            predictionBox.innerHTML = `
                <div class="prediction-emoji">${getMoodEmoji(predictedMood)}</div>
                <div class="prediction-text">Tomorrow's Mood: ${getMoodEmoji(predictedMood)}</div>
                <div class="confidence">Confidence: ${confidence}%</div>
            `;
        }                       

        function updateSelfCareTips() {
            const phaseInfo = getCurrentPhase();
            const tipsBox = document.getElementById('self-care-tips');
            let tips = [];
            if (phaseInfo.phase === 'Menstrual') {
                tips = [
                    'Take warm baths to ease cramps.',
                    'Practice gentle yoga or stretching.',
                    'Focus on nourishing foods rich in iron.'
                ];
            } else if (phaseInfo.phase === 'Follicular') {
                tips = [
                    'Start a new hobby or project.',
                    'Incorporate cardio exercises into your routine.',
                    'Try meditation to enhance focus.'
                ];
            } else if (phaseInfo.phase === 'Ovulation') {
                tips = [
                    'Engage in social activities.',
                    'Channel your energy into creative pursuits.',
                    'Maintain a balanced diet to support energy levels.'
                ];
            } else if (phaseInfo.phase === 'Luteal') {
                tips = [
                    'Prioritize rest and relaxation.',
                    'Complete pending tasks to reduce stress.',
                    'Incorporate magnesium-rich foods to alleviate PMS symptoms.'
                ];
            }
            tipsBox.innerHTML = tips.map(tip => `<div class="tip-item">${tip}</div>`).join('');
        }

        function updateDailyQuote() {
            const quotes = [
                "“The rhythm of the body, the melody of the mind & the harmony of the soul create the symphony of life.” – B.K.S. Iyengar",
                "“Self-care is how you take your power back.” – Lalah Delia",
                "“Your body is your temple. Keep it pure and clean for the soul to reside in.” – B.K.S. Iyengar",
                "“Caring for myself is not self-indulgence, it is self-preservation.” – Audre Lorde",
                "“Listen to your body. It’s smarter than you are.” – Unknown"
            ];
            const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
            document.getElementById('daily-quote').textContent = randomQuote;
        }

        function renderTrendChart() {
            const logs = getLogs();
            const dates = Object.keys(logs).sort();
            const moods = dates.map(date => logs[date].mood || 3);
            const ctx = document.getElementById('trendChart').getContext('2d');
            if (trendChart) trendChart.destroy();
            trendChart = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: dates,
                    datasets: [{
                        label: 'Mood Over Time',
                        data: moods,
                        borderColor: 'var(--rose)',
                        backgroundColor: 'rgba(255, 182, 193, 0.2)',
                        fill: true,
                        tension: 0.3,
                        pointRadius: 5,
                        pointHoverRadius: 7
                    }]
                },
                options: {
                    scales: {
                        y: { min: 1, max: 5, ticks: { stepSize: 1, callback: val => getMoodEmoji(val) } }
                    },
                    plugins: { legend: { display: false } }
                }
            });
        }
 
        function renderCalendar() {
            const calendarGrid = document.getElementById('calendar-grid');
            calendarGrid.innerHTML = '';
            const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
            document.getElementById('current-month').textContent = `${monthNames[currentMonth.getMonth()]} ${currentMonth.getFullYear()}`;

            const firstDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
            const lastDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
            const startDay = firstDay.getDay();
            const totalDays = lastDay.getDate();
            const logs = getLogs();

            // Fill in previous month's days
            const prevMonthLastDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 0).getDate();
            for (let i = startDay - 1; i >= 0; i--) {
                const dayEl = document.createElement('div');
                dayEl.classList.add('calendar-day', 'other-month');
                dayEl.textContent = prevMonthLastDay - i;
                calendarGrid.appendChild(dayEl);
            }

            // Fill in current month's days
            for (let day = 1; day <= totalDays; day++) {
                const dateStr = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                const dayEl = document.createElement('div');
                dayEl.classList.add('calendar-day');
                if (logs[dateStr]) dayEl.classList.add('has-log');
                if (dateStr === new Date().toISOString().split('T')[0]) dayEl.classList.add('today');
                if (showPredictedPeriods && isPredictedPeriodDay(dateStr)) dayEl.classList.add('predicted-period');
                dayEl.textContent = day;
                dayEl.addEventListener('click', () => openDayModal(dateStr));
                calendarGrid.appendChild(dayEl);
            }

            // Fill in next month's days
            const totalCells = calendarGrid.children.length;
            const nextDays = totalCells % 7 === 0 ? 0 : 7 - (totalCells % 7);
            for (let i = 1; i <= nextDays; i++) {
                const dayEl = document.createElement('div');
                dayEl.classList.add('calendar-day', 'other-month');
                dayEl.textContent = i;
                calendarGrid.appendChild(dayEl);
            }   
        }
        function togglePredictedPeriods() {
            showPredictedPeriods = document.getElementById('show-predicted-periods').checked;
            renderCalendar();
        }

        function isPredictedPeriodDay(dateStr) {
            const settings = getSettings();
            if (!settings.lastPeriod) return false;
            const lastPeriod = new Date(settings.lastPeriod);
            const targetDate = new Date(dateStr);
            const daysSinceLastPeriod = Math.floor((targetDate - lastPeriod) / (1000 * 60 * 60 * 24));
            const cycleDay = daysSinceLastPeriod % settings.cycleLength;
            return cycleDay >= 0 && cycleDay < settings.periodDuration;
        }

        function changeMonth(offset) {
            currentMonth.setMonth(currentMonth.getMonth() + offset);
            renderCalendar();
        }
        function openDayModal(dateStr) {
            const modal = document.getElementById('day-modal');
            const modalDate = document.getElementById('modal-date');
            const modalBody = document.getElementById('modal-body');
            modalDate.textContent = new Date(dateStr).toDateString();
            const logs = getLogs();
            const log = logs[dateStr];
            if (log) {
                modalBody.innerHTML = `
                    <p><strong>Mood:</strong> ${getMoodEmoji(log.mood)}</p>
                    <p><strong>Sleep:</strong> ${log.sleep || '--'} hrs</p>
                    <p><strong>Exercise:</strong> ${log.exercise || '--'} mins (${log.exerciseType || 'N/A'})</p>
                    <p><strong>Symptoms:</strong> ${log.symptoms ? log.symptoms.join(', ') : 'None'}</p>
                    <p><strong>Notes:</strong> ${log.notes || 'No notes'}</p>
                `;
            } else {
                modalBody.innerHTML = '<p>No log for this day.</p>';
            }
            modal.classList.add('active');
        }
        function closeDayModal() {
            document.getElementById('day-modal').classList.remove('active');
        }
        function updateInsights() {
            renderCorrelationChart();
            renderPatternsList();
        }
        function renderCorrelationChart() {
            const logs = getLogs();
            const dates = Object.keys(logs).sort();
            const moods = dates.map(date => logs[date].mood || 3);
            const sleeps = dates.map(date => logs[date].sleep || 0);
            const ctx = document.getElementById('correlationChart').getContext('2d');
            if (correlationChart) correlationChart.destroy();
            correlationChart = new Chart(ctx, {
                type: 'scatter',
                data: {
                    datasets: [{
                        label: 'Mood vs Sleep',
                        data: dates.map((date, i) => ({ x: sleeps[i], y: moods[i] })),
                        backgroundColor: 'var(--purple)'
                    }]
                },
                options: {
                    scales: {
                        x: { title: { display: true, text: 'Sleep Hours' }, min: 0, max: 12 },
                        y: { title: { display: true, text: 'Mood' }, min: 1, max: 5, ticks: { stepSize: 1, callback: val => getMoodEmoji(val) } }
                    }
                }
            });
        }
        function renderPatternsList() {
            const patternsList = document.getElementById('patterns-list');
            const logs = getLogs();
            const moodCounts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
            Object.values(logs).forEach(log => {
                if (log.mood) moodCounts[log.mood]++;
            });
            const dominantMood = Object.keys(moodCounts).reduce((a, b) => moodCounts[a] > moodCounts[b] ? a : b);
            patternsList.innerHTML = `
                <div class="pattern-item">
                    <strong>Dominant Mood:</strong> ${getMoodEmoji(parseInt(dominantMood))} (${moodCounts[dominantMood]} days)
                </div>
            `;
        }
        function loadSettings() {
            const settings = getSettings();
            if (settings.name) document.getElementById('settings-name').value = settings.name;
            if (settings.cycleLength) document.getElementById('settings-cycle-length').value = settings.cycleLength;
            if (settings.periodDuration) document.getElementById('settings-period-duration').value = settings.periodDuration;
            if (settings.lastPeriod) document.getElementById('settings-last-period').value = settings.lastPeriod;
            if (settings.theme) {
                document.getElementById('settings-theme').value = settings.theme;
                changeTheme();
            }
        }
        function saveSettings() {
            const name = document.getElementById('settings-name').value || 'Friend';
            const cycleLength = document.getElementById('settings-cycle-length').value;
            const periodDuration = document.getElementById('settings-period-duration').value;
            const lastPeriod = document.getElementById('settings-last-period').value;
            if (!lastPeriod) { alert('Please enter your last period start date'); return; }
            saveSettingsData({ name, cycleLength, periodDuration, lastPeriod });
            alert('Settings saved! 🌸');
            updateDashboard();
            renderCalendar();
        }
        function changeTheme() {
            const theme = document.getElementById('settings-theme').value;
            document.body.className = '';
            if (theme === 'light') document.body.classList.add('theme-light');
            else if (theme === 'pastel') document.body.classList.add('theme-pastel');
            else if (theme === 'dark') document.body.classList.add('theme-dark');
            saveSettingsData({ theme });
        }
        function clearAllData() {
            if (confirm('Are you sure you want to clear all your data? This action cannot be undone.')) {
                localStorage.clear();
                alert('All data cleared. The app will reload now.');
                location.reload();
            }
        }
  