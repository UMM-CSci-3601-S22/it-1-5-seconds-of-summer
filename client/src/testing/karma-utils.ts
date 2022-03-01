/* eslint-disable prefer-arrow/prefer-arrow-functions */
import { waitForAsync } from '@angular/core/testing';

/**
 * Wraps a test case. The test case completes once all asynchronous calls have
 * finished.
 *
 * This is a a wrapper around Angular's `waitForAsync` function. It exists as a
 * workaround for the following bug:
 *
 * - https://github.com/UMM-CSci-3601/3601-iteration-template/pull/610#issuecomment-1013784234
 *
 * See also the documentation for `waitForAsync`:
 *
 * - https://angular.io/api/core/testing/waitForAsync
 */
export function safeWaitForAsync(testCase: () => void): (done: DoneFn) => void {
  return done => waitForAsync(testCase)(makeSafe(done));
}

/**
 * Create a wrapper for one of jasmine's `done` functions that can only be
 * called once.
 *
 * Jasmine sometimes uses a `done()` function to indicate when a test is
 * finished. After you've made all the assertions you want to make, you call
 * `done()` to indicate that Jasmine should move on to the next test. (This is
 * especially relevant when you're testing asynchronous behavior.)
 *
 * Recent versions of Jasmine will complain if you call `done()` more than once.
 * This doesn't play nicely with Angular's `waitForAsync()` function, which may
 * call `done()` several times internally.
 *
 * To work around this bug, this function here creates a wrapper around the `done()`
 * function. The first time you call the wrapper, it calls the real `done()` function.
 * Any subsequent calls to the wrapper are ignored.
 *
 * Visible for testing.
 */
export function makeSafe(done: DoneFn): DoneFn {
  let calledDoneAlready = false;

  function safeDone(): void {
    if (!calledDoneAlready) {
      calledDoneAlready = true;
      done();
    }
  }

  safeDone.fail = () => {
    if (!calledDoneAlready) {
      calledDoneAlready = true;
      done.fail();
    }
  };

  return safeDone;
}
