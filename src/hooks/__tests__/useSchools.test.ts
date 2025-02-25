import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { useSchools } from '../useSchools';
import { schoolsApi } from '../../services/api/schools';

vi.mock('../../services/api/schools');

describe('useSchools', () => {
  it('should fetch schools successfully', async () => {
    const mockSchools = [
      { id: '1', name: 'School 1', address: 'Address 1', phone: '1234567890' },
      { id: '2', name: 'School 2', address: 'Address 2', phone: '0987654321' }
    ];

    vi.mocked(schoolsApi.getAll).mockResolvedValueOnce(mockSchools);

    const { result } = renderHook(() => useSchools());

    await act(async () => {
      await result.current.fetchSchools();
    });

    expect(result.current.schools).toEqual(mockSchools);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('should handle fetch error', async () => {
    const error = new Error('Failed to fetch schools');
    vi.mocked(schoolsApi.getAll).mockRejectedValueOnce(error);

    const { result } = renderHook(() => useSchools());

    await act(async () => {
      await result.current.fetchSchools();
    });

    expect(result.current.schools).toEqual([]);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe('Erro ao carregar escolas');
  });

  it('should create school successfully', async () => {
    const newSchool = {
      name: 'New School',
      address: 'New Address',
      phone: '1234567890'
    };

    const createdSchool = { id: '3', ...newSchool, created_at: new Date().toISOString(), updated_at: new Date().toISOString() };
    vi.mocked(schoolsApi.create).mockResolvedValueOnce(createdSchool);

    const { result } = renderHook(() => useSchools());

    await act(async () => {
      await result.current.createSchool(newSchool);
    });

    expect(result.current.schools).toContainEqual(createdSchool);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });
});