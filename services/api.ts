
import { API_ENDPOINT } from '../constants.ts';
import { ApiResponse } from '../types.ts';

export const mosqueApi = {
  async getAll(): Promise<ApiResponse> {
    try {
      const response = await fetch(`${API_ENDPOINT}?t=${Date.now()}`);
      if (!response.ok) throw new Error('Failed to fetch data');
      return await response.json();
    } catch (error) {
      console.error('Error fetching records:', error);
      throw error;
    }
  },

  async save(data: any): Promise<{ success: boolean, record_id?: string }> {
    try {
      const response = await fetch(API_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8',
        },
        body: JSON.stringify(data),
      });
      
      try {
        const result = await response.json();
        return result;
      } catch (e) {
        return { success: true };
      }
    } catch (error) {
      console.error('Error saving record:', error);
      throw error;
    }
  }
};
