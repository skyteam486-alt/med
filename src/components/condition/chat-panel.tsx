"use client";

import { useEffect, useRef, useState } from "react";
import { format } from "date-fns";
import { Send } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type ChatMessage = {
  id: string;
  sender_id: string;
  message: string;
  created_at: string;
};

export function ChatPanel({
  conditionId,
  currentUserId,
  otherPartyName,
  initialMessages,
}: {
  conditionId: string;
  currentUserId: string;
  otherPartyName: string;
  initialMessages: ChatMessage[];
}) {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const supabase = useRef(createClient());
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const client = supabase.current;
    const channel = client
      .channel(`chat:${conditionId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "chats",
          filter: `condition_id=eq.${conditionId}`,
        },
        (payload) => {
          const row = payload.new as ChatMessage;
          setMessages((prev) => (prev.some((m) => m.id === row.id) ? prev : [...prev, row]));
        },
      )
      .subscribe();

    return () => {
      client.removeChannel(channel);
    };
  }, [conditionId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function send(e: React.FormEvent) {
    e.preventDefault();
    const message = text.trim();
    if (!message) return;
    setSending(true);
    const { error } = await supabase.current
      .from("chats")
      .insert({ condition_id: conditionId, sender_id: currentUserId, message });
    setSending(false);
    if (!error) setText("");
  }

  return (
    <div className="flex h-80 flex-col">
      <div className="flex-1 space-y-3 overflow-y-auto pr-1">
        {messages.length === 0 && (
          <p className="py-10 text-center text-sm text-slate-400">No messages yet. Say hello!</p>
        )}
        {messages.map((m) => {
          const mine = m.sender_id === currentUserId;
          return (
            <div key={m.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[75%] rounded-2xl px-3 py-2 text-sm ${
                  mine ? "bg-teal-600 text-white" : "bg-slate-100 text-slate-800"
                }`}
              >
                <p>{m.message}</p>
                <p className={`mt-1 text-[10px] ${mine ? "text-teal-100" : "text-slate-400"}`}>
                  {mine ? "You" : otherPartyName} · {format(new Date(m.created_at), "MMM d, HH:mm")}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>
      <form onSubmit={send} className="mt-3 flex gap-2">
        <Input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type a message…"
        />
        <Button type="submit" size="icon" disabled={sending}>
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </div>
  );
}
