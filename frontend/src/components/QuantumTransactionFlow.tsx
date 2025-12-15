import React, { useState, useEffect } from 'react';
import { Check, Lock, Zap, Shield, AlertCircle } from 'lucide-react';

interface QuantumTransactionFlowProps {
  isOpen: boolean;
  currentStep: 'idle' | 'initializing' | 'generating' | 'signing' | 'securing' | 'complete' | 'error';
  errorMessage?: string;
  onClose?: () => void;
}

export const QuantumTransactionFlow: React.FC<QuantumTransactionFlowProps> = ({
  isOpen,
  currentStep,
  errorMessage,
  onClose,
}) => {
  const [displayedSteps, setDisplayedSteps] = useState<string[]>([]);

  const steps = [
    { id: 'initializing', label: 'Initializing Transaction', icon: Zap },
    { id: 'generating', label: 'Generating Quantum Keys', icon: Lock },
    { id: 'signing', label: 'Signing with SPHINCS+', icon: Shield },
    { id: 'securing', label: 'Ensuring Quantum Security', icon: Check },
    { id: 'complete', label: 'Transaction Complete', icon: Check },
  ];

  useEffect(() => {
    if (currentStep !== 'idle' && currentStep !== 'error') {
      const stepIndex = steps.findIndex((s) => s.id === currentStep);
      setDisplayedSteps(steps.slice(0, stepIndex + 1).map((s) => s.id));
    }
  }, [currentStep]);

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9998,
        backdropFilter: 'blur(4px)',
      }}
    >
      <div
        style={{
          backgroundColor: '#1e293b',
          borderRadius: '16px',
          padding: '3rem',
          maxWidth: '500px',
          width: '90%',
          border: '1px solid #334155',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)',
        }}
      >
        {currentStep === 'error' ? (
          <div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '60px',
                height: '60px',
                backgroundColor: '#7f1d1d',
                borderRadius: '50%',
                margin: '0 auto 1.5rem',
              }}
            >
              <AlertCircle style={{ width: '32px', height: '32px', color: '#fca5a5' }} />
            </div>
            <h3 style={{ color: '#ffffff', marginBottom: '1rem', textAlign: 'center', fontSize: '1.25rem', fontWeight: '600' }}>
              Transaction Failed
            </h3>
            <p style={{ color: '#94a3b8', marginBottom: '1.5rem', textAlign: 'center' }}>
              {errorMessage || 'An error occurred during the quantum transaction process.'}
            </p>
            <button
              onClick={onClose}
              style={{
                width: '100%',
                padding: '0.75rem',
                backgroundColor: '#6366f1',
                color: '#ffffff',
                border: 'none',
                borderRadius: '8px',
                fontSize: '1rem',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'background-color 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#4f46e5';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#6366f1';
              }}
            >
              Dismiss
            </button>
          </div>
        ) : (
          <div>
            <h2
              style={{
                color: '#ffffff',
                marginBottom: '2rem',
                textAlign: 'center',
                fontSize: '1.5rem',
                fontWeight: '700',
              }}
            >
              Quantum Secure Transaction
            </h2>

            <div>
              {steps.map((step, index) => {
                const isCompleted = displayedSteps.includes(step.id) && currentStep !== step.id;
                const isActive = currentStep === step.id;
                const Icon = step.icon;

                return (
                  <div key={step.id} style={{ marginBottom: '1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          width: '44px',
                          height: '44px',
                          borderRadius: '50%',
                          backgroundColor: isCompleted
                            ? '#10b981'
                            : isActive
                              ? '#6366f1'
                              : '#334155',
                          border: isActive ? '2px solid #818cf8' : 'none',
                          flexShrink: 0,
                        }}
                      >
                        {isCompleted ? (
                          <Check style={{ width: '24px', height: '24px', color: '#ffffff' }} />
                        ) : (
                          <Icon
                            style={{
                              width: '24px',
                              height: '24px',
                              color: isActive ? '#ffffff' : '#64748b',
                              animation: isActive ? 'spin 1s linear infinite' : 'none',
                            }}
                          />
                        )}
                      </div>

                      <div style={{ flex: 1, paddingTop: '0.25rem' }}>
                        <p
                          style={{
                            color: isCompleted || isActive ? '#ffffff' : '#94a3b8',
                            fontWeight: isActive ? '600' : '500',
                            fontSize: '0.95rem',
                            margin: 0,
                          }}
                        >
                          {step.label}
                        </p>
                        {isActive && (
                          <p
                            style={{
                              color: '#6366f1',
                              fontSize: '0.85rem',
                              marginTop: '0.25rem',
                              animation: 'pulse 1.5s ease-in-out infinite',
                            }}
                          >
                            Processing...
                          </p>
                        )}
                      </div>

                      {isCompleted && (
                        <div
                          style={{
                            color: '#10b981',
                            fontSize: '0.9rem',
                            paddingTop: '0.25rem',
                          }}
                        >
                          ✓
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {currentStep === 'complete' && (
              <div
                style={{
                  marginTop: '2rem',
                  padding: '1rem',
                  backgroundColor: 'rgba(16, 185, 129, 0.1)',
                  borderRadius: '8px',
                  border: '1px solid #10b981',
                }}
              >
                <p
                  style={{
                    color: '#10b981',
                    textAlign: 'center',
                    fontSize: '0.95rem',
                    margin: 0,
                  }}
                >
                  Transaction secured with quantum-resistant technology.
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      <style>{`
        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }
      `}</style>
    </div>
  );
};
