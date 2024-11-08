import type { FC } from 'react';

import type { TResultItem } from './utils';

import { Fragment, useCallback, useRef } from 'react';

import { convertMinutesToHuman, useList, useMappedValue, useValue, useAutoFcous } from './utils';

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

  useAutoFcous(beginRef, endRef);

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
      <div className="history-list">
        <div>No.</div>
        <div>Begin</div>
        <div />
        <div>End</div>
        <div />
        <div>Duration</div>
        {historyList.map((v, i) => (
          <Fragment key={v.id}>
            <div>{i}.</div>
            <div>{v.begin}</div>
            <div>-</div>
            <div>{v.end}</div>
            <div>{'=>'}</div>
            <div>{v.total}</div>
          </Fragment>
        ))}
      </div>
    </div>
  );
};

export default App;
