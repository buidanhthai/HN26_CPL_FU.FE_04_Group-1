import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

const Dashboard: React.FC = () => {
  const auth = useContext(AuthContext);

  if (!auth) return null;

  const { user } = auth;

  return (
    <div>
      <h1 style={{ fontSize: '1.8rem', margin: '0 0 10px 0', color: '#00e1d9' }}>Dashboard</h1>
      <p style={{ color: '#a2a5b9', margin: '0 0 24px 0' }}>Welcome back to your workspace.</p>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '20px',
        marginBottom: '30px'
      }}>
        {/* Card 1 */}
        <div style={{
          backgroundColor: '#151521',
          padding: '24px',
          borderRadius: '8px',
          border: '1px solid #2d2d3f',
          boxShadow: '0 4px 6px rgba(0,0,0,0.15)'
        }}>
          <h3 style={{ margin: '0 0 8px 0', color: '#a2a5b9', fontSize: '0.9rem', textTransform: 'uppercase' }}>Current Session</h3>
          <p style={{ margin: '0', fontSize: '1.4rem', fontWeight: 'bold' }}>Active</p>
          <div style={{ marginTop: '12px', fontSize: '0.85rem', color: '#00e1d9' }}>
            Logged in as: {user?.username} ({user?.role})
          </div>
        </div>

        {/* Card 2 */}
        <div style={{
          backgroundColor: '#151521',
          padding: '24px',
          borderRadius: '8px',
          border: '1px solid #2d2d3f',
          boxShadow: '0 4px 6px rgba(0,0,0,0.15)'
        }}>
          <h3 style={{ margin: '0 0 8px 0', color: '#a2a5b9', fontSize: '0.9rem', textTransform: 'uppercase' }}>Bookings Status</h3>
          <p style={{ margin: '0', fontSize: '1.4rem', fontWeight: 'bold' }}>5 Pending</p>
          <div style={{ marginTop: '12px', fontSize: '0.85rem', color: '#a2a5b9' }}>
            Next appointment: Tomorrow at 10:00 AM
          </div>
        </div>

        {/* Card 3 */}
        <div style={{
          backgroundColor: '#151521',
          padding: '24px',
          borderRadius: '8px',
          border: '1px solid #2d2d3f',
          boxShadow: '0 4px 6px rgba(0,0,0,0.15)'
        }}>
          <h3 style={{ margin: '0 0 8px 0', color: '#a2a5b9', fontSize: '0.9rem', textTransform: 'uppercase' }}>Task Progress</h3>
          <p style={{ margin: '0', fontSize: '1.4rem', fontWeight: 'bold' }}>80% Done</p>
          <div style={{ marginTop: '12px', fontSize: '0.85rem', color: '#00e1d9' }}>
            4 tasks completed today
          </div>
        </div>
      </div>

      <div style={{
        backgroundColor: '#151521',
        padding: '24px',
        borderRadius: '8px',
        border: '1px solid #2d2d3f',
        boxShadow: '0 4px 6px rgba(0,0,0,0.15)'
      }}>
        <h2 style={{ fontSize: '1.2rem', margin: '0 0 12px 0', color: '#00e1d9' }}>Project Information</h2>
        <p style={{ margin: '0 0 12px 0', color: '#d1d2db', fontSize: '0.95rem', lineHeight: '1.6' }}>
          This boilerplate layout integrates a Vite-based React 19 Frontend with a .NET 10.0 Web API Backend. The project supports TypeScript definitions, shared route configurations, CORS setups, and basic relational mapping schemas.
        </p>
        <p style={{ margin: '0', color: '#a2a5b9', fontSize: '0.85rem' }}>
          Navigate to <strong>Bookings</strong> or <strong>Tasks</strong> via the sidebar to view mock implementations of services and state mapping.
        </p>
      </div>
    </div>
  );
};

export default Dashboard;
