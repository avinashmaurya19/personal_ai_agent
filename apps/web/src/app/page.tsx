"use client";

import React, { useEffect, useState, useCallback } from "react";
import { api, ConversationItem, MessageItem, ModelOption } from "@/lib/api-client";
import { ConversationList } from "@/features/conversations/conversation-list";
import { ChatView } from "@/features/chat/chat-view";

export default function HomePage() {
  const [conversations, setConversations] = useState<ConversationItem[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [models, setModels] = useState<ModelOption[]>([]);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.getModels()
      .then(setModels)
      .catch((err) => console.error("Failed to load models:", err));
  }, []);

  const fetchConversations = useCallback(async () => {
    try {
      const data = await api.getConversations();
      setConversations(data);
      if (data.length > 0 && !selectedId) {
        setSelectedId(data[0].id);
      }
    } catch (err: any) {
      console.error("Failed to load conversations:", err);
      setError("Unable to connect to FastAPI backend. Ensure backend is running on port 8000.");
    }
  }, [selectedId]);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  useEffect(() => {
    if (!selectedId) {
      setMessages([]);
      return;
    }

    let isMounted = true;
    setIsLoadingMessages(true);
    api.getMessages(selectedId)
      .then((data) => {
        if (isMounted) setMessages(data);
      })
      .catch((err) => {
        console.error("Failed to load messages:", err);
      })
      .finally(() => {
        if (isMounted) setIsLoadingMessages(false);
      });

    return () => {
      isMounted = false;
    };
  }, [selectedId]);

  const handleCreateNew = async () => {
    try {
      const newConv = await api.createConversation();
      setConversations((prev) => [newConv, ...prev]);
      setSelectedId(newConv.id);
      setMessages([]);
    } catch (err) {
      console.error("Failed to create conversation:", err);
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/v1/conversations/${id}`, {
        method: "DELETE",
      });
      setConversations((prev) => prev.filter((c) => c.id !== id));
      if (selectedId === id) {
        const remaining = conversations.filter((c) => c.id !== id);
        setSelectedId(remaining.length > 0 ? remaining[0].id : null);
      }
    } catch (err) {
      console.error("Failed to delete conversation:", err);
    }
  };

  const handleSendMessage = async (content: string) => {
    if (!selectedId) return;

    // Optimistically add user message
    const tempUserMessage: MessageItem = {
      id: "temp-" + Date.now(),
      conversation_id: selectedId,
      role: "user",
      content,
      token_count: content.split(" ").length,
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, tempUserMessage]);

    try {
      const assistantReply = await api.sendMessage(selectedId, content);
      setMessages((prev) => [...prev, assistantReply]);
      // Refresh conversations to update titles/updated_at
      fetchConversations();
    } catch (err: any) {
      console.error("Failed to send message:", err);
      // Append error message as system notification
      const errorReply: MessageItem = {
        id: "err-" + Date.now(),
        conversation_id: selectedId,
        role: "assistant",
        content: `⚠️ Error sending message: ${err.message || "Failed to reach backend"}`,
        token_count: 0,
        created_at: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errorReply]);
    }
  };

  const handleModelChange = async (provider: string, model: string) => {
    if (!selectedId) return;
    try {
      const updated = await api.updateConversationModel(selectedId, provider, model);
      setConversations((prev) =>
        prev.map((c) => (c.id === selectedId ? updated : c))
      );
    } catch (err) {
      console.error("Failed to update conversation model:", err);
    }
  };

  const selectedConversation = conversations.find((c) => c.id === selectedId) || null;

  return (
    <div className="flex h-screen w-screen overflow-hidden">
      <ConversationList
        conversations={conversations}
        selectedId={selectedId}
        onSelect={setSelectedId}
        onCreateNew={handleCreateNew}
        onDelete={handleDelete}
      />
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {error && (
          <div className="bg-amber-500/10 border-b border-amber-500/20 px-4 py-2 text-xs text-amber-400 flex items-center justify-between">
            <span>{error}</span>
            <button onClick={() => setError(null)} className="underline ml-4">Dismiss</button>
          </div>
        )}
        <ChatView
          conversation={selectedConversation}
          messages={messages}
          models={models}
          isLoading={isLoadingMessages}
          onSendMessage={handleSendMessage}
          onModelChange={handleModelChange}
        />
      </div>
    </div>
  );
}
