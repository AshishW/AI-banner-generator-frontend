import React from 'react';

const LandingPage = () => {
  const containerStyle = {
    minHeight: '100vh',
    backgroundColor: '#1a202c',
    color: '#e2e8f0',
    fontFamily: 'Arial, sans-serif',
  };

  const headerStyle = {
    backgroundColor: '#2d3748',
    padding: '1rem',
    textAlign: 'center',
  };

  const mainStyle = {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '2rem 1rem',
  };

  const sectionStyle = {
    marginBottom: '3rem',
  };

  const buttonStyle = {
    backgroundColor: '#805ad5',
    color: 'white',
    padding: '0.75rem 1.5rem',
    borderRadius: '0.25rem',
    textDecoration: 'none',
    display: 'inline-block',
    marginTop: '1rem',
  };

  return (
    <div style={containerStyle}>
      <header style={headerStyle}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold' }}>AI-Powered Dynamic Banner Generator</h1>
      </header>
      <main style={mainStyle}>
        <section style={sectionStyle}>
          <h2 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Revolutionize Your Promotional Content Creation</h2>
          <p>Our AI solution transforms the way you create promotional banners and videos. Say goodbye to time-consuming design processes and hello to instant, high-quality content tailored to your brand.</p>
          <a href="#" style={buttonStyle}>Get Started</a>
        </section>
        <section style={sectionStyle}>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Key Features</h2>
          <ul style={{ listStyleType: 'none', padding: 0 }}>
            <li style={{ marginBottom: '0.5rem' }}>✨ Creative: Produce visually appealing and engaging content</li>
            <li style={{ marginBottom: '0.5rem' }}>🔄 Flexible: Adapt to various themes and promotional offers</li>
            <li style={{ marginBottom: '0.5rem' }}>⚡ Efficient: Generate content quickly and at scale</li>
            <li style={{ marginBottom: '0.5rem' }}>👥 User-Friendly: Easy to use, even for non-designers</li>
          </ul>
        </section>
        <section style={sectionStyle}>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>How It Works</h2>
          <ol style={{ paddingLeft: '1.5rem' }}>
            <li style={{ marginBottom: '0.5rem' }}>Upload your product images</li>
            <li style={{ marginBottom: '0.5rem' }}>Enter your promotional offer details</li>
            <li style={{ marginBottom: '0.5rem' }}>Choose your brand's color palette</li>
            <li style={{ marginBottom: '0.5rem' }}>Select a theme (e.g., seasonal, event-based)</li>
            <li style={{ marginBottom: '0.5rem' }}>Specify your desired output (banner or video)</li>
            <li style={{ marginBottom: '0.5rem' }}>Let our AI work its magic!</li>
          </ol>
          <a href="#" style={buttonStyle}>Try It Now</a>
        </section>
      </main>
    </div>
  );
};

export default LandingPage;