import React, { useEffect, useState } from 'react';
import { 
  HelpCircle, 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  CheckCircle2, 
  AlertCircle, 
  Eye, 
  EyeOff, 
  ChevronDown, 
  ChevronUp, 
  Globe2, 
  RefreshCw,
  Hash,
  X,
  FileQuestion
} from 'lucide-react';
import api from '../api/client';
import { useTheme } from '../context/ThemeContext';

const Faqs = () => {
  const { isDark } = useTheme();

  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'active' | 'inactive'
  const [expandedId, setExpandedId] = useState(null);

  // Modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [editingFaq, setEditingFaq] = useState(null); // null if adding
  const [submitting, setSubmitting] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  // Form fields
  const [questionEn, setQuestionEn] = useState('');
  const [questionGu, setQuestionGu] = useState('');
  const [answerEn, setAnswerEn] = useState('');
  const [answerGu, setAnswerGu] = useState('');
  const [orderIndex, setOrderIndex] = useState(1);
  const [isActive, setIsActive] = useState(true);

  // Alerts
  const [feedback, setFeedback] = useState(null);

  const fetchFaqs = async () => {
    setLoading(true);
    try {
      const res = await api.get('/faqs');
      const list = res.data?.data?.faqs || [];
      setFaqs(list);
    } catch (err) {
      console.error('Error fetching FAQs:', err);
      setFeedback({ success: false, message: 'Failed to load FAQs from server.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFaqs();
  }, []);

  const handleOpenAddModal = () => {
    setEditingFaq(null);
    setQuestionEn('');
    setQuestionGu('');
    setAnswerEn('');
    setAnswerGu('');
    setOrderIndex(faqs.length + 1);
    setIsActive(true);
    setModalOpen(true);
  };

  const handleOpenEditModal = (faq) => {
    setEditingFaq(faq);
    setQuestionEn(faq.question_en || '');
    setQuestionGu(faq.question_gu || '');
    setAnswerEn(faq.answer_en || '');
    setAnswerGu(faq.answer_gu || '');
    setOrderIndex(faq.order_index ?? 0);
    setIsActive(faq.is_active ?? true);
    setModalOpen(true);
  };

  const handleSaveFaq = async (e) => {
    e.preventDefault();
    if (!questionEn.trim() || !questionGu.trim() || !answerEn.trim() || !answerGu.trim()) {
      alert('Please fill in both English and Gujarati questions and answers.');
      return;
    }

    setSubmitting(true);
    setFeedback(null);

    const payload = {
      question_en: questionEn.trim(),
      question_gu: questionGu.trim(),
      answer_en: answerEn.trim(),
      answer_gu: answerGu.trim(),
      order_index: parseInt(orderIndex) || 0,
      is_active: isActive
    };

    try {
      if (editingFaq) {
        await api.put(`/faqs/${editingFaq.id}`, payload);
        setFeedback({ success: true, message: 'FAQ updated successfully!' });
      } else {
        await api.post('/faqs', payload);
        setFeedback({ success: true, message: 'New FAQ added successfully!' });
      }
      setModalOpen(false);
      await fetchFaqs();
    } catch (err) {
      console.error('Error saving FAQ:', err);
      setFeedback({ 
        success: false, 
        message: err.response?.data?.message || 'Failed to save FAQ. Please try again.' 
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (faq) => {
    try {
      setFaqs(prev => prev.map(f => f.id === faq.id ? { ...f, is_active: !f.is_active } : f));
      await api.patch(`/faqs/${faq.id}/toggle`);
      setFeedback({ 
        success: true, 
        message: `FAQ #${faq.order_index} is now ${!faq.is_active ? 'Active' : 'Hidden'}` 
      });
    } catch (err) {
      console.error('Error toggling FAQ:', err);
      setFeedback({ success: false, message: 'Failed to toggle FAQ status.' });
      fetchFaqs();
    }
  };

  const handleDeleteFaq = async (id) => {
    try {
      await api.delete(`/faqs/${id}`);
      setFeedback({ success: true, message: 'FAQ deleted successfully!' });
      setDeleteConfirmId(null);
      await fetchFaqs();
    } catch (err) {
      console.error('Error deleting FAQ:', err);
      setFeedback({ success: false, message: 'Failed to delete FAQ.' });
    }
  };

  // Filter & Search
  const filteredFaqs = faqs.filter(faq => {
    if (statusFilter === 'active' && !faq.is_active) return false;
    if (statusFilter === 'inactive' && faq.is_active) return false;

    if (!searchTerm.trim()) return true;
    const s = searchTerm.toLowerCase();
    return (
      faq.question_en?.toLowerCase().includes(s) ||
      faq.question_gu?.toLowerCase().includes(s) ||
      faq.answer_en?.toLowerCase().includes(s) ||
      faq.answer_gu?.toLowerCase().includes(s)
    );
  });

  const activeCount = faqs.filter(f => f.is_active).length;
  const inactiveCount = faqs.length - activeCount;

  // Theming classes
  const cardBg = isDark 
    ? 'bg-slate-900 border-slate-800 text-slate-100' 
    : 'bg-white border-slate-200 text-slate-800 shadow-sm';
  const textMuted = isDark ? 'text-slate-400' : 'text-slate-500';
  const inputBg = isDark 
    ? 'bg-slate-950 border-slate-800 text-white placeholder-slate-500 focus:border-cyan-500' 
    : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400 focus:border-cyan-600';

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <HelpCircle className="w-6 h-6 text-cyan-600 dark:text-cyan-400" />
            <h1 className={`text-2xl font-bold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Help & FAQs
            </h1>
          </div>
          <p className={`text-xs sm:text-sm mt-1 ${textMuted}`}>
            Manage bilingual knowledge base entries (English & ગુજરાતી) displayed in the artisan mobile app.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={fetchFaqs}
            disabled={loading}
            className={`p-2.5 rounded-xl border transition-colors flex items-center justify-center ${
              isDark ? 'border-slate-800 hover:bg-slate-800 text-slate-300' : 'border-slate-200 hover:bg-slate-100 text-slate-600'
            }`}
            title="Refresh FAQs"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-cyan-500' : ''}`} />
          </button>

          <button
            onClick={handleOpenAddModal}
            className="flex items-center space-x-2 px-4 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white font-medium text-xs sm:text-sm rounded-xl shadow-lg shadow-cyan-600/25 transition-all active:scale-[0.98]"
          >
            <Plus className="w-4 h-4" />
            <span>Add New FAQ</span>
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className={`p-4 rounded-2xl border ${cardBg}`}>
          <div className="flex items-center justify-between">
            <span className={`text-xs font-medium ${textMuted}`}>Total FAQs</span>
            <FileQuestion className="w-4 h-4 text-cyan-500" />
          </div>
          <p className="text-2xl font-bold mt-1">{faqs.length}</p>
          <span className={`text-[11px] ${textMuted}`}>Knowledge base items</span>
        </div>

        <div className={`p-4 rounded-2xl border ${cardBg}`}>
          <div className="flex items-center justify-between">
            <span className={`text-xs font-medium ${textMuted}`}>Active in App</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-2xl font-bold mt-1 text-emerald-600 dark:text-emerald-400">{activeCount}</p>
          <span className={`text-[11px] ${textMuted}`}>Live for diamond artisans</span>
        </div>

        <div className={`p-4 rounded-2xl border ${cardBg}`}>
          <div className="flex items-center justify-between">
            <span className={`text-xs font-medium ${textMuted}`}>Hidden / Draft</span>
            <EyeOff className="w-4 h-4 text-slate-400" />
          </div>
          <p className="text-2xl font-bold mt-1 text-slate-500">{inactiveCount}</p>
          <span className={`text-[11px] ${textMuted}`}>Not visible in app</span>
        </div>

        <div className={`p-4 rounded-2xl border ${cardBg}`}>
          <div className="flex items-center justify-between">
            <span className={`text-xs font-medium ${textMuted}`}>Languages</span>
            <Globe2 className="w-4 h-4 text-cyan-500" />
          </div>
          <p className="text-base font-bold mt-1 text-cyan-600 dark:text-cyan-400">English & ગુજરાતી</p>
          <span className={`text-[11px] ${textMuted}`}>100% Bilingual coverage</span>
        </div>
      </div>

      {/* Alert banner */}
      {feedback && (
        <div className={`p-4 rounded-xl border flex items-center justify-between transition-all ${
          feedback.success 
            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400' 
            : 'bg-rose-500/10 border-rose-500/30 text-rose-500'
        }`}>
          <div className="flex items-center space-x-2 text-xs sm:text-sm font-medium">
            {feedback.success ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
            <span>{feedback.message}</span>
          </div>
          <button onClick={() => setFeedback(null)} className="text-xs underline hover:opacity-80">
            Dismiss
          </button>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className={`p-4 rounded-2xl border flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between ${cardBg}`}>
        <div className="relative flex-1">
          <Search className={`w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 ${textMuted}`}/>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search FAQs in English or ગુજરાતી..."
            className={`w-full pl-9 pr-4 py-2 rounded-xl text-xs sm:text-sm border transition-colors outline-none ${inputBg}`}
          />
        </div>

        <div className="flex items-center space-x-1.5 shrink-0 bg-slate-100 dark:bg-slate-950 p-1 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-semibold">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              statusFilter === 'all'
                ? 'bg-cyan-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            All ({faqs.length})
          </button>
          <button
            onClick={() => setStatusFilter('active')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              statusFilter === 'active'
                ? 'bg-cyan-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Active ({activeCount})
          </button>
          <button
            onClick={() => setStatusFilter('inactive')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              statusFilter === 'inactive'
                ? 'bg-cyan-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Hidden ({inactiveCount})
          </button>
        </div>
      </div>

      {/* FAQs List */}
      <div className="space-y-3">
        {loading ? (
          <div className={`p-12 text-center rounded-2xl border ${cardBg}`}>
            <RefreshCw className="w-6 h-6 animate-spin mx-auto text-cyan-500 mb-2" />
            <p className={`text-sm ${textMuted}`}>Loading FAQs...</p>
          </div>
        ) : filteredFaqs.length === 0 ? (
          <div className={`p-12 text-center rounded-2xl border ${cardBg}`}>
            <FileQuestion className="w-10 h-10 mx-auto text-slate-400 mb-3 opacity-60" />
            <h3 className="font-bold text-base">No FAQs found</h3>
            <p className={`text-xs sm:text-sm mt-1 max-w-md mx-auto ${textMuted}`}>
              {searchTerm 
                ? `No FAQs matched your search "${searchTerm}". Try searching something else or clear the filter.` 
                : 'No FAQs have been added yet. Click "Add New FAQ" to create your first entry.'}
            </p>
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="mt-3 text-xs font-semibold text-cyan-600 dark:text-cyan-400 hover:underline"
              >
                Clear search filter
              </button>
            )}
          </div>
        ) : (
          filteredFaqs.map((faq) => {
            const isExpanded = expandedId === faq.id;
            return (
              <div 
                key={faq.id} 
                className={`rounded-2xl border transition-all duration-200 overflow-hidden ${cardBg} ${
                  !faq.is_active ? 'opacity-75' : ''
                }`}
              >
                {/* Header Row */}
                <div className="p-4 sm:p-5 flex items-start justify-between gap-3">
                  <div className="flex items-start space-x-3 flex-1 min-w-0">
                    {/* Order Badge */}
                    <div className={`px-2.5 py-1 rounded-lg text-xs font-bold shrink-0 flex items-center space-x-0.5 ${
                      faq.is_active
                        ? 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20'
                        : 'bg-slate-200 dark:bg-slate-800 text-slate-500'
                    }`}>
                      <Hash className="w-3 h-3" />
                      <span>{faq.order_index}</span>
                    </div>

                    <div className="flex-1 min-w-0">
                      {/* Questions */}
                      <h3 className="font-bold text-sm sm:text-base tracking-tight leading-snug">
                        {faq.question_en}
                      </h3>
                      <p className="text-xs sm:text-sm text-cyan-700 dark:text-cyan-400 font-medium mt-0.5">
                        {faq.question_gu}
                      </p>

                      {/* Active Status Badge for Mobile */}
                      <div className="flex items-center space-x-2 mt-2 sm:hidden">
                        <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${
                          faq.is_active
                            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                            : 'bg-slate-200 dark:bg-slate-800 text-slate-500'
                        }`}>
                          {faq.is_active ? 'Active' : 'Hidden'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right Actions */}
                  <div className="flex items-center space-x-1 sm:space-x-2 shrink-0">
                    {/* Status Toggle Switch */}
                    <button
                      onClick={() => handleToggleStatus(faq)}
                      className={`hidden sm:flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all ${
                        faq.is_active
                          ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20'
                          : 'bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-500 hover:bg-slate-200'
                      }`}
                      title={faq.is_active ? 'Click to hide in app' : 'Click to show in app'}
                    >
                      {faq.is_active ? (
                        <>
                          <Eye className="w-3.5 h-3.5" />
                          <span>Active</span>
                        </>
                      ) : (
                        <>
                          <EyeOff className="w-3.5 h-3.5" />
                          <span>Hidden</span>
                        </>
                      )}
                    </button>

                    {/* Edit Button */}
                    <button
                      onClick={() => handleOpenEditModal(faq)}
                      className={`p-2 rounded-xl border transition-colors ${
                        isDark 
                          ? 'border-slate-800 text-slate-300 hover:bg-slate-800 hover:text-cyan-400' 
                          : 'border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-cyan-600'
                      }`}
                      title="Edit FAQ"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>

                    {/* Delete Button */}
                    <button
                      onClick={() => setDeleteConfirmId(faq.id)}
                      className="p-2 rounded-xl border border-rose-500/20 text-rose-500 hover:bg-rose-500/10 transition-colors"
                      title="Delete FAQ"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>

                    {/* Expand/Collapse Chevron */}
                    <button
                      onClick={() => setExpandedId(isExpanded ? null : faq.id)}
                      className={`p-2 rounded-xl border transition-colors ${
                        isDark ? 'border-slate-800 hover:bg-slate-800' : 'border-slate-200 hover:bg-slate-100'
                      }`}
                      title={isExpanded ? 'Collapse' : 'Expand Answer'}
                    >
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Expanded Answer Content */}
                {isExpanded && (
                  <div className={`p-4 sm:p-5 border-t space-y-4 ${
                    isDark ? 'border-slate-800/80 bg-slate-950/40' : 'border-slate-100 bg-slate-50/80'
                  }`}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* English Answer */}
                      <div className={`p-3.5 rounded-xl border ${
                        isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
                      }`}>
                        <div className="flex items-center space-x-1.5 mb-1.5 text-xs font-bold text-cyan-600 dark:text-cyan-400">
                          <span className="uppercase tracking-wider text-[10px] px-1.5 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/20">EN</span>
                          <span>English Answer</span>
                        </div>
                        <p className="text-xs sm:text-sm whitespace-pre-wrap leading-relaxed">
                          {faq.answer_en}
                        </p>
                      </div>

                      {/* Gujarati Answer */}
                      <div className={`p-3.5 rounded-xl border ${
                        isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
                      }`}>
                        <div className="flex items-center space-x-1.5 mb-1.5 text-xs font-bold text-cyan-600 dark:text-cyan-400">
                          <span className="uppercase tracking-wider text-[10px] px-1.5 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/20">GU</span>
                          <span>ગુજરાતી જવાબ (Gujarati)</span>
                        </div>
                        <p className="text-xs sm:text-sm whitespace-pre-wrap leading-relaxed text-slate-700 dark:text-slate-300">
                          {faq.answer_gu}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                      <span>Created: {new Date(faq.created_at).toLocaleDateString('en-IN', { dateStyle: 'medium' })}</span>
                      <button 
                        onClick={() => handleToggleStatus(faq)}
                        className="sm:hidden text-cyan-600 dark:text-cyan-400 font-semibold"
                      >
                        {faq.is_active ? 'Tap to Hide' : 'Tap to Activate'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Add / Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
            onClick={() => !submitting && setModalOpen(false)}
          />

          <div className={`relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl p-6 sm:p-8 shadow-2xl border z-10 ${
            isDark ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
          }`}>
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
              <div>
                <h2 className="text-lg sm:text-xl font-bold">
                  {editingFaq ? `Edit FAQ #${editingFaq.order_index}` : 'Add New FAQ'}
                </h2>
                <p className={`text-xs mt-0.5 ${textMuted}`}>
                  Enter content in both English and Gujarati for diamond artisans.
                </p>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                disabled={submitting}
                className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveFaq} className="space-y-4 pt-4">
              {/* Question EN */}
              <div>
                <label className="block text-xs font-semibold mb-1 text-slate-700 dark:text-slate-300">
                  Question (English) *
                </label>
                <input
                  type="text"
                  required
                  value={questionEn}
                  onChange={(e) => setQuestionEn(e.target.value)}
                  placeholder="e.g. How do I add my daily work?"
                  className={`w-full px-3.5 py-2.5 rounded-xl text-xs sm:text-sm border outline-none ${inputBg}`}
                />
              </div>

              {/* Question GU */}
              <div>
                <label className="block text-xs font-semibold mb-1 text-slate-700 dark:text-slate-300">
                  Question (ગુજરાતી / Gujarati) *
                </label>
                <input
                  type="text"
                  required
                  value={questionGu}
                  onChange={(e) => setQuestionGu(e.target.value)}
                  placeholder="દા.ત. હું મારું દૈનિક કામ કેવી રીતે ઉમેરું?"
                  className={`w-full px-3.5 py-2.5 rounded-xl text-xs sm:text-sm border outline-none ${inputBg}`}
                />
              </div>

              {/* Answer EN */}
              <div>
                <label className="block text-xs font-semibold mb-1 text-slate-700 dark:text-slate-300">
                  Answer (English) *
                </label>
                <textarea
                  rows={3}
                  required
                  value={answerEn}
                  onChange={(e) => setAnswerEn(e.target.value)}
                  placeholder="Detailed answer in English explaining the steps..."
                  className={`w-full px-3.5 py-2.5 rounded-xl text-xs sm:text-sm border outline-none resize-none ${inputBg}`}
                />
              </div>

              {/* Answer GU */}
              <div>
                <label className="block text-xs font-semibold mb-1 text-slate-700 dark:text-slate-300">
                  Answer (ગુજરાતી / Gujarati) *
                </label>
                <textarea
                  rows={3}
                  required
                  value={answerGu}
                  onChange={(e) => setAnswerGu(e.target.value)}
                  placeholder="વિગતવાર ગુજરાતીમાં સમજૂતી..."
                  className={`w-full px-3.5 py-2.5 rounded-xl text-xs sm:text-sm border outline-none resize-none ${inputBg}`}
                />
              </div>

              {/* Order & Active Status */}
              <div className="grid grid-cols-2 gap-4 pt-1">
                <div>
                  <label className="block text-xs font-semibold mb-1 text-slate-700 dark:text-slate-300">
                    Display Order Index
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={orderIndex}
                    onChange={(e) => setOrderIndex(e.target.value)}
                    className={`w-full px-3.5 py-2 rounded-xl text-xs sm:text-sm border outline-none ${inputBg}`}
                  />
                  <p className={`text-[11px] mt-1 ${textMuted}`}>Lower number appears first</p>
                </div>

                <div>
                  <label className="block text-xs font-semibold mb-1 text-slate-700 dark:text-slate-300">
                    App Visibility
                  </label>
                  <label className="flex items-center space-x-2 mt-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isActive}
                      onChange={(e) => setIsActive(e.target.checked)}
                      className="w-4 h-4 rounded text-cyan-600 focus:ring-cyan-500 border-slate-300 dark:border-slate-700"
                    />
                    <span className="text-xs font-medium">Visible in Artisan App</span>
                  </label>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  disabled={submitting}
                  className={`px-4 py-2.5 rounded-xl text-xs font-medium border ${
                    isDark ? 'border-slate-800 hover:bg-slate-800 text-slate-300' : 'border-slate-200 hover:bg-slate-100 text-slate-700'
                  }`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex items-center space-x-2 px-5 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white font-medium text-xs sm:text-sm rounded-xl shadow-lg shadow-cyan-600/25 transition-all active:scale-[0.98] disabled:opacity-50"
                >
                  {submitting && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  <span>{editingFaq ? 'Save Changes' : 'Create FAQ'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setDeleteConfirmId(null)}
          />
          <div className={`relative w-full max-w-md rounded-3xl p-6 shadow-2xl border z-10 text-center ${
            isDark ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
          }`}>
            <div className="w-12 h-12 rounded-full bg-rose-500/10 text-rose-500 border border-rose-500/20 flex items-center justify-center mx-auto mb-3">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold">Delete this FAQ?</h3>
            <p className="text-xs mt-1 text-slate-500">
              Are you sure you want to remove this FAQ? Diamond artisans will no longer see it in the mobile app.
            </p>
            <div className="flex items-center justify-center space-x-3 mt-6">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className={`px-4 py-2.5 rounded-xl text-xs font-medium border ${
                  isDark ? 'border-slate-800 hover:bg-slate-800 text-slate-300' : 'border-slate-200 hover:bg-slate-100 text-slate-700'
                }`}
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteFaq(deleteConfirmId)}
                className="px-4 py-2.5 rounded-xl text-xs font-medium bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-600/20"
              >
                Yes, Delete FAQ
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Faqs;
