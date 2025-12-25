import React from 'react';
import { ListPlus, MessagesSquare, Handshake } from 'lucide-react';

const steps = [
  {
    icon: <ListPlus size={28} />,
    title: 'List Your Item',
    description: 'Snap a few photos, add a description, and set your price. Our AI can help you write a great title.'
  },
  {
    icon: <MessagesSquare size={28} />,
    title: 'Chat Securely',
    description: 'Communicate with potential buyers directly through our secure, real-time messaging system.'
  },
  {
    icon: <Handshake size={28} />,
    title: 'Meet & Sell',
    description: 'Arrange a safe meetup on campus to exchange your item for cash. Simple, fast, and secure.'
  }
];

export default function HowItWorks() {
  return (
    <div className="px-4 mt-24">
      <div className="text-center mb-12">
        <h2 className="text-4xl font-extrabold text-white tracking-tight">
          How It Works
        </h2>
        <p className="text-slate-400 mt-2">Selling your stuff is as easy as 1, 2, 3.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {steps.map((step, index) => (
          <div key={index} className="glass-card p-8 border-white/5 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 mb-6 rounded-full bg-blue-600/10 border border-blue-500/20 text-blue-400">
              {step.icon}
            </div>
            <h3 className="text-xl font-bold text-white mb-2">{step.title}</h3>
            <p className="text-slate-400 text-sm">{step.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}