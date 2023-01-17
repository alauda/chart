export type Percentage = `${number}%`;

export type ValueOf<T> = T extends {
  [key: string]: infer M;
}
  ? M
  : T extends {
      [key: number]: infer N;
    }
  ? N
  : never;

export type Nil = null | undefined | void;

export type Nilable<T> = Nil | T;
