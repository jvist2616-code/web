"use client";

import { useState, useEffect } from "react";
import { UserButton } from "@clerk/nextjs";
import { createClient } from "@supabase/supabase-js";
import { useAuth } from "@clerk/nextjs";
import { generatePost } from "./actions";

// Initialize Supabase
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface Post {
  id: string;
  created_at: string;
  original_prompt: string;
  linkedin_preview: string;
  video_script: string;
}

export default function Dashboard() {
  const { userId } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    if (userId) {
      fetchPosts();
    }
  }, [userId]);

  async function fetchPosts() {
    const { data, error } = await supabase
      .from("posts")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && data) {
      setPosts(data);
    }
    setLoading(false);
  }

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    setIsGenerating(true);
    const result = await generatePost(prompt);

    if (result.success) {
      setPrompt("");
      fetchPosts(); // Odśwież listę
    } else {
      alert(result.error);
    }
    setIsGenerating(false);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert("Skopiowano do schowka!");
  };

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white p-8 font-[family-name:var(--font-geist-sans)]">
      {/* Header */}
      <header className="max-w-6xl mx-auto flex justify-between items-start mb-12">
        <div>
          <h1 className="text-4xl font-bold tracking-tight mb-2 bg-gradient-to-r from-white to-gray-500 bg-clip-text text-transparent">
            Witaj w AI Command Center
          </h1>
          <p className="text-gray-400">Twoje treści są generowane i gotowe do publikacji.</p>
        </div>
        <div className="flex items-center gap-4">
          <UserButton appearance={{ elements: { userButtonAvatarBox: "w-10 h-10" } }} />
        </div>
      </header>

      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Generator Panel */}
        <div className="lg:col-span-2 space-y-8">
          <section className="bg-[#111111] border border-white/5 rounded-2xl p-6 shadow-2xl">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
              Nowe zadanie dla AI
            </h2>
            <form onSubmit={handleGenerate} className="space-y-4">
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="O czym chcesz dziś napisać? (np. 'Zalety pracy zdalnej w 2024')"
                className="w-full h-32 bg-black/50 border border-white/10 rounded-xl p-4 text-gray-200 placeholder:text-gray-600 focus:outline-none focus:border-emerald-500/50 transition-all resize-none"
              />
              <button
                disabled={isGenerating || !prompt.trim()}
                className="w-full bg-white text-black font-bold py-4 rounded-xl hover:bg-gray-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2"
              >
                {isGenerating ? (
                  <>
                    <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin"></div>
                    Generowanie...
                  </>
                ) : (
                  "Uruchom Gemini ✨"
                )}
              </button>
            </form>
          </section>

          {/* History Section */}
          <section>
            <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Historia postów
            </h2>

            {loading ? (
              <div className="text-gray-500 italic">Ładowanie historii...</div>
            ) : posts.length === 0 ? (
              <div className="bg-[#111111] border border-white/5 rounded-2xl p-12 text-center text-gray-500 border-dashed">
                Brak postów w historii. Wpisz temat powyżej i zacznij tworzyć!
              </div>
            ) : (
              <div className="space-y-6">
                {posts.map((post) => (
                  <div key={post.id} className="bg-[#111111] border border-white/5 rounded-2xl p-6 hover:border-white/10 transition-all group">
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-emerald-400 font-medium truncate max-w-md">
                        {post.original_prompt}
                      </h3>
                      <span className="text-xs text-gray-600">
                        {new Date(post.created_at).toLocaleDateString()}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <div className="flex justify-between items-center text-xs text-gray-500 mb-1">
                          <span>LinkedIn Post</span>
                          <button onClick={() => copyToClipboard(post.linkedin_preview)} className="hover:text-white transition-colors">Kopiuj</button>
                        </div>
                        <div className="bg-black/30 rounded-lg p-3 text-sm text-gray-300 line-clamp-4 h-24 overflow-hidden relative">
                          {post.linkedin_preview}
                          <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-[#111111] to-transparent"></div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between items-center text-xs text-gray-500 mb-1">
                          <span>Video Script</span>
                          <button onClick={() => copyToClipboard(post.video_script)} className="hover:text-white transition-colors">Kopiuj</button>
                        </div>
                        <div className="bg-black/30 rounded-lg p-3 text-sm text-gray-300 line-clamp-4 h-24 overflow-hidden relative">
                          {post.video_script}
                          <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-[#111111] to-transparent"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>

        {/* Sidebar / Status */}
        <div className="space-y-6">
          <div className="bg-[#111111] border border-white/5 rounded-2xl p-6">
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Status Usług</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-300 text-sm">Supabase DB</span>
                <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-500 text-[10px] font-bold rounded-full uppercase">Online</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-300 text-sm">Google Gemini</span>
                <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-500 text-[10px] font-bold rounded-full uppercase">Połączono</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-300 text-sm">LinkedIn OAuth</span>
                <span className="px-2 py-0.5 bg-white/5 text-gray-500 text-[10px] font-bold rounded-full uppercase italic">Wkrótce</span>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-emerald-600/20 to-transparent border border-emerald-500/20 rounded-2xl p-6">
            <h3 className="text-emerald-400 font-semibold mb-2">Wersja Pro</h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              Zautomatyzuj publikację na LinkedIn i TikToku jednym kliknięciem. Już wkrótce!
            </p>
          </div>
        </div>

      </div>
    </main>
  );
}
