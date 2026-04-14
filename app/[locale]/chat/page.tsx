"use client"

import { useState, useEffect, useRef, useMemo } from "react"
import { useRouter } from "@/i18n/navigation"
import { useLocale, useTranslations } from "next-intl"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { DEFAULT_MODEL, DEFAULT_BASE_URL } from "@/lib/config"
import { getPromptTemplates, normalizePromptLocale } from "@/lib/prompts"
import { defaultSettings, FREE_CONVERSATIONS_LIMIT } from "@/config/constants"
import { generateId } from "@/config/utils"
import { messageSlide } from "@/config/animations"
import {
  STORAGE_KEY_MESSAGES,
  STORAGE_KEY_CONFIG,
  STORAGE_KEY_USAGE,
  STORAGE_KEY_IMPORTANT,
  STORAGE_KEY_MODE,
  STORAGE_KEY_TRIGGER,
} from "@/config/storage"
import type { ChatMessage, UserConfig, UserSettings } from "@/lib/types"
import {
  Send,
  Settings,
  Trash2,
  KeyRound,
  AlertCircle,
  Brain,
  ChevronDown,
  ChevronUp,
  Home,
  X,
} from "lucide-react"
import { BrandIcon } from "@/components/brand-icon"

export default function ChatPage() {
  const router = useRouter()
  const uiLocale = normalizePromptLocale(useLocale())
  const promptTemplates = useMemo(
    () => getPromptTemplates(uiLocale),
    [uiLocale]
  )
  const t = useTranslations("Chat")
  const tErr = useTranslations("Chat.errors")
  const tCommon = useTranslations("common")
  const formatCd = (seconds: number) => {
    if (seconds < 60) return t("countdownSeconds", { n: seconds })
    const m = Math.floor(seconds / 60)
    const n = seconds % 60
    return t("countdownMinutes", { m, n })
  }
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [config, setConfig] = useState<UserConfig>({
    apiKey: "",
    model: DEFAULT_MODEL,
    baseURL: DEFAULT_BASE_URL,
    settings: { ...defaultSettings, systemPrompt: "" },
  })
  const [mode, setMode] = useState<"free" | "custom">("free")
  const [isConfigOpen, setIsConfigOpen] = useState(false)
  const [usedConversations, setUsedConversations] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [showQuotaAlert, setShowQuotaAlert] = useState(false)
  const [importantInfo, setImportantInfo] = useState<string[]>([])
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState("default")
  const [showImportantInfo, setShowImportantInfo] = useState(false)
  const [nextTriggerTime, setNextTriggerTime] = useState<number | null>(null)
  const [countdown, setCountdown] = useState<number>(0)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const triggerTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    const storedMode = localStorage.getItem(STORAGE_KEY_MODE) as "free" | "custom" | null
    if (storedMode) {
      setMode(storedMode)
    }
  }, [])

  useEffect(() => {
    const storedMessages = localStorage.getItem(STORAGE_KEY_MESSAGES)
    if (storedMessages) {
      try {
        setMessages(JSON.parse(storedMessages))
      } catch {
        console.error("Failed to parse stored messages")
      }
    }

    const storedConfig = localStorage.getItem(STORAGE_KEY_CONFIG)
    if (storedConfig) {
      try {
        const parsed = JSON.parse(storedConfig)
        setConfig({
          ...parsed,
          settings: { ...defaultSettings, ...parsed.settings },
        })
        if (parsed.settings?.promptTemplate) {
          setSelectedTemplate(parsed.settings.promptTemplate)
        }
      } catch {
        console.error("Failed to parse stored config")
      }
    }

    const storedUsage = localStorage.getItem(STORAGE_KEY_USAGE)
    if (storedUsage) {
      try {
        const usage = JSON.parse(storedUsage)
        setUsedConversations(usage.usedConversations || 0)
      } catch {
        console.error("Failed to parse stored usage")
      }
    }

    const storedImportant = localStorage.getItem(STORAGE_KEY_IMPORTANT)
    if (storedImportant) {
      try {
        setImportantInfo(JSON.parse(storedImportant))
      } catch {
        console.error("Failed to parse stored important info")
      }
    }
  }, [])

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_MESSAGES, JSON.stringify(messages))
  }, [messages])

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_CONFIG, JSON.stringify(config))
  }, [config])

  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEY_USAGE,
      JSON.stringify({ usedConversations })
    )
  }, [usedConversations])

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_IMPORTANT, JSON.stringify(importantInfo))
  }, [importantInfo])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const scheduleTrigger = (time: number, message: string) => {
    if (triggerTimeoutRef.current) {
      clearTimeout(triggerTimeoutRef.current)
    }
    setNextTriggerTime(time)
    localStorage.setItem(STORAGE_KEY_TRIGGER, JSON.stringify({ time, message }))

    const delay = time - Date.now()
    if (delay > 0) {
      triggerTimeoutRef.current = setTimeout(() => {
        const triggerMessage: ChatMessage = {
          id: generateId(),
          role: "assistant",
          content: message,
          createdAt: Date.now(),
          extra: { isTrigger: true },
        }
        setMessages((prev) => [...prev, triggerMessage])
        setNextTriggerTime(null)
        localStorage.removeItem(STORAGE_KEY_TRIGGER)
      }, delay)
    }
  }

  // 加载存储的触发点
  useEffect(() => {
    const storedTrigger = localStorage.getItem(STORAGE_KEY_TRIGGER)
    if (storedTrigger) {
      try {
        const { time, message } = JSON.parse(storedTrigger)
        if (time > Date.now()) {
          scheduleTrigger(time, message)
        } else {
          localStorage.removeItem(STORAGE_KEY_TRIGGER)
        }
      } catch {
        localStorage.removeItem(STORAGE_KEY_TRIGGER)
      }
    }
  }, [])

  // 倒计时更新
  useEffect(() => {
    if (!nextTriggerTime) {
      setCountdown(0)
      return
    }

    const interval = setInterval(() => {
      const remaining = Math.max(0, Math.ceil((nextTriggerTime - Date.now()) / 1000))
      setCountdown(remaining)
      if (remaining === 0) {
        clearInterval(interval)
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [nextTriggerTime])

  // 清理定时器
  useEffect(() => {
    return () => {
      if (triggerTimeoutRef.current) {
        clearTimeout(triggerTimeoutRef.current)
      }
    }
  }, [])

  const handleSend = async () => {
    if (!input.trim() || isLoading) return

    const userMessage: ChatMessage = {
      id: generateId(),
      role: "user",
      content: input.trim(),
      createdAt: Date.now(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMessage.content,
          history: messages,
          importantInfo,
          locale: uiLocale,
          config: config.apiKey || config.model !== DEFAULT_MODEL
            ? { 
                apiKey: config.apiKey, 
                model: config.model,
                baseURL: config.baseURL,
                settings: config.settings,
              }
            : { 
                settings: config.settings,
              },
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        if (data.error === "FREE_TOKENS_EXHAUSTED") {
          setShowQuotaAlert(true)
          setIsConfigOpen(true)
          throw new Error(tErr("freeExhausted"))
        }
        throw new Error(data.message || tErr("requestFailed"))
      }

      const assistantMessage: ChatMessage = {
        id: generateId(),
        role: "assistant",
        content: data.reply,
        createdAt: Date.now(),
        extra: {
          triggers: data.triggers,
          next_api_call_seconds: data.next_api_call_seconds,
        },
      }

      setMessages((prev) => [...prev, assistantMessage])

      if (data.usedConversations !== undefined) {
        setUsedConversations(data.usedConversations)
      }

      if (data.importantInfo) {
        setImportantInfo(data.importantInfo)
      }

      // 处理触发点 - 只取第一个，存入localStorage
      if (data.triggers && data.triggers.length > 0) {
        const trigger = data.triggers[0]
        const triggerTime = Date.now() + trigger.seconds * 1000
        scheduleTrigger(triggerTime, trigger.message)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : tErr("unknown"))
    } finally {
      setIsLoading(false)
    }
  }

  const handleClear = () => {
    setMessages([])
    setImportantInfo([])
    localStorage.removeItem(STORAGE_KEY_MESSAGES)
    localStorage.removeItem(STORAGE_KEY_IMPORTANT)
  }

  const handleDeleteImportantInfo = (index: number) => {
    const newImportantInfo = importantInfo.filter((_, i) => i !== index)
    setImportantInfo(newImportantInfo)
    localStorage.setItem(STORAGE_KEY_IMPORTANT, JSON.stringify(newImportantInfo))
  }

  const handleClearImportantInfo = () => {
    setImportantInfo([])
    localStorage.removeItem(STORAGE_KEY_IMPORTANT)
  }

  const handleConfigSave = () => {
    setIsConfigOpen(false)
    setShowQuotaAlert(false)
    if (config.apiKey) {
      localStorage.setItem(STORAGE_KEY_MODE, "custom")
      setMode("custom")
    }
  }

  const updateSettings = (key: keyof UserSettings, value: string | number | boolean) => {
    const currentSettings = config.settings || defaultSettings
    setConfig({
      ...config,
      settings: {
        ...currentSettings,
        [key]: value,
      },
    })
  }

  const handleTemplateChange = (templateId: string) => {
    setSelectedTemplate(templateId)
    const template = promptTemplates[templateId as keyof typeof promptTemplates]
    if (template) {
      setConfig({
        ...config,
        settings: {
          ...config.settings,
          templateName: templateId,
        },
      })
    }
  }

  const isUsingDefault = mode === "free" && !config.apiKey && config.model === DEFAULT_MODEL
  const remainingConversations = Math.max(0, FREE_CONVERSATIONS_LIMIT - usedConversations)

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col pt-16 pb-20">
      <header 
        className="fixed top-0 left-0 right-0 z-50 border-b border-slate-200 bg-white/50 backdrop-blur-sm"
      >
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => router.push("/")}
              className="p-0 border-0 bg-transparent cursor-pointer leading-none shrink-0 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
              aria-label={t("backHome")}
            >
              <BrandIcon size={36} priority alt={tCommon("brandAlt")} />
            </button>
            <span className="text-lg font-bold text-slate-800">{t("brand")}</span>
          </div>
          <div className="flex items-center gap-3 min-w-0 flex-wrap justify-end">
            <AnimatePresence>
              {countdown > 0 && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                >
                  <Badge variant="outline" className="text-xs gap-1 bg-blue-50 text-blue-600 border-blue-200 items-center">
                    <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse mt-0.5" />
                    {formatCd(countdown)}
                  </Badge>
                </motion.div>
              )}
            </AnimatePresence>
            <AnimatePresence>
              {importantInfo.length > 0 && (
                <Dialog open={showImportantInfo} onOpenChange={setShowImportantInfo}>
                  <DialogTrigger asChild>
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                      className="cursor-pointer"
                    >
                      <Badge variant="outline" className="text-xs gap-1">
                        <Brain className="w-3 h-3" />
                        {t("memoryCount", { count: importantInfo.length })}
                      </Badge>
                    </motion.div>
                  </DialogTrigger>
                  <DialogContent className="max-w-lg max-h-[60vh] flex flex-col p-0">
                    <DialogHeader className="px-6 pt-6 pb-2">
                      <DialogTitle>{t("memoryTitle")}</DialogTitle>
                    </DialogHeader>
                    <div className="flex-1 overflow-y-auto space-y-3 px-6 py-4">
                      {importantInfo.length === 0 ? (
                        <p className="text-center text-slate-400 text-sm py-8">{t("memoryEmpty")}</p>
                      ) : (
                        importantInfo.map((info, index) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className="flex items-start gap-2 p-3 rounded-lg bg-slate-50 border border-slate-200 group hover:border-slate-300"
                          >
                            <span className="flex-1 text-sm text-slate-700 break-words">{info}</span>
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => handleDeleteImportantInfo(index)}
                              className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-red-100 text-red-500 flex-shrink-0"
                              title={t("deleteTitle")}
                            >
                              <X className="w-4 h-4" />
                            </motion.button>
                          </motion.div>
                        ))
                      )}
                    </div>
                    {importantInfo.length > 0 && (
                      <div className="pt-4 border-t border-slate-200">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="w-full text-red-500 hover:text-red-600 hover:bg-red-50"
                          onClick={handleClearImportantInfo}
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          {t("clearAllMemory")}
                        </Button>
                      </div>
                    )}
                  </DialogContent>
                </Dialog>
              )}
            </AnimatePresence>
            {mode === "free" && (
              <Badge variant="outline" className="text-xs">
                {remainingConversations > 0
                  ? t("freeQuota", {
                      remaining: remainingConversations,
                      limit: FREE_CONVERSATIONS_LIMIT,
                    })
                  : t("quotaExhausted")}
              </Badge>
            )}
            {mode === "custom" && (
              <Badge variant="outline" className="text-xs bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
                {t("customMode")}
              </Badge>
            )}
            <Button variant="ghost" size="icon" onClick={handleClear} className="cursor-pointer">
              <Trash2 className="w-4 h-4" />
            </Button>
            <Dialog open={isConfigOpen} onOpenChange={setIsConfigOpen}>
              <DialogTrigger asChild>
                <Button variant="ghost" size="icon" className="cursor-pointer">
                  <Settings className="w-4 h-4" />
                </Button>
              </DialogTrigger>
              <DialogContent className="max-h-[80vh] overflow-y-auto p-0">
                  <DialogHeader className="px-6 pt-6 pb-2">
                    <DialogTitle>{t("settings")}</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 px-6 py-4">
                    {showQuotaAlert && (
                      <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 flex items-start gap-2"
                      >
                        <AlertCircle className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
                        <p className="text-sm text-red-400">
                          {t("quotaAlert")}
                        </p>
                      </motion.div>
                    )}

                    <div>
                      <label className="text-sm text-slate-400 mb-2 block">
                        {t("apiBaseUrl")}
                      </label>
                      <Input
                        placeholder="https://api.openai.com/v1"
                        value={config.baseURL || ""}
                        onChange={(e) =>
                          setConfig({ ...config, baseURL: e.target.value })
                        }
                      />
                    </div>

                    <div>
                      <label className="text-sm text-slate-400 mb-2 block">
                        {t("modelName")}
                      </label>
                      <Input
                        placeholder={t("modelPlaceholder")}
                        value={config.model}
                        onChange={(e) =>
                          setConfig({ ...config, model: e.target.value })
                        }
                      />
                    </div>

                    <div>
                      <label className="text-sm text-slate-400 mb-2 block">
                        {t("apiKey")} {isUsingDefault && t("apiKeyOptional")}
                      </label>
                      <Input
                        type="password"
                        placeholder="sk-..."
                        value={config.apiKey}
                        onChange={(e) =>
                          setConfig({ ...config, apiKey: e.target.value })
                        }
                      />
                    </div>

                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <KeyRound className="w-3 h-3" />
                      {t("localOnly")}
                    </div>

                    <div className="border-t border-slate-200 pt-4">
                      <button
                        onClick={() => setShowAdvanced(!showAdvanced)}
                        className="flex items-center justify-between w-full text-sm text-slate-500 hover:text-slate-900"
                      >
                        <span>{t("advanced")}</span>
                        {showAdvanced ? (
                          <ChevronUp className="w-4 h-4" />
                        ) : (
                          <ChevronDown className="w-4 h-4" />
                        )}
                      </button>

                      <AnimatePresence>
                        {showAdvanced && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="space-y-4 mt-4 overflow-hidden"
                          >
                            <div>
                              <label className="text-sm text-slate-400 mb-2 block">
                                {t("personaTemplate")}
                              </label>
                              <select
                                value={selectedTemplate}
                                onChange={(e) => handleTemplateChange(e.target.value)}
                                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                              >
                                {Object.entries(promptTemplates).map(([id, template]) => (
                                  <option key={id} value={id}>
                                    {template.name} - {template.description}
                                  </option>
                                ))}
                              </select>
                            </div>

                            <div>
                              <label className="text-sm text-slate-400 mb-2 block">
                                {t("importantThreshold", {
                                  value: config.settings?.importantInfoThreshold || 20,
                                })}
                              </label>
                              <input
                                type="range"
                                min="10"
                                max="100"
                                value={config.settings?.importantInfoThreshold || 20}
                                onChange={(e) =>
                                  updateSettings("importantInfoThreshold", parseInt(e.target.value))
                                }
                                className="w-full"
                              />
                              <p className="text-xs text-slate-500 mt-1">
                                {t("importantThresholdHint")}
                              </p>
                            </div>

                            <div>
                              <label className="text-sm text-slate-400 mb-2 block">
                                {t("proactiveInterval")}
                              </label>
                              <Input
                                type="number"
                                min="10"
                                max="300"
                                value={config.settings?.proactiveInterval || 60}
                                onChange={(e) =>
                                  updateSettings("proactiveInterval", parseInt(e.target.value) || 60)
                                }
                              />
                              <p className="text-xs text-slate-500 mt-1">
                                {t("proactiveIntervalHint")}
                              </p>
                            </div>

                            <div>
                              <label className="text-sm text-slate-400 mb-2 block">
                                {t("recentMessages", {
                                  value: config.settings?.recentMessagesCount || 3,
                                })}
                              </label>
                              <input
                                type="range"
                                min="1"
                                max="10"
                                value={config.settings?.recentMessagesCount || 3}
                                onChange={(e) =>
                                  updateSettings("recentMessagesCount", parseInt(e.target.value))
                                }
                                className="w-full"
                              />
                              <p className="text-xs text-slate-500 mt-1">
                                {t("recentMessagesHint")}
                              </p>
                            </div>

                            <div className="flex items-center justify-between">
                              <span className="text-sm text-slate-400">
                                {t("proactiveEnabled")}
                              </span>
                              <input
                                type="checkbox"
                                checked={config.settings?.proactiveEnabled !== false}
                                onChange={(e) =>
                                  updateSettings("proactiveEnabled", e.target.checked)
                                }
                                className="w-5 h-5"
                              />
                            </div>

                            <div>
                              <label className="text-sm text-slate-400 mb-2 block">
                                {t("systemPrompt")}
                              </label>
                              <textarea
                                className="w-full h-32 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder={t("systemPromptPlaceholder")}
                                value={config.settings?.systemPrompt || ""}
                                onChange={(e) =>
                                  updateSettings("systemPrompt", e.target.value)
                                }
                              />
                              <p className="text-xs text-slate-500 mt-1">
                                {t("systemPromptHint")}
                              </p>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    <Button className="w-full" onClick={handleConfigSave}>
                      {t("save")}
                    </Button>
                  </div>
                </DialogContent>
            </Dialog>
            <Button variant="ghost" size="icon" onClick={() => router.push("/")} className="cursor-pointer">
              <Home className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-4 py-6 space-y-4">
          {messages.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-center py-12"
            >
              <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4 p-2"
              >
                <BrandIcon size={32} alt={tCommon("brandAlt")} />
              </motion.div>
              <h3 className="text-lg font-semibold mb-2 text-slate-800">
                {t("emptyTitle")}
              </h3>
              <p className="text-sm text-slate-500 max-w-md mx-auto">
                {t("emptySub")}
              </p>
            </motion.div>
          )}
          <AnimatePresence mode="popLayout">
            {messages.map((msg, index) => (
              <motion.div
                key={msg.id}
                initial="hidden"
                animate="visible"
                variants={messageSlide}
                transition={{ delay: index * 0.05 }}
                className={`flex gap-3 ${
                  msg.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                {msg.role === "assistant" && (
                  <motion.div 
                    whileHover={{ scale: 1.1 }}
                    className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center flex-shrink-0 p-1"
                  >
                    <BrandIcon size={16} alt={tCommon("brandAlt")} />
                  </motion.div>
                )}
                <div
                  className={`max-w-[70%] rounded-2xl px-4 py-2 ${
                    msg.role === "user"
                      ? "bg-blue-600 text-white"
                      : "bg-slate-100 text-slate-800"
                  }`}
                >
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          <AnimatePresence>
            {isLoading && (
              <motion.div
                initial="hidden"
                animate="visible"
                variants={messageSlide}
                className="flex gap-3"
              >
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center p-1">
                  <BrandIcon size={16} alt={tCommon("brandAlt")} />
                </div>
                <div className="bg-slate-100 rounded-2xl px-4 py-3 flex items-center">
                  <div className="flex gap-1 h-2 items-center">
                    <motion.span 
                      animate={{ y: [0, -4, 0] }}
                      transition={{ repeat: Infinity, duration: 0.6, delay: 0 }}
                      className="w-2 h-2 rounded-full bg-slate-400" 
                    />
                    <motion.span 
                      animate={{ y: [0, -4, 0] }}
                      transition={{ repeat: Infinity, duration: 0.6, delay: 0.1 }}
                      className="w-2 h-2 rounded-full bg-slate-400" 
                    />
                    <motion.span 
                      animate={{ y: [0, -4, 0] }}
                      transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }}
                      className="w-2 h-2 rounded-full bg-slate-400" 
                    />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm"
              >
                {error}
              </motion.div>
            )}
          </AnimatePresence>
          <div ref={messagesEndRef} />
        </div>
      </div>

      <div 
        className="fixed bottom-0 left-0 right-0 z-50 border-t border-slate-200 bg-white/50 backdrop-blur-sm"
      >
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex gap-3">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
              placeholder={t("inputPlaceholder")}
              disabled={isLoading}
              className="flex-1"
            />
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button onClick={handleSend} disabled={isLoading || !input.trim()}>
                <Send className="w-4 h-4" />
              </Button>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}
