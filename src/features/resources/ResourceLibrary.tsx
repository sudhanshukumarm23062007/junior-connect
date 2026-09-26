import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { StudyResource } from '../../types';
import { resourceRepository } from '../../services/dataService';
import { 
  FileText, 
  Download, 
  UploadCloud, 
  Search, 
  Filter, 
  BookOpen, 
  GraduationCap, 
  CheckCircle2, 
  Sparkles,
  ExternalLink,
  X
} from 'lucide-react';
import { RESOURCE_CATEGORIES, COLLEGES, DEPARTMENTS, COURSES } from '../../core/constants';
import confetti from 'canvas-confetti';

interface ResourceLibraryProps {
  onRequireAuth?: () => void;
}

export const ResourceLibrary: React.FC<ResourceLibraryProps> = ({ onRequireAuth }) => {
  const { profile } = useAuth();
  const [resources, setResources] = useState<StudyResource[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Upload modal
  const [isUploading, setIsUploading] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState(RESOURCE_CATEGORIES[1]);
  const [fileType, setFileType] = useState('pdf');
  const [fileSize, setFileSize] = useState('3.8 MB');
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const unsub = resourceRepository.subscribeToResources((resList) => {
      setResources(resList);
    }, selectedCategory);
    return () => unsub();
  }, [selectedCategory]);

  const handleDownload = async (res: StudyResource) => {
    await resourceRepository.incrementDownload(res.id);
    window.open(res.fileUrl, '_blank');
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) {
      onRequireAuth?.();
      return;
    }

    setUploading(true);
    try {
      await resourceRepository.addResource({
        title,
        description,
        category,
        fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
        fileType,
        fileSize,
        uploadedBy: profile.id,
        uploaderName: profile.name,
        college: profile.college,
        course: profile.course,
        department: profile.department,
        year: profile.year
      });

      setTitle('');
      setDescription('');
      setIsUploading(false);
      confetti({ particleCount: 60, spread: 70 });
    } catch (err: any) {
      alert(err.message || 'Failed to upload resource');
    } finally {
      setUploading(false);
    }
  };

  const filtered = resources.filter((r) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      r.title.toLowerCase().includes(q) ||
      r.description.toLowerCase().includes(q) ||
      r.college.toLowerCase().includes(q) ||
      r.uploaderName.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="max-w-xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-purple-300 text-xs font-semibold mb-3 border border-white/10">
            <BookOpen className="w-3.5 h-3.5" />
            University Academic Vault
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Curated Study Notes & Placement Guides
          </h1>
          <p className="text-purple-100 text-xs sm:text-sm mt-2 leading-relaxed">
            Free high-yield handouts, previous year question papers (PYQs), interview roadmaps, and cheat sheets shared by university seniors.
          </p>
        </div>

        <button
          onClick={() => {
            if (!profile) {
              onRequireAuth?.();
              return;
            }
            setIsUploading(true);
          }}
          className="px-6 py-3 bg-white text-indigo-900 hover:bg-purple-50 font-bold rounded-2xl text-xs shadow-lg transition flex items-center justify-center gap-2 shrink-0"
        >
          <UploadCloud className="w-4 h-4 text-indigo-600" /> Share Resources
        </button>
      </div>

      {/* Search & Category Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search notes, PYQs, courses, or subjects..."
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-2xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-xs"
          />
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
          {RESOURCE_CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                selectedCategory === cat
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Resources */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 text-slate-400 space-y-2">
          <FileText className="w-10 h-10 mx-auto text-slate-300" />
          <p className="text-sm font-semibold text-slate-700">No resources found</p>
          <p className="text-xs text-slate-400">Be the first to upload helpful materials for this category!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((res) => (
            <div
              key={res.id}
              className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition flex flex-col justify-between group"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <span className="px-2.5 py-1 bg-purple-50 text-purple-700 rounded-lg text-[10px] font-bold">
                    {res.category}
                  </span>
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">
                    {res.fileType} • {res.fileSize || '3 MB'}
                  </span>
                </div>

                <h3 className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition line-clamp-2">
                  {res.title}
                </h3>

                <p className="text-xs text-slate-500 line-clamp-3 leading-relaxed">
                  {res.description}
                </p>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                  <div className="truncate max-w-[160px] font-medium text-slate-600">
                    By {res.uploaderName}
                  </div>
                  <div className="truncate max-w-[120px]">
                    {res.college}
                  </div>
                </div>
              </div>

              <div className="pt-4 flex items-center justify-between">
                <div className="text-[11px] font-medium text-slate-500">
                  <span className="font-bold text-slate-700">{res.downloads || 0}</span> downloads
                </div>

                <button
                  type="button"
                  onClick={() => handleDownload(res)}
                  className="px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl text-xs font-bold transition flex items-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" /> Download PDF
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload Resource Modal */}
      {isUploading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full border border-slate-100 shadow-2xl relative">
            <button
              onClick={() => setIsUploading(false)}
              className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-700"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-4">
              <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl">
                <UploadCloud className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Upload Academic Material</h3>
                <p className="text-xs text-slate-500">Help juniors with vetted notes and interview prep</p>
              </div>
            </div>

            <form onSubmit={handleUploadSubmit} className="space-y-4">
              <div>
                <label className="flex items-center justify-between text-xs font-semibold text-slate-700 mb-1">
                  <span>Resource Title <span className="text-rose-500 font-bold">*</span></span>
                  <span className="text-[10px] text-rose-500 font-semibold bg-rose-50 px-1.5 py-0.5 rounded border border-rose-100">Mandatory</span>
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Operating Systems Concurrency & Deadlocks Notes"
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
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {RESOURCE_CATEGORIES.filter(c => c !== 'All').map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="flex items-center justify-between text-xs font-semibold text-slate-700 mb-1">
                  <span>Description / Chapters Covered <span className="text-rose-500 font-bold">*</span></span>
                  <span className="text-[10px] text-rose-500 font-semibold bg-rose-50 px-1.5 py-0.5 rounded border border-rose-100">Mandatory</span>
                </label>
                <textarea
                  rows={3}
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Briefly describe what this handout contains, key formulas, exam tips..."
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="p-4 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50 text-center space-y-1">
                <FileText className="w-8 h-8 text-indigo-600 mx-auto" />
                <div className="text-xs font-semibold text-slate-700">Attach Document (PDF, PPT, DOCX)</div>
                <div className="text-[10px] text-slate-400">Maximum file size: 15 MB. Vetted for security.</div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsUploading(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-xs text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploading}
                  className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-md shadow-indigo-500/20 disabled:opacity-50"
                >
                  {uploading ? 'Uploading...' : 'Publish to Library'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
