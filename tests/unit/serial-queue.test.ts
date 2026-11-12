import { describe, expect, it } from 'vitest';
import { createSerialQueue } from '@/lib/serial-queue';

const sleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

describe('createSerialQueue', () => {
  it('executa as tarefas na ordem, mesmo quando a primeira demora mais', async () => {
    const order: string[] = [];
    const enqueue = createSerialQueue();

    const first = enqueue(async () => {
      await sleep(20);
      order.push('a');
    });
    const second = enqueue(async () => {
      order.push('b');
    });

    await Promise.all([first, second]);
    expect(order).toEqual(['a', 'b']);
  });

  it('uma tarefa que falha é reportada e não impede as seguintes', async () => {
    const errors: unknown[] = [];
    const ran: string[] = [];
    const enqueue = createSerialQueue((error) => errors.push(error));

    await enqueue(async () => {
      throw new Error('falhou');
    });
    await enqueue(async () => {
      ran.push('depois');
    });

    expect(errors).toHaveLength(1);
    expect(ran).toEqual(['depois']);
  });
});
