/**
 * Water Usage Charts
 * Handles all chart-related functionality for the Smart Water Meter application
 */

// Global chart references
const charts = {};

/**
 * Initialize usage chart for a specific meter
 * @param {string} canvasId - The ID of the canvas element
 * @param {Object} data - The chart data
 * @param {string} [type='line'] - The chart type (line, bar, etc.)
 * @returns {Chart} The Chart.js instance
 */
function initUsageChart(canvasId, data, type = 'line') {
    const ctx = document.getElementById(canvasId);
    if (!ctx) return null;
    
    // Destroy existing chart if it exists
    if (charts[canvasId]) {
        charts[canvasId].destroy();
    }
    
    const chart = new Chart(ctx, {
        type: type,
        data: data,
        options: getChartOptions()
    });
    
    // Store reference to the chart
    charts[canvasId] = chart;
    return chart;
}

/**
 * Get default chart options
 * @returns {Object} Chart.js options
 */
function getChartOptions() {
    return {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
            mode: 'index',
            intersect: false,
        },
        plugins: {
            legend: {
                position: 'top',
                labels: {
                    boxWidth: 12,
                    padding: 16,
                    usePointStyle: true,
                }
            },
            tooltip: {
                backgroundColor: 'rgba(0, 0, 0, 0.85)',
                padding: 12,
                titleFont: {
                    size: 14,
                    weight: 'bold'
                },
                bodyFont: {
                    size: 13
                },
                footerFont: {
                    size: 12,
                    style: 'italic'
                },
                callbacks: {
                    label: function(context) {
                        let label = context.dataset.label || '';
                        if (label) {
                            label += ': ';
                        }
                        if (context.parsed.y !== null) {
                            label += context.parsed.y.toLocaleString() + ' L';
                        }
                        return label;
                    }
                }
            }
        },
        scales: {
            x: {
                grid: {
                    display: false
                },
                ticks: {
                    maxRotation: 45,
                    minRotation: 45
                }
            },
            y: {
                beginAtZero: true,
                ticks: {
                    callback: function(value) {
                        return value.toLocaleString() + ' L';
                    }
                },
                title: {
                    display: true,
                    text: 'Water Usage (Liters)'
                }
            }
        },
        animation: {
            duration: 1000,
            easing: 'easeInOutQuart'
        }
    };
}

/**
 * Update chart data
 * @param {string} chartId - The ID of the chart to update
 * @param {Object} newData - The new chart data
 */
function updateChartData(chartId, newData) {
    const chart = charts[chartId];
    if (chart) {
        chart.data.labels = newData.labels;
        chart.data.datasets = newData.datasets;
        chart.update();
    }
}

/**
 * Load daily usage data
 * @param {string} meterId - The ID of the meter
 * @param {string} date - The date in YYYY-MM-DD format
 * @param {Function} callback - Callback function with the data
 */
function loadDailyUsageData(meterId, date, callback) {
    // This would typically be an AJAX call to your backend
    // For now, we'll use mock data
    const mockData = {
        labels: Array.from({length: 24}, (_, i) => `${i}:00`),
        datasets: [{
            label: 'Water Usage',
            data: Array.from({length: 24}, () => Math.floor(Math.random() * 50) + 10),
            backgroundColor: 'rgba(54, 162, 235, 0.2)',
            borderColor: 'rgba(54, 162, 235, 1)',
            borderWidth: 2,
            tension: 0.3,
            fill: true
        }]
    };
    
    // Simulate network delay
    setTimeout(() => {
        if (typeof callback === 'function') {
            callback(mockData);
        }
    }, 500);
}

/**
 * Load weekly usage data
 * @param {string} meterId - The ID of the meter
 * @param {string} startDate - The start date in YYYY-MM-DD format
 * @param {Function} callback - Callback function with the data
 */
function loadWeeklyUsageData(meterId, startDate, callback) {
    // This would typically be an AJAX call to your backend
    const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const mockData = {
        labels: weekDays,
        datasets: [{
            label: 'Daily Average',
            data: weekDays.map(() => Math.floor(Math.random() * 100) + 50),
            backgroundColor: 'rgba(75, 192, 192, 0.2)',
            borderColor: 'rgba(75, 192, 192, 1)',
            borderWidth: 2,
            tension: 0.3,
            fill: true
        }]
    };
    
    // Simulate network delay
    setTimeout(() => {
        if (typeof callback === 'function') {
            callback(mockData);
        }
    }, 500);
}

/**
 * Load monthly usage data
 * @param {string} meterId - The ID of the meter
 * @param {string} year - The year in YYYY format
 * @param {Function} callback - Callback function with the data
 */
function loadMonthlyUsageData(meterId, year, callback) {
    // This would typically be an AJAX call to your backend
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const mockData = {
        labels: months,
        datasets: [{
            label: 'Monthly Usage',
            data: months.map(() => Math.floor(Math.random() * 1000) + 500),
            backgroundColor: 'rgba(153, 102, 255, 0.2)',
            borderColor: 'rgba(153, 102, 255, 1)',
            borderWidth: 2,
            tension: 0.3,
            fill: true
        }]
    };
    
    // Simulate network delay
    setTimeout(() => {
        if (typeof callback === 'function') {
            callback(mockData);
        }
    }, 500);
}

/**
 * Initialize period toggles for charts
 * @param {string} chartId - The ID of the chart
 * @param {string} meterId - The ID of the meter
 */
function initPeriodToggles(chartId, meterId) {
    const periodButtons = document.querySelectorAll(`[data-chart="${chartId}"][data-period]`);
    
    periodButtons.forEach(button => {
        button.addEventListener('click', function() {
            const period = this.getAttribute('data-period');
            const activeClass = 'active';
            
            // Update active button
            periodButtons.forEach(btn => btn.classList.remove(activeClass));
            this.classList.add(activeClass);
            
            // Show loading state
            const chartContainer = document.getElementById(chartId).parentElement;
            const loadingHtml = `
                <div class="chart-loading text-center py-5">
                    <div class="spinner-border text-primary" role="status">
                        <span class="visually-hidden">Loading...</span>
                    </div>
                    <p class="mt-2 text-muted">Loading ${period} data...</p>
                </div>
            `;
            
            chartContainer.innerHTML = loadingHtml + chartContainer.innerHTML;
            
            // Load data based on period
            const today = new Date();
            
            const loadChart = (dataLoader) => {
                dataLoader(meterId, today.toISOString().split('T')[0], (data) => {
                    // Remove loading state
                    const loadingElement = chartContainer.querySelector('.chart-loading');
                    if (loadingElement) {
                        loadingElement.remove();
                    }
                    
                    // Update chart
                    updateChartData(chartId, data);
                });
            };
            
            switch (period) {
                case 'day':
                    loadChart(loadDailyUsageData);
                    break;
                case 'week':
                    loadChart(loadWeeklyUsageData);
                    break;
                case 'month':
                    loadChart(loadMonthlyUsageData);
                    break;
            }
        });
    });
}

// Make functions available globally
window.chartUtils = {
    initUsageChart,
    updateChartData,
    loadDailyUsageData,
    loadWeeklyUsageData,
    loadMonthlyUsageData,
    initPeriodToggles
};

// Initialize any charts when the document is ready
document.addEventListener('DOMContentLoaded', function() {
    // Example: Initialize any charts with data attributes
    document.querySelectorAll('[data-chart]').forEach(chartElement => {
        const chartId = chartElement.id;
        const chartType = chartElement.getAttribute('data-chart-type') || 'line';
        const chartData = JSON.parse(chartElement.getAttribute('data-chart-data') || '{}');
        
        if (chartId && chartData) {
            initUsageChart(chartId, chartData, chartType);
            
            // If there are period toggles, initialize them
            const meterId = chartElement.getAttribute('data-meter-id');
            if (meterId) {
                initPeriodToggles(chartId, meterId);
            }
        }
    });
});
