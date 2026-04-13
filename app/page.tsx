"use client"

import { useRouter } from "next/navigation"
import Link from "next/link"
import { motion, useInView } from "framer-motion"
import { useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  ArrowRight,
  MessageCircle,
  Download,
  Star,
  Github,
  ExternalLink,
} from "lucide-react"
import { BrandIcon } from "@/components/brand-icon"
import { features, steps } from "@/config/content"
import { fadeInUp, fadeInLeft, fadeInRight } from "@/config/animations"

const WINDOWS_DESKTOP_RELEASE_URL =
  "https://github.com/tobegold574/proactive-ai-desktop/releases/tag/v1.0.0"

export default function Home() {
  const router = useRouter()
  const featuresRef = useRef(null)
  const stepsRef = useRef(null)
  const downloadRef = useRef(null)
  const ctaRef = useRef(null)

  const featuresInView = useInView(featuresRef, { once: true, margin: "-100px" })
  const stepsInView = useInView(stepsRef, { once: true, margin: "-100px" })
  const downloadInView = useInView(downloadRef, { once: true, margin: "-100px" })
  const ctaInView = useInView(ctaRef, { once: true, margin: "-100px" })

  return (
    <div className="min-h-screen bg-slate-50">
      <motion.nav 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.3 }}
        className="fixed top-0 left-0 right-0 z-50 border-b border-slate-200 bg-white/80 backdrop-blur-xl"
      >
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <BrandIcon size={36} priority className="shrink-0" />
            <span className="text-lg font-bold text-slate-800">Proactive AI</span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <motion.div
              whileHover={{ scale: 1.05 }}
            >
              <Link href="#features" className="text-sm text-slate-600 hover:text-slate-900 transition-colors" scroll={false} onClick={(e) => {
                e.preventDefault();
                document.querySelector('#features')?.scrollIntoView({ behavior: 'smooth' });
              }}>
                特性
              </Link>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.05 }}
            >
              <Link href="#how-it-works" className="text-sm text-slate-600 hover:text-slate-900 transition-colors" scroll={false} onClick={(e) => {
                e.preventDefault();
                document.querySelector('#how-it-works')?.scrollIntoView({ behavior: 'smooth' });
              }}>
                原理
              </Link>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.05 }}
            >
              <Link href="#download" className="text-sm text-slate-600 hover:text-slate-900 transition-colors" scroll={false} onClick={(e) => {
                e.preventDefault();
                document.querySelector('#download')?.scrollIntoView({ behavior: 'smooth' });
              }}>
                下载
              </Link>
            </motion.div>
            <motion.div>
              <Button size="sm" onClick={() => router.push("/chat")} className="cursor-pointer">
                开始使用
              </Button>
            </motion.div>
          </div>
        </div>
      </motion.nav>

      <section className="pt-32 pb-24 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <Badge variant="success" className="mb-6 bg-blue-50 text-blue-600 border-blue-200">
              <Star className="w-3 h-3 mr-1" />
              开源免费 • 主动对话 AI
            </Badge>
          </motion.div>
          <motion.h1 
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-6xl font-bold mb-6 tracking-tight text-slate-900"
          >
            不是只会{" "}
            <span className="bg-gradient-to-r from-blue-500 to-cyan-500 bg-clip-text text-transparent">
              问一句答一句
            </span>
          </motion.h1>
          <motion.p 
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
            transition={{ delay: 0.2 }}
            className="text-lg text-slate-600 mb-10 max-w-2xl mx-auto leading-relaxed"
          >
            下一代 AI 对话体验。AI 会主动关心你，记得你的偏好，在合适的时机发起对话。
            就像一个真实的朋友。
          </motion.p>
          <motion.div 
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
            transition={{ delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button size="lg" onClick={() => router.push("/chat")} className="bg-blue-600 hover:bg-blue-700 cursor-pointer">
                <MessageCircle className="w-5 h-5 mr-2" />
                立即体验
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button variant="secondary" size="lg" onClick={(e) => {
                e.preventDefault();
                document.querySelector('#download')?.scrollIntoView({ behavior: 'smooth' });
              }}>
                <Download className="w-4 h-4 mr-2" />
                下载客户端
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      <section ref={featuresRef} id="features" className="py-24 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <motion.div 
            initial="hidden"
            animate={featuresInView ? "visible" : "hidden"}
            variants={fadeInUp}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-slate-900">
              不一样的 <span className="text-blue-500">AI 对话</span>
            </h2>
            <p className="text-slate-600">重新定义人机交互</p>
          </motion.div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial="hidden"
                animate={featuresInView ? "visible" : "hidden"}
                variants={fadeInUp}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.02, y: -4 }}
              >
                <Card className="group h-full">
                  <CardContent className="p-6 h-full">
                    <motion.div
                      whileHover={{ scale: 1.1 }}
                      className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-4`}
                    >
                      <feature.icon className="w-6 h-6 text-white" />
                    </motion.div>
                    <h3 className="text-lg font-semibold mb-2 text-slate-900 group-hover:text-blue-500 transition-colors">
                      {feature.title}
                    </h3>
                    <p className="text-sm text-slate-500 leading-relaxed">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section ref={stepsRef} id="how-it-works" className="py-24 px-6 bg-slate-100">
        <div className="max-w-4xl mx-auto">
          <motion.div 
            initial="hidden"
            animate={stepsInView ? "visible" : "hidden"}
            variants={fadeInUp}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-slate-900">
              工作 <span className="text-blue-500">原理</span>
            </h2>
            <p className="text-slate-600">两步开始你的主动 AI 对话</p>
          </motion.div>
          <div className="grid md:grid-cols-2 gap-8">
            {steps.map((step, index) => (
              <motion.div
                key={index}
                initial="hidden"
                animate={stepsInView ? "visible" : "hidden"}
                variants={index === 0 ? fadeInLeft : fadeInRight}
                transition={{ delay: 0.2 }}
                className="text-center"
                whileHover={{ scale: 1.05 }}
              >
                <motion.div 
                  whileHover={{ scale: 1.1 }}
                  className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white border border-slate-200 mb-4"
                >
                  <span className="text-2xl font-bold text-blue-500">
                    {step.number}
                  </span>
                </motion.div>
                <h3 className="text-lg font-semibold mb-2 text-slate-900">{step.title}</h3>
                <p className="text-sm text-slate-500">{step.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section ref={downloadRef} id="download" className="py-24 px-6 bg-white">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div 
            initial="hidden"
            animate={downloadInView ? "visible" : "hidden"}
            variants={fadeInUp}
            className="mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-slate-900">
              下载 <span className="text-blue-500">客户端</span>
            </h2>
            <p className="text-slate-600">
              本地运行更安全，完全掌控你的 API Key
            </p>
          </motion.div>
          <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto">
            <motion.div
              initial="hidden"
              animate={downloadInView ? "visible" : "hidden"}
              variants={fadeInUp}
              transition={{ delay: 0 }}
              whileHover={{ scale: 1.02, y: -4 }}
            >
              <Card className="group h-full text-left">
                <CardContent className="p-8 pt-8 h-full flex flex-col">
                  <motion.div
                    whileHover={{ scale: 1.2 }}
                    className="text-5xl mb-4"
                  >
                    🖥️
                  </motion.div>
                  <h3 className="text-xl font-semibold mb-2 text-slate-900 group-hover:text-blue-500 transition-colors">
                    桌面客户端
                  </h3>
                  <p className="text-sm text-slate-500 mb-4 flex-1">
                    Windows 版已发布；macOS / Linux 敬请期待
                  </p>
                  <Button asChild className="w-full cursor-pointer">
                    <a
                      href={WINDOWS_DESKTOP_RELEASE_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      下载 Windows 版
                      <ExternalLink className="w-4 h-4 ml-2 opacity-70" />
                    </a>
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
            <motion.div
              initial="hidden"
              animate={downloadInView ? "visible" : "hidden"}
              variants={fadeInUp}
              transition={{ delay: 0.1 }}
              whileHover={{ scale: 1.02, y: -4 }}
            >
              <Card className="group cursor-pointer h-full text-left">
                <CardContent className="p-8 pt-8 h-full">
                  <motion.div
                    whileHover={{ scale: 1.2 }}
                    className="text-5xl mb-4"
                  >
                    ⌨️
                  </motion.div>
                  <h3 className="text-xl font-semibold mb-2 text-slate-900 group-hover:text-blue-500 transition-colors">
                    TUI 终端
                  </h3>
                  <p className="text-sm text-slate-500 mb-4">极客首选 • 轻量快速</p>
                  <Badge variant="secondary">即将推出</Badge>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      <section ref={ctaRef} className="py-24 px-6 bg-gradient-to-b from-white to-blue-50">
        <div className="max-w-2xl mx-auto text-center">
          <motion.div 
            initial="hidden"
            animate={ctaInView ? "visible" : "hidden"}
            variants={fadeInUp}
          >
            <h2 className="text-3xl font-bold mb-4 text-slate-900">准备好体验了吗？</h2>
            <p className="text-slate-600 mb-8">
              立即开始你的主动 AI 对话之旅
            </p>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button size="lg" onClick={() => router.push("/chat")} className="bg-blue-600 hover:bg-blue-700 cursor-pointer">
                <MessageCircle className="w-5 h-5 mr-2"/>
                开始体验
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      <footer className="py-8 px-6 border-t border-slate-200 bg-white">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2 text-slate-500">
            <motion.div whileHover={{ scale: 1.1 }}>
              <BrandIcon size={20} />
            </motion.div>
            <span className="font-medium text-slate-700">Proactive AI Chat</span>
          </div>
          <div className="flex items-center gap-4 text-sm text-slate-400">
            <motion.a
              href="https://github.com/tobegold574/proactive-ai-chat"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-slate-700 transition-colors flex items-center gap-1"
              whileHover={{ scale: 1.1 }}
            >
              <Github className="w-4 h-4" />
              GitHub
            </motion.a>
            <span>© 2026 Proactive AI</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
