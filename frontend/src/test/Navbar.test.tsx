import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { HeroUIProvider } from '@heroui/react';
import { Navbar } from '../components/Navbar';
import { AuthUser } from '../types/erp';

const mockUser: AuthUser = {
  id: 'u-admin',
  username: 'admin',
  fullName: 'Chief Executive Administrator',
  email: 'admin@fooderp.com',
  role: 'SUPERADMIN',
  status: 'ACTIVE',
  createdAt: '2026-10-24T00:00:00Z',
};

describe('Navbar Component with User Dropdown', () => {
  it('renders user details in top right trigger', () => {
    render(
      <HeroUIProvider>
        <Navbar
          title="Operational Dashboard"
          subtitle="Real-time overview"
          isDark={false}
          toggleTheme={vi.fn()}
          currentUser={mockUser}
        />
      </HeroUIProvider>
    );

    expect(screen.getByText('Chief Executive Administrator')).toBeInTheDocument();
    expect(screen.getByText('admin@fooderp.com')).toBeInTheDocument();
  });

  it('opens user dropdown and allows clicking profile and logout', async () => {
    const handleLogout = vi.fn();
    const handleNavigate = vi.fn();

    render(
      <HeroUIProvider>
        <Navbar
          title="Operational Dashboard"
          subtitle="Real-time overview"
          isDark={false}
          toggleTheme={vi.fn()}
          currentUser={mockUser}
          onLogout={handleLogout}
          onNavigate={handleNavigate}
        />
      </HeroUIProvider>
    );

    const triggerBtn = screen.getByLabelText('User profile menu');
    fireEvent.click(triggerBtn);

    await waitFor(() => {
      expect(screen.getByText('Profil Pengguna')).toBeInTheDocument();
      expect(screen.getByText('Pengaturan Sistem')).toBeInTheDocument();
      expect(screen.getByText('User & Mitra Management')).toBeInTheDocument();
      expect(screen.getByText('Keluar (Sign Out)')).toBeInTheDocument();
    });

    const logoutItem = screen.getByText('Keluar (Sign Out)');
    fireEvent.click(logoutItem);

    expect(handleLogout).toHaveBeenCalledTimes(1);
  });
});
