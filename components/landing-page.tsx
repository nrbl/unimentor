"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { BrainCircuit, Target, Activity, CheckCircle, GraduationCap, ArrowRight, Sparkles } from "lucide-react"

export function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background selection:bg-primary/30">
      {/* Navigation */}
      <header className="fixed top-0 w-full z-50 border-b bg-background/80 backdrop-blur-md">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-primary p-1.5 rounded-lg">
              <GraduationCap className="h-6 w-6 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold tracking-tight">UniMentor</span>
          </div>
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
            <a href="#features" className="hover:text-primary transition-colors">Возможности</a>
            <a href="#how-it-works" className="hover:text-primary transition-colors">Как это работает</a>
          </nav>
          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost" size="sm">Вход</Button>
            </Link>
            <Link href="/register">
              <Button size="sm">Начать обучение</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1 pt-16">
        {/* Hero Section */}
        <section className="relative py-24 lg:py-32 overflow-hidden border-b">
          <div className="container mx-auto px-4 relative z-10">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="flex flex-col gap-6 max-w-2xl">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold w-fit">
                  <Sparkles className="h-3 w-3" />
                  Умный ИИ-ассистент для образования
                </div>
                <h1 className="text-5xl lg:text-7xl font-extrabold tracking-tight text-foreground leading-[1.1]">
                  Обучение <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-600">будущего</span> — уже здесь.
                </h1>
                <p className="text-xl text-muted-foreground leading-relaxed">
                  UniMentor — это персонализированная платформа, которая адаптируется под твой темп, выстраивает Матрицу Навыков и ведет тебя за руку через сложные концепции с помощью Сократовского ИИ.
                </p>
                <div className="flex flex-wrap gap-4 pt-4">
                  <Link href="/register">
                    <Button size="xl" className="h-14 px-8 text-lg font-semibold shadow-xl shadow-primary/20">
                      Начать бесплатно
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </Link>
                  <Link href="/catalog">
                    <Button variant="outline" size="xl" className="h-14 px-8 text-lg font-semibold">
                      Смотреть каталог
                    </Button>
                  </Link>
                </div>
                <div className="flex items-center gap-3 mt-4 text-sm text-muted-foreground">
                  <div className="flex -space-x-2">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="h-8 w-8 rounded-full border-2 border-background bg-muted overflow-hidden">
                         <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${i + 15}`} alt="Avatar" />
                      </div>
                    ))}
                  </div>
                  <span><span className="font-bold text-foreground">500+</span> студентов уже с нами</span>
                </div>
              </div>

              <div className="relative">
                <div className="absolute -inset-4 bg-primary/20 rounded-3xl blur-3xl opacity-30 animate-pulse"></div>
                <div className="relative rounded-2xl border bg-card/50 backdrop-blur-sm shadow-2xl overflow-hidden aspect-video group">
                   <img 
                    src="/unimentor_hero.png" 
                    alt="UniMentor AI Experience" 
                    className="object-cover w-full h-full transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background/60 to-transparent"></div>
                  <div className="absolute bottom-6 left-6 right-6 p-4 rounded-xl border bg-background/90 backdrop-blur-md shadow-lg flex items-center gap-4">
                    <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center">
                      <BrainCircuit className="h-5 w-5 text-primary-foreground" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold">Адаптивный алгоритм</p>
                      <p className="text-xs text-muted-foreground">Персонализация программы на 98%</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-24 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-3xl lg:text-4xl font-bold mb-4 italic uppercase tracking-tighter text-primary">Power Features</h2>
              <h3 className="text-4xl font-extrabold mb-6">Почему выбирают UniMentor?</h3>
              <p className="text-lg text-muted-foreground">Мы объединили передовые методы педагогики и искусственный интеллект для максимально эффективного обучения.</p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  title: "Сократовский ИИ",
                  desc: "Наш ИИ не дает готовых ответов. Он задает наводящие вопросы, заставляя ваш мозг работать и усваивать материал на 200% глубже.",
                  icon: BrainCircuit,
                  color: "blue"
                },
                {
                  title: "Матрица Навыков",
                  desc: "Визуальный профиль компетенций в реальном времени. Следите за своим ростом в каждой конкретной теме на интерактивном радаре.",
                  icon: Target,
                  color: "emerald"
                },
                {
                  title: "Teacher Dashboard",
                  desc: "Инструменты для преподавателей: аналитика вовлеченности, выявление отстающих студентов и AI-инсайты по курсу.",
                  icon: Activity,
                  color: "purple"
                }
              ].map((feature, idx) => (
                <div key={idx} className="relative group p-8 rounded-2xl bg-background border hover:border-primary transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
                  <div className={`h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mb-6 text-primary`}>
                    <feature.icon className="h-6 w-6" />
                  </div>
                  <h4 className="text-xl font-bold mb-3">{feature.title}</h4>
                  <p className="text-muted-foreground leading-relaxed">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How it works */}
        <section id="how-it-works" className="py-24 border-t">
          <div className="container mx-auto px-4">
             <div className="grid lg:grid-cols-2 gap-16 items-center">
                <div className="space-y-8">
                   <h2 className="text-4xl font-bold">Твой путь к успеху за 3 шага</h2>
                   <div className="space-y-6">
                      {[
                        { step: "01", title: "Запишись на интересующий курс", desc: "Сотни курсов по IT, дизайну и бизнесу уже ждут тебя в нашем каталоге." },
                        { step: "02", title: "Общайся с ИИ-тьютором", desc: "Решай квизы и задавай вопросы. ИИ будет адаптировать сложность под твой уровень." },
                        { step: "03", title: "Получай результат", desc: "Заполни свою Матрицу Навыков на 100% и получи профессиональный сертификат." }
                      ].map((item, i) => (
                        <div key={i} className="flex gap-6">
                           <div className="text-4xl font-black text-primary/20 shrink-0 leading-none">{item.step}</div>
                           <div>
                              <h4 className="text-xl font-bold mb-2">{item.title}</h4>
                              <p className="text-muted-foreground">{item.desc}</p>
                           </div>
                        </div>
                      ))}
                   </div>
                   <Link href="/register">
                    <Button size="lg" className="rounded-full px-8">Разблокировать доступ</Button>
                   </Link>
                </div>
                <div className="p-8 rounded-3xl bg-secondary relative">
                  <img 
                    src="https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&q=80&w=1000" 
                    alt="Team learning" 
                    className="rounded-2xl shadow-xl"
                  />
                  <div className="absolute -bottom-6 -left-6 p-6 rounded-2xl bg-primary shadow-2xl text-primary-foreground max-w-[240px]">
                     <div className="flex items-center gap-2 mb-2">
                        <CheckCircle className="h-5 w-5" />
                        <span className="font-bold">Верифицировано</span>
                     </div>
                     <p className="text-xs opacity-90">Основано на принципах когнитивной психологии и современных LLM моделях.</p>
                  </div>
                </div>
             </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 overflow-hidden relative">
           <div className="absolute inset-0 bg-primary/5 -z-10"></div>
           <div className="container mx-auto px-4 text-center">
              <div className="max-w-4xl mx-auto space-y-8">
                 <h2 className="text-4xl lg:text-6xl font-extrabold tracking-tight">Готовы изменить своё обучение?</h2>
                 <p className="text-xl text-muted-foreground">Присоединяйтесь к UniMentor сегодня и почувствуйте разницу уже на первом занятии.</p>
                 <div className="pt-4 flex flex-col sm:flex-row gap-4 justify-center">
                    <Link href="/register">
                      <Button size="xl" className="h-16 px-10 rounded-full text-lg shadow-2xl shadow-primary/30">Создать аккаунт</Button>
                    </Link>
                    <Link href="/login">
                      <Button variant="outline" size="xl" className="h-16 px-10 rounded-full text-lg">Войти в систему</Button>
                    </Link>
                 </div>
              </div>
           </div>
        </section>
      </main>

      <footer className="border-t py-12 bg-background">
         <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row justify-between items-center gap-8">
               <div className="flex items-center gap-2">
                 <GraduationCap className="h-5 w-5 text-primary" />
                 <span className="font-bold">UniMentor AI</span>
               </div>
               <div className="flex gap-8 text-sm text-muted-foreground">
                  <a href="#" className="hover:text-primary">Конфиденциальность</a>
                  <a href="#" className="hover:text-primary">Условия использования</a>
                  <a href="#" className="hover:text-primary">Контакты</a>
               </div>
               <p className="text-sm text-muted-foreground">© 2026 UniMentor Team. Built for the future of HigherEd.</p>
            </div>
         </div>
      </footer>
    </div>
  )
}
