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

    // Map urgency levels to better labels
    const urgencyLabels = {
        high: { label: 'Breaking', desc: 'Requires immediate attention' },
        medium: { label: 'New', desc: 'Recent development' },
        low: { label: 'Ongoing', desc: 'Continuing trend' }
    };

    // Legend + insights
    const legend = `
        <div class="flex flex-wrap gap-3 mb-4 pb-3 border-b border-sovereign-700/30 text-xs">
            <span class="text-sovereign-100/40">Legend:</span>
            <span class="flex items-center gap-1">
                <span class="px-1.5 py-0.5 rounded bg-red-500/20 text-red-300">Breaking</span>
                <span class="text-sovereign-100/40">= immediate attention</span>
            </span>
            <span class="flex items-center gap-1">
                <span class="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300">New</span>
                <span class="text-sovereign-100/40">= recent development</span>
            </span>
            <span class="flex items-center gap-1">
                <span class="px-1.5 py-0.5 rounded bg-green-500/20 text-green-300">Ongoing</span>
                <span class="text-sovereign-100/40">= continuing trend</span>
            </span>
        </div>
    `;

    const insightCards = insights.map(insight => {
        const level = insight.urgency_level || 'low';
        const { label } = urgencyLabels[level] || urgencyLabels.low;

        return `
            <div class="border rounded-lg p-3 urgency-${level}">
                <div class="flex items-center justify-between mb-2">
                    <span class="text-xs font-medium text-sovereign-100/60">${escapeHtml(insight.theme)}</span>
                    <span class="text-xs px-2 py-0.5 rounded ${
                        level === 'high' ? 'bg-red-500/20 text-red-300' :
                        level === 'medium' ? 'bg-amber-500/20 text-amber-300' :
                        'bg-green-500/20 text-green-300'
                    }">${label}</span>
                </div>
                <p class="text-sovereign-100/80 text-sm">${escapeHtml(insight.change_description)}</p>
            </div>
        `;
    }).join('');

    container.innerHTML = legend + insightCards;
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

    // Map likelihood to better labels
    const likelihoodLabels = {
        high: { label: 'Likely', class: 'likelihood-high' },
        medium: { label: 'Possible', class: 'likelihood-medium' },
        low: { label: 'Emerging', class: 'likelihood-low' }
    };

    // Legend
    const legend = `
        <div class="flex flex-wrap gap-3 mb-4 pb-3 border-b border-sovereign-700/30 text-xs">
            <span class="text-sovereign-100/40">Likelihood:</span>
            <span class="flex items-center gap-1">
                <span class="likelihood-high font-medium">Likely</span>
                <span class="text-sovereign-100/40">= probable impact on business</span>
            </span>
            <span class="flex items-center gap-1">
                <span class="likelihood-medium font-medium">Possible</span>
                <span class="text-sovereign-100/40">= monitor for escalation</span>
            </span>
            <span class="flex items-center gap-1">
                <span class="likelihood-low font-medium">Emerging</span>
                <span class="text-sovereign-100/40">= early signal, low probability</span>
            </span>
        </div>
    `;

    const riskCards = risks.map(risk => {
        const level = risk.likelihood || 'low';
        const { label, class: likelihoodClass } = likelihoodLabels[level] || likelihoodLabels.low;

        return `
            <div class="bg-sovereign-800/30 rounded-lg p-4">
                <div class="flex items-center justify-between mb-2">
                    <span class="text-sm">
                        <span class="mr-1">${categoryIcons[risk.risk_category] || '⚠️'}</span>
                        <span class="text-sovereign-100/60 capitalize">${escapeHtml(risk.risk_category)}</span>
                    </span>
                    <span class="text-xs ${likelihoodClass} font-medium">
                        ${label}
                    </span>
                </div>
                <p class="text-sovereign-100/80 text-sm mb-2">${escapeHtml(risk.description)}</p>
                <p class="text-sovereign-100/50 text-xs">
                    <span class="text-sovereign-100/40">Monitor:</span> ${escapeHtml(risk.recommended_monitoring)}
                </p>
            </div>
        `;
    }).join('');

    container.innerHTML = legend + riskCards;
}

// Render executives from knowledge graph
function renderExecutives(executives) {
    const container = document.getElementById('executives');

    if (!executives || executives.length === 0) {
        container.innerHTML = '<p class="text-sovereign-100/50 italic">No executives identified</p>';
        return;
    }

    // Group executives by company
    const byCompany = {};
    executives.forEach(exec => {
        if (!byCompany[exec.company]) {
            byCompany[exec.company] = [];
        }
        byCompany[exec.company].push(exec);
    });

    container.innerHTML = Object.entries(byCompany).map(([company, execs]) => `
        <div class="bg-sovereign-800/30 rounded-lg p-3">
            <div class="font-medium text-white mb-2">${escapeHtml(company)}</div>
            <div class="space-y-1">
                ${execs.map(exec => `
                    <div class="flex items-center justify-between text-sm">
                        <span class="text-sovereign-100/80">${escapeHtml(exec.person)}</span>
                        <span class="text-sovereign-100/50 text-xs">${escapeHtml(exec.role) || ''}</span>
                    </div>
                `).join('')}
            </div>
        </div>
    `).join('');
}

// Render competitive clusters from knowledge graph
function renderCompetitiveClusters(clusters) {
    const container = document.getElementById('competitive-clusters');

    if (!clusters || clusters.length === 0) {
        container.innerHTML = '<p class="text-sovereign-100/50 italic">No competitive clusters identified</p>';
        return;
    }

    // Sort by strength (descending) and take top 10
    const topClusters = clusters
        .sort((a, b) => b.strength - a.strength)
        .slice(0, 10);

    container.innerHTML = topClusters.map(cluster => `
        <div class="bg-sovereign-800/30 rounded-lg p-3">
            <div class="flex items-center gap-2 mb-2">
                <span class="font-medium text-white">${escapeHtml(cluster.company1)}</span>
                <svg class="w-4 h-4 text-fuchsia-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"></path>
                </svg>
                <span class="font-medium text-white">${escapeHtml(cluster.company2)}</span>
                <span class="ml-auto text-xs px-2 py-0.5 rounded bg-fuchsia-500/20 text-fuchsia-300">
                    ${cluster.strength} ${cluster.strength === 1 ? 'theme' : 'themes'}
                </span>
            </div>
            <div class="flex flex-wrap gap-1">
                ${cluster.shared_themes.map(theme => `
                    <span class="text-xs px-2 py-0.5 bg-sovereign-700/50 text-sovereign-100/60 rounded">${escapeHtml(theme)}</span>
                `).join('')}
            </div>
        </div>
    `).join('');
}

// Render multi-hop insights (connecting the dots)
function renderMultiHopInsights(insights) {
    const container = document.getElementById('multi-hop-insights');
    if (!container) return;

    if (!insights || insights.length === 0) {
        container.innerHTML = '<p class="text-sovereign-100/50 italic">No hidden connections discovered</p>';
        return;
    }

    container.innerHTML = insights.slice(0, 6).map(insight => `
        <div class="flex items-start gap-2 text-sm">
            <svg class="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
            </svg>
            <span class="text-sovereign-100/70">${escapeHtml(insight)}</span>
        </div>
    `).join('');
}

// Render theme validations (truth vs noise)
function renderThemeValidations(validations) {
    const container = document.getElementById('theme-validations');
    if (!container) return;

    if (!validations || validations.length === 0) {
        container.innerHTML = '<p class="text-sovereign-100/50 italic">No theme validation data</p>';
        return;
    }

    container.innerHTML = validations.map(v => `
        <div class="flex items-center justify-between text-sm py-1">
            <span class="text-sovereign-100/80 truncate flex-1">${escapeHtml(v.theme)}</span>
            <div class="flex items-center gap-2 ml-2">
                <span class="text-xs ${v.is_validated ? 'text-green-400' : 'text-amber-400'}">
                    ${v.is_validated ? 'Verified' : 'Unverified'}
                </span>
                <div class="w-16 h-1.5 bg-sovereign-700 rounded-full overflow-hidden">
                    <div class="h-full ${v.is_validated ? 'bg-green-500' : 'bg-amber-500'}"
                         style="width: ${Math.round(v.graph_support * 100)}%"></div>
                </div>
            </div>
        </div>
    `).join('');
}

// Render audit trails (explainability)
function renderAuditTrails(trails) {
    const container = document.getElementById('audit-trails');
    if (!container) return;

    if (!trails || trails.length === 0) {
        container.innerHTML = '<p class="text-sovereign-100/50 italic">No audit trail data</p>';
        return;
    }

    // Group by type
    const byType = {};
    trails.forEach(trail => {
        const type = trail.type || 'other';
        if (!byType[type]) byType[type] = [];
        byType[type].push(trail);
    });

    const typeLabels = {
        theme: 'Themes',
        competitive_intel: 'Competitive Intel',
        risk: 'Risks'
    };

    container.innerHTML = Object.entries(byType).map(([type, items]) => `
        <div class="mb-3">
            <div class="text-xs text-sovereign-100/50 uppercase mb-1">${typeLabels[type] || type}</div>
            ${items.slice(0, 3).map(trail => `
                <div class="flex items-center justify-between text-sm py-1 border-b border-sovereign-700/30 last:border-0">
                    <span class="text-sovereign-100/70 truncate flex-1">${escapeHtml(trail.summary.slice(0, 40))}...</span>
                    <div class="flex items-center gap-1 ml-2">
                        <span class="text-xs text-sovereign-100/40">${trail.supporting_entities.length} entities</span>
                        <div class="w-8 h-1.5 bg-sovereign-700 rounded-full overflow-hidden">
                            <div class="h-full bg-cyan-500" style="width: ${Math.round(trail.confidence * 100)}%"></div>
                        </div>
                    </div>
                </div>
            `).join('')}
        </div>
    `).join('');
}

// Render knowledge graph section
function renderKnowledgeGraph(knowledgeGraph) {
    if (!knowledgeGraph) {
        renderExecutives([]);
        renderCompetitiveClusters([]);
        renderMultiHopInsights([]);
        renderThemeValidations([]);
        return;
    }

    renderExecutives(knowledgeGraph.executives);
    renderCompetitiveClusters(knowledgeGraph.competitive_clusters);
    renderMultiHopInsights(knowledgeGraph.multi_hop_insights);
    renderThemeValidations(knowledgeGraph.theme_validations);
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
        renderKnowledgeGraph(data.sections?.knowledge_graph);
        renderAuditTrails(data.sections?.audit_trails);
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
