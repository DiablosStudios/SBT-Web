import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { StaffSeat } from '../types';
import { ScrollReveal } from './ScrollReveal';
import { X, ArrowRight, CheckCircle2, ExternalLink } from 'lucide-react';
import { SteamIcon } from './SteamIcon';
import { RedditIcon } from './RedditIcon';

export const TeamSection: React.FC = () => {
  const { staffSeats, theme } = useStore();
  const [selectedMember, setSelectedMember] = useState<StaffSeat | null>(null);

  const isLight = theme === 'light';

  return (
    <section
      id="team-section"
      className={`py-24 border-b transition-colors ${
        isLight ? 'bg-white border-neutral-200' : 'bg-[#07080a] border-neutral-900'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        
        {/* Header */}
        <ScrollReveal>
          <div className="mb-14">
            <div className={`text-xs uppercase tracking-widest font-medium mb-2 ${
              isLight ? 'text-neutral-500' : 'text-neutral-400'
            }`}>
              Equipo de Desarrollo
            </div>
            <h2 className={`text-adaptive-h2 font-light tracking-tight ${
              isLight ? 'text-neutral-900' : 'text-white'
            }`}>
              Integrantes de SBT Studios
            </h2>
            <p className={`text-adaptive-lead mt-2 max-w-xl font-light ${
              isLight ? 'text-neutral-600' : 'text-neutral-300'
            }`}>
              Tres desarrolladores dedicados a modelado 3D, diseño de interfaz y sistemas de rol para Unturned. Haz clic en cualquiera de ellos para ver su historial o accede directamente a sus perfiles de Steam y Reddit.
            </p>
          </div>
        </ScrollReveal>

        {/* 3 Members Horizontal Layout */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {staffSeats.map((member, idx) => (
            <ScrollReveal key={member.id} delay={idx * 100}>
              <div
                onClick={() => setSelectedMember(member)}
                className={`group cursor-pointer border-t pt-6 flex flex-col justify-between transition-colors h-full ${
                  isLight ? 'border-neutral-200 hover:border-neutral-400' : 'border-neutral-800 hover:border-neutral-600'
                }`}
              >
                <div>
                  <div className="flex items-center gap-4 mb-4">
                    <img
                      src={member.avatar}
                      alt={member.name}
                      className="w-14 h-14 rounded-xl object-contain bg-black/20 border border-neutral-700/50 shadow-sm transition-all duration-300 group-hover:scale-105"
                    />
                    <div>
                      <h3 className={`text-lg font-medium transition-colors ${
                        isLight ? 'text-neutral-900 group-hover:text-black' : 'text-white group-hover:text-neutral-200'
                      }`}>
                        {member.name}
                      </h3>
                      <div className={`text-xs ${isLight ? 'text-neutral-500' : 'text-neutral-400'}`}>
                        {member.role}
                      </div>
                    </div>
                  </div>

                  <p className={`text-adaptive-body leading-relaxed font-light mb-5 ${
                    isLight ? 'text-neutral-600' : 'text-neutral-400'
                  }`}>
                    {member.bio}
                  </p>

                  {/* Steam & Reddit Quick Action Buttons */}
                  <div className="flex items-center gap-2 mb-5">
                    {member.steamUrl && (
                      <a
                        href={member.steamUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className={`px-2.5 py-1.5 rounded text-xs flex items-center gap-1.5 transition-colors cursor-pointer border ${
                          isLight
                            ? 'bg-neutral-100 hover:bg-neutral-200 border-neutral-300 text-neutral-800'
                            : 'bg-[#14151b] hover:bg-[#1f212a] border-neutral-800 text-neutral-300 hover:text-white'
                        }`}
                        title={`Ver perfil de Steam de ${member.name} (${member.steamUsername})`}
                      >
                        <SteamIcon className="w-3.5 h-3.5 fill-current" />
                        <span>Steam</span>
                        <ExternalLink className="w-2.5 h-2.5 opacity-60" />
                      </a>
                    )}

                    {member.redditUrl && (
                      <a
                        href={member.redditUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className={`px-2.5 py-1.5 rounded text-xs flex items-center gap-1.5 transition-colors cursor-pointer border ${
                          isLight
                            ? 'bg-orange-50 hover:bg-orange-100 border-orange-200 text-orange-700'
                            : 'bg-[#ff4500]/10 hover:bg-[#ff4500]/20 border-[#ff4500]/30 text-orange-400 hover:text-orange-300'
                        }`}
                        title={`Ver perfil de Reddit de ${member.name} (${member.redditUsername})`}
                      >
                        <RedditIcon className="w-3.5 h-3.5 fill-current" />
                        <span>Reddit</span>
                        <ExternalLink className="w-2.5 h-2.5 opacity-60" />
                      </a>
                    )}
                  </div>

                  {member.works && member.works.length > 0 && (
                    <div className="space-y-1 mb-6 text-xs">
                      <span className={`text-[11px] uppercase tracking-wider block mb-1 font-medium ${
                        isLight ? 'text-neutral-400' : 'text-neutral-500'
                      }`}>
                        Proyectos destacados:
                      </span>
                      {member.works.slice(0, 2).map(w => (
                        <div key={w.id} className={isLight ? 'text-neutral-700' : 'text-neutral-300'}>
                          • {w.title}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className={`pt-3 border-t flex items-center justify-between text-xs transition-colors ${
                  isLight
                    ? 'border-neutral-200 text-neutral-500 group-hover:text-black'
                    : 'border-neutral-800 text-neutral-400 group-hover:text-white'
                }`}>
                  <span>Ver historial de trabajos</span>
                  <ArrowRight className="w-3.5 h-3.5 transform group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>

      </div>

      {/* MODAL: INTEGRANTE Y TRABAJOS */}
      {selectedMember && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-sm"
          onClick={() => setSelectedMember(null)}
        >
          <div
            className={`relative w-full max-w-2xl border rounded-lg shadow-2xl overflow-hidden my-6 max-h-[88vh] flex flex-col transition-colors ${
              isLight ? 'bg-white border-neutral-200' : 'bg-[#0f1014] border-neutral-800'
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className={`p-6 border-b flex items-center justify-between ${
              isLight ? 'bg-neutral-50 border-neutral-200' : 'bg-[#0a0b0e] border-neutral-800'
            }`}>
              <div className="flex items-center gap-4">
                <img
                  src={selectedMember.avatar}
                  alt={selectedMember.name}
                  className="w-12 h-12 rounded-xl object-contain bg-black/20 border border-neutral-700/50 shadow-sm"
                />
                <div>
                  <h3 className={`text-lg font-medium ${isLight ? 'text-neutral-900' : 'text-white'}`}>
                    {selectedMember.name}
                  </h3>
                  <div className={`text-xs ${isLight ? 'text-neutral-500' : 'text-neutral-400'}`}>
                    {selectedMember.role}
                  </div>
                </div>
              </div>

              <button
                onClick={() => setSelectedMember(null)}
                className={`p-1 transition-colors cursor-pointer ${
                  isLight ? 'text-neutral-400 hover:text-black' : 'text-neutral-400 hover:text-white'
                }`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto space-y-6">
              
              <div className={`text-xs leading-relaxed font-light ${
                isLight ? 'text-neutral-700' : 'text-neutral-300'
              }`}>
                {selectedMember.bio}
              </div>

              {/* Community Profiles Section: Steam & Reddit */}
              <div className={`p-4 rounded-lg border space-y-3 ${
                isLight ? 'bg-neutral-50 border-neutral-200' : 'bg-[#14151b] border-neutral-800'
              }`}>
                <div className={`text-[11px] uppercase tracking-wider font-medium ${
                  isLight ? 'text-neutral-500' : 'text-neutral-400'
                }`}>
                  Perfiles Comunitarios de {selectedMember.name}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {selectedMember.steamUrl && (
                    <a
                      href={selectedMember.steamUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`p-3 rounded-lg border flex items-center justify-between transition-colors ${
                        isLight
                          ? 'bg-white hover:bg-neutral-100 border-neutral-200 text-neutral-900'
                          : 'bg-[#1a1b24] hover:bg-[#232431] border-neutral-700 text-white'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <SteamIcon className="w-5 h-5 fill-current" />
                        <div>
                          <div className="text-xs font-semibold">Steam Community</div>
                          <div className={`text-[10px] ${isLight ? 'text-neutral-500' : 'text-neutral-400'}`}>
                            {selectedMember.steamUsername}
                          </div>
                        </div>
                      </div>
                      <ExternalLink className="w-3.5 h-3.5 opacity-60" />
                    </a>
                  )}

                  {selectedMember.redditUrl && (
                    <a
                      href={selectedMember.redditUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`p-3 rounded-lg border flex items-center justify-between transition-colors ${
                        isLight
                          ? 'bg-white hover:bg-orange-50 border-neutral-200 text-orange-600'
                          : 'bg-[#1a1b24] hover:bg-[#ff4500]/20 border-neutral-700 text-orange-400'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <RedditIcon className="w-5 h-5 fill-current" />
                        <div>
                          <div className="text-xs font-semibold">Reddit Profile</div>
                          <div className={`text-[10px] ${isLight ? 'text-neutral-500' : 'text-neutral-400'}`}>
                            {selectedMember.redditUsername}
                          </div>
                        </div>
                      </div>
                      <ExternalLink className="w-3.5 h-3.5 opacity-60" />
                    </a>
                  )}
                </div>
              </div>

              {/* Works List */}
              <div className="space-y-4">
                <div className={`text-xs uppercase tracking-widest border-b pb-2 font-medium ${
                  isLight ? 'text-neutral-500 border-neutral-200' : 'text-neutral-500 border-neutral-800'
                }`}>
                  Trabajos realizados o involucrados ({selectedMember.works?.length || 0})
                </div>

                {selectedMember.works?.map(work => (
                  <div
                    key={work.id}
                    className={`p-4 border rounded-lg flex flex-col sm:flex-row gap-4 transition-colors ${
                      isLight
                        ? 'bg-neutral-50 border-neutral-200'
                        : 'bg-[#14151a] border-neutral-800'
                    }`}
                  >
                    <img
                      src={work.image}
                      alt={work.title}
                      className={`w-full sm:w-36 h-24 object-cover rounded shrink-0 border ${
                        isLight ? 'border-neutral-200' : 'border-neutral-800'
                      }`}
                    />

                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-baseline mb-1">
                          <h4 className={`text-sm font-medium ${isLight ? 'text-neutral-900' : 'text-white'}`}>
                            {work.title}
                          </h4>
                          <span className={`text-[10px] ${isLight ? 'text-neutral-400' : 'text-neutral-500'}`}>
                            {work.year}
                          </span>
                        </div>
                        <div className={`text-[11px] mb-1.5 ${isLight ? 'text-neutral-500' : 'text-neutral-400'}`}>
                          {work.role} · {work.category}
                        </div>
                        <p className={`text-xs leading-relaxed font-light ${
                          isLight ? 'text-neutral-600' : 'text-neutral-400'
                        }`}>
                          {work.description}
                        </p>
                      </div>

                      <div className={`mt-2 pt-2 border-t flex items-center gap-1.5 text-[10px] ${
                        isLight ? 'border-neutral-200 text-neutral-500' : 'border-neutral-800/80 text-neutral-500'
                      }`}>
                        <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                        <span>Verificado en Unturned</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

            </div>

            <div className={`p-4 border-t flex justify-end ${
              isLight ? 'bg-neutral-50 border-neutral-200' : 'bg-[#0a0b0e] border-neutral-800'
            }`}>
              <button
                onClick={() => setSelectedMember(null)}
                className={`px-4 py-1.5 text-xs rounded transition-colors cursor-pointer ${
                  isLight
                    ? 'bg-neutral-200 hover:bg-neutral-300 text-neutral-900'
                    : 'bg-neutral-800 hover:bg-neutral-700 text-white'
                }`}
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

    </section>
  );
};
