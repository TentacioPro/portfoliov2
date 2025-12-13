import { useState } from 'react';
import { motion } from 'framer-motion';
import { FileText, Download, Loader2, CheckCircle, ArrowLeft, Eye, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { generateResume, downloadBlob } from '../api/client';
import ThemeToggle from './ThemeToggle';
import SmoothScroll from './SmoothScroll';

export default function ResumeBuilder() {
  const [formData, setFormData] = useState({
    name: '',
    title: '',
    summary: '',
    skills: '',
  });

  const [isGenerating, setIsGenerating] = useState(false);
  const [pdfUrl, setPdfUrl] = useState(null);
  const [error, setError] = useState(null);
  const [showPreview, setShowPreview] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleGenerate = async () => {
    setError(null);
    
    // Basic validation
    if (!formData.name || !formData.title || !formData.summary) {
      setError('Please fill in all required fields (Name, Title, Summary)');
      return;
    }

    setIsGenerating(true);

    try {
      // Convert comma-separated skills to array
      const skillsArray = formData.skills
        .split(',')
        .map(s => s.trim())
        .filter(s => s.length > 0);

      const blob = await generateResume({
        name: formData.name,
        title: formData.title,
        summary: formData.summary,
        skills: skillsArray,
      });

      // Revoke old URL if exists
      if (pdfUrl) {
        URL.revokeObjectURL(pdfUrl);
      }

      // Create new blob URL
      const url = URL.createObjectURL(blob);
      setPdfUrl(url);
      setShowPreview(true); // Auto-show preview on mobile

    } catch (err) {
      setError(err.message || 'Failed to generate PDF');
      console.error('[ResumeBuilder] Error:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = () => {
    if (pdfUrl) {
      const link = document.createElement('a');
      link.href = pdfUrl;
      link.download = `${formData.name.replace(/\s+/g, '_')}_Resume.pdf`;
      link.click();
    }
  };

  return (
    <SmoothScroll>
      <div className="min-h-screen bg-swiss-bg dark:bg-[#0c0c0c] text-swiss-text dark:text-[#ededed] transition-colors duration-300">
        {/* Noise Overlay */}
        <div className="fixed inset-0 bg-noise opacity-[0.03] pointer-events-none z-50 mix-blend-multiply dark:mix-blend-screen" />
        
        {/* Header with Navigation and Theme Toggle */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-6 lg:px-12 pt-6 md:pt-8 pb-4">
          <div className="flex items-center justify-between mb-6 md:mb-8">
            <Link 
              to="/"
              className="flex items-center gap-2 text-sm md:text-base text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white transition-colors"
            >
              <ArrowLeft size={20} />
              <span className="hidden sm:inline">Back to Portfolio</span>
              <span className="sm:hidden">Back</span>
            </Link>
            <ThemeToggle />
          </div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-6 lg:px-12 pb-8 md:pb-12">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 md:mb-12"
          >
            <div className="flex items-center gap-3 mb-4">
              <FileText className="w-7 h-7 md:w-8 md:h-8 text-indigo-500 dark:text-indigo-400" />
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-stone-900 dark:text-white">Resume Generator</h1>
            </div>
            <p className="text-base md:text-lg text-stone-500 dark:text-stone-400">
              Generate a professionally formatted PDF resume using our LaTeX engine.
            </p>
          </motion.div>

          {/* Two Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
            
            {/* Left: Input Form */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-stone-100 dark:bg-zinc-900 border border-stone-200 dark:border-zinc-800 rounded-xl p-8"
            >
              <h2 className="text-xl md:text-2xl font-semibold mb-6 text-stone-900 dark:text-white">Your Information</h2>
              
              <div className="space-y-6">
                {/* Name */}
                <div>
                  <label className="block text-sm font-medium mb-2 text-stone-700 dark:text-stone-300">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="John Doe"
                    className="w-full px-3 py-2 md:px-4 md:py-3 text-sm md:text-base bg-white dark:bg-zinc-800 border border-stone-300 dark:border-zinc-700 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent outline-none transition text-stone-900 dark:text-white placeholder:text-stone-400 dark:placeholder:text-zinc-500"
                  />
                </div>

                {/* Title */}
                <div>
                  <label className="block text-sm font-medium mb-2 text-stone-700 dark:text-stone-300">
                    Professional Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="Software Engineer"
                    className="w-full px-3 py-2 md:px-4 md:py-3 text-sm md:text-base bg-white dark:bg-zinc-800 border border-stone-300 dark:border-zinc-700 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent outline-none transition text-stone-900 dark:text-white placeholder:text-stone-400 dark:placeholder:text-zinc-500"
                  />
                </div>

                {/* Summary */}
                <div>
                  <label className="block text-sm font-medium mb-2 text-stone-700 dark:text-stone-300">
                    Professional Summary <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    name="summary"
                    value={formData.summary}
                    onChange={handleChange}
                    placeholder="Experienced developer with expertise in..."
                    rows={5}
                    className="w-full px-3 py-2 md:px-4 md:py-3 text-sm md:text-base bg-white dark:bg-zinc-800 border border-stone-300 dark:border-zinc-700 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent outline-none transition resize-none text-stone-900 dark:text-white placeholder:text-stone-400 dark:placeholder:text-zinc-500"
                  />
                </div>

                {/* Skills */}
                <div>
                  <label className="block text-sm font-medium mb-2 text-stone-700 dark:text-stone-300">
                    Skills (comma-separated)
                  </label>
                  <input
                    type="text"
                    name="skills"
                    value={formData.skills}
                    onChange={handleChange}
                    placeholder="React, Node.js, Docker, MongoDB"
                    className="w-full px-3 py-2 md:px-4 md:py-3 text-sm md:text-base bg-white dark:bg-zinc-800 border border-stone-300 dark:border-zinc-700 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent outline-none transition text-stone-900 dark:text-white placeholder:text-stone-400 dark:placeholder:text-zinc-500"
                  />
                </div>

                {/* Error Display */}
                {error && (
                  <div className="p-4 bg-red-100 dark:bg-red-900/20 border border-red-300 dark:border-red-800 rounded-lg text-red-800 dark:text-red-400 text-sm">
                    {error}
                  </div>
                )}

                {/* Generate Button */}
                <button
                  onClick={handleGenerate}
                  disabled={isGenerating}
                  className="w-full py-2.5 md:py-3 text-sm md:text-base bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 dark:bg-indigo-500 dark:hover:bg-indigo-600 dark:disabled:bg-indigo-900 text-white font-medium rounded-lg transition flex items-center justify-center gap-2"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Generating Artifact...
                    </>
                  ) : (
                    <>
                      <FileText className="w-5 h-5" />
                      Generate PDF
                    </>
                  )}
                </button>
              </div>
            </motion.div>

            {/* Right: Preview/Status Area */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className={`${showPreview && pdfUrl ? 'fixed inset-0 z-50 lg:relative' : 'hidden lg:block'} bg-stone-100 dark:bg-zinc-900 border border-stone-200 dark:border-zinc-800 rounded-xl p-5 md:p-8`}
            >
              {/* Mobile Preview Header */}
              {showPreview && pdfUrl && (
                <div className="lg:hidden flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-stone-900 dark:text-white">Preview</h2>
                  <button
                    onClick={() => setShowPreview(false)}
                    className="p-2 hover:bg-stone-200 dark:hover:bg-zinc-800 rounded-lg transition-colors"
                  >
                    <X size={20} className="text-stone-600 dark:text-stone-400" />
                  </button>
                </div>
              )}
              
              <h2 className="text-xl md:text-2xl font-semibold mb-6 text-stone-900 dark:text-white hidden lg:block">Preview</h2>

              {!pdfUrl && !isGenerating && (
                <div className="h-[400px] md:h-[600px] flex items-center justify-center border-2 border-dashed border-stone-300 dark:border-zinc-700 rounded-lg">
                  <div className="text-center px-4">
                    <FileText className="w-12 h-12 md:w-16 md:h-16 mx-auto mb-4 text-stone-400 dark:text-zinc-500" />
                    <p className="text-sm md:text-base text-stone-500 dark:text-stone-400">
                      Fill in the form and click "Generate PDF" to see your resume.
                    </p>
                  </div>
                </div>
              )}

              {isGenerating && (
                <div className="h-[400px] md:h-[600px] flex items-center justify-center">
                  <div className="text-center">
                    <Loader2 className="w-10 h-10 md:w-12 md:h-12 mx-auto mb-4 text-indigo-500 dark:text-indigo-400 animate-spin" />
                    <p className="text-base md:text-lg font-medium text-stone-900 dark:text-white">Compiling LaTeX...</p>
                    <p className="text-xs md:text-sm text-stone-500 dark:text-stone-400 mt-2">
                      This may take a few seconds
                    </p>
                  </div>
                </div>
              )}

              {pdfUrl && !isGenerating && (
                <div className="space-y-4">
                  {/* Mobile: View Preview Button */}
                  <button
                    onClick={() => setShowPreview(true)}
                    className="lg:hidden w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition flex items-center justify-center gap-2"
                  >
                    <Eye className="w-5 h-5" />
                    View Preview
                  </button>

                  {/* Success Message */}
                  <div className="flex items-center gap-2 p-4 bg-green-100 dark:bg-green-900/20 border border-green-300 dark:border-green-800 rounded-lg text-green-800 dark:text-green-400">
                    <CheckCircle className="w-5 h-5" />
                    <span className="font-medium">PDF Generated Successfully!</span>
                  </div>

                  {/* Download Button */}
                  <button
                    onClick={handleDownload}
                    className="w-full py-2.5 md:py-3 text-sm md:text-base bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600 text-white font-medium rounded-lg transition flex items-center justify-center gap-2"
                  >
                    <Download className="w-5 h-5" />
                    Download PDF
                  </button>

                  {/* PDF Preview */}
                  <div className="border-2 border-stone-300 dark:border-zinc-700 rounded-lg overflow-hidden">
                    <iframe
                      src={pdfUrl}
                      className="w-full h-[calc(100vh-16rem)] md:h-[500px] bg-white"
                      title="Resume Preview"
                    />
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </SmoothScroll>
  );
}
