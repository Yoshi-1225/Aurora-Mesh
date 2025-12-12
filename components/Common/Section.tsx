import React from 'react';
import { Icon } from './Icon';

interface SectionProps {
    title: string;
    icon: string;
    children: React.ReactNode;
}

export const Section: React.FC<SectionProps> = ({ title, icon, children }) => (
    <div>
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-2">
            <Icon name={icon} className="text-sm" /> {title}
        </h2>
        {children}
    </div>
);