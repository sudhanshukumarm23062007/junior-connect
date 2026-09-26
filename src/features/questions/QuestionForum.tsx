import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Question, QuestionAnswer } from '../../types';
import { questionRepository, reportRepository } from '../../services/dataService';
import { 
  HelpCircle, 
  MessageSquare, 
  ThumbsUp, 
  CheckCircle2, 
  Plus, 
  Tag, 
  Clock, 
  GraduationCap, 
  Send,
  Flag,
  ChevronDown,
  X
} from 'lucide-react';
import { QUESTION_CATEGORIES } from '../../core/constants';
import { format } from 'date-fns';
import confetti from 'canvas-confetti';

interface QuestionForumProps {
  onRequireAuth?: () => void;
}

export const QuestionForum: React.FC<QuestionForumProps> = ({ onRequireAuth }) => {
  const { profile } = useAuth();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null);
  const [answers, setAnswers] = useState<QuestionAnswer[]>([]);
  
  // Post question modal
  const [isAsking, setIsAsking] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState(QUESTION_CATEGORIES[1]);
  const [tagInput, setTagInput] = useState('');
  const [submittingQuestion, setSubmittingQuestion] = useState(false);

  // New Answer
  const [newAnswerText, setNewAnswerText] = useState('');
  const [submittingAnswer, setSubmittingAnswer] = useState(false);

  // 1. Subscribe to questions
  useEffect(() => {
    const unsub = questionRepository.subscribeToQuestions((qList) => {
      setQuestions(qList);
      if (selectedQuestion) {
        const updated = qList.find(q => q.id === selectedQuestion.id);
        if (updated) setSelectedQuestion(updated);
      }
    }, selectedCategory);
    return () => unsub();
  }, [selectedCategory]);

  // 2. Subscribe to answers of selected question
  useEffect(() => {
    if (!selectedQuestion) {
      setAnswers([]);
      return;
    }
    const unsub = questionRepository.subscribeToAnswers(selectedQuestion.id, (ansList) => {
      setAnswers(ansList);
    });
    return () => unsub();
  }, [selectedQuestion?.id]);

  const handleAskQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) {
      onRequireAuth?.();
      return;
    }

    setSubmittingQuestion(true);
    try {
      const tags = tagInput.split(',').map(t => t.trim()).filter(Boolean);
      await questionRepository.createQuestion({
        authorId: profile.id,
        authorName: profile.name,
        authorRole: profile.role,
        authorAvatar: profile.avatarUrl,
        authorCollege: profile.college,
        title,
        description,
        category,
        tags: tags.length > 0 ? tags : [category]
      });

      setTitle('');
      setDescription('');
      setTagInput('');
      setIsAsking(false);
      confetti({ particleCount: 50, spread: 60 });
    } catch (err: any) {
      alert(err.message || 'Failed to post question');
    } finally {
      setSubmittingQuestion(false);
    }
  };

  const handlePostAnswer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile || !selectedQuestion) {
      onRequireAuth?.();
      return;
    }
    if (!newAnswerText.trim()) return;

    setSubmittingAnswer(true);
    try {
      await questionRepository.addAnswer(selectedQuestion.id, {
        questionId: selectedQuestion.id,
        authorId: profile.id,
        authorName: profile.name,
        authorRole: profile.role,
        authorAvatar: profile.avatarUrl,
        content: newAnswerText.trim()
      });
      setNewAnswerText('');
      confetti({ particleCount: 40, spread: 50 });
    } catch (err: any) {
      alert(err.message || 'Failed to submit answer');
    } finally {
      setSubmittingAnswer(false);
    }
  };

  const handleToggleVoteQuestion = async (q: Question) => {
    if (!profile) {
      onRequireAuth?.();
      return;
    }
    const currentlyUpvoted = q.upvotedBy?.includes(profile.id) || false;
    await questionRepository.toggleUpvoteQuestion(q.id, profile.id, currentlyUpvoted);
  };

  const handleToggleVoteAnswer = async (ans: QuestionAnswer) => {
    if (!profile || !selectedQuestion) {
      onRequireAuth?.();
      return;
    }
    const currentlyUpvoted = ans.upvotedBy?.includes(profile.id) || false;
    await questionRepository.toggleUpvoteAnswer(selectedQuestion.id, ans.id, profile.id, currentlyUpvoted);
  };

  const handleAcceptAnswer = async (ansId: string) => {
    if (!profile || !selectedQuestion) return;
    if (selectedQuestion.authorId !== profile.id) return;
    await questionRepository.acceptAnswer(selectedQuestion.id, ansId);
    confetti({ particleCount: 70, spread: 70 });
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Campus Q&A Forum</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100">
              {questions.length} Questions
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Ask doubts regarding coursework, campus placements, internships, code debugging, and university life.
          </p>
        </div>

        <button
          onClick={() => {
            if (!profile) {
              onRequireAuth?.();
              return;
            }
            setIsAsking(true);
          }}
          className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl text-xs font-semibold shadow-md shadow-indigo-500/20 flex items-center justify-center gap-2 transition shrink-0"
        >
          <Plus className="w-4 h-4" /> Ask a Question
        </button>
      </div>

      {/* Category Pills Bar */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
        {QUESTION_CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
              selectedCategory === cat
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Main Forum Split View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Questions List */}
        <div className={`${selectedQuestion ? 'lg:col-span-5' : 'lg:col-span-12'} space-y-3`}>
          {questions.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 text-slate-400 space-y-2">
              <HelpCircle className="w-10 h-10 mx-auto text-slate-300" />
              <p className="text-sm font-semibold text-slate-700">No questions in this category yet</p>
              <p className="text-xs text-slate-400">Be the first student to ask!</p>
            </div>
          ) : (
            questions.map((q) => {
              const isSelected = selectedQuestion?.id === q.id;
              const hasUpvoted = profile ? q.upvotedBy?.includes(profile.id) : false;

              return (
                <div
                  key={q.id}
                  onClick={() => setSelectedQuestion(q)}
                  className={`bg-white rounded-2xl p-4 sm:p-5 border cursor-pointer transition ${
                    isSelected
                      ? 'border-indigo-600 shadow-md ring-2 ring-indigo-100'
                      : 'border-slate-200 hover:border-slate-300 shadow-xs'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {/* Vote button */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleVoteQuestion(q);
                      }}
                      className={`flex flex-col items-center justify-center p-2 rounded-xl transition ${
                        hasUpvoted
                          ? 'bg-indigo-600 text-white'
                          : 'bg-slate-50 text-slate-500 hover:bg-slate-100'
                      }`}
                    >
                      <ThumbsUp className="w-3.5 h-3.5" />
                      <span className="text-[11px] font-bold mt-0.5">{q.upvotes || 0}</span>
                    </button>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded-md text-[10px] font-bold">
                          {q.category}
                        </span>
                        {q.hasAcceptedAnswer && (
                          <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-md text-[10px] font-bold flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" /> Solved
                          </span>
                        )}
                        <span className="text-[10px] text-slate-400 ml-auto">
                          {format(q.createdAt, 'MMM d')}
                        </span>
                      </div>

                      <h3 className="text-sm font-bold text-slate-900 hover:text-indigo-600 transition line-clamp-2">
                        {q.title}
                      </h3>

                      <p className="text-xs text-slate-500 line-clamp-2 mt-1">
                        {q.description}
                      </p>

                      <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-100">
                        <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                          <span className="font-semibold text-slate-700">{q.authorName}</span>
                          <span className="text-[10px] text-slate-400">({q.authorRole})</span>
                        </div>

                        <div className="flex items-center gap-1 text-[11px] text-indigo-600 font-semibold">
                          <MessageSquare className="w-3.5 h-3.5" />
                          <span>{q.answerCount || 0} answers</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Selected Question Detail & Answers */}
        {selectedQuestion && (
          <div className="lg:col-span-7 bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-2.5 py-0.5 bg-indigo-50 text-indigo-700 rounded-lg text-xs font-bold">
                    {selectedQuestion.category}
                  </span>
                  <span className="text-xs text-slate-400">
                    Asked on {format(selectedQuestion.createdAt, 'PPp')}
                  </span>
                </div>
                <h2 className="text-lg font-bold text-slate-900 leading-snug">
                  {selectedQuestion.title}
                </h2>
              </div>
              <button
                onClick={() => setSelectedQuestion(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-xs text-slate-800 leading-relaxed whitespace-pre-wrap">
              {selectedQuestion.description}
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-1.5">
              {selectedQuestion.tags?.map((t) => (
                <span key={t} className="px-2.5 py-1 bg-slate-100 text-slate-600 rounded-lg text-[11px] font-medium flex items-center gap-1">
                  <Tag className="w-3 h-3 text-slate-400" />
                  {t}
                </span>
              ))}
            </div>

            {/* Answers List */}
            <div className="space-y-4 pt-4 border-t border-slate-200">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-indigo-600" />
                Answers ({answers.length})
              </h3>

              {answers.length === 0 ? (
                <div className="text-center py-6 text-xs text-slate-400">
                  No answers submitted yet. Be the first mentor or senior to post a solution!
                </div>
              ) : (
                answers.map((ans) => {
                  const hasUpvoted = profile ? ans.upvotedBy?.includes(profile.id) : false;
                  const isAuthor = profile?.id === selectedQuestion.authorId;

                  return (
                    <div
                      key={ans.id}
                      className={`p-4 rounded-2xl border transition ${
                        ans.isAccepted
                          ? 'border-emerald-500 bg-emerald-50/40 ring-1 ring-emerald-200'
                          : 'border-slate-200 bg-slate-50/50'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div className="flex items-center gap-2">
                          <img
                            src={ans.authorAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'}
                            alt={ans.authorName}
                            className="w-8 h-8 rounded-full object-cover bg-slate-200"
                          />
                          <div>
                            <div className="text-xs font-bold text-slate-900">{ans.authorName}</div>
                            <span className="text-[10px] text-indigo-600 font-semibold capitalize">
                              {ans.authorRole}
                            </span>
                          </div>
                        </div>

                        {ans.isAccepted && (
                          <div className="flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Accepted Answer
                          </div>
                        )}
                      </div>

                      <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-wrap">
                        {ans.content}
                      </p>

                      <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-200/60">
                        <button
                          type="button"
                          onClick={() => handleToggleVoteAnswer(ans)}
                          className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition ${
                            hasUpvoted
                              ? 'bg-indigo-600 text-white'
                              : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                          }`}
                        >
                          <ThumbsUp className="w-3 h-3" />
                          <span>{ans.upvotes || 0} Upvotes</span>
                        </button>

                        {isAuthor && !ans.isAccepted && (
                          <button
                            type="button"
                            onClick={() => handleAcceptAnswer(ans.id)}
                            className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" /> Mark as Accepted
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
              )}

              {/* Submit Answer Form */}
              <form onSubmit={handlePostAnswer} className="space-y-3 pt-4 border-t border-slate-200">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                  Your Answer or Solution
                </label>
                <textarea
                  rows={3}
                  required
                  value={newAnswerText}
                  onChange={(e) => setNewAnswerText(e.target.value)}
                  placeholder="Explain clearly, provide code snippets or link to study materials..."
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={submittingAnswer || !newAnswerText.trim()}
                    className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 shadow-sm disabled:opacity-50"
                  >
                    <Send className="w-3.5 h-3.5" /> Post Answer
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>

      {/* Ask Question Modal */}
      {isAsking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full border border-slate-100 shadow-2xl relative">
            <button
              onClick={() => setIsAsking(false)}
              className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-700"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-4">
              <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl">
                <HelpCircle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Ask the Campus Community</h3>
                <p className="text-xs text-slate-500">Seniors and classmates will help answer your doubt</p>
              </div>
            </div>

            <form onSubmit={handleAskQuestion} className="space-y-4">
              <div>
                <label className="flex items-center justify-between text-xs font-semibold text-slate-700 mb-1">
                  <span>Question Title / Summary <span className="text-rose-500 font-bold">*</span></span>
                  <span className="text-[10px] text-rose-500 font-semibold bg-rose-50 px-1.5 py-0.5 rounded border border-rose-100">Mandatory</span>
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. How to implement Topological Sort for LeetCode 207?"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="flex items-center justify-between text-xs font-semibold text-slate-700 mb-1">
                  <span>Category <span className="text-rose-500 font-bold">*</span></span>
                  <span className="text-[10px] text-rose-500 font-semibold bg-rose-50 px-1.5 py-0.5 rounded border border-rose-100">Mandatory</span>
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {QUESTION_CATEGORIES.filter(c => c !== 'All').map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="flex items-center justify-between text-xs font-semibold text-slate-700 mb-1">
                  <span>Details / Context / What did you try? <span className="text-rose-500 font-bold">*</span></span>
                  <span className="text-[10px] text-rose-500 font-semibold bg-rose-50 px-1.5 py-0.5 rounded border border-rose-100">Mandatory</span>
                </label>
                <textarea
                  rows={4}
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Provide all context, inputs, error logs, or specific confusion..."
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="flex items-center justify-between text-xs font-semibold text-slate-700 mb-1">
                  <span>Tags (comma separated) <span className="text-slate-400 font-normal lowercase">(optional)</span></span>
                  <span className="text-[10px] text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">Optional</span>
                </label>
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  placeholder="e.g. Graphs, BFS, C++, Algorithms"
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAsking(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-xs text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingQuestion}
                  className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-md shadow-indigo-500/20 disabled:opacity-50"
                >
                  {submittingQuestion ? 'Publishing...' : 'Publish Question'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
