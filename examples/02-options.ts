import { peco } from '../src';

const data = ['option1', 'option2', 'option3'];

/**
 * Simple usecase
 */
(async (): Promise<void> => {
  const selected = await peco(data, {
    layout: 'bottom-up',
    prompt: 'find',
    query: 'option1',
    selectionPrefix: '*',
  });
  console.log(selected);
})();
