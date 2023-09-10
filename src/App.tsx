import type { FC } from 'react';

import type { TResultItem } from './utils';

import { useCallback, useRef } from 'react';

import { convertMinutesToHuman, useList, useMappedValue, useValue } from './utils';

import './App.less';

const App: FC = () => {
  const [list$, push, reset] = useList();
  const historyList = useValue(list$, []);
  const total = useMappedValue(
    list$,
    '',
    useCallback((list: TResultItem[]) => convertMinutesToHuman(list.reduce((acc, x) => acc + x.minutes, 0)), []),
  );

  const beginRef = useRef({} as HTMLInputElement);
  const endRef = useRef({} as HTMLInputElement);

  const handleReset = useCallback(() => {
    beginRef.current.value = '';
    endRef.current.value = '';

    beginRef.current.focus();
  }, []);

  const handleClear = useCallback(() => {
    reset();

    handleReset();
  }, [handleReset, reset]);

  const handleCalc = useCallback(() => {
    push(beginRef.current.value.trim(), endRef.current.value.trim());

    handleReset();
  }, [handleReset, push]);

  return (
    <div className="container">
      <div className="form-row">
        <div className="label">begin</div>
        <input ref={beginRef} type="text" />
      </div>
      <div className="form-row">
        <div className="label">end</div>
        <input ref={endRef} type="text" />
      </div>
      <div className="actions">
        <button onClick={handleCalc}>Calc</button>
        <button onClick={handleClear}>Clear</button>
      </div>
      <div className="total">Total: {total}</div>
      <h2>Detail List</h2>
      <ul className="history-list">
        {historyList.map((v) => (
          <li key={v.id}>{`${v.begin} - ${v.end} => ${v.total}`}</li>
        ))}
      </ul>
    </div>
  );
};

export default App;
