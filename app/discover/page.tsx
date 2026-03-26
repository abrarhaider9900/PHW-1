import React from 'react';

export default function DiscoverPage() {
    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '60vh',
            textAlign: 'center',
            padding: '40px'
        }}>
            <h1 style={{
                fontFamily: 'Georgia, serif',
                fontSize: '48px',
                color: 'var(--color-primary)',
                marginBottom: '10px'
            }}>
                Discover
            </h1>
            <p style={{
                fontSize: '20px',
                color: '#666',
                fontWeight: '500'
            }}>
                Coming Soon
            </p>
            <div style={{
                marginTop: '30px',
                width: '60px',
                height: '4px',
                backgroundColor: 'var(--color-accent)'
            }}></div>
        </div>
    );
}
