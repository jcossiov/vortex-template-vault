import React, { useState, useMemo, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { 
  Sparkles, 
  Search, 
  ExternalLink, 
  Copy, 
  Check, 
  Code2, 
  Layers, 
  Sliders, 
  X, 
  Zap, 
  Palette, 
  Rocket, 
  Star,
  ChevronLeft,
  ChevronRight,
  Download,
  Activity,
  Box
} from 'lucide-react';
import templatesData from './data/templates.json';

function GithubIcon({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/>
    </svg>
  );
}

const categoryLabels = {
  'all': 'Todas las Plantillas',
  'darks-cyber-tech': '🌑 Darks & Cyber Tech',
  'limpios-minimalistas': '🕊️ Limpios & Minimalistas',
  'raros-experimentales': '🔮 Raros & WebGL 3D',
  'tecnologicos-saas': '💻 Tecnológicos & SaaS',
  'ecommerce-conversion': '🛍️ E-Commerce & CRO',
  'agencias-servicios': '🏢 Agencias & Servicios'
};

const categoryShort = {
  'darks-cyber-tech': 'Dark Tech',
  'limpios-minimalistas': 'Minimalista',
  'raros-experimentales': 'Raro / 3D',
  'tecnologicos-saas': 'SaaS Dashboard',
  'ecommerce-conversion': 'E-Commerce',
  'agencias-servicios': 'Agencia'
};

export default function App() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [filterFreeOnly, setFilterFreeOnly] = useState(false);
  const [filterHasRepo, setFilterHasRepo] = useState(false);
  const [filterHasDemo, setFilterHasDemo] = useState(false);
  const [sortBy, setSortBy] = useState('popularity');

  // Modal State
  const [activeModalTemplate, setActiveModalTemplate] = useState(null);
  const [activeModalTab, setActiveModalTab] = useState('effects'); // effects, components, tokens, prompt, customizer

  // Customizer Form State
  const [clientName, setClientName] = useState('Cliente Vortex');
  const [clientIndustry, setClientIndustry] = useState('B2B SaaS & IA');
  const [clientAccent, setClientAccent] = useState('#6366f1');
  const [clientCta, setClientCta] = useState('Agendar Demostración');

  // Toast State
  const [toastMessage, setToastMessage] = useState(null);

  // Category Slider Drag Ref
  const categoriesRef = useRef(null);
  const isDraggingRef = useRef(false);
  const startXRef = useRef(0);
  const scrollLeftRef = useRef(0);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  const triggerConfetti = () => {
    confetti({
      particleCount: 65,
      spread: 75,
      origin: { y: 0.8 },
      colors: ['#6366f1', '#10b981', '#38bdf8', '#a855f7']
    });
  };

  // Slider Scroll Controls
  const scrollSlider = (direction) => {
    if (categoriesRef.current) {
      const offset = direction === 'left' ? -280 : 280;
      categoriesRef.current.scrollBy({ left: offset, behavior: 'smooth' });
    }
  };

  // Mouse drag handlers
  const handleMouseDown = (e) => {
    isDraggingRef.current = true;
    startXRef.current = e.pageX - categoriesRef.current.offsetLeft;
    scrollLeftRef.current = categoriesRef.current.scrollLeft;
  };

  const handleMouseMove = (e) => {
    if (!isDraggingRef.current) return;
    e.preventDefault();
    const x = e.pageX - categoriesRef.current.offsetLeft;
    const walk = (x - startXRef.current) * 1.5;
    categoriesRef.current.scrollLeft = scrollLeftRef.current - walk;
  };

  const handleMouseUpOrLeave = () => {
    isDraggingRef.current = false;
  };

  // Wheel horizontal scroll
  const handleWheel = (e) => {
    if (categoriesRef.current) {
      if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
        categoriesRef.current.scrollLeft += e.deltaY;
      }
    }
  };

  // Keyboard shortcut ⌘K / /
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        document.getElementById('searchInput')?.focus();
      }
      if (e.key === 'Escape') {
        setActiveModalTemplate(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Category counts
  const categoryCounts = useMemo(() => {
    const counts = { all: templatesData.length };
    templatesData.forEach((t) => {
      counts[t.category] = (counts[t.category] || 0) + 1;
    });
    return counts;
  }, []);

  // Filtered and sorted templates
  const filteredTemplates = useMemo(() => {
    let result = templatesData.filter((t) => {
      if (selectedCategory !== 'all' && t.category !== selectedCategory) {
        return false;
      }
      if (filterFreeOnly && !t.isFree) return false;
      if (filterHasRepo && !t.sourceRepo) return false;
      if (filterHasDemo && !t.demoUrl) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchName = t.name.toLowerCase().includes(q);
        const matchSlug = t.slug.toLowerCase().includes(q);
        const matchDesc = (t.description || '').toLowerCase().includes(q);
        const matchTags = (t.tags || []).some((tag) => tag.toLowerCase().includes(q));
        if (!matchName && !matchSlug && !matchDesc && !matchTags) return false;
      }
      return true;
    });

    if (sortBy === 'popularity') {
      result.sort((a, b) => (b.bookmarks || 0) - (a.bookmarks || 0));
    } else if (sortBy === 'freeFirst') {
      result.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'name') {
      result.sort((a, b) => a.name.localeCompare(b.name));
    }

    return result;
  }, [searchQuery, selectedCategory, filterFreeOnly, filterHasRepo, filterHasDemo, sortBy]);

  const handleCopyPrompt = (template, custom = false) => {
    let textToCopy = template.replicationPrompt;
    if (custom) {
      textToCopy = `
### PROMPT DE REPLICACIÓN MAESTRO (Personalizado para ${clientName})
**Plantilla Base:** ${template.name} (${template.categoryTitle})
**Cliente Destino:** ${clientName}
**Industria / Nicho:** ${clientIndustry}
**Acento Adaptado:** ${clientAccent}
**CTA Principal:** ${clientCta}

INSTRUCCIONES DE DISEÑO:
- Fondo: ${template.designTokens.background}
- Tarjetas / Superficies: ${template.designTokens.surface}
- Color de Acento: ${clientAccent}
- Bordes / Curvatura: ${template.designTokens.radius}
- Tipografía: ${template.designTokens.typography || 'Plus Jakarta Sans / Inter'}

EFECTOS Y MOVIMIENTOS DINÁMICOS A REPLICAR:
${(template.dynamicEffects || []).map((ef, i) => `${i + 1}. ${ef.name} (${ef.type}): ${ef.details}`).join('\n')}

JERARQUÍA DE COMPONENTES:
${(template.componentTree || []).map((cp, i) => `${i + 1}. ${cp}`).join('\n')}

REGLAS DE GENERACIÓN FRONTEND (ZERO LOREM IPSUM):
1. Redactar copy comercial persuasivo y real en español para ${clientName} en el sector de ${clientIndustry}.
2. Implementar Navbar flotante con blur de fondo y botón destacado "${clientCta}".
3. Hero Section con titular de alto impacto cuantificando el valor para el cliente.
4. Bento Grid interactivo mostrando las soluciones clave de ${clientName}.
5. Prueba social con métricas verificables y testimonios creíbles.
6. Código funcional con React / Tailwind / Framer Motion responsive en mobile, tablet y desktop.
`.trim();
    }

    navigator.clipboard.writeText(textToCopy);
    triggerConfetti();
    showToast(custom ? `Prompt personalizado para ${clientName} copiado!` : `Prompt de ${template.name} copiado!`);
  };

  const handleDownloadSpec = (template) => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(template, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `${template.slug}-spec-vortex.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast(`Ficha técnica ${template.slug}.json descargada.`);
  };

  return (
    <div className="app-container">
      {/* Background Ambient Lights */}
      <div className="ambient-container">
        <div className="ambient-light ambient-1" />
        <div className="ambient-light ambient-2" />
        <div className="ambient-light ambient-3" />
      </div>

      {/* Header */}
      <header className="app-header">
        <div className="header-content">
          <div className="brand-section">
            <div className="brand-icon-box">
              <Zap size={22} className="text-indigo-400" />
            </div>
            <div className="brand-text-group">
              <div className="brand-title-row">
                <span className="brand-name">VORTEX</span>
                <span className="brand-badge">Vault 2.0</span>
              </div>
              <span className="brand-subtitle">466 Plantillas • 216 Open Source • React Engine</span>
            </div>
          </div>

          {/* Search Box */}
          <div className="header-search-box">
            <Search size={16} className="search-icon-left" />
            <input
              id="searchInput"
              type="text"
              placeholder="Buscar por nombre, nicho (ej. dental, CRM, SaaS)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
            <span className="search-shortcut-badge">⌘K</span>
          </div>

          {/* Stats Chips */}
          <div className="header-actions">
            <div className="stat-chip">
              <span className="pulse-dot" />
              <span><strong>{filteredTemplates.length}</strong> Plantillas</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="main-wrapper">
        {/* Hero Banner */}
        <section className="hero-banner">
          <div className="hero-tagline">
            <Sparkles size={14} />
            <span>Biblioteca Oficial de Diseños & Prompts de Replicación</span>
          </div>
          <h1 className="hero-headline">
            Portafolio Dinámico de <span className="gradient-text">Plantillas de Vanguardia</span>
          </h1>
          <p className="hero-description">
            Clonadas y catalogadas desde 21st.dev y repositorios oficiales. Explora estéticas Limpias, Darks, Raras, Tecnológicas y E-Commerce con tokens listos para adaptar a cualquier cliente en minutos.
          </p>
        </section>

        {/* Categories Draggable Slider */}
        <section className="categories-slider-wrapper">
          <button 
            className="slider-nav-btn btn-left" 
            onClick={() => scrollSlider('left')}
            title="Desplazar a la izquierda"
          >
            <ChevronLeft size={20} />
          </button>

          <div 
            className="categories-bar-scrollable" 
            ref={categoriesRef}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUpOrLeave}
            onMouseLeave={handleMouseUpOrLeave}
            onWheel={handleWheel}
          >
            {Object.entries(categoryLabels).map(([key, label]) => (
              <button
                key={key}
                onClick={() => setSelectedCategory(key)}
                className={`category-tab ${selectedCategory === key ? 'active' : ''}`}
              >
                <span>{label}</span>
                <span className="tab-badge">{categoryCounts[key] || 0}</span>
              </button>
            ))}
          </div>

          <button 
            className="slider-nav-btn btn-right" 
            onClick={() => scrollSlider('right')}
            title="Desplazar a la derecha"
          >
            <ChevronRight size={20} />
          </button>
        </section>

        {/* Toolbar Controls */}
        <section className="toolbar-container">
          <div className="filter-checkboxes">
            <label className="filter-label">
              <input
                type="checkbox"
                checked={filterFreeOnly}
                onChange={(e) => setFilterFreeOnly(e.target.checked)}
                className="filter-checkbox"
              />
              <span>Solo Gratuitas ($0)</span>
            </label>
            <label className="filter-label">
              <input
                type="checkbox"
                checked={filterHasRepo}
                onChange={(e) => setFilterHasRepo(e.target.checked)}
                className="filter-checkbox"
              />
              <span>Con Repositorio GitHub</span>
            </label>
            <label className="filter-label">
              <input
                type="checkbox"
                checked={filterHasDemo}
                onChange={(e) => setFilterHasDemo(e.target.checked)}
                className="filter-checkbox"
              />
              <span>Con Demo en Vivo</span>
            </label>
          </div>

          <div className="toolbar-right">
            <span style={{ fontSize: '12px', color: '#94a3b8' }}>Ordenar:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="sort-select"
            >
              <option value="popularity">Popularidad (Bookmarks)</option>
              <option value="freeFirst">Gratuitas primero</option>
              <option value="name">Alfabético (A-Z)</option>
            </select>
          </div>
        </section>

        {/* Templates Cards Grid */}
        <section className="cards-grid">
          {filteredTemplates.slice(0, 60).map((t) => (
            <article key={t.slug} className="template-card">
              <div className="card-media-wrapper">
                <span className={`badge-overlay-price ${t.isFree ? 'free' : 'paid'}`}>
                  {t.isFree ? 'GRATIS ($0)' : `$${t.price}`}
                </span>
                <span className="badge-overlay-category">
                  {categoryShort[t.category] || 'Template'}
                </span>
                <img
                  src={t.previewImage || 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80'}
                  alt={t.name}
                  loading="lazy"
                  className="card-image"
                  onError={(e) => {
                    e.currentTarget.src = 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80';
                  }}
                />
              </div>

              <div className="card-info">
                <div className="card-header-row">
                  <h3 className="card-title">{t.name}</h3>
                  <div className="card-stars">
                    <Star size={13} fill="#f59e0b" color="#f59e0b" />
                    <span>{t.bookmarks}</span>
                  </div>
                </div>

                <p className="card-description">{t.description}</p>

                <div className="card-tags-list">
                  {(t.tags || []).slice(0, 3).map((tag, i) => (
                    <span key={i} className="tag-badge">#{tag}</span>
                  ))}
                </div>

                <div className="card-action-bar">
                  {t.demoUrl ? (
                    <a
                      href={t.demoUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="btn-demo-link"
                    >
                      <ExternalLink size={14} />
                      <span>Demo</span>
                    </a>
                  ) : (
                    <span className="btn-demo-link" style={{ opacity: 0.4, cursor: 'not-allowed' }}>
                      Sin Demo
                    </span>
                  )}

                  <button
                    onClick={() => {
                      setActiveModalTemplate(t);
                      setActiveModalTab('effects');
                    }}
                    className="btn-prompt-action"
                  >
                    <Sliders size={14} />
                    <span>Ficha & Prompt</span>
                  </button>

                  {t.sourceRepo && (
                    <a
                      href={t.sourceRepo}
                      target="_blank"
                      rel="noreferrer"
                      className="btn-icon-repo"
                      title="Ver en GitHub"
                    >
                      <GithubIcon size={18} />
                    </a>
                  )}
                </div>
              </div>
            </article>
          ))}
        </section>

        {filteredTemplates.length === 0 && (
          <div style={{ textAlign: 'center', padding: '80px 20px', color: '#94a3b8' }}>
            <p style={{ fontSize: '18px', fontWeight: 700, color: '#fff', marginBottom: '8px' }}>
              No se encontraron plantillas
            </p>
            <p style={{ fontSize: '13px' }}>Prueba ajustando los filtros o el término de búsqueda.</p>
          </div>
        )}
      </main>

      {/* Modal Inspector & Dynamic Replication Engine */}
      {activeModalTemplate && (
        <div className="modal-overlay" onClick={() => setActiveModalTemplate(null)}>
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-btn" onClick={() => setActiveModalTemplate(null)}>
              <X size={22} />
            </button>

            {/* Modal Header */}
            <div style={{ marginBottom: '22px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                <span className="brand-badge">{activeModalTemplate.categoryTitle}</span>
                <span style={{ fontSize: '11px', color: '#94a3b8', fontFamily: 'JetBrains Mono' }}>
                  {activeModalTemplate.license}
                </span>
                <span style={{ fontSize: '11px', color: '#10b981', fontWeight: 700 }}>
                  {activeModalTemplate.isFree ? 'Gratis' : `$${activeModalTemplate.price}`}
                </span>
              </div>
              <h2 style={{ fontSize: '26px', fontWeight: 800, color: '#fff', marginBottom: '6px' }}>
                {activeModalTemplate.name}
              </h2>
              <p style={{ fontSize: '13.5px', color: '#cbd5e1', lineHeight: '1.6' }}>
                {activeModalTemplate.description}
              </p>
            </div>

            {/* Modal Navigation Tabs */}
            <div className="modal-nav-tabs">
              <button
                className={`modal-tab-btn ${activeModalTab === 'effects' ? 'active' : ''}`}
                onClick={() => setActiveModalTab('effects')}
              >
                <Activity size={15} />
                <span>🎬 Efectos & Dinamismos</span>
              </button>

              <button
                className={`modal-tab-btn ${activeModalTab === 'components' ? 'active' : ''}`}
                onClick={() => setActiveModalTab('components')}
              >
                <Layers size={15} />
                <span>🏗️ Componentes</span>
              </button>

              <button
                className={`modal-tab-btn ${activeModalTab === 'tokens' ? 'active' : ''}`}
                onClick={() => setActiveModalTab('tokens')}
              >
                <Palette size={15} />
                <span>🎨 Tokens CSS</span>
              </button>

              <button
                className={`modal-tab-btn ${activeModalTab === 'prompt' ? 'active' : ''}`}
                onClick={() => setActiveModalTab('prompt')}
              >
                <Code2 size={15} />
                <span>📋 Prompt Maestro</span>
              </button>

              <button
                className={`modal-tab-btn ${activeModalTab === 'customizer' ? 'active' : ''}`}
                onClick={() => setActiveModalTab('customizer')}
              >
                <Rocket size={15} />
                <span>⚡ Replicar para Cliente</span>
              </button>
            </div>

            {/* Tab 1: Dynamic Effects */}
            {activeModalTab === 'effects' && (
              <div>
                <div className="spec-box" style={{ marginBottom: '16px' }}>
                  <div className="spec-title">
                    <Activity size={16} />
                    <span>Movimientos & Efectos Dinámicos de la Plantilla</span>
                  </div>
                  <p className="spec-text" style={{ marginBottom: '14px' }}>
                    Cada efecto ha sido deconstruido para que pueda ser replicado fielmente con Framer Motion, WebGL o CSS Animations nativas:
                  </p>

                  <div>
                    {(activeModalTemplate.dynamicEffects || []).map((ef, i) => (
                      <div key={i} className="effect-item">
                        <div className="effect-header">
                          <span className="effect-name">{i + 1}. {ef.name}</span>
                          <span className="effect-type-badge">{ef.type}</span>
                        </div>
                        <p className="effect-desc">{ef.details}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                  {activeModalTemplate.demoUrl && (
                    <a
                      href={activeModalTemplate.demoUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="btn-demo-link"
                      style={{ padding: '10px 16px' }}
                    >
                      <ExternalLink size={16} />
                      <span>Ver Efectos en Demo Vivo</span>
                    </a>
                  )}
                  <button
                    onClick={() => handleCopyPrompt(activeModalTemplate)}
                    className="btn-prompt-action"
                    style={{ padding: '10px 18px', marginLeft: 'auto' }}
                  >
                    <Copy size={16} />
                    <span>Copiar Prompt Maestro Completo</span>
                  </button>
                </div>
              </div>
            )}

            {/* Tab 2: Components */}
            {activeModalTab === 'components' && (
              <div>
                <div className="spec-box">
                  <div className="spec-title">
                    <Box size={16} />
                    <span>Árbol y Jerarquía Modular de Componentes</span>
                  </div>
                  <p className="spec-text" style={{ marginBottom: '14px' }}>
                    Estructura de secciones lista para implementar en tu proyecto React / Next.js:
                  </p>

                  <div className="component-tree-list">
                    {(activeModalTemplate.componentTree || []).map((cp, idx) => (
                      <div key={idx} className="component-tree-item">
                        <span className="index-num">{idx + 1}</span>
                        <span>{cp}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Tab 3: Tokens */}
            {activeModalTab === 'tokens' && (
              <div>
                <div className="spec-box">
                  <div className="spec-title">
                    <Palette size={16} />
                    <span>Tokens de Diseño & Estilos CSS Extraídos</span>
                  </div>
                  <div className="code-container">
                    {JSON.stringify(activeModalTemplate.designTokens, null, 2)}
                  </div>
                </div>
              </div>
            )}

            {/* Tab 4: Prompt Original */}
            {activeModalTab === 'prompt' && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ fontSize: '12px', fontWeight: 700, color: '#94a3b8' }}>
                    PROMPT MAESTRO COMPLETO PARA AGENTES IA (CURSOR / ANTHROPIC / V0 / LOVABLE)
                  </span>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      onClick={() => handleDownloadSpec(activeModalTemplate)}
                      className="btn-demo-link"
                      style={{ padding: '6px 12px', fontSize: '11px' }}
                      title="Descargar Ficha Técnica JSON"
                    >
                      <Download size={14} />
                      <span>Descargar JSON</span>
                    </button>
                    <button
                      onClick={() => handleCopyPrompt(activeModalTemplate)}
                      className="btn-prompt-action"
                      style={{ padding: '6px 12px', fontSize: '11px' }}
                    >
                      <Copy size={14} />
                      <span>Copiar Texto</span>
                    </button>
                  </div>
                </div>
                <div className="code-container">
                  {activeModalTemplate.replicationPrompt}
                </div>
              </div>
            )}

            {/* Tab 5: Customizer Engine */}
            {activeModalTab === 'customizer' && (
              <div>
                <div className="spec-box" style={{ borderColor: 'rgba(99, 102, 241, 0.4)' }}>
                  <div className="spec-title" style={{ color: '#a5b4fc' }}>
                    <Rocket size={16} />
                    <span>Motor de Adaptación para Proyecto Real</span>
                  </div>
                  <p className="spec-text" style={{ marginBottom: '14px' }}>
                    Ingresa los datos de tu cliente para generar instantáneamente un prompt adaptado con su nombre, nicho comercial y paleta de marca:
                  </p>

                  <div className="client-customizer-form">
                    <div className="form-group">
                      <label className="form-label">Nombre del Cliente / Empresa</label>
                      <input
                        type="text"
                        value={clientName}
                        onChange={(e) => setClientName(e.target.value)}
                        className="form-input"
                        placeholder="Ej. Clínica Dental Sonrisas"
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Industria / Nicho Comercial</label>
                      <input
                        type="text"
                        value={clientIndustry}
                        onChange={(e) => setClientIndustry(e.target.value)}
                        className="form-input"
                        placeholder="Ej. Odontología Estética"
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Color de Acento de Marca</label>
                      <input
                        type="text"
                        value={clientAccent}
                        onChange={(e) => setClientAccent(e.target.value)}
                        className="form-input"
                        placeholder="Ej. #0d9488 o #10b981"
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Llamado a la Acción (CTA) Principal</label>
                      <input
                        type="text"
                        value={clientCta}
                        onChange={(e) => setClientCta(e.target.value)}
                        className="form-input"
                        placeholder="Ej. Agendar Valoración Gratuita"
                      />
                    </div>
                  </div>

                  <button
                    onClick={() => handleCopyPrompt(activeModalTemplate, true)}
                    className="btn-prompt-action"
                    style={{ width: '100%', justifyContent: 'center', padding: '12px' }}
                  >
                    <Rocket size={16} />
                    <span>Copiar Prompt Personalizado para {clientName}</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Toast Bar */}
      {toastMessage && (
        <div className="toast-bar">
          <Check size={18} color="#10b981" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
