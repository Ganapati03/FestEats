import React from 'react';
import { VantaBackground } from './VantaBackground';

// Example props: menuItems is an array of objects with { name, imageUrl }
export function EndUserLayout({ menuItems, children }: { menuItems: { name: string, imageUrl?: string }[]; children?: React.ReactNode }) {
  // If menuItems is undefined or empty, show a message
  if (!menuItems || menuItems.length === 0) {
    return <div>No menu items available.</div>;
  }

  return (
    <div style={{ position: 'relative', minHeight: '100vh' }}>
      <VantaBackground />
      {menuItems.map((item, idx) => (
        <div key={idx} className="menu-item">
          <div>{item.name}</div>
          {item.imageUrl ? (
            <img src={item.imageUrl} alt={item.name} style={{ maxWidth: 200, maxHeight: 200 }} />
          ) : (
            <div>No image available</div>
          )}
        </div>
      ))}
      {/* Chatbot scrollable container */}
      <div
        style={{
          maxHeight: '400px',
          overflowY: 'auto',
          border: '1px solid #ccc',
          borderRadius: '8px',
          padding: '12px',
          marginTop: '24px',
          background: '#fff'
        }}
        className="chatbot-scrollbar"
      >
        {/* Chatbot messages scrollable area */}
        <div
          style={{
            maxHeight: '300px',
            overflowY: 'auto',
            padding: '8px',
            background: '#f9f9f9',
            borderRadius: '6px'
          }}
          className="chatbot-messages-scrollbar"
        >
          {children /* Render chatbot messages here */}
        </div>
      </div>
      {/* Footer */}
      <footer
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          width: '100%',
          background: '#ffa500',
          color: '#fff',
          textAlign: 'center',
          padding: '12px 0',
          fontWeight: 'bold',
          letterSpacing: '1px'
        }}
      >
        © 2024 FestEats. All rights reserved.
      </footer>
    </div>
  );
}
