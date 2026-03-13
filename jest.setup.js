// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  clear: jest.fn()
};
global.localStorage = localStorageMock;

// Mock Audio
global.Audio = jest.fn().mockImplementation(() => ({
  play: jest.fn(),
  src: ''
}));

// Mock DOM elements
document.body.innerHTML = `
  <main></main>
  <h1></h1>
  <div class="btn-container"></div>
`; 