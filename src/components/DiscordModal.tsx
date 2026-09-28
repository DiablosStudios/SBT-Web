import React, { useState } from 'react';
import { X, Check, Copy, ExternalLink, Users, Shield, MessageSquare } from 'lucide-react';
import { DiscordIcon } from './DiscordIcon';

interface DiscordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DiscordModal: React.FC<DiscordModalProps> = ({ isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const discordUrl = 'https://discord.gg/rJQae9XzrP';

  const handleCopy = () => {
    navigator.clipboard.writeText(discordUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-[#0f1015] border border-neutral-800 rounded-xl shadow-2xl overflow-hidden text-neutral-200">
        
        {/* Banner with Discord Accent */}
        <div className="h-24 bg-gradient-to-r from-[#5865F2]/40 via-[#4752c4]/30 to-[#0f1015] p-4 flex justify-between items-start">
          <div className="p-2.5 bg-[#5865F2] text-white rounded-xl shadow-lg mt-2">
            <DiscordIcon className="w-8 h-8 fill-white" />
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-white bg-black/40 hover:bg-black/60 rounded-full transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 pt-2 space-y-5">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-lg font-semibold text-white">
                SBT Studios Official Discord
              </h3>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            </div>
            <p className="text-xs text-neutral-400 leading-relaxed font-light">
              Comunidad y servidor oficial de soporte técnico para Unturned 3.0. Contacta directamente con los 3 integrantes del equipo para asistencia técnica, consultas previas a la compra y whitelist de tu servidor.
            </p>
          </div>

          {/* Discord Server Channels Preview */}
          <div className="p-3 bg-[#14151b] border border-neutral-850 rounded-lg text-xs space-y-2 text-neutral-300">
            <div className="flex items-center justify-between text-neutral-400 text-[11px] pb-1 border-b border-neutral-800">
              <span className="flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-neutral-400" />
                <span>3 Integrantes en línea</span>
              </span>
              <span className="text-emerald-400 font-medium">Soporte 24/7</span>
            </div>
            <div className="flex items-center gap-2 text-neutral-300 text-xs">
              <span className="text-neutral-500 font-mono">#</span>
              <span>soporte-assets-unturned</span>
            </div>
            <div className="flex items-center gap-2 text-neutral-300 text-xs">
              <span className="text-neutral-500 font-mono">#</span>
              <span>whitelist-servidores-rp</span>
            </div>
            <div className="flex items-center gap-2 text-neutral-300 text-xs">
              <span className="text-neutral-500 font-mono">#</span>
              <span>actualizaciones-furniture</span>
            </div>
          </div>

          {/* Invitation Link Box */}
          <div className="space-y-1.5">
            <label className="text-[11px] text-neutral-400 uppercase tracking-wider">
              Enlace de invitación permanente:
            </label>
            <div className="flex items-center gap-2">
              <div className="flex-1 p-2 bg-[#121319] border border-neutral-800 rounded font-mono text-xs text-neutral-300 select-all overflow-hidden text-ellipsis">
                {discordUrl}
              </div>
              <button
                onClick={handleCopy}
                className="px-3 py-2 bg-neutral-800 hover:bg-neutral-700 text-white text-xs rounded transition-colors flex items-center gap-1.5 cursor-pointer shrink-0"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copiado' : 'Copiar'}</span>
              </button>
            </div>
          </div>

          {/* Direct Join Button */}
          <div className="pt-2 flex gap-3">
            <a
              href={discordUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 py-3 bg-[#5865F2] hover:bg-[#4752c4] text-white text-xs font-semibold uppercase tracking-wider rounded-lg transition-colors flex items-center justify-center gap-2 shadow-lg cursor-pointer"
            >
              <DiscordIcon className="w-4 h-4 fill-white" />
              <span>Unirse al Discord Oficial</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

        </div>

      </div>
    </div>
  );
};
