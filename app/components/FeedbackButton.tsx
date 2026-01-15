import Link from "next/link";

export default function FeedbackButton() {
  // Substitua pelo SEU link do Google Forms
  const FORM_LINK = "https://forms.gle/ab143R6eyJ8N43r97"; 

  return (
    <Link
      href={FORM_LINK}
      target="_blank"
      className="fixed bottom-4 right-4 z-50 flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-full shadow-lg transition-all hover:scale-105 border border-blue-400/30 group"
    >
      <span className="text-xs font-bold">Feedback / Bug?</span>
      <div className="bg-white/20 p-1 rounded-full">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
        </svg>
      </div>
    </Link>
  );
}