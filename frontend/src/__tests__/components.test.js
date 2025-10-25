import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';

describe('Component Tests', () => {
  test('placeholder test', () => {
    expect(true).toBe(true);
  });
  
  test('math operations', () => {
    expect(2 + 2).toBe(4);
  });
  
  test('string operations', () => {
    expect('hello').toMatch(/hello/);
  });
});
