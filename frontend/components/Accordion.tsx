"use client";

import React, { useState, ReactNode } from "react";

interface AccordionSection {
  id: string;
  title: string;
  children: ReactNode;
}

interface AccordionProps {
  sections: AccordionSection[];
  defaultOpen?: string;
}

export default function Accordion({ sections, defaultOpen }: AccordionProps) {
  const [openSection, setOpenSection] = useState<string | null>(
    defaultOpen || sections[0]?.id,
  );

  return (
    <div className="space-y-3">
      {sections.map((section) => (
        <div
          key={section.id}
          className="border border-slate-700 rounded-lg overflow-hidden"
        >
          <button
            onClick={() =>
              setOpenSection(openSection === section.id ? null : section.id)
            }
            className="w-full px-4 py-3 bg-slate-800 hover:bg-slate-700 text-text-primary font-medium flex justify-between items-center transition-colors"
          >
            <span>{section.title}</span>
            <svg
              className={`w-5 h-5 transition-transform ${
                openSection === section.id ? "rotate-180" : ""
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 14l-7 7m0 0l-7-7m7 7V3"
              />
            </svg>
          </button>
          {openSection === section.id && (
            <div className="px-4 py-4 bg-gradient-card border-t border-slate-700">
              {section.children}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
