'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  FiPlus, FiSearch, FiEdit3, FiTrash2, FiCopy, FiDownload,
  FiMic, FiMicOff, FiCheckSquare, FiSquare, FiTag, FiArchive,
  FiUpload, FiGrid, FiList, FiX, FiCheck, FiFileText,
  FiFolder, FiClock, FiStar, FiFilter, FiRotateCcw, FiPaperclip,
  FiAlertCircle, FiCheckCircle, FiShare2, FiTrendingUp
} from 'react-icons/fi';

// Pre-populated initial sample notes for a rich initial experience
const INITIAL_NOTES = [
  {
    id: 'note-1',
    title: '🚀 Portfolio & Agentic AI Roadmap',
    content: '1. Build multi-agent orchestration workflow using LangGraph.\n2. Upgrade Digital Note workspace with checklist, speech recognition, tags, and local storage.\n3. Integrate explainable AI dashboards into Zero-Day Guard system.',
    category: 'Work',
    priority: 'High',
    color: '#0284c7', // Cyan / Blue
    isPinned: true,
    isArchived: false,
    isTrash: false,
    type: 'checklist',
    checklist: [
      { id: 'c1', text: 'Build multi-agent orchestration workflow using LangGraph', completed: true },
      { id: 'c2', text: 'Upgrade Digital Note workspace with voice-to-text & tags', completed: true },
      { id: 'c3', text: 'Integrate XAI dashboards into security portfolio apps', completed: false }
    ],
    tags: ['AI', 'React', 'Roadmap'],
    image: '',
    createdAt: '2026-08-14T18:00:00.000Z',
    updatedAt: '2026-08-16T18:00:00.000Z'
  },
  {
    id: 'note-2',
    title: '🧠 Neural Network Hyperparameter Tuning',
    content: 'Best practice configurations for transformer model fine-tuning:\n- Learning Rate: 2e-5 with warm-up cosine scheduler.\n- Batch Size: 32 per GPU device.\n- Optimizer: AdamW (weight_decay=0.01).\n- Gradient Clipping: norm <= 1.0',
    category: 'Code',
    priority: 'Medium',
    color: '#8b5cf6', // Purple
    isPinned: true,
    isArchived: false,
    isTrash: false,
    type: 'text',
    checklist: [],
    tags: ['Machine Learning', 'Python', 'PyTorch'],
    image: '',
    createdAt: '2026-08-11T12:00:00.000Z',
    updatedAt: '2026-08-16T11:00:00.000Z'
  },
  {
    id: 'note-3',
    title: '💡 Startup & Product Ideas 2026',
    content: 'Explore lightweight desktop sidecars that combine local vector indexing with real-time speech commands. Seamless cross-platform synchronization with end-to-end encryption.',
    category: 'Ideas',
    priority: 'Low',
    color: '#10b981', // Emerald
    isPinned: false,
    isArchived: false,
    isTrash: false,
    type: 'text',
    checklist: [],
    tags: ['Innovation', 'Startup', 'Product'],
    image: '',
    createdAt: '2026-08-09T09:00:00.000Z',
    updatedAt: '2026-08-15T15:00:00.000Z'
  }
];

const CATEGORIES = ['All', 'Work', 'Personal', 'Ideas', 'Code', 'Study'];
const PRIORITIES = ['All', 'High', 'Medium', 'Low'];
const COLOR_OPTIONS = [
  { name: 'Cyan Blue', hex: '#0284c7' },
  { name: 'Emerald', hex: '#10b981' },
  { name: 'Purple Violet', hex: '#8b5cf6' },
  { name: 'Sunset Amber', hex: '#f59e0b' },
  { name: 'Rose Pink', hex: '#f43f5e' },
  { name: 'Slate Gray', hex: '#64748b' }
];

export default function DigitalBoard() {
  // Local state with safe SSR hydration
  const [notes, setNotes] = useState(INITIAL_NOTES);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('digital_notes_advanced_v1');
      if (saved) {
        setNotes(JSON.parse(saved));
      }
    } catch (err) {
      console.error('Failed to load notes from localStorage', err);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  const [activeTab, setActiveTab] = useState('all'); // 'all', 'pinned', 'archived', 'trash'
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedPriority, setSelectedPriority] = useState('All');
  const [selectedTag, setSelectedTag] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('newest'); // 'newest', 'oldest', 'title', 'priority'
  const [viewMode, setViewMode] = useState('grid'); // 'grid', 'list'

  // Modal State for Edit / Create
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingNoteId, setEditingNoteId] = useState(null);
  
  // Note Form Fields
  const [formTitle, setFormTitle] = useState('');
  const [formContent, setFormContent] = useState('');
  const [formCategory, setFormCategory] = useState('Work');
  const [formPriority, setFormPriority] = useState('Medium');
  const [formColor, setFormColor] = useState('#0284c7');
  const [formIsPinned, setFormIsPinned] = useState(false);
  const [formType, setFormType] = useState('text'); // 'text', 'checklist'
  const [formChecklist, setFormChecklist] = useState([]);
  const [newCheckitem, setNewCheckitem] = useState('');
  const [formTags, setFormTags] = useState([]);
  const [tagInput, setTagInput] = useState('');
  const [formImage, setFormImage] = useState('');

  // Voice Recognition State
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef(null);

  // Toast Notification
  const [toast, setToast] = useState(null);

  // Save to localStorage on notes change
  useEffect(() => {
    if (isLoaded) {
      try {
        localStorage.setItem('digital_notes_advanced_v1', JSON.stringify(notes));
      } catch (err) {
        console.error('Failed to save notes to localStorage', err);
      }
    }
  }, [notes, isLoaded]);

  // Toast Helper
  const showToast = (message, type = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Initialize Speech Recognition
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        recognition.onresult = (event) => {
          let transcript = '';
          for (let i = event.resultIndex; i < event.results.length; i++) {
            if (event.results[i].isFinal) {
              transcript += event.results[i][0].transcript + ' ';
            }
          }
          if (transcript) {
            setFormContent((prev) => (prev ? `${prev} ${transcript}` : transcript));
          }
        };

        recognition.onerror = (err) => {
          console.error('Speech recognition error:', err);
          setIsListening(false);
          showToast('Speech recognition error or denied.', 'error');
        };

        recognition.onend = () => {
          setIsListening(false);
        };

        recognitionRef.current = recognition;
      }
    }
  }, []);

  const toggleVoiceListening = () => {
    if (!recognitionRef.current) {
      showToast('Speech recognition is not supported in this browser.', 'error');
      return;
    }
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
      showToast('Voice transcription stopped.');
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
        showToast('Listening... Speak to transcribe text!', 'success');
      } catch (err) {
        console.error(err);
      }
    }
  };

  // Reset Form
  const resetForm = () => {
    setEditingNoteId(null);
    setFormTitle('');
    setFormContent('');
    setFormCategory('Work');
    setFormPriority('Medium');
    setFormColor('#0284c7');
    setFormIsPinned(false);
    setFormType('text');
    setFormChecklist([]);
    setNewCheckitem('');
    setFormTags([]);
    setTagInput('');
    setFormImage('');
    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  };

  // Open Modal for New Note
  const handleOpenCreateModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  // Open Modal for Editing Note
  const handleOpenEditModal = (note) => {
    setEditingNoteId(note.id);
    setFormTitle(note.title);
    setFormContent(note.content || '');
    setFormCategory(note.category || 'Work');
    setFormPriority(note.priority || 'Medium');
    setFormColor(note.color || '#0284c7');
    setFormIsPinned(note.isPinned || false);
    setFormType(note.type || 'text');
    setFormChecklist(note.checklist ? [...note.checklist] : []);
    setFormTags(note.tags ? [...note.tags] : []);
    setFormImage(note.image || '');
    setIsModalOpen(true);
  };

  // Save Note (Create or Update)
  const handleSaveNote = (e) => {
    e.preventDefault();
    if (!formTitle.trim() && !formContent.trim() && formChecklist.length === 0) {
      showToast('Please add a title or content for the note.', 'error');
      return;
    }

    const now = new Date().toISOString();

    if (editingNoteId) {
      // Update existing note
      setNotes((prev) =>
        prev.map((n) =>
          n.id === editingNoteId
            ? {
                ...n,
                title: formTitle.trim() || 'Untitled Note',
                content: formContent,
                category: formCategory,
                priority: formPriority,
                color: formColor,
                isPinned: formIsPinned,
                type: formType,
                checklist: formChecklist,
                tags: formTags,
                image: formImage,
                updatedAt: now
              }
            : n
        )
      );
      showToast('Note updated successfully!', 'success');
    } else {
      // Create new note
      const newNote = {
        id: `note-${Date.now()}`,
        title: formTitle.trim() || 'Untitled Note',
        content: formContent,
        category: formCategory,
        priority: formPriority,
        color: formColor,
        isPinned: formIsPinned,
        isArchived: false,
        isTrash: false,
        type: formType,
        checklist: formChecklist,
        tags: formTags,
        image: formImage,
        createdAt: now,
        updatedAt: now
      };
      setNotes((prev) => [newNote, ...prev]);
      showToast('New note created!', 'success');
    }

    setIsModalOpen(false);
    resetForm();
  };

  // Checklist Item Helpers in Form
  const handleAddChecklistItem = () => {
    if (!newCheckitem.trim()) return;
    setFormChecklist((prev) => [
      ...prev,
      { id: `c-${Date.now()}-${Math.random()}`, text: newCheckitem.trim(), completed: false }
    ]);
    setNewCheckitem('');
  };

  const handleToggleFormChecklist = (itemId) => {
    setFormChecklist((prev) =>
      prev.map((item) => (item.id === itemId ? { ...item, completed: !item.completed } : item))
    );
  };

  const handleRemoveFormChecklist = (itemId) => {
    setFormChecklist((prev) => prev.filter((item) => item.id !== itemId));
  };

  // Toggle Checklist on Card directly
  const handleToggleCardChecklist = (noteId, itemId) => {
    setNotes((prev) =>
      prev.map((n) => {
        if (n.id !== noteId) return n;
        const updatedChecklist = n.checklist.map((item) =>
          item.id === itemId ? { ...item, completed: !item.completed } : item
        );
        return { ...n, checklist: updatedChecklist, updatedAt: new Date().toISOString() };
      })
    );
  };

  // Tag Manager in Form
  const handleAddTag = (e) => {
    if ((e.key === 'Enter' || e.key === ',') && tagInput.trim()) {
      e.preventDefault();
      const cleanTag = tagInput.trim().replace(/^#/, '');
      if (!formTags.includes(cleanTag)) {
        setFormTags([...formTags, cleanTag]);
      }
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setFormTags(formTags.filter((t) => t !== tagToRemove));
  };

  // Note Actions
  const handleTogglePin = (id) => {
    setNotes((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isPinned: !n.isPinned } : n))
    );
    showToast('Note pin status updated!');
  };

  const handleToggleArchive = (id) => {
    setNotes((prev) =>
      prev.map((n) =>
        n.id === id ? { ...n, isArchived: !n.isArchived, isPinned: false } : n
      )
    );
    showToast('Note archive status changed!');
  };

  const handleMoveToTrash = (id) => {
    setNotes((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isTrash: true, isPinned: false } : n))
    );
    showToast('Note moved to Trash.', 'info');
  };

  const handleRestoreFromTrash = (id) => {
    setNotes((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isTrash: false } : n))
    );
    showToast('Note restored from Trash!', 'success');
  };

  const handlePermanentDelete = (id) => {
    if (window.confirm('Are you sure you want to permanently delete this note?')) {
      setNotes((prev) => prev.filter((n) => n.id !== id));
      showToast('Note permanently deleted.', 'error');
    }
  };

  const handleCopyContent = (note) => {
    let textToCopy = `${note.title}\n\n${note.content || ''}`;
    if (note.type === 'checklist' && note.checklist?.length) {
      textToCopy += '\n\nChecklist:\n' + note.checklist.map(c => `[${c.completed ? 'x' : ' '}] ${c.text}`).join('\n');
    }
    navigator.clipboard.writeText(textToCopy);
    showToast('Note copied to clipboard!', 'success');
  };

  const handleDownloadNote = (note) => {
    let text = `# ${note.title}\nCategory: ${note.category} | Priority: ${note.priority}\nDate: ${new Date(note.createdAt).toLocaleString()}\n\n${note.content || ''}`;
    if (note.type === 'checklist' && note.checklist?.length) {
      text += '\n\n## Checklist\n' + note.checklist.map(c => `- [${c.completed ? 'x' : ' '}] ${c.text}`).join('\n');
    }
    const blob = new Blob([text], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${note.title.toLowerCase().replace(/[^a-z0-9]/g, '_')}.md`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Note downloaded as Markdown file!', 'success');
  };

  // Export / Import Backup JSON
  const handleExportBackup = () => {
    const dataStr = JSON.stringify(notes, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `digital_notes_backup_${new Date().toISOString().slice(0,10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Notes backup exported successfully!', 'success');
  };

  const handleImportBackup = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const imported = JSON.parse(event.target.result);
        if (Array.isArray(imported)) {
          setNotes(imported);
          showToast(`Imported ${imported.length} notes successfully!`, 'success');
        } else {
          showToast('Invalid backup file format.', 'error');
        }
      } catch (err) {
        showToast('Failed to parse backup file.', 'error');
      }
    };
    reader.readAsText(file);
  };

  const handleResetSampleData = () => {
    if (window.confirm('Reset notes to default sample data? Current notes will be overwritten.')) {
      setNotes(INITIAL_NOTES);
      showToast('Notes reset to initial sample data.', 'info');
    }
  };

  // Extract All Unique Tags
  const allTags = Array.from(
    new Set(notes.filter((n) => !n.isTrash).flatMap((n) => n.tags || []))
  );

  // Filter & Sort Logic
  const filteredNotes = notes.filter((note) => {
    // Tab filtering
    if (activeTab === 'pinned' && (!note.isPinned || note.isTrash || note.isArchived)) return false;
    if (activeTab === 'archived' && (!note.isArchived || note.isTrash)) return false;
    if (activeTab === 'trash' && !note.isTrash) return false;
    if (activeTab === 'all' && (note.isTrash || note.isArchived)) return false;

    // Category filter
    if (selectedCategory !== 'All' && note.category !== selectedCategory) return false;

    // Priority filter
    if (selectedPriority !== 'All' && note.priority !== selectedPriority) return false;

    // Tag filter
    if (selectedTag && (!note.tags || !note.tags.includes(selectedTag))) return false;

    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = note.title.toLowerCase().includes(q);
      const matchContent = (note.content || '').toLowerCase().includes(q);
      const matchCategory = (note.category || '').toLowerCase().includes(q);
      const matchTags = (note.tags || []).some((t) => t.toLowerCase().includes(q));
      if (!matchTitle && !matchContent && !matchCategory && !matchTags) return false;
    }

    return true;
  });

  // Sort notes
  const sortedNotes = [...filteredNotes].sort((a, b) => {
    // Keep pinned notes at the top in 'all' view
    if (activeTab === 'all') {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
    }

    if (sortBy === 'newest') return new Date(b.createdAt) - new Date(a.createdAt);
    if (sortBy === 'oldest') return new Date(a.createdAt) - new Date(b.createdAt);
    if (sortBy === 'title') return a.title.localeCompare(b.title);
    if (sortBy === 'priority') {
      const pOrder = { High: 3, Medium: 2, Low: 1 };
      return (pOrder[b.priority] || 0) - (pOrder[a.priority] || 0);
    }
    return 0;
  });

  // Metrics
  const totalActiveNotes = notes.filter((n) => !n.isTrash && !n.isArchived).length;
  const pinnedCount = notes.filter((n) => n.isPinned && !n.isTrash).length;
  const totalTasks = notes
    .filter((n) => !n.isTrash && n.type === 'checklist')
    .reduce((acc, n) => acc + (n.checklist?.length || 0), 0);
  const completedTasks = notes
    .filter((n) => !n.isTrash && n.type === 'checklist')
    .reduce((acc, n) => acc + (n.checklist?.filter((c) => c.completed).length || 0), 0);
  const totalWords = notes
    .filter((n) => !n.isTrash)
    .reduce((acc, n) => acc + (n.content ? n.content.trim().split(/\s+/).filter(Boolean).length : 0), 0);

  return (
    <div className="digital-board-wrapper" style={styles.wrapper}>
      {/* Toast Notification */}
      {toast && (
        <div style={{
          ...styles.toast,
          borderColor: toast.type === 'error' ? '#f43f5e' : toast.type === 'success' ? '#10b981' : '#0284c7'
        }}>
          {toast.type === 'error' && <FiAlertCircle style={{ color: '#f43f5e', fontSize: '1.2rem' }} />}
          {toast.type === 'success' && <FiCheckCircle style={{ color: '#10b981', fontSize: '1.2rem' }} />}
          {toast.type === 'info' && <FiFileText style={{ color: '#0284c7', fontSize: '1.2rem' }} />}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Main Container Header */}
      <header style={styles.headerSection}>
        <div style={styles.headerTitleGroup}>
          <h1 style={styles.mainTitle}>
            Digital Note <span style={styles.gradientText}>& Workspace</span>
          </h1>
          <p style={styles.subtitle}>
            Organize thoughts, manage interactive checklists, transcribe audio notes, and filter tasks with a modern glassmorphic dashboard.
          </p>
        </div>

        {/* Quick Action Top Bar */}
        <div style={styles.topActionsGroup}>
          <button onClick={handleOpenCreateModal} style={styles.primaryBtn}>
            <FiPlus style={{ fontSize: '1.2rem' }} /> New Note
          </button>
          
          <label style={styles.secondaryBtn}>
            <FiUpload /> Import JSON
            <input type="file" accept=".json" onChange={handleImportBackup} style={{ display: 'none' }} />
          </label>

          <button onClick={handleExportBackup} style={styles.secondaryBtn}>
            <FiDownload /> Backup JSON
          </button>

          <button onClick={handleResetSampleData} style={styles.iconBtn} title="Reset Sample Notes">
            <FiRotateCcw />
          </button>
        </div>
      </header>

      {/* Live Metrics Dashboard Bar */}
      <div style={styles.statsGrid}>
        <div style={styles.statCard}>
          <span style={styles.statIcon}><FiFileText /></span>
          <div>
            <div style={styles.statNumber}>{totalActiveNotes}</div>
            <div style={styles.statLabel}>Active Notes</div>
          </div>
        </div>

        <div style={styles.statCard}>
          <span style={{ ...styles.statIcon, color: '#f59e0b', background: 'rgba(245, 158, 11, 0.15)' }}><FiStar /></span>
          <div>
            <div style={styles.statNumber}>{pinnedCount}</div>
            <div style={styles.statLabel}>Pinned Notes</div>
          </div>
        </div>

        <div style={styles.statCard}>
          <span style={{ ...styles.statIcon, color: '#10b981', background: 'rgba(16, 185, 129, 0.15)' }}><FiCheckSquare /></span>
          <div>
            <div style={styles.statNumber}>{totalTasks > 0 ? `${completedTasks}/${totalTasks}` : '0'}</div>
            <div style={styles.statLabel}>Tasks Done</div>
          </div>
        </div>

        <div style={styles.statCard}>
          <span style={{ ...styles.statIcon, color: '#8b5cf6', background: 'rgba(139, 92, 246, 0.15)' }}><FiTrendingUp /></span>
          <div>
            <div style={styles.statNumber}>{totalWords}</div>
            <div style={styles.statLabel}>Total Words</div>
          </div>
        </div>
      </div>

      {/* Main Workspace Layout (Sidebar + Notes Grid) */}
      <div style={styles.workspaceBody}>
        {/* Left Navigation & Filter Sidebar */}
        <aside style={styles.sidebar}>
          {/* Main Navigation Tabs */}
          <div style={styles.navGroup}>
            <div style={styles.sidebarHeading}>Views</div>
            <button
              style={{ ...styles.navItem, ...(activeTab === 'all' ? styles.navItemActive : {}) }}
              onClick={() => setActiveTab('all')}
            >
              <FiFileText /> All Notes
              <span style={styles.badgeCount}>{notes.filter((n) => !n.isTrash && !n.isArchived).length}</span>
            </button>

            <button
              style={{ ...styles.navItem, ...(activeTab === 'pinned' ? styles.navItemActive : {}) }}
              onClick={() => setActiveTab('pinned')}
            >
              <FiStar /> Pinned Notes
              <span style={styles.badgeCount}>{pinnedCount}</span>
            </button>

            <button
              style={{ ...styles.navItem, ...(activeTab === 'archived' ? styles.navItemActive : {}) }}
              onClick={() => setActiveTab('archived')}
            >
              <FiArchive /> Archive
              <span style={styles.badgeCount}>{notes.filter((n) => n.isArchived && !n.isTrash).length}</span>
            </button>

            <button
              style={{ ...styles.navItem, ...(activeTab === 'trash' ? styles.navItemActive : {}) }}
              onClick={() => setActiveTab('trash')}
            >
              <FiTrash2 /> Trash Bin
              <span style={styles.badgeCount}>{notes.filter((n) => n.isTrash).length}</span>
            </button>
          </div>

          {/* Category Filter */}
          <div style={styles.navGroup}>
            <div style={styles.sidebarHeading}>Categories</div>
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                style={{
                  ...styles.subNavItem,
                  ...(selectedCategory === cat ? styles.subNavItemActive : {})
                }}
                onClick={() => setSelectedCategory(cat)}
              >
                <FiFolder style={{ fontSize: '0.9rem' }} /> {cat}
              </button>
            ))}
          </div>

          {/* Priority Filter */}
          <div style={styles.navGroup}>
            <div style={styles.sidebarHeading}>Priority</div>
            {PRIORITIES.map((p) => (
              <button
                key={p}
                style={{
                  ...styles.subNavItem,
                  ...(selectedPriority === p ? styles.subNavItemActive : {})
                }}
                onClick={() => setSelectedPriority(p)}
              >
                <span
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    background: p === 'High' ? '#f43f5e' : p === 'Medium' ? '#f59e0b' : p === 'Low' ? '#10b981' : '#9ca3af'
                  }}
                />
                {p}
              </button>
            ))}
          </div>

          {/* Tags Cloud Filter */}
          {allTags.length > 0 && (
            <div style={styles.navGroup}>
              <div style={styles.sidebarHeading}>Tags</div>
              <div style={styles.tagCloud}>
                {selectedTag && (
                  <button onClick={() => setSelectedTag(null)} style={styles.clearTagBtn}>
                    Clear Filter ({selectedTag})
                  </button>
                )}
                {allTags.map((tag) => (
                  <span
                    key={tag}
                    onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
                    style={{
                      ...styles.tagPill,
                      ...(selectedTag === tag ? styles.tagPillActive : {})
                    }}
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </aside>

        {/* Right Section: Controls + Cards Display */}
        <main style={styles.mainContent}>
          {/* Search, Sort, View Mode Bar */}
          <div style={styles.filterControlBar}>
            {/* Search Input */}
            <div style={styles.searchBox}>
              <FiSearch style={styles.searchIcon} />
              <input
                type="text"
                placeholder="Search notes, title, content, or tags..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={styles.searchInput}
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} style={styles.clearSearchBtn}>
                  <FiX />
                </button>
              )}
            </div>

            {/* Controls Right */}
            <div style={styles.controlsRight}>
              {/* Sort By Dropdown */}
              <div style={styles.sortWrapper}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Sort:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  style={styles.selectInput}
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="title">Title (A-Z)</option>
                  <option value="priority">Priority (High to Low)</option>
                </select>
              </div>

              {/* View Switch Buttons */}
              <div style={styles.viewToggleGroup}>
                <button
                  onClick={() => setViewMode('grid')}
                  style={{ ...styles.viewToggleBtn, ...(viewMode === 'grid' ? styles.viewToggleBtnActive : {}) }}
                  title="Grid View"
                >
                  <FiGrid />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  style={{ ...styles.viewToggleBtn, ...(viewMode === 'list' ? styles.viewToggleBtnActive : {}) }}
                  title="List View"
                >
                  <FiList />
                </button>
              </div>
            </div>
          </div>

          {/* Cards Grid / List Display */}
          {sortedNotes.length === 0 ? (
            <div style={styles.emptyStateContainer}>
              <FiFolder style={{ fontSize: '3.5rem', color: 'var(--text-muted)', marginBottom: 15 }} />
              <h3 style={{ fontSize: '1.3rem', marginBottom: 8 }}>No Notes Found</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', maxWidth: 400, margin: '0 auto 20px' }}>
                {searchQuery || selectedCategory !== 'All' || selectedPriority !== 'All' || selectedTag
                  ? 'No notes match your current search or filter criteria. Try clearing filters.'
                  : activeTab === 'trash'
                  ? 'Your trash bin is empty.'
                  : activeTab === 'archived'
                  ? 'No archived notes.'
                  : 'Start by creating your first digital note or interactive checklist!'}
              </p>
              {activeTab === 'all' && (
                <button onClick={handleOpenCreateModal} style={styles.primaryBtn}>
                  <FiPlus /> Create Note
                </button>
              )}
            </div>
          ) : (
            <div style={viewMode === 'grid' ? styles.notesGrid : styles.notesList}>
              {sortedNotes.map((note) => {
                // Calculation for checklist progress
                const checklistTotal = note.checklist?.length || 0;
                const checklistDone = note.checklist?.filter((c) => c.completed).length || 0;
                const checklistPercent = checklistTotal > 0 ? Math.round((checklistDone / checklistTotal) * 100) : 0;

                return (
                  <div
                    key={note.id}
                    style={{
                      ...styles.noteCard,
                      borderTop: `4px solid ${note.color || '#0284c7'}`
                    }}
                    className="glass-panel"
                  >
                    {/* Card Top Header Bar */}
                    <div style={styles.cardHeader}>
                      <div style={styles.cardBadges}>
                        <span style={{ ...styles.badgePill, background: `${note.color}22`, color: note.color }}>
                          {note.category}
                        </span>
                        <span
                          style={{
                            ...styles.badgePill,
                            background:
                              note.priority === 'High'
                                ? 'rgba(244, 63, 94, 0.15)'
                                : note.priority === 'Medium'
                                ? 'rgba(245, 158, 11, 0.15)'
                                : 'rgba(16, 185, 129, 0.15)',
                            color:
                              note.priority === 'High'
                                ? '#f43f5e'
                                : note.priority === 'Medium'
                                ? '#f59e0b'
                                : '#10b981'
                          }}
                        >
                          {note.priority}
                        </span>
                      </div>

                      <div style={styles.cardHeaderActions}>
                        {!note.isTrash && (
                          <button
                            onClick={() => handleTogglePin(note.id)}
                            style={{
                              ...styles.iconActionBtn,
                              color: note.isPinned ? '#f59e0b' : 'var(--text-muted)'
                            }}
                            title={note.isPinned ? 'Unpin note' : 'Pin note'}
                          >
                            <FiStar style={{ fill: note.isPinned ? '#f59e0b' : 'none' }} />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Note Title */}
                    <h3 style={styles.noteCardTitle}>{note.title}</h3>

                    {/* Optional Image Attachment Preview */}
                    {note.image && (
                      <div style={styles.imageWrapper}>
                        <img src={note.image} alt={note.title} style={styles.cardImage} />
                      </div>
                    )}

                    {/* Card Body Content */}
                    {note.type === 'checklist' ? (
                      <div style={styles.checklistSection}>
                        {/* Progress Bar */}
                        <div style={styles.progressHeader}>
                          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                            Progress: {checklistDone}/{checklistTotal} ({checklistPercent}%)
                          </span>
                        </div>
                        <div style={styles.progressBarBg}>
                          <div
                            style={{
                              ...styles.progressBarFill,
                              width: `${checklistPercent}%`,
                              background: note.color || '#0284c7'
                            }}
                          />
                        </div>

                        {/* Interactive Items */}
                        <div style={styles.checklistItemsList}>
                          {note.checklist?.map((item) => (
                            <div
                              key={item.id}
                              onClick={() => !note.isTrash && handleToggleCardChecklist(note.id, item.id)}
                              style={{
                                ...styles.checkitemRow,
                                opacity: item.completed ? 0.6 : 1,
                                cursor: note.isTrash ? 'default' : 'pointer'
                              }}
                            >
                              {item.completed ? (
                                <FiCheckSquare style={{ color: note.color || '#0284c7', flexShrink: 0 }} />
                              ) : (
                                <FiSquare style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
                              )}
                              <span
                                style={{
                                  textDecoration: item.completed ? 'line-through' : 'none',
                                  fontSize: '0.9rem'
                                }}
                              >
                                {item.text}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <p style={styles.noteCardBody}>{note.content}</p>
                    )}

                    {/* Tags List */}
                    {note.tags && note.tags.length > 0 && (
                      <div style={styles.cardTagsRow}>
                        {note.tags.map((t) => (
                          <span key={t} style={styles.cardTagItem}>
                            #{t}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Card Footer Info & Buttons */}
                    <div style={styles.cardFooter}>
                      <div style={styles.dateInfo} suppressHydrationWarning>
                        <FiClock style={{ fontSize: '0.8rem', marginRight: 4 }} />
                        {new Date(note.updatedAt || note.createdAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>

                      {/* Action Bar */}
                      <div style={styles.cardFooterActions}>
                        {note.isTrash ? (
                          <>
                            <button
                              onClick={() => handleRestoreFromTrash(note.id)}
                              style={styles.actionBtnIcon}
                              title="Restore Note"
                            >
                              <FiRotateCcw />
                            </button>
                            <button
                              onClick={() => handlePermanentDelete(note.id)}
                              style={{ ...styles.actionBtnIcon, color: '#f43f5e' }}
                              title="Delete Permanently"
                            >
                              <FiTrash2 />
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => handleCopyContent(note)}
                              style={styles.actionBtnIcon}
                              title="Copy to Clipboard"
                            >
                              <FiCopy />
                            </button>
                            <button
                              onClick={() => handleDownloadNote(note)}
                              style={styles.actionBtnIcon}
                              title="Download as Markdown"
                            >
                              <FiDownload />
                            </button>
                            <button
                              onClick={() => handleOpenEditModal(note)}
                              style={styles.actionBtnIcon}
                              title="Edit Note"
                            >
                              <FiEdit3 />
                            </button>
                            <button
                              onClick={() => handleToggleArchive(note.id)}
                              style={{
                                ...styles.actionBtnIcon,
                                color: note.isArchived ? '#0284c7' : 'var(--text-muted)'
                              }}
                              title={note.isArchived ? 'Unarchive' : 'Archive'}
                            >
                              <FiArchive />
                            </button>
                            <button
                              onClick={() => handleMoveToTrash(note.id)}
                              style={{ ...styles.actionBtnIcon, color: '#f43f5e' }}
                              title="Move to Trash"
                            >
                              <FiTrash2 />
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </main>
      </div>

      {/* CREATE / EDIT NOTE MODAL */}
      {isModalOpen && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent} className="glass-panel">
            <div style={styles.modalHeader}>
              <h2 style={styles.modalTitle}>
                {editingNoteId ? '✏️ Edit Digital Note' : '✨ Create New Digital Note'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} style={styles.closeModalBtn}>
                <FiX />
              </button>
            </div>

            <form onSubmit={handleSaveNote} style={styles.formBody}>
              {/* Title & Pin Toggle */}
              <div style={styles.formRow}>
                <input
                  type="text"
                  placeholder="Note Title..."
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  style={styles.titleInput}
                  required
                />
                <button
                  type="button"
                  onClick={() => setFormIsPinned(!formIsPinned)}
                  style={{
                    ...styles.pinToggleBtn,
                    borderColor: formIsPinned ? '#f59e0b' : 'var(--border-glass)',
                    color: formIsPinned ? '#f59e0b' : 'var(--text-muted)'
                  }}
                >
                  <FiStar style={{ fill: formIsPinned ? '#f59e0b' : 'none' }} />
                  {formIsPinned ? 'Pinned' : 'Pin'}
                </button>
              </div>

              {/* Selectors Row: Category, Priority, Type */}
              <div style={styles.selectorsRow}>
                <div style={styles.inputGroup}>
                  <label style={styles.fieldLabel}>Category</label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    style={styles.formSelect}
                  >
                    {CATEGORIES.filter((c) => c !== 'All').map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div style={styles.inputGroup}>
                  <label style={styles.fieldLabel}>Priority</label>
                  <select
                    value={formPriority}
                    onChange={(e) => setFormPriority(e.target.value)}
                    style={styles.formSelect}
                  >
                    {PRIORITIES.filter((p) => p !== 'All').map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </select>
                </div>

                <div style={styles.inputGroup}>
                  <label style={styles.fieldLabel}>Note Type</label>
                  <select
                    value={formType}
                    onChange={(e) => setFormType(e.target.value)}
                    style={styles.formSelect}
                  >
                    <option value="text">Standard Text / Markdown</option>
                    <option value="checklist">Interactive Checklist / Tasks</option>
                  </select>
                </div>
              </div>

              {/* Color Theme Selector */}
              <div style={styles.inputGroup}>
                <label style={styles.fieldLabel}>Note Theme Accent</label>
                <div style={styles.colorPickerGrid}>
                  {COLOR_OPTIONS.map((c) => (
                    <div
                      key={c.hex}
                      onClick={() => setFormColor(c.hex)}
                      style={{
                        ...styles.colorDot,
                        backgroundColor: c.hex,
                        outline: formColor === c.hex ? `3px solid ${c.hex}` : 'none',
                        outlineOffset: 2
                      }}
                      title={c.name}
                    />
                  ))}
                </div>
              </div>

              {/* Content Area or Checklist Builder */}
              {formType === 'text' ? (
                <div style={styles.inputGroup}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                    <label style={styles.fieldLabel}>Note Content</label>
                    <button
                      type="button"
                      onClick={toggleVoiceListening}
                      style={{
                        ...styles.voiceBtn,
                        background: isListening ? 'rgba(244, 63, 94, 0.2)' : 'rgba(2, 132, 199, 0.2)',
                        color: isListening ? '#f43f5e' : '#0284c7'
                      }}
                    >
                      {isListening ? <FiMicOff /> : <FiMic />}
                      {isListening ? 'Stop Listening' : 'Voice Dictate'}
                    </button>
                  </div>
                  <textarea
                    placeholder="Write your notes here... (Markdown supported)"
                    value={formContent}
                    onChange={(e) => setFormContent(e.target.value)}
                    style={styles.formTextarea}
                  />
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'right', marginTop: 4 }}>
                    {formContent.trim() ? formContent.trim().split(/\s+/).length : 0} words | {formContent.length} chars
                  </div>
                </div>
              ) : (
                <div style={styles.inputGroup}>
                  <label style={styles.fieldLabel}>Checklist Items</label>
                  <div style={styles.addCheckitemRow}>
                    <input
                      type="text"
                      placeholder="Add task item..."
                      value={newCheckitem}
                      onChange={(e) => setNewCheckitem(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddChecklistItem();
                        }
                      }}
                      style={styles.checkitemInput}
                    />
                    <button type="button" onClick={handleAddChecklistItem} style={styles.secondaryBtn}>
                      <FiPlus /> Add
                    </button>
                  </div>

                  <div style={styles.formChecklistContainer}>
                    {formChecklist.map((item) => (
                      <div key={item.id} style={styles.formCheckitemRow}>
                        <input
                          type="checkbox"
                          checked={item.completed}
                          onChange={() => handleToggleFormChecklist(item.id)}
                          style={{ cursor: 'pointer', width: 16, height: 16 }}
                        />
                        <span
                          style={{
                            flex: 1,
                            textDecoration: item.completed ? 'line-through' : 'none',
                            color: item.completed ? 'var(--text-muted)' : 'var(--text-main)'
                          }}
                        >
                          {item.text}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleRemoveFormChecklist(item.id)}
                          style={styles.deleteCheckitemBtn}
                        >
                          <FiX />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tags Input */}
              <div style={styles.inputGroup}>
                <label style={styles.fieldLabel}>Tags (Press Enter or Comma to add)</label>
                <div style={styles.tagsContainer}>
                  {formTags.map((tag) => (
                    <span key={tag} style={styles.tagChip}>
                      #{tag}
                      <button type="button" onClick={() => handleRemoveTag(tag)} style={styles.tagChipRemove}>
                        &times;
                      </button>
                    </span>
                  ))}
                  <input
                    type="text"
                    placeholder="Add tag..."
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={handleAddTag}
                    style={styles.tagInputField}
                  />
                </div>
              </div>

              {/* Optional Image URL */}
              <div style={styles.inputGroup}>
                <label style={styles.fieldLabel}>Image Attachment URL (Optional)</label>
                <input
                  type="url"
                  placeholder="https://example.com/image.png"
                  value={formImage}
                  onChange={(e) => setFormImage(e.target.value)}
                  style={styles.formInput}
                />
              </div>

              {/* Modal Actions */}
              <div style={styles.modalFooter}>
                <button type="button" onClick={() => setIsModalOpen(false)} style={styles.secondaryBtn}>
                  Cancel
                </button>
                <button type="submit" style={styles.primaryBtn}>
                  <FiCheck /> {editingNoteId ? 'Update Note' : 'Save Note'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// STYLES OBJECT (Matching Portfolio Glassmorphic Dark Theme System)
const styles = {
  wrapper: {
    padding: '40px 5% 60px',
    maxWidth: '1400px',
    margin: '0 auto',
    minHeight: '100vh',
    color: 'var(--text-main)',
    fontFamily: "'Outfit', 'Poppins', sans-serif"
  },
  toast: {
    position: 'fixed',
    bottom: 30,
    right: 30,
    zIndex: 9999,
    background: 'rgba(17, 24, 39, 0.95)',
    backdropFilter: 'blur(16px)',
    border: '1px solid var(--border-glass)',
    borderLeftWidth: 5,
    borderRadius: 12,
    padding: '12px 20px',
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    boxShadow: '0 10px 25px rgba(0,0,0,0.4)',
    color: 'var(--text-main)',
    fontSize: '0.95rem',
    animation: 'slideUp 0.3s ease'
  },
  headerSection: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 20,
    marginBottom: 30
  },
  headerTitleGroup: {
    maxWidth: '700px'
  },
  mainTitle: {
    fontSize: '2.4rem',
    fontWeight: 800,
    letterSpacing: '-0.5px',
    marginBottom: 8
  },
  gradientText: {
    background: 'linear-gradient(135deg, #38bdf8 0%, #a855f7 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent'
  },
  subtitle: {
    color: 'var(--text-muted)',
    fontSize: '1rem',
    lineHeight: 1.5
  },
  topActionsGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    flexWrap: 'wrap'
  },
  primaryBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 8,
    padding: '10px 20px',
    borderRadius: 12,
    background: 'linear-gradient(135deg, #0284c7 0%, #2563eb 100%)',
    color: '#fff',
    fontWeight: 600,
    border: 'none',
    cursor: 'pointer',
    boxShadow: '0 4px 15px rgba(2, 132, 199, 0.3)',
    transition: 'all 0.2s ease'
  },
  secondaryBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 8,
    padding: '10px 16px',
    borderRadius: 12,
    background: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid var(--border-glass)',
    color: 'var(--text-main)',
    fontWeight: 500,
    cursor: 'pointer',
    fontSize: '0.9rem',
    transition: 'all 0.2s ease'
  },
  iconBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 42,
    height: 42,
    borderRadius: 12,
    background: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid var(--border-glass)',
    color: 'var(--text-muted)',
    cursor: 'pointer',
    fontSize: '1.1rem',
    transition: 'all 0.2s ease'
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: 16,
    marginBottom: 30
  },
  statCard: {
    display: 'flex',
    alignItems: 'center',
    gap: 16,
    padding: '16px 20px',
    borderRadius: 16,
    background: 'var(--bg-card)',
    backdropFilter: 'blur(12px)',
    border: '1px solid var(--border-glass)'
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    background: 'rgba(2, 132, 199, 0.15)',
    color: '#0284c7',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1.4rem'
  },
  statNumber: {
    fontSize: '1.5rem',
    fontWeight: 700
  },
  statLabel: {
    fontSize: '0.85rem',
    color: 'var(--text-muted)'
  },
  workspaceBody: {
    display: 'grid',
    gridTemplateColumns: '260px 1fr',
    gap: 25,
    alignItems: 'start'
  },
  sidebar: {
    display: 'flex',
    flexDirection: 'column',
    gap: 24,
    padding: 20,
    borderRadius: 16,
    background: 'var(--bg-card)',
    backdropFilter: 'blur(16px)',
    border: '1px solid var(--border-glass)'
  },
  navGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: 6
  },
  sidebarHeading: {
    fontSize: '0.75rem',
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '1px',
    color: 'var(--text-muted)',
    marginBottom: 6
  },
  navItem: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
    padding: '10px 12px',
    borderRadius: 10,
    border: 'none',
    background: 'transparent',
    color: 'var(--text-muted)',
    fontSize: '0.95rem',
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    textAlign: 'left'
  },
  navItemActive: {
    background: 'rgba(2, 132, 199, 0.15)',
    color: '#38bdf8',
    fontWeight: 600
  },
  badgeCount: {
    fontSize: '0.75rem',
    padding: '2px 8px',
    borderRadius: 10,
    background: 'rgba(255, 255, 255, 0.08)',
    color: 'var(--text-muted)'
  },
  subNavItem: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: '8px 12px',
    borderRadius: 8,
    border: 'none',
    background: 'transparent',
    color: 'var(--text-muted)',
    fontSize: '0.9rem',
    cursor: 'pointer',
    transition: 'all 0.2s ease'
  },
  subNavItemActive: {
    background: 'rgba(255, 255, 255, 0.08)',
    color: 'var(--text-main)',
    fontWeight: 600
  },
  tagCloud: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 6
  },
  tagPill: {
    fontSize: '0.8rem',
    padding: '4px 10px',
    borderRadius: 20,
    background: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid var(--border-glass)',
    color: 'var(--text-muted)',
    cursor: 'pointer',
    transition: 'all 0.2s ease'
  },
  tagPillActive: {
    background: '#0284c7',
    color: '#fff',
    borderColor: '#0284c7'
  },
  clearTagBtn: {
    fontSize: '0.75rem',
    color: '#f43f5e',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    marginBottom: 4
  },
  mainContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: 20
  },
  filterControlBar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 16,
    flexWrap: 'wrap',
    padding: '14px 20px',
    borderRadius: 16,
    background: 'var(--bg-card)',
    backdropFilter: 'blur(16px)',
    border: '1px solid var(--border-glass)'
  },
  searchBox: {
    position: 'relative',
    flex: 1,
    minWidth: 240
  },
  searchIcon: {
    position: 'absolute',
    left: 14,
    top: '50%',
    transform: 'translateY(-50%)',
    color: 'var(--text-muted)',
    fontSize: '1rem'
  },
  searchInput: {
    width: '100%',
    padding: '10px 38px 10px 38px',
    borderRadius: 10,
    border: '1px solid var(--border-glass)',
    background: 'rgba(0, 0, 0, 0.2)',
    color: 'var(--text-main)',
    fontSize: '0.9rem',
    outline: 'none'
  },
  clearSearchBtn: {
    position: 'absolute',
    right: 12,
    top: '50%',
    transform: 'translateY(-50%)',
    background: 'none',
    border: 'none',
    color: 'var(--text-muted)',
    cursor: 'pointer'
  },
  controlsRight: {
    display: 'flex',
    alignItems: 'center',
    gap: 16
  },
  sortWrapper: {
    display: 'flex',
    alignItems: 'center',
    gap: 8
  },
  selectInput: {
    padding: '8px 12px',
    borderRadius: 8,
    background: 'rgba(0, 0, 0, 0.3)',
    border: '1px solid var(--border-glass)',
    color: 'var(--text-main)',
    fontSize: '0.85rem',
    outline: 'none',
    cursor: 'pointer'
  },
  viewToggleGroup: {
    display: 'flex',
    gap: 4,
    background: 'rgba(0, 0, 0, 0.2)',
    padding: 4,
    borderRadius: 8,
    border: '1px solid var(--border-glass)'
  },
  viewToggleBtn: {
    border: 'none',
    background: 'transparent',
    color: 'var(--text-muted)',
    padding: '6px 10px',
    borderRadius: 6,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  viewToggleBtnActive: {
    background: 'rgba(255, 255, 255, 0.1)',
    color: '#38bdf8'
  },
  notesGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: 20
  },
  notesList: {
    display: 'flex',
    flexDirection: 'column',
    gap: 16
  },
  noteCard: {
    padding: 20,
    borderRadius: 16,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    minHeight: 220,
    position: 'relative',
    transition: 'all 0.3s ease'
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12
  },
  cardBadges: {
    display: 'flex',
    gap: 6
  },
  badgePill: {
    fontSize: '0.75rem',
    fontWeight: 600,
    padding: '3px 10px',
    borderRadius: 12
  },
  cardHeaderActions: {
    display: 'flex',
    alignItems: 'center',
    gap: 6
  },
  iconActionBtn: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    fontSize: '1rem',
    padding: 4,
    borderRadius: 6,
    transition: 'all 0.2s ease'
  },
  noteCardTitle: {
    fontSize: '1.15rem',
    fontWeight: 700,
    marginBottom: 10,
    lineHeight: 1.3
  },
  imageWrapper: {
    marginBottom: 12,
    borderRadius: 10,
    overflow: 'hidden',
    maxHeight: 150
  },
  cardImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover'
  },
  noteCardBody: {
    fontSize: '0.92rem',
    color: 'var(--text-muted)',
    lineHeight: 1.6,
    whiteSpace: 'pre-wrap',
    marginBottom: 16,
    flex: 1
  },
  checklistSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
    marginBottom: 16,
    flex: 1
  },
  progressHeader: {
    display: 'flex',
    justifyContent: 'space-between'
  },
  progressBarBg: {
    width: '100%',
    height: 6,
    borderRadius: 3,
    background: 'rgba(255, 255, 255, 0.08)',
    overflow: 'hidden'
  },
  progressBarFill: {
    height: '100%',
    transition: 'width 0.3s ease'
  },
  checklistItemsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
    marginTop: 6
  },
  checkitemRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 10
  },
  cardTagsRow: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 16
  },
  cardTagItem: {
    fontSize: '0.75rem',
    color: '#38bdf8',
    background: 'rgba(56, 189, 248, 0.1)',
    padding: '2px 8px',
    borderRadius: 10
  },
  cardFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTop: '1px solid rgba(255, 255, 255, 0.08)'
  },
  dateInfo: {
    fontSize: '0.78rem',
    color: 'var(--text-muted)',
    display: 'flex',
    alignItems: 'center'
  },
  cardFooterActions: {
    display: 'flex',
    alignItems: 'center',
    gap: 8
  },
  actionBtnIcon: {
    background: 'none',
    border: 'none',
    color: 'var(--text-muted)',
    fontSize: '0.95rem',
    cursor: 'pointer',
    padding: 4,
    borderRadius: 4,
    transition: 'color 0.2s ease'
  },
  emptyStateContainer: {
    textAlign: 'center',
    padding: '60px 20px',
    borderRadius: 16,
    background: 'var(--bg-card)',
    border: '1px solid var(--border-glass)'
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0, 0, 0, 0.75)',
    backdropFilter: 'blur(8px)',
    zIndex: 999,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20
  },
  modalContent: {
    width: '100%',
    maxWidth: 620,
    maxHeight: '90vh',
    overflowY: 'auto',
    padding: 25,
    borderRadius: 20,
    background: 'rgba(17, 24, 39, 0.95)',
    border: '1px solid var(--border-glass)',
    boxShadow: '0 20px 50px rgba(0, 0, 0, 0.6)'
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 12,
    borderBottom: '1px solid var(--border-glass)'
  },
  modalTitle: {
    fontSize: '1.3rem',
    fontWeight: 700
  },
  closeModalBtn: {
    background: 'none',
    border: 'none',
    color: 'var(--text-muted)',
    fontSize: '1.3rem',
    cursor: 'pointer'
  },
  formBody: {
    display: 'flex',
    flexDirection: 'column',
    gap: 16
  },
  formRow: {
    display: 'flex',
    gap: 12
  },
  titleInput: {
    flex: 1,
    padding: '12px 16px',
    borderRadius: 12,
    border: '1px solid var(--border-glass)',
    background: 'rgba(0, 0, 0, 0.3)',
    color: 'var(--text-main)',
    fontSize: '1.1rem',
    fontWeight: 600,
    outline: 'none'
  },
  pinToggleBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    padding: '0 16px',
    borderRadius: 12,
    background: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid var(--border-glass)',
    cursor: 'pointer',
    fontSize: '0.9rem',
    fontWeight: 600
  },
  selectorsRow: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr 1fr',
    gap: 12
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: 6
  },
  fieldLabel: {
    fontSize: '0.82rem',
    fontWeight: 600,
    color: 'var(--text-muted)'
  },
  formSelect: {
    padding: '10px 12px',
    borderRadius: 10,
    border: '1px solid var(--border-glass)',
    background: 'rgba(0, 0, 0, 0.3)',
    color: 'var(--text-main)',
    fontSize: '0.9rem',
    outline: 'none'
  },
  formInput: {
    padding: '10px 14px',
    borderRadius: 10,
    border: '1px solid var(--border-glass)',
    background: 'rgba(0, 0, 0, 0.3)',
    color: 'var(--text-main)',
    fontSize: '0.9rem',
    outline: 'none'
  },
  colorPickerGrid: {
    display: 'flex',
    gap: 12,
    alignItems: 'center'
  },
  colorDot: {
    width: 28,
    height: 28,
    borderRadius: '50%',
    cursor: 'pointer',
    transition: 'transform 0.2s ease'
  },
  voiceBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    padding: '4px 10px',
    borderRadius: 8,
    border: 'none',
    fontSize: '0.8rem',
    fontWeight: 600,
    cursor: 'pointer'
  },
  formTextarea: {
    width: '100%',
    height: 140,
    padding: 14,
    borderRadius: 12,
    border: '1px solid var(--border-glass)',
    background: 'rgba(0, 0, 0, 0.3)',
    color: 'var(--text-main)',
    fontSize: '0.95rem',
    lineHeight: 1.6,
    outline: 'none',
    resize: 'vertical'
  },
  addCheckitemRow: {
    display: 'flex',
    gap: 8
  },
  checkitemInput: {
    flex: 1,
    padding: '8px 12px',
    borderRadius: 8,
    border: '1px solid var(--border-glass)',
    background: 'rgba(0, 0, 0, 0.3)',
    color: 'var(--text-main)',
    fontSize: '0.9rem',
    outline: 'none'
  },
  formChecklistContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
    maxHeight: 160,
    overflowY: 'auto',
    marginTop: 6
  },
  formCheckitemRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: '6px 10px',
    borderRadius: 8,
    background: 'rgba(255, 255, 255, 0.03)'
  },
  deleteCheckitemBtn: {
    background: 'none',
    border: 'none',
    color: '#f43f5e',
    cursor: 'pointer',
    fontSize: '1rem'
  },
  tagsContainer: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 8,
    padding: 10,
    borderRadius: 12,
    border: '1px solid var(--border-glass)',
    background: 'rgba(0, 0, 0, 0.3)',
    alignItems: 'center'
  },
  tagChip: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    fontSize: '0.8rem',
    padding: '3px 10px',
    borderRadius: 12,
    background: 'rgba(56, 189, 248, 0.15)',
    color: '#38bdf8'
  },
  tagChipRemove: {
    background: 'none',
    border: 'none',
    color: '#38bdf8',
    cursor: 'pointer',
    fontSize: '0.9rem',
    lineHeight: 1
  },
  tagInputField: {
    border: 'none',
    background: 'transparent',
    color: 'var(--text-main)',
    fontSize: '0.85rem',
    outline: 'none',
    flex: 1,
    minWidth: 100
  },
  modalFooter: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: 12,
    marginTop: 10,
    paddingTop: 16,
    borderTop: '1px solid var(--border-glass)'
  }
};
