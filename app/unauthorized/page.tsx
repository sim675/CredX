import Link from 'next/link';

export default function UnauthorizedPage() {
  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center', 
      height: '100vh', 
      fontFamily: 'sans-serif',
      textAlign: 'center' 
    }}>
      <h1 style={{ fontSize: '3rem', color: '#ff4d4d' }}>🚫 Access Denied</h1>
      <p style={{ fontSize: '1.2rem', color: '#555' }}>
        Your account role does not have permission to access this section.
      </p>
      
      <div style={{ marginTop: '30px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <Link 
          href="/auth/signin" 
          style={{ 
            backgroundColor: '#0070f3', 
            color: 'white', 
            padding: '10px 20px', 
            borderRadius: '5px', 
            textDecoration: 'none',
            fontWeight: 'bold'
          }}
        >
          Try Logging in with a different account
        </Link>
        
        <Link href="/" style={{ color: '#0070f3', textDecoration: 'underline' }}>
          Return to Home
        </Link>
      </div>
    </div>
  );
}