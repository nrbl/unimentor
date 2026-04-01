"use client"

import React, { useRef } from "react"
import { Button } from "@/components/ui/button"
import { GraduationCap, Printer, Download, Award, ShieldCheck } from "lucide-react"
import type { User, SkillProgress } from "@/lib/types"

interface AchievementCertificateProps {
  user: User
  skills: SkillProgress[]
  onClose: () => void
}

export function AchievementCertificate({ user, skills, onClose }: AchievementCertificateProps) {
  const certificateRef = useRef<HTMLDivElement>(null)

  const handlePrint = () => {
    window.print()
  }

  const averageProficiency = Math.round(
    skills.reduce((acc, s) => acc + s.proficiency, 0) / (skills.length || 1)
  )

  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto p-4 animate-in zoom-in-95 duration-300">
      {/* Certificate Container */}
      <div 
        ref={certificateRef}
        className="relative bg-white text-slate-900 border-[16px] border-double border-amber-600 p-12 aspect-[1.414/1] shadow-2xl overflow-hidden print:border-[8px] print:shadow-none"
        style={{ backgroundImage: 'radial-gradient(circle, #fff9f0 0%, #ffffff 100%)' }}
      >
        {/* Decorative Background Elements */}
        <div className="absolute top-0 left-0 w-full h-full opacity-5 pointer-events-none" 
             style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/cubes.png")' }}></div>
        
        {/* Watermark Logo */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.03] rotate-[-25deg] pointer-events-none">
          <GraduationCap size={400} />
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col h-full items-center text-center">
          <div className="flex items-center gap-3 mb-8">
            <div className="bg-amber-600 p-2 rounded">
              <GraduationCap className="h-8 w-8 text-white" />
            </div>
            <span className="text-2xl font-serif font-bold tracking-widest uppercase">UniMentor Platform</span>
          </div>

          <h2 className="text-5xl font-serif font-black text-amber-700 mb-2 mt-4 tracking-tight">CERTIFICATE</h2>
          <h3 className="text-xl font-serif font-semibold text-slate-600 mb-10 tracking-[0.2em] uppercase underline decoration-amber-600/30 underline-offset-8">
            Of Achievement
          </h3>

          <p className="text-lg font-serif italic text-slate-500 mb-4">This is to certify that</p>
          
          <div className="mb-8">
             <h4 className="text-4xl font-serif font-bold border-b-2 border-slate-900 px-8 py-2 min-w-[300px]">
               {user.full_name}
             </h4>
          </div>

          <p className="text-lg font-serif leading-relaxed max-w-lg mb-8 text-slate-700">
            has successfully demonstrated deep technical proficiency and academic excellence through theized 
            <span className="font-bold"> AI-Based Adaptive Learning Path</span>, reaching an average competency level of 
            <span className="text-amber-700 font-bold ml-1">{averageProficiency}%</span>.
          </p>

          <div className="grid grid-cols-3 w-full mt-auto gap-8 items-end">
             <div className="flex flex-col items-center">
                <div className="w-full border-b border-slate-400 mb-2"></div>
                <span className="text-sm font-serif font-bold text-slate-500 uppercase tracking-tighter">Academic Board</span>
             </div>
             
             <div className="flex justify-center -mb-8">
                <img 
                  src="/unimentor_seal.png" 
                  alt="Official Seal" 
                  className="h-40 w-40 drop-shadow-xl"
                />
             </div>

             <div className="flex flex-col items-center">
                <div className="w-full border-b border-slate-400 mb-2"></div>
                <span className="text-sm font-serif font-bold text-slate-500 uppercase tracking-tighter">Verifiable ID: #UM-{user.id}-{Date.now().toString().slice(-6)}</span>
             </div>
          </div>
        </div>

        {/* Border corner accents */}
        <div className="absolute top-4 left-4 w-12 h-12 border-t-2 border-l-2 border-amber-600"></div>
        <div className="absolute top-4 right-4 w-12 h-12 border-t-2 border-r-2 border-amber-600"></div>
        <div className="absolute bottom-4 left-4 w-12 h-12 border-b-2 border-l-2 border-amber-600"></div>
        <div className="absolute bottom-4 right-4 w-12 h-12 border-b-2 border-r-2 border-amber-600"></div>
      </div>

      {/* Actions */}
      <div className="flex justify-center gap-4 print:hidden">
        <Button onClick={handlePrint} size="lg" className="gap-2">
          <Printer className="h-5 w-5" />
          Распечатать / PDF
        </Button>
        <Button variant="outline" onClick={onClose} size="lg">
          Закрыть
        </Button>
      </div>

      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .animate-in {
            animation: none !important;
          }
          div[ref="certificateRef"], div[ref="certificateRef"] * {
            visibility: visible;
          }
          div[ref="certificateRef"] {
            position: absolute;
            left: 0;
            top: 0;
            width: 100% !important;
            height: auto !important;
            border: 8px border-double border-amber-600 !important;
            margin: 0 !important;
            padding: 2rem !important;
          }
        }
      `}</style>
    </div>
  )
}
