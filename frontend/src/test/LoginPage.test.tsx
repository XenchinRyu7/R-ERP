import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { HeroUIProvider } from '@heroui/react';
import { LoginPage } from '../pages/LoginPage';
import { erpApi } from '../api/erpApi';

vi.mock('../api/erpApi', () => ({
  erpApi: {
    login: vi.fn(),
    registerMitra: vi.fn(),
  },
}));

describe('LoginPage Component', () => {
  it('renders login tab and credentials form by default', () => {
    const handleLoginSuccess = vi.fn();
    render(
      <HeroUIProvider>
        <LoginPage onLoginSuccess={handleLoginSuccess} />
      </HeroUIProvider>
    );

    expect(screen.getByText('Food ERP Portal')).toBeInTheDocument();
    expect(screen.getByText('Masuk (Login)')).toBeInTheDocument();
    expect(screen.getByText('Daftar Mitra / Outlet')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Masuk ke Dashboard/i })).toBeInTheDocument();
  });

  it('triggers login API and calls onLoginSuccess on valid response', async () => {
    const handleLoginSuccess = vi.fn();
    const mockResponse = {
      token: 'mock-jwt-token',
      tokenType: 'Bearer',
      expiresIn: 86400000,
      user: {
        id: 'u-1',
        username: 'admin',
        fullName: 'Super Administrator',
        email: 'admin@fooderp.com',
        role: 'SUPERADMIN' as const,
        status: 'ACTIVE' as const,
        createdAt: '2026-10-24T00:00:00Z',
      },
    };

    (erpApi.login as any).mockResolvedValueOnce(mockResponse);

    render(
      <HeroUIProvider>
        <LoginPage onLoginSuccess={handleLoginSuccess} />
      </HeroUIProvider>
    );

    const submitBtn = screen.getByRole('button', { name: /Masuk ke Dashboard/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(erpApi.login).toHaveBeenCalledWith({
        usernameOrEmail: 'admin',
        password: 'admin123',
      });
      expect(handleLoginSuccess).toHaveBeenCalledWith(mockResponse.user, 'mock-jwt-token');
    });
  });

  it('switches to Mitra registration tab', () => {
    const handleLoginSuccess = vi.fn();
    render(
      <HeroUIProvider>
        <LoginPage onLoginSuccess={handleLoginSuccess} />
      </HeroUIProvider>
    );

    const registerTab = screen.getByText('Daftar Mitra / Outlet');
    fireEvent.click(registerTab);

    expect(screen.getByText(/Pendaftaran kemitraan baru/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Ajukan Pendaftaran Kemitraan/i })).toBeInTheDocument();
  });
});
