/**
 * Sovereign Intel - Report Viewer
 * Loads and renders intelligence reports from data.json
 */

// Get report ID from URL
function getReportId() {
    const params = new URLSearchParams(window.location.search);
    return params.get('id');
}

// Format date for display
function formatDate(isoString) {
    if (!isoString) return 'N/A';
    const date = new Date(isoString);
    return date.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Format short date
function formatShortDate(isoString) {
    if (!isoString) return 'N/A';
    const date = new Date(isoString);
    return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    });
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Show error state
function showError(message) {
    document.getElementById('loading').classList.add('hidden');
    document.getElementById('error').classList.remove('hidden');
    document.getElementById('error-message').textContent = message;
}

// Show content
function showContent() {
    document.getElementById('loading').classList.add('hidden');
    document.getElementById('content').classList.remove('hidden');
}

// Render executive summary
function renderExecutiveSummary(summary) {
    const container = document.getElementById('executive-summary');

    if (!summary) {
        container.innerHTML = '<p class="text-sovereign-100/50 italic">No summary available</p>';
        return;
    }

    // Handle both string and array formats
    const paragraphs = Array.isArray(summary) ? summary : summary.split('\n\n');

    container.innerHTML = paragraphs
        .filter(p => p.trim())
        .map(p => `<p>${escapeHtml(p)}</p>`)
        .join('');
}

// Render recommended actions
function renderRecommendedActions(actions) {
    const container = document.getElementById('recommended-actions');

    if (!actions || actions.length === 0) {
        container.innerHTML = '<li class="text-emerald-300/50 italic">No actions recommended</li>';
        return;
    }

    container.innerHTML = actions.map(action => `
        <li class="flex items-start gap-3">
            <svg class="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <span class="text-emerald-100/80">${escapeHtml(action)}</span>
        </li>
    `).join('');
}

// Render key themes
function renderKeyThemes(themes) {
    const container = document.getElementById('key-themes');

    if (!themes || themes.length === 0) {
        container.innerHTML = '<p class="text-sovereign-100/50 italic">No themes identified</p>';
        return;
    }

    container.innerHTML = themes.map(theme => `
        <div class="border-l-2 border-violet-500/50 pl-4">
            <h3 class="text-white font-medium mb-1">${escapeHtml(theme.title)}</h3>
            <p class="text-sovereign-100/60 text-sm mb-2">${escapeHtml(theme.significance)}</p>
            ${theme.affected_entities && theme.affected_entities.length > 0 ? `
                <div class="flex flex-wrap gap-1">
                    ${theme.affected_entities.map(entity => `
                        <span class="text-xs px-2 py-0.5 bg-violet-500/20 text-violet-300 rounded">${escapeHtml(entity)}</span>
                    `).join('')}
                </div>
            ` : ''}
        </div>
    `).join('');
}

// Render delta insights
function renderDeltaInsights(insights) {
    const container = document.getElementById('delta-insights');

    if (!insights || insights.length === 0) {
        container.innerHTML = '<p class="text-sovereign-100/50 italic">No recent changes detected</p>';
        return;
    }

    container.innerHTML = insights.map(insight => `
        <div class="border rounded-lg p-3 urgency-${insight.urgency_level || 'low'}">
            <div class="flex items-center justify-between mb-2">
                <span class="text-xs font-medium text-sovereign-100/60">${escapeHtml(insight.theme)}</span>
                <span class="text-xs px-2 py-0.5 rounded ${
                    insight.urgency_level === 'high' ? 'bg-red-500/20 text-red-300' :
                    insight.urgency_level === 'medium' ? 'bg-amber-500/20 text-amber-300' :
                    'bg-green-500/20 text-green-300'
                }">${insight.urgency_level || 'low'}</span>
            </div>
            <p class="text-sovereign-100/80 text-sm">${escapeHtml(insight.change_description)}</p>
        </div>
    `).join('');
}

// Render competitive intel
function renderCompetitiveIntel(intel) {
    const container = document.getElementById('competitive-intel');

    if (!intel || intel.length === 0) {
        container.innerHTML = '<p class="text-sovereign-100/50 italic">No competitive moves detected</p>';
        return;
    }

    const moveTypeColors = {
        product_launch: 'bg-blue-500/20 text-blue-300',
        acquisition: 'bg-purple-500/20 text-purple-300',
        partnership: 'bg-cyan-500/20 text-cyan-300',
        executive_change: 'bg-amber-500/20 text-amber-300',
        funding: 'bg-green-500/20 text-green-300',
        expansion: 'bg-indigo-500/20 text-indigo-300',
        other: 'bg-gray-500/20 text-gray-300'
    };

    container.innerHTML = intel.map(item => `
        <div class="bg-sovereign-800/30 rounded-lg p-4">
            <div class="flex items-center justify-between mb-2">
                <span class="font-semibold text-white">${escapeHtml(item.company)}</span>
                <span class="text-xs px-2 py-0.5 rounded ${moveTypeColors[item.move_type] || moveTypeColors.other}">
                    ${escapeHtml((item.move_type || 'other').replace('_', ' '))}
                </span>
            </div>
            <p class="text-sovereign-100/70 text-sm mb-2">${escapeHtml(item.description)}</p>
            <p class="text-sovereign-100/50 text-xs italic">${escapeHtml(item.strategic_implication)}</p>
        </div>
    `).join('');
}

// Render risk signals
function renderRiskSignals(risks) {
    const container = document.getElementById('risk-signals');

    if (!risks || risks.length === 0) {
        container.innerHTML = '<p class="text-sovereign-100/50 italic">No significant risks detected</p>';
        return;
    }

    const categoryIcons = {
        regulatory: '⚖️',
        market: '📊',
        technology: '💻',
        competitive: '🎯',
        legal: '📋',
        operational: '⚙️'
    };

    container.innerHTML = risks.map(risk => `
        <div class="bg-sovereign-800/30 rounded-lg p-4">
            <div class="flex items-center justify-between mb-2">
                <span class="text-sm">
                    <span class="mr-1">${categoryIcons[risk.risk_category] || '⚠️'}</span>
                    <span class="text-sovereign-100/60 capitalize">${escapeHtml(risk.risk_category)}</span>
                </span>
                <span class="text-xs likelihood-${risk.likelihood || 'low'}">
                    ${escapeHtml(risk.likelihood || 'low')} likelihood
                </span>
            </div>
            <p class="text-sovereign-100/80 text-sm mb-2">${escapeHtml(risk.description)}</p>
            <p class="text-sovereign-100/50 text-xs">
                <span class="text-sovereign-100/40">Monitor:</span> ${escapeHtml(risk.recommended_monitoring)}
            </p>
        </div>
    `).join('');
}

// Render metadata
function renderMetadata(metadata, generatedAt) {
    const container = document.getElementById('metadata');

    const items = [];

    if (generatedAt) {
        items.push(`Generated: ${formatShortDate(generatedAt)}`);
    }
    if (metadata?.article_count) {
        items.push(`${metadata.article_count} articles analyzed`);
    }
    if (metadata?.source_count) {
        items.push(`${metadata.source_count} sources`);
    }
    if (metadata?.model) {
        items.push(`Model: ${metadata.model}`);
    }

    container.innerHTML = items.map(item => `<span>${escapeHtml(item)}</span>`).join('');

    // Set header date
    document.getElementById('header-date').textContent = formatDate(generatedAt);
}

// Load and render report
async function loadReport() {
    const reportId = getReportId();

    if (!reportId) {
        showError('No report ID provided. Please check your link.');
        return;
    }

    try {
        const response = await fetch(`reports/${reportId}/data.json`);

        if (!response.ok) {
            if (response.status === 404) {
                showError('Report not found. The report may have expired or the ID is incorrect.');
            } else {
                showError(`Failed to load report (Error ${response.status})`);
            }
            return;
        }

        const data = await response.json();

        // Render all sections
        renderExecutiveSummary(data.executive_summary);
        renderRecommendedActions(data.recommended_actions);
        renderKeyThemes(data.sections?.key_themes);
        renderDeltaInsights(data.sections?.delta_insights);
        renderCompetitiveIntel(data.sections?.competitive_intel);
        renderRiskSignals(data.sections?.risk_signals);
        renderMetadata(data.metadata, data.generated_at);

        // Update page title
        document.title = `Intelligence Report - ${formatShortDate(data.generated_at)} - Sovereign Intel`;

        showContent();

    } catch (error) {
        console.error('Failed to load report:', error);
        showError('Failed to load the report. Please try again later.');
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', loadReport);
