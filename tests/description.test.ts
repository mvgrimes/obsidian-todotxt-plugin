import { jest, describe, beforeAll, it, expect } from '@jest/globals';
import parser from '../src/lib/parser';

function p(description: string) {
  return parser.parse(description).description;
}

describe('todo description', () => {
  beforeAll(() => {
    jest.useFakeTimers().setSystemTime(new Date('2023-09-01'));
  });

  it('simple description', () => {
    expect(p('Test parser')).toEqual(['Test', 'parser']);
  });

  it('description with tag', () => {
    expect(p('Test rec:+1w tag')).toEqual([
      'Test',
      { tag: 'rec', value: '+1w' },
      'tag',
    ]);
    expect(p('Test rec:+1:@-w tag')).toEqual([
      'Test',
      { tag: 'rec', value: '+1:@-w' },
      'tag',
    ]);
  });

  it('description with context', () => {
    expect(p('Test @home context')).toEqual([
      'Test',
      { context: 'home' },
      'context',
    ]);
    expect(p('Test @@+-home@ context')).toEqual([
      'Test',
      { context: '@+-home@' },
      'context',
    ]);
  });

  it('description with project', () => {
    expect(p('Test +list project')).toEqual([
      'Test',
      { project: 'list' },
      'project',
    ]);
    expect(p('Test +@+-list@ project')).toEqual([
      'Test',
      { project: '@+-list@' },
      'project',
    ]);
  });

  it('description with internal link', () => {
    expect(p('Test [[Other Page/Link]] link')).toEqual([
      'Test',
      { link: 'Other Page/Link' },
      'link',
    ]);

    expect(p('Test [[Other Page/Link]]')).toEqual([
      'Test',
      { link: 'Other Page/Link' },
    ]);

    expect(p('Test [[Other Page/Link]].')).toEqual([
      'Test',
      '[[Other',
      'Page/Link]].',
    ]);

    expect(p('Test [[Other Page/Link] broken')).toEqual([
      'Test',
      '[[Other',
      'Page/Link]',
      'broken',
    ]);
  });

  it('description with extneral link', () => {
    expect(p('Test [External Link](https://elsewere.url) link')).toEqual([
      'Test',
      { title: 'External Link', url: 'https://elsewere.url' },
      'link',
    ]);

    expect(p('Test [External Link](https://elsewere.url)')).toEqual([
      'Test',
      { title: 'External Link', url: 'https://elsewere.url' },
    ]);

    expect(p('Test [External Link](https://elsewere.url). link')).toEqual([
      'Test',
      '[External',
      'Link](https://elsewere.url).',
      'link',
    ]);

    expect(p('Test [External Link](https://elsewere.url).')).toEqual([
      'Test',
      '[External',
      'Link](https://elsewere.url).',
    ]);
  });
});
