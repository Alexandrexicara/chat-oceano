import { theme } from '../styles/theme'

// Componente de decorações piratas animadas
export function AuthDecorations() {
  return (
    <>
      {/* CSS Animations */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        @keyframes floatBoat {
          0%, 100% { 
            transform: translateY(0px) rotate(-2deg);
          }
          50% { 
            transform: translateY(-30px) rotate(2deg);
          }
        }
        @keyframes wave {
          0%, 100% { transform: translateX(0px); }
          50% { transform: translateX(15px); }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.1); opacity: 0.8; }
        }
        @keyframes shimmer {
          0% { opacity: 0.3; }
          50% { opacity: 1; }
          100% { opacity: 0.3; }
        }
        .pirate-decoration {
          position: fixed;
          pointer-events: none;
          z-index: 0;
        }
      `}</style>

      {/* Barco Pirata - Topo esquerdo */}
      <div 
        className="pirate-decoration"
        style={{
          top: '10%',
          left: '5%',
          fontSize: '80px',
          animation: 'floatBoat 6s ease-in-out infinite',
          filter: 'drop-shadow(0 8px 16px rgba(0,0,0,0.4))',
        }}
      >
        🏴‍☠️
      </div>

      {/* Barco Pirata - Inferior direito */}
      <div 
        className="pirate-decoration"
        style={{
          bottom: '15%',
          right: '8%',
          fontSize: '100px',
          animation: 'floatBoat 8s ease-in-out infinite',
          animationDelay: '1s',
          filter: 'drop-shadow(0 8px 16px rgba(0,0,0,0.4))',
          transform: 'scaleX(-1)', // Espelhar
        }}
      >
        ⛵
      </div>

      {/* Onda - Topo direito */}
      <div 
        className="pirate-decoration"
        style={{
          top: '8%',
          right: '10%',
          fontSize: '60px',
          animation: 'wave 4s ease-in-out infinite',
          filter: 'drop-shadow(0 4px 8px rgba(0,102,204,0.4))',
        }}
      >
        🌊
      </div>

      {/* Onda - Inferior esquerdo */}
      <div 
        className="pirate-decoration"
        style={{
          bottom: '10%',
          left: '8%',
          fontSize: '50px',
          animation: 'wave 5s ease-in-out infinite',
          animationDelay: '2s',
          filter: 'drop-shadow(0 4px 8px rgba(0,102,204,0.4))',
        }}
      >
        🌊
      </div>

      {/* Garrafa flutuante - Esquerda */}
      <div 
        className="pirate-decoration"
        style={{
          top: '30%',
          left: '3%',
          fontSize: '50px',
          animation: 'float 7s ease-in-out infinite',
          animationDelay: '0.5s',
          filter: 'drop-shadow(0 4px 8px rgba(74,222,128,0.4))',
        }}
      >
        🍾
      </div>

      {/* Barril flutuante - Direita */}
      <div 
        className="pirate-decoration"
        style={{
          top: '25%',
          right: '5%',
          fontSize: '45px',
          animation: 'float 6s ease-in-out infinite',
          animationDelay: '1.5s',
          filter: 'drop-shadow(0 4px 8px rgba(160,120,44,0.4))',
        }}
      >
        🛢️
      </div>

      {/* Âncora - Canto inferior esquerdo */}
      <div 
        className="pirate-decoration"
        style={{
          bottom: '25%',
          left: '12%',
          fontSize: '40px',
          animation: 'pulse 4s ease-in-out infinite',
          filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.3))',
        }}
      >
        ⚓
      </div>

      {/* Bússola - Canto superior direito */}
      <div 
        className="pirate-decoration"
        style={{
          top: '20%',
          right: '15%',
          fontSize: '35px',
          animation: 'spin 20s linear infinite',
          filter: 'drop-shadow(0 4px 8px rgba(255,215,0,0.4))',
        }}
      >
        🧭
      </div>

      {/* Moedas CDCOIN - Espalhadas */}
      <div 
        className="pirate-decoration"
        style={{
          top: '15%',
          left: '20%',
          fontSize: '30px',
          animation: 'shimmer 3s ease-in-out infinite',
          filter: 'drop-shadow(0 4px 8px rgba(255,215,0,0.5))',
        }}
      >
        🪙
      </div>

      <div 
        className="pirate-decoration"
        style={{
          top: '40%',
          right: '20%',
          fontSize: '25px',
          animation: 'shimmer 4s ease-in-out infinite',
          animationDelay: '1s',
          filter: 'drop-shadow(0 4px 8px rgba(255,215,0,0.5))',
        }}
      >
        🪙
      </div>

      <div 
        className="pirate-decoration"
        style={{
          bottom: '30%',
          right: '25%',
          fontSize: '28px',
          animation: 'shimmer 3.5s ease-in-out infinite',
          animationDelay: '2s',
          filter: 'drop-shadow(0 4px 8px rgba(255,215,0,0.5))',
        }}
      >
        🪙
      </div>

      {/* Peixe - Inferior */}
      <div 
        className="pirate-decoration"
        style={{
          bottom: '35%',
          left: '15%',
          fontSize: '35px',
          animation: 'wave 6s ease-in-out infinite',
          filter: 'drop-shadow(0 4px 8px rgba(0,102,204,0.3))',
        }}
      >
        🐠
      </div>

      {/* Polvo - Direita */}
      <div 
        className="pirate-decoration"
        style={{
          bottom: '40%',
          right: '12%',
          fontSize: '40px',
          animation: 'float 8s ease-in-out infinite',
          animationDelay: '3s',
          filter: 'drop-shadow(0 4px 8px rgba(139,105,20,0.3))',
        }}
      >
        🐙
      </div>

      {/* Estrela do mar - Superior */}
      <div 
        className="pirate-decoration"
        style={{
          top: '35%',
          left: '18%',
          fontSize: '25px',
          animation: 'pulse 5s ease-in-out infinite',
          filter: 'drop-shadow(0 4px 8px rgba(255,165,0,0.4))',
        }}
      >
        ⭐
      </div>
    </>
  )
}
