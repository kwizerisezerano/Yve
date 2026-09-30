type ResultSuccess<T> = {
  readonly isSuccess: true;
  readonly isFailure: false;
  readonly value: T;
};

type ResultFailure<E> = {
  readonly isSuccess: false;
  readonly isFailure: true;
  readonly error: E;
};

export type Result<T, E = Error> = ResultSuccess<T> | ResultFailure<E>;

export const Result = {
  ok<T, E = Error>(value: T): Result<T, E> {
    return { isSuccess: true, isFailure: false, value };
  },
  fail<T, E = Error>(error: E): Result<T, E> {
    return { isSuccess: false, isFailure: true, error };
  },
};
