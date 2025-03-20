import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React, { ReactNode, useState } from 'react';

// Mock MFA service
const mockMFAService = {
  setupMFA: vi.fn(),
  enableMFA: vi.fn(),
  disableMFA: vi.fn(),
  verifyMFACode: vi.fn(),
};

// MFA Setup Component
interface MFASetupProps {
  userId: string;
  onSetupComplete: (success: boolean) => void;
}

const MFASetup: React.FC<MFASetupProps> = ({ userId, onSetupComplete }) => {
  const [qrCodeUri, setQrCodeUri] = useState<string | null>(null);
  const [secret, setSecret] = useState<string | null>(null);
  const [recoveryCodes, setRecoveryCodes] = useState<string[]>([]);
  const [verificationCode, setVerificationCode] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<'setup' | 'verify' | 'complete'>('setup');
  
  const handleSetup = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await mockMFAService.setupMFA(userId);
      setQrCodeUri(result.qrCodeUri);
      setSecret(result.secret);
      setRecoveryCodes(result.recoveryCodes);
      setStep('verify');
    } catch (err: any) {
      setError(err.message || 'Failed to setup MFA');
    } finally {
      setLoading(false);
    }
  };
  
  const handleVerify = async () => {
    if (!verificationCode) {
      setError('Verification code is required');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      await mockMFAService.enableMFA(userId, verificationCode);
      setStep('complete');
      onSetupComplete(true);
    } catch (err: any) {
      setError(err.message || 'Failed to verify MFA code');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div>
      {loading && <div data-testid="loading">Loading...</div>}
      {error && <div data-testid="error">{error}</div>}
      
      {step === 'setup' && (
        <div>
          <h2 data-testid="setup-title">Set up Two-Factor Authentication</h2>
          <p>Enhance your account security with 2FA</p>
          <button data-testid="setup-button" onClick={handleSetup}>
            Set up 2FA
          </button>
        </div>
      )}
      
      {step === 'verify' && (
        <div>
          <h2 data-testid="verify-title">Verify Your Device</h2>
          {qrCodeUri && (
            <div data-testid="qr-code">
              <p>Scan this QR code with your authenticator app</p>
              <img src={qrCodeUri} alt="QR Code" />
            </div>
          )}
          
          {secret && (
            <div data-testid="secret-key">
              <p>Or enter this secret key manually:</p>
              <code>{secret}</code>
            </div>
          )}
          
          <div>
            <label htmlFor="verification-code">Enter verification code:</label>
            <input
              id="verification-code"
              data-testid="verification-code-input"
              type="text"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value)}
              placeholder="Enter 6-digit code"
            />
            <button data-testid="verify-button" onClick={handleVerify}>
              Verify
            </button>
          </div>
          
          {recoveryCodes.length > 0 && (
            <div data-testid="recovery-codes">
              <h3>Recovery Codes</h3>
              <p>Save these recovery codes in a safe place. You can use them to access your account if you lose your device.</p>
              <ul>
                {recoveryCodes.map((code, index) => (
                  <li key={index}>{code}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
      
      {step === 'complete' && (
        <div data-testid="setup-complete">
          <h2>Two-Factor Authentication Enabled</h2>
          <p>Your account is now protected with 2FA</p>
        </div>
      )}
    </div>
  );
};

// MFA Login Component
interface MFALoginProps {
  userId: string;
  onLoginComplete: (success: boolean) => void;
}

const MFALogin: React.FC<MFALoginProps> = ({ userId, onLoginComplete }) => {
  const [verificationCode, setVerificationCode] = useState<string>('');
  const [recoveryCode, setRecoveryCode] = useState<string>('');
  const [useRecoveryCode, setUseRecoveryCode] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  const handleVerify = async () => {
    const code = useRecoveryCode ? recoveryCode : verificationCode;
    
    if (!code) {
      setError('Code is required');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      await mockMFAService.verifyMFACode(userId, code, useRecoveryCode);
      onLoginComplete(true);
    } catch (err: any) {
      setError(err.message || 'Invalid verification code');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div>
      {loading && <div data-testid="loading">Loading...</div>}
      {error && <div data-testid="error">{error}</div>}
      
      <h2 data-testid="mfa-login-title">Two-Factor Authentication Required</h2>
      
      {!useRecoveryCode ? (
        <div>
          <label htmlFor="verification-code">Enter verification code:</label>
          <input
            id="verification-code"
            data-testid="verification-code-input"
            type="text"
            value={verificationCode}
            onChange={(e) => setVerificationCode(e.target.value)}
            placeholder="Enter 6-digit code"
          />
          <button data-testid="verify-button" onClick={handleVerify}>
            Verify
          </button>
          <button
            data-testid="use-recovery-button"
            onClick={() => setUseRecoveryCode(true)}
          >
            Use Recovery Code
          </button>
        </div>
      ) : (
        <div>
          <label htmlFor="recovery-code">Enter recovery code:</label>
          <input
            id="recovery-code"
            data-testid="recovery-code-input"
            type="text"
            value={recoveryCode}
            onChange={(e) => setRecoveryCode(e.target.value)}
            placeholder="Enter recovery code"
          />
          <button data-testid="verify-recovery-button" onClick={handleVerify}>
            Verify
          </button>
          <button
            data-testid="use-code-button"
            onClick={() => setUseRecoveryCode(false)}
          >
            Use Verification Code
          </button>
        </div>
      )}
    </div>
  );
};

describe('MFA Setup Component', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });
  
  it('should display initial setup screen', () => {
    // Act
    render(<MFASetup userId="user-123" onSetupComplete={() => {}} />);
    
    // Assert
    expect(screen.getByTestId('setup-title')).toHaveTextContent('Set up Two-Factor Authentication');
    expect(screen.getByTestId('setup-button')).toBeInTheDocument();
  });
  
  it('should handle MFA setup process', async () => {
    // Arrange
    const mockSetupResponse = {
      qrCodeUri: 'data:image/png;base64,mockQRCode',
      secret: 'ABCDEF123456',
      recoveryCodes: ['code1', 'code2', 'code3'],
    };
    mockMFAService.setupMFA.mockResolvedValueOnce(mockSetupResponse);
    
    const onSetupCompleteMock = vi.fn();
    
    // Act
    render(<MFASetup userId="user-123" onSetupComplete={onSetupCompleteMock} />);
    
    // Click setup button
    fireEvent.click(screen.getByTestId('setup-button'));
    
    // Assert loading state
    expect(screen.getByTestId('loading')).toBeInTheDocument();
    
    // Wait for setup to complete
    await waitFor(() => {
      expect(screen.queryByTestId('loading')).not.toBeInTheDocument();
    });
    
    // Assert verification step
    expect(screen.getByTestId('verify-title')).toHaveTextContent('Verify Your Device');
    expect(screen.getByTestId('qr-code')).toBeInTheDocument();
    expect(screen.getByTestId('secret-key')).toHaveTextContent('ABCDEF123456');
    expect(screen.getByTestId('recovery-codes')).toBeInTheDocument();
    expect(screen.getByTestId('verification-code-input')).toBeInTheDocument();
    
    // Enter verification code
    fireEvent.change(screen.getByTestId('verification-code-input'), {
      target: { value: '123456' },
    });
    
    // Mock successful verification
    mockMFAService.enableMFA.mockResolvedValueOnce({ success: true });
    
    // Click verify button
    fireEvent.click(screen.getByTestId('verify-button'));
    
    // Wait for verification to complete
    await waitFor(() => {
      expect(screen.queryByTestId('loading')).not.toBeInTheDocument();
    });
    
    // Assert completion
    expect(screen.getByTestId('setup-complete')).toBeInTheDocument();
    expect(onSetupCompleteMock).toHaveBeenCalledWith(true);
  });
  
  it('should display error when setup fails', async () => {
    // Arrange
    const mockError = new Error('Network error');
    mockMFAService.setupMFA.mockRejectedValueOnce(mockError);
    
    // Act
    render(<MFASetup userId="user-123" onSetupComplete={() => {}} />);
    
    // Click setup button
    fireEvent.click(screen.getByTestId('setup-button'));
    
    // Wait for error
    await waitFor(() => {
      expect(screen.queryByTestId('loading')).not.toBeInTheDocument();
    });
    
    // Assert error state
    expect(screen.getByTestId('error')).toHaveTextContent('Network error');
  });
  
  it('should display error when verification fails', async () => {
    // Arrange
    const mockSetupResponse = {
      qrCodeUri: 'data:image/png;base64,mockQRCode',
      secret: 'ABCDEF123456',
      recoveryCodes: ['code1', 'code2', 'code3'],
    };
    mockMFAService.setupMFA.mockResolvedValueOnce(mockSetupResponse);
    
    const mockError = new Error('Invalid verification code');
    mockMFAService.enableMFA.mockRejectedValueOnce(mockError);
    
    // Act
    render(<MFASetup userId="user-123" onSetupComplete={() => {}} />);
    
    // Click setup button
    fireEvent.click(screen.getByTestId('setup-button'));
    
    // Wait for setup to complete
    await waitFor(() => {
      expect(screen.getByTestId('verify-title')).toBeInTheDocument();
    });
    
    // Enter verification code
    fireEvent.change(screen.getByTestId('verification-code-input'), {
      target: { value: '123456' },
    });
    
    // Click verify button
    fireEvent.click(screen.getByTestId('verify-button'));
    
    // Wait for error
    await waitFor(() => {
      expect(screen.queryByTestId('loading')).not.toBeInTheDocument();
    });
    
    // Assert error state
    expect(screen.getByTestId('error')).toHaveTextContent('Invalid verification code');
  });
});

describe('MFA Login Component', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });
  
  it('should display verification code input by default', () => {
    // Act
    render(<MFALogin userId="user-123" onLoginComplete={() => {}} />);
    
    // Assert
    expect(screen.getByTestId('mfa-login-title')).toHaveTextContent('Two-Factor Authentication Required');
    expect(screen.getByTestId('verification-code-input')).toBeInTheDocument();
    expect(screen.getByTestId('verify-button')).toBeInTheDocument();
    expect(screen.getByTestId('use-recovery-button')).toBeInTheDocument();
  });
  
  it('should switch to recovery code input when button is clicked', () => {
    // Act
    render(<MFALogin userId="user-123" onLoginComplete={() => {}} />);
    
    // Click use recovery code button
    fireEvent.click(screen.getByTestId('use-recovery-button'));
    
    // Assert
    expect(screen.getByTestId('recovery-code-input')).toBeInTheDocument();
    expect(screen.getByTestId('verify-recovery-button')).toBeInTheDocument();
    expect(screen.getByTestId('use-code-button')).toBeInTheDocument();
    expect(screen.queryByTestId('verification-code-input')).not.toBeInTheDocument();
  });
  
  it('should handle successful verification with code', async () => {
    // Arrange
    mockMFAService.verifyMFACode.mockResolvedValueOnce({ success: true });
    const onLoginCompleteMock = vi.fn();
    
    // Act
    render(<MFALogin userId="user-123" onLoginComplete={onLoginCompleteMock} />);
    
    // Enter verification code
    fireEvent.change(screen.getByTestId('verification-code-input'), {
      target: { value: '123456' },
    });
    
    // Click verify button
    fireEvent.click(screen.getByTestId('verify-button'));
    
    // Wait for verification to complete
    await waitFor(() => {
      expect(screen.queryByTestId('loading')).not.toBeInTheDocument();
    });
    
    // Assert
    expect(mockMFAService.verifyMFACode).toHaveBeenCalledWith('user-123', '123456', false);
    expect(onLoginCompleteMock).toHaveBeenCalledWith(true);
  });
  
  it('should handle successful verification with recovery code', async () => {
    // Arrange
    mockMFAService.verifyMFACode.mockResolvedValueOnce({ success: true });
    const onLoginCompleteMock = vi.fn();
    
    // Act
    render(<MFALogin userId="user-123" onLoginComplete={onLoginCompleteMock} />);
    
    // Switch to recovery code
    fireEvent.click(screen.getByTestId('use-recovery-button'));
    
    // Enter recovery code
    fireEvent.change(screen.getByTestId('recovery-code-input'), {
      target: { value: 'recovery-code-123' },
    });
    
    // Click verify button
    fireEvent.click(screen.getByTestId('verify-recovery-button'));
    
    // Wait for verification to complete
    await waitFor(() => {
      expect(screen.queryByTestId('loading')).not.toBeInTheDocument();
    });
    
    // Assert
    expect(mockMFAService.verifyMFACode).toHaveBeenCalledWith('user-123', 'recovery-code-123', true);
    expect(onLoginCompleteMock).toHaveBeenCalledWith(true);
  });
  
  it('should display error when verification fails', async () => {
    // Arrange
    const mockError = new Error('Invalid verification code');
    mockMFAService.verifyMFACode.mockRejectedValueOnce(mockError);
    
    // Act
    render(<MFALogin userId="user-123" onLoginComplete={() => {}} />);
    
    // Enter verification code
    fireEvent.change(screen.getByTestId('verification-code-input'), {
      target: { value: '123456' },
    });
    
    // Click verify button
    fireEvent.click(screen.getByTestId('verify-button'));
    
    // Wait for error
    await waitFor(() => {
      expect(screen.queryByTestId('loading')).not.toBeInTheDocument();
    });
    
    // Assert error state
    expect(screen.getByTestId('error')).toHaveTextContent('Invalid verification code');
  });
  
  it('should validate input before submission', async () => {
    // Act
    render(<MFALogin userId="user-123" onLoginComplete={() => {}} />);
    
    // Click verify button without entering code
    fireEvent.click(screen.getByTestId('verify-button'));
    
    // Assert error state
    expect(screen.getByTestId('error')).toHaveTextContent('Code is required');
    expect(mockMFAService.verifyMFACode).not.toHaveBeenCalled();
  });
});
