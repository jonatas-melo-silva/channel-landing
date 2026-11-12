/**
 * Fila que executa uma tarefa por vez, na ordem em que chegam. O background recebe vários
 * eventos quase juntos e várias tarefas leem e depois gravam o mesmo storage, então rodar
 * em paralelo poderia perder uma atualização. Uma tarefa que falha é reportada em `onError`
 * e não impede as seguintes.
 */
export function createSerialQueue(
  onError: (error: unknown) => void = (error) => console.error(error),
) {
  let tail: Promise<void> = Promise.resolve();

  return (task: () => Promise<void>): Promise<void> => {
    const next = tail.then(task).catch(onError);
    tail = next;
    return next;
  };
}
