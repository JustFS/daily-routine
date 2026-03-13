describe('Exercice', () => {
  let exercice;

  beforeEach(() => {
    exercice = new Exercice();
  });

  test('devrait initialiser avec les bonnes valeurs', () => {
    expect(exercice.index).toBe(0);
    expect(exercice.minutes).toBe(2); // Première valeur de basicArray
    expect(exercice.seconds).toBe(0);
  });

  test('devrait mettre à jour le compte à rebours', () => {
    jest.useFakeTimers();
    exercice.updateCountdown();
    
    expect(document.querySelector('main').innerHTML).toContain('2:00');
    
    jest.advanceTimersByTime(1000);
    expect(document.querySelector('main').innerHTML).toContain('1:59');
    
    jest.useRealTimers();
  });
});

describe('Utils', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  test('devrait stocker les exercices dans le localStorage', () => {
    utils.store();
    expect(localStorage.setItem).toHaveBeenCalledWith('exercices', JSON.stringify(exerciceArray));
  });

  test('devrait réinitialiser les exercices', () => {
    utils.reboot();
    expect(exerciceArray).toEqual(basicArray);
  });
});

describe('Page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('devrait afficher la page lobby', () => {
    page.lobby();
    expect(document.querySelector('h1').innerHTML).toContain('Paramétrage');
    expect(document.querySelector('main').innerHTML).toContain('<ul>');
  });

  test('devrait démarrer la routine', () => {
    page.routine();
    expect(document.querySelector('h1').innerHTML).toBe('Routine');
  });
}); 