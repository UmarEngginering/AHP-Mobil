/**
 * AHP Decision Support System - Interactive Frontend Engine
 * Powered by Chart.js and Vanilla JS
 */

let ahpData = {};
let chartCriteriaDoughnut = null;
let chartStackedScores = null;
let chartRadar = null;
let chartSimulatedBar = null;

// Initialize on DOM Ready
document.addEventListener('DOMContentLoaded', () => {
    // 1. Load initial JSON data
    const rawDataEl = document.getElementById('initialAhpData');
    if (rawDataEl) {
        try {
            ahpData = JSON.parse(rawDataEl.textContent);
        } catch (e) {
            console.error('Error parsing initial AHP data:', e);
        }
    }

    // 2. Theme Initialization
    initTheme();

    // 3. Initialize Charts
    initCharts();

    // 4. Initialize Sensitivity Simulation Sliders
    initSimulator();

    // 5. Initialize Upload Modal & Reset Actions
    initActions();

    // 6. Initialize Student Biodata & Profile Photo Widget
    initBiodata();
});

// ================= TAB NAVIGATION =================
function switchTab(tabId) {
    // Hide all tab contents
    document.querySelectorAll('.tab-content').forEach(el => el.classList.add('hidden'));

    // Remove active styles from tab buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active-tab', 'border-brand-600', 'text-brand-600', 'dark:text-brand-400');
        btn.classList.add('border-transparent', 'text-slate-500', 'dark:text-slate-400');
    });

    // Show target tab
    const targetContent = document.getElementById(`tab-${tabId}`);
    if (targetContent) targetContent.classList.remove('hidden');

    // Highlight button
    const activeBtn = document.getElementById(`tabBtn-${tabId}`);
    if (activeBtn) {
        activeBtn.classList.add('active-tab', 'border-brand-600', 'text-brand-600', 'dark:text-brand-400');
        activeBtn.classList.remove('border-transparent', 'text-slate-500', 'dark:text-slate-400');
    }

    // Trigger chart resize if entering charts tab
    if (tabId === 'dashboard') {
        if (chartCriteriaDoughnut) chartCriteriaDoughnut.resize();
        if (chartStackedScores) chartStackedScores.resize();
        if (chartRadar) chartRadar.resize();
    } else if (tabId === 'simulator') {
        if (chartSimulatedBar) chartSimulatedBar.resize();
    }
}

function switchSubMatrix(subId) {
    document.querySelectorAll('.submatrix-panel').forEach(el => el.classList.add('hidden'));
    document.querySelectorAll('.subtab-btn').forEach(btn => {
        btn.classList.remove('active-subtab', 'bg-white', 'dark:bg-slate-700', 'text-brand-600', 'dark:text-brand-300', 'shadow-sm');
        btn.classList.add('text-slate-600', 'dark:text-slate-300');
    });

    const target = document.getElementById(`subMatrix-${subId}`);
    if (target) target.classList.remove('hidden');

    const btn = document.getElementById(`subTabBtn-${subId}`);
    if (btn) {
        btn.classList.add('active-subtab', 'bg-white', 'dark:bg-slate-700', 'text-brand-600', 'dark:text-brand-300', 'shadow-sm');
        btn.classList.remove('text-slate-600', 'dark:text-slate-300');
    }
}

// ================= CHART INITIALIZATION =================
function isDarkMode() {
    return document.documentElement.classList.contains('dark');
}

function getChartColors() {
    const dark = isDarkMode();
    return {
        text: dark ? '#cbd5e1' : '#475569',
        grid: dark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)',
    };
}

function initCharts() {
    if (!ahpData || !ahpData.synthesis) return;

    const colors = getChartColors();

    // 1. Doughnut Chart: Criteria Weights
    const ctxDoughnut = document.getElementById('chartCriteriaDoughnut');
    if (ctxDoughnut) {
        chartCriteriaDoughnut = new Chart(ctxDoughnut, {
            type: 'doughnut',
            data: {
                labels: ['Style (Gaya)', 'Keandalan (Mesin)', 'Konsumsi BBM'],
                datasets: [{
                    data: [
                        (ahpData.criteria.weights[0] * 100).toFixed(2),
                        (ahpData.criteria.weights[1] * 100).toFixed(2),
                        (ahpData.criteria.weights[2] * 100).toFixed(2)
                    ],
                    backgroundColor: [
                        'rgba(236, 72, 153, 0.85)', // Pink (Style)
                        'rgba(79, 70, 229, 0.85)',  // Brand/Indigo (Keandalan)
                        'rgba(16, 185, 129, 0.85)'  // Emerald (BBM)
                    ],
                    borderColor: isDarkMode() ? '#1e293b' : '#ffffff',
                    borderWidth: 2,
                    hoverOffset: 6
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            color: colors.text,
                            font: { family: 'Plus Jakarta Sans', size: 11, weight: '600' },
                            padding: 12
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: function(ctx) {
                                return ` ${ctx.label}: ${ctx.raw}%`;
                            }
                        }
                    }
                },
                cutout: '68%'
            }
        });
    }

    // 2. Stacked Bar Chart: Breakdown of each car's score
    const ctxStacked = document.getElementById('chartStackedScores');
    if (ctxStacked) {
        const sorted = ahpData.synthesis.sorted_results;
        const labels = sorted.map(i => i.name);
        const styleContrib = sorted.map(i => (i.breakdown[0].contribution * 100).toFixed(2));
        const keandalanContrib = sorted.map(i => (i.breakdown[1].contribution * 100).toFixed(2));
        const bbmContrib = sorted.map(i => (i.breakdown[2].contribution * 100).toFixed(2));

        chartStackedScores = new Chart(ctxStacked, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: 'Kontribusi Style',
                        data: styleContrib,
                        backgroundColor: 'rgba(236, 72, 153, 0.85)',
                        borderRadius: 4
                    },
                    {
                        label: 'Kontribusi Keandalan',
                        data: keandalanContrib,
                        backgroundColor: 'rgba(79, 70, 229, 0.85)',
                        borderRadius: 4
                    },
                    {
                        label: 'Kontribusi BBM',
                        data: bbmContrib,
                        backgroundColor: 'rgba(16, 185, 129, 0.85)',
                        borderRadius: 4
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    x: {
                        stacked: true,
                        grid: { display: false },
                        ticks: { color: colors.text, font: { family: 'Plus Jakarta Sans', weight: '600' } }
                    },
                    y: {
                        stacked: true,
                        beginAtZero: true,
                        max: 60,
                        grid: { color: colors.grid },
                        ticks: {
                            color: colors.text,
                            callback: value => `${value}%`
                        }
                    }
                },
                plugins: {
                    legend: {
                        position: 'top',
                        labels: { color: colors.text, font: { family: 'Plus Jakarta Sans', size: 11 } }
                    },
                    tooltip: {
                        callbacks: {
                            label: function(ctx) {
                                return ` ${ctx.dataset.label}: ${ctx.raw}%`;
                            }
                        }
                    }
                }
            }
        });
    }

    // 3. Radar Chart: Multi-Criteria Profile
    const ctxRadar = document.getElementById('chartRadar');
    if (ctxRadar) {
        const alts = ahpData.alternative_names;
        const styleW = ahpData.style.weights;
        const keandalanW = ahpData.keandalan.weights;
        const bbmW = ahpData.bbm.weights;

        const radarColors = [
            { bg: 'rgba(239, 68, 68, 0.2)', border: '#ef4444' },   // Avanza
            { bg: 'rgba(245, 158, 11, 0.2)', border: '#f59e0b' },  // Xenia
            { bg: 'rgba(16, 185, 129, 0.2)', border: '#10b981' },  // Ertiga (Winner)
            { bg: 'rgba(99, 102, 241, 0.2)', border: '#6366f1' }   // Grand Livina
        ];

        const datasets = alts.map((name, idx) => ({
            label: name,
            data: [
                (styleW[idx] * 100).toFixed(1),
                (keandalanW[idx] * 100).toFixed(1),
                (bbmW[idx] * 100).toFixed(1)
            ],
            backgroundColor: radarColors[idx].bg,
            borderColor: radarColors[idx].border,
            borderWidth: 2,
            pointBackgroundColor: radarColors[idx].border
        }));

        chartRadar = new Chart(ctxRadar, {
            type: 'radar',
            data: {
                labels: ['Style', 'Keandalan', 'Konsumsi BBM'],
                datasets: datasets
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    r: {
                        beginAtZero: true,
                        max: 60,
                        angleLines: { color: colors.grid },
                        grid: { color: colors.grid },
                        pointLabels: {
                            color: colors.text,
                            font: { family: 'Plus Jakarta Sans', size: 11, weight: '700' }
                        },
                        ticks: {
                            backdropColor: 'transparent',
                            color: colors.text,
                            stepSize: 15
                        }
                    }
                },
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: { color: colors.text, font: { family: 'Plus Jakarta Sans', size: 10 } }
                    }
                }
            }
        });
    }

    // 4. Initial Simulation Chart
    initSimulatedChart();
}

function updateChartThemes() {
    const colors = getChartColors();
    [chartCriteriaDoughnut, chartStackedScores, chartRadar, chartSimulatedBar].forEach(chart => {
        if (!chart) return;
        if (chart.options.scales) {
            Object.values(chart.options.scales).forEach(scale => {
                if (scale.ticks) scale.ticks.color = colors.text;
                if (scale.grid) scale.grid.color = colors.grid;
                if (scale.pointLabels) scale.pointLabels.color = colors.text;
                if (scale.angleLines) scale.angleLines.color = colors.grid;
            });
        }
        if (chart.options.plugins && chart.options.plugins.legend) {
            chart.options.plugins.legend.labels.color = colors.text;
        }
        chart.update();
    });
}

// ================= SIMULATOR & SENSITIVITY ANALYSIS =================
function initSimulatedChart() {
    const ctx = document.getElementById('chartSimulatedBar');
    if (!ctx || !ahpData || !ahpData.synthesis) return;

    const colors = getChartColors();
    const sorted = ahpData.synthesis.sorted_results;

    chartSimulatedBar = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: sorted.map(i => i.name),
            datasets: [{
                label: 'Skor Simulasi (%)',
                data: sorted.map(i => i.score_percent.toFixed(2)),
                backgroundColor: [
                    'rgba(245, 158, 11, 0.85)', // 1st
                    'rgba(99, 102, 241, 0.8)',
                    'rgba(148, 163, 184, 0.8)',
                    'rgba(148, 163, 184, 0.6)'
                ],
                borderRadius: 6
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: {
                    grid: { display: false },
                    ticks: { color: colors.text, font: { family: 'Plus Jakarta Sans', weight: '600' } }
                },
                y: {
                    beginAtZero: true,
                    max: 60,
                    grid: { color: colors.grid },
                    ticks: {
                        color: colors.text,
                        callback: val => `${val}%`
                    }
                }
            },
            plugins: {
                legend: { display: false },
                tooltip: {
                    callbacks: {
                        label: ctx => ` Skor: ${ctx.raw}%`
                    }
                }
            }
        }
    });

    renderSimulatedRanking(sorted);
}

function initSimulator() {
    const sliderS = document.getElementById('sliderWeightS');
    const sliderK = document.getElementById('sliderWeightK');
    const sliderB = document.getElementById('sliderWeightB');
    const btnReset = document.getElementById('btnResetSimulation');

    if (!sliderS || !sliderK || !sliderB) return;

    function handleSliderChange() {
        const valS = parseFloat(sliderS.value) || 0;
        const valK = parseFloat(sliderK.value) || 0;
        const valB = parseFloat(sliderB.value) || 0;

        const sum = valS + valK + valB;
        const normS = sum > 0 ? valS / sum : 1/3;
        const normK = sum > 0 ? valK / sum : 1/3;
        const normB = sum > 0 ? valB / sum : 1/3;

        // Update labels
        document.getElementById('labelSimWeightS').textContent = `${(normS * 100).toFixed(1)}%`;
        document.getElementById('labelSimWeightK').textContent = `${(normK * 100).toFixed(1)}%`;
        document.getElementById('labelSimWeightB').textContent = `${(normB * 100).toFixed(1)}%`;

        // Calculate scores in real-time
        recalculateSimulation(normS, normK, normB);
    }

    sliderS.addEventListener('input', handleSliderChange);
    sliderK.addEventListener('input', handleSliderChange);
    sliderB.addEventListener('input', handleSliderChange);

    if (btnReset) {
        btnReset.addEventListener('click', () => {
            sliderS.value = 32;
            sliderK.value = 56;
            sliderB.value = 12;
            handleSliderChange();
            showToast('Bobot simulator dikembalikan ke nilai default Excel.', 'info');
        });
    }

    handleSliderChange();
}

function recalculateSimulation(wS, wK, wB) {
    if (!ahpData || !ahpData.alternative_names) return;

    const alts = ahpData.alternative_names;
    const styleW = ahpData.style.weights;
    const keanW = ahpData.keandalan.weights;
    const bbmW = ahpData.bbm.weights;

    const results = alts.map((name, idx) => {
        const score = (wS * styleW[idx]) + (wK * keanW[idx]) + (wB * bbmW[idx]);
        return {
            name: name,
            score: score,
            score_percent: score * 100
        };
    });

    results.sort((a, b) => b.score - a.score);
    results.forEach((item, index) => {
        item.rank = index + 1;
    });

    renderSimulatedRanking(results);

    // Update Chart
    if (chartSimulatedBar) {
        chartSimulatedBar.data.labels = results.map(i => i.name);
        chartSimulatedBar.data.datasets[0].data = results.map(i => i.score_percent.toFixed(2));
        chartSimulatedBar.data.datasets[0].backgroundColor = results.map((i, idx) => {
            if (idx === 0) return 'rgba(245, 158, 11, 0.85)';
            if (idx === 1) return 'rgba(99, 102, 241, 0.8)';
            return 'rgba(148, 163, 184, 0.7)';
        });
        chartSimulatedBar.update();
    }
}

function renderSimulatedRanking(results) {
    const container = document.getElementById('simulatedRankingList');
    if (!container) return;

    container.innerHTML = results.map(item => `
        <div class="p-3 rounded-xl ${item.rank === 1 ? 'bg-amber-100/70 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-700/60' : 'bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700'} flex items-center justify-between transition">
            <div class="flex items-center gap-3">
                <span class="w-6 h-6 rounded-full ${item.rank === 1 ? 'bg-amber-400 text-slate-900' : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'} flex items-center justify-center font-bold text-xs">
                    ${item.rank}
                </span>
                <div>
                    <h5 class="text-xs font-bold text-slate-800 dark:text-white flex items-center gap-1.5">
                        ${item.name}
                        ${item.rank === 1 ? '<span class="text-[10px] px-1.5 py-0.2 rounded bg-amber-400 text-slate-900 font-extrabold">Terpilih</span>' : ''}
                    </h5>
                    <div class="w-24 bg-slate-200 dark:bg-slate-700 rounded-full h-1.5 mt-1 overflow-hidden">
                        <div class="h-1.5 rounded-full ${item.rank === 1 ? 'bg-amber-400' : 'bg-brand-500'}" style="width: ${item.score_percent}%"></div>
                    </div>
                </div>
            </div>
            <div class="text-right">
                <span class="text-xs font-extrabold font-mono text-brand-600 dark:text-brand-400">${item.score_percent.toFixed(2)}%</span>
                <span class="block text-[10px] text-slate-400 font-mono">${item.score.toFixed(4)}</span>
            </div>
        </div>
    `).join('');
}

// ================= THEME TOGGLE =================
function initTheme() {
    const btnTheme = document.getElementById('themeToggle');
    const icon = document.getElementById('themeIcon');
    const saved = localStorage.getItem('ahp_theme');

    if (saved === 'dark' || (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        document.documentElement.classList.add('dark');
        if (icon) {
            icon.classList.remove('fa-moon');
            icon.classList.add('fa-sun');
        }
    } else {
        document.documentElement.classList.remove('dark');
        if (icon) {
            icon.classList.remove('fa-sun');
            icon.classList.add('fa-moon');
        }
    }

    if (btnTheme) {
        btnTheme.addEventListener('click', () => {
            const isDark = document.documentElement.classList.toggle('dark');
            localStorage.setItem('ahp_theme', isDark ? 'dark' : 'light');
            if (icon) {
                if (isDark) {
                    icon.classList.remove('fa-moon');
                    icon.classList.add('fa-sun');
                } else {
                    icon.classList.remove('fa-sun');
                    icon.classList.add('fa-moon');
                }
            }
            updateChartThemes();
        });
    }
}

// ================= UPLOAD MODAL & RESET ACTIONS =================
function initActions() {
    const btnOpenUpload = document.getElementById('btnOpenUpload');
    const btnCloseUpload = document.getElementById('btnCloseUpload');
    const btnCancelUpload = document.getElementById('btnCancelUpload');
    const modal = document.getElementById('uploadModal');
    const fileInput = document.getElementById('excelFileInput');
    const labelFileName = document.getElementById('selectedFileName');
    const uploadForm = document.getElementById('uploadForm');
    const btnResetData = document.getElementById('btnResetData');

    if (btnOpenUpload && modal) {
        btnOpenUpload.addEventListener('click', () => modal.classList.remove('hidden'));
    }

    const closeModal = () => modal && modal.classList.add('hidden');
    if (btnCloseUpload) btnCloseUpload.addEventListener('click', closeModal);
    if (btnCancelUpload) btnCancelUpload.addEventListener('click', closeModal);

    if (fileInput) {
        fileInput.addEventListener('change', (e) => {
            if (e.target.files.length > 0) {
                labelFileName.textContent = e.target.files[0].name;
                labelFileName.classList.add('text-brand-600', 'font-bold');
            }
        });
    }

    if (uploadForm) {
        uploadForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            if (!fileInput.files.length) {
                showToast('Pilih file Excel terlebih dahulu.', 'error');
                return;
            }

            const formData = new FormData();
            formData.append('excel_file', fileInput.files[0]);

            try {
                const res = await fetch('/api/upload-excel', {
                    method: 'POST',
                    body: formData
                });
                const result = await res.json();
                if (result.success) {
                    closeModal();
                    showToast(result.message || 'File Excel berhasil dimuat!', 'success');
                    setTimeout(() => window.location.reload(), 1000);
                } else {
                    showToast(result.error || 'Gagal memproses file Excel.', 'error');
                }
            } catch (err) {
                console.error(err);
                showToast('Terjadi kesalahan saat mengunggah file.', 'error');
            }
        });
    }

    if (btnResetData) {
        btnResetData.addEventListener('click', async () => {
            if (!confirm('Apakah Anda yakin ingin mereset seluruh data kembali ke kondisi default Excel?')) return;
            try {
                const res = await fetch('/api/reset', { method: 'POST' });
                const json = await res.json();
                if (json.success) {
                    showToast('Data berhasil dikembalikan ke nilai awal Excel!', 'success');
                    setTimeout(() => window.location.reload(), 800);
                }
            } catch (err) {
                console.error(err);
                showToast('Gagal mereset data.', 'error');
            }
        });
    }
}

// ================= TOAST NOTIFICATION =================
function showToast(message, type = 'success') {
    const alert = document.getElementById('toastAlert');
    const msg = document.getElementById('toastMsg');
    const icon = document.getElementById('toastIcon');
    if (!alert || !msg) return;

    msg.textContent = message;
    alert.classList.remove('hidden', 'bg-emerald-50', 'bg-rose-50', 'bg-sky-50', 'text-emerald-800', 'text-rose-800', 'text-sky-800', 'border-emerald-300', 'border-rose-300', 'border-sky-300', 'dark:bg-emerald-950/70', 'dark:bg-rose-950/70', 'dark:bg-sky-950/70', 'dark:text-emerald-200', 'dark:text-rose-200', 'dark:text-sky-200');

    if (type === 'success') {
        alert.classList.add('bg-emerald-50', 'text-emerald-800', 'border', 'border-emerald-300', 'dark:bg-emerald-950/70', 'dark:text-emerald-200');
        if (icon) icon.className = 'fa-solid fa-circle-check text-emerald-600 text-lg';
    } else if (type === 'error') {
        alert.classList.add('bg-rose-50', 'text-rose-800', 'border', 'border-rose-300', 'dark:bg-rose-950/70', 'dark:text-rose-200');
        if (icon) icon.className = 'fa-solid fa-triangle-exclamation text-rose-600 text-lg';
    } else {
        alert.classList.add('bg-sky-50', 'text-sky-800', 'border', 'border-sky-300', 'dark:bg-sky-950/70', 'dark:text-sky-200');
        if (icon) icon.className = 'fa-solid fa-circle-info text-sky-600 text-lg';
    }

    setTimeout(() => hideToast(), 4000);
}

function hideToast() {
    const alert = document.getElementById('toastAlert');
    if (alert) alert.classList.add('hidden');
}

// ================= STUDENT BIODATA & PROFILE PHOTO WIDGET =================
function initBiodata() {
    try {
        localStorage.removeItem('ahp_student_biodata');
        localStorage.removeItem('ahp_student_photo');
    } catch (e) {}

    const btnToggle = document.getElementById('btnToggleBiodata');
    const cardExpanded = document.getElementById('biodataExpandedCard');
    const btnClose = document.getElementById('btnCloseBiodataCard');
    const pillChevron = document.getElementById('pillChevron');

    if (btnToggle && cardExpanded) {
        btnToggle.addEventListener('click', () => {
            const isHidden = cardExpanded.classList.toggle('hidden');
            if (pillChevron) {
                if (isHidden) {
                    pillChevron.className = 'fa-solid fa-chevron-up text-xs text-slate-400 group-hover:text-brand-600 transition';
                } else {
                    pillChevron.className = 'fa-solid fa-chevron-down text-xs text-brand-600 transition';
                }
            }
        });
    }

    if (btnClose && cardExpanded) {
        btnClose.addEventListener('click', () => {
            cardExpanded.classList.add('hidden');
            if (pillChevron) pillChevron.className = 'fa-solid fa-chevron-up text-xs text-slate-400 group-hover:text-brand-600 transition';
        });
    }
}
