"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { CheckCircle2, Link as LinkIcon, Clock, Globe, History, Settings, ExternalLink } from "lucide-react";

export default function Dashboard() {
  const [generations, setGenerations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchGenerations() {
      const { data, error } = await supabase
        .from("generations")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(5);

      if (!error && data) {
        setGenerations(data);
      }
      setLoading(false);
    }

    fetchGenerations();
  }, []);

  const connections = [
    { name: "Telegram", status: "connected", icon: <CheckCircle2 className="text-emerald-500" /> },
    { name: "Google / Gemini", status: "connected", icon: <CheckCircle2 className="text-emerald-500" /> },
    { name: "LinkedIn", status: "disconnected", icon: <LinkIcon /> },
  ];

  return (
    <main className="container">
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
        <div>
          <h1>Witaj w AI Command Center</h1>
          <p className="subtitle">Twoje treści są generowane i gotowe do publikacji.</p>
        </div>
        <div className="btn btn-outline">Wyloguj się</div>
      </header>

      <section>
        <h2 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Settings size={24} /> Ostatnio wygenerowane
        </h2>
        <div className="grid-connections" style={{ gridTemplateColumns: '1fr' }}>
          {loading ? (
            <p>Ładowanie Twoich treści...</p>
          ) : generations.length > 0 ? (
            generations.map((gen) => (
              <div key={gen.id} className="glass-card" style={{ marginBottom: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                  <span className="badge badge-success">{gen.content_type.toUpperCase()}</span>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                    {new Date(gen.created_at).toLocaleString()}
                  </span>
                </div>
                <pre style={{ 
                  whiteSpace: 'pre-wrap', 
                  background: '#000', 
                  padding: '1rem', 
                  borderRadius: '8px',
                  fontSize: '0.9rem',
                  color: '#ccc',
                  border: '1px solid var(--border)'
                }}>
                  {gen.content}
                </pre>
                <div style={{ marginTop: '1rem', display: 'flex', gap: '1rem' }}>
                  <button className="btn btn-primary" onClick={() => navigator.clipboard.writeText(gen.content)}>
                    Kopiuj treść
                  </button>
                </div>
              </div>
            ))
          ) : (
            <p className="subtitle">Brak postów w historii. Napisz do bota na Telegramie!</p>
          )}
        </div>
      </section>

      <div className="grid-connections">
        {connections.map((conn) => (
          <div key={conn.name} className="glass-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: 600 }}>{conn.name}</span>
              {conn.status === "connected" ? <span className="badge badge-success">Połączono</span> : <span className="badge badge-pending">Link</span>}
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
